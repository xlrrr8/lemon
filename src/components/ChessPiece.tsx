import { motion } from 'framer-motion';
import { Piece, getPieceSymbol } from '@/lib/chess';
import { useState } from 'react';

interface ChessPieceProps {
  piece: Piece;
  isSelected: boolean;
  canDrag: boolean;
  position: [number, number];
  onClick: () => void;
}

const ChessPiece = ({ piece, isSelected, canDrag, position, onClick }: ChessPieceProps) => {
  const isWhite = piece.color === 'white';
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: any) => {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', position.join(','));
    }

    // Select the piece right as we start dragging
    onClick();

    // Hide the original element *after* the browser takes the drag snapshot
    // This removes the physical piece from its start location while we move the invisible ghost
    setTimeout(() => {
      setIsDragging(true);
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`relative flex items-center justify-center w-full h-full select-none outline-none ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        }`}
      style={{ zIndex: isSelected ? 40 : 10 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isSelected ? 1.15 : 1,
        opacity: isDragging ? 0 : 1,
      }}
      transition={{
        scale: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        },
        opacity: { duration: isDragging ? 0 : 0.2 }
      }}
      whileHover={canDrag ? { scale: 1.08 } : {}}
      whileTap={canDrag ? { scale: 0.95 } : {}}
    >
      <span
        className={`inline-block leading-none ${!isWhite ? 'text-chess-bright piece-bright' : 'text-chess-dull piece-dull'
          } ${isSelected ? 'drop-shadow-lg' : ''}`}
        style={{
          textShadow: isSelected
            ? !isWhite
              ? '0 0 20px hsl(25 90% 55% / 0.6)'
              : '0 0 16px rgba(255, 255, 255, 0.6)'
            : 'none',
          fontSize: '75cqw',
          transform: piece.type === 'queen' || piece.type === 'king' ? 'scale(1.15)' : piece.type === 'knight' ? 'scale(1.1)' : piece.type === 'pawn' ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {piece.type === 'queen' ? (
          <>
            <span className="hidden md:inline">{getPieceSymbol(piece.type)}</span>
            <span className="md:hidden">♕</span>
          </>
        ) : (
          getPieceSymbol(piece.type)
        )}
      </span>
    </motion.div>
  );
};

export default ChessPiece;
