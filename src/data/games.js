// src/data/games.js - Updated with override functionality

// Function to load game overrides
async function loadGameOverrides() {
  try {
    const response = await fetch('/JSON/game-overrides.json');
    if (!response.ok) {
      console.log('No game overrides file found, using default names and images');
      return {};
    }
    const overridesData = await response.json();
    return overridesData.overrides || {};
  } catch (error) {
    console.log('Could not load game overrides:', error.message);
    return {};
  }
}

// Function to apply overrides to a single game
function applyOverridesToGame(game, overrides) {
  const gameKey = game.name || game.title; // Use name or title as key
  
  if (overrides[gameKey]) {
    const override = overrides[gameKey];
    
    // Apply name override if provided
    if (override.name) {
      game.name = override.name;
      // Also update title if it exists
      if (game.title) {
        game.title = override.name;
      }
    }
    
    // Apply image override if provided
    if (override.image) {
      game.image = override.image;
      // Also update other common image properties
      if (game.imageUrl) {
        game.imageUrl = override.image;
      }
      if (game.cover) {
        game.cover = override.image;
      }
    }
    
    console.log(`Applied overrides to: ${gameKey}`);
  }
  
  return game;
}

// Function to apply overrides to an array of games
function applyOverridesToGames(games, overrides) {
  if (!games || !Array.isArray(games)) {
    return games;
  }
  
  return games.map(game => applyOverridesToGame(game, overrides));
}

// Your existing game loading function (modify this based on your current implementation)
export async function loadGames() {
  try {
    // Load overrides first
    const overrides = await loadGameOverrides();
    
    // Load your main games data (adjust path as needed)
    let games = [];
    
    try {
      // Try to load from JSON directory first
      const response = await fetch('/JSON/games.json'); // Adjust filename as needed
      if (response.ok) {
        const data = await response.json();
        games = data.games || data; // Handle different JSON structures
      } else {
        // Fallback to static data if JSON file not found
        games = getStaticGames(); // Your fallback function
      }
    } catch (error) {
      console.error('Error loading games data:', error);
      games = getStaticGames(); // Your fallback function
    }
    
    // Apply overrides to the loaded games
    const gamesWithOverrides = applyOverridesToGames(games, overrides);
    
    console.log(`Loaded ${gamesWithOverrides.length} games with ${Object.keys(overrides).length} overrides applied`);
    
    return gamesWithOverrides;
  } catch (error) {
    console.error('Error in loadGames:', error);
    return getStaticGames(); // Your fallback function
  }
}

// Alternative: If you want to load overrides separately and apply them later
export async function getGameOverrides() {
  return await loadGameOverrides();
}

// Helper function to manually apply overrides to any game object
export function applyGameOverride(game, overrides) {
  return applyOverridesToGame(game, overrides);
}

// Your existing static games fallback (keep your current implementation)
function getStaticGames() {
  // Your existing static games array
  return [
    // Your static game objects here
  ];
}

// Example usage in a React component:
/*
import { loadGames } from './data/games.js';

function GameComponent() {
  const [games, setGames] = useState([]);
  
  useEffect(() => {
    loadGames().then(setGames);
  }, []);
  
  return (
    <div>
      {games.map(game => (
        <div key={game.id || game.name}>
          <img src={game.image} alt={game.name} />
          <h3>{game.name}</h3>
        </div>
      ))}
    </div>
  );
}
*/
