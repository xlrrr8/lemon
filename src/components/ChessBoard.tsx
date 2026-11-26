import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Volume2,
  VolumeX,
  TrendingUp,
  Crown,
  Copy,
  Check,
  X,
} from 'lucide-react';
import {
  Board,
  Position,
  PieceColor,
  Piece,
  PieceType,
  GameStatus,
  CastlingRights,
  createInitialBoard,
  createInitialCastlingRights,
  getValidMoves,
  isValidMove,
  movePiece,
  getGameStatus,
  getInsufficientMaterial,
  findKing,
  FILES,
  RANKS,
  getPieceSymbol,
  isRawValidMove,
  isKingInCheck,
  applyRawMove,
} from '@/lib/chess';
import ChessSquare from './ChessSquare';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ChessEvalBar } from './ChessEvalBar';
import { ChessArrows, ArrowAnnotation } from './ChessArrows';
import { PromotionModal } from './PromotionModal';
import { isSoundMuted, toggleSoundMuted } from '@/lib/sounds';
import { useToast } from '@/hooks/use-toast';

import {
  boardToFen,
  getBestMoveStockfish,
  analyzePositionStockfish,
  PositionAnalysis,
  classifyMove,
  generateCoachComment,
  MoveClassification,
  calculateWinProbability,
  estimateEloFromAccuracy
} from '@/lib/engine';
import { playChessSound, ChessSoundType } from '@/lib/sounds';
import {
  Glicko2Player,
  loadPlayer,
  savePlayer,
  updateRating as glicko2Update,
  getBotPlayer,
  formatRating,
} from '@/lib/glicko2';

interface ChessBoardProps {
  initialTime?: number;
  increment?: number;
  mode?: string;
  level?: number;
}

const ChessBoard = ({ initialTime = 0, increment = 0, mode = 'human', level = 5 }: ChessBoardProps) => {
  const [gameId, setGameId] = useState(() => Math.random().toString(36).substring(2, 9));
  const [board, setBoard] = useState<Board>(() => createInitialBoard(gameId));
  const [selected, setSelected] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('white');
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(createInitialCastlingRights);
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null);
  const [captured, setCaptured] = useState<{ white: Piece[]; black: Piece[] }>({ white: [], black: [] });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [insufficientMaterial, setInsufficientMaterial] = useState(false);
  const [whiteTime, setWhiteTime] = useState(initialTime * 60);
  const [blackTime, setBlackTime] = useState(initialTime * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timeoutWinner, setTimeoutWinner] = useState<PieceColor | null>(null);
  const [hideWinnerCard, setHideWinnerCard] = useState(false);
  const [overlayContent, setOverlayContent] = useState<'result' | 'analyzing' | 'review'>('result');
  const [reviewProgress, setReviewProgress] = useState({ current: 0, total: 0 });
  const [reviewSummary, setReviewSummary] = useState<{
    white: { accuracy: number, brilliant: number, great: number, book: number, best: number, excellent: number, good: number, inaccuracy: number, mistake: number, miss: number, blunder: number, estimatedElo: number },
    black: { accuracy: number, brilliant: number, great: number, book: number, best: number, excellent: number, good: number, inaccuracy: number, mistake: number, miss: number, blunder: number, estimatedElo: number }
  } | null>(null);

  const [glickoPlayer, setGlickoPlayer] = useState<Glicko2Player>(() => loadPlayer());
  const [ratingChange, setRatingChange] = useState<number | null>(null);
  const ratingUpdatedRef = useRef(false);
  const [animatingMoves, setAnimatingMoves] = useState<Array<{ from: Position; to: Position; pieceId: string }>>([]);
  const animTimeoutRef = useRef<number | null>(null);

  const { toast } = useToast();

  // Board UX Features
  const [isFlipped, setIsFlipped] = useState(() => localStorage.getItem('chess_board_flipped') === 'true');
  const [isMuted, setIsMuted] = useState(() => isSoundMuted());
  const [showEvalBar, setShowEvalBar] = useState(() => localStorage.getItem('chess_show_eval') === 'true');
  const [autoQueen, setAutoQueen] = useState(() => localStorage.getItem('chess_auto_queen') === 'true');
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position; to: Position; color: PieceColor } | null>(null);

  // Right-click arrows & highlights
  const [arrows, setArrows] = useState<ArrowAnnotation[]>([]);
  const [highlightedSquares, setHighlightedSquares] = useState<Position[]>([]);
  const rightClickStartRef = useRef<Position | null>(null);

  // Live evaluation & clipboard feedback
  const [liveEval, setLiveEval] = useState<PositionAnalysis | null>(null);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [copiedFen, setCopiedFen] = useState(false);

  const [historySnapshots, setHistorySnapshots] = useState<Array<{
    board: Board,
    captured: { white: Piece[], black: Piece[] },
    lastMove: { from: Position, to: Position } | null,
    fen: string
  }>>(() => [{
    board: createInitialBoard(gameId),
    captured: { white: [], black: [] },
    lastMove: null,
    fen: boardToFen(createInitialBoard(gameId), 'white', createInitialCastlingRights(), null, 0, 1)
  }]);

  const [moveAnalyses, setMoveAnalyses] = useState<Record<number, {
    eval: PositionAnalysis;
    classification?: MoveClassification;
    coachComment?: string;
  }>>({});
  const [viewIndex, setViewIndex] = useState(-1);
  const [isReviewPageActive, setIsReviewPageActive] = useState(false);
  const [activeClassFilter, setActiveClassFilter] = useState<{ classification: string; matchIndices: number[]; currentMatch: number } | null>(null);

  const currentViewIndex = viewIndex === -1 ? historySnapshots.length - 1 : viewIndex;
  const isViewingHistory = currentViewIndex < historySnapshots.length - 1;
  const displayBoard = historySnapshots[currentViewIndex]?.board || board;
  const displayCaptured = historySnapshots[currentViewIndex]?.captured || captured;
  const displayLastMove = historySnapshots[currentViewIndex]?.lastMove || lastMove;

  useEffect(() => {
    const status = getGameStatus(board, currentTurn, castlingRights, enPassantTarget);
    const draw = getInsufficientMaterial(board);
    setInsufficientMaterial(draw);
    
    setGameStatus((prevStatus) => {
      if (prevStatus === 'resigned' || prevStatus === 'draw') return prevStatus;
      

      return status;
    });
  }, [board, currentTurn, castlingRights, enPassantTarget]);

  useEffect(() => {
    if (moveHistory.length > 0 && gameStatus === 'playing' && initialTime > 0 && !timeoutWinner && !insufficientMaterial) {
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  }, [moveHistory.length, gameStatus, initialTime, timeoutWinner, insufficientMaterial]);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      if (currentTurn === 'white') {
        setWhiteTime((prev) => {
          if (prev <= 1) { setTimeoutWinner('black'); return 0; }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) { setTimeoutWinner('white'); return 0; }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, currentTurn]);

  useEffect(() => {
    let active = true;

    if (!isViewingHistory && mode === 'computer' && currentTurn === 'black' && (gameStatus === 'playing' || gameStatus === 'check') && !insufficientMaterial && !timeoutWinner) {
      const playAIMove = async () => {
        const fen = boardToFen(board, currentTurn, castlingRights, enPassantTarget, 0, Math.floor(moveHistory.length / 2) + 1);
        let bestMove = await getBestMoveStockfish(fen, level);

        if (!active) return;

        // Fallback to random move if API fails or responds with null
        if (!bestMove) {
          const allMoves: { from: Position; to: Position }[] = [];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const piece = board[r][c];
              if (piece && piece.color === 'black') {
                const validDestinations = getValidMoves(board, [r, c], 'black', castlingRights, enPassantTarget);
                for (const d of validDestinations) { allMoves.push({ from: [r, c], to: d }); }
              }
            }
          }
          if (allMoves.length > 0) {
            bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
          }
        }

        if (bestMove) {
          const pieceToMove = board[bestMove.from[0]][bestMove.from[1]];
          const result = movePiece(board, bestMove.from, bestMove.to, castlingRights, enPassantTarget);
          setBoard(result.newBoard);
          setCastlingRights(result.newCastlingRights);
          setEnPassantTarget(result.newEnPassantTarget);
          const newLastMove = { from: bestMove.from, to: bestMove.to as Position };
          setLastMove(newLastMove);

          // Animate AI piece slide (and rook if castling)
          if (pieceToMove) {
            const newAnimMoves: Array<{ from: Position; to: Position; pieceId: string }> = [
              { from: bestMove.from, to: bestMove.to as Position, pieceId: pieceToMove.id }
            ];
            if (result.isCastle) {
              const row = bestMove.from[0];
              if (bestMove.to[1] === 6) {
                const rook = board[row][7];
                if (rook) newAnimMoves.push({ from: [row, 7], to: [row, 5], pieceId: rook.id });
              } else if (bestMove.to[1] === 2) {
                const rook = board[row][0];
                if (rook) newAnimMoves.push({ from: [row, 0], to: [row, 3], pieceId: rook.id });
              }
            }
            setAnimatingMoves(newAnimMoves);
            if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
            animTimeoutRef.current = window.setTimeout(() => setAnimatingMoves([]), 250);
          }

          let updatedCaptured = captured;
          if (result.captured) {
            updatedCaptured = { ...captured, black: [...captured.black, result.captured!] };
            setCaptured(updatedCaptured);
          }

          setMoveHistory(prev => [...prev, result.notation]);
          if (initialTime > 0 && increment > 0) {
            setBlackTime(prev => prev + increment);
          }
          setCurrentTurn('white');

          // Play sound for AI move (Immediate)
          const postMoveStatus = getGameStatus(result.newBoard, 'white', result.newCastlingRights, result.newEnPassantTarget);
          let soundType: ChessSoundType = 'move';
          if (postMoveStatus === 'checkmate') soundType = 'checkmate';
          else if (postMoveStatus === 'check') soundType = 'check';
          else if (result.captured) soundType = 'capture';
          else if (result.isCastle) soundType = 'castle';
          playChessSound(soundType);

          const newFen = boardToFen(result.newBoard, 'white', result.newCastlingRights, result.newEnPassantTarget, 0, Math.floor((moveHistory.length + 1) / 2) + 1);

          setHistorySnapshots(prev => [...prev, {
            board: result.newBoard,
            captured: updatedCaptured,
            lastMove: newLastMove,
            fen: newFen
          }]);
          setViewIndex(-1);
        }
      };

      // Ensure at least a slight delay for better UX
      const timer = setTimeout(() => {
        playAIMove();
      }, 200); // Reduced from 500ms

      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
  }, [currentTurn, mode, level, gameStatus, insufficientMaterial, timeoutWinner, board, castlingRights, enPassantTarget, moveHistory.length, isViewingHistory]);

  const navigateHistory = useCallback((direction: 'prev' | 'next' | 'first' | 'last') => {
    const currentIndex = viewIndex === -1 ? historySnapshots.length - 1 : viewIndex;
    let newIndex: number;

    if (direction === 'first') {
      newIndex = 0;
    } else if (direction === 'last') {
      newIndex = historySnapshots.length - 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < historySnapshots.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return; // No change
    }

    // Play sound based on what happened at the target move
    if (newIndex > 0) {
      const prevSnap = historySnapshots[newIndex - 1];
      const targetSnap = historySnapshots[newIndex];
      const prevCapCount = prevSnap.captured.white.length + prevSnap.captured.black.length;
      const currCapCount = targetSnap.captured.white.length + targetSnap.captured.black.length;
      playChessSound(currCapCount > prevCapCount ? 'capture' : 'move');
    } else {
      playChessSound('move');
    }

    setViewIndex(newIndex === historySnapshots.length - 1 ? -1 : newIndex);
    setActiveClassFilter(null);

  }, [historySnapshots, viewIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        navigateHistory('prev');
      } else if (e.key === 'ArrowRight') {
        navigateHistory('next');
      } else if (e.key === 'ArrowUp') {
        navigateHistory('first');
      } else if (e.key === 'ArrowDown' || e.key === ' ') {
        navigateHistory('last');
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFlipped(prev => {
          const next = !prev;
          localStorage.setItem('chess_board_flipped', String(next));
          return next;
        });
      } else if (e.key === 'm' || e.key === 'M') {
        const next = toggleSoundMuted();
        setIsMuted(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateHistory]);

  // Live evaluation effect for the Eval Bar
  useEffect(() => {
    if (!showEvalBar) return;
    const snap = historySnapshots[currentViewIndex];
    const fen = snap?.fen;
    if (!fen) return;

    if (moveAnalyses[currentViewIndex]?.eval) {
      setLiveEval(moveAnalyses[currentViewIndex].eval);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await analyzePositionStockfish(fen, 8);
        if (active && res) {
          setLiveEval(res);
        }
      } catch (_) {}
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [showEvalBar, currentViewIndex, historySnapshots, moveAnalyses]);

  const isGameOver = gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'resigned' || gameStatus === 'draw' || insufficientMaterial || timeoutWinner !== null;

  useEffect(() => {
    if (!isViewingHistory && !isGameOver) return;

    let isMounted = true;

    const analyzeCurrentView = async () => {
      const snap = historySnapshots[currentViewIndex];
      const prevSnap = historySnapshots[currentViewIndex - 1];

      if (!snap || !snap.fen) return;

      const currAnalysis = moveAnalyses[currentViewIndex]?.eval;

      let fetchedCurrAnalysis: PositionAnalysis | null | undefined = currAnalysis;
      if (!fetchedCurrAnalysis) {
        fetchedCurrAnalysis = await analyzePositionStockfish(snap.fen, 10);
        if (isMounted && fetchedCurrAnalysis) {
          setMoveAnalyses(prev => ({ ...prev, [currentViewIndex]: { eval: fetchedCurrAnalysis! } }));
        }
      }

      if (currentViewIndex > 0 && prevSnap && prevSnap.fen && fetchedCurrAnalysis) {
        let prevAnalysis: PositionAnalysis | null | undefined = moveAnalyses[currentViewIndex - 1]?.eval;
        if (!prevAnalysis) {
          prevAnalysis = await analyzePositionStockfish(prevSnap.fen, 10);
          if (isMounted && prevAnalysis) {
            setMoveAnalyses(prev => ({ ...prev, [currentViewIndex - 1]: { ...prev[currentViewIndex - 1], eval: prevAnalysis! } }));
          }
        }

        if (isMounted && prevAnalysis && !moveAnalyses[currentViewIndex]?.classification) {
          const isWhiteMove = currentViewIndex % 2 === 1;
          const classification = classifyMove(
            prevAnalysis.evaluation, prevAnalysis.mate,
            fetchedCurrAnalysis.evaluation, fetchedCurrAnalysis.mate,
            isWhiteMove
          );
          const coachComment = generateCoachComment(classification, isWhiteMove);
          setMoveAnalyses(prev => ({
            ...prev,
            [currentViewIndex]: {
              ...prev[currentViewIndex],
              classification,
              coachComment
            }
          }));
        }
      }
    };

    analyzeCurrentView();
    return () => { isMounted = false; };
  }, [currentViewIndex, isViewingHistory, isGameOver, historySnapshots, moveAnalyses]);

  useEffect(() => {
    if (isGameOver && mode === 'computer' && !ratingUpdatedRef.current) {
      ratingUpdatedRef.current = true;
      const bot = getBotPlayer(level);

      let score = 0.5;
      if (gameStatus === 'checkmate') {
        score = currentTurn === 'white' ? 0 : 1;
      } else if (timeoutWinner) {
        score = timeoutWinner === 'white' ? 1 : 0;
      } else if (gameStatus === 'resigned') {
        score = 0; // Human is always White vs computer, so if human resigns they score 0
      }

      const oldRating = glickoPlayer.rating;
      const updated = glicko2Update(glickoPlayer, bot, score);
      setGlickoPlayer(updated);
      savePlayer(updated);
      setRatingChange(Math.round(updated.rating - oldRating));
    }
  }, [isGameOver, gameStatus, currentTurn, timeoutWinner, level, mode, glickoPlayer]);

  const kingInCheckPos: Position | null =
    gameStatus === 'check' || gameStatus === 'checkmate' ? findKing(board, currentTurn) : null;

  const executeMove = useCallback(
    (from: Position, to: Position, isManualDrag = false, promotionPiece?: PieceType) => {
      if (isGameOver || isViewingHistory) return false;
      if (mode === 'computer' && currentTurn === 'black') return false;

      const pieceToMove = board[from[0]][from[1]];
      if (!pieceToMove || pieceToMove.color !== currentTurn) return false;

      if (isValidMove(board, from, to, currentTurn, castlingRights, enPassantTarget)) {
        // Check if pawn promotion requires user selection
        if (pieceToMove.type === 'pawn' && (to[0] === 0 || to[0] === 7) && !autoQueen && !promotionPiece) {
          setPendingPromotion({ from, to, color: pieceToMove.color });
          return false;
        }

        const promoType = promotionPiece || 'queen';
        const result = movePiece(board, from, to, castlingRights, enPassantTarget, promoType);
        setBoard(result.newBoard);
        setCastlingRights(result.newCastlingRights);
        setEnPassantTarget(result.newEnPassantTarget);
        const newLastMove = { from, to };
        setLastMove(newLastMove);

        // Clear arrows & highlights on move
        setArrows([]);
        setHighlightedSquares([]);

        // Animate piece slide (unless manual drag)
        const newAnimMoves: Array<{ from: Position; to: Position; pieceId: string }> = [];
        if (!isManualDrag) {
          newAnimMoves.push({ from, to, pieceId: pieceToMove.id });
        }
        if (result.isCastle) {
          const row = from[0];
          if (to[1] === 6) {
            const rook = board[row][7];
            if (rook) newAnimMoves.push({ from: [row, 7], to: [row, 5], pieceId: rook.id });
          } else if (to[1] === 2) {
            const rook = board[row][0];
            if (rook) newAnimMoves.push({ from: [row, 0], to: [row, 3], pieceId: rook.id });
          }
        }
        setAnimatingMoves(newAnimMoves);
        if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
        animTimeoutRef.current = window.setTimeout(() => setAnimatingMoves([]), 250);

        let updatedCaptured = captured;
        if (result.captured) {
          updatedCaptured = {
            ...captured,
            [currentTurn]: [...captured[currentTurn], result.captured!],
          };
          setCaptured(updatedCaptured);
        }

        setMoveHistory((prev) => [...prev, result.notation]);
        if (initialTime > 0 && increment > 0) {
          if (currentTurn === 'white') setWhiteTime(prev => prev + increment);
          else setBlackTime(prev => prev + increment);
        }
        const newTurn = currentTurn === 'white' ? 'black' : 'white';
        setCurrentTurn(newTurn);

        // Determine and play appropriate chess sound immediately
        const postMoveStatus = getGameStatus(result.newBoard, newTurn, result.newCastlingRights, result.newEnPassantTarget);
        let soundType: ChessSoundType = 'move';
        if (postMoveStatus === 'checkmate') soundType = 'checkmate';
        else if (postMoveStatus === 'check') soundType = 'check';
        else if (result.captured) soundType = 'capture';
        else if (result.isCastle) soundType = 'castle';
        playChessSound(soundType);

        const newFen = boardToFen(result.newBoard, newTurn, result.newCastlingRights, result.newEnPassantTarget, 0, Math.floor((moveHistory.length + 1) / 2) + 1);

        setHistorySnapshots(prev => [...prev, {
          board: result.newBoard,
          captured: updatedCaptured,
          lastMove: newLastMove,
          fen: newFen
        }]);
        setViewIndex(-1);

        setSelected(null);
        setValidMoves([]);
        return true;
      }
      return false;
    },
    [board, currentTurn, castlingRights, enPassantTarget, isGameOver, isViewingHistory, mode, initialTime, increment, captured, moveHistory.length]
  );

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (isGameOver || (mode === 'computer' && currentTurn === 'black') || isViewingHistory) return;

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

        const moved = executeMove(selected, [row, col], false);
        if (!moved) {
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
        }
      } else {
        if (clickedPiece && clickedPiece.color === currentTurn) {
          setSelected([row, col]);
          setValidMoves(getValidMoves(board, [row, col], currentTurn, castlingRights, enPassantTarget));
        }
      }
    },
    [board, selected, currentTurn, castlingRights, enPassantTarget, isGameOver, isViewingHistory, mode, executeMove]
  );
  const startFullGameReview = async () => {
    setOverlayContent('analyzing');
    let updatedAnalyses = { ...moveAnalyses };

    // Batch requests to fetch missing analyses without obliterating API completely
    const fetchEval = async (fen: string, index: number) => {
      const res = await analyzePositionStockfish(fen, 10);
      return { index, res };
    };

    const promises = [];
    for (let i = 0; i < historySnapshots.length; i++) {
      if (!updatedAnalyses[i]?.eval) {
        promises.push(fetchEval(historySnapshots[i].fen, i));
      }
    }

    let completed = 0;
    const parallelTasks = promises.map(p => p.then(data => {
      completed++;
      setReviewProgress({ current: completed, total: promises.length });
      return data;
    }));

    const results = await Promise.all(parallelTasks);

    for (const r of results) {
      if (r.res) {
        updatedAnalyses[r.index] = { ...updatedAnalyses[r.index], eval: r.res };
      }
    }

    let whiteStats = { brilliant: 0, great: 0, book: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, miss: 0, blunder: 0, total: 0, wpSum: 0 };
    let blackStats = { brilliant: 0, great: 0, book: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, miss: 0, blunder: 0, total: 0, wpSum: 0 };

    for (let i = 1; i < historySnapshots.length; i++) {
      const prevAnalysis = updatedAnalyses[i - 1]?.eval;
      const currAnalysis = updatedAnalyses[i]?.eval;
      const isWhiteMove = i % 2 === 1;

      if (prevAnalysis && currAnalysis) {
        let classification = updatedAnalyses[i].classification;
        let coachComment = updatedAnalyses[i].coachComment;

        if (!classification) {
          classification = classifyMove(
            prevAnalysis.evaluation, prevAnalysis.mate,
            currAnalysis.evaluation, currAnalysis.mate,
            isWhiteMove
          );
          coachComment = generateCoachComment(classification, isWhiteMove);
          updatedAnalyses[i] = {
            ...updatedAnalyses[i],
            classification,
            coachComment
          };
        }

        const stats = isWhiteMove ? whiteStats : blackStats;
        const prevWP = calculateWinProbability(prevAnalysis.evaluation, isWhiteMove);
        const currWP = calculateWinProbability(currAnalysis.evaluation, isWhiteMove);

        // Typical Accuracy calculation approximation (preventing negatives): 
        const accuracyMove = Math.max(0, 100 - (prevWP - currWP) * 1.5);

        // @ts-ignore
        stats[classification]++;
        stats.total++;
        stats.wpSum += Math.min(100, accuracyMove);
      }
    }

    setMoveAnalyses(updatedAnalyses);

    const finalWhiteAccuracy = whiteStats.total > 0 ? Math.round(whiteStats.wpSum / whiteStats.total) : 100;
    const finalBlackAccuracy = blackStats.total > 0 ? Math.round(blackStats.wpSum / blackStats.total) : 100;

    setReviewSummary({
      white: { ...whiteStats, accuracy: finalWhiteAccuracy, estimatedElo: estimateEloFromAccuracy(finalWhiteAccuracy) },
      black: { ...blackStats, accuracy: finalBlackAccuracy, estimatedElo: estimateEloFromAccuracy(finalBlackAccuracy) }
    });

    setOverlayContent('result');
    setHideWinnerCard(true);
    setIsReviewPageActive(true);
    setViewIndex(1);
  };

  const resetGame = () => {
    const newGameId = Math.random().toString(36).substring(2, 9);
    setGameId(newGameId);
    setBoard(createInitialBoard(newGameId));
    setSelected(null);
    setValidMoves([]);
    setCurrentTurn('white');
    setCastlingRights(createInitialCastlingRights());
    setEnPassantTarget(null);
    setCaptured({ white: [], black: [] });
    setMoveHistory([]);
    setGameStatus('playing');
    setLastMove(null);
    setInsufficientMaterial(false);
    setWhiteTime(initialTime * 60);
    setBlackTime(initialTime * 60);
    setTimerActive(false);
    setTimeoutWinner(null);
    setHideWinnerCard(false);
    setHistorySnapshots([{
      board: createInitialBoard(newGameId),
      captured: { white: [], black: [] },
      lastMove: null,
      fen: boardToFen(createInitialBoard(newGameId), 'white', createInitialCastlingRights(), null, 0, 1)
    }]);
    setMoveAnalyses({});
    setViewIndex(-1);
    setIsReviewPageActive(false);
    ratingUpdatedRef.current = false;
    setRatingChange(null);
    setGlickoPlayer(loadPlayer());
    setOverlayContent('result');
    setReviewProgress({ current: 0, total: 0 });
    setReviewSummary(null);

  };

  const handleToggleFlip = () => {
    setIsFlipped(prev => {
      const next = !prev;
      localStorage.setItem('chess_board_flipped', String(next));
      return next;
    });
  };

  const handleToggleSound = () => {
    const next = toggleSoundMuted();
    setIsMuted(next);
  };

  const handleToggleEval = () => {
    setShowEvalBar(prev => {
      const next = !prev;
      localStorage.setItem('chess_show_eval', String(next));
      return next;
    });
  };

  const handleToggleAutoQueen = () => {
    setAutoQueen(prev => {
      const next = !prev;
      localStorage.setItem('chess_auto_queen', String(next));
      return next;
    });
  };

  const handleCopyPgn = () => {
    const pgnMoves = moveHistory.reduce((acc, move, idx) => {
      if (idx % 2 === 0) {
        return `${acc}${Math.floor(idx / 2) + 1}. ${move} `;
      }
      return `${acc}${move} `;
    }, '');
    const res = gameStatus === 'checkmate' ? (currentTurn === 'white' ? '0-1' : '1-0') : (gameStatus === 'resigned' ? (currentTurn === 'white' ? '0-1' : '1-0') : '*');
    const pgn = `[Event "Lemon Chess Casual Game"]\n[Site "Lemon Web"]\n[Date "${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}"]\n[White "White"]\n[Black "Orange"]\n[Result "${res}"]\n\n${pgnMoves}\n`;

    navigator.clipboard.writeText(pgn);
    setCopiedPgn(true);
    toast({ title: "PGN Copied!", description: "Game PGN copied to clipboard." });
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const handleCopyFen = () => {
    const snap = historySnapshots[currentViewIndex];
    const fen = snap?.fen || boardToFen(board, currentTurn, castlingRights, enPassantTarget, 0, Math.floor(moveHistory.length / 2) + 1);
    navigator.clipboard.writeText(fen);
    setCopiedFen(true);
    toast({ title: "FEN Copied!", description: "Position FEN copied to clipboard." });
    setTimeout(() => setCopiedFen(false), 2000);
  };

  const getSquareFromPoint = (clientX: number, clientY: number): Position | null => {
    const el = document.elementFromPoint(clientX, clientY)?.closest('.chess-square');
    const posStr = el?.getAttribute('data-position');
    if (posStr) {
      return posStr.split(',').map(Number) as Position;
    }
    return null;
  };

  const handleBoardPointerDown = (e: React.PointerEvent) => {
    if (e.button === 0) {
      setArrows([]);
      setHighlightedSquares([]);
    } else if (e.button === 2) {
      const pos = getSquareFromPoint(e.clientX, e.clientY);
      if (pos) rightClickStartRef.current = pos;
    }
  };

  const handleBoardPointerUp = (e: React.PointerEvent) => {
    if (e.button === 2 && rightClickStartRef.current) {
      const start = rightClickStartRef.current;
      const end = getSquareFromPoint(e.clientX, e.clientY);
      rightClickStartRef.current = null;
      if (!end) return;

      if (start[0] === end[0] && start[1] === end[1]) {
        setHighlightedSquares(prev => {
          const exists = prev.some(([r, c]) => r === start[0] && c === start[1]);
          if (exists) return prev.filter(([r, c]) => !(r === start[0] && c === start[1]));
          return [...prev, start];
        });
      } else {
        setArrows(prev => {
          const exists = prev.some(a => a.from[0] === start[0] && a.from[1] === start[1] && a.to[0] === end[0] && a.to[1] === end[1]);
          if (exists) return prev.filter(a => !(a.from[0] === start[0] && a.from[1] === start[1] && a.to[0] === end[0] && a.to[1] === end[1]));
          return [...prev, { from: start, to: end }];
        });
      }
    }
  };

  const displayRanks = isFlipped ? [...RANKS].reverse() : RANKS;
  const displayFiles = isFlipped ? [...FILES].reverse() : FILES;
  const rowIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const isValidMoveSquare = (row: number, col: number) =>
    !isViewingHistory && validMoves.some(([r, c]) => r === row && c === col);

  const isLastMoveSquare = (row: number, col: number) =>
    displayLastMove !== null &&
    ((displayLastMove.from[0] === row && displayLastMove.from[1] === col) ||
      (displayLastMove.to[0] === row && displayLastMove.to[1] === col));

  const pieceValues: Record<string, number> = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };
  const whiteScore = displayCaptured.white.reduce((s, p) => s + pieceValues[p.type], 0);
  const blackScore = displayCaptured.black.reduce((s, p) => s + pieceValues[p.type], 0);
  const advantage = whiteScore - blackScore;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const statusLabel = (): { text: string; color: string } => {
    if (timeoutWinner) return { text: `${timeoutWinner === 'white' ? 'White' : 'Orange'} wins on time!`, color: timeoutWinner === 'white' ? 'text-foreground' : 'text-primary' };
    if (insufficientMaterial) return { text: 'Draw — Insufficient Material', color: 'text-muted-foreground' };
    switch (gameStatus) {
      case 'resigned': return {
        text: `${currentTurn === 'white' ? 'White' : 'Orange'} Resigned!`,
        color: 'text-red-400',
      };
      case 'draw': return {
        text: 'Draw by Agreement',
        color: 'text-muted-foreground',
      };
      case 'check': return {
        text: `${currentTurn === 'white' ? 'White' : 'Orange'} is in Check!`,
        color: 'text-yellow-400',
      };
      case 'checkmate': return {
        text: `Checkmate! ${currentTurn === 'white' ? 'Orange' : 'White'} wins!`,
        color: currentTurn === 'white' ? 'text-primary' : 'text-foreground',
      };
      case 'stalemate': return { text: 'Stalemate — Draw!', color: 'text-muted-foreground' };
      default: return {
        text: `${currentTurn === 'white' ? 'White' : 'Orange'} to move`,
        color: 'text-muted-foreground',
      };
    }
  };

  const { text: statusText, color: statusColor } = statusLabel();

  const boardSize = isReviewPageActive 
    ? 'min(50vw, calc(100dvh - 165px), 640px)' 
    : 'min(calc(100cqw - 48px), calc(100dvh - 150px), 760px)';

  return (
    <div className={`grid grid-cols-1 w-full mx-auto px-2 sm:px-4 transition-all duration-500 ease-in-out ${
      isReviewPageActive 
        ? 'lg:grid-cols-[minmax(0,_1fr)_340px] gap-4 max-w-[1080px] items-center' 
        : 'lg:grid-cols-[240px_minmax(0,_1fr)_260px] xl:grid-cols-[260px_minmax(0,_1fr)_280px] gap-3 xl:gap-6 max-w-screen-2xl items-center'
    }`}>
      {/* Left Panel - Player Cards & Timers */}
      {!isReviewPageActive && (
        <div className="hidden lg:flex flex-col w-[240px] xl:w-[260px] flex-shrink-0 justify-between gap-3 py-2 xl:py-4 h-full max-h-[calc(100dvh-40px)]">
          <div className="flex-1" />

          {/* Opponent / Bot card */}
          <div className={`rounded-xl flex flex-col transition-all duration-200 skeuo-panel ${currentTurn === 'black' && !isGameOver ? 'border-primary' : 'opacity-80'} overflow-hidden`}>
            <div className={`px-5 py-4 border-b flex items-center justify-between ${currentTurn === 'black' && !isGameOver ? 'border-primary/30 bg-primary/10' : 'border-border/50 bg-black/15'}`}>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded flex items-center justify-center bg-orange-500/20 text-orange-400 text-base font-bold border border-orange-500/25">O</div>
                 <span className="text-xl font-display font-bold text-foreground tracking-tight">Orange</span>
               </div>
               <span className="text-base font-mono font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                 {mode === 'computer' ? `Bot L.${level}` : Math.round(glickoPlayer.rating)}
               </span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 pt-3">
              <span
                className={`text-4xl xl:text-5xl font-mono font-bold tracking-tight ${currentTurn === 'black' && !isGameOver ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {initialTime > 0 ? formatTime(blackTime) : '∞'}
              </span>
              {initialTime === 0 && (
                <span className="text-xs uppercase font-bold text-muted-foreground/60 tracking-widest mt-1">
                  Untimed
                </span>
              )}
            </div>
          </div>

          <div className="flex-1" />

          {/* Player card */}
          <div className={`rounded-xl flex flex-col transition-all duration-200 skeuo-panel ${currentTurn === 'white' && !isGameOver ? 'border-white/40' : 'opacity-80'} overflow-hidden`}>
            <div className={`px-5 py-4 border-b flex items-center justify-between ${currentTurn === 'white' && !isGameOver ? 'border-white/20 bg-white/10' : 'border-border/50 bg-black/15'}`}>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded flex items-center justify-center bg-muted/60 text-muted-foreground text-base font-bold border border-white/15">W</div>
                 <span className="text-xl font-display font-bold text-foreground tracking-tight">You</span>
               </div>
               <span className="text-base font-mono font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                 {formatRating(glickoPlayer)}
               </span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 pt-3">
              <span
                className={`text-4xl xl:text-5xl font-mono font-bold tracking-tight ${currentTurn === 'white' && !isGameOver ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {initialTime > 0 ? formatTime(whiteTime) : '∞'}
              </span>
              {initialTime === 0 && (
                <span className="text-xs uppercase font-bold text-muted-foreground/60 tracking-widest mt-1">
                  Untimed
                </span>
              )}
            </div>
          </div>

          <div className="flex-1" />
        </div>
      )}

      {/* Mobile Timers & Players Row */}
      {!isReviewPageActive && (
        <div className="flex lg:hidden flex-row gap-4 w-full px-2 mb-4">
          <div className={`rounded-xl flex-1 flex flex-col overflow-hidden skeuo-panel ${currentTurn === 'black' ? 'border-primary' : ''}`}>
            <div className={`px-3 py-2 border-b flex justify-between items-center ${currentTurn === 'black' ? 'border-primary/30 bg-primary/10' : 'border-border/50 bg-black/15'}`}>
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded flex items-center justify-center bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/20">O</div>
                 <span className="text-base font-display font-bold text-foreground tracking-tight">Orange</span>
               </div>
               <span className="text-sm font-mono font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                 {mode === 'computer' ? `Bot L.${level}` : Math.round(glickoPlayer.rating)}
               </span>
            </div>
            <div className="p-2.5 flex justify-center items-center">
               <span
                 className={`text-3xl font-mono font-bold tracking-tight ${currentTurn === 'black' ? 'text-primary' : 'text-foreground'}`}
               >
                 {initialTime > 0 ? formatTime(blackTime) : '∞'}
               </span>
            </div>
          </div>
          <div className={`rounded-xl flex-1 flex flex-col overflow-hidden skeuo-panel ${currentTurn === 'white' ? 'border-white/30' : ''}`}>
            <div className={`px-3 py-2 border-b flex justify-between items-center ${currentTurn === 'white' ? 'border-white/20 bg-white/10' : 'border-border/50 bg-black/15'}`}>
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded flex items-center justify-center bg-muted/60 text-muted-foreground text-xs font-bold border border-white/10">W</div>
                 <span className="text-base font-display font-bold text-foreground tracking-tight">You</span>
               </div>
               <span className="text-sm font-mono font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                 {formatRating(glickoPlayer)}
               </span>
            </div>
            <div className="p-2.5 flex justify-center items-center">
               <span
                 className={`text-3xl font-mono font-bold tracking-tight ${currentTurn === 'white' ? 'text-foreground' : 'text-muted-foreground'}`}
               >
                 {initialTime > 0 ? formatTime(whiteTime) : '∞'}
               </span>
            </div>
          </div>
        </div>
      )}

      {/* Board Column - centered via grid */}
      <div 
        className={`flex flex-col items-center relative overflow-visible min-h-0 w-full ${isReviewPageActive ? 'justify-center' : 'justify-start'}`}
        style={{ containerType: 'inline-size' }}
      >

        <div className="chess-board-shadow rounded-xl overflow-hidden border border-chess-board-border relative">
          {/* Game Over Score Card Overlay */}
          <AnimatePresence>
            {isGameOver && !hideWinnerCard && (
              <motion.div
                className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-background/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="relative overflow-hidden skeuo-panel rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl w-[92%] max-w-sm mx-4"
                  initial={{ scale: 0.95, y: 10, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setHideWinnerCard(true)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full skeuo-btn text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative z-10 flex flex-col items-center w-full min-h-[350px] justify-center">
                    {overlayContent === 'result' && (
                      <>
                        <div className="text-center mt-2 mb-2 w-full animate-in fade-in zoom-in-95 duration-300">
                          <h2 className="text-4xl font-display font-bold text-foreground tracking-tight mb-2 leading-tight">
                            {statusText.includes('wins') || gameStatus === 'resigned' ? (
                              <>
                                <span className={statusText.includes('White wins') || (gameStatus === 'resigned' && statusText.includes('Orange Resigned')) ? 'text-foreground' : 'text-primary'}>
                                  {gameStatus === 'resigned'
                                    ? (statusText.includes('White') ? 'Orange' : 'White')
                                    : statusText.match(/(White|Orange)/)?.[0] || ''}
                                </span>
                                <br />wins
                              </>
                            ) : (
                              statusText.split('—')[0]?.trim() || statusText
                            )}
                          </h2>
                          <p className="text-base font-medium text-muted-foreground">
                            {gameStatus === 'checkmate' ? 'by checkmate' :
                              timeoutWinner ? 'on time' :
                                gameStatus === 'resigned' ? 'by resignation' :
                                  insufficientMaterial ? 'insufficient material' :
                                    'match drawn'}
                          </p>
                        </div>

                        <div className="w-full h-px bg-border my-5" />

                        {/* Stats Grid */}
                        <div className={`grid ${initialTime > 0 ? 'grid-cols-2' : 'grid-cols-2'} gap-4 w-full mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                          <div className="col-span-1 flex flex-col items-center justify-center py-3 skeuo-inner rounded-2xl">
                            <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider mb-1">Moves</span>
                            <span className="text-3xl font-mono font-bold text-foreground">{Math.ceil(moveHistory.length / 2)}</span>
                          </div>
                          <div className="col-span-1 flex flex-col items-center justify-center py-3 skeuo-inner rounded-2xl">
                            <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider mb-1">Material</span>
                            <span className={`text-3xl font-mono font-bold ${advantage > 0 ? 'text-foreground' : advantage < 0 ? 'text-primary' : 'text-foreground'}`}>
                              {advantage === 0 ? '=' : advantage > 0 ? `+${advantage}` : -advantage}
                            </span>
                          </div>

                          {initialTime > 0 && (
                            <>
                              <div className="col-span-1 flex flex-col items-center justify-center py-3 skeuo-inner rounded-2xl">
                                <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider mb-1">White</span>
                                <span className={`text-xl font-mono font-bold ${timeoutWinner === 'black' ? 'text-destructive' : 'text-foreground'}`}>{formatTime(whiteTime)}</span>
                              </div>
                              <div className="col-span-1 flex flex-col items-center justify-center py-3 skeuo-inner rounded-2xl">
                                <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider mb-1">Orange</span>
                                <span className={`text-xl font-mono font-bold ${timeoutWinner === 'white' ? 'text-destructive' : 'text-foreground'}`}>{formatTime(blackTime)}</span>
                              </div>
                            </>
                          )}

                          {mode === 'computer' && (
                            <div className="col-span-2 flex flex-col items-center justify-center py-4 bg-primary/5 rounded-2xl border border-primary/20 shadow-inner mt-2">
                              <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider mb-1.5">Rating</span>
                              <span className="text-4xl font-mono font-black text-foreground flex items-baseline gap-2">
                                {Math.round(glickoPlayer.rating)}
                                {ratingChange !== null && (
                                  <span className={`text-base font-semibold px-2.5 py-0.5 rounded-full ${ratingChange >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'}`}>
                                    {ratingChange > 0 ? `+${ratingChange}` : ratingChange}
                                  </span>
                                )}
                              </span>
                              <span className="text-xs font-mono text-muted-foreground/80 mt-1">±{Math.round(glickoPlayer.rd)} RD</span>
                            </div>
                          )}
                        </div>

                        <div className="flex w-full gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                          <motion.button
                            className="flex-1 py-3.5 rounded-xl skeuo-btn-primary font-semibold text-base tracking-wide transition-all"
                            onClick={resetGame}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Play Again
                          </motion.button>

                          <motion.button
                            className="flex-1 py-3.5 rounded-xl skeuo-btn text-secondary-foreground font-semibold text-base tracking-wide transition-all"
                            onClick={startFullGameReview}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Game Review
                          </motion.button>
                        </div>

                        <div className="flex w-full gap-2 mt-3">
                          <button
                            onClick={handleCopyPgn}
                            className="flex-1 py-2.5 rounded-lg skeuo-btn text-sm font-mono text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {copiedPgn ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            Copy PGN
                          </button>
                          <button
                            onClick={handleCopyFen}
                            className="flex-1 py-2.5 rounded-lg skeuo-btn text-sm font-mono text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {copiedFen ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            Copy FEN
                          </button>
                        </div>
                      </>
                    )}

                    {overlayContent === 'analyzing' && (
                      <div className="flex flex-col items-center justify-center py-8 w-full animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mb-8" />
                        <h3 className="text-3xl font-display font-bold mb-3 text-foreground tracking-tight">Reviewing Game</h3>
                        <p className="text-base font-medium text-muted-foreground mb-8 text-center max-w-[270px] leading-relaxed">
                          Stockfish 16 NNUE is calculating match accuracy and best moves...
                        </p>
                        <div className="w-full skeuo-inner rounded-full h-3.5 mb-4 overflow-hidden relative">
                          <div className="absolute inset-y-0 left-0 bg-primary h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${reviewProgress.total > 0 ? (reviewProgress.current / reviewProgress.total) * 100 : 0}%` }}>
                            <div className="absolute inset-0 bg-white/20" />
                          </div>
                        </div>
                        <p className="text-sm font-mono font-bold text-muted-foreground tracking-widest">{reviewProgress.current} / {reviewProgress.total} MOVES</p>
                      </div>
                    )}

                    {/* Review overlay has been moved to the side panel */}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="chess-board-shadow rounded-xl overflow-hidden border border-chess-board-border relative flex flex-col items-center bg-chess-dark/30">
            {/* Top Board Interactive Toolbar */}
            <div className="w-full flex items-center justify-between px-3 py-1.5 sm:py-2 border-b border-border/40 bg-card/40 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {mode === 'computer' ? `Stockfish L.${level}` : 'Pass & Play'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Flip Board */}
                <button
                  onClick={handleToggleFlip}
                  className={`skeuo-btn p-1.5 sm:px-3 sm:py-1 rounded-lg text-sm font-mono transition-all flex items-center gap-1.5 ${
                    isFlipped
                      ? '!bg-primary !border-primary text-white font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                  title="Flip Board [F]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-bold">Flip</span>
                </button>

                {/* Eval Bar Toggle */}
                <button
                  onClick={handleToggleEval}
                  className={`skeuo-btn p-1.5 sm:px-3 sm:py-1 rounded-lg text-sm font-mono transition-all flex items-center gap-1.5 ${
                    showEvalBar
                      ? '!bg-primary !border-primary text-white font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                  title="Toggle Evaluation Bar"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-bold">Eval</span>
                </button>

                {/* Sound Toggle */}
                <button
                  onClick={handleToggleSound}
                  className={`skeuo-btn p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-sm font-mono transition-all flex items-center gap-1.5 ${
                    isMuted
                      ? '!border-destructive/60 text-destructive bg-destructive/10'
                      : 'text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                  title={isMuted ? "Unmute Sound [M]" : "Mute Sound [M]"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Auto-Queen Toggle */}
                <button
                  onClick={handleToggleAutoQueen}
                  className={`skeuo-btn p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-sm font-mono transition-all flex items-center gap-1.5 ${
                    autoQueen
                      ? '!bg-primary !border-primary text-white font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                  title={autoQueen ? "Auto-Queen: ON (Click to choose promotion piece)" : "Auto-Queen: OFF (Promote dialog active)"}
                >
                  <Crown className="w-4 h-4" />
                </button>

                {/* Copy FEN */}
                <button
                  onClick={handleCopyFen}
                  className="skeuo-btn p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy Position FEN"
                >
                  {copiedFen ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <ThemeSwitcher />
              </div>
            </div>

            {/* File labels top */}
            <div className="flex items-center gap-1">
              {showEvalBar && <div className="hidden sm:block w-7 sm:w-8 mr-1 flex-shrink-0" />}
              <div className="w-6 sm:w-7 flex-shrink-0" />
              <div 
                style={{ width: boardSize }} 
                className="grid grid-cols-8 h-6 sm:h-7 flex-shrink-0"
              >
                {displayFiles.map((f) => (
                  <div key={f} className="flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-muted-foreground/60 select-none">
                    {f}
                  </div>
                ))}
              </div>
              <div className="w-6 sm:w-7 flex-shrink-0" />
            </div>

            <div className="flex relative items-center gap-1">
              {/* Live Eval Bar if enabled */}
              {showEvalBar && (
                <div
                  style={{ height: boardSize }}
                  className="hidden sm:flex items-center flex-shrink-0 mr-1"
                >
                  <ChessEvalBar
                    evaluation={moveAnalyses[currentViewIndex]?.eval?.evaluation ?? liveEval?.evaluation}
                    mate={moveAnalyses[currentViewIndex]?.eval?.mate ?? liveEval?.mate}
                    isFlipped={isFlipped}
                  />
                </div>
              )}

              {/* Ranks left (1-8 perfectly mapped to grid rows) */}
              <div 
                style={{ height: boardSize }}
                className="w-6 sm:w-7 grid grid-rows-8 flex-shrink-0"
              >
                {displayRanks.map((r, i) => (
                  <div key={i} className="flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-muted-foreground/60 select-none">
                    {r}
                  </div>
                ))}
              </div>

              {/* Board Container with responsive square dimensions */}
              <motion.div
                layout
                style={{
                  width: boardSize,
                  height: boardSize
                }}
                className="relative chess-board-shadow rounded-lg overflow-hidden border border-chess-board-border bg-chess-dark select-none"
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={handleBoardPointerDown}
                onPointerUp={handleBoardPointerUp}
              >
                {/* SVG Tactical Arrows & Square Highlights */}
                <ChessArrows
                  arrows={arrows}
                  highlights={highlightedSquares}
                  isFlipped={isFlipped}
                />

                {/* Pawn Promotion Modal */}
                <PromotionModal
                  isOpen={pendingPromotion !== null}
                  color={pendingPromotion?.color || 'white'}
                  onSelect={(pieceType) => {
                    if (pendingPromotion) {
                      executeMove(pendingPromotion.from, pendingPromotion.to, false, pieceType);
                      setPendingPromotion(null);
                    }
                  }}
                  onCancel={() => {
                    setPendingPromotion(null);
                    setSelected(null);
                    setValidMoves([]);
                  }}
                />

                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                  {rowIndices.flatMap((rowIdx) =>
                    colIndices.map((colIdx) => {
                      const piece = displayBoard[rowIdx][colIdx];
                      return (
                        <div
                          key={`${rowIdx}-${colIdx}`}
                          className="w-full h-full relative"
                        >
                          <ChessSquare
                            piece={piece}
                            isLight={(rowIdx + colIdx) % 2 === 0}
                            isSelected={!isViewingHistory && selected?.[0] === rowIdx && selected?.[1] === colIdx}
                            isValidMove={isValidMoveSquare(rowIdx, colIdx)}
                            isLastMove={isLastMoveSquare(rowIdx, colIdx)}
                            isKingInCheck={
                              !isViewingHistory && kingInCheckPos !== null &&
                              kingInCheckPos[0] === rowIdx &&
                              kingInCheckPos[1] === colIdx
                            }
                            position={[rowIdx, colIdx]}
                            onClick={() => handleSquareClick(rowIdx, colIdx)}
                            canDragPiece={!isViewingHistory && piece?.color === currentTurn}
                            currentTurn={currentTurn}
                            onDropPosition={(source, target) => {
                              if (target[0] === source[0] && target[1] === source[1]) return;
                              const moved = executeMove(source, target, true);
                              if (!moved) {
                                playChessSound('error');
                                setSelected(null);
                                setValidMoves([]);
                              }
                            }}
                            animatingFrom={(() => {
                              const anim = animatingMoves.find(m => m.to[0] === rowIdx && m.to[1] === colIdx);
                              return (anim && piece && anim.pieceId === piece.id) ? anim.from : null;
                            })()}
                            isFlipped={isFlipped}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>

              {/* Ranks right (1-8 perfectly mapped to grid rows) */}
              <div 
                style={{ height: boardSize }}
                className="w-6 sm:w-7 grid grid-rows-8 flex-shrink-0"
              >
                {displayRanks.map((r, i) => (
                  <div key={i} className="flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-muted-foreground/60 select-none">
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* File labels bottom */}
            <div className="flex items-center gap-1">
              {showEvalBar && <div className="hidden sm:block w-7 sm:w-8 mr-1 flex-shrink-0" />}
              <div className="w-6 sm:w-7 flex-shrink-0" />
              <div 
                style={{ width: boardSize }} 
                className="grid grid-cols-8 h-6 sm:h-7 flex-shrink-0"
              >
                {displayFiles.map((f) => (
                  <div key={f} className="flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-muted-foreground/60 select-none">
                    {f}
                  </div>
                ))}
              </div>
              <div className="w-6 sm:w-7 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel Score Board */}
      <motion.div
        className={`flex lg:flex w-full ${
          isReviewPageActive 
            ? 'lg:col-start-2 lg:w-full max-w-[340px] lg:max-h-[calc(100dvh-32px)] lg:overflow-y-auto custom-scrollbar' 
            : 'lg:w-[260px] xl:w-[280px] lg:max-h-[calc(100dvh-32px)] lg:overflow-y-auto custom-scrollbar'
        } flex-col gap-2 xl:gap-2.5 lg:self-center transition-all duration-500`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Status */}
        <div className="hidden lg:flex skeuo-panel rounded-xl p-3 relative overflow-hidden flex-col gap-1.5 shrink-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          <div className="flex justify-between items-center w-full">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Status</p>
            <div className="flex items-center gap-2">
              {mode === 'computer' && (
                <p className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  Rating: {formatRating(glickoPlayer)}
                </p>
              )}
              <ThemeSwitcher />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${gameStatus === 'check' || gameStatus === 'checkmate'
                ? 'bg-red-500'
                : currentTurn === 'white'
                  ? 'bg-chess-dull'
                  : 'bg-primary'
                }`}
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={statusText}
                className={`text-base font-medium ${statusColor}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
              >
                {statusText}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden skeuo-panel rounded-xl p-2.5 relative overflow-hidden flex-row gap-1.5 items-center justify-between">
          <button
            onClick={() => navigateHistory('first')}
            disabled={currentViewIndex === 0}
            className="p-2.5 skeuo-btn rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all flex items-center justify-center"
            title="First Move"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateHistory('prev')}
            disabled={currentViewIndex === 0}
            className="flex-1 p-2.5 skeuo-btn rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all flex items-center justify-center"
            title="Previous Move"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center justify-center px-3 shrink-0">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest leading-none mb-1">Move</span>
            <span className="text-base font-mono font-bold leading-none text-foreground">
              {currentViewIndex === -1 ? moveHistory.length : currentViewIndex} / {moveHistory.length}
            </span>
          </div>
          <button
            onClick={() => navigateHistory('next')}
            disabled={!isViewingHistory}
            className="flex-1 p-2.5 skeuo-btn rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all flex items-center justify-center"
            title="Next Move"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateHistory('last')}
            disabled={!isViewingHistory}
            className="p-2.5 skeuo-btn rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all flex items-center justify-center"
            title="Latest Move"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>

        {/* Review Results Panel - only visible when isReviewPageActive is true */}
        {isReviewPageActive && reviewSummary && (
          <div className="flex flex-col w-full animate-in fade-in slide-in-from-right-8 duration-700 skeuo-panel rounded-2xl p-4 relative overflow-hidden shrink-0 lg:mt-2">
             <div className="flex items-center justify-center gap-2 mb-5">
               <div className="w-2.5 h-2.5 rounded-full bg-primary" />
               <h2 className="text-2xl font-display font-bold text-foreground uppercase tracking-widest">Match Report</h2>
               <div className="w-2.5 h-2.5 rounded-full bg-primary" />
             </div>

             <div className="grid grid-cols-2 gap-4 mb-5">
               <div className="flex flex-col items-center skeuo-inner py-4 px-2 rounded-xl relative overflow-hidden group transition hover:border-primary/50">
                 <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2">White</span>
                 <span className="text-4xl font-display font-black text-foreground mb-1">{reviewSummary.white.accuracy}<span className="text-xl font-medium text-muted-foreground/60">%</span></span>
                 <span className="text-xs font-mono text-muted-foreground mt-1 mb-3 uppercase tracking-widest">Accuracy</span>
                 <div className="bg-background/80 w-full px-3 py-1.5 rounded-lg text-center mt-auto border border-border flex justify-between items-center group-hover:border-primary/30 transition-colors">
                   <span className="text-xs font-mono text-muted-foreground uppercase">Est. Rating</span>
                   <div className="text-base font-bold font-mono text-foreground">{reviewSummary.white.estimatedElo}</div>
                 </div>
               </div>
               <div className="flex flex-col items-center skeuo-inner py-4 px-2 rounded-xl relative overflow-hidden group transition hover:border-orange-500/50">
                 <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2">Orange</span>
                 <span className="text-4xl font-display font-black text-foreground mb-1">{reviewSummary.black.accuracy}<span className="text-xl font-medium text-muted-foreground/60">%</span></span>
                 <span className="text-xs font-mono text-muted-foreground mt-1 mb-3 uppercase tracking-widest">Accuracy</span>
                 <div className="bg-background/80 w-full px-3 py-1.5 rounded-lg text-center mt-auto border border-border flex justify-between items-center group-hover:border-orange-500/30 transition-colors">
                   <span className="text-xs font-mono text-muted-foreground uppercase">Est. Rating</span>
                   <div className="text-base font-bold font-mono text-primary/90">{reviewSummary.black.estimatedElo}</div>
                 </div>
               </div>
             </div>

             <div className="skeuo-inner rounded-xl p-3 mb-4 w-full">
               {[
                 { label: 'Brilliant', key: 'brilliant', icon: '!!', wVal: reviewSummary.white.brilliant, bVal: reviewSummary.black.brilliant },
                 { label: 'Great', key: 'great', icon: '!', wVal: reviewSummary.white.great, bVal: reviewSummary.black.great },
                 { label: 'Book', key: 'book', icon: '📖', wVal: reviewSummary.white.book, bVal: reviewSummary.black.book },
                 { label: 'Best', key: 'best', icon: '★', wVal: reviewSummary.white.best, bVal: reviewSummary.black.best },
                 { label: 'Excellent', key: 'excellent', icon: '👍', wVal: reviewSummary.white.excellent, bVal: reviewSummary.black.excellent },
                 { label: 'Good', key: 'good', icon: '✓', wVal: reviewSummary.white.good, bVal: reviewSummary.black.good },
                 { label: 'Inaccuracy', key: 'inaccuracy', icon: '?!', wVal: reviewSummary.white.inaccuracy, bVal: reviewSummary.black.inaccuracy },
                 { label: 'Mistake', key: 'mistake', icon: '?', wVal: reviewSummary.white.mistake, bVal: reviewSummary.black.mistake },
                 { label: 'Miss', key: 'miss', icon: '✕', wVal: reviewSummary.white.miss, bVal: reviewSummary.black.miss },
                 { label: 'Blunder', key: 'blunder', icon: '??', wVal: reviewSummary.white.blunder, bVal: reviewSummary.black.blunder },
               ].map((row) => {
                 const isActive = activeClassFilter?.classification === row.key;
                 const hasMatches = (row.wVal + row.bVal) > 0;
                 return (
                   <div
                     key={row.label}
                     className={`grid grid-cols-[1fr_auto_1fr] items-center py-2 border-b border-border/40 last:border-b-0 transition-colors ${hasMatches ? 'cursor-pointer hover:bg-primary/5' : 'opacity-40'} ${isActive ? 'bg-primary/10 rounded-lg' : ''}`}
                     onClick={() => {
                       if (!hasMatches) return;
                       const matchIndices = Object.entries(moveAnalyses)
                         .filter(([, v]) => v.classification === row.key)
                         .map(([k]) => parseInt(k))
                         .sort((a, b) => a - b);
                       if (matchIndices.length === 0) return;

                       const jumpTo = (idx: number) => {
                         if (idx > 0) {
                           const prevSnap = historySnapshots[idx - 1];
                           const targetSnap = historySnapshots[idx];
                           const prevCapCount = prevSnap.captured.white.length + prevSnap.captured.black.length;
                           const currCapCount = targetSnap.captured.white.length + targetSnap.captured.black.length;
                           playChessSound(currCapCount > prevCapCount ? 'capture' : 'move');
                         } else {
                           playChessSound('move');
                         }
                         setViewIndex(idx);
                       };

                       if (isActive && activeClassFilter) {
                         const nextMatch = (activeClassFilter.currentMatch + 1) % matchIndices.length;
                         setActiveClassFilter({ classification: row.key, matchIndices, currentMatch: nextMatch });
                         jumpTo(matchIndices[nextMatch]);
                       } else {
                         setActiveClassFilter({ classification: row.key, matchIndices, currentMatch: 0 });
                         jumpTo(matchIndices[0]);
                       }
                     }}
                   >
                     <div className="flex items-center justify-between px-2">
                       <span className="text-xs font-bold uppercase tracking-wide text-foreground">{row.label}</span>
                       <span className="text-base font-mono font-bold text-foreground">{row.wVal}</span>
                     </div>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border mx-2 shrink-0 ${isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-primary/10 border-primary/30 text-primary'}`}>
                       {row.icon}
                     </div>
                     <div className="flex items-center justify-between px-2">
                       <span className="text-xs font-bold uppercase tracking-wide text-primary">{row.label}</span>
                       <span className="text-base font-mono font-bold text-primary">{row.bVal}</span>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        <div className={`hidden lg:flex flex-col gap-2 xl:gap-2.5 ${isReviewPageActive ? 'w-full' : 'w-full max-w-[280px]'}`}>
        {/* Captured Pieces */}
        <div className="hidden lg:flex skeuo-panel rounded-xl p-3 flex-col">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Material Score</p>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex flex-col gap-1 p-2 rounded-lg skeuo-inner">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-foreground text-sm">White Cap.</p>
                <div className="text-xs text-muted-foreground/80">+{whiteScore} pts</div>
              </div>
              <CapturedRow pieces={displayCaptured.white} advantage={advantage > 0 ? advantage : undefined} />
            </div>
            <div className="flex flex-col gap-1 p-2 rounded-lg skeuo-inner">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-primary text-sm">Orange Cap.</p>
                <div className="text-xs text-muted-foreground/80">+{blackScore} pts</div>
              </div>
              <CapturedRow pieces={displayCaptured.black} advantage={advantage < 0 ? -advantage : undefined} />
            </div>
          </div>
        </div>

        {/* Move History */}
        <div className="hidden lg:flex skeuo-panel rounded-xl p-3 flex-col flex-1 min-h-[140px] max-h-[220px] xl:max-h-[260px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest pl-1">
              Move History
              {moveHistory.length > 0 && <span className="ml-2 opacity-60 font-bold">({moveHistory.length})</span>}
            </p>
            <div className="flex items-center gap-0.5 skeuo-inner rounded-lg p-0.5">
              <button
                onClick={() => navigateHistory('first')}
                disabled={currentViewIndex === 0}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 transition-all"
                title="First Move [Up Arrow]"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateHistory('prev')}
                disabled={currentViewIndex === 0}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 transition-all"
                title="Previous Move [Left Arrow]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateHistory('next')}
                disabled={!isViewingHistory}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 transition-all"
                title="Next Move [Right Arrow]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateHistory('last')}
                disabled={!isViewingHistory}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 transition-all"
                title="Latest Move [Down Arrow / Space]"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar text-sm font-mono">
            {moveHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center pb-2">
                <p className="text-sm text-muted-foreground/50 italic">No moves played</p>
              </div>
            ) : (
              Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
                const whitePly = i * 2 + 1;
                const blackPly = i * 2 + 2;
                const isWhiteActive = currentViewIndex === whitePly;
                const isBlackActive = currentViewIndex === blackPly;

                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-xs font-mono p-0.5 rounded hover:bg-white/5 transition-colors"
                  >
                    <span className="text-muted-foreground/60 w-5 text-right flex-shrink-0 font-medium">
                      {i + 1}.
                    </span>
                    <button
                      onClick={() => {
                        setViewIndex(whitePly);
                        playChessSound('move');
                      }}
                      className={`flex-1 text-left px-1.5 py-0.5 rounded truncate font-semibold transition-colors ${
                        isWhiteActive
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-chess-bright hover:bg-white/10'
                      }`}
                    >
                      {moveHistory[i * 2]}
                    </button>
                    {moveHistory[i * 2 + 1] ? (
                      <button
                        onClick={() => {
                          setViewIndex(blackPly);
                          playChessSound('move');
                        }}
                        className={`flex-1 text-left px-1.5 py-0.5 rounded truncate font-semibold transition-colors ${
                          isBlackActive
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'text-chess-dull hover:bg-white/10'
                        }`}
                      >
                        {moveHistory[i * 2 + 1]}
                      </button>
                    ) : (
                      <span className="flex-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Game Actions */}
        {isGameOver ? (
          <motion.button
            className="w-full py-2.5 sm:py-3 rounded-xl skeuo-btn-primary text-white font-bold text-base tracking-wide transition-all duration-200 group relative overflow-hidden"
            onClick={resetGame}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Start New Game</span>
          </motion.button>
        ) : (
          <div className="flex gap-2.5 w-full">
            <motion.button
              className="flex-1 py-2.5 sm:py-3 rounded-xl skeuo-btn !border-red-500/30 text-red-400 font-semibold text-base tracking-wide hover:!border-red-500/50 hover:!bg-red-500/10 transition-all duration-200"
              onClick={() => { setGameStatus('resigned'); }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Resign
            </motion.button>
            <motion.button
              className="flex-1 py-2.5 sm:py-3 rounded-xl skeuo-btn text-foreground font-semibold text-base tracking-wide hover:border-primary/50 transition-all duration-200"
              onClick={() => { setGameStatus('draw'); }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Draw
            </motion.button>
          </div>
        )}
        </div>
      </motion.div>
    </div>
  );
};

function CapturedRow({ pieces, advantage, label }: { pieces: Piece[]; advantage?: number; label?: string }) {
  if (pieces.length === 0) return <div className="text-muted-foreground/50 italic text-sm leading-none">No captures</div>;

  const order: PieceType[] = ['pawn', 'knight', 'bishop', 'rook', 'queen'];
  const counts: Partial<Record<PieceType, number>> = {};
  for (const p of pieces) {
    counts[p.type] = (counts[p.type] || 0) + 1;
  }
  const color = pieces[0]?.color;

  return (
    <div className="flex flex-wrap items-center gap-1.5" title={label}>
      {order.map((type) => {
        const count = counts[type];
        if (!count) return null;
        return (
          <div
            key={type}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/30 border border-white/10 shadow-inner"
          >
            <span className={`text-base leading-none ${color !== 'white' ? 'text-chess-bright' : 'text-chess-dull'}`}>
              {getPieceSymbol(type)}
            </span>
            {count > 1 && (
              <span className="text-sm font-mono font-bold text-muted-foreground">
                ×{count}
              </span>
            )}
          </div>
        );
      })}
      {advantage !== undefined && advantage > 0 && (
        <span className="ml-auto text-sm font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/25">
          +{advantage}
        </span>
      )}
    </div>
  );
}

export default ChessBoard;
