// A robust image provider that fetches game covers from multiple sources.
// Strategy: Use RAWG as the primary source, then fall back to Google Search
// for a comprehensive, Google-like image lookup.
// Cache results in localStorage to prevent repeated lookups.

// RAWG API endpoint
const RAWG_BASE = 'https://api.rawg.io/api/games?search=';

// Gemini API keys and endpoints
const GEMINI_API_KEY = 'AIzaSyDEzkqr1zq2ob91yQDYBuxxJwypP7QxlPM';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

// Local storage key prefix
function storageKey(gameName) {
  return `game-img::${gameName}`;
}

// Simple caching mechanism
function cacheResult(gameName, url) {
  try {
    localStorage.setItem(storageKey(gameName), url || '');
  } catch (_) {
    // Failsafe for scenarios where localStorage is not available
  }
}

// Fetch RAWG data by ID for a perfect match
async function fetchFromRawgById(rawgId) {
  const RAWG_API_KEY = '80f68c03ae8245a2a0ed6d365d3f5ea8';
  if (!RAWG_API_KEY || !rawgId) return '';
  try {
    const url = `https://api.rawg.io/api/games/${rawgId}?key=${RAWG_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    return data?.background_image || '';
  } catch (err) {
    console.error('RAWG fetch by ID error:', err);
    return '';
  }
}

// Main function: accepts either a string (name) or a JSON object with Name/rawg_id
export async function getGameImageUrl(game) {
  // game can be a string (name) or an object with { Name, rawg_id }
  const gameName = typeof game === "string" ? game : game.Name;
  const rawgId = typeof game === "object" ? game.rawg_id : undefined;

  // Check cache first to avoid unnecessary API calls
  try {
    const cached = localStorage.getItem(storageKey(gameName));
    if (cached) return cached;
  } catch (_) {}

  // Step 1: Try RAWG by ID if available
  if (rawgId) {
    const byId = await fetchFromRawgById(rawgId);
    if (byId) {
      cacheResult(gameName, byId);
      return byId;
    }
  }

  // Step 2: Attempt to find a match using the RAWG API by name
  const rawgImageUrl = await fetchFromRawg(gameName);
  if (rawgImageUrl) {
    cacheResult(gameName, rawgImageUrl);
    return rawgImageUrl;
  }

  // Step 3: Fallback to Google Search tool if RAWG fails
  const googleImageUrl = await searchGoogleForImage(gameName);
  if (googleImageUrl) {
    cacheResult(gameName, googleImageUrl);
    return googleImageUrl;
  }

  // Final fallback if no image is found
  cacheResult(gameName, '');
  return '';
}

// Attempts to fetch an image from the RAWG API by name search
async function fetchFromRawg(query) {
  const RAWG_API_KEY = '80f68c03ae8245a2a0ed6d365d3f5ea8';

  if (!RAWG_API_KEY) {
    console.warn('RAWG API key is not set. Skipping RAWG search.');
    return '';
  }

  try {
    const res = await fetch(`${RAWG_BASE}${encodeURIComponent(query)}&key=${RAWG_API_KEY}`);
    if (!res.ok) return '';
    const data = await res.json();
    const results = data?.results || [];
    if (!results.length) return '';

    // Advanced scoring to find the best match
    const bestMatch = results.sort((a, b) => {
      const aNormalized = a.name.toLowerCase();
      const bNormalized = b.name.toLowerCase();
      const normalizedQuery = query.toLowerCase();
      
      const scoreA = aNormalized === normalizedQuery ? 100 : aNormalized.includes(normalizedQuery) ? 50 : 0;
      const scoreB = bNormalized === normalizedQuery ? 100 : bNormalized.includes(normalizedQuery) ? 50 : 0;
      return scoreB - scoreA;
    })[0];

    return bestMatch?.background_image || '';
  } catch (err) {
    console.error('RAWG fetch error:', err);
    return '';
  }
}

// Searches Google for an image as a fallback
async function searchGoogleForImage(query) {
  // Updated prompt to explicitly include "video game" and "cover art" in the search.
  const prompt = `Find an official, high-resolution video game cover art image URL for the game titled "${query}". Differentiate between a game and a movie or book with the same name. Prioritize URLs from official game sites or trusted game databases. Return only a single, direct image URL.`;
  
  try {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ "google_search": {} }],
      systemInstruction: {
        parts: [{ text: "You are a specialized image search assistant for video games. Your task is to process Google search results to find a single, high-quality video game image URL. You must prioritize URLs that are direct links to images (ending in .jpg, .png, etc.) over links to web pages. When the game title is ambiguous (e.g., has a movie counterpart), use the search results to determine the official video game cover. You understand common abbreviations and variations like 'NFS Most Wanted II' for 'Need for Speed: Most Wanted (2012)'." }]
      }
    };

    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key is not set. Skipping Google search fallback.');
      return '';
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const candidate = result.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    // Use a regex to find a URL in the text response
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = text.match(urlRegex);

    return match ? match[0] : '';

  } catch (err) {
    console.error('Google search error:', err);
    return '';
  }
}
