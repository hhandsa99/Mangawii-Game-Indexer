const gameListDiv = document.getElementById('gameList');
const totalGamesEl = document.getElementById('totalGames');
const totalSizeEl = document.getElementById('totalSize');
const totalPriceEl = document.getElementById('totalPrice');
const copyBtn = document.getElementById('copySummary');

let allGames = [];

// Step 1: Fetch the list of JSON file names
fetch('JSON/filelist.json')
    .then(res => res.json())
    .then(fileNames => {
        // Step 2: Construct the full paths
        const jsonFiles = fileNames.map(name => `JSON/${name}`);
        
        // Step 3: Load each JSON file dynamically
        return Promise.all(jsonFiles.map(file => fetch(file).then(res => res.json())));
    })
    .then(results => {
        // Step 4: Process the data
        allGames = results.flat();
        allGames.sort((a, b) => a.Name.localeCompare(b.Name));
        renderGames();
    })
    .catch(error => console.error('Error loading game data:', error));

// The rest of your functions (renderGames, updateSummary, copySummary) remain the same.

function renderGames() {
    gameListDiv.innerHTML = '';
    const grouped = {};
    
    allGames.forEach(game => {
        const letter = game.Name[0].toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(game);
    });

    for (const letter of Object.keys(grouped).sort()) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'letter-group';

        const heading = document.createElement('div');
        heading.className = 'letter-heading';
        heading.textContent = letter;
        groupDiv.appendChild(heading);

        grouped[letter].forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.size = game.SizeGB;
            checkbox.dataset.name = game.Name;
            checkbox.dataset.drive = game.Drive;
            checkbox.addEventListener('change', updateSummary);

            const label = document.createElement('label');
            label.textContent = `${game.Name} (${game.SizeGB} GB, Drive: ${game.Drive})`;

            gameDiv.appendChild(checkbox);
            gameDiv.appendChild(label);
            groupDiv.appendChild(gameDiv);
        });
        gameListDiv.appendChild(groupDiv);
    }
}

function updateSummary() {
    const selected = Array.from(document.querySelectorAll('.game-item input:checked'));
    let totalSize = 0;
    
    selected.forEach(cb => {
        totalSize += parseFloat(cb.dataset.size);
    });

    let totalPrice = totalSize;

    if (totalSize > 100) {
        totalPrice /= 2;
    }

    totalGamesEl.textContent = selected.length;
    totalSizeEl.textContent = totalSize.toFixed(2);
    totalPriceEl.textContent = totalPrice.toFixed(2);
}

copyBtn.addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll('.game-item input:checked'));
    if (selected.length === 0) return alert('No games selected.');

    let summary = 'Selected Games:\n';
    let totalSize = 0;
    selected.forEach(cb => {
        summary += `- ${cb.dataset.name} (Drive: ${cb.dataset.drive}, Size: ${cb.dataset.size} GB)\n`;
        totalSize += parseFloat(cb.dataset.size);
    });

    let totalPrice = totalSize;
    if (totalSize > 100) {
        totalPrice /= 2;
    }

    summary += `\nTotal Games Selected: ${selected.length}\n`;
    summary += `Total Size: ${totalSize.toFixed(2)} GB\n`;
    summary += `Total Price: £${totalPrice.toFixed(2)}`;

    navigator.clipboard.writeText(summary).then(() => {
        alert('Summary copied to clipboard!');
    });
});
