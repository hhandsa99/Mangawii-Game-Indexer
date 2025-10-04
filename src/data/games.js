// src/data/games.js - New loader that discovers JSON files per folder

// Normalize text to avoid mojibake like Assassin's in Chromium
function cleanText(s) {
  if (typeof s !== 'string') return '';
  // Replace common smart quotes and dashes
  let out = s
    .replace(/[\u2018\u2019\u201B\u2032\u02BC\uFF07]/g, "'") // single quotes to '
    .replace(/[\u201C\u201D\u201F\u2033\uFF02]/g, '"') // double quotes to "
    .replace(/[\u2013\u2014\u2212]/g, '-') // en/em dash/minus to '-'
    .replace(/[\u00A0]/g, ' ') // NBSP to normal space
    .replace(/[\u200B-\u200D\u2060]/g, '') // zero-width spaces
    .replace(/[\u0080-\u009F]/g, '') // strip C1 control range that can show as  junk
    // Normalize bullet-like separators and common mojibake
    .replace(/[•·∙●◦]/g, ' • ')
    .replace(/¢/g, ' • ') // fix cases like Disney'¢Pixar -> Disney • Pixar
    // Normalize miscellaneous punctuation variants
    .replace(/[\uFE55\uFF1A]/g, ':') // small colon/fullwidth colon
    .replace(/[\uFF0D]/g, '-') // fullwidth hyphen-minus
    .replace(/[\uFF0F]/g, '/') // fullwidth slash
    ;
  // Collapse repeated spaces around bullets and elsewhere
  out = out.replace(/\s*•\s*/g, ' • ');
  out = out.replace(/\s{2,}/g, ' ');
  try {
    out = out.normalize('NFC');
  } catch (_) {}
  return out.trim();
}
// Normalizes a game object to a consistent shape
function normalizeGame(obj) {
  // Accept multiple schemas and preserve original fields
  const rawName = obj.Name || obj['Game name'] || obj.name || obj.title || '';
  // Prefer SizeGB; fallback to Size
  const rawSize = (typeof obj.SizeGB !== 'undefined' ? obj.SizeGB : (obj.Size ?? obj.size));
  const parsedSize = parseFloat(rawSize || 0);
  const sizeGB = Number.isFinite(parsedSize) ? parsedSize : 0;
  const location = obj.Location || obj.location || '';
  const id = obj.Id || obj.id || obj.ID || undefined;
  return {
    ...obj,
    Name: cleanText(rawName),
    SizeGB: sizeGB,
    Location: location,
    Id: id,
    Drive: obj.Drive || obj.drive || '',
    rawg_id: obj.rawg_id || obj.rawgId || undefined,
  };
}

async function loadFromModules(modules) {
  const entries = Object.entries(modules);
  const aggregated = [];
  for (const [key, loader] of entries) {
    try {
      const mod = await loader();
      const data = (mod && mod.default) || mod;
      // Derive the JSON filename from the module key (e.g. './offline-games/_GAMES 1.json')
      const match = String(key).match(/([^\/]+\.json)$/i);
      const jsonName = match ? match[1] : '';
      if (Array.isArray(data)) {
        for (const g of data) {
          const ng = normalizeGame(g);
          aggregated.push({ ...ng, JsonName: jsonName });
        }
      } else if (Array.isArray(data?.games)) {
        for (const g of data.games) {
          const ng = normalizeGame(g);
          aggregated.push({ ...ng, JsonName: jsonName });
        }
      }
    } catch (e) {
      console.error('Failed to load JSON module:', e);
    }
  }
  return aggregated;
}

// Use Vite glob imports from src/ so any number of files are auto-included at build time
const offlineModules = import.meta.glob('./offline-games/*.json', { eager: false });
const onlineModules = import.meta.glob('./online-games/*.json', { eager: false });

export async function loadOfflineGames() {
  return await loadFromModules(offlineModules);
}

export async function loadOnlineGames() {
  return await loadFromModules(onlineModules);
}

export async function loadGamesFromJSON() {
  // Load both sets in parallel
  const [offline, online] = await Promise.all([loadOfflineGames(), loadOnlineGames()]);
  // Tag to distinguish sections
  const withTags = [
    ...offline.map(g => ({ ...g, __section: 'offline' })),
    ...online.map(g => ({ ...g, __section: 'online' })),
  ];
  return withTags;
}

// Fallback in case no files are found (keeps app stable)
export function getStaticGames() {
  return [];
}
