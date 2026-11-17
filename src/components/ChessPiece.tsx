import { Piece, getPieceSymbol } from '@/lib/chess';
import { useState, useCallback, memo, useRef, useEffect } from 'react';

interface ChessPieceProps {
  piece: Piece;
  isSelected: boolean;
  canDrag: boolean;
  position: [number, number];
  onClick: () => void;
  onDrop?: (source: [number, number], target: [number, number]) => void;
  animatingFrom?: [number, number] | null;
  isFlipped?: boolean;
}

const ChessPiece = memo(({
  piece,
  isSelected,
  canDrag,
  position,
  onClick,
  onDrop,
  animatingFrom,
  isFlipped = false,
}: ChessPieceProps) => {
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

  const scaleClass = piece.type === 'queen' || piece.type === 'king'
    ? 'scale-[1.15]'
    : piece.type === 'knight' || piece.type === 'pawn'
      ? 'scale-110'
      : '';

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!canDrag || e.button !== 0) return;

    const el = e.currentTarget as HTMLElement;
    try {
      el.setPointerCapture(e.pointerId);
    } catch (_) {}

    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;
    let dragClone: HTMLElement | null = null;
    const squareSize = rect.width;

    // Immediately trigger selection for instant visual feedback on click/drag
    onClickRef.current();

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        hasMoved = true;
        setIsDragging(true);

        // Create a dedicated GPU-accelerated clone for dragging (no container-query overhead)
        dragClone = document.createElement('div');
        dragClone.className = `fixed pointer-events-none flex items-center justify-center select-none ${
          !isWhite ? 'text-chess-bright piece-bright' : 'text-chess-dull piece-dull'
        } ${scaleClass}`;
        dragClone.style.width = `${squareSize}px`;
        dragClone.style.height = `${squareSize}px`;
        dragClone.style.left = '0px';
        dragClone.style.top = '0px';
        dragClone.style.fontSize = `${squareSize * 0.75}px`;
        dragClone.style.lineHeight = '1';
        dragClone.style.zIndex = '99999';
        dragClone.style.filter = 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))';
        dragClone.style.textShadow = !isWhite
          ? '0 0 24px hsl(25 90% 55% / 0.7)'
          : '0 0 20px rgba(255, 255, 255, 0.7)';
        dragClone.style.willChange = 'transform';

        const isMobile = window.innerWidth < 768;
        dragClone.innerText = (isMobile && piece.type === 'queen') ? '♕' : getPieceSymbol(piece.type);
        document.body.appendChild(dragClone);
      }

      if (hasMoved && dragClone) {
        // Pure GPU translate3d — eliminates reflow/layout thrashing entirely
        dragClone.style.transform = `translate3d(${moveEvent.clientX - squareSize / 2}px, ${moveEvent.clientY - squareSize / 2}px, 0) scale(1.12)`;
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      try {
        el.releasePointerCapture(upEvent.pointerId);
      } catch (_) {}

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
  }, [canDrag, position, isWhite, piece.type, scaleClass]);

  // Compute slide distance relative to destination square (taking orientation into account)
  const deltaColRaw = animatingFrom ? animatingFrom[1] - position[1] : 0;
  const deltaRowRaw = animatingFrom ? animatingFrom[0] - position[0] : 0;
  const deltaCol = isFlipped ? -deltaColRaw : deltaColRaw;
  const deltaRow = isFlipped ? -deltaRowRaw : deltaRowRaw;
  const isSliding = deltaCol !== 0 || deltaRow !== 0;

  return (
    <div
      className={`relative flex items-center justify-center w-full h-full select-none outline-none ${
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${isSliding ? 'piece-slide-anim' : ''}`}
      style={{
        '--slide-x': `${deltaCol * 100}%`,
        '--slide-y': `${deltaRow * 100}%`,
        zIndex: isDragging ? 100 : (isSelected ? 40 : (isSliding ? 30 : 10)),
        touchAction: 'none',
        opacity: isDragging ? 0.35 : 1,
      } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onClick={!canDrag ? onClick : undefined}
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
    </div>
  );
});

ChessPiece.displayName = 'ChessPiece';

export default ChessPiece;
