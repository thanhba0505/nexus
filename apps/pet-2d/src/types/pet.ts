export const PET_STATE = {
  IDLE: 'idle',
  WALKING: 'walking',
  FALLING: 'falling',
  DRAGGED: 'dragged',
  CLIMBING: 'climbing',
  SITTING: 'sitting',
} as const;

export type PetState = (typeof PET_STATE)[keyof typeof PET_STATE];

export const PET_DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
} as const;

export type PetDirection = (typeof PET_DIRECTION)[keyof typeof PET_DIRECTION];

export type PetScale = 1 | 1.5 | 2;

export type PetSpeed = 'slow' | 'normal' | 'fast';

export interface ScreenBounds {
  width: number;
  height: number;
  scaleFactor: number;
}

export interface PetItem {
  id: string;
  name: string;
  description: string;
  frameCount: number;
  previewUrl: string;
  isCustom: boolean;
  folderPath?: string;
}

export interface PetConfig {
  isSpawned: boolean;
  autoSpawnOnLaunch: boolean;
  activePetId: string;
  scale: PetScale;
  speed: PetSpeed;
  enableGravity: boolean;
  enableWallClimb: boolean;
  isAlwaysOnTop: boolean;
  isPaused: boolean;
  customSpriteDir?: string | null;
}

export interface PetTelemetry {
  state: PetState;
  x: number;
  y: number;
  direction: PetDirection;
}
