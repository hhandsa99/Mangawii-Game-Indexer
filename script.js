const totalGamesEl = document.getElementById('totalGames');
const totalSizeEl = document.getElementById('totalSize');
const totalPriceEl = document.getElementById('totalPrice');
const openSummaryBtn = document.getElementById('openSummaryPopup');
const popup = document.getElementById('popup');
const closeBtn = document.querySelector('.close-btn');
const summaryTextDiv = document.getElementById('summaryText');
const copyListBtn = document.getElementById('copyListBtn');
const whatsappBtn = document.getElementById('whatsappBtn');
const themeToggleBtn = document.getElementById('theme-toggle');

let allGames = [];
let generatedSummary = '';

// Theme Toggle Logic
themeToggleBtn.addEventListener('click', () => {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
        themeToggleBtn.textContent = '🌝️';
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggleBtn.textContent = '🌚';
    }
});

// Fetch and render games
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

    // Group games by the first letter of their name
    const groupedGames = allGames.reduce((groups, game) => {
        const letter = game.Name[0].toUpperCase();
        if (!groups[letter]) {
            groups[letter] = [];
        }
        groups[letter].push(game);
        return groups;
    }, {});

    // Render each group with a letter heading
    for (const letter of Object.keys(groupedGames).sort()) {
        const separatorRow = document.createElement('tr');
        separatorRow.className = 'letter-separator';
        const separatorCell = document.createElement('td');
        separatorCell.colSpan = 3; // Span across all 3 columns
        separatorCell.textContent = `${letter}.`;
        separatorRow.appendChild(separatorCell);
        tableBody.appendChild(separatorRow);

        groupedGames[letter].forEach(game => {
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
    
    // Round the price to the nearest multiple of 5
    totalPrice = **Math.round(totalPrice / 5) * 5;**

    totalGamesEl.textContent = selected.length;
    totalSizeEl.textContent = totalSize.toFixed(2);
    totalPriceEl.textContent = totalPrice.toFixed(2);
    
    let summaryText = '';
    selected.forEach(cb => {
        summaryText += `${cb.dataset.name} | ${cb.dataset.size} GB | Drive: ${cb.dataset.drive}\n`;
    });

    summaryText += `\nألعاب تم تحديدها : ${selected.length}\n`;
    summaryText += `الحجم الكلي : ${totalSize.toFixed(2)} جيجا\n`;
    summaryText += `السعر : ${totalPrice.toFixed(2)} جنية`;
    generatedSummary = summaryText;
}

// Event listeners for the popup
openSummaryBtn.addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll('#gameList input:checked'));
    if (selected.length === 0) {
        alert('No games selected.');
        return;
    }
    summaryTextDiv.textContent = generatedSummary;
    popup.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});

// Event listener for the "Copy List" button
copyListBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generatedSummary)
    .then(() => {
        alert('Summary copied to clipboard!');
        popup.style.display = 'none';
    })
    .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy. Please try again.');
    });
});

// Event listener for the "Send via WhatsApp" button
whatsappBtn.addEventListener('click', () => {
    const phoneNumber = "201204838286"; 
    const encodedMessage = encodeURIComponent(generatedSummary);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    popup.style.display = 'none';
});