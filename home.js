/* Halaman utama: huruf kolase, navigasi menu (keyboard / mouse / sentuh), jam */
(function () {
  "use strict";

  /* ---------- huruf kolase (acak tapi tetap sama tiap reload) ---------- */
  function seeded(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  const STYLES = ["a", "b", "a", "d", "e", "a"]; // warna latar huruf
  const FONTS = ["f1", "f2", "f3", "f4", "f1"];

  function buildRansom(el, seed) {
    const text = el.dataset.text || "";
    const rnd = seeded(seed);
    el.textContent = "";
    text.split(" ").forEach((word, wi, arr) => {
      const w = document.createElement("span");
      w.className = "w";
      w.setAttribute("aria-hidden", "true");
      [...word].forEach((ch) => {
        const c = document.createElement("span");
        const style = STYLES[Math.floor(rnd() * STYLES.length)];
        const font = FONTS[Math.floor(rnd() * FONTS.length)];
        const rot = (rnd() * 8 - 4).toFixed(1);
        c.className = "c " + style + " " + font;
        c.textContent = ch;
        c.style.setProperty("--r", rot + "deg");
        c.style.transform = "rotate(" + rot + "deg)";
        w.appendChild(c);
      });
      el.appendChild(w);
      if (wi < arr.length - 1) {
        const sp = document.createElement("span");
        sp.className = "sp";
        el.appendChild(sp);
      }
    });
  }

  document.querySelectorAll(".ransom").forEach((el, i) => buildRansom(el, 91 + i * 37));

  /* ---------- menu ---------- */
  const items = Array.from(document.querySelectorAll(".menu-item"));
  const counter = document.getElementById("counter");
  let index = 0;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  let sfxReady = false; // jangan bunyi saat pemilihan awal
  function select(i) {
    const prevIndex = index;
    index = (i + items.length) % items.length;
    items.forEach((it, n) => it.classList.toggle("is-active", n === index));
    if (counter) counter.textContent = pad(index + 1) + "/" + pad(items.length);
    if (sfxReady && index !== prevIndex) p5Sfx.hover(); // ↑↓ / W S / hover / pager
  }

  items.forEach((it, n) => {
    it.addEventListener("mouseenter", () => select(n));
    const a = it.querySelector("a");
    a.addEventListener("focus", () => select(n));
  });

  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      e.preventDefault();
      select(index + 1);
    } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      e.preventDefault();
      select(index - 1);
    } else if (e.key === "Enter") {
      const a = items[index].querySelector("a");
      const focused = document.activeElement;
      if (a && focused !== a && !(focused && focused.tagName === "BUTTON")) {
        e.preventDefault();
        p5Sfx.confirm();
        p5Navigate(a.href);
      }
    }
  });

  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  if (prev) prev.addEventListener("click", () => select(index - 1));
  if (next) next.addEventListener("click", () => select(index + 1));

  /* ==========================================================================
     SFX — efek suara UI bergaya menu JRPG (Web Audio API, tanpa file audio)
     playHoverSfx   : tick/chirp mekanis tajam   (~50 ms)
     playConfirmSfx : slash + chime ganda        (~180 ms)
     playBackSfx    : whoosh nada turun          (~140 ms)
     Mute disimpan di localStorage; tombol HUD "SFX: ON/OFF" atau tombol M.
     ========================================================================== */
  const p5Sfx = (function () {
    const MUTE_KEY = "p5_sfx_muted";
    const HOVER_SEL =
      ".p5-menu-li, .p5-btn, .p5-tab-btn, .cert-card, .project-card, .p5-icon-button, .p5-back-button, .p5-close-btn, .sfx-toggle, #prev, #next, .p5-music-launcher, .pm-card, .pm-btn";
    const CONFIRM_SEL =
      ".menu-item a, .p5-menu-li, .p5-btn, .p5-tab-btn, .p5-icon-button, .card-img-wrap, .p5-back-to-top, .p5-music-launcher, .pm-card, .pm-play, .pm-audio, .pm-chev, .pm-nav-btn";
    const BACK_SEL = ".p5-back-button, .p5-close-btn, [data-close-modal], .pm-close";

    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx = null;
    let master = null;
    let noiseBuf = null;
    let unlocked = false;
    let muted = false;
    let lastHover = 0;

    try {
      muted = localStorage.getItem(MUTE_KEY) === "1";
    } catch (e) {}

    /* ---------- AudioContext (dibuat saat interaksi pertama: kebijakan autoplay) ---------- */
    function ensure() {
      if (!AC) return null;
      if (!ctx) {
        ctx = window.__p5ctx || (window.__p5ctx = new AC());
        master = ctx.createGain();
        master.gain.value = 1;
        const comp = ctx.createDynamicsCompressor(); // cegah clipping saat suara menumpuk
        master.connect(comp);
        comp.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.3), ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      return ctx;
    }

    function unlock() {
      if (!ensure()) return;
      unlocked = true;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    }

    function run(fn) {
      if (muted || !unlocked || !ctx) return;
      if (ctx.state === "running") fn(ctx.currentTime + 0.005);
      else ctx.resume().then(() => fn(ctx.currentTime + 0.005)).catch(() => {});
    }

    /* ---------- blok pembangun suara ---------- */
    // envelope: attack 4 ms, turun ke -40 dB pada 90% durasi, lalu 0 (tanpa klik di ujung)
    function env(g, t, dur, vol) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
      g.gain.exponentialRampToValueAtTime(vol * 0.01, t + dur * 0.9);
      g.gain.linearRampToValueAtTime(0, t + dur);
    }

    function tone(type, f0, f1, t, dur, vol) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      env(g, t, dur, vol);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + dur + 0.02);
    }

    function noise(filterType, f0, f1, q, t, dur, vol) {
      const s = ctx.createBufferSource();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      s.buffer = noiseBuf;
      f.type = filterType;
      f.Q.value = q;
      f.frequency.setValueAtTime(f0, t);
      f.frequency.exponentialRampToValueAtTime(f1, t + dur);
      env(g, t, dur, vol);
      s.connect(f);
      f.connect(g);
      g.connect(master);
      s.start(t);
      s.stop(t + dur + 0.02);
    }

    /* ---------- 3 efek utama ---------- */
    function playHoverSfx() {
      const now = performance.now();
      if (now - lastHover < 45) return; // throttle: tahan tombol panah / geser mouse cepat
      lastHover = now;
      run((t) => {
        tone("square", 1500, 2500, t, 0.05, 0.16); // chirp naik
        noise("highpass", 5500, 7000, 0.7, t, 0.02, 0.12); // klik mekanis
      });
    }

    function playConfirmSfx() {
      run((t) => {
        noise("bandpass", 4500, 900, 1.1, t, 0.08, 0.4); // slash
        tone("triangle", 987.77, 987.77, t + 0.02, 0.16, 0.26); // B5
        tone("triangle", 1318.51, 1318.51, t + 0.075, 0.105, 0.26); // E6
        tone("sine", 1975.53, 1975.53, t + 0.02, 0.1, 0.07); // overtone berkilau
      });
    }

    function playBackSfx() {
      run((t) => {
        noise("bandpass", 2400, 300, 0.9, t, 0.14, 0.3); // whoosh
        tone("triangle", 520, 170, t, 0.14, 0.22); // nada turun
        tone("sawtooth", 330, 110, t, 0.12, 0.07);
      });
    }

    /* ---------- tombol mute di HUD ---------- */
    function renderToggle() {
      document.querySelectorAll(".sfx-toggle").forEach((btn) => {
        btn.classList.toggle("is-off", muted);
        btn.setAttribute("aria-pressed", String(!muted));
        btn.setAttribute(
          "aria-label",
          "Efek suara: " + (muted ? "mati" : "aktif") + " (tekan M untuk mengubah)",
        );
        const st = btn.querySelector(".sfx-state");
        if (st) st.textContent = muted ? "OFF" : "ON";
      });
    }

    function setMuted(v) {
      if (v) playBackSfx(); // bunyi sebelum dibisukan
      muted = v;
      try {
        localStorage.setItem(MUTE_KEY, v ? "1" : "0");
      } catch (e) {}
      renderToggle();
      if (!v) playConfirmSfx(); // bunyi konfirmasi saat dinyalakan
    }

    function toggle() {
      unlock();
      setMuted(!muted);
    }

    /* ---------- pemasangan event ---------- */
    function init(opts) {
      const o = opts || {};
      renderToggle();

      // buka AudioContext pada interaksi pertama (klik / tombol / sentuh)
      ["pointerdown", "keydown", "touchstart", "click"].forEach((ev) =>
        document.addEventListener(ev, unlock, { capture: true, passive: true }),
      );

      // hover: kursor masuk ke menu / tombol / kartu (abaikan perangkat sentuh)
      document.addEventListener("mouseover", (e) => {
        if (!e.target.closest) return;
        const el = e.target.closest(HOVER_SEL);
        if (!el || el.contains(e.relatedTarget)) return;
        if (window.matchMedia && !window.matchMedia("(hover: hover)").matches) return;
        playHoverSfx();
      });

      // klik: confirm / back
      document.addEventListener(
        "click",
        (e) => {
          const t = e.target;
          if (!t.closest) return;
          const tg = t.closest(".sfx-toggle");
          if (tg) {
            toggle();
            tg.blur(); // agar Enter berikutnya tidak memicu tombol ini
            return;
          }
          if (t.closest(BACK_SEL) || (t.classList && t.classList.contains("p5-modal"))) {
            playBackSfx();
          } else if (t.closest(CONFIRM_SEL)) {
            playConfirmSfx();
          }
        },
        true,
      );

      document.addEventListener("keydown", (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        if (e.key === "m" || e.key === "M") toggle();
        else if (e.key === "Escape" && o.escape !== false) playBackSfx();
      });
    }

    return { init, hover: playHoverSfx, confirm: playConfirmSfx, back: playBackSfx, toggle };
  })();
  window.p5Sfx = p5Sfx;
  window.p5Navigate = p5Navigate; // dipakai pemutar musik (music.js)

  /* ==========================================================================
     PAGE TRANSITION — Circular Reveal / Iris Wipe (Persona 5)
     Keluar : lingkaran membesar dari POJOK KANAN ATAS  (circle 0% -> 150% at 100% 0%)
     Masuk  : lingkaran menyusut ke POJOK KIRI BAWAH    (circle 150% -> 0% at 0% 100%)
     ========================================================================== */
  const P5_TRANSITION_MS = 550;
  const P5_NAV_KEY = "p5_nav"; // penanda: kunjungan berikutnya dibuka dengan iris
  const P5_EXIT_ORIGIN = { x: 100, y: 0 }; // kanan atas
  const P5_ENTER_ORIGIN = { x: 0, y: 100 }; // kiri bawah
  let p5Overlay = null;
  let p5Navigating = false;

  function p5ReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function p5MarkNav() {
    try {
      sessionStorage.setItem(P5_NAV_KEY, "1");
    } catch (e) {}
  }

  function p5HasNav() {
    try {
      return !!sessionStorage.getItem(P5_NAV_KEY);
    } catch (e) {
      return false;
    }
  }

  function p5CreateOverlay() {
    if (p5Overlay) return p5Overlay;
    p5Overlay = document.querySelector(".p5-page-transition-overlay");
    if (p5Overlay) return p5Overlay;
    p5Overlay = document.createElement("div");
    p5Overlay.className = "p5-page-transition-overlay";
    p5Overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(p5Overlay);
    return p5Overlay;
  }

  function p5SetOverlay(radius, o) {
    p5Overlay.style.clipPath = `circle(${radius}% at ${o.x}% ${o.y}%)`;
  }

  /* ANIMASI KELUAR: circle(0% at 100% 0%) -> circle(150% at 100% 0%), lalu pindah halaman */
  function p5Go(url, pop) {
    if (window.p5Router) window.p5Router.go(url, { pop: !!pop });
    else window.location.href = url;
  }

  function p5Navigate(url, pop) {
    if (p5Navigating) return;
    p5Navigating = true;
    p5MarkNav();
    window.dispatchEvent(new Event("p5:navigate")); // musik tetap menyala
    if (window.p5Router) window.p5Router.prefetch(url);

    if (!p5Overlay || p5ReducedMotion()) {
      p5Go(url, pop);
      return;
    }

    p5Overlay.classList.remove("is-animating"); // set titik awal tanpa transisi
    p5Overlay.style.visibility = "visible";
    p5Overlay.style.pointerEvents = "auto"; // blokir klik saat transisi
    p5SetOverlay(0, P5_EXIT_ORIGIN);
    void p5Overlay.offsetWidth; // paksa reflow agar titik awal terbaca
    p5Overlay.classList.add("is-animating");
    p5SetOverlay(150, P5_EXIT_ORIGIN);

    setTimeout(() => {
      p5Go(url, pop);
    }, P5_TRANSITION_MS);
  }

  /* ANIMASI MASUK: circle(150% at 0% 100%) -> circle(0% at 0% 100%) */
  function p5RevealPage() {
    if (!p5Overlay) return;
    p5Navigating = false;
    if (p5ReducedMotion()) {
      p5Overlay.style.visibility = "hidden";
      document.documentElement.classList.remove("p5-arriving");
      return;
    }
    p5Overlay.classList.remove("is-animating"); // pindah titik pusat TANPA transisi
    p5Overlay.style.visibility = "visible";
    p5Overlay.style.pointerEvents = "none";
    p5SetOverlay(150, P5_ENTER_ORIGIN);
    void p5Overlay.offsetWidth;
    // overlay sudah menutup penuh -> lepas penutup awal (tampilan identik, tanpa jeda)
    document.documentElement.classList.remove("p5-arriving");
    requestAnimationFrame(() => {
      p5Overlay.classList.add("is-animating");
      p5SetOverlay(0, P5_ENTER_ORIGIN);
    });
    setTimeout(() => {
      p5Overlay.classList.remove("is-animating");
      p5Overlay.style.visibility = "hidden";
    }, P5_TRANSITION_MS + 60);
  }

  /* link internal (.html) yang boleh memakai transisi */
  function p5IsInternalLink(a) {
    if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return false;
    let u;
    try {
      u = new URL(a.href, window.location.href);
    } catch (e) {
      return false;
    }
    if (u.origin !== window.location.origin) return false;
    if (!/\.html$/i.test(u.pathname)) return false;
    // abaikan anchor di halaman yang sama
    if (u.pathname === window.location.pathname && u.search === window.location.search && u.hash) return false;
    return true;
  }

  function initPageTransition() {
    p5CreateOverlay();

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest("a[href]");
      if (!p5IsInternalLink(a)) return;
      e.preventDefault();
      p5Navigate(a.href);
    });

    // tombol Back/Forward browser (bfcache): buka overlay lagi
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) p5RevealPage();
    });

    // setiap meninggalkan halaman (link, Back/Forward, reload) halaman berikutnya dibuka dengan iris
    window.addEventListener("pagehide", p5MarkNav);

    // kunjungan pertama (tanpa penanda) tampil biasa; selain itu iris membuka halaman
    if (p5HasNav()) p5RevealPage();
  }

  /* ---------- jam ---------- */
  const clock = document.getElementById("clock");
  function tick() {
    if (!clock) return;
    const d = new Date();
    clock.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  tick();
  setInterval(tick, 15000);

  /* efek 3D latar ditangani bgfx.js */

  select(0);
  p5Sfx.init({ escape: false }); // Escape tidak melakukan apa pun di halaman utama
  sfxReady = true;
  initPageTransition();
})();
