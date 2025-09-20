const totalGamesEl = document.getElementById('totalGames');
const totalSizeEl = document.getElementById('totalSize');
const totalPriceEl = document.getElementById('totalPrice');
const copyBtn = document.getElementById('copySummary');

let allGames = [];

// Fetch the list of JSON file names from filelist.json
fetch('JSON/filelist.json')
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then(fileNames => {
        const jsonFiles = fileNames.map(name => `JSON/${name}`);
        
        return Promise.all(jsonFiles.map(file => fetch(file).then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status} for file ${file}`);
            return res.json();
        })));
    })
    .then(results => {
        allGames = results.flat();
        allGames.sort((a, b) => a.Name.localeCompare(b.Name));
        renderGames();
    })
    .catch(error => {
        console.error('Error loading game data:', error);
        document.querySelector('main').innerHTML = '<p>Oops! We couldn\'t load the game list. Please ensure your JSON files are in the correct location.</p>';
    });

// Function to render the game list in a table
function renderGames() {
    const tableBody = document.querySelector('#gameList tbody');
    tableBody.innerHTML = '';

    allGames.forEach(game => {
        const row = document.createElement('tr');
        
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.size = game.SizeGB;
        checkbox.dataset.name = game.Name;
        checkbox.dataset.drive = game.Drive;
        checkbox.addEventListener('change', updateSummary);
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = game.Name;
        row.appendChild(nameCell);

        const sizeCell = document.createElement('td');
        sizeCell.textContent = `${game.SizeGB} GB`;
        row.appendChild(sizeCell);
        
        tableBody.appendChild(row);
    });
}

// Function to update the summary details
function updateSummary() {
    const selected = Array.from(document.querySelectorAll('#gameList input:checked'));
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

// Event listener for the copy button
copyBtn.addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll('#gameList input:checked'));
    if (selected.length === 0) return alert('No games selected.');

    let summary = '';
    let totalSize = 0;
    
    // Generate the summary string with the new format
    selected.forEach(cb => {
        summary += `${cb.dataset.name} | ${cb.dataset.size} GB | Drive: ${cb.dataset.drive}\n`;
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