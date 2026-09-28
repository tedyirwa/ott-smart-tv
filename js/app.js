const playButton = document.querySelector(".play-button");
const playerStatus = document.querySelector(".player-status");
const videoPlayer = document.querySelector(".video-player");

const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const currentTimeElement = document.querySelector(".current-time");
const durationElement = document.querySelector(".duration");

// Video Player

let isPlaying = false;

playButton.addEventListener("click", function () {
    if (videoPlayer.paused) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }
});

videoPlayer.addEventListener("play", function () {
    isPlaying = true;

    playButton.textContent = "PAUSE";
    playerStatus.textContent = "Video is playing";
});

videoPlayer.addEventListener("pause", function () {
    isPlaying = false;

    playButton.textContent = "PLAY";
    playerStatus.textContent = "Video is paused";
});

videoPlayer.addEventListener("waiting", function () {
    playerStatus.textContent = "Buffering...";
});

videoPlayer.addEventListener("ended", function () {
    isPlaying = false;

    playButton.textContent = "PLAY";
    playerStatus.textContent = "Video finished";
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return String(minutes).padStart(2, "0") + ":" + String(remainingSeconds).padStart(2, "0");
}

videoPlayer.addEventListener("timeupdate", function () {
    const currentTime = videoPlayer.currentTime;
    const duration = videoPlayer.duration;

    if (!Number.isFinite(duration)) {
        return;
    }

    const progress = (currentTime / duration) * 100;

    progressBar.style.width = progress + "%";
    currentTimeElement.textContent = formatTime(currentTime);
});

videoPlayer.addEventListener("loadedmetadata", function () {
    durationElement.textContent = formatTime(videoPlayer.duration);
});

videoPlayer.addEventListener("error", function () {
    playerStatus.textContent = "Video error";

    console.error("Video playback error");

    if (videoPlayer.error) {
        console.error("Error code:", videoPlayer.error.code);
        console.error("Error message:", videoPlayer.error.message);
    }
});

progressContainer.addEventListener("click", function (event) {
    const rect = progressContainer.getBoundingClientRect();

    const clickPosition = event.clientX - rect.left;

    const clickPercentage = (clickPosition / rect.width) * 100;

    const seekTime = (clickPercentage / 100) * videoPlayer.duration;

    videoPlayer.currentTime = seekTime;
});

// Focus Navigation

let focusedRow = 0;
let focusedColumn = 0;

let movieCards = document.querySelectorAll(".content-card");
let movieRows = document.querySelectorAll(".content-row");

document.addEventListener("focusin", function () {
    movieRows.forEach(function (row, rowIndex) {
        const rowCards = row.querySelectorAll(".content-card");

        rowCards.forEach(function (card, columnIndex) {
            if (card === document.activeElement) {
                focusedRow = rowIndex;
                focusedColumn = columnIndex;
            }
        });
    });
});

function restoreFocus() {
    const rowCards = movieRows[focusedRow].querySelectorAll(".content-card");

    if (rowCards.length === 0) {
        return;
    }

    const targetColumn = Math.min(focusedColumn, rowCards.length - 1);

    rowCards[targetColumn].focus();
}

// Helper function to keep the focused card visible within the row
function keepFocusedCardVisible(row, card) {
    const rowRect = row.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    if (cardRect.right > rowRect.right) {
        row.scrollLeft += cardRect.right - rowRect.right;
    }

    if (cardRect.left < rowRect.left) {
        row.scrollLeft -= rowRect.left - cardRect.left;
    }
}

// Remote

function handleNavigation(event) {
    if (document.activeElement === movieSearchInput) {
        return;
    }

    if (
        event.code === "ArrowRight" ||
        event.code === "ArrowLeft" ||
        event.code === "ArrowUp" ||
        event.code === "ArrowDown"
    ) {
        event.preventDefault();
    }

    if (event.repeat) {
        return;
    }

    if (event.code === "ArrowRight") {
        moveRight();
    }

    if (event.code === "ArrowLeft") {
        moveLeft();
    }

    if (event.code === "ArrowUp") {
        moveUp();
    }

    if (event.code === "ArrowDown") {
        moveDown();
    }

    if (event.code === "Enter") {
        selectFocusedMovie();
        return;
    }
}

function moveRight() {
    const currentRow = movieRows[focusedRow];

    if (!currentRow) {
        return;
    }

    const rowCards = currentRow.querySelectorAll(".content-card");
    const nextColumn = focusedColumn + 1;

    if (nextColumn < rowCards.length) {
        rowCards[nextColumn].focus();

        if (currentRow === popularMoviesRow && focusedColumn >= rowCards.length - 3) {
            loadNextPopularMovies();
        }

        if (currentRow === topRatedMoviesRow && focusedColumn >= rowCards.length - 3) {
            loadNextTopRatedMovies();
        }

        return;
    }

    if (currentRow === popularMoviesRow) {
        loadNextPopularMovies().then(function () {
            const updatedRowCards = popularMoviesRow.querySelectorAll(".content-card");

            if (nextColumn < updatedRowCards.length) {
                updatedRowCards[nextColumn].focus();
            }
        });

        return;
    }

    if (currentRow === topRatedMoviesRow) {
        loadNextTopRatedMovies().then(function () {
            const updatedRowCards = topRatedMoviesRow.querySelectorAll(".content-card");

            if (nextColumn < updatedRowCards.length) {
                updatedRowCards[nextColumn].focus();
            }
        });

        return;
    }
}

function moveLeft() {
    const rowCards = movieRows[focusedRow].querySelectorAll(".content-card");

    if (focusedColumn > 0) {
        rowCards[focusedColumn - 1].focus();
    }
}

function moveUp() {
    let previousRowIndex = focusedRow - 1;

    while (previousRowIndex >= 0) {
        const previousRowCards = movieRows[previousRowIndex].querySelectorAll(".content-card");

        if (previousRowCards.length === 0) {
            previousRowIndex--;
            continue;
        }

        const targetColumn = Math.min(focusedColumn, previousRowCards.length - 1);

        previousRowCards[targetColumn].focus();

        break;
    }
}

function moveDown() {
    let nextRowIndex = focusedRow + 1;

    while (nextRowIndex < movieRows.length) {
        const nextRowCards = movieRows[nextRowIndex].querySelectorAll(".content-card");

        if (nextRowCards.length === 0) {
            nextRowIndex++;
            continue;
        }

        const targetColumn = Math.min(focusedColumn, nextRowCards.length - 1);

        nextRowCards[targetColumn].focus();

        break;
    }
}

function selectFocusedMovie() {
    const focusedCard = document.activeElement;

    if (!focusedCard.classList.contains("content-card")) {
        return;
    }

    const movieId = focusedCard.dataset.movieId;

    if (!movieId) {
        return;
    }

    console.log("Opening movie detail:", movieId);

    window.location.href = "movie-detail.html?id=" + movieId;
}

document.addEventListener("keydown", handleNavigation);

// Movie Card

function createMovieCard(movie) {
    const card = document.createElement("div");

    card.className = "content-card";
    card.tabIndex = 0;
    card.dataset.movieId = movie.id;

    const poster = document.createElement("div");

    poster.className = "poster";

    const image = document.createElement("img");

    image.loading = "lazy";
    image.alt = movie.title;

    if (movie.thumbnail) {
        image.src = movie.thumbnail;

        image.addEventListener("error", function () {
            image.style.display = "none";

            poster.classList.add("poster-error");

            const fallbackIcon = document.createElement("div");
            fallbackIcon.className = "poster-error-icon";
            fallbackIcon.textContent = "🖼️";

            const fallbackText = document.createElement("div");
            fallbackText.className = "poster-error-text";
            fallbackText.textContent = "No Image";

            poster.appendChild(fallbackIcon);
            poster.appendChild(fallbackText);
        });
    } else {
        poster.classList.add("poster-error");

        const fallbackIcon = document.createElement("div");
        fallbackIcon.className = "poster-error-icon";
        fallbackIcon.textContent = "🖼️";

        const fallbackText = document.createElement("div");
        fallbackText.className = "poster-error-text";
        fallbackText.textContent = "No Image";

        poster.appendChild(fallbackIcon);
        poster.appendChild(fallbackText);
    }

    const title = document.createElement("div");

    title.className = "card-title";
    title.textContent = movie.title;

    if (movie.thumbnail) {
        poster.appendChild(image);
    }

    card.appendChild(poster);
    card.appendChild(title);

    return card;
}

function mapTmdbMovieToMovie(movie) {
    if (!movie.title) {
        return null;
    }

    return {
        id: movie.id,
        title: movie.title,
        thumbnail: getPosterUrl(movie.poster_path),
        description: movie.overview || "",
    };
}

function getPosterUrl(posterPath, size = TMDB_CONFIG.posterSmall) {
    if (!posterPath) {
        return null;
    }

    return TMDB_CONFIG.imageBaseUrl + "/" + size + posterPath;
}

// Top Rated Movies

const topRatedMoviesRow = document.querySelector("#top-rated-movies-row");

const topRatedMoviesLoading = document.querySelector("#top-rated-movies-loading");

const topRatedMoviesError = document.querySelector("#top-rated-movies-error");

let topRatedMoviesPage = 1;
let topRatedMoviesTotalPages = 1;
let topRatedMoviesLoadingMore = false;

function setTopRatedMoviesState(state, message = "") {
    topRatedMoviesLoading.style.display = state === "loading" ? "block" : "none";

    topRatedMoviesError.textContent = message;

    if (state === "loading") {
        topRatedMoviesRow.innerHTML = "";
    }
}

async function fetchTopRatedMovies(page = 1) {
    const response = await fetch(TMDB_CONFIG.baseUrl + "/movie/top_rated?page=" + page, {
        headers: {
            Authorization: "Bearer " + TMDB_CONFIG.token,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("HTTP_" + response.status);
    }

    return response.json();
}

function renderTopRatedMovies(movies) {
    topRatedMoviesRow.innerHTML = "";

    const fragment = document.createDocumentFragment();

    movies.forEach(function (movieData) {
        const movie = mapTmdbMovieToMovie(movieData);

        if (!movie) {
            return;
        }

        const card = createMovieCard(movie);

        fragment.appendChild(card);
    });

    topRatedMoviesRow.appendChild(fragment);
}

async function loadTopRatedMovies(retryCount = 0) {
    try {
        setTopRatedMoviesState("loading");

        const data = await fetchTopRatedMovies(1);

        topRatedMoviesPage = 1;
        topRatedMoviesTotalPages = data.total_pages;

        setTopRatedMoviesState("success");

        if (data.results.length === 0) {
            setTopRatedMoviesState("success", "No top rated movies available.");

            return;
        }

        renderTopRatedMovies(data.results);

        movieCards = document.querySelectorAll(".content-card");
        movieRows = document.querySelectorAll(".content-row");
    } catch (error) {
        if (retryCount < 2) {
            const delay = (retryCount + 1) * 1000;

            console.log("Retrying top rated movies in", delay / 1000, "seconds");

            await new Promise(function (resolve) {
                setTimeout(resolve, delay);
            });

            return loadTopRatedMovies(retryCount + 1);
        }

        console.error("Top rated movies error:", error);

        setTopRatedMoviesState("error", "Unable to load top rated movies.");
    }
}

let topRatedMoviesLoadingPromise = null;

async function loadNextTopRatedMovies() {
    if (topRatedMoviesLoadingPromise) {
        return topRatedMoviesLoadingPromise;
    }

    if (topRatedMoviesPage >= topRatedMoviesTotalPages) {
        return null;
    }

    const nextPage = topRatedMoviesPage + 1;

    topRatedMoviesLoadingPromise = (async function () {
        try {
            console.log("Loading top rated movies page:", nextPage);

            const data = await fetchTopRatedMovies(nextPage);

            if (data.results.length === 0) {
                topRatedMoviesPage = topRatedMoviesTotalPages;
                return;
            }

            const fragment = document.createDocumentFragment();

            data.results.forEach(function (movieData) {
                const movie = mapTmdbMovieToMovie(movieData);

                if (!movie) {
                    return;
                }

                const card = createMovieCard(movie);

                fragment.appendChild(card);
            });

            topRatedMoviesRow.appendChild(fragment);

            topRatedMoviesPage = nextPage;

            movieCards = document.querySelectorAll(".content-card");
            movieRows = document.querySelectorAll(".content-row");
        } catch (error) {
            console.error("Error loading top rated movies page:", nextPage, error);

            throw error;
        }
    })();

    try {
        return await topRatedMoviesLoadingPromise;
    } finally {
        topRatedMoviesLoadingPromise = null;
    }
}

// Popular Movies

const popularMoviesRow = document.querySelector("#popular-movies-row");

const popularMoviesLoading = document.querySelector("#popular-movies-loading");

const popularMoviesError = document.querySelector("#popular-movies-error");

function setPopularMoviesState(state, message = "") {
    popularMoviesLoading.style.display = state === "loading" ? "block" : "none";

    popularMoviesError.textContent = message;

    if (state === "loading") {
        popularMoviesRow.innerHTML = "";
    }
}

// Cache

const popularMoviesCache = {};
const popularMoviesCacheTime = {};

const CACHE_TTL = 5 * 60 * 1000;

function getCachedPopularMovies(page) {
    const cachedMovies = popularMoviesCache[page];
    const cachedTime = popularMoviesCacheTime[page];

    if (!cachedMovies || !cachedTime) {
        return null;
    }

    const cacheAge = Date.now() - cachedTime;

    if (cacheAge >= CACHE_TTL) {
        return null;
    }

    return cachedMovies;
}

function setPopularMoviesCache(page, data) {
    popularMoviesCache[page] = data;
    popularMoviesCacheTime[page] = Date.now();
}

// Request Deduplication

const popularMoviesRequests = {};

// API

async function fetchPopularMovies(page = 1) {
    const response = await fetch(TMDB_CONFIG.baseUrl + "/movie/popular?page=" + page, {
        headers: {
            Authorization: "Bearer " + TMDB_CONFIG.token,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("HTTP_" + response.status);
    }

    return response.json();
}

async function getPopularMovies(page = 1) {
    const cachedMovies = getCachedPopularMovies(page);

    if (cachedMovies) {
        console.log("Using cached popular movies page:", page);

        return cachedMovies;
    }

    if (popularMoviesRequests[page]) {
        console.log("Using existing request for page:", page);

        return popularMoviesRequests[page];
    }

    popularMoviesRequests[page] = fetchPopularMovies(page);

    try {
        const data = await popularMoviesRequests[page];

        setPopularMoviesCache(page, data);

        return data;
    } finally {
        popularMoviesRequests[page] = null;
    }
}

// Popular Pagination

let popularMoviesPage = 1;
let popularMoviesTotalPages = 1;
let popularMoviesLoadingMore = false;

function renderPopularMovies(movies) {
    popularMoviesRow.innerHTML = "";

    const fragment = document.createDocumentFragment();

    movies.forEach(function (movieData) {
        const movie = mapTmdbMovieToMovie(movieData);

        if (!movie) {
            return;
        }

        const card = createMovieCard(movie);

        fragment.appendChild(card);
    });

    popularMoviesRow.appendChild(fragment);
}

async function loadPopularMovies(retryCount = 0) {
    try {
        setPopularMoviesState("loading");

        const data = await getPopularMovies(1);

        popularMoviesPage = 1;
        popularMoviesTotalPages = data.total_pages;

        if (data.results.length === 0) {
            setPopularMoviesState("success", "No movies available.");

            return;
        }

        setPopularMoviesState("success");

        renderPopularMovies(data.results);

        movieCards = document.querySelectorAll(".content-card");
        movieRows = document.querySelectorAll(".content-row");

        if (movieCards.length > 0) {
            movieCards[0].focus();
        }
    } catch (error) {
        if (retryCount < 2) {
            const delay = (retryCount + 1) * 1000;

            console.log("Retrying TMDB request in", delay / 1000, "seconds");

            await new Promise(function (resolve) {
                setTimeout(resolve, delay);
            });

            return loadPopularMovies(retryCount + 1);
        }

        console.error("TMDB error:", error);

        if (error.message.startsWith("HTTP_")) {
            setPopularMoviesState("error", "Movie service is currently unavailable.");
        } else {
            setPopularMoviesState(
                "error",
                "Unable to connect. Please check your internet connection.",
            );
        }
    }
}

let popularMoviesLoadingPromise = null;

async function loadNextPopularMovies() {
    if (popularMoviesLoadingPromise) {
        return popularMoviesLoadingPromise;
    }

    if (popularMoviesPage >= popularMoviesTotalPages) {
        return null;
    }

    const nextPage = popularMoviesPage + 1;

    popularMoviesLoadingPromise = (async function () {
        try {
            console.log("Loading popular movies page:", nextPage);

            const data = await getPopularMovies(nextPage);

            if (data.results.length === 0) {
                popularMoviesPage = popularMoviesTotalPages;
                return;
            }

            const fragment = document.createDocumentFragment();

            data.results.forEach(function (movieData) {
                const movie = mapTmdbMovieToMovie(movieData);

                if (!movie) {
                    return;
                }

                const card = createMovieCard(movie);

                fragment.appendChild(card);
            });

            popularMoviesRow.appendChild(fragment);

            popularMoviesPage = nextPage;

            movieCards = document.querySelectorAll(".content-card");
            movieRows = document.querySelectorAll(".content-row");
        } catch (error) {
            console.error("Error loading popular movies page:", nextPage, error);

            throw error;
        }
    })();

    try {
        return await popularMoviesLoadingPromise;
    } finally {
        popularMoviesLoadingPromise = null;
    }
}

// Movie Search

const movieSearchInput = document.querySelector("#movie-search-input");

const searchMoviesLoading = document.querySelector("#search-movies-loading");

const searchMoviesError = document.querySelector("#search-movies-error");

const searchMoviesRow = document.querySelector("#search-movies-row");

let searchTimeout = null;
let searchRequestId = 0;

async function fetchSearchMovies(query) {
    const response = await fetch(
        TMDB_CONFIG.baseUrl + "/search/movie?query=" + encodeURIComponent(query),
        {
            headers: {
                Authorization: "Bearer " + TMDB_CONFIG.token,
                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) {
        throw new Error("HTTP_" + response.status);
    }

    return response.json();
}

function renderSearchMovies(movies) {
    searchMoviesRow.innerHTML = "";

    const fragment = document.createDocumentFragment();

    movies.forEach(function (movieData) {
        const movie = mapTmdbMovieToMovie(movieData);

        if (!movie) {
            return;
        }

        const card = createMovieCard(movie);

        fragment.appendChild(card);
    });

    searchMoviesRow.appendChild(fragment);

    movieCards = document.querySelectorAll(".content-card");
    movieRows = document.querySelectorAll(".content-row");
}

async function searchMovies(query) {
    const requestId = ++searchRequestId;

    try {
        searchMoviesLoading.style.display = "block";
        searchMoviesError.textContent = "";

        const data = await fetchSearchMovies(query);

        if (requestId !== searchRequestId) {
            return;
        }

        if (data.results.length === 0) {
            searchMoviesRow.innerHTML = "";
            searchMoviesLoading.style.display = "none";
            searchMoviesError.textContent = "No movies found.";

            return;
        }

        searchMoviesLoading.style.display = "none";

        renderSearchMovies(data.results);

        focusFirstSearchResult();
    } catch (error) {
        if (requestId !== searchRequestId) {
            return;
        }

        console.error("Search movies error:", error);

        searchMoviesLoading.style.display = "none";
        searchMoviesError.textContent = "Unable to search movies.";
    }
}

function debounceSearch(query) {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(function () {
        searchMovies(query);
    }, 300);
}

movieSearchInput.addEventListener("input", function () {
    const query = movieSearchInput.value.trim();

    if (query.length === 0) {
        clearTimeout(searchTimeout);

        searchMoviesRow.innerHTML = "";
        searchMoviesError.textContent = "";
        searchMoviesLoading.style.display = "none";

        return;
    }

    debounceSearch(query);
});

function focusFirstSearchResult() {
    const searchCards = searchMoviesRow.querySelectorAll(".content-card");

    if (searchCards.length === 0) {
        return;
    }

    searchCards[0].focus();
}

// Initial Load

loadTopRatedMovies();
loadPopularMovies();
