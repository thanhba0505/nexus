import React from 'react';
import { PetState, PetDirection, PetScale, PET_DIRECTION } from '../types/pet';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface PetViewProps {
  spriteSrc: string;
  state: PetState;
  direction: PetDirection;
  scale: PetScale;
  onDragStart: () => void;
  onDragEnd: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function PetView({
  spriteSrc,
  state: _state,
  direction,
  scale,
  onDragStart,
  onDragEnd,
  onContextMenu,
}: PetViewProps) {
  // Base size
  const baseSize = 120 * scale;

  const handleMouseDown = async (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click -> start dragging
      onDragStart();
      try {
        const win = getCurrentWindow();
        await win.startDragging();
      } catch {
        // Fallback in web browser mode
      }
    }
  };

  const handleMouseUp = () => {
    onDragEnd();
  };

  return (
    <div
      className="relative flex items-center justify-center w-full h-full select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={onContextMenu}
    >
      <img
        src={spriteSrc}
        alt="2D Pet"
        draggable={false}
        style={{
          width: `${baseSize}px`,
          height: `${baseSize}px`,
          transform: direction === PET_DIRECTION.LEFT ? 'scaleX(-1)' : 'none',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
        }}
        className="transition-transform duration-75 pointer-events-auto"
      />
    </div>
  );
}
