/**
 * shared.js — Working 3-song playlist + site utilities
 * Birthday Surprise · Monic Dayana
 */

/* ============================================================
   MUSIC PLAYLIST
   ============================================================ */
const MUSIC_PLAYLIST = [
  'assets/music/song1.mp3',
  'assets/music/song2.mp3',
  'assets/music/song3.mp3',
  'assets/music/song4.mp3'
];

/* ============================================================
   MUSIC SYSTEM
   ============================================================ */
const Music = {
  audio: null,
  trackIndex: 0,

  init() {
    // Create audio in JS (avoids HTML source conflicts)
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = 0.32;
    this.audio.loop = false;

    // Restore track index
    this.trackIndex = parseInt(sessionStorage.getItem('musicTrackIndex') || '0', 10);
    if (Number.isNaN(this.trackIndex)) this.trackIndex = 0;

    this.loadTrack(this.trackIndex);

    // Restore state
    const savedRaw = sessionStorage.getItem('musicState');
    if (savedRaw) {
      try {
        const saved = JSON.parse(savedRaw);
        const enabled = !!saved.enabled;
        const muted = !!saved.muted;
        const time = Number(saved.time || 0);

        this.audio.muted = muted;

        this.audio.addEventListener('loadedmetadata', () => {
          if (!Number.isNaN(time) && time > 0 && time < (this.audio.duration || Infinity)) {
            this.audio.currentTime = time;
          }
        }, { once: true });

        if (enabled && !muted) {
          // Try to resume only after user has already interacted in this session
          this.audio.play().catch(err => console.warn('Resume blocked:', err));
        }
      } catch (e) {
        console.warn('Bad musicState in sessionStorage:', e);
      }
    }

    // When one song ends → next song
    this.audio.addEventListener('ended', () => {
      this.nextTrack(true);
    });

    // Save current time while playing
    this.audio.addEventListener('timeupdate', () => {
      this.saveState();
    });

    window.addEventListener('beforeunload', () => this.saveState());

    this.updateIcon();
  },

  loadTrack(index) {
    this.trackIndex = ((index % MUSIC_PLAYLIST.length) + MUSIC_PLAYLIST.length) % MUSIC_PLAYLIST.length;
    sessionStorage.setItem('musicTrackIndex', String(this.trackIndex));
    this.audio.src = MUSIC_PLAYLIST[this.trackIndex];
    this.audio.load();
  },

  async enable() {
    if (!this.audio) return;
    this.audio.muted = false;
    this.audio.volume = 0.32;

    try {
      await this.audio.play();
      this.saveState(true);
      this.updateIcon();
    } catch (err) {
      console.warn('Play failed:', err);
      alert('Music could not start. Check file names/paths and try again.');
    }
  },

  toggle() {
    if (!this.audio) return;

    if (this.audio.paused || this.audio.muted) {
      this.audio.muted = false;
      this.audio.play().catch(err => console.warn('Toggle play failed:', err));
    } else {
      this.audio.pause();
      this.audio.muted = true;
    }

    this.saveState();
    this.updateIcon();
  },

  nextTrack(autoplay = false) {
    this.trackIndex = (this.trackIndex + 1) % MUSIC_PLAYLIST.length;
    this.loadTrack(this.trackIndex);

    if (autoplay && !this.audio.muted) {
      this.audio.play().catch(err => console.warn('Next track play failed:', err));
    }

    this.saveState();
    this.updateIcon();
  },

  saveState(forceEnabled = null) {
    if (!this.audio) return;

    const enabled = forceEnabled !== null ? forceEnabled : !this.audio.paused;

    sessionStorage.setItem('musicState', JSON.stringify({
      enabled,
      muted: this.audio.muted,
      time: this.audio.currentTime || 0
    }));
  },

  updateIcon() {
    const btn = document.getElementById('musicToggle');
    if (!btn) return;

    const silent = !this.audio || this.audio.paused || this.audio.muted;
    btn.classList.toggle('muted', silent);
    btn.setAttribute('title', silent ? 'Play music' : 'Mute music');
    btn.textContent = silent ? '♪' : '♫';
  }
};

/* ============================================================
   MUSIC MODAL
   ============================================================ */
function initMusicModal() {
  const modal = document.getElementById('musicModal');
  if (!modal) return;

  // If already answered this session, skip modal
  if (sessionStorage.getItem('musicAnswered')) {
    modal.classList.add('gone');
    return;
  }

  document.getElementById('btnPlayMusic')?.addEventListener('click', async () => {
    sessionStorage.setItem('musicAnswered', '1');
    await Music.enable();
    dismissModal(modal);
  });

  document.getElementById('btnSkipMusic')?.addEventListener('click', () => {
    sessionStorage.setItem('musicAnswered', '1');
    Music.saveState(false);
    dismissModal(modal);
  });
}

function dismissModal(modal) {
  modal.style.transition = 'opacity 0.5s ease';
  modal.style.opacity = '0';
  setTimeout(() => modal.classList.add('gone'), 520);
}

/* ============================================================
   PAGE NAVIGATION
   ============================================================ */
function navigateTo(href) {
  const overlay = document.getElementById('pageTransition');
  if (!overlay) {
    window.location.href = href;
    return;
  }

  Music.saveState();
  overlay.classList.add('active');
  setTimeout(() => {
    window.location.href = href;
  }, 420);
}

function initNav() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.nav));
  });
}

function initPageEntrance() {
  const overlay = document.getElementById('pageTransition');
  if (!overlay) return;
  overlay.classList.remove('active');
}

/* ============================================================
   STAR CANVAS
   ============================================================ */
function initStars() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [], w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function buildStars(n = 200) {
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.18,
      alpha: Math.random(),
      speed: Math.random() * 0.007 + 0.002,
      dir: Math.random() > 0.5 ? 1 : -1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.alpha += s.speed * s.dir;
      if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = s.r * 5;
      ctx.shadowColor = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }

  resize();
  buildStars();
  draw();
  window.addEventListener('resize', () => { resize(); buildStars(); });
}

/* ============================================================
   DOVES
   ============================================================ */
function initDoves() {
  const layer = document.getElementById('dovesLayer');
  if (!layer) return;

  const DOVE = `<svg viewBox="0 0 64 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 19 C28 11 13 7 3 13 C11 13 17 17 19 23 C19 23 15 27 9 27
             C15 29 22 27 26 23 C28 27 30 31 32 35 C34 31 36 27 38 23
             C42 27 49 29 55 27 C49 27 45 23 45 23 C47 17 53 13 61 13
             C51 7 36 11 32 19Z"/>
  </svg>`;

  function spawn() {
    const d = document.createElement('div');
    d.className = 'dove';
    const top = Math.random() * 68 + 6;
    const dur = Math.random() * 18 + 13;
    const del = Math.random() * 4;
    const sc = Math.random() * 0.45 + 0.55;

    Object.assign(d.style, {
      top: `${top}%`,
      left: '-120px',
      animationDuration: `${dur}s`,
      animationDelay: `${del}s`,
      transform: `scale(${sc})`,
    });

    d.innerHTML = DOVE;
    d.querySelector('svg').style.width = `${Math.round(28 + Math.random() * 18)}px`;
    d.querySelector('svg').style.height = 'auto';

    layer.appendChild(d);
    setTimeout(() => d.remove(), (dur + del + 1) * 1000);
  }

  spawn(); spawn(); spawn();
  setInterval(spawn, 5500);
}

/* ============================================================
   FLOATING HEARTS
   ============================================================ */
function initHearts(containerId = 'heartsLayer', count = 5) {
  const layer = document.getElementById(containerId);
  if (!layer) return;

  const sizes = ['0.95rem', '1.3rem', '1.55rem', '1.1rem', '1.4rem'];
  const lefts = ['7%', '22%', '50%', '71%', '88%'];
  const durs = [11, 14, 12.5, 16, 10.5];
  const delays = [0, 3.5, 7, 1.5, 5];

  for (let i = 0; i < count; i++) {
    const h = document.createElement('span');
    h.className = 'fheart';
    h.textContent = '♡';
    Object.assign(h.style, {
      left: lefts[i % lefts.length],
      fontSize: sizes[i % sizes.length],
      animationDuration: `${durs[i % durs.length]}s`,
      animationDelay: `${delays[i % delays.length]}s`,
    });
    layer.appendChild(h);
  }
}

/* ============================================================
   MUSIC TOGGLE BUTTON
   ============================================================ */
function initMusicToggle() {
  document.getElementById('musicToggle')?.addEventListener('click', () => {
    Music.toggle();
  });
}

/* ============================================================
   BOOT
   ============================================================ */
function bootShared({ hearts = true, heartCount = 5, heartContainer = 'heartsLayer' } = {}) {
  Music.init();              // init first
  initMusicModal();
  initMusicToggle();
  initNav();
  initPageEntrance();
  initStars();
  initDoves();
  if (hearts) initHearts(heartContainer, heartCount);
}