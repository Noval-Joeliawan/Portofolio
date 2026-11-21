/**
 * Noval Joeliawan Portfolio — Persona 5 UI / Punk Zine Script
 * Dedicated Multi-Page Navigation Engine
 */

const STORAGE_KEY = "noval_portfolio_content";
const THEME_KEY = "noval_portfolio_theme";
const SERTIFIKAT_LIMIT = 12;

/* --- DEFAULT CONTENT DATA --- */
const defaultContent = [
  {
    id: "seed-1",
    title: "Sertifikat Fiksi",
    description: "Juara 3 Tingkat Kabupaten Cabang Ajang Rencana Usaha Teknologi Digital",
    image: "sertifikat/Sertifikat Fiksi.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-2",
    title: "Sertifikat Gamelab",
    description: "Game Edukasi Construct",
    image: "sertifikat/Sertifikat Gamelab.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-12",
    title: "Sertifikat Mimo",
    description: "HTML Fundamentals",
    image: "sertifikat/Sertifikat Mmo.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-3",
    title: "Sertifikat Sololearn",
    description: "Introduction to HTML",
    image: "sertifikat/Sertifikat Sololearn 1.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-4",
    title: "Sertifikat Sololearn",
    description: "Introduction to CSS",
    image: "sertifikat/Sertifikat Sololearn 2.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-5",
    title: "Sertifikat Sololearn",
    description: "Introduction to JavaScript",
    image: "sertifikat/Sertifikat Sololearn 3.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-6",
    title: "Sertifikat Dicoding",
    description: "Belajar Dasar Pemrograman Web",
    image: "sertifikat/sertifikat dicoding 1.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-7",
    title: "Sertifikat Dicoding",
    description: "Belajar Dasar AI",
    image: "sertifikat/sertifikat dicoding 2.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-8",
    title: "Sertifikat Dicoding",
    description: "Financial Literacy",
    image: "sertifikat/sertifikat dicoding 3.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-9",
    title: "Sertifikat Dicoding",
    description: "Belajar Dasar Pengembangan Diri",
    image: "sertifikat/sertifikat dicoding 4.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-10",
    title: "Sertifikat Dicoding",
    description: "Belajar Dasar Pemrograman JavaScript",
    image: "sertifikat/sertifikat dicoding 5.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-11",
    title: "Sertifikat Dicoding",
    description: "Belajar Membuat Frontend Web untuk Pemula",
    image: "sertifikat/sertifikat dicoding 6.jpg",
    category: "sertifikat",
  },
  {
    id: "proyek-1",
    category: "proyek",
    title: "Game Bomskuy",
    description:
      "Game interaktif berbasis web menggunakan HTML, CSS, dan JavaScript. Pemain harus menghindari bom yang terus bermunculan di layar permainan.",
    tags: ["HTML", "CSS", "JavaScript"],
    image: "assetporto/bomskuy.png",
    demoUrl: "#", // isi dengan link demo (mis. https://usernameku.github.io/bomskuy/)
    repoUrl: "#", // isi dengan link GitHub repo
  },
  {
    id: "proyek-2",
    category: "proyek",
    title: "Aplikasi Bill Splitter",
    description:
      "Aplikasi kalkulasi untuk membagi tagihan pembayaran secara akurat, cepat, dan adil antara beberapa orang.",
    tags: ["HTML", "CSS", "JavaScript"],
    image: "assetporto/split.png",
    demoUrl: "#",
    repoUrl: "#",
  },
  {
    id: "proyek-3",
    category: "proyek",
    title: "Game TetrIs",
    description:
      "Game susun balok klasik Tetris berbasis web dengan logika collision detection, skoring real-time, dan manipulasi grid.",
    tags: ["HTML", "CSS", "JavaScript"],
    image: "assetporto/Tetris.png",
    demoUrl: "#",
    repoUrl: "#",
  },
];

/* --- STORAGE & DATA HELPERS --- */
// data lama di localStorage belum punya demoUrl / repoUrl -> lengkapi dari defaultContent
function withProjectLinks(items) {
  if (!Array.isArray(items)) return items;
  return items.map((it) => {
    if (!it || it.category !== "proyek") return it;
    const def = defaultContent.find((d) => d.id === it.id);
    if (!def) return it;
    return Object.assign({ demoUrl: def.demoUrl, repoUrl: def.repoUrl }, it);
  });
}

function getContent() {
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) {
    saveContent(defaultContent);
    return defaultContent;
  }
  try {
    return withProjectLinks(JSON.parse(rawData));
  } catch (error) {
    console.error("Local storage content parse failed, restoring default.", error);
    saveContent(defaultContent);
    return defaultContent;
  }
}

function saveContent(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* --- CARD TEMPLATES --- */
function certCardTemplate(item) {
  return `
    <div class="cert-card p5-box" data-aos="zoom-in">
      <div class="card-top-bar">
        <span>LOOT ARCHIVE</span>
        <span class="card-stamp-mini">VERIFIED</span>
      </div>
      <div class="card-img-wrap">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" />
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(item.title)}</div>
        ${item.description ? `<div class="card-desc">${escapeHtml(item.description)}</div>` : ""}
      </div>
    </div>`;
}

function projectCardTemplate(item) {
  const tags = Array.isArray(item.tags) ? item.tags : [];
  return `
    <div class="project-card p5-box" data-aos="zoom-in">
      <div class="card-top-bar">
        <span>TARGET MISSION</span>
        <span class="card-stamp-mini">CLEARED</span>
      </div>
      <div class="card-img-wrap">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" />
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(item.title)}</div>
        ${item.description ? `<div class="card-desc">${escapeHtml(item.description)}</div>` : ""}
        ${tags.length ? `<div class="card-tags">${tags.map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
        <div class="card-actions">
          <a class="p5-action p5-action-demo" href="${escapeHtml(item.demoUrl || "#")}" target="_blank" rel="noopener noreferrer"><span>PLAY DEMO ▶</span></a>
          <a class="p5-action p5-action-repo" href="${escapeHtml(item.repoUrl || "#")}" target="_blank" rel="noopener noreferrer"><span>GITHUB ↗</span></a>
        </div>
      </div>
    </div>`;
}

/* --- RENDER FUNCTIONS FOR PAGES --- */
function renderCertificates() {
  const container = document.getElementById("sertifikat-list");
  if (!container) return;
  const items = getContent()
    .filter((i) => i.category === "sertifikat")
    .slice(0, SERTIFIKAT_LIMIT);
  container.innerHTML = items.length
    ? items.map(certCardTemplate).join("")
    : `<p class="empty-state">// BELUM ADA SERTIFIKAT DITAMBAHKAN //</p>`;
}

function renderProjects() {
  const container = document.getElementById("proyek-list");
  if (!container) return;
  const items = getContent().filter((i) => i.category === "proyek");
  container.innerHTML = items.length
    ? items.map(projectCardTemplate).join("")
    : `<p class="empty-state">// BELUM ADA PROYEK DITAMBAHKAN //</p>`;
}

function renderTimeline() {
  const container = document.getElementById("timelineContainer");
  if (!container) return;
  const events = [
    {
      year: "2025 - SEKARANG",
      title: "Memasuki SMK Krian 1 Sidoarjo",
      desc: "Masuk jurusan Rekayasa Perangkat Lunak / Teknologi Informasi dan mulai fokus mendalami web architecture.",
    },
    {
      year: "2025",
      title: "Sertifikasi Dicoding, Sololearn & Mimo",
      desc: "Menyelesaikan serangkaian modul intensif frontend, fundamental JavaScript, CSS modern, dan dasar-dasar kecerdasan buatan.",
    },
    {
      year: "2024",
      title: "Eksplorasi Web Development",
      desc: "Mempelajari dasar HTML5 semantik, CSS Flexbox/Grid, animasi visual, dan DOM manipulation secara mandiri.",
    },
    {
      year: "2023",
      title: "Awal Ketertarikan Coding",
      desc: "Mulai bereksperimen dengan logika dasar pemrograman komputer dan pemecahan masalah algoritma.",
    },
  ];
  container.innerHTML = events
    .map(
      (ev) => `
      <div class="timeline-item" data-aos="fade-up">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="timeline-year">${ev.year}</span>
          <h4>${ev.title}</h4>
          <p>${ev.desc}</p>
        </div>
      </div>`,
    )
    .join("");
}

/* --- PENTAGON STAR RADAR (SOCIAL STATS) --- */
function renderSkillRadar() {
  const host = document.getElementById("skillRadar");
  if (!host) return;
  const stats = [
    { name: "FRONTEND", sub: "HTML / CSS", v: 85 },
    { name: "LOGIC", sub: "JAVASCRIPT", v: 65 },
    { name: "BACKEND", sub: "PHP / SQL", v: 45 },
    { name: "TOOLS", sub: "GIT / GITHUB", v: 70 },
    { name: "UI / CREATIVITY", sub: "DESIGN SENSE", v: 80 },
  ];
  const W = 520, H = 470, cx = 260, cy = 236, R = 122;
  const ang = (i) => (-90 + i * 72) * (Math.PI / 180);
  const pt = (i, k) => [cx + Math.cos(ang(i)) * R * k, cy + Math.sin(ang(i)) * R * k];
  const fmt = (p) => p[0].toFixed(1) + "," + p[1].toFixed(1);
  const ring = (k) => stats.map((_, i) => fmt(pt(i, k))).join(" ");
  const star = [0, 2, 4, 1, 3].map((i) => fmt(pt(i, 1))).join(" ");
  const poly = stats.map((s, i) => fmt(pt(i, s.v / 100))).join(" ");

  const svg =
    `<svg class="radar-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik statistik skill: ${stats.map((s) => s.name + " " + s.v + "%").join(", ")}">` +
    `<polygon class="radar-bg" points="${ring(1.1)}"/>` +
    [0.25, 0.5, 0.75, 1].map((k) => `<polygon class="radar-ring" points="${ring(k)}"/>`).join("") +
    `<polygon class="radar-star" points="${star}"/>` +
    stats.map((_, i) => `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${pt(i, 1)[0].toFixed(1)}" y2="${pt(i, 1)[1].toFixed(1)}"/>`).join("") +
    `<g class="radar-stat" style="transform-origin:${cx}px ${cy}px"><polygon class="radar-poly" points="${poly}"/>` +
    stats.map((s, i) => `<circle class="radar-dot" cx="${pt(i, s.v / 100)[0].toFixed(1)}" cy="${pt(i, s.v / 100)[1].toFixed(1)}" r="5.5"/>`).join("") +
    `</g></svg>`;

  const anchors = [
    "translate(-50%,-100%)", // atas
    "translate(-62%,-128%)", // kanan atas
    "translate(0,0)", // kanan bawah
    "translate(-100%,0)", // kiri bawah
    "translate(-38%,-128%)", // kiri atas
  ];
  const styles = ["is-white", "is-black", "is-red", "is-white", "is-black"];
  const labels = stats
    .map((s, i) => {
      const [x, y] = pt(i, 1.14);
      return `<div class="radar-label ${styles[i]}" style="left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%;--anc:${anchors[i]};--tilt:${i % 2 ? 3 : -3}deg"><b>${s.name}</b><small>${s.sub} <i>${s.v}</i></small></div>`;
    })
    .join("");

  host.innerHTML = svg + labels;
  host.classList.remove("is-in");
  void host.offsetWidth;
  setTimeout(() => host.classList.add("is-in"), 120);
}

/* --- JRPG DIALOGUE BOX (about.html) --- */
function initJrpgDialog() {
  const root = document.getElementById("jrpgDialog");
  if (!root) return;
  const textEl = document.getElementById("jrpgText");
  const nextBtn = document.getElementById("jrpgNext");
  const pageEl = document.getElementById("jrpgPage");
  const box = root.querySelector(".jrpg-box");
  const LINES = [
    "Yo! Aku Noval Joeliawan, pelajar SMK Krian 1 Sidoarjo. Selamat datang di markas rahasiaku!",
    "Perjalanan codingku dimulai dari HTML dan CSS. Dari situ aku jatuh cinta sama dunia web development.",
    "Sekarang aku lagi mendalami JavaScript sambil bikin proyek kecil: game Bomskuy, Bill Splitter, sampai Tetris.",
    "Tujuanku jadi developer kreatif yang bikin website bermanfaat. Yuk, intip proyek-proyekku!",
  ];
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let line = 0, pos = 0, typing = false, timer = null, count = 0;

  function show() {
    textEl.textContent = LINES[line].slice(0, pos);
    box.classList.toggle("is-done", !typing);
    pageEl.textContent = line + 1 + "/" + LINES.length;
    nextBtn.innerHTML = !typing && line === LINES.length - 1 ? "REPLAY ↺" : "NEXT ▶";
  }
  function tick() {
    if (!typing) return;
    pos++;
    const ch = LINES[line][pos - 1];
    if (ch && ch !== " " && ++count % 2 === 0 && window.p5Sfx && window.p5Sfx.blip) window.p5Sfx.blip();
    if (pos >= LINES[line].length) typing = false;
    show();
    if (typing) timer = setTimeout(tick, /[.,!?:]/.test(ch) ? 150 : 26);
  }
  function startLine(i) {
    clearTimeout(timer);
    line = i;
    pos = 0;
    count = 0;
    if (calm) {
      pos = LINES[line].length;
      typing = false;
      show();
      return;
    }
    typing = true;
    show();
    timer = setTimeout(tick, 120);
  }
  function advance() {
    if (typing) {
      clearTimeout(timer);
      pos = LINES[line].length;
      typing = false;
      show();
    } else {
      startLine((line + 1) % LINES.length);
    }
  }
  box.addEventListener("click", advance);
  box.addEventListener("keydown", (e) => {
    if (e.target === box && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      advance();
    }
  });

  let started = false;
  const begin = () => {
    if (started) return;
    started = true;
    startLine(0);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => {
      if (en.some((x) => x.isIntersecting)) {
        io.disconnect();
        begin();
      }
    }, { threshold: 0.35 });
    io.observe(root);
    setTimeout(begin, 2500);
  } else begin();
}

function renderSkillBars() {
  const container = document.getElementById("skillBarsContainer");
  if (!container) return;
  const skills = [
    { name: "HTML5", percent: 85 },
    { name: "CSS3", percent: 75 },
    { name: "JAVASCRIPT", percent: 55 },
    { name: "PHP", percent: 40 },
    { name: "MYSQL", percent: 45 },
    { name: "GITHUB", percent: 60 },
  ];
  container.innerHTML = skills
    .map(
      (s) => `
      <div class="skill-bar-item" data-aos="fade-up">
        <div class="skill-bar-header">
          <span class="skill-bar-name">${s.name}</span>
          <span class="skill-bar-percent">${s.percent}%</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill" data-width="${s.percent}"></div>
        </div>
      </div>`,
    )
    .join("");

  setTimeout(() => {
    document.querySelectorAll(".skill-bar-fill").forEach((fill) => {
      const width = fill.getAttribute("data-width");
      fill.style.width = width + "%";
    });
  }, 200);
}

/* --- RANSOM NOTE TYPOGRAPHY GENERATOR --- */
function applyRansomNoteToElement(element) {
  if (!element || element.dataset.ransomDone) return;
  element.dataset.ransomDone = "true";

  const text = element.textContent.trim();
  element.textContent = "";

  const words = text.split(" ");
  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.style.display = "inline-block";
    wordSpan.style.whiteSpace = "nowrap";

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const charSpan = document.createElement("span");
      charSpan.className = "ransom-char";

      const styleNum = Math.floor(Math.random() * 4) + 1;
      charSpan.classList.add(`ransom-style-${styleNum}`);

      const angle = (Math.random() * 8 - 4).toFixed(1);
      charSpan.style.transform = `rotate(${angle}deg)`;

      charSpan.textContent = char;
      wordSpan.appendChild(charSpan);
    }

    element.appendChild(wordSpan);

    if (wordIndex < words.length - 1) {
      const space = document.createElement("span");
      space.className = "ransom-space";
      element.appendChild(space);
    }
  });
}

function initRansomNote() {
  document.querySelectorAll(".ransom-target, .ransom-menu, .logo-ransom").forEach((el) => {
    applyRansomNoteToElement(el);
  });
}

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
    ".p5-menu-li, .p5-btn, .p5-tab-btn, .cert-card, .project-card, .p5-icon-button, .p5-back-button, .p5-close-btn, .sfx-toggle, #prev, #next, .p5-music-launcher, .pm-card, .pm-btn, .p5-action, .jrpg-next";
  const CONFIRM_SEL =
    ".menu-item a, .p5-menu-li, .p5-btn, .p5-tab-btn, .p5-icon-button, .card-img-wrap, .p5-back-to-top, .p5-music-launcher, .pm-card, .pm-play, .pm-audio, .pm-chev, .pm-nav-btn, .p5-action, .jrpg-next";
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

  // blip singkat untuk efek mesin ketik dialog
  function playBlipSfx() {
    run((t) => {
      tone("square", 560 + Math.random() * 180, 520, t, 0.03, 0.075);
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
    // AudioContext sudah terbuka di halaman sebelumnya (pindah halaman tanpa reload)
    if (window.__p5ctx && window.__p5ctx.state === "running") unlock();

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

  return { init, hover: playHoverSfx, confirm: playConfirmSfx, back: playBackSfx, blip: playBlipSfx, toggle };
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

/* --- MAIN MENU KEYBOARD NAVIGATION (index.html) --- */
let currentMenuIndex = 0;

function initP5Menu() {
  const menuList = document.getElementById("p5MenuList");
  if (!menuList) return;

  const items = menuList.querySelectorAll(".p5-menu-item");
  if (!items.length) return;

  function setActiveItem(index) {
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    currentMenuIndex = index;

    items.forEach((item, i) => {
      if (i === currentMenuIndex) {
        item.classList.add("active");
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        item.classList.remove("active");
      }
    });
  }

  items.forEach((item, idx) => {
    item.addEventListener("mouseenter", () => {
      setActiveItem(idx);
    });
  });

  // Keyboard navigation on index.html: ArrowUp, ArrowDown, Enter
  window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveItem(currentMenuIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveItem(currentMenuIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const activeItem = items[currentMenuIndex];
      if (activeItem) {
        const link = activeItem.querySelector("a");
        if (link) {
          p5Navigate(link.href);
        }
      }
    }
  });
}

/* --- SUBPAGE ESCAPE KEY HANDLER --- */
function initSubpageEscape() {
  // If we are not on index.html (or if URL path is not root), pressing ESC returns to index.html
  const isHomePage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("/") ||
    window.location.pathname === "";

  window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

    if (e.key === "Escape") {
      // 1. Close open modal first if any
      let closedModal = false;
      document.querySelectorAll(".p5-modal").forEach((m) => {
        if (m.style.display === "flex") {
          m.style.display = "none";
          closedModal = true;
        }
      });
      // 2. If no modal was open and we are on a subpage, navigate to index.html
      if (!closedModal && !isHomePage) {
        p5Navigate("index.html");
      }
    }
  });
}

/* --- HUD REAL-TIME CLOCK --- */
function initRealtimeHUD() {
  const dateEl = document.getElementById("hudDate");
  const timeEl = document.getElementById("hudTime");
  if (!dateEl && !timeEl) return;

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  function update() {
    // Jam HUD selalu menampilkan WIB (Asia/Jakarta), apa pun zona waktu pengunjung
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    if (dateEl) {
      const dayName = days[now.getDay()];
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      dateEl.textContent = `${dayName} ${month}/${date}`;
    }
    if (timeEl) {
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      timeEl.textContent = `${hours}:${mins}:${secs}`;
    }
  }

  update();
  setInterval(update, 1000);
}

/* --- TYPING EFFECT --- */
function initTypingEffect() {
  const el = document.getElementById("typingText");
  if (!el) return;

  const phrases = [
    "Web Developer",
    "SMK Krian 1 Sidoarjo",
    "HTML & CSS Enthusiast",
    "JavaScript Explorer",
    "Creative Interface Maker",
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  function tick() {
    if (isPaused) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      el.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 25 : 55;

    if (!isDeleting && charIndex === currentPhrase.length) {
      speed = 1800;
      isPaused = true;
      setTimeout(() => {
        isPaused = false;
        isDeleting = true;
        tick();
      }, speed);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      speed = 300;
    }

    setTimeout(tick, speed);
  }

  setTimeout(tick, 400);
}

/* --- SCROLL PROGRESS --- */
function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + "%";
  });
}

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* --- THEME TOGGLE (PERSONA ALT STYLING) --- */
function initTheme() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") {
    document.documentElement.setAttribute("data-p5-alt", "dark");
  }

  toggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-p5-alt") === "dark";
    if (isDark) {
      html.removeAttribute("data-p5-alt");
      localStorage.setItem(THEME_KEY, "light");
    } else {
      html.setAttribute("data-p5-alt", "dark");
      localStorage.setItem(THEME_KEY, "dark");
    }
  });
}

/* --- MODALS (IMAGE PREVIEW & EMAIL) --- */
function initModals() {
  const imgModal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");

  document.addEventListener("click", (e) => {
    // tombol aksi kartu proyek: tidak membuka modal; link kosong ("#") tidak melakukan apa-apa
    const act = e.target.closest(".p5-action");
    if (act) {
      if ((act.getAttribute("href") || "#") === "#") e.preventDefault();
      return;
    }
    const targetImg = e.target.closest(".card-img-wrap img");
    if (targetImg && imgModal && modalImg) {
      imgModal.style.display = "flex";
      modalImg.src = targetImg.src;
    }
  });

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close-modal");
      const targetModal = document.getElementById(modalId);
      if (targetModal) targetModal.style.display = "none";
    });
  });

  document.querySelectorAll(".p5-modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  });

  const openEmailBtn = document.getElementById("openEmailModal");
  const emailModal = document.getElementById("emailModal");
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  const emailText = document.getElementById("emailText");

  if (openEmailBtn && emailModal) {
    openEmailBtn.addEventListener("click", () => {
      emailModal.style.display = "flex";
    });
  }

  if (copyEmailBtn && emailText) {
    copyEmailBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(emailText.textContent.trim()).then(() => {
        copyEmailBtn.querySelector(".p5-btn-text").textContent = "TERKIRIM!";
        setTimeout(() => {
          copyEmailBtn.querySelector(".p5-btn-text").textContent = "SALIN";
        }, 1800);
      });
    });
  }
}

/* --- GALLERY PAGE FUNCTIONALITY (`gallery.html`) --- */
function initGalleryPage() {
  const grid = document.getElementById("fullGalleryGrid");
  const tabs = document.querySelectorAll(".p5-tab-btn");
  if (!grid || !tabs.length) return;

  function renderCategory(cat) {
    const all = getContent();
    let filtered;
    if (cat === "semua") {
      filtered = all.filter((i) => i.category === "sertifikat" || i.category === "proyek");
    } else {
      filtered = all.filter((i) => i.category === cat);
    }

    grid.innerHTML = filtered.length
      ? filtered
          .map((i) =>
            i.category === "sertifikat" ? certCardTemplate(i) : projectCardTemplate(i),
          )
          .join("")
      : `<p class="empty-state">// BELUM ADA REKAMAN DITEMUKAN //</p>`;

    if (window.AOS) AOS.refresh();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderCategory(tab.getAttribute("data-category"));
    });
  });

  const params = new URLSearchParams(window.location.search);
  const requestedTab = params.get("tab");
  const validTabs = ["semua", "sertifikat", "proyek"];
  const initialTab = validTabs.includes(requestedTab) ? requestedTab : "semua";

  tabs.forEach((t) => t.classList.remove("active"));
  const activeTabEl = Array.from(tabs).find((t) => t.getAttribute("data-category") === initialTab);
  if (activeTabEl) activeTabEl.classList.add("active");

  renderCategory(initialTab);
}

/* --- INITIALIZATION ON DOM READY --- */
document.addEventListener("DOMContentLoaded", () => {
  initPageTransition();
  p5Sfx.init({ escape: true });
  renderCertificates();
  renderProjects();
  renderTimeline();
  renderSkillBars();
  renderSkillRadar();

  initRansomNote();
  initP5Menu();
  initSubpageEscape();
  initRealtimeHUD();
  initTypingEffect();
  initScrollProgress();
  initBackToTop();
  initTheme();
  initModals();
  initGalleryPage();
  initJrpgDialog();

  if (window.AOS) {
    AOS.init({
      duration: 750,
      once: true,
      easing: "ease-out-cubic",
    });
  }
});
