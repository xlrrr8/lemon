import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Flame, Crown, Trophy, Loader2, X } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import ChessSquare from '@/components/ChessSquare';
import { Chess } from 'chess.js';
import {
    Board,
    Position,
    PieceColor,
    Piece,
    CastlingRights,
    GameStatus,
    getValidMoves,
    isValidMove,
    movePiece,
    getGameStatus,
    findKing,
    FILES,
    RANKS,
    getPieceSymbol,
    isRawValidMove,
    isKingInCheck,
    applyRawMove,
} from '@/lib/chess';
import { fenToBoard, parseMoveAlgebraic, boardToFen } from '@/lib/engine';
import { playChessSound, ChessSoundType } from '@/lib/sounds';


// ─── Types ───────────────────────────────────────────────────────────────────

interface LichessPuzzle {
    puzzle: {
        id: string;
        rating: number;
        themes: string[];
        solution: string[]; // UCI moves like ['e2e4', 'd7d5']
        initialPly: number;
    };
    game: {
        id: string;
        pgn: string;
        clock: string;
    };
}

interface PuzzleState {
    fen: string;
    board: Board;
    currentTurn: PieceColor;
    castlingRights: CastlingRights;
    enPassantTarget: Position | null;
    solution: string[]; // Full solution array
    solutionIndex: number; // Which move in solution we expect next
    playerColor: PieceColor;
    puzzleId: string;
    rating: number;
    themes: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTodaySeed(): number {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function formatTheme(theme: string): string {
    return theme
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}

// Fetch a daily puzzle from Lichess
async function fetchDailyPuzzle(): Promise<LichessPuzzle | null> {
    try {
        const res = await fetch('https://lichess.org/api/puzzle/daily', {
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Lichess API failed');
        const data = await res.json();
        return data as LichessPuzzle;
    } catch (e) {
        console.error('Failed to fetch puzzle:', e);
        return null;
    }
}

// ─── Component ───────────────────────────────────────────────────────────────

const DailyPuzzle = () => {
    const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null);
    const [board, setBoard] = useState<Board | null>(null);
    const [currentTurn, setCurrentTurn] = useState<PieceColor>('white');
    const [castlingRights, setCastlingRights] = useState<CastlingRights>({
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true },
    });
    const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null);
    const [selected, setSelected] = useState<Position | null>(null);
    const [validMoves, setValidMoves] = useState<Position[]>([]);
    const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
    const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
    const [solutionIndex, setSolutionIndex] = useState(0);

    const [status, setStatus] = useState<'loading' | 'ready' | 'playing' | 'correct' | 'wrong' | 'solved' | 'error'>('loading');
    const [wrongMove, setWrongMove] = useState<{ from: Position; to: Position } | null>(null);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [hintSquare, setHintSquare] = useState<Position | null>(null);
    const [showThemes, setShowThemes] = useState(false);
    const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('puzzle_streak') || '0', 10));
    const [bestStreak, setBestStreak] = useState(() => parseInt(localStorage.getItem('puzzle_best_streak') || '0', 10));
    const [solvedToday, setSolvedToday] = useState(() => localStorage.getItem('puzzle_solved_date') === String(getTodaySeed()));

    const [opponentMoving, setOpponentMoving] = useState(false);
    const [showSolvedOverlay, setShowSolvedOverlay] = useState(true);

    const puzzleRef = useRef<LichessPuzzle | null>(null);
    const draggedPieceIdRef = useRef<string | null>(null);

    useEffect(() => {
        draggedPieceIdRef.current = null;
    });

    // ── Load puzzle ──────────────────────────────────────────────────────────

    const loadPuzzle = useCallback(async () => {
        setStatus('loading');
        setSelected(null);
        setValidMoves([]);
        setLastMove(null);
        setWrongMove(null);
        setHintSquare(null);
        setHintsUsed(0);
        setShowThemes(false);
        setSolutionIndex(0);
        setShowSolvedOverlay(true);

        const data = await fetchDailyPuzzle();
        if (!data) {
            setStatus('error');
            return;
        }

        puzzleRef.current = data;

        const parsed = parsePuzzleFromLichess(data);
        if (!parsed) {
            setStatus('error');
            return;
        }

        const { board: initialBoard, currentTurn: ct, castlingRights: cr, enPassantTarget: ep } = parsed.boardState;

        setBoard(initialBoard);
        setCurrentTurn(ct);
        setCastlingRights(cr);
        setEnPassantTarget(ep);
        setPuzzleState(parsed.puzzleState);
        setSolutionIndex(0);
        setGameStatus('playing');
        setStatus('playing');
    }, []);

    useEffect(() => {
        loadPuzzle();
    }, [loadPuzzle]);

    // ── Parse puzzle from Lichess data ───────────────────────────────────────
    // Lichess puzzle format:
    //   - PGN contains the full game including the opponent's setup move
    //   - initialPly is the ply BEFORE the setup move  
    //   - To get the puzzle position, replay the ENTIRE PGN
    //   - solution[0] is the PLAYER's first correct move
    //   - solution[1] is the opponent's response, etc.

    function parsePuzzleFromLichess(data: LichessPuzzle): {
        boardState: ReturnType<typeof fenToBoard>;
        puzzleState: PuzzleState;
    } | null {
        try {
            const chess = new Chess();

            try {
                chess.loadPgn(data.game.pgn);
            } catch (e) {
                console.error("Failed to load PGN into chess.js:", data.game.pgn, e);
                return null;
            }

            // The PGN already includes the opponent's setup move.
            // The final position after the PGN is where the puzzle begins.
            // solution[0] is the player's first correct move from this position.
            const currentFen = chess.fen();
            const state = fenToBoard(currentFen);

            // The player color is the side to move in the final PGN position
            const playerColor = state.currentTurn;

            return {
                boardState: state,
                puzzleState: {
                    fen: currentFen,
                    board: state.board,
                    currentTurn: state.currentTurn,
                    castlingRights: state.castlingRights,
                    enPassantTarget: state.enPassantTarget,
                    solution: data.puzzle.solution,
                    solutionIndex: 0,
                    playerColor,
                    puzzleId: data.puzzle.id,
                    rating: data.puzzle.rating,
                    themes: data.puzzle.themes,
                },
            };
        } catch (e) {
            console.error('Failed to parse puzzle:', e);
            return null;
        }
    }

    // ── Play opponent move (automated) ───────────────────────────────────────
    // Takes FEN directly to avoid stale closure issues

    function playOpponentMove(
        fen: string,
        solution: string[],
        idx: number,
    ) {
        if (idx >= solution.length) return;

        const uciMove = solution[idx];
        const { from, to } = parseMoveAlgebraic(uciMove);

        setOpponentMoving(true);

        setTimeout(() => {
            try {
                const chess = new Chess(fen);

                const fromSquare = FILES[from[1]] + RANKS[from[0]];
                const toSquare = FILES[to[1]] + RANKS[to[0]];
                const promotion = uciMove.length === 5 ? uciMove[4] : undefined;

                const result = chess.move({
                    from: fromSquare as any,
                    to: toSquare as any,
                    promotion: promotion
                });

                if (!result) { setOpponentMoving(false); return; }



                const newFen = chess.fen();
                const newState = fenToBoard(newFen);

                setBoard(newState.board);
                setCurrentTurn(newState.currentTurn);
                setCastlingRights(newState.castlingRights);
                setEnPassantTarget(newState.enPassantTarget);
                setLastMove({ from, to });

                // Keep the puzzle FEN in sync
                setPuzzleState(prev => prev ? { ...prev, fen: newFen } : null);

                const gs = getGameStatus(newState.board, newState.currentTurn, newState.castlingRights, newState.enPassantTarget);
                setGameStatus(gs);

                // Play sound for opponent puzzle move (Immediate)
                let soundType: ChessSoundType = 'move';
                if (gs === 'checkmate') soundType = 'checkmate';
                else if (gs === 'check') soundType = 'check';
                else if (result.captured) soundType = 'capture';
                else if (result.flags && (result.flags.includes('k') || result.flags.includes('q'))) soundType = 'castle';
                playChessSound(soundType);

                setSolutionIndex(idx + 1);
                setOpponentMoving(false);
                setStatus('playing');
            } catch (err) {
                console.error("Opponent move error:", err);
                setOpponentMoving(false);
            }
        }, 300); // Reduced from 600ms
    }

    // ── Handle square click (player move) ────────────────────────────────────

    const handleSquareClick = useCallback(
        (row: number, col: number) => {
            if (!board || !puzzleState) return;
            if (status === 'solved' || status === 'wrong' || status === 'loading' || opponentMoving) return;
            if (currentTurn !== puzzleState.playerColor) return; // not player's turn


            const clickedPiece = board[row][col];

            if (selected) {
                const [sRow, sCol] = selected;
                if (sRow === row && sCol === col) {
                    setSelected(null);
                    setValidMoves([]);
                    return;
                }

                if (clickedPiece && clickedPiece.color === currentTurn) {
                    setSelected([row, col]);
                    setValidMoves(getValidMoves(board, [row, col], currentTurn, castlingRights, enPassantTarget));
                    return;
                }

                if (isValidMove(board, selected, [row, col], currentTurn, castlingRights, enPassantTarget)) {
                    // Check if this matches the expected solution move
                    const expectedUci = puzzleState.solution[solutionIndex];
                    const { from: expFrom, to: expTo } = parseMoveAlgebraic(expectedUci);
                    const isCorrect =
                        sRow === expFrom[0] && sCol === expFrom[1] &&
                        row === expTo[0] && col === expTo[1];

                    // Safely play it via chess.js
                    try {
                        const chess = new Chess(puzzleState.fen);
                        const fromSquare = FILES[selected[1]] + RANKS[selected[0]];
                        const toSquare = FILES[col] + RANKS[row];

                        // Default to queen promotion for simplicity if it evaluates as a valid move and hits end
                        const promotion = (board[selected[0]][selected[1]]?.type === 'pawn' && (row === 0 || row === 7)) ? 'q' : undefined;

                        const result = chess.move({
                            from: fromSquare as any,
                            to: toSquare as any,
                            promotion: promotion
                        });

                        // Fallback
                        if (!result) throw new Error("Move rejected by chess.js");



                        const newFen = chess.fen();
                        const newState = fenToBoard(newFen);
                        const newLastMove = { from: selected as Position, to: [row, col] as Position };

                        setBoard(newState.board);
                        setCurrentTurn(newState.currentTurn);
                        setCastlingRights(newState.castlingRights);
                        setEnPassantTarget(newState.enPassantTarget);
                        setLastMove(newLastMove);
                        setSelected(null);
                        setValidMoves([]);
                        setHintSquare(null);

                        // Save old states just for revering on wrong move. FEN handles it for us now cleanly.
                        const prevFen = puzzleState.fen;

                        // Keep puzzle fen synced immediately
                        setPuzzleState(prev => prev ? { ...prev, fen: newFen } : null);

                        if (!isCorrect) {
                            setWrongMove(newLastMove);
                            setStatus('wrong');
                            playChessSound('error');
                            // Revert after a moment
                            setTimeout(() => {
                                const oldState = fenToBoard(prevFen);
                                setBoard(oldState.board);
                                setCurrentTurn(oldState.currentTurn);
                                setCastlingRights(oldState.castlingRights);
                                setEnPassantTarget(oldState.enPassantTarget);
                                setLastMove(lastMove);
                                setWrongMove(null);
                                setStatus('playing');
                                setPuzzleState(prev => prev ? { ...prev, fen: prevFen } : null);
                            }, 1200);
                            return;
                        }

                        const nextIdx = solutionIndex + 1;
                        const gs = getGameStatus(newState.board, newState.currentTurn, newState.castlingRights, newState.enPassantTarget);
                        setGameStatus(gs);

                        // Play sound for player puzzle move (Immediate)
                        let soundType: ChessSoundType = 'move';
                        if (gs === 'checkmate') soundType = 'checkmate';
                        else if (gs === 'check') soundType = 'check';
                        else if (result.captured) soundType = 'capture';
                        else if (result.flags && (result.flags.includes('k') || result.flags.includes('q'))) soundType = 'castle';
                        playChessSound(soundType);

                        if (chess.isCheckmate()) {
                            handlePuzzleSolved();
                            return;
                        }

                        if (nextIdx >= puzzleState.solution.length) {
                            handlePuzzleSolved();
                        } else {
                            setSolutionIndex(nextIdx);
                            setStatus('correct');
                            // Play opponent's response
                            setTimeout(() => {
                                playOpponentMove(newFen, puzzleState.solution, nextIdx);
                            }, 1000); // Increased from 200ms so 'correct' banner shows longer
                        }
                    } catch (e) {
                        console.error("Invalid move caught block:", e);
                    }
                    return;
                }

                // Invalid move attempt
                const rawValid = isRawValidMove(board, selected, [row, col], currentTurn, enPassantTarget);
                if (rawValid) {
                    const newBoard = applyRawMove(board, selected, [row, col], enPassantTarget);
                    if (isKingInCheck(newBoard, currentTurn)) {
                        playChessSound('error');
                    }
                } else if (getGameStatus(board, currentTurn, castlingRights, enPassantTarget) === 'check') {
                    playChessSound('error');
                }
                setSelected(null);
                setValidMoves([]);
            } else {
                if (clickedPiece && clickedPiece.color === currentTurn && currentTurn === puzzleState.playerColor) {
                    setSelected([row, col]);
                    setValidMoves(getValidMoves(board, [row, col], currentTurn, castlingRights, enPassantTarget));
                }
            }
        },
        [board, puzzleState, selected, currentTurn, castlingRights, enPassantTarget, status, solutionIndex, opponentMoving, lastMove]
    );

    // ── Puzzle solved ─────────────────────────────────────────────────────────

    function handlePuzzleSolved() {
        setStatus('solved');
        const today = getTodaySeed();
        const alreadySolved = localStorage.getItem('puzzle_solved_date') === String(today);
        if (!alreadySolved) {
            const newStreak = streak + 1;
            const newBest = Math.max(newStreak, bestStreak);
            setStreak(newStreak);
            setBestStreak(newBest);
            setSolvedToday(true);
            localStorage.setItem('puzzle_streak', String(newStreak));
            localStorage.setItem('puzzle_best_streak', String(newBest));
            localStorage.setItem('puzzle_solved_date', String(today));
        }

    }

    // ── Hint ─────────────────────────────────────────────────────────────────

    const showHint = useCallback(() => {
        if (!puzzleState || !board) return;
        const expectedUci = puzzleState.solution[solutionIndex];
        if (!expectedUci) return;
        const { from } = parseMoveAlgebraic(expectedUci);
        setHintSquare(from);
        setHintsUsed(h => h + 1);
    }, [puzzleState, solutionIndex, board]);

    // ── King check position ───────────────────────────────────────────────────
    const kingInCheckPos: Position | null =
        board && (gameStatus === 'check' || gameStatus === 'checkmate')
            ? findKing(board, currentTurn)
            : null;

    // ── Render ────────────────────────────────────────────────────────────────

    const isValidMoveSquare = (row: number, col: number) =>
        validMoves.some(([r, c]) => r === row && c === col);

    const isLastMoveSquare = (row: number, col: number) =>
        lastMove !== null &&
        ((lastMove.from[0] === row && lastMove.from[1] === col) ||
            (lastMove.to[0] === row && lastMove.to[1] === col));

    const isWrongMoveSquare = (row: number, col: number) =>
        wrongMove !== null &&
        ((wrongMove.from[0] === row && wrongMove.from[1] === col) ||
            (wrongMove.to[0] === row && wrongMove.to[1] === col));

    const isHintSquare = (row: number, col: number) =>
        hintSquare !== null && hintSquare[0] === row && hintSquare[1] === col;

    const displayBoard = board ?? (Array(8).fill(null).map(() => Array(8).fill(null)) as Board);

    return (
        <div className="h-screen bg-background flex flex-col items-center py-2 px-2 md:px-4 relative overflow-hidden transition-colors duration-300">
            {/* Elegant Vibe Sync Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, 50, 0],
                        y: [0, 40, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1],
                        x: [0, -60, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-orange-600/20 blur-[130px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.2, 0.1],
                        x: [0, 30, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-rose-500/10 blur-[100px]"
                />
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] transition-colors duration-300" />
            </div>

            {/* Nav */}
            <div className="relative z-10 w-full max-w-6xl flex items-center justify-between mb-1 px-2 flex-shrink-0">
                <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Home</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-card/60 border border-border px-3 py-1.5 rounded-full">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-xs font-mono font-bold text-foreground">{streak}</span>
                        <span className="text-xs text-muted-foreground">streak</span>
                    </div>
                    <ThemeSwitcher />
                </div>
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4 min-h-0 pb-6">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 xl:gap-12 w-full my-auto py-4">
                {/* Left Panel */}
                <div className="hidden lg:flex flex-col gap-4 w-full lg:w-[360px] flex-shrink-0 order-2 lg:order-1 max-w-[500px] lg:max-w-none mx-auto lg:mx-0 lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:max-h-full">
                    {/* Puzzle Info */}
                    <div className="bg-card/60 border border-border rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2.5 mb-2">
                            <Crown className="w-6 h-6 text-orange-400" />
                            <h1 className="text-xl font-bold tracking-tight text-foreground">Daily Puzzle</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>

                        {puzzleState && (
                            <>
                                <div className="flex gap-3 mb-5 flex-wrap">
                                    <div className="flex-1 bg-muted/40 rounded-xl px-4 py-3 text-center border border-white/5">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rating</p>
                                        <p className="text-2xl font-mono font-bold text-primary">{puzzleState.rating}</p>
                                    </div>
                                    <div className="flex-1 bg-muted/40 rounded-xl px-4 py-3 text-center border border-white/5">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Moves</p>
                                        <p className="text-2xl font-mono font-bold text-foreground">{Math.ceil(puzzleState.solution.length / 2)}</p>
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Play as</p>
                                    <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 border border-white/5">
                                        <div className={`w-5 h-5 rounded-full border-2 border-border ${puzzleState.playerColor === 'white' ? 'bg-white' : 'bg-neutral-900'}`} />
                                        <span className="text-base font-semibold capitalize text-foreground">{puzzleState.playerColor}</span>
                                    </div>
                                </div>

                                {/* Themes */}
                                <div>
                                    <button
                                        onClick={() => setShowThemes(v => !v)}
                                        className="text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors flex items-center gap-1.5"
                                    >
                                        Themes {showThemes ? '▲' : '▼'}
                                    </button>
                                    <AnimatePresence>
                                        {showThemes && (
                                            <motion.div
                                                className="mt-3 flex flex-wrap gap-2"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                {puzzleState.themes.slice(0, 6).map(t => (
                                                    <span key={t} className="text-xs bg-orange-500/10 text-orange-300 border border-orange-500/20 px-3 py-1 rounded-full font-medium">
                                                        {formatTheme(t)}
                                                    </span>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Streak */}
                    <div className="bg-card/60 border border-border rounded-2xl p-5 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2.5">
                                <Flame className="w-5 h-5 text-orange-400" />
                                <span className="text-lg font-bold text-foreground">Streak</span>
                            </div>
                            <Trophy className="w-5 h-5 text-yellow-500/70" />
                        </div>
                        <div className="flex gap-6 mt-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current</p>
                                <p className="text-3xl font-mono font-bold text-primary">{streak}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Best</p>
                                <p className="text-3xl font-mono font-bold text-foreground">{bestStreak}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {status !== 'loading' && status !== 'error' && (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={showHint}
                                disabled={status === 'solved' || opponentMoving || currentTurn !== puzzleState?.playerColor}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-border bg-card/50 text-base font-semibold text-muted-foreground hover:text-foreground hover:border-orange-400/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Lightbulb className="w-5 h-5 text-yellow-400" />
                                Hint {hintsUsed > 0 ? `(${hintsUsed} used)` : ''}
                            </button>
                            <button
                                onClick={loadPuzzle}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-border bg-card/50 text-base font-semibold text-muted-foreground hover:text-foreground hover:border-orange-400/40 transition-all"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Reload
                            </button>
                        </div>
                    )}
                </div>

                {/* Board Column */}
                <div className="flex flex-col items-center gap-2 relative order-1 lg:order-2 flex-shrink min-h-0">
                    {/* Status Banner - fixed height to prevent board layout shift */}
                    <div className="relative w-full flex items-center justify-center flex-shrink-0" style={{ minHeight: '40px' }}>
                        <AnimatePresence mode="wait">
                            {(() => {
                                if (status === 'loading') {
                                    return (
                                        <motion.div key="loading" className="flex items-center gap-3 bg-card/60 border border-border rounded-xl px-5 py-3"
                                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                            <span className="text-sm font-medium text-muted-foreground">Loading today's puzzle…</span>
                                        </motion.div>
                                    );
                                }
                                if (status === 'error') {
                                    return (
                                        <motion.div key="error" className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-5 py-3"
                                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            <XCircle className="w-4 h-4 text-destructive" />
                                            <span className="text-sm font-medium text-destructive">Failed to load puzzle. Check your connection.</span>
                                        </motion.div>
                                    );
                                }
                                if (status === 'solved') {
                                    return (
                                        <motion.div key="solved" className="flex items-center gap-3 bg-orange-500/15 border border-orange-500/40 rounded-xl px-5 py-3"
                                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                                            <Trophy className="w-4 h-4 text-orange-400" />
                                            <span className="text-sm font-bold text-orange-300">Puzzle Solved! {solvedToday ? '🔥' : ''}</span>
                                        </motion.div>
                                    );
                                }
                                if (status === 'wrong') {
                                    return (
                                        <motion.div key="wrong" className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3"
                                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            <XCircle className="w-4 h-4 text-red-400" />
                                            <span className="text-sm font-semibold text-red-400">Not the right move — try again!</span>
                                        </motion.div>
                                    );
                                }
                                if (status === 'correct') {
                                    return (
                                        <motion.div key="correct" className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-3"
                                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            <span className="text-sm font-semibold text-green-400">Good move! Keep going…</span>
                                        </motion.div>
                                    );
                                }
                                if ((status === 'ready' || status === 'playing') && puzzleState) {
                                    return (
                                        <motion.div key="find" className="flex items-center gap-3 bg-card/60 border border-border rounded-xl px-5 py-3"
                                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            <div className={`w-3 h-3 rounded-full ${puzzleState.playerColor === 'white' ? 'bg-white border border-neutral-400' : 'bg-neutral-900 border border-neutral-600'}`} />
                                            <span className="text-sm font-semibold text-foreground">
                                                Find the best move for <span className="text-primary capitalize">{puzzleState.playerColor}</span>
                                            </span>
                                        </motion.div>
                                    );
                                }
                                return null;
                            })()}
                        </AnimatePresence>
                    </div>

                    {/* Chess Board Area - centered via grid */}
                    <div className="flex flex-col items-center justify-start relative overflow-visible">
                        <div className="flex justify-center">
                            <div className="chess-board-shadow rounded-xl overflow-hidden border border-chess-board-border relative flex flex-col items-center bg-chess-dark/30">
                                {/* File labels top */}
                                <div className="flex w-full">
                                    <div className="w-8" />
                                    <div className="flex-1 grid grid-cols-8">
                                        {FILES.map((f) => (
                                            <div key={f} className="h-8 flex items-center justify-center text-sm font-mono text-muted-foreground/50">
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-8" />
                                </div>

                                <div className="flex relative">
                                    {/* Ranks left */}
                                    <div className="w-8 flex flex-col">
                                        {RANKS.map((r, i) => (
                                            <div key={i} className="flex-1 flex items-center justify-center text-sm font-mono text-muted-foreground/50 aspect-square">
                                                {r}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Board Container */}
                                    <motion.div
                                        layout
                                        style={{
                                            width: 'min(70vw, calc(100vh - 200px), 700px)',
                                            height: 'min(70vw, calc(100vh - 200px), 700px)'
                                        }}
                                        transition={{
                                          type: 'spring',
                                          stiffness: 3000,
                                          damping: 80,
                                          mass: 0.2
                                        }}
                                        className="relative chess-board-shadow rounded-lg overflow-hidden border border-chess-board-border bg-chess-dark"
                                    >
                                        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                                            {displayBoard.flatMap((row, rowIdx) =>
                                                row.map((piece, colIdx) => (
                                                    <div
                                                        key={`${rowIdx}-${colIdx}`}
                                                        className="w-full h-full relative"
                                                    >
                                                        <ChessSquare
                                                            piece={piece}
                                                            isLight={(rowIdx + colIdx) % 2 === 0}
                                                            isSelected={selected?.[0] === rowIdx && selected?.[1] === colIdx}
                                                            isValidMove={isValidMoveSquare(rowIdx, colIdx)}
                                                            isLastMove={isLastMoveSquare(rowIdx, colIdx)}
                                                            isKingInCheck={
                                                                kingInCheckPos !== null &&
                                                                kingInCheckPos[0] === rowIdx && kingInCheckPos[1] === colIdx
                                                            }
                                                            position={[rowIdx, colIdx]}
                                                            onClick={() => handleSquareClick(rowIdx, colIdx)}
                                                            canDragPiece={
                                                                !opponentMoving &&
                                                                status !== 'solved' &&
                                                                status !== 'wrong' &&
                                                                piece?.color === currentTurn &&
                                                                currentTurn === puzzleState?.playerColor
                                                            }
                                                            currentTurn={currentTurn}
                                                            onDropPosition={(source, target) => {
                                                                if (!selected || selected[0] !== source[0] || selected[1] !== source[1]) {
                                                                    setSelected(source);
                                                                    setValidMoves(getValidMoves(board!, source, currentTurn, castlingRights, enPassantTarget));
                                                                }
                                                                const draggedPiece = board?.[source[0]]?.[source[1]];
                                                                if (draggedPiece) {
                                                                    draggedPieceIdRef.current = draggedPiece.id;
                                                                }
                                                                handleSquareClick(target[0], target[1]);
                                                            }}
                                                            shouldAnimate={piece ? piece.id !== draggedPieceIdRef.current : true}
                                                        />
                                                        {/* Hint overlay */}
                                                        {isHintSquare(rowIdx, colIdx) && (
                                                            <motion.div
                                                                className="absolute inset-0 ring-4 ring-inset ring-yellow-400 bg-yellow-400/20 pointer-events-none z-20"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                                transition={{ repeat: Infinity, duration: 2 }}
                                                            />
                                                        )}
                                                        {/* Wrong move flash */}
                                                        {isWrongMoveSquare(rowIdx, colIdx) && (
                                                            <motion.div
                                                                className="absolute inset-0 bg-red-500/30 pointer-events-none rounded-sm z-30"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: [0, 1, 0.8, 1, 0] }}
                                                                transition={{ duration: 1.2 }}
                                                            />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Ranks right */}
                                    <div className="w-8 flex flex-col">
                                        {RANKS.map((r, i) => (
                                            <div key={i} className="flex-1 flex items-center justify-center text-sm font-mono text-muted-foreground/50 aspect-square">
                                                {r}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* File labels bottom */}
                                <div className="flex w-full">
                                    <div className="w-8" />
                                    <div className="flex-1 grid grid-cols-8">
                                        {FILES.map((f) => (
                                            <div key={f} className="h-8 flex items-center justify-center text-sm font-mono text-muted-foreground/50">
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-8" />
                                </div>
                            </div>
                        </div>
                        {/* Solved overlay */}
                        <AnimatePresence>
                            {status === 'solved' && showSolvedOverlay && (
                                <motion.div
                                    className="absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-sm bg-background/70"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        className="bg-card border border-orange-500/30 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl relative"
                                        initial={{ scale: 0.9, y: 10 }}
                                        animate={{ scale: 1, y: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    >
                                        <button
                                            onClick={() => setShowSolvedOverlay(false)}
                                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <motion.div
                                            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                                            transition={{ duration: 0.6, delay: 0.2 }}
                                        >
                                            <Trophy className="w-12 h-12 text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]" />
                                        </motion.div>
                                        <h2 className="text-2xl font-bold text-foreground tracking-tight">Puzzle Complete!</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {hintsUsed === 0 ? 'Perfect — no hints used! 🎯' : `Solved with ${hintsUsed} hint${hintsUsed > 1 ? 's' : ''}`}
                                        </p>
                                        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full">
                                            <Flame className="w-4 h-4 text-orange-400" />
                                            <span className="text-sm font-bold text-orange-300">{streak} day streak</span>
                                        </div>
                                        <button
                                            onClick={loadPuzzle}
                                            className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all"
                                        >
                                            Try Another Puzzle
                                        </button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Progress dots */}
                    {puzzleState && status !== 'loading' && (
                        <div className="flex items-center gap-2">
                            {puzzleState.solution.map((_, i) => {
                                const moveNum = Math.floor(i / 2);
                                const isPlayerMove = i % 2 === 0;
                                const isDone = i < solutionIndex;
                                const isCurrent = i === solutionIndex && !opponentMoving && status === 'playing';
                                return (
                                    <motion.div
                                        key={i}
                                        className={`rounded-full transition-all duration-300 ${!isPlayerMove
                                            ? 'w-2 h-2 opacity-40 bg-muted-foreground'
                                            : isDone
                                                ? 'w-3 h-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                                : isCurrent
                                                    ? 'w-3 h-3 bg-primary shadow-[0_0_8px_rgba(255,165,0,0.5)]'
                                                    : 'w-3 h-3 bg-muted border border-border'
                                            }`}
                                        animate={isCurrent ? { scale: [1, 1.3, 1] } : {}}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
                </div>

            </div>
        </div>
    );
};

export default DailyPuzzle;
