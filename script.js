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
const themeIcon = document.getElementById('theme-icon');
const searchInput = document.getElementById('searchInput');

let allGames = [];
let filteredGames = [];
let selectedGames = new Set();
let generatedSummary = '';

// Modern SVG icons for theme toggle
// Path to your SVG icons
const lightIconPath = "images/light.svg";
const darkIconPath = "images/dark.svg";

function setThemeIcon() {
    if (document.body.getAttribute('data-theme') === 'dark') {
        themeIcon.src = darkIconPath;
        themeIcon.alt = "الوضع الليلي";
    } else {
        themeIcon.src = lightIconPath;
        themeIcon.alt = "الوضع النهاري";
    }
}
setThemeIcon();

// Theme Toggle Logic
themeToggleBtn.addEventListener('click', () => {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
    }
    setThemeIcon();
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
        filteredGames = [...allGames];
        renderGames();
    })
    .catch(error => {
        console.error('Error loading game data:', error);
        document.querySelector('main').innerHTML = '<p>تعذر تحميل قائمة الألعاب. تأكد من وجود ملفات JSON في المكان الصحيح.</p>';
    });

// Search filter logic
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        filteredGames = [...allGames];
    } else {
        filteredGames = allGames.filter(game =>
            game.Name.toLowerCase().includes(query)
        );
    }
    renderGames();
    updateSummary();
});

// Function to render the game list in a table
function renderGames() {
    const tableBody = document.querySelector('#gameList tbody');
    tableBody.innerHTML = '';

    // Group games by the first letter of their name
    const groupedGames = filteredGames.reduce((groups, game) => {
        const letter = game.Name[0].toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(game);
        return groups;
    }, {});

    for (const letter of Object.keys(groupedGames).sort()) {
        const separatorRow = document.createElement('tr');
        separatorRow.className = 'letter-separator';
        const separatorCell = document.createElement('td');
        separatorCell.colSpan = 3;
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

            // Keep checked state for selected games even if filtered
            checkbox.checked = selectedGames.has(game.Name);

            checkbox.addEventListener('change', function () {
                if (checkbox.checked) {
                    selectedGames.add(game.Name);
                } else {
                    selectedGames.delete(game.Name);
                }
                updateSummary();
            });

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
    // Find all selected games from allGames (not just filtered)
    const selected = allGames.filter(game => selectedGames.has(game.Name));
    let totalSize = 0;

    selected.forEach(game => {
        totalSize += parseFloat(game.SizeGB);
    });

    let totalPrice = totalSize;
    if (totalSize > 100) {
        totalPrice /= 2;
    }
    totalPrice = Math.round(totalPrice / 5) * 5;
    if (selected.length > 0 && totalPrice < 20) {
        totalPrice = 20;
    }

    totalGamesEl.textContent = selected.length;
    totalSizeEl.textContent = totalSize.toFixed(2);
    totalPriceEl.textContent = totalPrice.toFixed(2);

    let summaryText = '';
    selected.forEach(game => {
        summaryText += `${game.Name} | ${game.SizeGB} GB | Drive: ${game.Drive}\n`;
    });

    summaryText += `\nالألعاب المحددة: ${selected.length}\n`;
    summaryText += `الحجم الكلي: ${totalSize.toFixed(2)} جيجا\n`;
    summaryText += `السعر: ${totalPrice.toFixed(2)} جنيه`;
    generatedSummary = summaryText;
}

// Event listeners for the popup
openSummaryBtn.addEventListener('click', () => {
    // Use global selectedGames, not just filtered
    const selected = allGames.filter(game => selectedGames.has(game.Name));
    if (selected.length === 0) {
        alert('لم يتم تحديد أي ألعاب.');
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

// Copy and WhatsApp
copyListBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generatedSummary)
    .then(() => {
        alert('تم نسخ الملخص إلى الحافظة!');
        popup.style.display = 'none';
    })
    .catch(err => {
        alert('فشل النسخ. حاول مرة أخرى.');
    });
});
whatsappBtn.addEventListener('click', () => {
    const phoneNumber = "201204838286";
    const encodedMessage = encodeURIComponent(generatedSummary);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    popup.style.display = 'none';
});
