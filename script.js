function secondsToMinutesSeconds(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "Invalid input"
    }

    const minutes = Math.floor(seconds / 60);
    const remaingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remaingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`
}


let currentAudio = new Audio();
let currentSongLi = null;
let songs;

async function getSongs() {
    let res = await fetch("songs/");

    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;

    let links = div.querySelectorAll("a");
    let songs = [];

    for (let link of links) {
        if (link.href.endsWith('.mp3')) {
            let fullUrl = link.href;

            // Decode first to handle %5C (backslash)
            let decodedUrl = decodeURIComponent(fullUrl);

            // Split by BOTH forward slash AND backslash, then get the last part
            let fileName = decodedUrl.split(/[/\\]/).pop();

            let songName = fileName.replace(".mp3", "");

            songs.push({
                name: songName,
                url: `songs/${encodeURIComponent(fileName)}`  // Re-encode for URL safety
            });
        }
    }
    return songs;
}



async function main() {
    songs = await getSongs();
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    for (let song of songs) {
        songUL.innerHTML += `
            <li class="song-item" data-url="${song.url}">
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${song.name}</div>
                    <div>Pallav</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span> 
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>
        `;
    }

   // 🎯 SIMPLE PNG IMG BUTTON
    const playImg = document.getElementById('splay');

    // 🔹 SONG LIST CLICKS
    songUL.addEventListener("click", (e) => {
        const li = e.target.closest("li");
        if (!li) return;

        const songUrl = li.dataset.url;
        currentAudio.pause();
        currentAudio.src = songUrl;
        currentAudio.play();

       // Show pause icon
        if (playImg) {
            playImg.src = "pause.png";
        }

        if (currentSongLi) currentSongLi.classList.remove("playing");
        li.classList.add("playing");
        currentSongLi = li;
    });


//   🔹 FIRST SONG SETUP
    if (songs.length > 0) {
        currentAudio.src = songs[0].url;
        let firstLi = songUL.querySelector("li");
        if (firstLi) {
            firstLi.classList.add("playing");
            currentSongLi = firstLi;
        }
        if (playImg) {
            playImg.src = 'play-circle-02-stroke-rounded (1).png';  // Your play PNG
        }
    }
   // 🎵 MAIN PLAY BUTTON - PNG TOGGLE
    if (playImg) {
        playImg.style.cursor = 'pointer';
        
        playImg.addEventListener('click', (e) => {
            
            if (!currentAudio.src) {
                return;
            }

            if (currentAudio.paused) {
                // Play
                currentAudio.play();
                playImg.src = 'pause.png';
            } else {
                // Pause
                currentAudio.pause();
                playImg.src = 'play-circle-02-stroke-rounded (1).png';
            }
        });
    }

    // 🎵 SEEKBAR + SONG DISPLAY
const currentSongSpan = document.getElementById('current-song');
const durationSpan = document.getElementById('song-duration');
const seekbar = document.querySelector('#seekbar'); // your existing seekbar

// Update song name when song changes
function updateSongDisplay() {
    if (currentSongLi) {
        const songName = currentSongLi.querySelector('.info div').textContent;
        if (currentSongSpan) currentSongSpan.textContent = songName;
    }
}

// Song click - update display
songUL.addEventListener("click", (e) => {
    // ... your existing code ...
    updateSongDisplay();  // ADD THIS LINE
});

// Load duration when metadata loads
currentAudio.addEventListener('loadedmetadata', () => {
    const duration = currentAudio.duration;
    if (durationSpan && !isNaN(duration)) {
        const min = Math.floor(duration / 60);
        const sec = Math.floor(duration % 60);
        durationSpan.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    }
});

// Update seekbar progress
currentAudio.addEventListener('timeupdate', () => {
    if (!isNaN(currentAudio.duration)) {
        const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
        if (seekbar) seekbar.value = progress;
    }
});

// Seekbar click to jump
if (seekbar) {
    seekbar.addEventListener('input', () => {
        const seekTime = (seekbar.value / 100) * currentAudio.duration;
        currentAudio.currentTime = seekTime;
    });
}

// Listen for timeupdate event 
currentAudio.addEventListener("timeupdate", ()=>{
    console.log(currentAudio.currentTime,currentAudio.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentAudio.currentTime)}/${secondsToMinutesSeconds(currentAudio.duration)}`
    document.querySelector(".circle").style.left = (currentAudio.currentTime/ currentAudio.duration) * 100 + "%";
})

// Add an event listener to seekbar
document.querySelector(".seekbar").addEventListener("click", e=>{
    console.log(e.target, e.offsetX)
    let percent  = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentAudio.currentTime = ((currentAudio.duration) * percent)/100;
})

// Add an event listener for hamburger
document.querySelector(".hamburger").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "0"
})

// Add an event listener for close button
document.querySelector(".close").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "-120%"
})



function playByIndex(index) {
    currentSongIndex = index;
    const song = songs[currentSongIndex];

    currentAudio.pause();
    currentAudio.src = song.url;
    currentAudio.play();

    if (playImg) playImg.src = "pause.png";

    if (currentSongLi) currentSongLi.classList.remove("playing");

    const allLis = songUL.querySelectorAll("li");
    currentSongLi = allLis[currentSongIndex];
    currentSongLi.classList.add("playing");

    updateSongDisplay();
}


// Add an event listener to previous
previous.addEventListener("click", ()=>{
    playByIndex((currentSongIndex - 1 + songs.length) % songs.length);
});

let currentSongIndex = 0;

// Add an event listener to next
next.addEventListener("click", ()=>{
    playByIndex((currentSongIndex + 1) % songs.length);
});



}



    

document.addEventListener("DOMContentLoaded", () => {
    main();
});
