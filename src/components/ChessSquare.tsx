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
        <div className="absolute inset-0 bg-primary/30 border-2 border-primary pointer-events-none z-10" />
      )}

      {/* Valid move indicator */}
      {isValidMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {piece ? (
            // Capture ring (minimal matte orange)
            <div className="w-[84%] h-[84%] rounded-full border-[4px] border-primary/70" />
          ) : (
            // Move dot (minimal matte orange)
            <div className="w-[26%] h-[26%] rounded-full bg-primary/70" />
          )}
        </div>
      )}

      {/* King in check red outline */}
      {isKingInCheck && (
        <div className="absolute inset-0 bg-red-500/25 border-2 border-red-500 pointer-events-none z-10 rounded-sm" />
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
