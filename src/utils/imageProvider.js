// Image provider: Only local cover images from public/covers matching game name.
// Custom caching has been removed to simplify logic and rely on the browser's native cache.

// All local/session storage and blob URL caching removed.

// Resolve a fallback image by trying multiple extensions and cache it
export async function getFallbackImageUrl() {
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
    if (ok) return url;
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
  // No custom cache lookup; resolve directly
  // Try local cover by file name
  const localCover = await tryLocalCover(gameName);
  if (localCover) return localCover;
  // Nothing found
  return '';
}

