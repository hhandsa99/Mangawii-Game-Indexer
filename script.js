// ===== DOM ELEMENTS =====
const totalGamesEl = document.getElementById('totalGames');
const totalSizeEl = document.getElementById('totalSize');
const totalPriceEl = document.getElementById('totalPrice');
const totalGamesCountEl = document.getElementById('totalGamesCount');
const openSummaryBtn = document.getElementById('openSummaryPopup');
const popup = document.getElementById('popup');
const closeBtn = document.getElementById('closeBtn');
const summaryTextDiv = document.getElementById('summaryText');
const copyListBtn = document.getElementById('copyListBtn');
const whatsappBtn = document.getElementById('whatsappBtn');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const selectAllCheckbox = document.getElementById('selectAll');
const loadingOverlay = document.getElementById('loadingOverlay');

// ===== STATE MANAGEMENT =====
let allGames = [];
let filteredGames = [];
let selectedGames = new Set();
let generatedSummary = '';

// ===== THEME MANAGEMENT =====
function setThemeIcon() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    themeIcon.className = isDark ? 'fas fa-moon theme-icon' : 'fas fa-sun theme-icon';
    themeIcon.style.color = isDark ? '#fbbf24' : '#f59e0b';
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    setThemeIcon();
    
    // Add animation to theme toggle
    themeIcon.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeIcon.style.transform = 'rotate(0deg)';
    }, 300);
}

// ===== LOADING MANAGEMENT =====
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// ===== SEARCH FUNCTIONALITY =====
function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    searchClear.style.display = query ? 'flex' : 'none';
    
    if (!query) {
        filteredGames = [...allGames];
    } else {
        filteredGames = allGames.filter(game =>
            game.Name.toLowerCase().includes(query)
        );
    }
    
    renderGames();
    updateSummary();
    updateGamesCount();
}

function clearSearch() {
    searchInput.value = '';
    searchClear.style.display = 'none';
    handleSearch();
}

// ===== GAME RENDERING =====
function renderGames() {
    const tableBody = document.querySelector('#gameList tbody');
    tableBody.innerHTML = '';

    if (filteredGames.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                لا توجد ألعاب مطابقة للبحث
            </td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }

    // Group games by first letter
    const groupedGames = filteredGames.reduce((groups, game) => {
        const letter = game.Name[0].toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(game);
        return groups;
    }, {});

    // Render grouped games
    for (const letter of Object.keys(groupedGames).sort()) {
        // Letter separator
        const separatorRow = document.createElement('tr');
        separatorRow.className = 'letter-separator';
        separatorRow.innerHTML = `<td colspan="3">${letter}</td>`;
        tableBody.appendChild(separatorRow);

        // Games in this letter group
        groupedGames[letter].forEach(game => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="checkbox-col">
                    <input type="checkbox" class="game-checkbox" 
                           data-name="${game.Name}" 
                           ${selectedGames.has(game.Name) ? 'checked' : ''}>
                </td>
                <td class="name-col">${game.Name}</td>
                <td class="size-col">${game.SizeGB} GB</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Add event listeners to checkboxes
    tableBody.querySelectorAll('.game-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleGameSelection);
    });

    updateSelectAllState();
}

function handleGameSelection(event) {
    const gameName = event.target.dataset.name;
    if (event.target.checked) {
        selectedGames.add(gameName);
    } else {
        selectedGames.delete(gameName);
    }
    updateSummary();
    updateSelectAllState();
}

function handleSelectAll(event) {
    const isChecked = event.target.checked;
    filteredGames.forEach(game => {
        if (isChecked) {
            selectedGames.add(game.Name);
        } else {
            selectedGames.delete(game.Name);
        }
    });
    renderGames();
    updateSummary();
}

function updateSelectAllState() {
    const visibleGames = filteredGames.length;
    const selectedVisibleGames = filteredGames.filter(game => 
        selectedGames.has(game.Name)
    ).length;
    
    selectAllCheckbox.checked = visibleGames > 0 && selectedVisibleGames === visibleGames;
    selectAllCheckbox.indeterminate = selectedVisibleGames > 0 && selectedVisibleGames < visibleGames;
}

// ===== SUMMARY MANAGEMENT =====
function updateSummary() {
    const selected = allGames.filter(game => selectedGames.has(game.Name));
    let totalSize = selected.reduce((sum, game) => sum + parseFloat(game.SizeGB), 0);
    
    let totalPrice = totalSize;
    if (totalSize > 100) {
        totalPrice /= 2;
    }
    totalPrice = Math.round(totalPrice / 5) * 5;
    if (selected.length > 0 && totalPrice < 20) {
        totalPrice = 20;
    }

    // Update UI with animation
    animateValue(totalGamesEl, parseInt(totalGamesEl.textContent) || 0, selected.length, 500);
    animateValue(totalSizeEl, parseFloat(totalSizeEl.textContent) || 0, totalSize, 500);
    animateValue(totalPriceEl, parseFloat(totalPriceEl.textContent) || 0, totalPrice, 500);

    // Generate summary text (still includes drive info in popup)
    let summaryText = '';
    selected.forEach(game => {
        summaryText += `${game.Name} | ${game.SizeGB} GB | Drive: ${game.Drive}\n`;
    });

    summaryText += `\nالألعاب المحددة: ${selected.length}\n`;
    summaryText += `الحجم الكلي: ${totalSize.toFixed(2)} جيجا\n`;
    summaryText += `السعر: ${totalPrice.toFixed(2)} جنيه`;
    generatedSummary = summaryText;
}

function updateGamesCount() {
    animateValue(totalGamesCountEl, parseInt(totalGamesCountEl.textContent) || 0, filteredGames.length, 300);
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const isFloat = element.id === 'totalSize' || element.id === 'totalPrice';
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * progress;
        
        element.textContent = isFloat ? current.toFixed(2) : Math.round(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ===== POPUP MANAGEMENT =====
function openSummaryPopup() {
    const selected = allGames.filter(game => selectedGames.has(game.Name));
    if (selected.length === 0) {
        showNotification('لم يتم تحديد أي ألعاب.', 'warning');
        return;
    }
    
    summaryTextDiv.textContent = generatedSummary;
    popup.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSummaryPopup() {
    popup.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function copyToClipboard() {
    navigator.clipboard.writeText(generatedSummary)
        .then(() => {
            showNotification('تم نسخ الملخص إلى الحافظة!', 'success');
            closeSummaryPopup();
        })
        .catch(() => {
            showNotification('فشل النسخ. حاول مرة أخرى.', 'error');
        });
}

function sendToWhatsApp() {
    const phoneNumber = "201204838286";
    const encodedMessage = encodeURIComponent(generatedSummary);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    closeSummaryPopup();
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
        padding: var(--space-md) var(--space-lg);
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        color: var(--text-primary);
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===== DATA LOADING =====
async function loadGames() {
    showLoading();
    
    try {
        const response = await fetch('JSON/filelist.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const fileNames = await response.json();
        const jsonFiles = fileNames.map(name => `JSON/${name}`);
        
        const results = await Promise.all(
            jsonFiles.map(file => 
                fetch(file).then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status} for file ${file}`);
                    return res.json();
                })
            )
        );
        
        allGames = results.flat();
        allGames.sort((a, b) => a.Name.localeCompare(b.Name));
        filteredGames = [...allGames];
        
        renderGames();
        updateSummary();
        updateGamesCount();
        
    } catch (error) {
        console.error('Error loading game data:', error);
        document.querySelector('.games-table-container').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>تعذر تحميل قائمة الألعاب</h3>
                <p>تأكد من وجود ملفات JSON في المكان الصحيح.</p>
                <button onclick="loadGames()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">
                    إعادة المحاولة
                </button>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    setThemeIcon();
    loadGames();
});

themeToggleBtn.addEventListener('click', toggleTheme);
searchInput.addEventListener('input', handleSearch);
searchClear.addEventListener('click', clearSearch);
selectAllCheckbox.addEventListener('change', handleSelectAll);
openSummaryBtn.addEventListener('click', openSummaryPopup);
closeBtn.addEventListener('click', closeSummaryPopup);
copyListBtn.addEventListener('click', copyToClipboard);
whatsappBtn.addEventListener('click', sendToWhatsApp);

// Close popup when clicking outside
popup.addEventListener('click', (e) => {
    if (e.target === popup) {
        closeSummaryPopup();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('show')) {
        closeSummaryPopup();
    }
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
});

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
