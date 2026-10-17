import { invoke } from '@tauri-apps/api/core';
import type { ScreenBounds, PetItem, PetConfig } from '../types/pet';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
const STORAGE_KEY = 'nexus_pet_2d_settings';

export const DEFAULT_CONFIG: PetConfig = {
  isSpawned: true,
  autoSpawnOnLaunch: true,
  activePetId: 'anya',
  scale: 1.5,
  speed: 'normal',
  enableGravity: true,
  enableWallClimb: true,
  isAlwaysOnTop: true,
  isPaused: false,
  customSpriteDir: null,
};

export const petApi = {
  getScreenBounds: async (): Promise<ScreenBounds> => {
    if (!isTauri) {
      return {
        width: window.innerWidth || 1440,
        height: window.innerHeight || 900,
        scaleFactor: window.devicePixelRatio || 2,
      };
    }
    return invoke<ScreenBounds>('get_screen_bounds');
  },

  spawnPetWindow: async (): Promise<void> => {
    if (!isTauri) return;
    return invoke<void>('spawn_pet_window');
  },

  closePetWindow: async (): Promise<void> => {
    if (!isTauri) return;
    return invoke<void>('close_pet_window');
  },

  isPetSpawned: async (): Promise<boolean> => {
    if (!isTauri) return true;
    return invoke<boolean>('is_pet_spawned');
  },

  showDashboardWindow: async (): Promise<void> => {
    if (!isTauri) return;
    return invoke<void>('show_dashboard_window');
  },

  setPetPosition: async (x: number, y: number): Promise<void> => {
    if (!isTauri) return;
    return invoke<void>('set_pet_position', { x, y });
  },

  getPetPosition: async (): Promise<[number, number]> => {
    if (!isTauri) return [100, 100];
    return invoke<[number, number]>('get_pet_position');
  },

  setIgnoreCursor: async (ignore: boolean): Promise<void> => {
    if (!isTauri) return;
    return invoke<void>('set_ignore_cursor', { ignore });
  },

  setAlwaysOnTop: async (alwaysOnTop: boolean): Promise<void> => {
    if (!isTauri) return;
    return invoke<void>('set_pet_always_on_top', { alwaysOnTop });
  },

  closePet: async (): Promise<void> => {
    if (!isTauri) {
      window.close();
      return;
    }
    return invoke<void>('close_pet');
  },

  scanShimejiFolder: async (folderPath: string): Promise<string[]> => {
    if (!isTauri) return [];
    return invoke<string[]>('scan_shimeji_folder', { folderPath });
  },

  importCustomPet: async (folderPath: string, petName: string): Promise<PetItem> => {
    if (!isTauri) {
      return {
        id: `mock-${Date.now()}`,
        name: petName,
        description: 'Mock Shimeji Pet',
        frameCount: 13,
        previewUrl: '/sprites/default/shime1.png',
        isCustom: true,
      };
    }
    return invoke<PetItem>('import_custom_pet', { folderPath, petName });
  },

  getPetLibrary: async (): Promise<PetItem[]> => {
    if (!isTauri) {
      return [
        {
          id: 'anya',
          name: 'Anya Forger (Chibi)',
          description: 'Đồng phục Eden Academy, biểu cảm Waku Waku & cười gian',
          frameCount: 13,
          previewUrl: '/sprites/default/shime1.png',
          isCustom: false,
        },
        {
          id: 'neko',
          name: 'Bé Mèo Neko',
          description: 'Mèo con tinh nghịch, đuôi ngoe nguẩy và ngủ khò',
          frameCount: 13,
          previewUrl: '/sprites/default/shime1.png',
          isCustom: false,
        },
        {
          id: 'miku',
          name: 'Hatsune Miku (Chibi)',
          description: 'Tóc xanh hai chùm đung đưa và cầm cọng hành',
          frameCount: 13,
          previewUrl: '/sprites/default/shime1.png',
          isCustom: false,
        },
      ];
    }
    return invoke<PetItem[]>('get_pet_library');
  },

  deleteCustomPet: async (petId: string): Promise<void> => {
    if (!isTauri) return;
    return invoke<void>('delete_custom_pet', { petId });
  },

  loadSettings: async (): Promise<PetConfig> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CONFIG;
  },

  saveSettings: async (config: PetConfig): Promise<void> => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Fallback
    }
  },
};
