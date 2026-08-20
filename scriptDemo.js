console.log("Spotify Clone - JavaScript loaded");


// ==============================
// AUDIO PLAYER STATE
// ==============================

const currentAudio = new Audio();

let songs = [];
let currentSongIndex = 0;
let currentSongLi = null;


// ==============================
// DOM ELEMENTS
// ==============================

const songList = document.querySelector(".songlist ul");

const playButton = document.getElementById("splay");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");

const currentSongDisplay = document.getElementById("current-song");

const seekbar = document.querySelector(".seekbar");
const seekbarCircle = document.querySelector(".circle");
const songTime = document.querySelector(".songtime");

const hamburger = document.querySelector(".hamburger");
const closeButton = document.querySelector(".close");
const sidebar = document.querySelector(".left");

const volumeIcon = document.getElementById("volumeIcon");
const volumeSlider = document.getElementById("volumeSlider");


// ==============================
// FORMAT TIME
// ==============================

function secondsToMinutesSeconds(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}


// ==============================
// GET SONGS
// ==============================

async function getSongs() {
    try {
        const response = await fetch("songs/");

        if (!response.ok) {
            throw new Error("Could not load songs folder");
        }

        const html = await response.text();

        const div = document.createElement("div");
        div.innerHTML = html;

        const links = div.querySelectorAll("a");
        const songList = [];

        for (const link of links) {

            let href = link.getAttribute("href");

            if (!href) {
                continue;
            }

            // Decode the URL first.
            // This converts %5C into \
            // and %20 into spaces.
            href = decodeURIComponent(href);

            // Get ONLY the filename.
            const fileName = href.split(/[\\/]/).pop();

            if (!fileName || !fileName.toLowerCase().endsWith(".mp3")) {
                continue;
            }

            const songName = fileName.replace(/\.mp3$/i, "");

            songList.push({
                name: songName,
                url: "songs/" + encodeURIComponent(fileName)
            });
        }

        return songList;

    } catch (error) {

        console.error("Error loading songs:", error);

        return [];
    }
}

// ==============================
// CREATE SONG LIST
// ==============================

function createSongList() {

    songList.innerHTML = "";

    songs.forEach((song, index) => {

        const li = document.createElement("li");

        li.className = "song-item";

        li.dataset.url = song.url;
        li.dataset.index = index;

        li.innerHTML = `
            <img class="invert" src="music.svg" alt="Music">

            <div class="info">
                <div>${song.name}</div>
                <div>Pallav</div>
            </div>

            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="Play">
            </div>
        `;

        songList.appendChild(li);
    });
}


// ==============================
// UPDATE PLAY BUTTON
// ==============================

function updatePlayButton() {

    if (!playButton) {
        return;
    }

    if (currentAudio.paused) {

        playButton.src = "play-circle-02-stroke-rounded (1).png";

    } else {

        playButton.src = "pause.png";
    }
}


// ==============================
// UPDATE CURRENT SONG DISPLAY
// ==============================

function updateSongDisplay() {

    if (!currentSongDisplay || !currentSongLi) {
        return;
    }

    const songName = currentSongLi.querySelector(".info div");

    if (songName) {
        currentSongDisplay.textContent = songName.textContent;
    }
}


// ==============================
// UPDATE ACTIVE SONG
// ==============================

function updateActiveSong(index) {

    const allSongs = songList.querySelectorAll(".song-item");

    allSongs.forEach((li) => {
        li.classList.remove("playing");
    });

    const selectedSong = allSongs[index];

    if (selectedSong) {

        selectedSong.classList.add("playing");

        currentSongLi = selectedSong;
    }
}


// ==============================
// PLAY SONG
// ==============================

function playSong(index) {

    if (!songs.length) {
        return;
    }

    if (index < 0 || index >= songs.length) {
        return;
    }

    currentSongIndex = index;

    const song = songs[currentSongIndex];

    currentAudio.pause();

    currentAudio.src = song.url;

    updateActiveSong(currentSongIndex);

    updateSongDisplay();

    currentAudio.play()
        .then(() => {
            updatePlayButton();
        })
        .catch((error) => {
            console.error("Could not play song:", error);
        });
}


// ==============================
// PLAY / PAUSE
// ==============================

function togglePlayPause() {

    if (!currentAudio.src) {
        return;
    }

    if (currentAudio.paused) {

        currentAudio.play()
            .then(() => {
                updatePlayButton();
            })
            .catch((error) => {
                console.error("Could not play song:", error);
            });

    } else {

        currentAudio.pause();

        updatePlayButton();
    }
}


// ==============================
// SONG LIST CLICK
// ==============================

songList.addEventListener("click", (event) => {

    const songItem = event.target.closest(".song-item");

    if (!songItem) {
        return;
    }

    const index = Number(songItem.dataset.index);

    playSong(index);
});

// ==============================
// VOLUME CONTROL
// ==============================

if (volumeSlider && volumeIcon) {

    // Set initial volume
    currentAudio.volume = volumeSlider.value / 100;

    volumeSlider.addEventListener("input", () => {

        currentAudio.volume = volumeSlider.value / 100;

        // If volume is manually changed above 0,
        // show normal volume icon
        if (volumeSlider.value > 0) {
            volumeIcon.src = "volume.svg";
        }

        // If slider reaches 0, show mute icon
        else {
            volumeIcon.src = "mute.svg";
        }

    });

    volumeIcon.addEventListener("click", () => {

        // If currently muted
        if (volumeSlider.value == 0) {

            // Restore to 10%
            volumeSlider.value = 10;
            currentAudio.volume = 0.10;

            volumeIcon.src = "volume.svg";

        }

        // If currently playing with sound
        else {

            // Mute
            volumeSlider.value = 0;
            currentAudio.volume = 0;

            volumeIcon.src = "mute.svg";

        }

    });

}


// ==============================
// MAIN PLAY BUTTON
// ==============================

if (playButton) {

    playButton.addEventListener("click", togglePlayPause);
}


// ==============================
// PREVIOUS SONG
// ==============================

if (previousButton) {

    previousButton.addEventListener("click", () => {

        if (!songs.length) {
            return;
        }

        const previousIndex =
            (currentSongIndex - 1 + songs.length) % songs.length;

        playSong(previousIndex);
    });
}


// ==============================
// NEXT SONG
// ==============================

if (nextButton) {

    nextButton.addEventListener("click", () => {

        if (!songs.length) {
            return;
        }

        const nextIndex =
            (currentSongIndex + 1) % songs.length;

        playSong(nextIndex);
    });
}


// ==============================
// AUTO PLAY NEXT SONG
// ==============================

currentAudio.addEventListener("ended", () => {

    if (!songs.length) {
        return;
    }

    const nextIndex =
        (currentSongIndex + 1) % songs.length;

    playSong(nextIndex);
});


// ==============================
// AUDIO TIME UPDATE
// ==============================

currentAudio.addEventListener("timeupdate", () => {

    if (!isNaN(currentAudio.duration)) {

        const progress =
            (currentAudio.currentTime / currentAudio.duration) * 100;

        if (seekbarCircle) {
            seekbarCircle.style.left = `${progress}%`;
        }

        if (songTime) {

            songTime.textContent =
                `${secondsToMinutesSeconds(currentAudio.currentTime)}/${secondsToMinutesSeconds(currentAudio.duration)}`;
        }
    }
});


// ==============================
// SEEK BAR CLICK
// ==============================

if (seekbar) {

    seekbar.addEventListener("click", (event) => {

        if (isNaN(currentAudio.duration)) {
            return;
        }

        const rect = seekbar.getBoundingClientRect();

        const clickPosition = event.clientX - rect.left;

        let percentage =
            (clickPosition / rect.width) * 100;

        percentage = Math.max(0, Math.min(100, percentage));

        currentAudio.currentTime =
            (currentAudio.duration * percentage) / 100;

        if (seekbarCircle) {
            seekbarCircle.style.left = `${percentage}%`;
        }
    });
}


// ==============================
// MOBILE SIDEBAR
// ==============================

if (hamburger) {

    hamburger.addEventListener("click", () => {

        sidebar.style.left = "0";
    });
}


if (closeButton) {

    closeButton.addEventListener("click", () => {

        sidebar.style.left = "-120%";
    });
}


// ==============================
// MAIN FUNCTION
// ==============================

async function main() {

    songs = await getSongs();

    console.log("Songs found:", songs);

    createSongList();

    if (songs.length > 0) {

        currentAudio.src = songs[0].url;

        updateActiveSong(0);

        updateSongDisplay();

        updatePlayButton();
    }
}


// ==============================
// START APPLICATION
// ==============================

document.addEventListener("DOMContentLoaded", main);