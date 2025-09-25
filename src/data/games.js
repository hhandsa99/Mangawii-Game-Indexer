// src/data/games.js - New loader that discovers JSON files per folder

// Normalizes a game object to a consistent shape
function normalizeGame(obj) {
  // Accept keys: Name, SizeGB, Drive, rawg_id
  return {
    Name: obj.Name || obj.name || obj.title || '',
    SizeGB: typeof obj.SizeGB === 'number' ? obj.SizeGB : parseFloat(obj.SizeGB || 0) || 0,
    Drive: obj.Drive || obj.drive || '',
    rawg_id: obj.rawg_id || obj.rawgId || undefined,
  };
}

async function loadFromModules(modules) {
  const entries = Object.entries(modules);
  const aggregated = [];
  for (const [, loader] of entries) {
    try {
      const mod = await loader();
      const data = (mod && mod.default) || mod;
      if (Array.isArray(data)) {
        for (const g of data) aggregated.push(normalizeGame(g));
      } else if (Array.isArray(data?.games)) {
        for (const g of data.games) aggregated.push(normalizeGame(g));
      }
    } catch (e) {
      console.error('Failed to load JSON module:', e);
    }
  }
  return aggregated;
}

// Literal glob patterns required by Vite
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
