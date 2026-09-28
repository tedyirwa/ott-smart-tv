const movieDetailPage = document.querySelector("#movie-detail-page");

const movieDetailPoster = document.querySelector("#movie-detail-poster");

const movieDetailTitle = document.querySelector("#movie-detail-title");

const movieDetailRating = document.querySelector("#movie-detail-rating");

const movieDetailReleaseDate = document.querySelector("#movie-detail-release-date");

const movieDetailRuntime = document.querySelector("#movie-detail-runtime");

const movieDetailDescription = document.querySelector("#movie-detail-description");

const movieDetailBack = document.querySelector("#movie-detail-back");

const movieDetailLoading = document.querySelector("#movie-detail-loading");

const movieDetailError = document.querySelector("#movie-detail-error");

// Movie ID

const params = new URLSearchParams(window.location.search);

const movieId = params.get("id");

console.log("Movie ID:", movieId);

function goBackToHome() {
    window.history.back();
}

movieDetailBack.addEventListener("click", goBackToHome);

// API

async function fetchMovieDetail(movieId) {
    const response = await fetch(TMDB_CONFIG.baseUrl + "/movie/" + movieId, {
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

function getPosterUrl(posterPath, size = TMDB_CONFIG.posterSmall) {
    if (!posterPath) {
        return null;
    }

    return TMDB_CONFIG.imageBaseUrl + "/" + size + posterPath;
}

function mapTmdbMovieDetailToMovie(movie) {
    if (!movie || !movie.id || !movie.title) {
        return null;
    }

    return {
        id: movie.id,
        title: movie.title,
        thumbnail: getPosterUrl(movie.poster_path),
        backdrop: getPosterUrl(movie.backdrop_path, TMDB_CONFIG.backdropLarge),
        description: movie.overview || "",
        rating: movie.vote_average || 0,
        releaseDate: movie.release_date || "",
        runtime: movie.runtime || 0,
    };
}

// Load Movie Detail

async function loadMovieDetail() {
    if (!movieId) {
        movieDetailLoading.style.display = "none";
        movieDetailError.textContent = "Movie not found.";
        return;
    }

    try {
        movieDetailLoading.style.display = "block";
        movieDetailError.textContent = "";

        const data = await fetchMovieDetail(movieId);

        const movie = mapTmdbMovieDetailToMovie(data);

        if (!movie) {
            throw new Error("INVALID_MOVIE");
        }

        movieDetailTitle.textContent = movie.title;

        movieDetailRating.textContent = "Rating: " + movie.rating.toFixed(1);

        movieDetailReleaseDate.textContent = movie.releaseDate || "Unknown";

        movieDetailRuntime.textContent = movie.runtime ? movie.runtime + " min" : "Unknown";

        movieDetailDescription.textContent = movie.description || "No description available.";

        if (movie.thumbnail) {
            movieDetailPoster.src = movie.thumbnail;
            movieDetailPoster.alt = movie.title;
        }

        if (movie.backdrop) {
            movieDetailPage.style.backgroundImage = "url(" + movie.backdrop + ")";
        }

        movieDetailLoading.style.display = "none";

        movieDetailBack.focus();
    } catch (error) {
        console.error("Movie detail error:", error);

        movieDetailLoading.style.display = "none";
        movieDetailError.textContent = "Unable to load movie details.";
    }
}

loadMovieDetail();
