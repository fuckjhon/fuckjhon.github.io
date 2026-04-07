// ================================================================
// TANNER CORDALIS - JUKEBOX & SITE SCRIPTS
// ================================================================
//
// HOW TO ADD YOUR OWN SONGS:
// 1. Put your MP3 files in the "music/" folder
// 2. Add a line to the SONGS array below like this:
//    { title: "Song Name", artist: "Artist", src: "music/yourfile.mp3" },
// 3. Save and push to GitHub — done!
//
// ================================================================

const SONGS = [
  // ---- ADD YOUR SONGS HERE ----
  // Format: { title: "Song Name", artist: "Artist", src: "music/filename.mp3" },
  { title: "Plastic Love", artist: "Mariya Takeuchi", src: "music/plastic-love.mp3" },
  { title: "Bewitched", artist: "Laufey", src: "music/bewitched.mp3" },
  { title: "Last Summer Whisper", artist: "Anri", src: "music/last-summer-whisper.mp3" },
  { title: "Midnight Cruisin'", artist: "Kingo Hamada", src: "music/midnight-cruisin.mp3" },
  { title: "Midnight Pretenders", artist: "Tomoko Aran", src: "music/midnight-pretenders.mp3" },
  { title: "Stay With Me", artist: "Miki Matsubara", src: "music/stay-with-me.mp3" },
];

let currentIndex = 0;
let audio = null;
let isPlaying = false;

// ----------------------------------------------------------------
// INIT
// ----------------------------------------------------------------
function initJukebox() {
  audio = new Audio();
  audio.volume = 0.5;

  // Remember which song was playing when navigating between pages
  const savedIndex   = sessionStorage.getItem('jukeboxIndex');
  const savedTime    = parseFloat(sessionStorage.getItem('jukeboxTime') || '0');
  const wasPlaying   = sessionStorage.getItem('jukeboxPlaying') === 'true';

  if (savedIndex !== null) {
    // Continuing from another page — pick up where we left off
    currentIndex = parseInt(savedIndex);
  } else {
    // First visit — pick a random song!
    currentIndex = Math.floor(Math.random() * SONGS.length);
  }

  loadSong(currentIndex, false);

  if (savedTime > 0 && audio.src) audio.currentTime = savedTime;

  // Autoplay: try to play immediately (random song on first visit,
  // or continue song when navigating between pages)
  if (audio.src) {
    audio.play()
      .then(() => { isPlaying = true; updatePlayBtn(); })
      .catch(() => {
        // Browser blocked autoplay — add a one-time click listener
        // so music starts as soon as user clicks ANYTHING on the page
        const startOnClick = () => {
          if (!isPlaying && audio.src) {
            audio.play().then(() => { isPlaying = true; updatePlayBtn(); }).catch(() => {});
          }
          document.removeEventListener('click', startOnClick);
        };
        document.addEventListener('click', startOnClick);
      });
  }

  // Save state before leaving page so music "continues"
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('jukeboxIndex',   currentIndex);
    sessionStorage.setItem('jukeboxTime',    audio.currentTime);
    sessionStorage.setItem('jukeboxPlaying', isPlaying);
  });

  // Auto-advance when song ends
  audio.addEventListener('ended', nextSong);

  renderPlaylist();

  // Restore collapsed state
  if (sessionStorage.getItem('jukeboxCollapsed') === 'true') {
    document.getElementById('jukebox').classList.add('collapsed');
  }
}

// ----------------------------------------------------------------
// LOAD / DISPLAY
// ----------------------------------------------------------------
function loadSong(index, shouldUpdateTime = true) {
  if (!SONGS.length) return;
  currentIndex = ((index % SONGS.length) + SONGS.length) % SONGS.length;
  const song = SONGS[currentIndex];
  if (song.src) audio.src = song.src;
  if (shouldUpdateTime) audio.currentTime = 0;
  updateDisplay();
}

function updateDisplay() {
  const song = SONGS[currentIndex];
  const el = document.getElementById('song-title-scroll');
  if (el) el.textContent = song.src
    ? `♪ ${song.title} — ${song.artist} ♪`
    : `♪ ${song.title} ♪`;

  document.querySelectorAll('.jukebox-playlist-item').forEach((item, i) => {
    item.classList.toggle('active', i === currentIndex);
  });
}

function updatePlayBtn() {
  const btn = document.getElementById('play-pause-btn');
  if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
}

// ----------------------------------------------------------------
// CONTROLS
// ----------------------------------------------------------------
function togglePlay() {
  if (!SONGS.length || !SONGS[currentIndex].src) return;
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play().catch(() => {});
    isPlaying = true;
  }
  updatePlayBtn();
}

function nextSong() {
  loadSong(currentIndex + 1);
  if (isPlaying) audio.play().catch(() => {});
  updateDisplay();
}

function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
  } else {
    loadSong(currentIndex - 1);
    if (isPlaying) audio.play().catch(() => {});
  }
  updateDisplay();
}

function setVolume(val) {
  if (audio) audio.volume = val / 100;
}

function toggleJukebox() {
  const jb = document.getElementById('jukebox');
  jb.classList.toggle('collapsed');
  // Remember state
  sessionStorage.setItem('jukeboxCollapsed', jb.classList.contains('collapsed'));
}

function playSongAtIndex(index) {
  loadSong(index);
  if (SONGS[index].src) {
    audio.play().catch(() => {});
    isPlaying = true;
    updatePlayBtn();
  }
}

// ----------------------------------------------------------------
// PLAYLIST UI
// ----------------------------------------------------------------
function renderPlaylist() {
  const list = document.getElementById('jukebox-playlist');
  if (!list) return;
  list.innerHTML = '';
  SONGS.forEach((song, i) => {
    const item = document.createElement('div');
    item.className = 'jukebox-playlist-item' + (i === currentIndex ? ' active' : '');
    item.textContent = `${i + 1}. ${song.title}`;
    item.onclick = () => playSongAtIndex(i);
    list.appendChild(item);
  });
}

// ----------------------------------------------------------------
// VISITOR COUNTER (stored locally — each visitor gets their own count
// which is a very authentic 90s experience lol)
// ----------------------------------------------------------------
function initCounter() {
  const el = document.getElementById('visitor-count');
  if (!el) return;
  let count = localStorage.getItem('visitorCount');
  if (!count) {
    count = Math.floor(Math.random() * 8000) + 2357; // starts at a believable number
  } else {
    count = parseInt(count) + 1;
  }
  localStorage.setItem('visitorCount', count);
  el.textContent = String(count).padStart(7, '0');
}

// ----------------------------------------------------------------
// LIGHTBOX (for gallery page)
// ----------------------------------------------------------------
function openLightbox(src, caption) {
  const overlay = document.getElementById('lightbox-overlay');
  if (!overlay) return;
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-caption').textContent = caption || '';
  overlay.classList.add('active');
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox-overlay');
  if (overlay) overlay.classList.remove('active');
}

document.addEventListener('click', (e) => {
  const overlay = document.getElementById('lightbox-overlay');
  if (e.target === overlay) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ----------------------------------------------------------------
// START EVERYTHING
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initJukebox();
  initCounter();
});
