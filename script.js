// Adapted for new UI structure with Corona Admin
// Assumes JSON data is loaded from JSON/games.json (adjust as needed)

let gamesData = [];

// Fetch the games data on load
document.addEventListener('DOMContentLoaded', () => {
    fetch('JSON/games.json')
        .then(response => response.json())
        .then(data => {
            gamesData = data;
            renderTable(gamesData);
        })
        .catch(error => {
            console.error('Error loading games.json:', error);
        });

    // Attach search event
    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        searchGames();
    });
});

function searchGames() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!searchTerm) {
        renderTable(gamesData);
        return;
    }
    const filtered = gamesData.filter(game =>
        (game.title && game.title.toLowerCase().includes(searchTerm)) ||
        (game.platform && game.platform.toLowerCase().includes(searchTerm)) ||
        (game.genre && game.genre.toLowerCase().includes(searchTerm))
    );
    renderTable(filtered);
}

function renderTable(data) {
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = '';
    if (!data.length) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No results found.</td></tr>';
        return;
    }
    data.forEach(game => {
        const row = document.createElement('tr');

        // Image cell
        const imgTd = document.createElement('td');
        if (game.image) {
            imgTd.innerHTML = `<img src="images/${game.image}" alt="${game.title}" class="game-img-table" style="height:48px;">`;
        } else {
            imgTd.innerHTML = `<span class="text-muted">N/A</span>`;
        }
        row.appendChild(imgTd);

        // Title
        const titleTd = document.createElement('td');
        titleTd.textContent = game.title || '';
        row.appendChild(titleTd);

        // Platform
        const platTd = document.createElement('td');
        platTd.textContent = game.platform || '';
        row.appendChild(platTd);

        // Genre
        const genreTd = document.createElement('td');
        genreTd.textContent = game.genre || '';
        row.appendChild(genreTd);

        // Release
        const relTd = document.createElement('td');
        relTd.textContent = game.release || '';
        row.appendChild(relTd);

        tableBody.appendChild(row);
    });
}