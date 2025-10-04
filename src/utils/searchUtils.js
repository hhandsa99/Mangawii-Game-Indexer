// Fuzzy search helpers: normalization, initials, Damerau-Levenshtein with early exit

// Normalize: lowercase, remove accents/diacritics, trim, collapse spaces, keep letters/numbers
export function normalize(str) {
  if (!str) return '';
  // NFD to strip diacritics, then remove non letters/numbers/space
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{Letter}\p{Number}\s]/gu, ' ')
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
export function damerauLevenshtein(a, b, maxDistance = 2) {
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
  if (targetToken.includes(queryToken)) return true; // substring
  const dist = damerauLevenshtein(queryToken, targetToken, 2);
  return dist <= 2;
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

  // Apply alias expansion if whole query matches an alias
  let expandedQuery = q0;
  const alias = aliases.get(q0);
  if (alias) expandedQuery = normalize(alias);

  // Fast path: direct substring of full name
  if (n.includes(expandedQuery)) return true;

  // Initials match: e.g., pes -> pro evolution soccer
  const initials = getInitials(n);
  if (initials && initials.includes(expandedQuery)) return true;

  // Token-based fuzzy matching: each query token must match some target token fuzzily
  const qTokens = expandedQuery.split(' ');
  const tTokens = n.split(' ');
  for (const qt of qTokens) {
    if (!tTokens.some(tt => fuzzyTokenMatch(qt, tt))) return false;
  }
  return true;
}
