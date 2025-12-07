// src/utils/badgeProvider.js
// Provides badge images for online games based on their JSON filename

const BADGE_BASE_PATH = `${import.meta.env.BASE_URL}online-badges/`;

/**
 * Get the badge image URL for an online game based on its JSON source file.
 * Expects the badge image to be named exactly like the JSON file (e.g., "Steam.png" for "Steam.json")
 * Tries common image extensions: .png, .jpg, .webp
 * @param {string} jsonName - The JSON filename (e.g., "Steam.json" or "common.json")
 * @returns {Promise<string>} - URL to the badge image, or empty string if not found
 */
export async function getBadgeImageUrl(jsonName) {
  if (!jsonName || typeof jsonName !== 'string') {
    return '';
  }

  // Extract the base name without extension (e.g., "Steam.json" -> "Steam")
  const baseName = jsonName.replace(/\.json$/i, '');
  if (!baseName) return '';

  // Try common image extensions in order
  const extensions = ['.png', '.jpg', '.jpeg', '.webp'];

  for (const ext of extensions) {
    const url = `${BADGE_BASE_PATH}${baseName}${ext}`;
    try {
      // Quick check if the image exists by attempting to load it
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return url;
      }
    } catch (_) {
      // Continue to next extension if fetch fails
    }
  }

  return '';
}

/**
 * Cache for badge URLs to avoid repeated fetches
 */
const badgeCache = new Map();

/**
 * Get badge image URL with caching
 * @param {string} jsonName - The JSON filename
 * @returns {Promise<string>} - URL to the badge image or empty string
 */
export async function getCachedBadgeUrl(jsonName) {
  if (!jsonName) return '';

  if (badgeCache.has(jsonName)) {
    return badgeCache.get(jsonName);
  }

  const url = await getBadgeImageUrl(jsonName);
  badgeCache.set(jsonName, url);
  return url;
}

/**
 * Get the base path for badge images (for direct access if needed)
 */
export function getBadgeBasePath() {
  return BADGE_BASE_PATH;
}
