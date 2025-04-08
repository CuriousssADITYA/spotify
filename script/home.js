const folderCart = document.querySelector('.cart-section')

async function FindFolder() {
    try {

        let response = await fetch('/api/songs'); // now works on Vercel too
        let songs = await response.json();

        folderCart.innerHTML = songs.map(folder => `
            <div data-value="${folder}" class="song-card">
                <div class="album-art">
                    <img src="" alt="Album Art" id="card-img-${folder}">
                    <button class="play-button">&#9654;</button>
                </div>
                <div class="song-info">
                    <p class="song-title">${folder}</p>
                </div>
            </div>
            `).join('');
        
          songs.forEach(async (e) => {
            try {
                 let anc = await fetch(`api/songs/${e}/${e}.json`);
                let bcd = await anc.json();
                document.getElementById(`card-img-${e}`).src = bcd.img;
            } catch (error) {
                console.error(`Failed to load JSON for ${e}`, error);
            }
        });

        document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener("click", () => {
             document.getElementById('library-name').textContent = card.dataset.value;
                loadSongs(card.dataset.value);
    });
});


    } catch (error) {
        console.log("error : " + error)
    }
}
FindFolder()

const listSong = document.querySelector('.cart-song-list');
const playPauseBtn = document.getElementById("play");

let audio = null;
let songList = []; // Global array to store songs

async function loadSongs(folder) {
    try {
        let response = await fetch(`http://127.0.0.1:5500/songs/${folder}`);
        let htmlText = await response.text();

        let div = document.createElement("div");
        div.innerHTML = htmlText;

        let links = div.getElementsByTagName("a");
        songList = [];

        for (let link of links) {
            let fileName = link.getAttribute("href");
            if (fileName.endsWith(".flac") || fileName.endsWith(".mp3")) {
                songList.push({
                    title: fileName.replaceAll("%20", " ").replace("2c", "").replace("%2", "").replace(".flac", "").replace(".mp3", '').replace("%C3%AA", "").replace("- %D0%9A%D0%B0%D0%BC%D0%B8%D0%BD", "").replace(`/songs/${folder}/`, "").replace("%C3%89C", "E &"),
                    source: `songs${fileName.replace("songs/", "")}`

                });
            }
        }

        // Generate Song List UI
        listSong.innerHTML = songList.map(song => `
            <div class="song-cart">
                <img class="invert" src="icons/icons8-musical-note-30.png" alt="">
                <div>
                    <h3>${song.title}</h3>
                </div>    
                <button class="invert play-btn">
                    <img src="icons/play.png" alt="">
                </button>    
            </div>    
        `).join('');

    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

// Play Song Function
function playMusic(source, title) {

    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    playPauseBtn.src = 'https://cdn-icons-png.flaticon.com/512/9513/9513367.png';
    document.getElementById('title-name').textContent = title;

    audio = new Audio(source);

    audio.addEventListener('loadedmetadata', () => {
        document.getElementById('duration').textContent = `00:00 / 00:00`;
        audio.addEventListener("timeupdate", updateTime);
    });

    audio.play();

}

// Click Event for Playing Songs
listSong.addEventListener('click', (event) => {
    const songCart = event.target.closest('.song-cart');
    if (!songCart) return;

    const title = songCart.querySelector("h3").textContent.trim();
    const songData = songList.find(e => e.title === title);
    if (!songData) return;

    document.querySelector('.play-song').style.display = 'flex';
    playMusic(songData.source, songData.title);
});

// Play/Pause Button
playPauseBtn.addEventListener('click', () => {
    if (!audio) return;

    if (audio.paused) {
        audio.play();
        playPauseBtn.src = 'https://cdn-icons-png.flaticon.com/512/9513/9513367.png';
    } else {
        audio.pause();
        playPauseBtn.src = "https://cdn-icons-png.flaticon.com/512/18941/18941526.png";
    }
});

// Update Time
function updateTime() {
    if (!audio) return;
    const currentTime = formatTime(audio.currentTime);
    const totalDuration = formatTime(audio.duration);
    document.getElementById('duration').textContent = `${currentTime} / ${totalDuration}`;
    document.querySelector('.circle').style.left = (audio.currentTime / audio.duration) * 100 + "%";
    if (currentTime === totalDuration) {
        let temp_2 = audio.src.split('/').slice(-2).join('/');
        const index = songList.findIndex(songList => songList.source.endsWith(temp_2));

        if (index !== -1 && index + 1 < songList.length) {
            playMusic(songList[index + 1].source, songList[index + 1].title);
        }
    }
}

// Format Time
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Load Songs on Start
document.querySelector('.seekbar').addEventListener('click', (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector('.circle').style.left = percent + "%";

    audio.currentTime = ((audio.duration) * percent) / 100;
})

document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.left-section').style.left = '0px'
})

document.querySelector('.cross').addEventListener('click', () => {
    document.querySelector('.left-section').style.left = '-100%'
})

document.getElementById('previous').addEventListener('click', () => {
    let temp_2 = audio.src.split('/').slice(-2).join('/');
    const index = songList.findIndex(songList => songList.source.endsWith(temp_2));

    if (index - 1 > 0) {
        playMusic(songList[index - 1].source, songList[index - 1].title);
    }
});

document.getElementById('next').addEventListener('click', () => {
    let temp_2 = audio.src.split('/').slice(-2).join('/');
    const index = songList.findIndex(songList => songList.source.endsWith(temp_2));

    if (index !== -1 && index + 1 < songList.length) {
        playMusic(songList[index + 1].source, songList[index + 1].title);
    }
});

const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volume');
let isMuted = false; // Track mute state

// Volume slider event
volumeSlider.addEventListener('input', (e) => {
    let volume = parseInt(e.target.value) / 100;
    audio.volume = volume;

    isMuted = (volume === 0); // Update mute state

    // Update icon based on volume
    updateVolumeIcon(volume);
});

// Mute button toggle
volumeIcon.addEventListener("click", () => {
    if (!isMuted) {
        // Mute
        audio.volume = 0;
        volumeSlider.value = 0;
        isMuted = true;
    } else {
        // Unmute
        audio.volume = 0.51;
        volumeSlider.value = 51;
        isMuted = false;
    }

    // Update icon after toggling
    updateVolumeIcon(audio.volume);
});

// Function to update volume icon dynamically
function updateVolumeIcon(volume) {
    if (volume === 0) {
        volumeIcon.src = "https://images.icon-icons.com/3106/PNG/512/sound_speaker_mute_sound_off_icon_191602.png"; // Mute
    } else if (volume < 0.5) {
        volumeIcon.src = "https://images.icon-icons.com/3415/PNG/512/low_sound_icon_218201.png"; // Low Volume
    } else {
        volumeIcon.src = "https://images.icon-icons.com/3691/PNG/512/music_loud_sound_audio_icon_229540.png"; // High Volume
    }
}




