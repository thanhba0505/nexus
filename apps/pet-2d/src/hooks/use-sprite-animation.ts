import { useState, useEffect, useRef } from 'react';
import { PetState, PET_STATE } from '../types/pet';

interface UseSpriteAnimationProps {
  state: PetState;
  customSpriteUrls?: string[] | null;
}

export function useSpriteAnimation({ state, customSpriteUrls }: UseSpriteAnimationProps) {
  const [frameIndex, setFrameIndex] = useState(1);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    // Determine interval and frame sequences based on state
    let intervalMs = 150;
    let frames: number[] = [1];

    switch (state) {
      case PET_STATE.IDLE:
        // Mostly shime1, occasional blink with shime2
        intervalMs = 1200;
        frames = [1, 1, 1, 2, 1, 1];
        break;
      case PET_STATE.WALKING:
        intervalMs = 140;
        frames = [3, 4, 5, 4];
        break;
      case PET_STATE.FALLING:
        intervalMs = 110;
        frames = [6, 7];
        break;
      case PET_STATE.DRAGGED:
        intervalMs = 180;
        frames = [8, 9];
        break;
      case PET_STATE.CLIMBING:
        intervalMs = 150;
        frames = [10, 11];
        break;
      case PET_STATE.SITTING:
        intervalMs = 1500;
        frames = [12, 12, 13, 12];
        break;
    }

    let currentIndex = 0;
    setFrameIndex(frames[0] ?? 1);

    const timer = setInterval(() => {
      currentIndex = (currentIndex + 1) % frames.length;
      setFrameIndex(frames[currentIndex] ?? 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [state]);

  // Compute sprite source URL
  let spriteSrc = `/sprites/default/shime${frameIndex}.png`;

  if (customSpriteUrls && customSpriteUrls.length > 0) {
    // If user loaded a custom Shimeji folder, map frameIndex (1-13) to matched file
    const matched = customSpriteUrls.find((url) =>
      url.toLowerCase().endsWith(`shime${frameIndex}.png`),
    );
    if (matched) {
      spriteSrc = matched;
    } else if (customSpriteUrls[frameIndex - 1]) {
      spriteSrc = customSpriteUrls[frameIndex - 1]!;
    }
  }

  return { spriteSrc, frameIndex };
}
