const playButton = document.querySelector(".play-button");
const playerStatus = document.querySelector(".player-status");
const videoPlayer = document.querySelector(".video-player");

const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const currentTimeElement = document.querySelector(".current-time");
const durationElement = document.querySelector(".duration");

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

  console.log("Video started playing");
});

videoPlayer.addEventListener("pause", function () {
  isPlaying = false;

  playButton.textContent = "PLAY";
  playerStatus.textContent = "Video is paused";

  console.log("Video paused");
});

videoPlayer.addEventListener("waiting", function () {
  playerStatus.textContent = "Buffering...";

  console.log("Video is buffering");
});

videoPlayer.addEventListener("ended", function () {
  isPlaying = false;

  playButton.textContent = "PLAY";
  playerStatus.textContent = "Video finished";

  console.log("Video ended");
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

let focusedIndex = 0;
let focusedRow = 0;
let focusedColumn = 0;

let movieCards = document.querySelectorAll(".content-card");
let movieRows = document.querySelectorAll(".content-row");

document.addEventListener("focusin", function (event) {
  console.log("Focused element:", event.target);

  movieCards.forEach(function (card, index) {
    if (card === document.activeElement) {
      focusedIndex = index;
    }
  });

  movieRows.forEach(function (row, rowIndex) {
    const rowCards = row.querySelectorAll(".content-card");

    rowCards.forEach(function (card, columnIndex) {
      if (card === document.activeElement) {
        focusedRow = rowIndex;
        focusedColumn = columnIndex;
      }
    });
  });

  console.log("Focused row:", focusedRow);
  console.log("Focused column:", focusedColumn);
});

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    if (videoPlayer.paused) {
      videoPlayer.play();
    } else {
      videoPlayer.pause();
    }
  }

  if (event.code === "ArrowRight") {
    const rowCards = movieRows[focusedRow].querySelectorAll(".content-card");

    if (focusedColumn < rowCards.length - 1) {
      rowCards[focusedColumn + 1].focus();
    }
  }

  if (event.code === "ArrowLeft") {
    const rowCards = movieRows[focusedRow].querySelectorAll(".content-card");

    if (focusedColumn > 0) {
      rowCards[focusedColumn - 1].focus();
    }
  }

  if (event.code === "ArrowUp") {
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

    // if (previousRowIndex >= 0) {
    //     const previousRowCards =
    //         movieRows[previousRowIndex]
    //             .querySelectorAll(".content-card");
    //     const targetColumn = Math.min(focusedColumn, previousRowCards.length - 1);
    //     previousRowCards[targetColumn].focus();
    // }
  }

  if (event.code === "ArrowDown") {
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
});

function createMovieCard(movie) {
  const card = document.createElement("div");

  card.className = "content-card";
  card.tabIndex = 0;

  const poster = document.createElement("div");

  poster.className = "poster";

  const image = document.createElement("img");

  image.loading = "lazy";
  image.alt = movie.title;

  if (movie.thumbnail) {
    image.src = movie.thumbnail;
  }

  image.addEventListener("error", function () {
    image.style.display = "none";
  });

  const title = document.createElement("div");

  title.className = "card-title";
  title.textContent = movie.title;

  poster.appendChild(image);

  card.appendChild(poster);
  card.appendChild(title);

  return card;
}

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

function getPosterUrl(posterPath) {
  if (!posterPath) {
    return null;
  }

  return TMDB_CONFIG.imageBaseUrl + "/" + TMDB_CONFIG.posterSmall + posterPath;
}

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

let popularMoviesCache = null;
let popularMoviesCacheTime = 0;

const CACHE_TTL = 5 * 60 * 1000;

let popularMoviesRequest = null;

async function fetchPopularMovies() {
  const cacheAge = Date.now() - popularMoviesCacheTime;

  if (popularMoviesCache && cacheAge < CACHE_TTL) {
    return popularMoviesCache;
  }

  if (popularMoviesRequest) {
    return popularMoviesRequest;
  }

  popularMoviesRequest = fetch(TMDB_CONFIG.baseUrl + "/movie/popular", {
    headers: {
      Authorization: "Bearer " + TMDB_CONFIG.token,
      "Content-Type": "application/json",
    },
  });

  try {
    const response = await popularMoviesRequest;

    if (!response.ok) {
      throw new Error("HTTP_" + response.status);
    }

    const data = await response.json();

    popularMoviesCache = data;
    popularMoviesCacheTime = Date.now();

    return data;
  } finally {
    popularMoviesRequest = null;
  }
}

async function loadPopularMovies(retryCount = 0) {
  try {
    setPopularMoviesState("loading");

    const data = await fetchPopularMovies();

    if (data.results.length === 0) {
      setPopularMoviesState("success", "No movies available.");

      return;
    }

    setPopularMoviesState("success");

    renderPopularMovies(data.results);

    movieCards = document.querySelectorAll(".content-card");

    movieRows = document.querySelectorAll(".content-row");

    const movie = mapTmdbMovieToMovie(data.results[0]);

    if (movieCards.length > 0) {
      movieCards[0].focus();
    }

    console.log("TMDB movies loaded:", data.results.length);

    console.log("First movie:", movie);
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
      setPopularMoviesState("error", "Unable to connect. Please check your internet connection.");
    }
  }
}

loadPopularMovies();

// async function loadProducts() {
//     try {
//         apiLoading.style.display = "block";
//         apiError.textContent = "";
//
//         const response = await fetch("https://dummyjson.com/products");
//
//         if (!response.ok) {
//             throw new Error("HTTP error: " + response.status);
//         }
//
//         const data = await response.json();
//
//         if (data.products.length === 0) {
//             apiLoading.style.display = "none";
//             apiError.textContent = "No products available.";
//             return;
//         }
//
//         apiLoading.style.display = "none";
//
//         renderProducts(data.products);
//
//         movieCards = document.querySelectorAll(".content-card");
//
//         console.log(data);
//     } catch (error) {
//         console.error("Error:", error);
//
//         apiLoading.style.display = "none";
//         apiError.textContent = "Error loading products.";
//     }
// }
//
// loadProducts();

// FETCH
// fetch("https://dummyjson.com/products")
//     .then(function (response) {
//         if (!response.ok) {
//             throw new Error("HTTP error: " + response.status);
//         }
//
//         return response.json();
//     })
//     .then(function (data) {
//         apiError.textContent = "";
//
//         if (data.products.length === 0) {
//             apiLoading.style.display = "none";
//             apiError.textContent = "No products available.";
//             return;
//         }
//
//         apiLoading.style.display = "none";
//
//         renderProducts(data.products);
//
//         movieCards = document.querySelectorAll(".content-card");
//
//     }).catch(function (error) {
//         console.error("Error fetching products:", error);
//
//         apiLoading.style.display = "none";
//         apiError.textContent = "Error loading products.";
//     });
