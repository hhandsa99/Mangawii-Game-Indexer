const gameListDiv = document.getElementById('gameList');
const totalSizeEl = document.getElementById('totalSize');
const totalPriceEl = document.getElementById('totalPrice');
const copyBtn = document.getElementById('copySummary');

let allGames = [];

// List of JSON files to load
const jsonFiles = [
    'json/driveD.json',
    'json/driveH.json',
    'json/driveE.json'
];

// Load JSON files
Promise.all(jsonFiles.map(file => fetch(file).then(res => res.json())))
.then(results => {
    // Merge all JSON arrays
    allGames = results.flat();

    // Sort alphabetically
    allGames.sort((a,b) => a.Name.localeCompare(b.Name));

    renderGames();
});

function renderGames() {
    gameListDiv.innerHTML = '';
    const grouped = {};

    // Group by first letter
    allGames.forEach(game => {
        const letter = game.Name[0].toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(game);
    });

    // Render groups
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
            checkbox.dataset.drive = game.Drive;
            checkbox.dataset.name = game.Name;
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

    let pricePerGB = 1; // example: $1 per GB
    let totalPrice = totalSize * pricePerGB;

    // Discount if over 100 GB
    if (totalSize > 100) totalPrice = totalPrice / 2;

    totalSizeEl.textContent = totalSize.toFixed(2);
    totalPriceEl.textContent = totalPrice.toFixed(2);
}

// Copy summary
copyBtn.addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll('.game-item input:checked'));
    if(selected.length === 0) return alert('No games selected.');

    let summary = 'Selected Games:\n';
    let totalSize = 0;
    let totalPrice = 0;
    const pricePerGB = 1;

    selected.forEach(cb => {
        summary += `- ${cb.dataset.name} (Drive: ${cb.dataset.drive}, Size: ${cb.dataset.size} GB)\n`;
        totalSize += parseFloat(cb.dataset.size);
    });

    totalPrice = totalSize * pricePerGB;
    if(totalSize > 100) totalPrice /= 2;

    summary += `Total Size: ${totalSize.toFixed(2)} GB\n`;
    summary += `Total Price: $${totalPrice.toFixed(2)}`;

    navigator.clipboard.writeText(summary).then(() => {
        alert('Summary copied to clipboard!');
    });
});
