/* ==========================================================================
   PEMUTAR MUSIK — gaya menu Persona (kartu bertumpuk: sebelumnya / sedang diputar / berikutnya)
   - Pilih lagu: kartu atas/bawah, tombol PREV/NEXT, atau scroll mouse di atas panel
   - AUDIO ON/OFF = bisukan/aktifkan suara (lagu tetap berjalan)
   - Progress bar bisa diklik / digeser
   - Status (lagu, posisi, play/mute) disimpan di localStorage -> lanjut saat pindah halaman
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     DAFTAR LAGU — ganti / tambah sesuai file milik Anda.
     Taruh file audio (mp3/ogg/m4a) di folder  assetporto/music/
     Gunakan hanya lagu yang Anda punya hak pakainya (buatan sendiri,
     berlisensi, atau royalty-free). Pastikan nama file di bawah sama persis dengan file di folder tersebut.
     ------------------------------------------------------------------ */
  const PLAYLIST = [
    {
      title: "Color Your Night",
      artist: "Lotus Juice, Azumi Takahashi",
      src: "assetporto/music/cyn.mp3",
    },
    {
      title: "Fly-Day Chinatown",
      artist: "Yasuha",
      src: "assetporto/music/flyday.mp3",
    },
    { title: "アイドル", artist: "YOASOBI", src: "assetporto/music/idol.mp3" },
    { title: "廻廻奇譚", artist: "Eve", src: "assetporto/music/kaikitan.mp3" },
    {
      title: "Phantom",
      artist: " Shoji Meguro ",
      src: "assetporto/music/phantom.mp3",
    },
  ];

  /* Opsional: tambahkan  jp: "teks jepang"  pada sebuah lagu untuk mengganti teks kuning di kartu tengah
     (bawaan: 作戦を指示する).  Contoh: { title: "...", artist: "...", src: "...", jp: "心の怪盗団" } */

  /* Lagu yang menyala otomatis saat website dibuka (nomor urut di PLAYLIST, mulai dari 0).
     Tetap dipakai selama pengunjung belum memilih lagu lain sendiri. */
  const DEFAULT_INDEX = 0;

  const KEY = "p5_music";
  const VOLUME = 0.45; // volume maksimum (0–1)
  if (!PLAYLIST.length || !document.body) return;

  /* ---------- state tersimpan ---------- */
  const st = { playing: true, muted: false, idx: DEFAULT_INDEX, t: 0, ts: 0, picked: false, open: false };
  try {
    Object.assign(st, JSON.parse(localStorage.getItem(KEY) || "{}"));
  } catch (e) {}
  st.idx = Number.isInteger(st.idx) && st.idx >= 0 && st.idx < PLAYLIST.length ? st.idx : DEFAULT_INDEX;
  st.t = isFinite(st.t) && st.t > 0 ? st.t : 0;

  // Kunjungan baru (tab baru) = pembukaan website: musik menyala otomatis.
  //  - lagu default, kecuali pengunjung pernah memilih lagu sendiri (picked)
  //  - mute (AUDIO OFF) tetap dihormati
  // Pindah halaman di tab yang sama = lanjutkan persis (lagu, posisi, play/pause, panel terbuka).
  let isNewSession = false;
  try {
    isNewSession = !sessionStorage.getItem("p5_music_sess");
    sessionStorage.setItem("p5_music_sess", "1");
  } catch (e) {}
  if (isNewSession) {
    st.playing = true;
    st.t = 0;
    st.ts = 0;
    st.open = false;
    if (!st.picked) st.idx = DEFAULT_INDEX;
  }
  let soundBlocked = false; // autoplay bersuara diblokir browser -> berjalan senyap sampai ada interaksi

  /* ------------------------------------------------------------------
     BACKING SYNTH (cadangan) — Web Audio, acid-jazz pelan.
     Aktif otomatis untuk lagu yang file mp3-nya gagal dimuat, sehingga
     pemutar tetap mengeluarkan musik walau mp3 belum dimasukkan.
     Tiap nomor lagu memakai nada dasar & tempo berbeda.
     ------------------------------------------------------------------ */
  function makeSynth() {
    const AC = window.AudioContext || window.webkitAudioContext;
    const api = new EventTarget();
    const KEYS = [2, 9, 7, 0, 5]; // nada dasar (semitone dari C)
    const BPMS = [102, 96, 108, 92, 100];
    const BARS = 64;
    const GAIN = 0.8;
    let ctx = null, master = null, noiseBuf = null;
    let playing = false, idx = 0, vol = VOLUME, muted = false;
    let step = 0, nextT = 0, offset = 0, t0 = 0, sched = 0, ticker = 0;

    const bpm = () => BPMS[idx % BPMS.length];
    const stepDur = () => 60 / bpm() / 4;
    const total = () => BARS * 16 * stepDur();
    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const key = () => 48 + KEYS[idx % KEYS.length];

    function build() {
      ctx = new AC();
      master = ctx.createGain();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 4;
      master.connect(comp);
      comp.connect(ctx.destination);
      applyGain();
      const len = ctx.sampleRate;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    function applyGain() {
      if (master) master.gain.setTargetAtTime(muted ? 0 : vol * GAIN, ctx.currentTime, 0.015);
    }

    function tone(freq, t, dur, type, v, cutoff) {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = type;
      o.frequency.value = freq;
      f.type = "lowpass";
      f.frequency.value = cutoff;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + 0.05);
    }
    function noise(t, dur, v, hp) {
      const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      s.buffer = noiseBuf;
      f.type = "highpass";
      f.frequency.value = hp;
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(master);
      s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    }
    function kick(t) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.3);
    }

    // ii7 – V7 – Imaj7 – vi7 (masing-masing 2 birama)
    const CH = [
      { root: 2, notes: [5, 9, 12, 16] },
      { root: 7, notes: [11, 14, 17, 21] },
      { root: 0, notes: [4, 7, 11, 14] },
      { root: 9, notes: [12, 16, 19, 23] },
    ];
    function schedule(s, t) {
      const sd = stepDur();
      const bar = Math.floor(s / 16), p = s % 16;
      const ci = Math.floor((bar % 8) / 2);
      const ch = CH[ci], nx = CH[(ci + 1) % 4];
      const r = key();
      if (p === 0 || p === 10 || (p === 6 && bar % 2)) kick(t);
      if (p === 4 || p === 12) { noise(t, 0.14, 0.32, 1800); tone(190, t, 0.1, "triangle", 0.18, 1200); }
      if (p % 2 === 0) noise(t + (p % 4 === 2 ? sd * 0.35 : 0), 0.045, p % 4 === 0 ? 0.16 : 0.09, 7000);
      // bass
      const b = r - 12 + ch.root;
      if (p === 0) tone(mtof(b), t, sd * 5, "triangle", 0.5, 520);
      if (p === 6) tone(mtof(b + 7), t, sd * 2, "triangle", 0.4, 520);
      if (p === 8) tone(mtof(b + 12), t, sd * 2, "triangle", 0.36, 520);
      if (p === 10) tone(mtof(b + 10), t, sd * 2, "triangle", 0.34, 520);
      if (p === 14 && bar % 2) tone(mtof(r - 12 + nx.root - 1), t, sd * 1.6, "triangle", 0.34, 520);
      // chord stab (rhodes-ish)
      const stab = bar % 2 ? p === 6 : p === 3 || p === 10;
      if (stab) ch.notes.forEach((n, i) => tone(mtof(r + 12 + ch.root + n - (n > 12 ? 12 : 0)), t + i * 0.006, sd * 3.2, i % 2 ? "sine" : "triangle", 0.11, 2200));
    }

    function pump() {
      if (!playing || !ctx) return;
      while (nextT < ctx.currentTime + 0.18) {
        if (step >= BARS * 16) { finish(); return; }
        schedule(step, nextT);
        nextT += stepDur();
        step++;
      }
    }
    function pos() {
      if (!ctx) return offset;
      return playing ? Math.min(total(), offset + (ctx.currentTime - t0)) : offset;
    }
    function finish() {
      stop();
      api.dispatchEvent(new Event("ended"));
    }
    function start() {
      playing = true;
      t0 = ctx.currentTime + 0.05;
      step = Math.floor(offset / (stepDur() * 16)) * 16;
      offset = step * stepDur();
      nextT = t0;
      clearInterval(sched);
      clearInterval(ticker);
      sched = setInterval(pump, 25);
      ticker = setInterval(() => api.dispatchEvent(new Event("timeupdate")), 250);
      pump();
      api.dispatchEvent(new Event("play"));
    }
    function stop() {
      playing = false;
      clearInterval(sched);
      clearInterval(ticker);
      offset = 0;
    }

    Object.defineProperties(api, {
      paused: { get: () => !playing },
      duration: { get: () => total() },
      currentTime: {
        get: () => pos(),
        set: (v) => {
          const was = playing;
          if (was) { offset = Math.max(0, Math.min(total() - 1, +v || 0)); start(); }
          else offset = Math.max(0, Math.min(total() - 1, +v || 0));
        },
      },
      volume: { get: () => vol, set: (v) => { vol = v; applyGain(); } },
      muted: { get: () => muted, set: (v) => { muted = !!v; applyGain(); } },
    });
    api.track = (i) => { stop(); idx = i; };
    api.stop = stop;
    api.pause = () => {
      if (!playing) return;
      offset = pos();
      playing = false;
      clearInterval(sched);
      clearInterval(ticker);
      api.dispatchEvent(new Event("pause"));
    };
    api.play = () => {
      if (!AC) return Promise.reject(Object.assign(new Error("no AudioContext"), { name: "NotSupportedError" }));
      if (playing) return Promise.resolve();
      if (!ctx) build();
      const ready = ctx.state === "running" ? Promise.resolve() : Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 250))]);
      return ready.then(() => {
        if (ctx.state !== "running") throw Object.assign(new Error("audio blocked"), { name: "NotAllowedError" });
        if (!playing) start();
      });
    };
    return api;
  }

  /* ---------- sumber audio: <audio> (mp3) dengan cadangan synth ---------- */
  const media = new Audio();
  media.preload = "auto"; // mulai mengunduh begitu halaman terbuka
  const synth = makeSynth();
  let useSynth = false, want = false, curTrack = st.idx, volState = 0, mutedState = !!st.muted;
  const audio = new EventTarget();
  const backend = () => (useSynth ? synth : media);
  ["timeupdate", "loadedmetadata", "play", "pause", "ended"].forEach((t) => {
    media.addEventListener(t, () => !useSynth && audio.dispatchEvent(new Event(t)));
    synth.addEventListener(t, () => useSynth && audio.dispatchEvent(new Event(t)));
  });
  function takeOverWithSynth() {
    if (useSynth) return;
    useSynth = true;
    media.pause();
    synth.track(curTrack);
    synth.volume = volState;
    synth.muted = mutedState;
    audio.dispatchEvent(new Event("synth"));
    audio.dispatchEvent(new Event("loadedmetadata"));
    if (want) synth.play().catch(() => {});
  }
  media.addEventListener("error", takeOverWithSynth);
  Object.defineProperties(audio, {
    paused: { get: () => backend().paused },
    duration: { get: () => backend().duration },
    currentTime: { get: () => backend().currentTime, set: (v) => { backend().currentTime = v; } },
    volume: { get: () => volState, set: (v) => { volState = v; media.volume = v; synth.volume = v; } },
    muted: { get: () => mutedState, set: (v) => { mutedState = !!v; media.muted = !!v; synth.muted = !!v; } },
    src: {
      set: (v) => {
        useSynth = false;
        synth.stop();
        media.src = v;
      },
    },
  });
  audio.setTrack = (i) => { curTrack = i; };
  audio.load = () => media.load();
  audio.pause = () => { want = false; backend().pause(); };
  audio.play = () => {
    want = true;
    if (useSynth) return synth.play();
    const p = media.play();
    if (!p || !p.catch) return p;
    return p.catch((err) => {
      if ((err && err.name === "NotSupportedError") || media.error) {
        takeOverWithSynth();
        return synth.play();
      }
      throw err;
    });
  };
  audio.volume = 0;
  audio.muted = !!st.muted;

  function save() {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          playing: st.playing,
          muted: st.muted,
          idx: st.idx,
          t: +(audio.currentTime || 0).toFixed(2),
          ts: Date.now(),
          picked: st.picked,
          open: st.open,
        }),
      );
    } catch (e) {}
  }

  /* ---------- DOM ---------- */
  const SPEAKER_ON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const SPEAKER_OFF =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>';
  const ICON_PAUSE =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z" fill="currentColor"/></svg>';

  const root = document.createElement("aside");
  root.className = "p5-music";
  root.setAttribute("aria-label", "Pemutar musik");
  root.dataset.open = "false";
  root.innerHTML = `
    <button type="button" class="p5-music-launcher" aria-expanded="false" aria-label="Buka pemutar musik">
      <span class="pm-launch-eq" aria-hidden="true"><b></b><b></b><b></b><b></b></span>
      <span class="pm-launch-text">MUSIC</span>
    </button>

    <div class="p5-music-panel" role="region" aria-label="Pilih musik">
      <div class="pm-top">
        <span class="pm-count" aria-hidden="true">01/05</span>
        <button type="button" class="pm-btn pm-audio" aria-pressed="true"></button>
        <button type="button" class="pm-btn pm-close" aria-label="Tutup pemutar musik">✕</button>
      </div>

      <div class="pm-stack">
        <button type="button" class="pm-card pm-prev" aria-label="Lagu sebelumnya">
          <span class="pm-ico" aria-hidden="true">△</span>
          <span class="pm-meta"><span class="pm-title"></span><span class="pm-artist"></span></span>
          <span class="pm-chip">PREV</span>
        </button>

        <div class="pm-card pm-now">
          <div class="pm-now-row">
            <span class="pm-disc" aria-hidden="true"><i class="pm-eq"><b></b><b></b><b></b></i></span>
            <span class="pm-meta">
              <span class="pm-titlerow"><span class="pm-badge">01</span><span class="pm-title"></span></span>
              <span class="pm-sub"><span class="pm-jp"></span><span class="pm-artist"></span></span>
            </span>
            <button type="button" class="pm-btn pm-play" aria-label="Putar / jeda"></button>
          </div>
          <div class="pm-seek">
            <div class="pm-bar" role="slider" tabindex="0" aria-label="Posisi lagu" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
              <span class="pm-bar-fill"></span><span class="pm-bar-thumb"></span>
            </div>
            <div class="pm-times">
              <span class="pm-t-cur">0:00</span>
              <span class="pm-hint"><span class="pm-hint-mouse">SCROLL MOUSE ↕ CHANGE SONG</span><span class="pm-hint-touch">TAP PREV / NEXT</span></span>
              <span class="pm-t-dur">--:--</span>
            </div>
          </div>
        </div>

        <button type="button" class="pm-card pm-next" aria-label="Lagu berikutnya">
          <span class="pm-ico" aria-hidden="true">✕</span>
          <span class="pm-meta"><span class="pm-title"></span><span class="pm-artist"></span></span>
          <span class="pm-chip">NEXT</span>
        </button>
      </div>

      <div class="pm-nav">
        <button type="button" class="pm-btn pm-nav-btn pm-nav-prev">&lt; PREV</button>
        <button type="button" class="pm-btn pm-nav-btn pm-nav-next">NEXT &gt;</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  const $ = (s) => root.querySelector(s);
  const el = {
    launcher: $(".p5-music-launcher"),
    count: $(".pm-count"),
    audioBtn: $(".pm-audio"),
    close: $(".pm-close"),
    stack: $(".pm-stack"),
    prev: $(".pm-prev"),
    next: $(".pm-next"),
    now: $(".pm-now"),
    play: $(".pm-play"),
    bar: $(".pm-bar"),
    fill: $(".pm-bar-fill"),
    thumb: $(".pm-bar-thumb"),
    tCur: $(".pm-t-cur"),
    tDur: $(".pm-t-dur"),
  };

  const n = PLAYLIST.length;
  const wrap = (i) => (i + n) % n;
  const pad = (v) => String(v).padStart(2, "0");
  const fmt = (s) => (isFinite(s) ? Math.floor(s / 60) + ":" + pad(Math.floor(s % 60)) : "--:--");
  const sfx = () => window.p5Sfx || null;

  /* ---------- render ---------- */
  function fillCard(card, track) {
    card.querySelector(".pm-title").textContent = track.title;
    card.querySelector(".pm-artist").textContent = track.artist;
  }

  function renderTracks() {
    fillCard(el.now, PLAYLIST[st.idx]);
    el.now.querySelector(".pm-badge").textContent = pad(st.idx + 1);
    el.now.querySelector(".pm-jp").textContent = (PLAYLIST[st.idx].jp || "作戦を指示する") + " •";
    fillCard(el.prev, PLAYLIST[wrap(st.idx - 1)]);
    fillCard(el.next, PLAYLIST[wrap(st.idx + 1)]);
    el.count.textContent = pad(st.idx + 1) + "/" + pad(n);
    root.classList.toggle("is-single", n < 2);
    el.now.querySelector(".pm-artist").classList.remove("is-error");
  }

  function renderState() {
    const playing = !audio.paused;
    root.classList.toggle("is-playing", playing);
    const blocked = soundBlocked && playing;
    root.classList.toggle("is-blocked", blocked);
    $(".pm-launch-text").textContent = blocked ? "TAP FOR SOUND" : "MUSIC";
    el.play.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    el.play.setAttribute("aria-label", playing ? "Jeda" : "Putar");
    el.audioBtn.innerHTML = (st.muted ? SPEAKER_OFF : SPEAKER_ON) + "<span>AUDIO " + (st.muted ? "OFF" : "ON") + "</span>";
    el.audioBtn.setAttribute("aria-pressed", String(!st.muted));
    el.audioBtn.classList.toggle("is-off", st.muted);
  }

  function renderProgress() {
    const d = audio.duration;
    const c = audio.currentTime || 0;
    const r = isFinite(d) && d > 0 ? Math.min(1, c / d) : 0;
    el.fill.style.width = r * 100 + "%";
    el.thumb.style.left = r * 100 + "%";
    el.tCur.textContent = fmt(c);
    el.tDur.textContent = fmt(d);
    el.bar.setAttribute("aria-valuenow", String(Math.round(r * 100)));
    el.bar.setAttribute("aria-valuetext", fmt(c) + " dari " + fmt(d));
  }

  /* ---------- volume fade ---------- */
  let fadeTimer = null;
  function fadeTo(target, ms) {
    clearInterval(fadeTimer);
    const from = audio.volume;
    const t0 = performance.now();
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * k));
      if (k >= 1) clearInterval(fadeTimer);
    }, 30);
  }

  /* ---------- pemutaran ---------- */
  /* Buka kunci suara pada interaksi pertama (tanpa splash screen).
     Dipasang di window & document, capture, sekali pakai. */
  const UNLOCK_EVS = ["pointerdown", "mousedown", "keydown", "touchstart", "touchend", "wheel", "click"];
  let unlockH = null;
  function disarm() {
    if (!unlockH) return;
    UNLOCK_EVS.forEach((ev) => {
      window.removeEventListener(ev, unlockH, true);
      document.removeEventListener(ev, unlockH, true);
    });
    unlockH = null;
  }
  function armUnmute() {
    if (unlockH) return;
    unlockH = (e) => {
      disarm();
      // tombol play/pause pemutar punya logikanya sendiri
      if (e && e.target && e.target.closest && e.target.closest(".pm-play")) {
        armUnmute();
        return;
      }
      const done = () => {
        soundBlocked = false;
        if (!st.muted) {
          audio.volume = 0;
          audio.muted = false;
          fadeTo(VOLUME, 300);
        }
        renderState();
      };
      const fail = () => {
        audio.muted = true;
        audio.volume = VOLUME;
        if (st.playing) audio.play().catch(() => {});
        renderState();
        armUnmute(); // gesture lemah (mis. wheel) belum cukup -> tunggu yang berikutnya
      };
      audio.volume = 0;
      audio.muted = st.muted;
      if (!st.playing) return done();
      if (audio.paused) {
        const p = audio.play();
        if (p && p.then) p.then(() => (audio.paused ? fail() : done()), fail);
        else done();
      } else {
        done();
        setTimeout(() => {
          if (st.playing && audio.paused) audio.play().catch(fail);
        }, 150);
      }
    };
    UNLOCK_EVS.forEach((ev) => {
      const o = { once: true, capture: true };
      window.addEventListener(ev, unlockH, o);
      document.addEventListener(ev, unlockH, o);
    });
  }

  function play(fade) {
    st.playing = true;
    audio.muted = st.muted;
    audio.volume = fade ? 0 : VOLUME;
    const p = audio.play();
    const ok = () => {
      if (!audio.muted) {
        soundBlocked = false;
        disarm();
      }
      if (fade) fadeTo(VOLUME, 350);
      renderState();
    };
    if (!p || !p.then) ok();
    else
      p.then(ok).catch(() => {
        // autoplay bersuara diblokir -> mulai senyap (diizinkan browser), bunyikan saat interaksi pertama
        audio.muted = true;
        audio.volume = VOLUME;
        const q = audio.play();
        (q && q.then ? q : Promise.resolve())
          .then(() => {
            soundBlocked = !st.muted;
            renderState();
            if (soundBlocked) armUnmute();
          })
          .catch(() => {
            soundBlocked = !st.muted;
            renderState();
            armUnmute(); // diblokir total (mis. iOS) -> putar saat interaksi pertama
          });
      });
    save();
  }

  function pause() {
    st.playing = false;
    audio.pause();
    renderState();
    save();
  }

  function load(idx, startAt) {
    st.idx = wrap(idx);
    audio.setTrack(st.idx);
    audio.src = PLAYLIST[st.idx].src;
    audio.load();
    if (startAt > 0) {
      const seek = () => {
        try {
          audio.currentTime = Math.min(startAt, (audio.duration || startAt) - 0.5);
        } catch (e) {}
      };
      audio.addEventListener("loadedmetadata", seek, { once: true });
    }
    renderTracks();
    renderProgress();
  }

  let animTimer = null;
  function go(dir, auto) {
    if (n < 2) return;
    if (!auto) st.picked = true; // dipilih pengguna -> tidak lagi kembali ke lagu default
    load(st.idx + dir, 0);
    st.t = 0;
    root.dataset.slide = dir > 0 ? "next" : "prev";
    clearTimeout(animTimer);
    animTimer = setTimeout(() => delete root.dataset.slide, 300);
    if (!auto && sfx()) sfx().hover();
    if (st.playing) play(false);
    else save();
  }

  /* ---------- event audio ---------- */
  audio.addEventListener("timeupdate", () => {
    renderProgress();
    if (!audio._lastSave || performance.now() - audio._lastSave > 1000) {
      audio._lastSave = performance.now();
      save();
    }
  });
  audio.addEventListener("loadedmetadata", renderProgress);
  audio.addEventListener("play", renderState);
  audio.addEventListener("pause", renderState);
  audio.addEventListener("ended", () => (n > 1 ? go(1, true) : (audio.currentTime = 0, play(false))));
  audio.addEventListener("synth", () => {
    const a = el.now.querySelector(".pm-artist");
    a.textContent = PLAYLIST[st.idx].artist.trim() + " · BACKING SYNTH";
  });

  /* ---------- kontrol UI ---------- */
  function setOpen(open, quiet) {
    root.dataset.open = String(open);
    el.launcher.setAttribute("aria-expanded", String(open));
    st.open = open;
    if (open && !quiet) el.play.focus({ preventScroll: true });
    if (!quiet) save();
  }
  el.launcher.addEventListener("click", () => setOpen(true));
  el.close.addEventListener("click", () => {
    setOpen(false);
    el.launcher.focus({ preventScroll: true });
  });

  el.play.addEventListener("click", () => (audio.paused ? play(true) : pause()));
  el.audioBtn.addEventListener("click", () => {
    st.muted = !st.muted;
    audio.muted = st.muted;
    renderState();
    save();
  });
  el.prev.addEventListener("click", () => go(-1));
  el.next.addEventListener("click", () => go(1));
  $(".pm-nav-prev").addEventListener("click", () => go(-1));
  $(".pm-nav-next").addEventListener("click", () => go(1));

  // scroll mouse di atas panel = ganti lagu
  let wheelLock = 0;
  $(".p5-music-panel").addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const now = performance.now();
      if (Math.abs(e.deltaY) < 6 || now - wheelLock < 280) return;
      wheelLock = now;
      go(e.deltaY > 0 ? 1 : -1);
    },
    { passive: false },
  );

  // progress bar: klik / geser / panah kiri-kanan
  let dragging = false;
  function seekFromEvent(e) {
    const r = el.bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    if (isFinite(audio.duration)) audio.currentTime = ratio * audio.duration;
    renderProgress();
  }
  el.bar.addEventListener("pointerdown", (e) => {
    dragging = true;
    el.bar.setPointerCapture(e.pointerId);
    seekFromEvent(e);
  });
  el.bar.addEventListener("pointermove", (e) => dragging && seekFromEvent(e));
  ["pointerup", "pointercancel"].forEach((ev) =>
    el.bar.addEventListener(ev, () => {
      dragging = false;
      save();
    }),
  );
  el.bar.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      audio.currentTime = Math.max(0, (audio.currentTime || 0) + (e.key === "ArrowRight" ? 5 : -5));
      renderProgress();
    }
  });

  // sentuh/klik di luar pemutar: tutup panel
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (root.dataset.open !== "true") return;
      if (e.target && e.target.closest && e.target.closest(".p5-music")) return;
      if (sfx()) sfx().back();
      setOpen(false);
    },
    true,
  );

  // Escape: tutup panel dulu (sebelum handler halaman)
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && root.dataset.open === "true") {
        e.stopImmediatePropagation();
        if (sfx()) sfx().back();
        setOpen(false);
        el.launcher.focus({ preventScroll: true });
      }
    },
    true,
  );

  /* ---------- pindah halaman: musik tetap berjalan sampai halaman benar-benar diganti ---------- */
  window.addEventListener("p5:navigate", save);
  window.addEventListener("pagehide", save);

  /* ---------- mulai ---------- */
  let startAt = st.t;
  if (!isNewSession && st.playing && st.ts) {
    // kompensasi jeda pindah halaman agar posisi lagu tetap menyambung
    const dt = (Date.now() - st.ts) / 1000;
    if (dt >= 0 && dt < 8) startAt += dt;
  }
  load(st.idx, startAt);
  renderState();
  if (st.open) {
    root.dataset.instant = "true"; // panel langsung tampil tanpa animasi buka
    setOpen(true, true);
    setTimeout(() => delete root.dataset.instant, 500);
  }
  if (st.playing) play(isNewSession); // fade-in hanya saat website pertama dibuka
})();
