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
          className="skeuo-panel rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-xs mx-4 border border-white/15"
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm font-display font-bold uppercase tracking-wider text-foreground">
            Promote Pawn
          </span>

          <div className="flex gap-3">
            {pieces.map((type) => (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all duration-150 skeuo-btn ${
                  color === 'white'
                    ? 'text-zinc-100 hover:text-white'
                    : 'text-chess-bright hover:border-primary/60'
                } hover:scale-110 active:scale-95`}
              >
                {getPieceSymbol(type)}
              </button>
            ))}
          </div>

          <p className="text-xs font-medium text-muted-foreground/80 italic text-center">
            Click outside to cancel move
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

