export type PieceColor = 'white' | 'black';
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
}

export type Board = (Piece | null)[][];
export type Position = [number, number];

export interface CastlingRights {
  white: { kingSide: boolean; queenSide: boolean };
  black: { kingSide: boolean; queenSide: boolean };
}

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'resigned' | 'draw';

export function createInitialBoard(gameId?: string): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  const prefix = gameId ? `${gameId}-` : '';

  for (let col = 0; col < 8; col++) {
    board[0][col] = { id: `${prefix}black-${backRow[col]}-${col}`, type: backRow[col], color: 'black' };
    board[1][col] = { id: `${prefix}black-pawn-${col}`, type: 'pawn', color: 'black' };
    board[6][col] = { id: `${prefix}white-pawn-${col}`, type: 'pawn', color: 'white' };
    board[7][col] = { id: `${prefix}white-${backRow[col]}-${col}`, type: backRow[col], color: 'white' };
  }

  return board;
}

export function createInitialCastlingRights(): CastlingRights {
  return {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true },
  };
}

const PIECE_SYMBOLS: Record<PieceType, string> = {
  king: '♚',
  queen: '♛',
  rook: '♜',
  bishop: '♝',
  knight: '♞',
  pawn: '♟',
};

export function getPieceSymbol(type: PieceType): string {
  return PIECE_SYMBOLS[type];
}

export function findKing(board: Board, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

export function isSquareAttackedBy(board: Board, pos: Position, attackerColor: PieceColor): boolean {
  const [row, col] = pos;

  // Pawn attacks — white pawns move up (dr=-1), black pawns move down (dr=+1)
  // So white pawn at [row+1, col±1] attacks [row, col]; black pawn at [row-1, col±1] attacks [row, col]
  const pawnRow = attackerColor === 'white' ? row + 1 : row - 1;
  for (const pawnCol of [col - 1, col + 1]) {
    if (pawnRow >= 0 && pawnRow < 8 && pawnCol >= 0 && pawnCol < 8) {
      const piece = board[pawnRow][pawnCol];
      if (piece && piece.type === 'pawn' && piece.color === attackerColor) return true;
    }
  }

  // Knight attacks
  const knightMoves: [number, number][] = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  for (const [dr, dc] of knightMoves) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const piece = board[r][c];
      if (piece && piece.type === 'knight' && piece.color === attackerColor) return true;
    }
  }

  // Rook / Queen (horizontal + vertical)
  for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const piece = board[r][c];
      if (piece) {
        if (piece.color === attackerColor && (piece.type === 'rook' || piece.type === 'queen')) return true;
        break;
      }
      r += dr; c += dc;
    }
  }

  // Bishop / Queen (diagonals)
  for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as [number, number][]) {
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const piece = board[r][c];
      if (piece) {
        if (piece.color === attackerColor && (piece.type === 'bishop' || piece.type === 'queen')) return true;
        break;
      }
      r += dr; c += dc;
    }
  }

  // King attacks
  for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]] as [number, number][]) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.color === attackerColor) return true;
    }
  }

  return false;
}

export function isKingInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const opponent: PieceColor = color === 'white' ? 'black' : 'white';
  return isSquareAttackedBy(board, kingPos, opponent);
}

function isPathClear(board: Board, from: Position, to: Position): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const dr = Math.sign(toRow - fromRow);
  const dc = Math.sign(toCol - fromCol);
  let r = fromRow + dr;
  let c = fromCol + dc;
  while (r !== toRow || c !== toCol) {
    if (board[r][c]) return false;
    r += dr;
    c += dc;
  }
  return true;
}

export function applyRawMove(board: Board, from: Position, to: Position, enPassantTarget: Position | null): Board {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from[0]][from[1]];
  if (!piece) return newBoard;

  if (piece.type === 'pawn' && enPassantTarget && to[0] === enPassantTarget[0] && to[1] === enPassantTarget[1]) {
    const capturedPawnRow = piece.color === 'white' ? to[0] + 1 : to[0] - 1;
    newBoard[capturedPawnRow][to[1]] = null;
  }

  newBoard[to[0]][to[1]] = piece;
  newBoard[from[0]][from[1]] = null;

  const movedPiece = newBoard[to[0]][to[1]];
  if (movedPiece?.type === 'pawn' && (to[0] === 0 || to[0] === 7)) {
    newBoard[to[0]][to[1]] = { ...movedPiece, type: 'queen' };
  }

  return newBoard;
}

function canCastle(board: Board, color: PieceColor, side: 'kingSide' | 'queenSide'): boolean {
  const row = color === 'white' ? 7 : 0;
  const opponent: PieceColor = color === 'white' ? 'black' : 'white';

  if (isKingInCheck(board, color)) return false;

  if (side === 'kingSide') {
    if (board[row][5] || board[row][6]) return false;
    if (isSquareAttackedBy(board, [row, 5], opponent)) return false;
    if (isSquareAttackedBy(board, [row, 6], opponent)) return false;
    const rook = board[row][7];
    return !!(rook && rook.type === 'rook' && rook.color === color);
  } else {
    if (board[row][3] || board[row][2] || board[row][1]) return false;
    if (isSquareAttackedBy(board, [row, 3], opponent)) return false;
    if (isSquareAttackedBy(board, [row, 2], opponent)) return false;
    const rook = board[row][0];
    return !!(rook && rook.type === 'rook' && rook.color === color);
  }
}

export function isRawValidMove(
  board: Board,
  from: Position,
  to: Position,
  currentTurn: PieceColor,
  enPassantTarget: Position | null
): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const piece = board[fromRow][fromCol];

  if (!piece || piece.color !== currentTurn) return false;
  if (fromRow === toRow && fromCol === toCol) return false;

  const target = board[toRow][toCol];
  if (target && target.color === piece.color) return false;

  const dr = toRow - fromRow;
  const dc = toCol - fromCol;

  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;

      if (dc === 0 && !target) {
        if (dr === direction) return true;
        if (fromRow === startRow && dr === 2 * direction && !board[fromRow + direction][fromCol]) return true;
      }
      if (Math.abs(dc) === 1 && dr === direction) {
        if (target) return true;
        if (enPassantTarget && toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) return true;
      }
      return false;
    }
    case 'rook':
      return (dr === 0 || dc === 0) && isPathClear(board, from, to);
    case 'bishop':
      return Math.abs(dr) === Math.abs(dc) && isPathClear(board, from, to);
    case 'queen':
      return (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) && isPathClear(board, from, to);
    case 'knight':
      return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
    case 'king':
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
    default:
      return false;
  }
}

export function isValidMove(
  board: Board,
  from: Position,
  to: Position,
  currentTurn: PieceColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): boolean {
  const piece = board[from[0]][from[1]];
  if (!piece || piece.color !== currentTurn) return false;

  // Castling
  if (piece.type === 'king' && from[1] === 4) {
    const row = currentTurn === 'white' ? 7 : 0;
    if (from[0] === row) {
      if (to[0] === row && to[1] === 6 && castlingRights[currentTurn].kingSide) {
        if (canCastle(board, currentTurn, 'kingSide')) return true;
      }
      if (to[0] === row && to[1] === 2 && castlingRights[currentTurn].queenSide) {
        if (canCastle(board, currentTurn, 'queenSide')) return true;
      }
    }
  }

  if (!isRawValidMove(board, from, to, currentTurn, enPassantTarget)) return false;

  // Ensure move doesn't leave own king in check
  const newBoard = applyRawMove(board, from, to, enPassantTarget);
  if (isKingInCheck(newBoard, currentTurn)) return false;

  return true;
}

export function getValidMoves(
  board: Board,
  from: Position,
  currentTurn: PieceColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): Position[] {
  const moves: Position[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isValidMove(board, from, [r, c], currentTurn, castlingRights, enPassantTarget)) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

export interface MoveResult {
  newBoard: Board;
  captured: Piece | null;
  newCastlingRights: CastlingRights;
  newEnPassantTarget: Position | null;
  notation: string;
  isCastle: boolean;
  isEnPassant: boolean;
  isPromotion: boolean;
}

export function movePiece(
  board: Board,
  from: Position,
  to: Position,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): MoveResult {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from[0]][from[1]]!;
  let captured: Piece | null = newBoard[to[0]][to[1]];
  let isCastle = false;
  let isEnPassant = false;
  let isPromotion = false;

  if (piece.type === 'king' && Math.abs(to[1] - from[1]) === 2) {
    isCastle = true;
    const row = from[0];
    if (to[1] === 6) {
      newBoard[row][6] = piece;
      newBoard[row][4] = null;
      newBoard[row][5] = newBoard[row][7];
      newBoard[row][7] = null;
    } else {
      newBoard[row][2] = piece;
      newBoard[row][4] = null;
      newBoard[row][3] = newBoard[row][0];
      newBoard[row][0] = null;
    }
  } else {
    if (piece.type === 'pawn' && enPassantTarget && to[0] === enPassantTarget[0] && to[1] === enPassantTarget[1]) {
      isEnPassant = true;
      const capturedPawnRow = piece.color === 'white' ? to[0] + 1 : to[0] - 1;
      captured = newBoard[capturedPawnRow][to[1]];
      newBoard[capturedPawnRow][to[1]] = null;
    }

    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = null;

    const movedPiece = newBoard[to[0]][to[1]];
    if (movedPiece?.type === 'pawn' && (to[0] === 0 || to[0] === 7)) {
      newBoard[to[0]][to[1]] = { ...movedPiece, type: 'queen' };
      isPromotion = true;
    }
  }

  const newCastlingRights: CastlingRights = {
    white: { ...castlingRights.white },
    black: { ...castlingRights.black },
  };
  if (piece.type === 'king') {
    newCastlingRights[piece.color] = { kingSide: false, queenSide: false };
  }
  if (piece.type === 'rook') {
    if (from[1] === 7) newCastlingRights[piece.color].kingSide = false;
    if (from[1] === 0) newCastlingRights[piece.color].queenSide = false;
  }
  if (captured && captured.type === 'rook') {
    const opponentColor = piece.color === 'white' ? 'black' : 'white';
    if (to[1] === 7) newCastlingRights[opponentColor].kingSide = false;
    if (to[1] === 0) newCastlingRights[opponentColor].queenSide = false;
  }

  let newEnPassantTarget: Position | null = null;
  if (piece.type === 'pawn' && Math.abs(to[0] - from[0]) === 2) {
    newEnPassantTarget = [(from[0] + to[0]) / 2, from[1]];
  }

  let notation: string;
  if (isCastle) {
    notation = to[1] === 6 ? 'O-O' : 'O-O-O';
  } else {
    const captureSymbol = captured ? '×' : '→';
    const promotionSuffix = isPromotion ? '=♛' : '';
    const epSuffix = isEnPassant ? ' e.p.' : '';
    notation = `${getPieceSymbol(piece.type)}${FILES[from[1]]}${RANKS[from[0]]}${captureSymbol}${FILES[to[1]]}${RANKS[to[0]]}${promotionSuffix}${epSuffix}`;
  }

  return { newBoard, captured, newCastlingRights, newEnPassantTarget, notation, isCastle, isEnPassant, isPromotion };
}

export function hasAnyValidMove(
  board: Board,
  color: PieceColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, [r, c], color, castlingRights, enPassantTarget);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

export function getGameStatus(
  board: Board,
  color: PieceColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): GameStatus {
  const inCheck = isKingInCheck(board, color);
  const hasMove = hasAnyValidMove(board, color, castlingRights, enPassantTarget);
  if (!hasMove) return inCheck ? 'checkmate' : 'stalemate';
  return inCheck ? 'check' : 'playing';
}

export function getInsufficientMaterial(board: Board): boolean {
  const pieces: Piece[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) pieces.push(p);
    }
  }
  if (pieces.length === 2) return true;
  if (pieces.length === 3) {
    const nonKings = pieces.filter(p => p.type !== 'king');
    if (nonKings.length === 1 && (nonKings[0].type === 'bishop' || nonKings[0].type === 'knight')) return true;
  }
  return false;
}

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];
