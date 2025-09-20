const totalGamesEl = document.getElementById('totalGames');
const totalSizeEl = document.getElementById('totalSize');
const totalPriceEl = document.getElementById('totalPrice');
const openSummaryBtn = document.getElementById('openSummaryPopup');
const popup = document.getElementById('popup');
const closeBtn = document.querySelector('.close-btn');
const summaryTextDiv = document.getElementById('summaryText');
const copyListBtn = document.getElementById('copyListBtn');
const whatsappBtn = document.getElementById('whatsappBtn');

let allGames = [];
let generatedSummary = ''; // Store the summary to use in the popup

// ... (fetch and renderGames functions from the previous response remain the same)

// The fetch logic and renderGames function
// Make sure this is the correct version with the table rendering
// ... (Your existing fetch and renderGames code here)
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
    
    // Generate and store the summary for the popup
    let summaryText = '';
    selected.forEach(cb => {
        summaryText += `${cb.dataset.name} | ${cb.dataset.size} GB | Drive: ${cb.dataset.drive}\n`;
    });
    summaryText += `\nTotal Games Selected: ${selected.length}\n`;
    summaryText += `Total Size: ${totalSize.toFixed(2)} GB\n`;
    summaryText += `Total Price: £${totalPrice.toFixed(2)}`;
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

// Close popup if the user clicks outside of it
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
    // Replace with your specific WhatsApp number, including country code (e.g., "1234567890")
    const phoneNumber = "201204838286"; 
    const encodedMessage = encodeURIComponent(generatedSummary);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    popup.style.display = 'none';
});