import { GameStats } from '../types/game';

export interface SavedFurnitureItem {
  catalogId: string;
  x: number;
  z: number;
  rotationY?: number;
}

export const CATALOG_ID_MAP: string[] = [
  'table_wood',
  'table_outdoor_patio',
  'table_luxury',
  'table_vip',
  'grill_basic',
  'grill_double',
  'stone_oven',
  'meat_fridge',
  'sign_neon_standing',
  'sign_chalkboard',
  'sign_totem_luxury',
  'outdoor_heater',
  'street_lantern',
  'outdoor_flower_hedge',
  'plant_palm',
  'golden_bull',
  'neon_sign',
  'chandelier_crystal',
  'picture_steak',
  'turkish_carpet'
];

// Calculate checksum for Scratch number code
function computeChecksum(digits: string): string {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = parseInt(digits[i], 10) || 0;
    sum += d * ((i % 11) + 1);
  }
  const check = sum % 997;
  return check.toString().padStart(3, '0');
}

/**
 * Encodes game state into a Scratch-compatible pure numeric save code.
 * In Scratch cloud variables, only digits (0-9) can be stored.
 */
export function encodeScratchSave(
  stats: GameStats,
  furniture?: SavedFurnitureItem[]
): string {
  let payload = '77'; // Magic prefix for Nusa-Et Scratch Save

  // 1. Level (2 digits)
  payload += Math.min(99, Math.max(1, stats.restaurantLevel)).toString().padStart(2, '0');

  // 2. Waiter count (2 digits)
  payload += Math.min(99, Math.max(1, stats.waiterCount)).toString().padStart(2, '0');

  // 3. Upgrades (3 digits: Chef, Sommelier, SaltMaster)
  payload += stats.chefUpgrade ? '1' : '0';
  payload += stats.sommelierUpgrade ? '1' : '0';
  payload += stats.saltMasterUpgrade ? '1' : '0';

  // 4. Lighting Level (1 digit: 1=warm, 2=bright, 3=ultra)
  const lightCode = stats.lightingLevel === 'ultra' ? '3' : stats.lightingLevel === 'warm' ? '1' : '2';
  payload += lightCode;

  // 5. Reputation (3 digits: e.g. 4.6 => 046)
  const repCode = Math.min(500, Math.max(10, Math.round(stats.reputation * 10)));
  payload += repCode.toString().padStart(3, '0');

  // 6. Money (8 digits, up to 99,999,999)
  const moneyCode = Math.min(99999999, Math.max(0, Math.floor(stats.money)));
  payload += moneyCode.toString().padStart(8, '0');

  // 7. Served Count (6 digits)
  const servedCode = Math.min(999999, Math.max(0, stats.servedCount));
  payload += servedCode.toString().padStart(6, '0');

  // 8. Total Earnings (8 digits)
  const totalEarnCode = Math.min(99999999, Math.max(0, Math.floor(stats.totalEarnings || stats.money)));
  payload += totalEarnCode.toString().padStart(8, '0');

  // 9. Sensitivity (2 digits: e.g. 1.0 => 10)
  const sensCode = Math.min(99, Math.max(1, Math.round((stats.sensitivity ?? 1.0) * 10)));
  payload += sensCode.toString().padStart(2, '0');

  // 10. Furniture (optional)
  if (furniture && furniture.length > 0) {
    const validItems = furniture.filter(f => CATALOG_ID_MAP.includes(f.catalogId)).slice(0, 36);
    payload += '1'; // Furniture included flag
    payload += validItems.length.toString().padStart(2, '0');

    validItems.forEach(item => {
      const catIdx = CATALOG_ID_MAP.indexOf(item.catalogId) + 1; // 1-indexed
      payload += catIdx.toString().padStart(2, '0');

      // Coordinate encoding (scale -40..+40 into positive 0..800)
      const encX = Math.min(999, Math.max(0, Math.round((item.x + 40) * 10)));
      const encZ = Math.min(999, Math.max(0, Math.round((item.z + 40) * 10)));
      payload += encX.toString().padStart(3, '0');
      payload += encZ.toString().padStart(3, '0');

      // Rotation (quarter turns: 0, 1, 2, 3)
      const rotIdx = Math.round(((item.rotationY || 0) / (Math.PI / 2)) % 4 + 4) % 4;
      payload += rotIdx.toString();
    });
  } else {
    payload += '0'; // No furniture included flag
  }

  // 11. Checksum (3 digits)
  const checksum = computeChecksum(payload);
  return payload + checksum;
}

export interface DecodedScratchSave {
  success: boolean;
  stats?: GameStats;
  furniture?: SavedFurnitureItem[];
  error?: string;
  summary?: string;
}

/**
 * Decodes and validates a Scratch numeric save code.
 * Accepts formatted (with dashes or spaces) or pure digit strings.
 */
export function decodeScratchSave(input: string): DecodedScratchSave {
  const clean = input.replace(/\D/g, ''); // strip any non-digit characters

  if (clean.length < 38) {
    return {
      success: false,
      error: 'Geçersiz kod uzunluğu (Kod en az 38 haneli olmalıdır).'
    };
  }

  if (!clean.startsWith('77')) {
    return {
      success: false,
      error: 'Geçersiz Nusa-Et Scratch kayıt kodu formatı (77 ile başlamalı).'
    };
  }

  const payload = clean.slice(0, -3);
  const providedChecksum = clean.slice(-3);
  const expectedChecksum = computeChecksum(payload);

  if (providedChecksum !== expectedChecksum) {
    return {
      success: false,
      error: 'Kayıt kodu bozuk veya değiştirilmiş (Hata denetimi eşleşmedi).'
    };
  }

  try {
    let ptr = 2; // skip prefix '77'

    const level = parseInt(payload.substring(ptr, ptr + 2), 10) || 1;
    ptr += 2;

    const waiterCount = parseInt(payload.substring(ptr, ptr + 2), 10) || 1;
    ptr += 2;

    const chefUpgrade = payload[ptr] === '1';
    ptr += 1;

    const sommelierUpgrade = payload[ptr] === '1';
    ptr += 1;

    const saltMasterUpgrade = payload[ptr] === '1';
    ptr += 1;

    const lightCode = payload[ptr];
    const lightingLevel: 'warm' | 'bright' | 'ultra' = 
      lightCode === '3' ? 'ultra' : lightCode === '1' ? 'warm' : 'bright';
    ptr += 1;

    const repRaw = parseInt(payload.substring(ptr, ptr + 3), 10) || 46;
    const reputation = Math.min(5.0, Math.max(1.0, +(repRaw / 10).toFixed(1)));
    ptr += 3;

    const money = parseInt(payload.substring(ptr, ptr + 8), 10) || 0;
    ptr += 8;

    const servedCount = parseInt(payload.substring(ptr, ptr + 6), 10) || 0;
    ptr += 6;

    const totalEarnings = parseInt(payload.substring(ptr, ptr + 8), 10) || money;
    ptr += 8;

    const sensRaw = parseInt(payload.substring(ptr, ptr + 2), 10) || 10;
    const sensitivity = Math.max(0.1, +(sensRaw / 10).toFixed(1));
    ptr += 2;

    const hasFurniture = payload[ptr] === '1';
    ptr += 1;

    const furniture: SavedFurnitureItem[] = [];
    if (hasFurniture && ptr < payload.length) {
      const furnCount = parseInt(payload.substring(ptr, ptr + 2), 10) || 0;
      ptr += 2;

      for (let i = 0; i < furnCount; i++) {
        if (ptr + 9 > payload.length) break;
        const catIdx = parseInt(payload.substring(ptr, ptr + 2), 10) - 1;
        ptr += 2;

        const encX = parseInt(payload.substring(ptr, ptr + 3), 10) || 0;
        ptr += 3;

        const encZ = parseInt(payload.substring(ptr, ptr + 3), 10) || 0;
        ptr += 3;

        const rotIdx = parseInt(payload[ptr], 10) || 0;
        ptr += 1;

        const catalogId = CATALOG_ID_MAP[catIdx];
        if (catalogId) {
          furniture.push({
            catalogId,
            x: +(encX / 10 - 40).toFixed(1),
            z: +(encZ / 10 - 40).toFixed(1),
            rotationY: +(rotIdx * (Math.PI / 2)).toFixed(2)
          });
        }
      }
    }

    const stats: GameStats = {
      restaurantLevel: Math.min(4, Math.max(1, level)),
      waiterCount: Math.min(10, Math.max(1, waiterCount)),
      chefUpgrade,
      sommelierUpgrade,
      saltMasterUpgrade,
      lightingLevel,
      reputation,
      money,
      servedCount,
      totalEarnings,
      sensitivity
    };

    const summary = `Seviye ${stats.restaurantLevel} • ₺${stats.money.toLocaleString()} • ${stats.waiterCount} Garson • ${stats.reputation}⭐`;

    return {
      success: true,
      stats,
      furniture: furniture.length > 0 ? furniture : undefined,
      summary
    };
  } catch (err) {
    return {
      success: false,
      error: 'Kod çözülürken hata oluştu: ' + String(err)
    };
  }
}

/**
 * Formats a raw digit string into user-friendly 4-digit Scratch blocks:
 * e.g. "7701-0211-1048-..."
 */
export function formatScratchCode(raw: string): string {
  const clean = raw.replace(/\D/g, '');
  return clean.match(/.{1,4}/g)?.join('-') || clean;
}
