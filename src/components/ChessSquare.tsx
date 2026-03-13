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
}: ChessSquareProps) => {
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const baseColor = isLight ? 'bg-chess-light' : 'bg-chess-dark';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = 'move';
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    const [fromRow, fromCol] = data.split(',').map(Number);
    if (!isNaN(fromRow) && !isNaN(fromCol) && onDropPosition) {
      onDropPosition([fromRow, fromCol], position);
    }
  };

  return (
    <div
      data-position={position.join(',')}
      className={`chess-square relative aspect-square flex items-center justify-center cursor-pointer ${baseColor} ${isDraggingOver ? 'brightness-125 scale-[0.98] z-30' : ''} hover:brightness-105 transition-none`}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Last move highlight */}
      {isLastMove && !isSelected && (
        <div className={`absolute inset-0 ${currentTurn === 'white' ? 'bg-primary/20' : 'bg-white/10'} pointer-events-none transition-none`} />
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
        <div className="relative w-full h-full pointer-events-none flex items-center justify-center">
          <div className="w-full h-full pointer-events-auto">
            <ChessPiece
              piece={piece}
              isSelected={isSelected}
              canDrag={!!canDragPiece}
              position={position}
              onClick={onClick}
              onDrop={onDropPosition}
            />
          </div>
        </div>
      )}
    </div>
  );
});

ChessSquare.displayName = 'ChessSquare';

export default ChessSquare;
