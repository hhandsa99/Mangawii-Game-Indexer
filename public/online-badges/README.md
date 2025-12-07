# Online Badges Folder

Place your platform badge images here with the following naming convention:

- `Steam.png` (or .jpg, .jpeg, .webp) for Steam.json games
- `Epic Games.png` for Epic Games.json games
- `Riot Games.png` for Riot Games.json games
- `Battle.net.png` for Battle.net.json games
- `common.png` for common.json games (if needed)

The system automatically matches badge images to JSON files by filename.

Example structure:
```
public/
  online-badges/
    Steam.png
    Epic Games.png
    Riot Games.png
    Battle.net.png
```

Each badge will be displayed on the bottom 25% of online game cards with a blurred darkened gradient background.
