import { Piece, getPieceSymbol } from '@/lib/chess';
import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChessPieceProps {
  piece: Piece;
  isSelected: boolean;
  canDrag: boolean;
  position: [number, number];
  onClick: () => void;
  onDrop?: (source: [number, number], target: [number, number]) => void;
  shouldAnimate?: boolean;
}

const ChessPiece = memo(({ piece, isSelected, canDrag, position, onClick, onDrop, shouldAnimate }: ChessPieceProps) => {
  const isWhite = piece.color === 'white';
  const [isDragging, setIsDragging] = useState(false);

  // Keep latest callbacks in refs to avoid stale closures in event listeners
  const onClickRef = useRef(onClick);
  const onDropRef = useRef(onDrop);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    onDropRef.current = onDrop;
  }, [onDrop]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!canDrag) return;

    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    
    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;
    let dragClone: HTMLElement | null = null;
    
    const squareSize = rect.width;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!hasMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        hasMoved = true;
        setIsDragging(true);
        
        // Create a lightweight clone for dragging
        dragClone = el.cloneNode(true) as HTMLElement;
        dragClone.style.position = 'fixed';
        dragClone.style.width = `${squareSize}px`;
        dragClone.style.height = `${squareSize}px`;
        dragClone.style.pointerEvents = 'none';
        dragClone.style.zIndex = '10000';
        dragClone.style.transform = 'scale(1.08)';
        dragClone.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))';
        dragClone.style.willChange = 'left, top';
        dragClone.style.transition = 'none';
        dragClone.style.containerType = 'inline-size';
        document.body.appendChild(dragClone);
        
        // Select the piece on drag start
        onClickRef.current();
      }

      if (hasMoved && dragClone) {
        dragClone.style.left = `${moveEvent.clientX - squareSize / 2}px`;
        dragClone.style.top = `${moveEvent.clientY - squareSize / 2}px`;
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      
      if (dragClone) {
        dragClone.remove();
        dragClone = null;
      }

      setIsDragging(false);
      
      if (hasMoved && onDropRef.current) {
        const dropElement = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
        const square = dropElement?.closest('.chess-square');
        const targetPosString = square?.getAttribute('data-position');
        
        if (targetPosString) {
          const targetPos = targetPosString.split(',').map(Number) as [number, number];
          if (targetPos[0] !== position[0] || targetPos[1] !== position[1]) {
            onDropRef.current(position, targetPos);
          }
        }
      }
    };

    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
  }, [canDrag, position]);

  const scaleClass = piece.type === 'queen' || piece.type === 'king'
    ? 'scale-[1.15]'
    : piece.type === 'knight' || piece.type === 'pawn'
      ? 'scale-110'
      : '';

  return (
    <div
      className={`relative flex items-center justify-center w-full h-full select-none outline-none ${
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      }`}
      style={{
        zIndex: isDragging ? 100 : (isSelected ? 40 : 10),
        touchAction: 'none',
        opacity: isDragging ? 0.35 : 1,
        transition: 'none',
      }}
      onPointerDown={handlePointerDown}
      onClick={!canDrag ? onClick : undefined}
    >
      <motion.div
        layoutId={shouldAnimate ? piece.id : undefined}
        transition={{
          type: 'tween',
          duration: 0.15,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="w-full h-full flex items-center justify-center"
      >
        <span
          className={`inline-block leading-none ${!isWhite ? 'text-chess-bright piece-bright' : 'text-chess-dull piece-dull'
            } ${isSelected ? 'drop-shadow-lg' : ''} ${scaleClass}`}
          style={{
            textShadow: isSelected
              ? !isWhite
                ? '0 0 20px hsl(25 90% 55% / 0.6)'
                : '0 0 16px rgba(255, 255, 255, 0.6)'
              : 'none',
            fontSize: '75cqw',
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
    </div>
  );
});

ChessPiece.displayName = 'ChessPiece';

export default ChessPiece;
