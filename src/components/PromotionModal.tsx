import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieceColor, PieceType, getPieceSymbol } from '@/lib/chess';

interface PromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (pieceType: PieceType) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  color,
  onSelect,
  onCancel,
}) => {
  if (!isOpen) return null;

  const pieces: PieceType[] = ['queen', 'knight', 'rook', 'bishop'];

  return (
    <AnimatePresence>
      <div
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xl flex flex-col items-center gap-4 max-w-xs mx-4"
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
            Promote Pawn
          </span>

          <div className="flex gap-2.5">
            {pieces.map((type) => (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all duration-150 border ${
                  color === 'white'
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700'
                    : 'bg-primary/10 hover:bg-primary/20 text-chess-bright border-primary/30 shadow-[0_0_12px_rgba(255,165,0,0.2)]'
                } hover:scale-110 active:scale-95`}
              >
                {getPieceSymbol(type)}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground/60 italic text-center">
            Click outside to cancel move
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

