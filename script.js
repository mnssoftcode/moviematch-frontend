// ===== GLOBAL VARIABLES =====
let movies = [];
let selectedGenres = [];
let filteredMovies = [];
let currentPage = 1;
const MOVIES_PER_PAGE = 50;
let genresExpanded = false;
const GENRES_PER_PAGE = 20;

// Curated list of popular genres
const popularGenres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "Horror", "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western"
];

// ===== MOOD TO GENRE MAPPING =====
const moodToGenres = {
    happy: ["Comedy", "Feel-good", "Adventure", "Family", "Romance"],
    sad: ["Drama", "Feel-good", "Romance", "Comedy", "Biography"],
    excited: ["Action", "Adventure", "Science Fiction", "Thriller", "War"],
    relaxed: ["Comedy", "Feel-good", "Adventure", "Family", "Romance"],
    stressed: ["Comedy", "Feel-good", "Adventure", "Family", "Romance"],
    romantic: ["Romance", "Drama", "Comedy", "Feel-good", "Musical"],
    mysterious: ["Mystery", "Thriller", "Crime", "Psychological", "Horror"],
    dark: ["Thriller", "Horror", "Crime", "Psychological", "Drama"],
    nostalgic: ["Classic", "Drama", "Feel-good", "Adventure", "Biography"],
    inspired: ["Drama", "Biography", "Adventure", "Epic", "Historical"]
};

// ===== AI INTEGRATION =====
async function getGenresFromAI(moodText) {
    try {
        // Use Render backend URL in production, localhost in development
        const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://127.0.0.1:8000' 
            : 'YOUR_RENDER_BACKEND_URL'; // TODO: Update with your actual Render backend URL
        
        const response = await fetch(`${backendUrl}/predict`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ text: moodText })
        });
        
        if (!response.ok) {
            throw new Error(`AI service error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.genres.map(item => item[0]); // return just genre names
    } catch (error) {
        console.error("AI prediction failed:", error);
        // Fallback to rule-based approach if AI fails
        return analyzeMood(moodText);
    }
}

// ===== DOM ELEMENTS =====
const elements = {
    moodInput: document.getElementById('moodInput'),
    getMoodRecommendations: document.getElementById('getMoodRecommendations'),
    movieNameSearch: document.getElementById('movieNameSearch'),
    searchByName: document.getElementById('searchByName'),
    genresGrid: document.getElementById('genresGrid'),
    clearGenres: document.getElementById('clearGenres'),
    getGenreRecommendations: document.getElementById('getGenreRecommendations'),
    showAllMovies: document.getElementById('showAllMovies'),
    resultsSection: document.getElementById('resultsSection'),
    resultsTitle: document.getElementById('resultsTitle'),
    resultsCount: document.getElementById('resultsCount'),
    moviesContainer: document.getElementById('moviesContainer'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    movieModal: document.getElementById('movieModal'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalClose: document.getElementById('modalClose'),
    modalBody: document.getElementById('modalBody')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('MovieMatch app initializing...');
    loadMovies();
    setupEventListeners();
});

// ===== DATA LOADING =====
async function loadMovies() {
    try {
        console.log('Loading movies dataset...');
        const response = await fetch('movies_combined.json');
        if (!response.ok) {
            throw new Error(`Failed to load movies: ${response.status}`);
        }
        movies = await response.json();
        console.log(`Loaded ${movies.length} movies successfully`);
        // Only show popular genres that exist in the dataset
        const allGenres = new Set();
        movies.forEach(movie => {
            if (movie.tags && Array.isArray(movie.tags)) {
                movie.tags.forEach(tag => allGenres.add(tag));
            }
        });
        const availableGenres = popularGenres.filter(g => allGenres.has(g));
        renderGenres(availableGenres);
    } catch (error) {
        console.error('Error loading movies:', error);
        loadSampleMovies();
    }
}

function loadSampleMovies() {
    console.log('Loading sample movies as fallback...');
    movies = [
        {
            id: 1,
            title: "Spider-Man: No Way Home",
            year: "2021",
            rating: 8.3,
            description: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero.",
            tags: ["Action", "Adventure", "Science Fiction"],
            poster: "https://image.tmdb.org/t/p/original/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"
        },
        {
            id: 2,
            title: "The Batman",
            year: "2022",
            rating: 8.1,
            description: "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family.",
            tags: ["Crime", "Mystery", "Thriller"],
            poster: "https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg"
        }
    ];
    // Only show popular genres that exist in the sample
    const allGenres = new Set();
    movies.forEach(movie => {
        if (movie.tags && Array.isArray(movie.tags)) {
            movie.tags.forEach(tag => allGenres.add(tag));
        }
    });
    const availableGenres = popularGenres.filter(g => allGenres.has(g));
    renderGenres(availableGenres);
}

// ===== GENRE RENDERING =====
function renderGenres(genres) {
    elements.genresGrid.innerHTML = '';
    let genresToShow = genres;
    if (!genresExpanded && genres.length > GENRES_PER_PAGE) {
        genresToShow = genres.slice(0, GENRES_PER_PAGE);
    }
    genresToShow.forEach(genre => {
        const genreElement = document.createElement('div');
        genreElement.className = 'genre-tag';
        genreElement.textContent = genre;
        genreElement.addEventListener('click', () => toggleGenre(genre, genreElement));
        elements.genresGrid.appendChild(genreElement);
    });
    // Add Show More/Less button if needed
    if (genres.length > GENRES_PER_PAGE) {
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = genresExpanded ? 'Show Less Genres' : 'Show More Genres';
        toggleBtn.className = 'btn btn-secondary';
        toggleBtn.style.display = 'block';
        toggleBtn.style.margin = '20px auto 0 auto';
        toggleBtn.onclick = () => {
            genresExpanded = !genresExpanded;
            renderGenres(genres);
        };
        elements.genresGrid.appendChild(toggleBtn);
    }
}

function toggleGenre(genre, element) {
    if (selectedGenres.includes(genre)) {
        selectedGenres = selectedGenres.filter(g => g !== genre);
        element.classList.remove('selected');
    } else {
        selectedGenres.push(genre);
        element.classList.add('selected');
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Mood recommendations
    elements.getMoodRecommendations.addEventListener('click', getMoodRecommendations);
    
    // Name search
    elements.searchByName.addEventListener('click', searchMoviesByName);
    elements.movieNameSearch.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchMoviesByName();
        }
    });
    
    // Genre recommendations
    elements.clearGenres.addEventListener('click', clearAllGenres);
    elements.getGenreRecommendations.addEventListener('click', getGenreRecommendations);
    elements.showAllMovies.addEventListener('click', showAllMovies);
    
    // Modal
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', closeModal);
    
    // Keyboard events
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && elements.movieModal.style.display === 'block') {
            closeModal();
        }
    });
}

// ===== SEARCH FUNCTIONS =====
function setButtonLoading(btn, loading) {
    if (loading) {
        btn.disabled = true;
        btn.classList.add('btn-loading');
        btn._originalText = btn.innerHTML;
        btn.innerHTML = '<span class="btn-spinner"></span>Loading...';
    } else {
        btn.disabled = false;
        btn.classList.remove('btn-loading');
        if (btn._originalText) btn.innerHTML = btn._originalText;
    }
}

async function getMoodRecommendations() {
    const moodText = elements.moodInput.value.trim();
    if (!moodText) {
        alert('Please describe your mood to get AI recommendations!');
        return;
    }
    setButtonLoading(elements.getMoodRecommendations, true);
    
    try {
        // Use AI to predict genres based on mood
        const recommendedGenres = await getGenresFromAI(moodText);
        filterMoviesByGenres(recommendedGenres);
        setButtonLoading(elements.getMoodRecommendations, false);
        showResults(`Found ${filteredMovies.length} movies perfect for your mood: "${moodText}"`);
    } catch (error) {
        console.error("Error getting mood recommendations:", error);
        setButtonLoading(elements.getMoodRecommendations, false);
        alert("Failed to get AI recommendations. Please try again.");
    }
}

function getGenreRecommendations() {
    if (selectedGenres.length === 0) {
        alert('Please select at least one genre to get recommendations!');
        return;
    }
    setButtonLoading(elements.getGenreRecommendations, true);
    setTimeout(() => {
        filterMoviesByGenres(selectedGenres);
        setButtonLoading(elements.getGenreRecommendations, false);
        showResults(`Found ${filteredMovies.length} movies based on your selected genres`);
    }, 1000);
}

function showAllMovies() {
    setButtonLoading(elements.showAllMovies, true);
    setTimeout(() => {
        filteredMovies = [...movies].sort((a, b) => b.rating - a.rating);
        setButtonLoading(elements.showAllMovies, false);
        showResults(`Showing all ${filteredMovies.length} movies (sorted by rating)`);
    }, 500);
}

function searchMoviesByName() {
    const searchTerm = elements.movieNameSearch.value.trim();
    if (!searchTerm) {
        alert('Please enter a movie name to search!');
        return;
    }
    setButtonLoading(elements.searchByName, true);
    setTimeout(() => {
        const searchLower = searchTerm.toLowerCase();
        filteredMovies = movies.filter(movie => 
            movie.title.toLowerCase().includes(searchLower)
        ).sort((a, b) => b.rating - a.rating);
        setButtonLoading(elements.searchByName, false);
        showResults(`Found ${filteredMovies.length} movies matching "${searchTerm}"`);
    }, 500);
}

// ===== MOOD ANALYSIS =====
function analyzeMood(moodText) {
    const text = moodText.toLowerCase();
    const recommendedGenres = [];
    
    // Check for mood keywords
    if (text.includes('happy') || text.includes('joy') || text.includes('excited') || text.includes('good')) {
        recommendedGenres.push(...moodToGenres.happy);
    }
    if (text.includes('sad') || text.includes('depressed') || text.includes('down')) {
        recommendedGenres.push(...moodToGenres.sad);
    }
    if (text.includes('romantic') || text.includes('love') || text.includes('romance')) {
        recommendedGenres.push(...moodToGenres.romantic);
    }
    if (text.includes('mysterious') || text.includes('mystery') || text.includes('suspense')) {
        recommendedGenres.push(...moodToGenres.mysterious);
    }
    if (text.includes('dark') || text.includes('scary') || text.includes('horror')) {
        recommendedGenres.push(...moodToGenres.dark);
    }
    if (text.includes('inspired') || text.includes('motivated') || text.includes('uplifting')) {
        recommendedGenres.push(...moodToGenres.inspired);
    }
    if (text.includes('relaxed') || text.includes('calm') || text.includes('peaceful')) {
        recommendedGenres.push(...moodToGenres.relaxed);
    }
    if (text.includes('stressed') || text.includes('anxious') || text.includes('worried')) {
        recommendedGenres.push(...moodToGenres.stressed);
    }
    
    // Default to feel-good movies if no specific mood detected
    if (recommendedGenres.length === 0) {
        recommendedGenres.push(...moodToGenres.happy);
    }
    
    return [...new Set(recommendedGenres)]; // Remove duplicates
}

// ===== FILTERING =====
function filterMoviesByGenres(genres) {
    console.log('Filtering movies by genres:', genres);
    
    if (genres.length === 0) {
        filteredMovies = [...movies];
    } else {
        filteredMovies = movies.filter(movie => {
            return genres.some(genre => 
                movie.tags.some(movieTag => 
                    movieTag.toLowerCase().includes(genre.toLowerCase())
                )
            );
        });
    }
    
    // Sort by rating (highest first)
    filteredMovies.sort((a, b) => b.rating - a.rating);
    
    console.log(`Filtered to ${filteredMovies.length} movies`);
}

// ===== UI FUNCTIONS =====
function clearAllGenres() {
    selectedGenres = [];
    document.querySelectorAll('.genre-tag').forEach(tag => {
        tag.classList.remove('selected');
    });
}

function showResults(countText) {
    elements.resultsSection.style.display = 'block';
    elements.resultsCount.textContent = countText;
    currentPage = 1;
    renderMovies();
    // Smooth scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// ===== MOVIE RENDERING =====
function renderMovies() {
    elements.moviesContainer.innerHTML = '';
    const startIdx = (currentPage - 1) * MOVIES_PER_PAGE;
    const endIdx = startIdx + MOVIES_PER_PAGE;
    const moviesToShow = filteredMovies.slice(startIdx, endIdx);

    if (moviesToShow.length === 0) {
        elements.moviesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; width: 100%;">
                <h3>No movies found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    moviesToShow.forEach((movie, idx) => {
        const movieCard = createMovieCard(movie);
        movieCard.style.setProperty('--card-index', idx);
        elements.moviesContainer.appendChild(movieCard);
    });

    // Add Load More button if there are more movies
    if (endIdx < filteredMovies.length) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.onclick = () => {
            currentPage++;
            renderMovies();
        };
        elements.moviesContainer.appendChild(loadMoreBtn);
    }
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.addEventListener('click', () => showMovieDetails(movie));
    
    const safeTitle = movie.title || 'Unknown Title';
    const safeYear = movie.year || 'Unknown';
    const safeRating = movie.rating || 0;
    const safeDescription = movie.description || 'No description available';
    const safeTags = Array.isArray(movie.tags) ? movie.tags : [];
    const safePoster = movie.poster || '';
    
    card.innerHTML = `
        <div class="movie-poster">
            ${safePoster ? `<img src="${safePoster}" alt="${safeTitle}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <div class="movie-poster-fallback" style="display: ${safePoster ? 'none' : 'flex'};">
                <i class="fas fa-film"></i>
            </div>
            <div class="movie-rating">${safeRating}</div>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${safeTitle}</h3>
            <div class="movie-year">${safeYear}</div>
            <div class="movie-description">${safeDescription.substring(0, 100)}${safeDescription.length > 100 ? '...' : ''}</div>
            <div class="movie-genres">
                ${safeTags.slice(0, 3).map(tag => `<span class="movie-genre">${tag}</span>`).join('')}
                ${safeTags.length > 3 ? `<span class="movie-genre">+${safeTags.length - 3} more</span>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// ===== MODAL FUNCTIONS =====
function showMovieDetails(movie) {
    const filledStars = Math.floor(movie.rating || 0);
    const emptyStars = Math.max(0, 5 - filledStars);
    const stars = '★'.repeat(filledStars) + '☆'.repeat(emptyStars);
    
    elements.modalBody.innerHTML = `
        <div class="modal-movie-header">
            <div class="modal-poster">
                <img src="${movie.poster}" alt="${movie.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="modal-poster-fallback" style="display: ${movie.poster ? 'none' : 'flex'};">
                    <i class="fas fa-film"></i>
                </div>
            </div>
            <div class="modal-movie-info">
                <h2>${movie.title}</h2>
                <div class="modal-movie-meta">
                    ${movie.year} • Rating: ${movie.rating}/10
                </div>
                <div class="modal-rating">
                    <span class="rating-stars">${stars}</span>
                </div>
            </div>
        </div>
        
        <div class="modal-description">
            ${movie.description}
        </div>
        
        <div class="modal-genres">
            ${movie.tags.map(tag => `<span class="modal-genre">${tag}</span>`).join('')}
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <button class="watch-movie-btn" id="watch-movie-btn" cursor: pointer;">🔎 Watch</button>
        </div>
    `;
    
    // Add event listener for the Watch button
    setTimeout(() => {
        const watchBtn = document.getElementById('watch-movie-btn');
        if (watchBtn) {
            watchBtn.onclick = () => {
                const searchUrl = `https://www.google.com/search?q=watch+${encodeURIComponent(movie.title)}+online`;
                window.open(searchUrl, '_blank');
            };
        }
    }, 0);
    
    elements.movieModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.movieModal.style.display = 'none';
    document.body.style.overflow = 'auto';
} 