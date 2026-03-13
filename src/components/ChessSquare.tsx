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
}

const ChessSquare = ({
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
}: ChessSquareProps) => {
  const baseColor = isLight ? 'bg-chess-light' : 'bg-chess-dark';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    const [fromRow, fromCol] = data.split(',').map(Number);
    if (!isNaN(fromRow) && !isNaN(fromCol) && onDropPosition) {
      onDropPosition([fromRow, fromCol], position);
    }
  };

  return (
    <div
      className={`chess-square relative aspect-square flex items-center justify-center cursor-pointer transition-colors duration-150 ${baseColor}`}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Last move highlight */}
      {isLastMove && !isSelected && (
        <div className={`absolute inset-0 ${currentTurn === 'white' ? 'bg-chess-selected/15' : 'bg-white/10'} pointer-events-none`} />
      )}

      {/* Selected highlight */}
      {isSelected && (
        <div className={`absolute inset-0 ${piece?.color === 'black' ? 'bg-chess-selected/30' : 'bg-white/20'} pointer-events-none`} />
      )}

      {/* Valid move indicator */}
      {isValidMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {piece ? (
            // Capture ring
            <div className={`w-[85%] h-[85%] rounded-full border-4 ${currentTurn === 'black' ? 'border-chess-valid-move/60' : 'border-white/50'}`} />
          ) : (
            // Move dot
            <div className={`w-[25%] h-[25%] rounded-full ${currentTurn === 'black' ? 'bg-chess-valid-move/60' : 'bg-white/50'}`} />
          )}
        </div>
      )}

      {/* King in check red outline */}
      {isKingInCheck && (
        <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(239,68,68,0.8)] animate-pulse pointer-events-none z-10 rounded-sm" />
      )}

      {piece && (
        <div className="relative w-full h-full pointer-events-none flex items-center justify-center">
          <div className="w-full h-full pointer-events-auto">
            <ChessPiece
              piece={piece}
              isSelected={isSelected}
              canDrag={!!canDragPiece}
              position={position}
              onClick={onClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessSquare;
