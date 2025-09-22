// Windows 11 Style Mangawii Game Indexer
class MangawiiGameIndexer {
    constructor() {
        this.currentSection = 'dashboard';
        this.games = [];
        this.favorites = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.renderDashboard();
        this.setupWindowControls();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // View toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.currentTarget.dataset.view);
            });
        });

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.currentTarget);
            });
        });

        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('gameModal').addEventListener('click', (e) => {
            if (e.target.id === 'gameModal') {
                this.closeModal();
            }
        });
    }

    setupWindowControls() {
        // Window control buttons (for demo purposes)
        document.querySelector('.minimize').addEventListener('click', () => {
            this.showNotification('Minimize clicked');
        });

        document.querySelector('.maximize').addEventListener('click', () => {
            this.showNotification('Maximize clicked');
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.showNotification('Close clicked');
        });
    }

    navigateToSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;

        // Load section-specific content
        switch (section) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'games':
                this.renderGames();
                break;
            case 'library':
                this.renderLibrary();
                break;
            case 'favorites':
                this.renderFavorites();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    loadSampleData() {
        this.games = [
            {
                id: 1,
                title: 'Cyberpunk 2077',
                genre: 'RPG',
                icon: 'fas fa-robot',
                lastPlayed: '2 hours ago',
                playTime: '45h',
                rating: 4.5,
                isFavorite: true
            },
            {
                id: 2,
                title: 'The Witcher 3',
                genre: 'RPG',
                icon: 'fas fa-sword',
                lastPlayed: '1 day ago',
                playTime: '120h',
                rating: 5.0,
                isFavorite: true
            },
            {
                id: 3,
                title: 'Minecraft',
                genre: 'Sandbox',
                icon: 'fas fa-cube',
                lastPlayed: '3 hours ago',
                playTime: '200h',
                rating: 4.8,
                isFavorite: false
            },
            {
                id: 4,
                title: 'Among Us',
                genre: 'Party',
                icon: 'fas fa-users',
                lastPlayed: '5 minutes ago',
                playTime: '15h',
                rating: 4.2,
                isFavorite: false
            },
            {
                id: 5,
                title: 'Valorant',
                genre: 'FPS',
                icon: 'fas fa-crosshairs',
                lastPlayed: '30 minutes ago',
                playTime: '80h',
                rating: 4.6,
                isFavorite: true
            },
            {
                id: 6,
                title: 'League of Legends',
                genre: 'MOBA',
                icon: 'fas fa-trophy',
                lastPlayed: '1 hour ago',
                playTime: '300h',
                rating: 4.4,
                isFavorite: false
            }
        ];

        this.favorites = this.games.filter(game => game.isFavorite);
    }

    renderDashboard() {
        this.renderRecentGames();
        this.updateStats();
    }

    renderRecentGames() {
        const recentGamesContainer = document.getElementById('recentGames');
        const recentGames = this.games.slice(0, 4);

        recentGamesContainer.innerHTML = recentGames.map(game => `
            <div class="game-item" onclick="gameIndexer.openGameModal(${game.id})">
                <div class="game-icon">
                    <i class="${game.icon}"></i>
                </div>
                <div class="game-info">
                    <h4>${game.title}</h4>
                    <p>Last played: ${game.lastPlayed}</p>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        // Update stats cards with real data
        const totalGames = this.games.length;
        const totalPlayTime = this.games.reduce((sum, game) => {
            const hours = parseInt(game.playTime.replace('h', ''));
            return sum + hours;
        }, 0);
        const totalFavorites = this.favorites.length;
        const totalAchievements = Math.floor(Math.random() * 200) + 100; // Mock data

        // Update the stat numbers (you'd need to add IDs to the stat elements)
        console.log('Stats updated:', { totalGames, totalPlayTime, totalFavorites, totalAchievements });
    }

    renderGames() {
        const gamesContainer = document.getElementById('gamesContainer');
        
        gamesContainer.innerHTML = this.games.map(game => `
            <div class="game-card" onclick="gameIndexer.openGameModal(${game.id})">
                <div class="game-card-image">
                    <i class="${game.icon}"></i>
                </div>
                <div class="game-card-title">${game.title}</div>
                <div class="game-card-genre">${game.genre}</div>
            </div>
        `).join('');
    }

    renderLibrary() {
        const librarySection = document.getElementById('library');
        librarySection.innerHTML = `
            <div class="content-card">
                <div class="card-header">
                    <h3>Library Management</h3>
                </div>
                <p>Library management features coming soon...</p>
            </div>
        `;
    }

    renderFavorites() {
        const favoritesSection = document.getElementById('favorites');
        
        favoritesSection.innerHTML = `
            <div class="content-card">
                <div class="card-header">
                    <h3>Your Favorite Games</h3>
                </div>
                <div class="games-container">
                    ${this.favorites.map(game => `
                        <div class="game-card" onclick="gameIndexer.openGameModal(${game.id})">
                            <div class="game-card-image">
                                <i class="${game.icon}"></i>
                            </div>
                            <div class="game-card-title">${game.title}</div>
                            <div class="game-card-genre">${game.genre}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSettings() {
        const settingsSection = document.getElementById('settings');
        settingsSection.innerHTML = `
            <div class="content-card">
                <div class="card-header">
                    <h3>Application Settings</h3>
                </div>
                <div class="settings-content">
                    <div class="setting-item">
                        <label>Theme</label>
                        <select>
                            <option>Light</option>
                            <option>Dark</option>
                            <option>System</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Language</label>
                        <select>
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    handleSearch(query) {
        if (this.currentSection === 'games') {
            const filteredGames = this.games.filter(game => 
                game.title.toLowerCase().includes(query.toLowerCase()) ||
                game.genre.toLowerCase().includes(query.toLowerCase())
            );
            
            const gamesContainer = document.getElementById('gamesContainer');
            gamesContainer.innerHTML = filteredGames.map(game => `
                <div class="game-card" onclick="gameIndexer.openGameModal(${game.id})">
                    <div class="game-card-image">
                        <i class="${game.icon}"></i>
                    </div>
                    <div class="game-card-title">${game.title}</div>
                    <div class="game-card-genre">${game.genre}</div>
                </div>
            `).join('');
        }
    }

    toggleView(view) {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        const gamesContainer = document.getElementById('gamesContainer');
        if (view === 'list') {
            gamesContainer.style.gridTemplateColumns = '1fr';
            gamesContainer.classList.add('list-view');
        } else {
            gamesContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
            gamesContainer.classList.remove('list-view');
        }
    }

    handleQuickAction(button) {
        const action = button.querySelector('span').textContent;
        
        switch (action) {
            case 'Add Game':
                this.showNotification('Add Game feature coming soon!');
                break;
            case 'Import Library':
                this.showNotification('Import Library feature coming soon!');
                break;
            case 'Share Library':
                this.showNotification('Share Library feature coming soon!');
                break;
        }
    }

    openGameModal(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        document.getElementById('modalTitle').textContent = game.title;
        document.getElementById('modalBody').innerHTML = `
            <div class="game-details">
                <div class="game-detail-item">
                    <strong>Genre:</strong> ${game.genre}
                </div>
                <div class="game-detail-item">
                    <strong>Last Played:</strong> ${game.lastPlayed}
                </div>
                <div class="game-detail-item">
                    <strong>Play Time:</strong> ${game.playTime}
                </div>
                <div class="game-detail-item">
                    <strong>Rating:</strong> ${game.rating}/5.0
                </div>
                <div class="game-detail-item">
                    <strong>Favorite:</strong> ${game.isFavorite ? 'Yes' : 'No'}
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="gameIndexer.launchGame(${game.id})">
                    <i class="fas fa-play"></i>
                    Launch Game
                </button>
                <button class="btn-secondary" onclick="gameIndexer.toggleFavorite(${game.id})">
                    <i class="fas fa-heart"></i>
                    ${game.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
            </div>
        `;

        document.getElementById('gameModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('gameModal').classList.remove('active');
    }

    launchGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        this.showNotification(`Launching ${game.title}...`);
        this.closeModal();
    }

    toggleFavorite(gameId) {
        const game = this.games.find(g => g.id === gameId);
        game.isFavorite = !game.isFavorite;
        
        if (game.isFavorite) {
            this.favorites.push(game);
        } else {
            this.favorites = this.favorites.filter(f => f.id !== gameId);
        }

        this.showNotification(`${game.title} ${game.isFavorite ? 'added to' : 'removed from'} favorites`);
        this.closeModal();
        
        // Refresh current section
        this.navigateToSection(this.currentSection);
    }

    showNotification(message) {
        // Create a Windows 11 style notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--surface-primary);
            border: 1px solid var(--border-primary);
            border-radius: var(--radius-lg);
            padding: 16px 20px;
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .game-details {
        margin-bottom: 20px;
    }

    .game-detail-item {
        margin-bottom: 8px;
        color: var(--text-secondary);
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        margin-top: 20px;
    }

    .settings-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .setting-item label {
        font-weight: 500;
        color: var(--text-primary);
    }

    .setting-item select {
        padding: 8px 12px;
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-md);
        background-color: var(--background-secondary);
        color: var(--text-primary);
    }
`;

// Add notification styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize the application
let gameIndexer;
document.addEventListener('DOMContentLoaded', () => {
    gameIndexer = new MangawiiGameIndexer();
});
