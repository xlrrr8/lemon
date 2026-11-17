import React from 'react';
import { Position } from '@/lib/chess';

export interface ArrowAnnotation {
  from: Position; // [row, col]
  to: Position;   // [row, col]
}

interface ChessArrowsProps {
  arrows: ArrowAnnotation[];
  highlights: Position[]; // Array of [row, col]
  isFlipped?: boolean;
}

export const ChessArrows: React.FC<ChessArrowsProps> = ({
  arrows,
  highlights,
  isFlipped = false,
}) => {
  if (arrows.length === 0 && highlights.length === 0) return null;

  // Convert row, col to percentages (center of square)
  const getCoords = (pos: Position) => {
    const r = isFlipped ? 7 - pos[0] : pos[0];
    const c = isFlipped ? 7 - pos[1] : pos[1];
    return {
      x: (c + 0.5) * 12.5, // 100% / 8 = 12.5%
      y: (r + 0.5) * 12.5,
    };
  };

  const getSquareTopLeft = (pos: Position) => {
    const r = isFlipped ? 7 - pos[0] : pos[0];
    const c = isFlipped ? 7 - pos[1] : pos[1];
    return {
      x: c * 12.5,
      y: r * 12.5,
    };
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
      viewBox="0 0 100 100"
    >
      <defs>
        <marker
          id="arrow-head-primary"
          markerWidth="4"
          markerHeight="4"
          refX="2.5"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0.5, 3.5 2, 0 3.5" fill="hsl(25 90% 55% / 0.85)" />
        </marker>
      </defs>

      {/* Square highlights */}
      {highlights.map(([r, c], idx) => {
        const { x, y } = getSquareTopLeft([r, c]);
        return (
          <rect
            key={`highlight-${r}-${c}-${idx}`}
            x={x}
            y={y}
            width={12.5}
            height={12.5}
            fill="hsl(25 90% 55% / 0.28)"
            stroke="hsl(25 90% 55% / 0.6)"
            strokeWidth="0.5"
            rx="0.5"
          />
        );
      })}

      {/* Tactical arrows */}
      {arrows.map((arrow, idx) => {
        const start = getCoords(arrow.from);
        const end = getCoords(arrow.to);

        // Shorten the arrow end slightly so marker doesn't overshoot
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;

        const shorten = 3.5; // percent offset
        const targetX = end.x - (dx / length) * shorten;
        const targetY = end.y - (dy / length) * shorten;

        return (
          <g key={`arrow-${idx}`}>
            <line
              x1={start.x}
              y1={start.y}
              x2={targetX}
              y2={targetY}
              stroke="hsl(25 90% 55% / 0.85)"
              strokeWidth="2.2"
              strokeLinecap="round"
              markerEnd="url(#arrow-head-primary)"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
            />
          </g>
        );
      })}
    </svg>
  );
};

