import { GameStats } from '../types/game';
import { SavedFurnitureItem } from './scratchSave';

const STORAGE_KEY = 'nusa_et_tycoon_save_v1';
const FURNITURE_STORAGE_KEY = 'nusa_et_tycoon_furniture_v1';

export const DEFAULT_STATS: GameStats = {
  money: 1400,
  reputation: 4.6,
  servedCount: 0,
  totalEarnings: 0,
  restaurantLevel: 1,
  waiterCount: 1,
  chefUpgrade: false,
  sommelierUpgrade: false,
  saltMasterUpgrade: false,
  sensitivity: 1.0,
  lightingLevel: 'bright'
};

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STATS,
        ...parsed,
        waiterCount: Math.max(1, parsed.waiterCount ?? 1)
      };
    }
  } catch {
    // Return default on error
  }
  return { ...DEFAULT_STATS };
}

export function saveGameStats(stats: GameStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadSavedFurniture(): SavedFurnitureItem[] | null {
  try {
    const raw = localStorage.getItem(FURNITURE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export function saveFurniture(items: SavedFurnitureItem[]) {
  try {
    localStorage.setItem(FURNITURE_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function clearAllGameData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FURNITURE_STORAGE_KEY);
  } catch {}
}
