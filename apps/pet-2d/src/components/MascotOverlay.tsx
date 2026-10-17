import React, { useState, useEffect } from 'react';
import { PetConfig, PetTelemetry } from '../types/pet';
import { usePetPhysics } from '../hooks/use-pet-physics';
import { useSpriteAnimation } from '../hooks/use-sprite-animation';
import { PetView } from './PetView';
import { PetContextMenu } from './PetContextMenu';
import { petApi, DEFAULT_CONFIG } from '../services/pet-api';
import { listen, emit } from '@tauri-apps/api/event';

export function MascotOverlay() {
  const [config, setConfig] = useState<PetConfig>(DEFAULT_CONFIG);
  const [customSpriteUrls, setCustomSpriteUrls] = useState<string[] | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Core physics & movement hooks
  const { state, direction, handleDragStart, handleDragEnd, resetToCenter } = usePetPhysics({
    config,
  });

  const { spriteSrc } = useSpriteAnimation({
    state,
    customSpriteUrls,
  });

  // Load initial settings and listen to updates from Dashboard
  useEffect(() => {
    let mounted = true;

    petApi.loadSettings().then((saved) => {
      if (!mounted) return;
      setConfig(saved);
      loadPetSprites(saved.activePetId);
    });

    const unlistenConfig = listen<PetConfig>('pet-config-updated', (event) => {
      setConfig(event.payload);
      loadPetSprites(event.payload.activePetId);
    });

    const unlistenAction = listen<string>('pet-action', (event) => {
      if (event.payload === 'center') {
        resetToCenter();
      }
    });

    return () => {
      mounted = false;
      unlistenConfig.then((fn) => fn());
      unlistenAction.then((fn) => fn());
    };
  }, [resetToCenter]);

  // Load custom sprites when activePetId changes
  const loadPetSprites = async (petId: string) => {
    if (petId === 'anya' || petId === 'neko' || petId === 'miku') {
      setCustomSpriteUrls(null);
      return;
    }
    const library = await petApi.getPetLibrary();
    const found = library.find((p) => p.id === petId);
    if (found?.folderPath) {
      const files = await petApi.scanShimejiFolder(found.folderPath);
      setCustomSpriteUrls(files);
    }
  };

  // Broadcast telemetry to Dashboard (10 times/sec)
  useEffect(() => {
    const timer = setInterval(() => {
      petApi.getPetPosition().then(([x, y]) => {
        const telemetry: PetTelemetry = {
          state,
          x,
          y,
          direction,
        };
        emit('pet-telemetry', telemetry).catch(() => {});
      });
    }, 120);

    return () => clearInterval(timer);
  }, [state, direction]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleOpenDashboard = async () => {
    await petApi.showDashboardWindow();
  };

  const handleCloseOverlay = async () => {
    await petApi.closePetWindow();
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-transparent">
      {/* 2D Mascot View */}
      <PetView
        spriteSrc={spriteSrc}
        state={state}
        direction={direction}
        scale={config.scale}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onContextMenu={handleContextMenu}
      />

      {/* Right-click Context Menu */}
      {contextMenu && (
        <PetContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          config={config}
          onUpdateConfig={(updater) => {
            setConfig((prev) => {
              const next = updater(prev);
              petApi.saveSettings(next);
              emit('pet-config-updated', next).catch(() => {});
              return next;
            });
          }}
          onResetPosition={resetToCenter}
          onOpenCustomPack={handleOpenDashboard}
          onCloseApp={handleCloseOverlay}
          onDismiss={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
