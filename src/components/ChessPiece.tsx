import { motion } from 'framer-motion';
import { Piece, getPieceSymbol } from '@/lib/chess';
import { useState, memo } from 'react';

interface ChessPieceProps {
  piece: Piece;
  isSelected: boolean;
  canDrag: boolean;
  position: [number, number];
  onClick: () => void;
  onDrop?: (source: [number, number], target: [number, number]) => void;
}

const ChessPiece = memo(({ piece, isSelected, canDrag, position, onClick, onDrop }: ChessPieceProps) => {
  const isWhite = piece.color === 'white';
  const [isDragging, setIsDragging] = useState(false);


  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    // Use motion's info.point which is more reliable than raw event coordinates
    const { x, y } = info.point;
    
    if (x && y) {
      const element = document.elementFromPoint(x, y);
      const square = element?.closest('.chess-square');
      const targetPosString = square?.getAttribute('data-position');
      
      if (targetPosString && onDrop) {
        const targetPos = targetPosString.split(',').map(Number) as [number, number];
        if (targetPos[0] !== position[0] || targetPos[1] !== position[1]) {
          onDrop(position, targetPos);
        }
      }
    }
  };

  return (
    <motion.div
      layoutId={piece.id}
      layout
      drag={canDrag}
      dragSnapToOrigin
      dragElastic={0}
      dragMomentum={false}
      onDragStart={() => {
        setIsDragging(true);
        onClick();
      }}
      onDragEnd={handleDragEnd}
      className={`relative flex items-center justify-center w-full h-full select-none outline-none ${
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      }`}
      style={{ 
        zIndex: isDragging ? 100 : (isSelected ? 40 : 10),
        touchAction: 'none',
        pointerEvents: isDragging ? 'none' : 'auto' 
      }}
      initial={false}
      animate={{
        scale: isDragging ? 1.05 : isSelected ? 1.05 : 1,
        opacity: 1,
      }}
      transition={{
        scale: {
          type: 'tween',
          duration: 0.1, // Near-instant 100ms tween for predictable lightning speed
        },
        layout: {
          type: 'spring',
          stiffness: 3000, // Maximum stiffness for near-teleportation
          damping: 80,
          mass: 0.2
        }
      }}
      whileHover={canDrag ? { scale: 1.02 } : {}}
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
});

ChessPiece.displayName = 'ChessPiece';

export default ChessPiece;
