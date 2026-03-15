import { Board, PieceColor, CastlingRights, Position, FILES, RANKS, PieceType } from './chess';

export function boardToFen(
    board: Board,
    currentTurn: PieceColor,
    castlingRights: CastlingRights,
    enPassantTarget: Position | null,
    halfMoveClock = 0,
    fullMoveNumber = 1
): string {
    let fen = '';
    for (let r = 0; r < 8; r++) {
        let emptyCount = 0;
        let rowStr = '';
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                if (emptyCount > 0) {
                    rowStr += emptyCount;
                    emptyCount = 0;
                }
                let symbol = piece.type === 'knight' ? 'n' : piece.type.charAt(0);
                rowStr += piece.color === 'white' ? symbol.toUpperCase() : symbol.toLowerCase();
            } else {
                emptyCount++;
            }
        }
        if (emptyCount > 0) rowStr += emptyCount;
        fen += rowStr;
        if (r < 7) fen += '/';
    }

    fen += ' ' + (currentTurn === 'white' ? 'w' : 'b') + ' ';

    let castling = '';
    if (castlingRights.white.kingSide) castling += 'K';
    if (castlingRights.white.queenSide) castling += 'Q';
    if (castlingRights.black.kingSide) castling += 'k';
    if (castlingRights.black.queenSide) castling += 'q';
    fen += (castling || '-') + ' ';

    if (enPassantTarget) {
        fen += FILES[enPassantTarget[1]] + RANKS[enPassantTarget[0]];
    } else {
        fen += '-';
    }

    fen += ` ${halfMoveClock} ${fullMoveNumber}`;
    return fen;
}

export function fenToBoard(fen: string): { board: Board; currentTurn: PieceColor; castlingRights: CastlingRights; enPassantTarget: Position | null; halfMoveClock: number; fullMoveNumber: number } {
    const parts = fen.split(' ');
    const boardFen = parts[0];
    const turnStr = parts[1];
    const castlingStr = parts[2];
    const epStr = parts[3];
    const halfMoveClock = parseInt(parts[4] || '0', 10);
    const fullMoveNumber = parseInt(parts[5] || '1', 10);

    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    const rows = boardFen.split('/');

    for (let r = 0; r < 8; r++) {
        let c = 0;
        for (let i = 0; i < rows[r].length; i++) {
            const char = rows[r].charAt(i);
            const parsed = parseInt(char, 10);
            if (!isNaN(parsed)) {
                c += parsed;
            } else {
                const isWhite = char === char.toUpperCase();
                const typeMap: Record<string, PieceType> = {
                    'p': 'pawn',
                    'n': 'knight',
                    'b': 'bishop',
                    'r': 'rook',
                    'q': 'queen',
                    'k': 'king'
                };
                const type = typeMap[char.toLowerCase()];
                const id = `${isWhite ? 'white' : 'black'}-${type}-${r}-${c}`;
                board[r][c] = { id, type, color: isWhite ? 'white' : 'black' };
                c++;
            }
        }
    }

    const currentTurn: PieceColor = turnStr === 'w' ? 'white' : 'black';

    const castlingRights = {
        white: { kingSide: castlingStr.includes('K'), queenSide: castlingStr.includes('Q') },
        black: { kingSide: castlingStr.includes('k'), queenSide: castlingStr.includes('q') }
    };

    let enPassantTarget: Position | null = null;
    if (epStr && epStr !== '-') {
        const col = FILES.indexOf(epStr.charAt(0));
        const row = RANKS.indexOf(epStr.charAt(1));
        enPassantTarget = [row, col];
    }

    return { board, currentTurn, castlingRights, enPassantTarget, halfMoveClock, fullMoveNumber };
}

export function parseMoveAlgebraic(move: string): { from: Position; to: Position } {
    // move is like 'e2e4' or 'e7e8q'
    const c1 = move.charAt(0);
    const r1 = move.charAt(1);
    const c2 = move.charAt(2);
    const r2 = move.charAt(3);

    const fromCol = FILES.indexOf(c1);
    const fromRow = RANKS.indexOf(r1);
    const toCol = FILES.indexOf(c2);
    const toRow = RANKS.indexOf(r2);

    return { from: [fromRow, fromCol], to: [toRow, toCol] };
}

export async function getBestMoveStockfish(fen: string, level: number): Promise<{ from: Position; to: Position } | null> {
    // Map level (1-10) to search depth (1-15)
    // Depth must be > 5 for this API
    const depth = Math.max(6, Math.min(15, 5 + level));

    try {
        const res = await fetch(`https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`);
        const data = await res.json();
        if (data.success && data.bestmove) {
            // "bestmove e2e4 ponder d7d5"
            const moveStr = data.bestmove.split(' ')[1];
            if (moveStr) {
                return parseMoveAlgebraic(moveStr);
            }
        }
        return null;
    } catch (error) {
        console.error('Stockfish API error:', error);
        return null;
    }
}

export interface PositionAnalysis {
    evaluation: number; // Positive means white is better, negative means black is better
    mate: number | null; // Null if no mate, positive for white mate in X, negative for black mate in X
    bestMove: { from: Position; to: Position } | null;
}

export async function analyzePositionStockfish(fen: string, depth = 12): Promise<PositionAnalysis | null> {
    try {
        const res = await fetch(`https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`);
        const data = await res.json();
        if (data.success) {
            let bestMove = null;
            if (data.bestmove) {
                const moveStr = data.bestmove.split(' ')[1];
                if (moveStr && moveStr.length >= 4) {
                    bestMove = parseMoveAlgebraic(moveStr);
                }
            }
            return {
                evaluation: data.evaluation ?? 0,
                mate: data.mate ?? null,
                bestMove,
            };
        }
        return null;
    } catch (error) {
        console.error('Stockfish API error:', error);
        return null;
    }
}

export function calculateWinProbability(evalValue: number, isWhite: boolean): number {
    const perspectiveEval = isWhite ? evalValue : -evalValue;
    return 100 / (1 + Math.pow(10, -perspectiveEval / 4));
}

export type MoveClassification = 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book' | 'forced';

export function classifyMove(
    prevEval: number | null,
    prevMate: number | null,
    currEval: number | null,
    currMate: number | null,
    isWhite: boolean
): MoveClassification {
    if (prevEval === null || currEval === null) return 'good';

    const prevWP = calculateWinProbability(prevEval, isWhite);
    const currWP = calculateWinProbability(currEval, isWhite);
    const wpLoss = prevWP - currWP;

    // Approximating mate cases
    if (currMate !== null) {
        if ((isWhite && currMate > 0) || (!isWhite && currMate < 0)) {
            if (prevMate === null) return 'great';
            return 'best';
        } else {
            if (prevMate === null) return 'blunder';
        }
    }

    if (wpLoss < 2) return 'best';
    if (wpLoss < 5) return 'excellent';
    if (wpLoss < 10) return 'good';
    if (wpLoss < 20) return 'inaccuracy';
    if (wpLoss < 35) return 'mistake';
    return 'blunder';
}

export function generateCoachComment(classification: MoveClassification, isWhite: boolean): string {
    const side = isWhite ? "White" : "Orange";
    switch (classification) {
        case 'brilliant': return "A brilliant move that sacrifices material for a long-term decisive advantage! !!";
        case 'great': return "A great move that finds the only winning path! !";
        case 'best': return "The best move in the position. Excellent play.";
        case 'excellent': return "A very strong move that keeps the pressure on.";
        case 'good': return "A solid, reasonable move, though there might have been a slightly better continuation.";
        case 'inaccuracy': return "An inaccuracy (?!). You lost a slight bit of your advantage.";
        case 'mistake': return "A mistake (?). You allowed your opponent a chance to get back into the game.";
        case 'blunder': return "A blunder (??). This move dramatically reduces your chances of winning.";
        case 'book': return "A standard book move for the opening.";
        case 'forced': return "A forced move, giving you no other options.";
        default: return "A solid move.";
    }
}

export function estimateEloFromAccuracy(accuracy: number): number {
    if (accuracy < 50) return Math.max(100, Math.round(accuracy * 16));
    if (accuracy < 70) return Math.round(800 + (accuracy - 50) * 20);
    if (accuracy < 90) return Math.round(1200 + (accuracy - 70) * 60);
    return Math.round(2400 + (accuracy - 90) * 80);
}
