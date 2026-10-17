import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PetState,
  PET_STATE,
  PetDirection,
  PET_DIRECTION,
  PetConfig,
  ScreenBounds,
} from '../types/pet';
import { petApi } from '../services/pet-api';

const WINDOW_SIZE = 220;
const GRAVITY = 0.9;
const TERMINAL_VELOCITY = 18;

interface UsePetPhysicsProps {
  config: PetConfig;
}

export function usePetPhysics({ config }: UsePetPhysicsProps) {
  const [state, setState] = useState<PetState>(PET_STATE.FALLING);
  const [direction, setDirection] = useState<PetDirection>(PET_DIRECTION.RIGHT);
  const [screenBounds, setScreenBounds] = useState<ScreenBounds>({
    width: 1440,
    height: 900,
    scaleFactor: 2,
  });

  const posRef = useRef({ x: 300, y: 100 });
  const velRef = useRef({ vx: 0, vy: 0 });
  const stateRef = useRef(state);
  stateRef.current = state;
  const configRef = useRef(config);
  configRef.current = config;
  const directionRef = useRef(direction);
  directionRef.current = direction;

  const stateTimerRef = useRef(0);
  const climbTargetYRef = useRef(150);

  // Initialize screen bounds
  useEffect(() => {
    let mounted = true;
    petApi.getScreenBounds().then((bounds) => {
      if (!mounted) return;
      setScreenBounds(bounds);
      posRef.current.x = Math.round((bounds.width - WINDOW_SIZE) / 2);
      posRef.current.y = 80;
      petApi.setPetPosition(posRef.current.x, posRef.current.y);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Set always on top when config changes
  useEffect(() => {
    petApi.setAlwaysOnTop(config.isAlwaysOnTop);
  }, [config.isAlwaysOnTop]);

  // Speed multiplier
  const getSpeed = useCallback(() => {
    switch (configRef.current.speed) {
      case 'slow':
        return 1.4;
      case 'fast':
        return 3.4;
      default:
        return 2.2;
    }
  }, []);

  // Main physics & AI loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const currentConfig = configRef.current;
      const bounds = screenBounds;
      const floorY = bounds.height - WINDOW_SIZE - 45; // Leave room for macOS Dock
      const minX = 0;
      const maxX = bounds.width - WINDOW_SIZE;

      if (!currentConfig.isPaused && stateRef.current !== PET_STATE.DRAGGED) {
        stateTimerRef.current -= dt;

        switch (stateRef.current) {
          case PET_STATE.FALLING: {
            velRef.current.vy = Math.min(velRef.current.vy + GRAVITY * 40 * dt, TERMINAL_VELOCITY);
            posRef.current.y += velRef.current.vy;
            posRef.current.x += velRef.current.vx;

            // Horizontal bounds bounce
            if (posRef.current.x < minX) {
              posRef.current.x = minX;
              velRef.current.vx = -velRef.current.vx * 0.4;
            } else if (posRef.current.x > maxX) {
              posRef.current.x = maxX;
              velRef.current.vx = -velRef.current.vx * 0.4;
            }

            // Floor collision
            if (posRef.current.y >= floorY) {
              posRef.current.y = floorY;
              if (velRef.current.vy > 6) {
                // Bounce
                velRef.current.vy = -velRef.current.vy * 0.3;
              } else {
                velRef.current.vy = 0;
                velRef.current.vx = 0;
                setState(PET_STATE.IDLE);
                stateTimerRef.current = 2.5 + Math.random() * 3.5;
              }
            }
            break;
          }

          case PET_STATE.IDLE: {
            velRef.current.vx = 0;
            velRef.current.vy = 0;
            posRef.current.y = floorY;

            if (stateTimerRef.current <= 0) {
              const roll = Math.random();
              if (roll < 0.65) {
                // Start walking
                const newDir = Math.random() < 0.5 ? PET_DIRECTION.LEFT : PET_DIRECTION.RIGHT;
                setDirection(newDir);
                setState(PET_STATE.WALKING);
                stateTimerRef.current = 3.5 + Math.random() * 4;
              } else if (roll < 0.82) {
                // Sit down
                setState(PET_STATE.SITTING);
                stateTimerRef.current = 4 + Math.random() * 4;
              } else {
                // Stay idle longer
                stateTimerRef.current = 2 + Math.random() * 3;
              }
            }
            break;
          }

          case PET_STATE.WALKING: {
            const speed = getSpeed();
            const dirMultiplier = directionRef.current === PET_DIRECTION.RIGHT ? 1 : -1;
            posRef.current.x += dirMultiplier * speed;
            posRef.current.y = floorY;

            // Check wall collision
            if (posRef.current.x <= minX) {
              posRef.current.x = minX;
              if (Math.random() < 0.5) {
                // Climb left wall
                setState(PET_STATE.CLIMBING);
                climbTargetYRef.current = 150 + Math.random() * 250;
              } else {
                setDirection(PET_DIRECTION.RIGHT);
              }
            } else if (posRef.current.x >= maxX) {
              posRef.current.x = maxX;
              if (Math.random() < 0.5) {
                // Climb right wall
                setState(PET_STATE.CLIMBING);
                climbTargetYRef.current = 150 + Math.random() * 250;
              } else {
                setDirection(PET_DIRECTION.LEFT);
              }
            }

            if (stateTimerRef.current <= 0) {
              setState(PET_STATE.IDLE);
              stateTimerRef.current = 2 + Math.random() * 3;
            }
            break;
          }

          case PET_STATE.CLIMBING: {
            // Climb up the wall
            posRef.current.y -= 1.8;

            if (posRef.current.y <= climbTargetYRef.current || posRef.current.y <= 100) {
              // Jump off the wall into falling state!
              const pushX = directionRef.current === PET_DIRECTION.RIGHT ? -4 : 4;
              velRef.current = { vx: pushX, vy: -3 };
              setState(PET_STATE.FALLING);
            }
            break;
          }

          case PET_STATE.SITTING: {
            posRef.current.y = floorY;
            if (stateTimerRef.current <= 0) {
              setState(PET_STATE.IDLE);
              stateTimerRef.current = 1.5;
            }
            break;
          }
        }

        // Apply updated position to macOS window
        petApi.setPetPosition(Math.round(posRef.current.x), Math.round(posRef.current.y));
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [screenBounds, getSpeed]);

  // Handlers for dragging
  const handleDragStart = useCallback(() => {
    setState(PET_STATE.DRAGGED);
    velRef.current = { vx: 0, vy: 0 };
  }, []);

  const handleDragEnd = useCallback(() => {
    // Transition to falling with slight toss
    velRef.current = { vx: (Math.random() - 0.5) * 4, vy: 1 };
    setState(PET_STATE.FALLING);
  }, []);

  const resetToCenter = useCallback(() => {
    posRef.current.x = Math.round((screenBounds.width - WINDOW_SIZE) / 2);
    posRef.current.y = 120;
    velRef.current = { vx: 0, vy: 2 };
    setState(PET_STATE.FALLING);
    petApi.setPetPosition(posRef.current.x, posRef.current.y);
  }, [screenBounds]);

  return {
    state,
    direction,
    handleDragStart,
    handleDragEnd,
    resetToCenter,
  };
}
