import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Board,
  Position,
  PieceColor,
  Piece,
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

interface ChessBoardProps {
  initialTime?: number;
  increment?: number;
  mode?: string;
  level?: number;
}

const ChessBoard = ({ initialTime = 0, increment = 0, mode = 'human', level = 5 }: ChessBoardProps) => {
  const [board, setBoard] = useState<Board>(createInitialBoard);
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

  const [userElo, setUserElo] = useState(() => parseInt(localStorage.getItem('chess_user_elo') || '800', 10));
  const [eloChange, setEloChange] = useState<number | null>(null);
  const eloUpdatedRef = useRef(false);

  const [historySnapshots, setHistorySnapshots] = useState<Array<{
    board: Board,
    captured: { white: Piece[], black: Piece[] },
    lastMove: { from: Position, to: Position } | null,
    fen: string
  }>>([{
    board: createInitialBoard(),
    captured: { white: [], black: [] },
    lastMove: null,
    fen: boardToFen(createInitialBoard(), 'white', createInitialCastlingRights(), null, 0, 1)
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
          const result = movePiece(board, bestMove.from, bestMove.to, castlingRights, enPassantTarget);
          setBoard(result.newBoard);
          setCastlingRights(result.newCastlingRights);
          setEnPassantTarget(result.newEnPassantTarget);
          const newLastMove = { from: bestMove.from, to: bestMove.to as Position };
          setLastMove(newLastMove);

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

  const navigateHistory = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = viewIndex === -1 ? historySnapshots.length - 1 : viewIndex;
    let newIndex: number;

    if (direction === 'prev' && currentIndex > 0) {
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
      if (e.key === 'ArrowLeft') {
        navigateHistory('prev');
      } else if (e.key === 'ArrowRight') {
        navigateHistory('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateHistory]);

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
    if (isGameOver && mode === 'computer' && !eloUpdatedRef.current) {
      eloUpdatedRef.current = true;
      const botElo = 600 + (level * 250);

      let score = 0.5;
      if (gameStatus === 'checkmate') {
        score = currentTurn === 'white' ? 0 : 1;
      } else if (timeoutWinner) {
        score = timeoutWinner === 'white' ? 1 : 0;
      } else if (gameStatus === 'resigned') {
        score = 0; // Human is always White vs computer, so if human resigns they score 0
      }

      const expectedScore = 1 / (1 + Math.pow(10, (botElo - userElo) / 400));
      const K = 32;
      const change = Math.round(K * (score - expectedScore));

      const newElo = Math.max(100, userElo + change);
      setUserElo(newElo);
      setEloChange(change);
      localStorage.setItem('chess_user_elo', newElo.toString());
    }
  }, [isGameOver, gameStatus, currentTurn, timeoutWinner, level, mode, userElo]);

  const kingInCheckPos: Position | null =
    gameStatus === 'check' || gameStatus === 'checkmate' ? findKing(board, currentTurn) : null;

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

        if (isValidMove(board, selected, [row, col], currentTurn, castlingRights, enPassantTarget)) {
          const result = movePiece(board, selected, [row, col], castlingRights, enPassantTarget);
          setBoard(result.newBoard);
          setCastlingRights(result.newCastlingRights);
          setEnPassantTarget(result.newEnPassantTarget);
          const newLastMove = { from: selected, to: [row, col] as Position };
          setLastMove(newLastMove);

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
        if (clickedPiece && clickedPiece.color === currentTurn) {
          setSelected([row, col]);
          setValidMoves(getValidMoves(board, [row, col], currentTurn, castlingRights, enPassantTarget));
        }
      }
    },
    [board, selected, currentTurn, castlingRights, enPassantTarget, isGameOver, isViewingHistory, mode, initialTime, increment, captured, moveHistory.length, historySnapshots.length]
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
    setBoard(createInitialBoard());
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
      board: createInitialBoard(),
      captured: { white: [], black: [] },
      lastMove: null,
      fen: boardToFen(createInitialBoard(), 'white', createInitialCastlingRights(), null, 0, 1)
    }]);
    setMoveAnalyses({});
    setViewIndex(-1);
    setIsReviewPageActive(false);
    eloUpdatedRef.current = false;
    setEloChange(null);
    setOverlayContent('result');
    setReviewProgress({ current: 0, total: 0 });
    setReviewSummary(null);

  };

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

  return (
    <div className={`grid grid-cols-1 w-full mx-auto px-4 min-h-fit transition-all duration-500 ease-in-out ${isReviewPageActive ? 'lg:grid-cols-[1fr_350px] gap-6 max-w-[1080px] items-center' : 'lg:grid-cols-[280px_1fr_280px] gap-8 max-w-screen-2xl items-center'}`}>
      {/* Left Panel - Timers */}
      {!isReviewPageActive && initialTime > 0 ? (
        <div className="hidden lg:flex flex-col w-[280px] flex-shrink-0 justify-between gap-4 py-8 h-full">
          <div className="flex-1" />

          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 ${currentTurn === 'black' && !isGameOver ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(255,165,0,0.15)] scale-105' : 'bg-card border-border opacity-60 scale-95'}`}>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1.5">Orange</span>
            <span className={`text-3xl xl:text-4xl font-mono font-bold tracking-tight ${currentTurn === 'black' && !isGameOver ? 'text-primary' : 'text-muted-foreground'}`}>
              {formatTime(blackTime)}
            </span>
          </div>

          <div className="flex-1" />

          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 ${currentTurn === 'white' && !isGameOver ? 'bg-white/5 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105' : 'bg-card border-border opacity-60 scale-95'}`}>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1.5">White</span>
            <span className={`text-3xl xl:text-4xl font-mono font-bold tracking-tight ${currentTurn === 'white' && !isGameOver ? 'text-foreground' : 'text-muted-foreground'}`}>
              {formatTime(whiteTime)}
            </span>
          </div>

          <div className="flex-1" />
        </div>
      ) : (
        !isReviewPageActive && <div className="hidden lg:block w-[280px] flex-shrink-0" />
      )}

      {/* Mobile Timers Row */}
      {!isReviewPageActive && initialTime > 0 && (
        <div className="flex lg:hidden flex-row gap-4 w-full px-2 mb-4">
          <div className={`p-3 rounded-xl border flex-1 flex flex-col items-center justify-center ${currentTurn === 'black' ? 'bg-primary/10 border-primary/30' : 'bg-card'}`}>
            <span className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Orange</span>
            <span className={`text-2xl font-mono font-bold ${currentTurn === 'black' ? 'text-primary' : 'text-foreground'}`}>{formatTime(blackTime)}</span>
          </div>
          <div className={`p-3 rounded-xl border flex-1 flex flex-col items-center justify-center ${currentTurn === 'white' ? 'bg-white/5 border-white/20' : 'bg-card'}`}>
            <span className="text-[10px] font-mono text-muted-foreground uppercase mb-1">White</span>
            <span className={`text-2xl font-mono font-bold ${currentTurn === 'white' ? 'text-foreground' : 'text-muted-foreground'}`}>{formatTime(whiteTime)}</span>
          </div>
        </div>
      )}

      {/* Board Column - centered via grid */}
      <div className={`flex flex-col items-center relative overflow-visible min-h-0 w-full ${isReviewPageActive ? 'justify-center' : 'justify-start'}`}>

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
                  className="relative overflow-hidden bg-card border border-border rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl w-[92%] max-w-sm mx-4"
                  initial={{ scale: 0.95, y: 10, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setHideWinnerCard(true)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative z-10 flex flex-col items-center w-full min-h-[350px] justify-center">
                    {overlayContent === 'result' && (
                      <>
                        <div className="text-center mt-2 mb-2 w-full animate-in fade-in zoom-in-95 duration-300">
                          <h2 className="text-3xl font-display font-bold text-foreground tracking-tight mb-2 leading-tight">
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
                          <p className="text-sm font-medium text-muted-foreground">
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
                          <div className="col-span-1 flex flex-col items-center justify-center py-3 bg-muted/40 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider mb-1">Moves</span>
                            <span className="text-2xl font-mono font-bold text-foreground">{Math.ceil(moveHistory.length / 2)}</span>
                          </div>
                          <div className="col-span-1 flex flex-col items-center justify-center py-3 bg-muted/40 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider mb-1">Material</span>
                            <span className={`text-2xl font-mono font-bold ${advantage > 0 ? 'text-foreground' : advantage < 0 ? 'text-primary' : 'text-foreground'}`}>
                              {advantage === 0 ? '=' : advantage > 0 ? `+${advantage}` : -advantage}
                            </span>
                          </div>

                          {initialTime > 0 && (
                            <>
                              <div className="col-span-1 flex flex-col items-center justify-center py-3 bg-muted/40 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider mb-1">White</span>
                                <span className={`text-lg font-mono font-bold ${timeoutWinner === 'black' ? 'text-destructive' : 'text-foreground'}`}>{formatTime(whiteTime)}</span>
                              </div>
                              <div className="col-span-1 flex flex-col items-center justify-center py-3 bg-muted/40 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider mb-1">Orange</span>
                                <span className={`text-lg font-mono font-bold ${timeoutWinner === 'white' ? 'text-destructive' : 'text-foreground'}`}>{formatTime(blackTime)}</span>
                              </div>
                            </>
                          )}

                          {mode === 'computer' && (
                            <div className="col-span-2 flex flex-col items-center justify-center py-4 bg-primary/5 rounded-2xl border border-primary/20 shadow-inner mt-2">
                              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider mb-1.5">Rating</span>
                              <span className="text-3xl font-mono font-black text-foreground flex items-baseline gap-2">
                                {userElo}
                                {eloChange !== null && (
                                  <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${eloChange >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'}`}>
                                    {eloChange > 0 ? `+${eloChange}` : eloChange}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex w-full gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                          <motion.button
                            className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm tracking-wide hover:bg-primary/90 transition-all shadow-md"
                            onClick={resetGame}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Play Again
                          </motion.button>

                          <motion.button
                            className="flex-1 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm tracking-wide hover:bg-secondary/80 transition-all"
                            onClick={startFullGameReview}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Game Review
                          </motion.button>
                        </div>
                      </>
                    )}

                    {overlayContent === 'analyzing' && (
                      <div className="flex flex-col items-center justify-center py-8 w-full animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mb-8 shadow-[0_0_15px_rgba(255,165,0,0.2)]" />
                        <h3 className="text-2xl font-display font-bold mb-3 text-foreground tracking-tight">Reviewing Game</h3>
                        <p className="text-sm font-medium text-muted-foreground mb-8 text-center max-w-[250px] leading-relaxed">
                          Stockfish 16 NNUE is calculating match accuracy and best moves...
                        </p>
                        <div className="w-full bg-muted border border-border rounded-full h-3 mb-4 overflow-hidden shadow-inner relative">
                          <div className="absolute inset-y-0 left-0 bg-primary h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,165,0,0.5)]" style={{ width: `${reviewProgress.total > 0 ? (reviewProgress.current / reviewProgress.total) * 100 : 0}%` }}>
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                        <p className="text-xs font-mono font-bold text-muted-foreground/80 tracking-widest">{reviewProgress.current} / {reviewProgress.total} MOVES</p>
                      </div>
                    )}

                    {/* Review overlay has been moved to the side panel */}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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

              {/* Board Container with responsive square dimensions */}
              <motion.div
                layout
                style={{
                  width: isReviewPageActive ? 'min(56vw, calc(100vh - 120px), 700px)' : 'min(98vw, calc(100vh - 100px), 1200px)',
                  height: isReviewPageActive ? 'min(56vw, calc(100vh - 120px), 700px)' : 'min(98vw, calc(100vh - 100px), 1200px)'
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
                            handleSquareClick(target[0], target[1]);
                          }}
                        />
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
      </div>

      {/* Side Panel Score Board */}
      <motion.div
        className={`flex lg:flex w-full ${isReviewPageActive ? 'lg:col-start-2 lg:w-full max-w-[350px] lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto custom-scrollbar' : 'lg:w-[280px]'} flex-col gap-4 lg:self-start transition-all duration-500`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Status */}
        <div className="hidden lg:flex bg-card/50 backdrop-blur-sm shadow-sm rounded-xl p-4 border border-border/60 relative overflow-hidden flex-col gap-2">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="flex justify-between items-center w-full">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Status</p>
            {mode === 'computer' && (
              <p className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 drop-shadow-[0_0_5px_rgba(255,165,0,0.3)]">
                Elo: {userElo}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-3 h-3 rounded-full flex-shrink-0 ${gameStatus === 'check' || gameStatus === 'checkmate'
                ? 'bg-red-500'
                : currentTurn === 'white'
                  ? 'bg-chess-dull'
                  : 'bg-primary'
                }`}
              animate={{
                boxShadow:
                  gameStatus === 'check' || gameStatus === 'checkmate'
                    ? '0 0 14px rgba(239,68,68,0.8)'
                    : currentTurn === 'white'
                      ? '0 0 10px rgba(255, 255, 255, 0.4)'
                      : '0 0 12px hsl(var(--primary) / 0.6)',
              }}
              transition={{ duration: 0.3 }}
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={statusText}
                className={`text-sm font-medium ${statusColor}`}
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
        <div className="flex lg:hidden bg-card/50 backdrop-blur-sm shadow-sm rounded-xl p-3 border border-border/60 relative overflow-hidden flex-row gap-2 items-center justify-between">
          <button
            onClick={() => navigateHistory('prev')}
            disabled={currentViewIndex === 0}
            className="flex-1 p-3 bg-black/20 rounded-lg border border-white/5 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-all flex items-center justify-center shadow-inner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center justify-center w-20 sm:w-24 shrink-0">
            <span className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-widest leading-none mb-1">Move</span>
            <span className="text-base sm:text-lg font-mono font-bold leading-none text-foreground">
              {currentViewIndex === -1 ? moveHistory.length : currentViewIndex} / {moveHistory.length}
            </span>
          </div>
          <button
            onClick={() => navigateHistory('next')}
            disabled={!isViewingHistory}
            className="flex-1 p-3 bg-black/20 rounded-lg border border-white/5 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-all flex items-center justify-center shadow-inner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Review Results Panel - only visible when isReviewPageActive is true */}
        {isReviewPageActive && reviewSummary && (
          <div className="flex flex-col w-full animate-in fade-in slide-in-from-right-8 duration-700 bg-card/60 rounded-2xl border border-border p-4 shadow-xl relative overflow-hidden shrink-0 lg:mt-2">
             <div className="flex items-center justify-center gap-2 mb-5">
               <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,165,0,0.8)]" />
               <h2 className="text-xl font-display font-bold text-foreground uppercase tracking-widest">Match Report</h2>
               <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,165,0,0.8)]" />
             </div>

             <div className="grid grid-cols-2 gap-4 mb-5">
               <div className="flex flex-col items-center bg-card py-4 px-2 rounded-xl border border-border relative overflow-hidden group shadow-sm transition hover:border-primary/50">
                 <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2">White</span>
                 <span className="text-4xl font-display font-black text-foreground drop-shadow-sm mb-1">{reviewSummary.white.accuracy}<span className="text-xl font-medium text-muted-foreground/50">%</span></span>
                 <span className="text-[10px] font-mono text-muted-foreground mt-1 mb-3 uppercase tracking-widest">Accuracy</span>
                 <div className="bg-background/80 w-full px-3 py-1.5 rounded-lg text-center mt-auto border border-border flex justify-between items-center group-hover:border-primary/30 transition-colors">
                   <span className="text-[10px] font-mono text-muted-foreground uppercase">Est. Rating</span>
                   <div className="text-sm font-bold font-mono text-foreground">{reviewSummary.white.estimatedElo}</div>
                 </div>
               </div>
               <div className="flex flex-col items-center bg-card py-4 px-2 rounded-xl border border-border relative overflow-hidden group shadow-sm transition hover:border-orange-500/50">
                 <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2">Orange</span>
                 <span className="text-4xl font-display font-black text-foreground drop-shadow-sm mb-1">{reviewSummary.black.accuracy}<span className="text-xl font-medium text-muted-foreground/50">%</span></span>
                 <span className="text-[10px] font-mono text-muted-foreground mt-1 mb-3 uppercase tracking-widest">Accuracy</span>
                 <div className="bg-background/80 w-full px-3 py-1.5 rounded-lg text-center mt-auto border border-border flex justify-between items-center group-hover:border-orange-500/30 transition-colors">
                   <span className="text-[10px] font-mono text-muted-foreground uppercase">Est. Rating</span>
                   <div className="text-sm font-bold font-mono text-primary/90">{reviewSummary.black.estimatedElo}</div>
                 </div>
               </div>
             </div>

             <div className="bg-background/80 border border-border rounded-xl p-3 mb-4 w-full shadow-sm">
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
                       <span className="text-[11px] font-bold uppercase tracking-wide text-foreground">{row.label}</span>
                       <span className="text-sm font-mono font-bold text-foreground">{row.wVal}</span>
                     </div>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border mx-2 shrink-0 ${isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-primary/10 border-primary/30 text-primary'}`}>
                       {row.icon}
                     </div>
                     <div className="flex items-center justify-between px-2">
                       <span className="text-[11px] font-bold uppercase tracking-wide text-primary">{row.label}</span>
                       <span className="text-sm font-mono font-bold text-primary">{row.bVal}</span>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        <div className={`hidden lg:flex flex-col gap-3 ${isReviewPageActive ? 'w-full' : 'w-full max-w-[280px]'}`}>
        {/* Captured Pieces */}
        <div className="hidden lg:flex bg-card/50 backdrop-blur-sm shadow-sm rounded-xl p-4 border border-border/60 flex-col">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Material Score</p>
          <div className="space-y-4 text-sm font-mono">
            <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-black/10 border border-white/5">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-foreground">White Cap.</p>
                <div className="text-xs text-muted-foreground/60">+{whiteScore} pts</div>
              </div>
              <CapturedRow pieces={displayCaptured.white} advantage={advantage > 0 ? advantage : undefined} />
            </div>
            <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-black/10 border border-white/5">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-primary">Orange Cap.</p>
                <div className="text-xs text-muted-foreground/60">+{blackScore} pts</div>
              </div>
              <CapturedRow pieces={displayCaptured.black} advantage={advantage < 0 ? -advantage : undefined} />
            </div>
          </div>
        </div>

        {/* Coach Analysis panel */}
        <div className="hidden lg:flex bg-card/50 backdrop-blur-sm shadow-sm rounded-xl p-4 border border-border/60 relative overflow-hidden flex-col gap-2 shrink-0">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest px-1 mb-1">Coach Analysis</p>
          {(isViewingHistory || isGameOver) ? (
            moveAnalyses[currentViewIndex] ? (
              <div className="flex flex-col gap-2 relative z-10 px-1">
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-bold uppercase tracking-wider ${moveAnalyses[currentViewIndex].classification === 'blunder' ? 'text-red-500' : moveAnalyses[currentViewIndex].classification === 'best' || moveAnalyses[currentViewIndex].classification === 'great' || moveAnalyses[currentViewIndex].classification === 'brilliant' ? 'text-chess-bright' : 'text-primary'}`}>
                    {moveAnalyses[currentViewIndex].classification || 'Good'} Move
                  </span>
                  <span className="font-mono bg-black/40 px-2.5 py-1 rounded-md text-white/80 shadow-inner">
                    Eval: {moveAnalyses[currentViewIndex].eval.mate !== null ? `M${moveAnalyses[currentViewIndex].eval.mate}` : (moveAnalyses[currentViewIndex].eval.evaluation > 0 ? '+' : '') + moveAnalyses[currentViewIndex].eval.evaluation.toFixed(2)}
                  </span>
                </div>
                {moveAnalyses[currentViewIndex].coachComment && (
                  <p className="text-sm text-muted-foreground/90 leading-relaxed mt-1">
                    {moveAnalyses[currentViewIndex].coachComment}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 px-1 py-2">
                <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground/70 tracking-wide font-medium">Analyzing engine data...</p>
              </div>
            )
          ) : (
            <p className="text-sm text-muted-foreground/50 px-1 italic">Use the Review mode after the game to analyze your moves against Stockfish 16.</p>
          )}
        </div>

        {/* Move History */}
        <div className="hidden lg:flex bg-card/50 backdrop-blur-sm shadow-sm rounded-xl p-4 border border-border/60 flex-col flex-1 min-h-[150px] max-h-[250px] lg:max-h-[300px]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest pl-1">
              Move History
              {moveHistory.length > 0 && <span className="ml-2 opacity-50 font-bold">({moveHistory.length})</span>}
            </p>
            <div className="flex items-center gap-1 bg-black/20 rounded-lg p-0.5 border border-white/5">
              <button
                onClick={() => navigateHistory('prev')}
                disabled={currentViewIndex === 0}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateHistory('next')}
                disabled={!isViewingHistory}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <AnimatePresence>
              {moveHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center pb-4">
                  <p className="text-sm text-muted-foreground/30 italic">No moves played</p>
                </div>
              ) : (
                Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`flex items-center gap-2 text-xs font-mono p-1 rounded hover:bg-white/5 transition-colors ${!isViewingHistory && i === Math.floor((moveHistory.length - 1) / 2) ? 'bg-primary/10 border border-primary/20' : ''
                      }`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span className="text-muted-foreground/40 w-5 text-right flex-shrink-0">{i + 1}.</span>
                    <span className="text-chess-bright flex-1 truncate font-semibold ml-1">{moveHistory[i * 2]}</span>
                    {moveHistory[i * 2 + 1] ? (
                      <span className="text-chess-dull flex-1 truncate font-semibold">{moveHistory[i * 2 + 1]}</span>
                    ) : (
                      <span className="flex-1" />
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Game Actions */}
        {isGameOver ? (
          <motion.button
            className="w-full py-3.5 rounded-xl bg-secondary/80 text-secondary-foreground font-semibold text-sm tracking-wide hover:bg-secondary transition-all duration-200 border border-border shadow-sm group relative overflow-hidden"
            onClick={resetGame}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 group-hover:text-primary transition-colors">Start New Game</span>
          </motion.button>
        ) : (
          <div className="flex gap-3 w-full">
            <motion.button
              className="flex-1 py-3.5 rounded-xl bg-red-500/10 text-red-500 font-semibold text-sm tracking-wide hover:bg-red-500/20 transition-all duration-200 border border-red-500/20 shadow-sm transition-colors"
              onClick={() => { setGameStatus('resigned'); }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Resign
            </motion.button>
            <motion.button
              className="flex-1 py-3.5 rounded-xl bg-secondary/80 text-secondary-foreground font-semibold text-sm tracking-wide hover:bg-secondary transition-all duration-200 border border-border shadow-sm transition-colors"
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
  if (pieces.length === 0) return <div className="text-muted-foreground/30 italic leading-none">None</div>;

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className={`text-sm leading-none ${p.color !== 'white' ? 'text-chess-bright/60' : 'text-chess-dull/60'}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: i * 0.03 }}
          title={label}
        >
          {getPieceSymbol(p.type)}
        </motion.span>
      ))}
      {advantage !== undefined && advantage > 0 && (
        <span className="ml-2 text-xs font-mono text-muted-foreground/50">+{advantage}</span>
      )}
    </div>
  );
}

export default ChessBoard;
