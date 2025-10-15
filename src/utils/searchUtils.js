// Fuzzy search helpers: normalization, initials, Damerau-Levenshtein with early exit

// Normalize: lowercase, remove diacritics carefully (preserving Arabic letters), trim, collapse spaces
export function normalize(str) {
  if (!str) return '';
  // Keep Arabic letters, Latin letters, numbers, and spaces
  // Remove only Arabic diacritics (tashkeel) but keep the letters
  return String(str)
    .toLowerCase()
    // Remove Arabic diacritics only (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Keep Arabic letters, Latin letters, numbers, spaces
    .replace(/[^\p{Letter}\p{Number}\s\u0600-\u06FF]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Initials: first character of each word
export function getInitials(str) {
  const n = normalize(str);
  if (!n) return '';
  return n.split(' ').map(w => w[0] || '').join('');
}

// Damerau–Levenshtein distance with a cutoff (maxDistance)
// Default maxDistance reduced to 1 to make fuzzy matching stricter.
export function damerauLevenshtein(a, b, maxDistance = 1) {
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  const da = {};
  const max = a.length + b.length;
  const d = Array(a.length + 2).fill(null).map(() => Array(b.length + 2).fill(0));
  d[0][0] = max;
  for (let i = 0; i <= a.length; i++) {
    d[i + 1][0] = max;
    d[i + 1][1] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    d[0][j + 1] = max;
    d[1][j + 1] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    let db = 0;
    for (let j = 1; j <= b.length; j++) {
      const i1 = da[b[j - 1]] || 0;
      const j1 = db;
      let cost = 1;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
        db = j;
      }
      d[i + 1][j + 1] = Math.min(
        d[i][j] + cost, // substitution
        d[i + 1][j] + 1, // insertion
        d[i][j + 1] + 1, // deletion
        d[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1) // transposition
      );
    }
    da[a[i - 1]] = i;
  }
  const result = d[a.length + 1][b.length + 1];
  return result;
}

export function fuzzyTokenMatch(queryToken, targetToken) {
  if (!queryToken || !targetToken) return false;
  // Direct substring match is still accepted
  if (targetToken.includes(queryToken)) return true;
  // Don't apply fuzzy matching for very short tokens (likely noise)
  if (queryToken.length <= 2) return false;
  // Use a stricter distance cutoff (1)
  const dist = damerauLevenshtein(queryToken, targetToken, 1);
  return dist <= 1;
}

export function buildAliases() {
  // Common abbreviations/aliases; keys should be lowercase normalized
  return new Map([
    ['pes', 'pro evolution soccer'],
    ['cod', 'call of duty'],
    ['gta', 'grand theft auto'],
    ['fc', 'ea sports fc'],
    ['nfs', 'need for speed'],
    ['ds', 'dark souls'],
    ['re', 'resident evil'],
  ]);
}

// Main matcher: handles synonyms, initials, fuzzy tokens
export function matchGameName(name, rawQuery, aliases = buildAliases()) {
  const q0 = normalize(rawQuery);
  if (!q0) return true; // empty query matches all
  const n = normalize(name);
  if (!n) return false;

  // Handle Arabic text: straight contains check first (more accurate for Arabic)
  if (n.includes(q0) || q0.includes(n)) return true;

  // Apply alias expansion if whole query matches an alias
  let expandedQuery = q0;
  const alias = aliases.get(q0);
  if (alias) expandedQuery = normalize(alias);

  // For non-Arabic: try direct substring match with expanded query
  if (!/[\u0600-\u06FF]/.test(expandedQuery) && n.includes(expandedQuery)) return true;

  // Initials match: e.g., pes -> pro evolution soccer (only for Latin text)
  const initials = getInitials(n);
  if (!/[\u0600-\u06FF]/.test(expandedQuery) && initials && initials.includes(expandedQuery)) return true;

  // Token-based fuzzy matching: each query token must match some target token fuzzily
  const qTokens = expandedQuery.split(' ');
  const tTokens = n.split(' ');
  for (const qt of qTokens) {
    if (!tTokens.some(tt => fuzzyTokenMatch(qt, tt))) return false;
  }
  return true;
}
