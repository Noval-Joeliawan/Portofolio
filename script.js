const STORAGE_KEY = "noval_portfolio_content";
const THEME_KEY = "noval_portfolio_theme";
const SERTIFIKAT_HOME_LIMIT = 8;

function svgToDataUri(svg) {
  return "data:image/svg+xml," + encodeURIComponent(svg.trim());
}

function placeholderProjectImage(label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
      <rect width="640" height="400" fill="#ffffff"/>
      <rect width="640" height="400" fill="none" stroke="#e7eaf3" stroke-width="2"/>
      <rect x="24" y="24" width="592" height="352" rx="16" fill="#fff8e6" stroke="#e7f3f5" stroke-width="1.4"/>
      <circle cx="60" cy="60" r="8" fill="#2db5ce"/>
      <rect x="52" y="100" width="220" height="14" rx="4" fill="#218dae" opacity="0.85"/>
      <rect x="52" y="128" width="340" height="10" rx="4" fill="#bfe3ea"/>
      <rect x="52" y="150" width="280" height="10" rx="4" fill="#d9f0f4"/>
      <text x="320" y="260" font-family="Inter, sans-serif" font-size="18" fill="#218dae" text-anchor="middle" opacity="0.9">${label}</text>
    </svg>`;
  return svgToDataUri(svg);
}

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
    title: "Sertifikat Dicoding",
    description: "Belajar Dasar Pemrograman Web",
    image: "sertifikat/sertifikat dicoding 1.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-3",
    title: "Sertifikat Dicoding",
    description: "Belajar Dasar Ai",
    image: "sertifikat/sertifikat dicoding 2.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-4",
    title: "Sertifikat Dicoding",
    description: "Financial Literacy",
    image: "sertifikat/sertifikat dicoding 3.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-5",
    title: "Sertifikat Dicoding",
    description: "Belajar Dasar Pengembangan Diri",
    image: "sertifikat/sertifikat dicoding 4.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-6",
    title: "Sertifikat Dicoding",
    description: "Belajar Dasar Pemrograman JavaScript",
    image: "sertifikat/sertifikat dicoding 5.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-7",
    title: "Sertifikat Dicoding",
    description: "Belajar Membuat Frontend Web untuk Pemula",
    image: "sertifikat/sertifikat dicoding 6.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-8",
    title: "Sertifikat Sololearn",
    description: "Introduction to HTML",
    image: "sertifikat/Sertifikat Sololearn 1.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-9",
    title: "Sertifikat Sololearn",
    description: "Introduction to CSS",
    image: "sertifikat/Sertifikat Sololearn 2.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-10",
    title: "Sertifikat Sololearn",
    description: "Introduction to JavaScript",
    image: "sertifikat/Sertifikat Sololearn 3.jpg",
    category: "sertifikat",
  },
  {
    id: "seed-11",
    title: "Sertifikat Mimo",
    description: "HTML Fundamentals",
    image: "sertifikat/Sertifikat Mmo.jpg",
    category: "sertifikat",
  },
  {
    id: "proyek-1",
    category: "proyek",
    title: "Game Bomskuy",
    description:
      "Game sederhana berbasis web menggunakan HTML, CSS, dan JavaScript. Pemain harus menghindari bom yang muncul di layar.",
    tags: ["HTML", "CSS", "JavaScript"],
    image: "assetporto/bomskuy.png",
  },
  {
    id: "proyek-2",
    category: "proyek",
    title: "Aplikasi Bill Splitter",
    description:
      "Aplikasi untuk membagi tagihan secara adil antara beberapa orang.",
    tags: ["HTML", "CSS", "JavaScript"],
    image: "assetporto/split.png",
  },
  {
    id: "proyek-3",
    category: "proyek",
    title: "Game TetrIs",
    description:
      "Game Tetris sederhana berbasis web menggunakan HTML, CSS, dan JavaScript. Pemain harus menyusun balok agar tidak menumpuk.",
    tags: ["HTML", "CSS", "JavaScript"],
    image: "assetporto/Tetris.png",
  },
];

function getContent() {
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) {
    saveContent(defaultContent);
    return defaultContent;
  }
  try {
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Data di localStorage rusak, reset ke default.", error);
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

function certCardTemplate(item) {
  return `
    <div class="cert-card" data-aos="zoom-in">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
      <div class="cert-body">
        <div class="cert-title">${escapeHtml(item.title)}</div>
        ${item.description ? `<div class="cert-desc">${escapeHtml(item.description)}</div>` : ""}
      </div>
    </div>`;
}

function projectCardTemplate(item) {
  const tags = Array.isArray(item.tags) ? item.tags : [];
  return `
    <div class="project-card" data-aos="zoom-in">
      <div class="browser-chrome">
        <span class="browser-chrome-icon">🌐</span>
        <span class="browser-bar">${escapeHtml((item.title || "proyek").toLowerCase().replace(/\s+/g, "-"))}</span>
      </div>
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
      <div class="project-body">
        <div class="project-title">${escapeHtml(item.title)}</div>
        ${item.description ? `<div class="project-desc">${escapeHtml(item.description)}</div>` : ""}
        ${tags.length ? `<div class="project-tags">${tags.map((t) => `<span class="project-tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
      </div>
    </div>`;
}

function renderCertificates() {
  const container = document.getElementById("sertifikat-list");
  if (!container) return;
  const items = getContent()
    .filter((i) => i.category === "sertifikat")
    .slice(0, SERTIFIKAT_HOME_LIMIT);
  container.innerHTML = items.length
    ? items.map(certCardTemplate).join("")
    : `<p class="empty-state">belum ada sertifikat ditambahkan</p>`;
}

function renderProjects() {
  const container = document.getElementById("proyek-list");
  if (!container) return;
  const items = getContent().filter((i) => i.category === "proyek");
  container.innerHTML = items.length
    ? items.map(projectCardTemplate).join("")
    : `<p class="empty-state">belum ada proyek ditambahkan</p>`;
}

function renderEverything() {
  renderCertificates();
  renderProjects();
  if (window.AOS) AOS.refresh();
}

function renderTimeline() {
  const container = document.getElementById("timelineContainer");
  if (!container) return;
  const events = [
    {
      year: "2025 - Sekarang",
      title: "Memasuki SMK",
      desc: "Masuk SMK Krian 1 Sidoarjo dan mulai mendalami dunia teknologi dan informasi.",
    },
    {
      year: "2025",
      title: "Sertifikat Dicoding & Sololearn",
      desc: "Menyelesaikan kursus dasar pemrograman web dari Dicoding, Sololearn, dan Mimo.",
    },
    {
      year: "2024",
      title: "Belajar Web Development",
      desc: "Fokus mempelajari HTML, CSS, dan JavaScript secara otodidak di SMK Krian 1 Sidoarjo.",
    },
    {
      year: "2023",
      title: "Mulai Tertarik Coding",
      desc: "Mulai belajar dasar-dasar pemrograman dan logika algoritma di sekolah.",
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

function renderSkillBars() {
  const container = document.getElementById("skillBarsContainer");
  if (!container) return;
  const skills = [
    { name: "HTML", percent: 85 },
    { name: "CSS", percent: 75 },
    { name: "JavaScript", percent: 55 },
    { name: "PHP", percent: 40 },
    { name: "MySQL", percent: 45 },
    { name: "GitHub", percent: 60 },
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

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const width = fill.getAttribute("data-width");
          fill.style.width = width + "%";
          fill.classList.add("animated");
          observer.unobserve(fill);
        }
      });
    },
    { threshold: 0.3 },
  );

  document.querySelectorAll(".skill-bar-fill").forEach((fill) => {
    observer.observe(fill);
  });
}

function initPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;
  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.add("hidden");
    }, 400);
  });

  setTimeout(() => {
    if (!preloader.classList.contains("hidden")) {
      preloader.classList.add("hidden");
    }
  }, 2500);
}

function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + "%";
  });
}

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initTheme() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  toggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    if (isDark) {
      html.removeAttribute("data-theme");
      localStorage.setItem(THEME_KEY, "light");
    } else {
      html.setAttribute("data-theme", "dark");
      localStorage.setItem(THEME_KEY, "dark");
    }
  });
}

function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");

  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 22 : 44;

  let isDark = document.documentElement.getAttribute("data-theme") === "dark";

  function resize() {
    canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const motes = [];
  function makeMote(initial) {
    return {
      x: Math.random() * canvas.width,
      y: initial ? Math.random() * canvas.height : canvas.height + 12,
      r: Math.random() * 1.7 + 0.5,
      speed: Math.random() * 0.28 + 0.05,
      drift: (Math.random() - 0.5) * 0.16,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.32 + 0.1,
      bright: Math.random() < 0.35,
    };
  }
  for (let i = 0; i < COUNT; i++) motes.push(makeMote(true));

  function tick(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const m of motes) {
      m.y -= m.speed;
      m.x += m.drift + Math.sin(t / 1600 + m.phase) * 0.07;
      if (m.y < -14) Object.assign(m, makeMote(false));
      if (m.x < -14) m.x = canvas.width + 10;
      else if (m.x > canvas.width + 14) m.x = -10;

      let color;
      if (isDark) color = m.bright ? "221, 247, 255" : "125, 211, 232";
      else color = m.bright ? "255, 255, 255" : "180, 236, 245";

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + color + "," + m.alpha.toFixed(3) + ")";
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  document.getElementById("themeToggle")?.addEventListener("click", () => {
    isDark = document.documentElement.getAttribute("data-theme") === "dark";
  });
}

function initTypingEffect() {
  const el = document.getElementById("typingText");
  if (!el) return;

  const words = [
    "Web Developer",
    "HTML & CSS Enthusiast",
    "JavaScript Learner",
    "Tech Explorer",
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  function type() {
    if (isPaused) return;

    const current = words[wordIndex];

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === current.length) {
      speed = 2000;
      isPaused = true;
      setTimeout(() => {
        isPaused = false;
        isDeleting = true;
        type();
      }, speed);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 400;
    }

    setTimeout(type, speed);
  }

  setTimeout(type, 600);
}

function initNavbar() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  if (!hamburger || !navMenu) return;
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    hamburger.classList.toggle("active");
  });
  navMenu.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      hamburger.classList.remove("active");
    });
  });
}

function initImageModalDelegation() {
  const imgModal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");
  if (!imgModal || !modalImg) return;
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".cert-card img, .project-card img");
    if (!img) return;
    imgModal.style.display = "flex";
    modalImg.src = img.src;
  });
}

function initEmailModal() {
  const emailModal = document.getElementById("emailModal");
  const openEmailModalBtn = document.getElementById("openEmailModal");
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  const emailText = document.getElementById("emailText");
  if (!emailModal || !openEmailModalBtn) return;
  openEmailModalBtn.addEventListener("click", () => {
    emailModal.style.display = "flex";
  });
  copyEmailBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(emailText.textContent.trim()).then(() => {
      copyEmailBtn.textContent = "Tersalin";
      setTimeout(() => {
        copyEmailBtn.textContent = "Salin";
      }, 1800);
    });
  });
}

function initFullGalleryPage() {
  const grid = document.getElementById("fullGalleryGrid");
  const tabs = document.querySelectorAll(".gallery-tab");
  if (!grid || !tabs.length) return;

  function templateFor(item) {
    return item.category === "sertifikat"
      ? certCardTemplate(item)
      : projectCardTemplate(item);
  }

  function render(category) {
    const all = getContent();
    const items =
      category === "semua"
        ? all.filter(
          (i) => i.category === "sertifikat" || i.category === "proyek",
        )
        : all.filter((i) => i.category === category);

    grid.innerHTML = items.length
      ? items.map(templateFor).join("")
      : `<p class="empty-state">belum ada item ditambahkan</p>`;

    if (window.AOS) AOS.refresh();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      render(tab.getAttribute("data-category"));
    });
  });

  const params = new URLSearchParams(window.location.search);
  const requestedTab = params.get("tab");
  const validTabs = ["semua", "sertifikat", "proyek"];
  const initialTab = validTabs.includes(requestedTab) ? requestedTab : "semua";

  tabs.forEach((t) => t.classList.remove("active"));
  const activeTabEl = Array.from(tabs).find(
    (t) => t.getAttribute("data-category") === initialTab,
  );
  if (activeTabEl) activeTabEl.classList.add("active");

  render(initialTab);
}

function initModalCloseHandlers() {
  document.querySelectorAll(".close").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-close-modal");
      const modal = document.getElementById(targetId);
      if (modal) modal.style.display = "none";
    });
  });
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  });
}

function initExtraAnimations() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, i) => {
    card.style.transitionDelay = i * 0.06 + "s";
  });
}

function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal").forEach((m) => {
        if (m.style.display === "flex") m.style.display = "none";
      });
    }

    if (e.ctrlKey && e.shiftKey && e.key === "T") {
      e.preventDefault();
      document.getElementById("themeToggle")?.click();
    }
  });
}

function initWaveLayers() {
  document.querySelectorAll(".circuit-divider").forEach((divider) => {
    if (divider.querySelector(".wave-extra")) return;

    const extra = document.createElement("span");
    extra.className = "wave-extra";
    extra.setAttribute("aria-hidden", "true");

    const foam = document.createElement("span");
    foam.className = "wave-foam";
    foam.setAttribute("aria-hidden", "true");

    divider.appendChild(extra);
    divider.appendChild(foam);
  });
}

function initNightSky() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const layer = document.createElement("div");
  layer.className = "stars-layer";
  layer.setAttribute("aria-hidden", "true");

  const a = document.createElement("div");
  a.className = "stars-a";
  const b = document.createElement("div");
  b.className = "stars-b";

  layer.appendChild(a);
  layer.appendChild(b);
  hero.appendChild(layer);

  const sun = document.createElement("div");
  sun.className = "sun-layer";
  sun.setAttribute("aria-hidden", "true");
  hero.appendChild(sun);
}

function initOceanCursor() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.__oceanCursorInit) return;
  window.__oceanCursorInit = true;

  const style = document.createElement("style");
  style.id = "ocean-cursor-style";
  style.textContent = `
    body{--mx:0px;--my:0px;}

    /* 💡 cahaya air yang mengikuti kursor (pantulan cahaya di permukaan) */
    .ocean-cursor-glow{
      position:fixed;top:0;left:0;width:560px;height:560px;
      margin:-280px 0 0 -280px;border-radius:50%;pointer-events:none;z-index:3;
      background:radial-gradient(circle,rgba(125,211,232,.14) 0%,rgba(45,181,206,.07) 42%,transparent 70%);
      mix-blend-mode:screen;opacity:0;will-change:transform;
      transition:opacity .5s ease;
    }
    [data-theme="dark"] .ocean-cursor-glow{
      background:radial-gradient(circle,rgba(221,247,255,.08) 0%,rgba(125,211,232,.05) 42%,transparent 70%);
    }

    /* 🌊 dekorasi laut tergeser halus mengikuti kursor.
       Memakai properti translate (bukan transform) agar TIDAK bentrok
       dengan animasi ombak/sheen yang sudah ada. */
    .hero::before{translate:calc(var(--mx)*2.4) calc(var(--my)*1.8);}
    .about::before,.skills::before,.skill-bars-section::before,
    .content-section::before,.timeline-section::before,
    .contact::before,.gallery-page::before{
      translate:calc(var(--mx)*1.4) calc(var(--my)*1.1);
    }
    .bubbles-layer{translate:calc(var(--mx)*.8) calc(var(--my)*.5);}
    .creatures-layer{translate:calc(var(--mx)*-.9) calc(var(--my)*-.6);}

    /* 🫧 gelembung meletus saat klik */
    .ocean-pop-layer{position:fixed;inset:0;z-index:998;overflow:hidden;pointer-events:none;}
    .ocean-pop{
      position:absolute;border-radius:50%;
      width:var(--s);height:var(--s);
      left:calc(var(--px) - var(--s)/2);top:calc(var(--py) - var(--s)/2);
      background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.8),rgba(255,255,255,.18) 52%,transparent 72%);
      border:1.5px solid rgba(255,255,255,.6);
      box-shadow:inset 2px 3px 5px rgba(255,255,255,.25);
      opacity:0;will-change:transform,opacity;
      animation:popGrow .16s cubic-bezier(.34,1.56,.64,1) var(--tin) forwards,
                popBurst .22s ease-in var(--tout) forwards;
    }
    .ocean-pop::after{
      content:"";position:absolute;top:14%;left:18%;width:30%;height:30%;
      border-radius:50%;background:rgba(255,255,255,.9);filter:blur(.6px);
    }
    .ocean-ripple{
      position:absolute;left:var(--px);top:var(--py);
      width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;
      border:2px solid rgba(255,255,255,.65);
      opacity:0;will-change:transform,opacity;
      animation:rippleOut .5s ease-out forwards;
    }
    @keyframes popGrow{from{transform:scale(.15);opacity:0;}to{transform:scale(1);opacity:1;}}
    @keyframes popBurst{from{transform:scale(1);opacity:1;}to{transform:scale(1.55);opacity:0;}}
    @keyframes rippleOut{from{transform:scale(.3);opacity:.75;}to{transform:scale(2.8);opacity:0;}}

    [data-theme="dark"] .ocean-pop{
      background:radial-gradient(circle at 32% 28%,rgba(221,247,255,.65),rgba(125,211,232,.18) 52%,transparent 72%);
      border-color:rgba(125,211,232,.55);
      box-shadow:inset 2px 3px 5px rgba(221,247,255,.2),0 0 8px rgba(125,211,232,.25);
    }
    [data-theme="dark"] .ocean-pop::after{background:rgba(221,247,255,.85);}
    [data-theme="dark"] .ocean-ripple{border-color:rgba(125,211,232,.6);}
  `;
  document.head.appendChild(style);

  const rand = (min, max) => min + Math.random() * (max - min);
  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;


  if (hasMouse) {
    const glow = document.createElement("div");
    glow.className = "ocean-cursor-glow";
    document.body.appendChild(glow);

    let tx = 0, ty = 0;
    let cx = 0, cy = 0;
    let gx = innerWidth / 2, gy = innerHeight / 2;
    let visible = false;

    window.addEventListener("mousemove", (e) => {
      tx = ((e.clientX / innerWidth) - 0.5) * 2 * 18;
      ty = ((e.clientY / innerHeight) - 0.5) * 2 * 18;
      gx = e.clientX;
      gy = e.clientY;
      if (!visible) { visible = true; glow.style.opacity = "1"; }
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      visible = false;
      glow.style.opacity = "0";
    });

    (function loop() {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      document.body.style.setProperty("--mx", cx.toFixed(2) + "px");
      document.body.style.setProperty("--my", cy.toFixed(2) + "px");
      glow.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
      requestAnimationFrame(loop);
    })();
  }


  const popLayer = document.createElement("div");
  popLayer.className = "ocean-pop-layer";
  popLayer.setAttribute("aria-hidden", "true");
  document.body.appendChild(popLayer);

  window.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;


    while (popLayer.childElementCount > 70) popLayer.firstElementChild.remove();

    const x = e.clientX;
    const y = e.clientY;


    const ripple = document.createElement("span");
    ripple.className = "ocean-ripple";
    ripple.style.setProperty("--px", x + "px");
    ripple.style.setProperty("--py", y + "px");
    popLayer.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);

    const b = document.createElement("span");
    b.className = "ocean-pop";
    const tin = 0;
    b.style.setProperty("--s", rand(28, 42).toFixed(0) + "px");
    b.style.setProperty("--px", x + "px");
    b.style.setProperty("--py", y + "px");
    b.style.setProperty("--tin", tin.toFixed(2) + "s");
    b.style.setProperty("--tout", (tin + 0.22 + rand(0, 0.25)).toFixed(2) + "s");
    popLayer.appendChild(b);
    setTimeout(() => b.remove(), 1100);
  }, { passive: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initOceanCursor);
} else {
  initOceanCursor();
}

function initOceanBubbles() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const targets = document.querySelectorAll(
    ".hero, .about, .skills, .skill-bars-section, .content-section, .timeline-section, .contact, .gallery-page, .circuit-divider",
  );
  if (!targets.length) return;

  const isMobile = window.innerWidth < 768;
  const rand = (min, max) => min + Math.random() * (max - min);

  targets.forEach((section) => {
    const isDivider = section.classList.contains("circuit-divider");
    const layer = document.createElement("div");
    layer.className = "bubbles-layer";
    layer.setAttribute("aria-hidden", "true");

    const height = section.offsetHeight || 600;
    const density = isMobile ? 300 : 200;

    const count = isDivider
      ? 2
      : Math.min(isMobile ? 5 : 9, Math.max(3, Math.round(height / density)));

    for (let i = 0; i < count; i++) {
      const bubble = document.createElement("span");
      const far = Math.random() < 0.35;
      const size = far
        ? rand(5, 11)
        : rand(9, isDivider ? 14 : isMobile ? 20 : 28);

      bubble.className = "bubble";
      bubble.style.setProperty("--s", size.toFixed(1) + "px");
      bubble.style.setProperty("--x", rand(-2, 100).toFixed(1) + "%");
      bubble.style.setProperty(
        "--o",
        (far ? rand(0.16, 0.3) : rand(0.3, 0.55)).toFixed(2),
      );
      bubble.style.setProperty(
        "--d",
        (isDivider ? rand(7, 12) : far ? rand(17, 26) : rand(10, 18)).toFixed(
          1,
        ) + "s",
      );
      bubble.style.setProperty("--dl", (-rand(0, 20)).toFixed(1) + "s");
      bubble.style.setProperty("--dx", rand(-70, 70).toFixed(0) + "px");
      bubble.style.setProperty(
        "--travel",
        (-(height + (isDivider ? 60 : 90))).toFixed(0) + "px",
      );
      if (far) bubble.style.filter = "blur(" + rand(1, 2.2).toFixed(1) + "px)";

      layer.appendChild(bubble);
    }

    section.appendChild(layer);
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll(".bubbles-layer").forEach((layer) => {
        const height = layer.parentElement.offsetHeight || 600;
        layer.querySelectorAll(".bubble").forEach((bubble) => {
          bubble.style.setProperty(
            "--travel",
            (-(height + 90)).toFixed(0) + "px",
          );
        });
      });
    }, 300);
  });
}

function initSeaCreatures() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const isMobile = window.innerWidth < 768;
  const rand = (min, max) => min + Math.random() * (max - min);

  function addFishSchool(layer, opts = {}) {
    const toLeft = opts.toLeft ?? Math.random() < 0.5;
    const school = document.createElement("div");
    school.className = "school" + (toLeft ? " to-left" : "");
    school.style.setProperty("--y", (opts.y ?? rand(15, 78)).toFixed(1) + "%");
    school.style.setProperty(
      "--dur",
      (opts.dur ?? rand(26, 42)).toFixed(1) + "s",
    );
    school.style.setProperty("--dl", (-rand(0, 40)).toFixed(1) + "s");

    const count = isMobile ? 2 : 3;
    for (let i = 0; i < count; i++) {
      const fish = document.createElement("div");
      fish.className = "creature fish" + (toLeft ? " flip" : "");
      fish.style.setProperty(
        "--w",
        rand(opts.minW ?? 24, opts.maxW ?? 42).toFixed(0) + "px",
      );
      fish.style.setProperty("--co", (opts.co ?? 0.24).toFixed(2));
      fish.style.setProperty("--bob", rand(2.8, 5).toFixed(1) + "s");
      fish.style.left = rand(0, 90).toFixed(0) + "px";
      fish.style.top = rand(-30, 30).toFixed(0) + "px";
      fish.style.animationDelay = -rand(0, 3).toFixed(1) + "s";
      school.appendChild(fish);
    }
    layer.appendChild(school);
  }

  function addWhale(layer, opts = {}) {
    const toLeft = opts.toLeft ?? Math.random() < 0.5;
    const whale = document.createElement("div");
    whale.className = "creature whale" + (toLeft ? " to-left" : "");
    whale.style.setProperty(
      "--w",
      (opts.w ?? (isMobile ? 130 : rand(170, 240))).toFixed(0) + "px",
    );
    whale.style.setProperty("--y", (opts.y ?? rand(12, 42)).toFixed(1) + "%");
    whale.style.setProperty(
      "--dur",
      (opts.dur ?? rand(55, 80)).toFixed(1) + "s",
    );
    whale.style.setProperty("--dl", (-rand(0, 60)).toFixed(1) + "s");
    whale.style.setProperty("--co", (opts.co ?? 0.15).toFixed(2));
    layer.appendChild(whale);
  }

  function addJelly(layer, section, opts = {}) {
    const height = section.offsetHeight || 600;
    const wrap = document.createElement("div");
    wrap.className = "jelly-wrap";
    wrap.style.setProperty("--x", (opts.x ?? rand(4, 92)).toFixed(1) + "%");
    wrap.style.setProperty("--travel", (-(height + 140)).toFixed(0) + "px");
    wrap.style.setProperty(
      "--dur",
      (opts.dur ?? rand(32, 48)).toFixed(1) + "s",
    );
    wrap.style.setProperty("--dl", (-rand(0, 40)).toFixed(1) + "s");

    const jelly = document.createElement("div");
    jelly.className = "creature jelly";
    jelly.style.setProperty(
      "--w",
      (opts.w ?? (isMobile ? 30 : rand(38, 56))).toFixed(0) + "px",
    );
    jelly.style.setProperty("--co", (opts.co ?? 0.2).toFixed(2));
    wrap.appendChild(jelly);
    layer.appendChild(wrap);
  }

  const zones = [
    {
      sel: ".hero",
      run: (layer) => {
        addWhale(layer, { y: rand(14, 38), co: 0.16 });
        addFishSchool(layer, { y: rand(58, 82), co: 0.3 });
      },
    },
    {
      sel: ".about",
      run: (layer) =>
        addFishSchool(layer, { co: 0.15, minW: 16, maxW: 28, y: rand(60, 84) }),
    },
    {
      sel: ".skills",
      run: (layer, section) => {
        addJelly(layer, section, { co: 0.22 });
        if (!isMobile) addJelly(layer, section);
        addFishSchool(layer, { toLeft: true, co: 0.2, y: rand(22, 45) });
      },
    },
    {
      sel: "#proyek",
      run: (layer) =>
        addFishSchool(layer, { co: 0.18, minW: 20, maxW: 34, y: rand(70, 88) }),
    },
    {
      sel: ".timeline-section",
      run: (layer, section) => {
        addJelly(layer, section, { co: 0.2 });
        if (!isMobile) addJelly(layer, section);
      },
    },
    {
      sel: ".contact",
      run: (layer) =>
        addWhale(layer, {
          y: rand(16, 36),
          w: isMobile ? 140 : rand(200, 280),
          co: 0.13,
        }),
    },
    {
      sel: ".gallery-page",
      run: (layer, section) => {
        addJelly(layer, section, { co: 0.18 });
        addFishSchool(layer, {
          toLeft: true,
          co: 0.16,
          minW: 18,
          maxW: 30,
          y: rand(18, 40),
        });
      },
    },
  ];

  zones.forEach(({ sel, run }) => {
    const section = document.querySelector(sel);
    if (!section) return;
    const layer = document.createElement("div");
    layer.className = "creatures-layer";
    layer.setAttribute("aria-hidden", "true");
    section.appendChild(layer);
    run(layer, section);
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll(".creatures-layer").forEach((layer) => {
        const height = layer.parentElement.offsetHeight || 600;
        layer.querySelectorAll(".jelly-wrap").forEach((wrap) => {
          wrap.style.setProperty(
            "--travel",
            (-(height + 140)).toFixed(0) + "px",
          );
        });
      });
    }, 300);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTimeline();
  renderCertificates();
  renderProjects();
  renderSkillBars();

  initPreloader();
  initScrollProgress();
  initBackToTop();
  initTheme();
  initParticles();
  initTypingEffect();
  initNavbar();
  initImageModalDelegation();
  initEmailModal();
  initFullGalleryPage();
  initModalCloseHandlers();
  initExtraAnimations();
  initKeyboardShortcuts();
  initWaveLayers();
  initNightSky();
  initOceanBubbles();
  initSeaCreatures();

  if (window.AOS) AOS.init({ duration: 800, once: true });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const offset = 100;
        const top =
          target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
});
