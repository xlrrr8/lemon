import React from 'react';
import { Piece, Position, PieceColor } from '@/lib/chess';
import ChessPiece from './ChessPiece';

interface ChessSquareProps {
  piece: Piece | null;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  isKingInCheck: boolean;
  position: Position;
  onClick: () => void;
  canDragPiece?: boolean;
  onDropPosition?: (source: Position, target: Position) => void;
  currentTurn: PieceColor;
  animatingFrom?: Position | null;
  isFlipped?: boolean;
}

const ChessSquare = React.memo(({
  piece,
  isLight,
  isSelected,
  isValidMove,
  isLastMove,
  isKingInCheck,
  position,
  onClick,
  canDragPiece,
  onDropPosition,
  currentTurn,
  animatingFrom,
  isFlipped,
}: ChessSquareProps) => {
  const baseColor = isLight ? 'bg-chess-light' : 'bg-chess-dark';

  return (
    <div
      data-position={position.join(',')}
      className={`chess-square relative aspect-square flex items-center justify-center cursor-pointer ${baseColor}`}
      onClick={onClick}
    >
      {/* Last move highlight */}
      {isLastMove && !isSelected && (
        <div className={`absolute inset-0 ${currentTurn === 'white' ? 'bg-primary/20' : 'bg-white/10'} pointer-events-none`} />
      )}

      {/* Selected highlight */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/30 pointer-events-none z-10" />
      )}

      {/* Valid move indicator */}
      {isValidMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {piece ? (
            // Capture ring
            <div className="w-[88%] h-[88%] rounded-full border-[6px] border-primary/40" />
          ) : (
            // Move dot
            <div className="w-[28%] h-[28%] rounded-full bg-primary/40 shadow-[0_0_10px_rgba(255,165,0,0.2)]" />
          )}
        </div>
      )}

      {/* King in check red outline */}
      {isKingInCheck && (
        <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(239,68,68,0.8)] animate-pulse pointer-events-none z-10 rounded-sm" />
      )}

      {piece && (
        <div className="relative w-full h-full flex items-center justify-center" style={{ containerType: 'inline-size' }}>
          <ChessPiece
            piece={piece}
            isSelected={isSelected}
            canDrag={!!canDragPiece}
            position={position}
            onClick={onClick}
            onDrop={onDropPosition}
            animatingFrom={animatingFrom}
            isFlipped={isFlipped}
          />
        </div>
      )}
    </div>
  );
});

ChessSquare.displayName = 'ChessSquare';

export default ChessSquare;
