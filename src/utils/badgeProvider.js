// src/utils/badgeProvider.js
// Badges logic intentionally disabled — stubs to avoid network requests

/**
 * Previously this module attempted to discover and fetch badge images from
 * the `public/online-badges` folder. Badges have been disabled; callers
 * should treat empty-string as "no badge".
 */
export async function getCachedBadgeUrl(/* jsonName */) {
  return '';
}

export function getBadgeBasePath() {
  return '';
}
