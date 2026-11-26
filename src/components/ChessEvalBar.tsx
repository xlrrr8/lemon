import React from 'react';
import { motion } from 'framer-motion';

interface ChessEvalBarProps {
  evaluation?: number | null; // In centipawns or pawns (e.g. +1.5, -0.4)
  mate?: number | null;       // Mate in N moves (e.g. 2, -3)
  isFlipped?: boolean;
}

export const ChessEvalBar: React.FC<ChessEvalBarProps> = ({
  evaluation = 0,
  mate = null,
  isFlipped = false,
}) => {
  // Compute white win percentage (0 to 100) using the standard Lichess sigmoid function:
  // winPercent = 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
  let whitePercent = 50;
  let label = '0.0';

  if (mate !== null && mate !== undefined) {
    if (mate > 0) {
      whitePercent = 100;
      label = `M${mate}`;
    } else {
      whitePercent = 0;
      label = `-M${Math.abs(mate)}`;
    }
  } else if (typeof evaluation === 'number') {
    // If evaluation is in pawns (e.g. 1.5), convert to centipawns for formula
    const cp = Math.abs(evaluation) < 30 ? evaluation * 100 : evaluation;
    const clampedCp = Math.max(-1000, Math.min(1000, cp));
    whitePercent = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clampedCp)) - 1);
    whitePercent = Math.max(3, Math.min(97, whitePercent));
    
    const displayScore = Math.abs(evaluation) < 30 ? evaluation : evaluation / 100;
    label = displayScore > 0 ? `+${displayScore.toFixed(1)}` : displayScore.toFixed(1);
    if (label === '-0.0') label = '0.0';
  }

  // If flipped, top is White and bottom is Black; otherwise top is Black and bottom is White
  const topPercent = isFlipped ? whitePercent : (100 - whitePercent);

  return (
    <div className="relative flex flex-col items-center w-8 sm:w-9 h-full min-h-[300px] rounded-xl overflow-hidden border border-white/15 skeuo-inner shadow-xl select-none">
      {/* Top section (Black by default, White if flipped) */}
      <motion.div
        className="w-full bg-zinc-900 flex items-start justify-center pt-2.5 transition-all duration-500 ease-out"
        style={{ height: `${topPercent}%` }}
      >
        {topPercent > 18 && (
          <span className="text-xs font-mono font-bold text-zinc-300 select-none">
            {isFlipped ? (label.startsWith('+') ? label : '') : (label.startsWith('-') ? label : '')}
          </span>
        )}
      </motion.div>

      {/* Thin accent divider line */}
      <div className="w-full h-0.5 bg-primary/70 z-10" />

      {/* Bottom section (White by default, Black if flipped) */}
      <motion.div
        className="w-full bg-zinc-200 flex items-end justify-center pb-2.5 transition-all duration-500 ease-out"
        style={{ height: `${100 - topPercent}%` }}
      >
        {(100 - topPercent) > 18 && (
          <span className="text-xs font-mono font-bold text-zinc-900 select-none">
            {isFlipped ? (label.startsWith('-') ? label : '') : (label.startsWith('+') ? label : (label === '0.0' ? '0.0' : ''))}
          </span>
        )}
      </motion.div>
    </div>
  );
};

