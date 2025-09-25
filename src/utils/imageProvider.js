// Image provider: Only local cover images from public/covers matching game name.
// Results are cached in localStorage.

// Local storage key prefix
function storageKey(gameName) {
  // Bump version to invalidate prior negative caches
  return `game-img:v2::${gameName}`;
}

// Resolve a fallback image by trying multiple extensions and cache it
export async function getFallbackImageUrl() {
  const key = storageKey('__fallback__');
  try {
    const cached = localStorage.getItem(key);
    if (cached) return cached;
  } catch (_) {}

  const base = `${import.meta.env.BASE_URL || '/'}covers/`;
  const names = ['fallback', 'Fallback', 'cover', 'Cover', 'default', 'Default'];
  const exts = ['jpg', 'png', 'webp', 'jpeg', 'avif'];
  const candidates = [];
  for (const n of names) {
    for (const e of exts) candidates.push(`${n}.${e}`);
  }
  for (const file of candidates) {
    const url = `${base}${file}`;
    const ok = await imageExists(url);
    if (ok) {
      try { localStorage.setItem(key, url); } catch (_) {}
      return url;
    }
  }
  // Nothing found; cache empty to avoid repeats
  try { localStorage.setItem(key, ''); } catch (_) {}
  return '';
}

// Simple caching mechanism
function cacheResult(gameName, url) {
  try {
    localStorage.setItem(storageKey(gameName), url || '');
  } catch (_) {
    // Failsafe for scenarios where localStorage is not available
  }
}

// No external fetches are used anymore.

// Try local cover: /covers/<sanitized-name>.(jpg|png|webp|jpeg)
function sanitizeFilename(name) {
  return (name || '')
    .replace(/[<>:"/\\|?*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildNameCandidates(name) {
  const s = sanitizeFilename(name);
  const lower = s.toLowerCase();
  const dashed = s.replace(/\s+/g, '-');
  const dashedLower = dashed.toLowerCase();
  const underscored = s.replace(/\s+/g, '_');
  const underscoredLower = underscored.toLowerCase();
  const unique = new Set([s, lower, dashed, dashedLower, underscored, underscoredLower]);
  return Array.from(unique).filter(Boolean);
}

async function tryLocalCover(gameName) {
  const base = `${import.meta.env.BASE_URL || '/'}covers/`;
  const names = buildNameCandidates(gameName);
  const exts = ['jpg', 'png', 'webp', 'jpeg', 'avif'];
  for (const n of names) {
    for (const ext of exts) {
      const url = `${base}${n}.${ext}`;
      const ok = await imageExists(url);
      if (ok) return url;
    }
  }
  return '';
}

function imageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Main function: accepts either a string (name) or a JSON object with Name/rawg_id
export async function getGameImageUrl(game) {
  // game can be a string (name) or an object with { Name }
  const gameName = typeof game === "string" ? game : game.Name;

  // Check cache first
  try {
    const cached = localStorage.getItem(storageKey(gameName));
    if (cached) return cached;
  } catch (_) {}

  // Try local cover by file name
  const localCover = await tryLocalCover(gameName);
  if (localCover) {
    cacheResult(gameName, localCover);
    return localCover;
  }

  // Final fallback if no image is found: store empty to skip future lookups
  cacheResult(gameName, '');
  return '';
}

