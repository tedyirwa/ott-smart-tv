// ============================================================
// VIDEO PLAYER ELEMENTS
// ============================================================

const playButton = document.querySelector(".play-button");
const playerStatus = document.querySelector(".player-status");
const videoPlayer = document.querySelector(".video-player");


// ============================================================
// PROGRESS BAR ELEMENTS
// ============================================================

const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const currentTimeElement = document.querySelector(".current-time");
const durationElement = document.querySelector(".duration");


// ============================================================
// VIDEO PLAYER STATE
// ============================================================

// Menyimpan status apakah video sedang dimainkan atau tidak.
let isPlaying = false;


// ============================================================
// PLAY / PAUSE BUTTON
// ============================================================

// Ketika tombol PLAY/PAUSE ditekan,
// cek apakah video sedang paused atau sedang playing.
playButton.addEventListener("click", function () {

    if (videoPlayer.paused) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }

});


// ============================================================
// VIDEO EVENTS
// ============================================================

// ------------------------------------------------------------
// Video mulai dimainkan
// ------------------------------------------------------------

videoPlayer.addEventListener("play", function () {

    isPlaying = true;

    playButton.textContent = "PAUSE";
    playerStatus.textContent = "Video is playing";

    console.log("Video started playing");
    console.log("isPlaying:", isPlaying);

});


// ------------------------------------------------------------
// Video dijeda
// ------------------------------------------------------------

videoPlayer.addEventListener("pause", function () {

    isPlaying = false;

    playButton.textContent = "PLAY";
    playerStatus.textContent = "Video is paused";

    console.log("Video paused");
    console.log("isPlaying:", isPlaying);

});


// ------------------------------------------------------------
// Video sedang buffering
// ------------------------------------------------------------

videoPlayer.addEventListener("waiting", function () {

    playerStatus.textContent = "Buffering...";

    console.log("Video is buffering");

});


// ------------------------------------------------------------
// Video selesai dimainkan
// ------------------------------------------------------------

videoPlayer.addEventListener("ended", function () {

    isPlaying = false;

    playButton.textContent = "PLAY";
    playerStatus.textContent = "Video finished";

    console.log("Video ended");
    console.log("isPlaying:", isPlaying);

});


// ============================================================
// TIME FORMATTING
// ============================================================

// Mengubah waktu dalam bentuk detik menjadi format MM:SS.
// Contoh:
// 65 detik → "01:05"
function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );

}


// ============================================================
// VIDEO PROGRESS UPDATE
// ============================================================

// Event "timeupdate" dipanggil ketika posisi playback video berubah.
// Digunakan untuk:
// 1. Mengubah posisi progress bar.
// 2. Mengubah current time.
videoPlayer.addEventListener("timeupdate", function () {

    const currentTime = videoPlayer.currentTime;
    const duration = videoPlayer.duration;

    // Jangan melakukan perhitungan jika duration belum tersedia.
    if (!Number.isFinite(duration)) {
        return;
    }

    const progress = (currentTime / duration) * 100;

    // Update lebar progress bar.
    progressBar.style.width = progress + "%";

    // Update waktu saat ini.
    currentTimeElement.textContent = formatTime(currentTime);

});


// ============================================================
// VIDEO METADATA
// ============================================================

// Dipanggil ketika informasi dasar video sudah tersedia,
// termasuk duration.
videoPlayer.addEventListener("loadedmetadata", function () {

    console.log("Metadata loaded");
    console.log("Duration:", videoPlayer.duration);

    durationElement.textContent =
        formatTime(videoPlayer.duration);

});


// ============================================================
// VIDEO CAN PLAY
// ============================================================

// Menandakan video sudah cukup siap untuk dimainkan.
videoPlayer.addEventListener("canplay", function () {

    console.log("Video can play");

});


// ============================================================
// VIDEO ERROR
// ============================================================

// Menangani error ketika video gagal dimainkan.
videoPlayer.addEventListener("error", function () {

    playerStatus.textContent = "Video error";

    console.error("Video playback error");

    if (videoPlayer.error) {

        console.error("Error code:", videoPlayer.error.code);
        console.error("Error message:", videoPlayer.error.message);

    }

});


// ============================================================
// PROGRESS BAR SEEK
// ============================================================

// Ketika user mengklik progress bar,
// hitung posisi klik lalu ubah currentTime video.
progressContainer.addEventListener("click", function (event) {

    const rect = progressContainer.getBoundingClientRect();

    const clickPosition = event.clientX - rect.left;

    const clickPercentage =
        (clickPosition / rect.width) * 100;

    const seekTime =
        (clickPercentage / 100) * videoPlayer.duration;

    videoPlayer.currentTime = seekTime;

});


// ============================================================
// FOCUS NAVIGATION STATE
// ============================================================

// focusedIndex:
// posisi card jika semua card dianggap sebagai satu list.
//
// focusedRow:
// posisi baris.
//
// focusedColumn:
// posisi kolom.
//
// Contoh:
//
// M1  M2  M3
// M4  M5  M6
//
// M5:
// focusedIndex  = 4
// focusedRow    = 1
// focusedColumn = 1

let focusedIndex = 0;
let focusedRow = 0;
let focusedColumn = 0;


// ============================================================
// MOVIE CARD / ROW ELEMENTS
// ============================================================

// Mengambil semua movie card.
let movieCards = document.querySelectorAll(".content-card");

// Mengambil semua row yang berisi movie card.
const movieRows = document.querySelectorAll(".content-row");


// ============================================================
// INITIAL FOCUS
// ============================================================

// Saat aplikasi pertama kali dibuka,
// fokus langsung diberikan ke Movie 1.
movieCards[0].focus();


// ============================================================
// FOCUS CHANGE HANDLER
// ============================================================

// Setiap kali fokus berpindah:
//
// 1. Cari index card.
// 2. Cari row.
// 3. Cari column.
//
// Dengan begitu state focus selalu mengikuti posisi
// elemen yang sedang aktif.
document.addEventListener("focusin", function (event) {

    console.log("Focused element:", event.target);
    console.log("Active element:", document.activeElement);


    // --------------------------------------------------------
    // Mencari focusedIndex
    // --------------------------------------------------------

    movieCards.forEach(function (card, index) {

        if (card === document.activeElement) {

            focusedIndex = index;

        }

    });


    // --------------------------------------------------------
    // Mencari focusedRow dan focusedColumn
    // --------------------------------------------------------

    movieRows.forEach(function (row, rowIndex) {

        // Ambil semua card yang hanya berada
        // di dalam row yang sedang diperiksa.
        const rowCards =
            row.querySelectorAll(".content-card");


        rowCards.forEach(function (card, columnIndex) {

            if (card === document.activeElement) {

                focusedRow = rowIndex;
                focusedColumn = columnIndex;

            }

        });

    });


    // --------------------------------------------------------
    // Debug focus state
    // --------------------------------------------------------

    console.log("Focused index:", focusedIndex);
    console.log("Focused row:", focusedRow);
    console.log("Focused column:", focusedColumn);

});


// ============================================================
// REMOTE / KEYBOARD NAVIGATION
// ============================================================

document.addEventListener("keydown", function (event) {


    // --------------------------------------------------------
    // SPACE
    // --------------------------------------------------------
    // Play / Pause video.

    if (event.code === "Space") {

        if (videoPlayer.paused) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }

    }


    // --------------------------------------------------------
    // ARROW RIGHT
    // --------------------------------------------------------
    // Bergerak ke card berikutnya dalam row yang sama.

    if (event.code === "ArrowRight") {

        // Ambil semua card dari row yang sedang aktif.
        const rowCards =
            movieRows[focusedRow].querySelectorAll(".content-card");


        // Pastikan belum berada di card paling kanan.
        if (focusedColumn < rowCards.length - 1) {

            // Pindahkan fokus satu kolom ke kanan.
            rowCards[focusedColumn + 1].focus();

        }

    }


    // --------------------------------------------------------
    // ARROW LEFT
    // --------------------------------------------------------
    // Bergerak ke card sebelumnya dalam row yang sama.

    if (event.code === "ArrowLeft") {

        const rowCards =
            movieRows[focusedRow].querySelectorAll(".content-card");


        // Pastikan belum berada di card paling kiri.
        if (focusedColumn > 0) {

            // Pindahkan fokus satu kolom ke kiri.
            rowCards[focusedColumn - 1].focus();

        }

    }


    // --------------------------------------------------------
    // ARROW UP
    // --------------------------------------------------------
    // Bergerak ke row sebelumnya,
    // dengan mempertahankan column yang sama.

    if (event.code === "ArrowUp") {

        let previousRowIndex = focusedRow - 1;

        while (previousRowIndex >= 0) {
            const previousRowCards = movieRows[previousRowIndex].querySelectorAll(".content-card")

            if (previousRowCards.length === 0) {
                previousRowIndex--;
                continue;
            }

            const targetColumn = Math.min(focusedColumn, previousRowCards.length - 1);

            previousRowCards[targetColumn].focus();

            break;

        }
        // Pastikan belum berada di row paling atas.
        // if (previousRowIndex >= 0) {

        //     const previousRowCards =
        //         movieRows[previousRowIndex]
        //             .querySelectorAll(".content-card");


        //     // Pindahkan fokus ke column yang sama
        //     // pada row sebelumnya.
        //     const targetColumn = Math.min(focusedColumn, previousRowCards.length - 1);

        //     previousRowCards[targetColumn].focus();

        // }

    }


    // --------------------------------------------------------
    // ARROW DOWN
    // --------------------------------------------------------
    // Bergerak ke row berikutnya.
    // Jika row berikutnya kosong, lewati dan cari row berikutnya
    // yang memiliki movie card.

    if (event.code === "ArrowDown") {

        let nextRowIndex = focusedRow + 1;

        while (nextRowIndex < movieRows.length) {

            const nextRowCards =
                movieRows[nextRowIndex]
                    .querySelectorAll(".content-card");


            // Jika row kosong, lanjut ke row berikutnya.
            if (nextRowCards.length === 0) {

                nextRowIndex++;

                continue;
            }


            // Gunakan column yang sama jika tersedia.
            // Jika tidak tersedia, gunakan column terakhir.
            const targetColumn = Math.min(
                focusedColumn,
                nextRowCards.length - 1
            );


            // Pindahkan focus ke card tujuan.
            nextRowCards[targetColumn].focus();


            // Row tujuan sudah ditemukan.
            break;
        }

    }

});


function createProductCard(product) {
    //Card
    const card = document.createElement("div");
    card.className = "content-card";
    card.tabIndex = 0;

    //Image Card
    const poster = document.createElement("div");
    poster.className = "poster";

    const image = document.createElement("img");
    image.src = product.thumbnail;

    //Title Card
    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = product.title;

    poster.appendChild(image);

    card.appendChild(poster);
    card.appendChild(title);

    return card;
}


//API

const apiRow = document.querySelector("#api-row");
const apiLoading = document.querySelector("#api-loading");
const apiError = document.querySelector("#api-error");

fetch("https://dummyjson.com/products")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("HTTP error: " + response.status);
        }

        return response.json();
    })
    .then(function (data) {
        apiError.textContent = "";

        if (data.products.length === 0) {
            apiLoading.style.display = "none";
            apiError.textContent = "No products available.";
            return;
        }
        
        apiLoading.style.display = "none";

        console.log("createProductCard:", createProductCard(data.products[0]));

        data.products.forEach(function (product) {

            const card = createProductCard(product);

            apiRow.appendChild(card);

        });

        movieCards = document.querySelectorAll(".content-card");

    }).catch(function (error) {
        console.error("Error fetching products:", error);

        apiLoading.style.display = "none";
        apiError.textContent = "Error loading products.";
    });
