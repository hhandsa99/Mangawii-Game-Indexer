// Image provider: Only local cover images from public/covers matching game name.
// Custom caching has been removed to simplify logic and rely on the browser's native cache.

// All local/session storage and blob URL caching removed.

// Versioned localStorage cache helpers (persist across restarts). Keys are prefixed with current app version.
let __cacheVersion = '';
let __cachePrefix = '';

async function ensureVersion() {
  if (__cacheVersion && __cachePrefix) return __cacheVersion;
  // Try to fetch version.json from public to invalidate cache on deploys
  try {
    const url = `${import.meta.env.BASE_URL || '/'}version.json`;
    const res = await fetch(url, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data && data.version) {
        __cacheVersion = String(data.version);
      }
    }
  } catch (_) {}
  if (!__cacheVersion) {
    // Fallback: use a static default so cache works even without version.json
    __cacheVersion = '1';
  }
  __cachePrefix = `v:${__cacheVersion}:`;
  return __cacheVersion;
}

function lsGetRaw(key) {
  try {
    return localStorage.getItem(key) || '';
  } catch (_) {
    return '';
  }
}

function lsSetRaw(key, value) {
  try {
    if (typeof value === 'string') localStorage.setItem(key, value);
  } catch (_) {}
}

async function lsGet(key) {
  await ensureVersion();
  return lsGetRaw(__cachePrefix + key);
}

async function lsSet(key, value) {
  await ensureVersion();
  lsSetRaw(__cachePrefix + key, value);
}

export async function getCacheVersion() {
  return ensureVersion();
}

// Read a cached per-game image URL by name from sessionStorage
export function getCachedImageUrlByName(name) {
  // Synchronous read best-effort: use latest known prefix if available; else try un-prefixed and all-known versions.
  // For simplicity, read current prefix if initialized; else fall back to unversioned key (for first-run migrations).
  try {
    const key = `img:${name}`;
    if (__cachePrefix) {
      return lsGetRaw(__cachePrefix + key) || '';
    }
    // Fallback migration path
    return localStorage.getItem(key) || '';
  } catch (_) {
    return '';
  }
}

// Preload a single image URL (resolves true/false)
export function preloadImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = encodeURI(url);
  });
}

// Preload list of image URLs with optional progress callback (0..1)
export async function preloadImages(urls, onProgress) {
  let done = 0;
  const total = urls.length || 1;
  const report = () => { if (onProgress) onProgress(Math.min(1, done / total)); };
  report();
  for (const url of urls) {
    await preloadImage(url);
    done += 1;
    report();
  }
}

// Resolve a fallback image by trying multiple extensions and cache it
export async function getFallbackImageUrl() {
  const base = `${import.meta.env.BASE_URL || '/'}covers/`;
  const cached = await lsGet('fallbackUrl');
  if (cached) return cached;
  const names = ['fallback', 'Fallback', 'cover', 'Cover', 'default', 'Default'];
  // Prefer modern formats first to reduce failed probes on GitHub Pages
  const exts = ['webp', 'jpg', 'jpeg', 'png', 'avif'];
  const candidates = [];
  for (const n of names) {
    for (const e of exts) candidates.push(`${n}.${e}`);
  }
  for (const file of candidates) {
    const url = `${base}${file}`;
    const ok = await imageExists(url);
    if (ok) {
      await lsSet('fallbackUrl', url);
      return url;
    }
  }
  return '';
}

// Removed custom cacheResult; rely on native browser cache.

// No external fetches are used anymore.

// Try local cover: /covers/<sanitized-name>.(jpg|png|webp|jpeg)
function sanitizeFilename(name) {
  return (name || '')
    .replace(/[•·∙●◦]/g, ' ') // normalize bullet-like separators
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
  // Prefer webp first since the repo stores covers primarily as .webp
  const exts = ['webp', 'jpg', 'jpeg', 'png', 'avif'];
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
    // Encode to ensure spaces and special chars are safe on GitHub Pages
    img.src = encodeURI(url);
  });
}

// Main function: accepts either a string (name) or a JSON object with Name/rawg_id
export async function getGameImageUrl(game) {
  // game can be a string (name) or an object with { Name }
  const gameName = typeof game === "string" ? game : game.Name;
  await ensureVersion();
  const cacheKey = `img:${gameName}`;
  const cached = await lsGet(cacheKey);
  if (cached) return cached;
  // No custom cache lookup; resolve directly
  // Try local cover by file name
  const localCover = await tryLocalCover(gameName);
  if (localCover) {
    await lsSet(cacheKey, localCover);
    return localCover;
  }
  // Nothing found
  return '';
}

