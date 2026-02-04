const searchBtn = document.getElementById('searchBtn');
const artistInput = document.getElementById('artistInput');
const container = document.getElementById('app-container');

const API_BASE = "https://musicbrainz.org/ws/2";
const HEADERS = {
    "User-Agent": "MyDiscographyApp/1.0.0 ( contact@example.com )",
    "Accept": "application/json"
};

searchBtn.addEventListener('click', () => {
    const artist = artistInput.value;
    if (artist) fetchDiscography(artist);
});

async function fetchDiscography(artistName) {
    container.innerHTML = "<p>Loading...</p>";

    try {
        // 1. Get Artist ID
        const searchRes = await fetch(`${API_BASE}/artist?query=${encodeURIComponent(artistName)}&fmt=json`, { headers: HEADERS });
        const searchData = await searchRes.json();
        const artistId = searchData.artists[0].id;

        // 2. Get Release Groups
        const discoRes = await fetch(`${API_BASE}/artist/${artistId}?inc=release-groups&fmt=json`, { headers: HEADERS });
        const discoData = await discoRes.json();

        // 3. Filter and Sort
        const albums = discoData['release-groups']
            .filter(group => group['primary-type'] === 'Album')
            .sort((a, b) => new Date(a['first-release-date']) - new Date(b['first-release-date']));

        renderAlbums(albums);
    } catch (err) {
        container.innerHTML = "<p>Error fetching data. Try a different artist.</p>";
    }
}

function renderAlbums(albums) {
    container.innerHTML = ""; // Clear loading text

    albums.forEach(album => {
        const year = album['first-release-date'] ? album['first-release-date'].split('-')[0] : 'N/A';

        const card = document.createElement('div');
        card.className = 'album-card';
        card.innerHTML = `
            <img src="https://coverartarchive.org/release-group/${album.id}/front-250" 
                 onerror="this.src='https://via.placeholder.com/250/222/777?text=No+Cover'">
            <div class="album-title">${album.title}</div>
            <div class="album-year">${year}</div>
        `;
        container.appendChild(card);
    });
}
