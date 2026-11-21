/* ============================================================
   BGFX — latar 3D mengikuti mouse (semua halaman)
   Hanya menulis variabel CSS --mx / --my (-1..1) di <html>.
   Lapisan latar memakainya; konten halaman tidak bergerak.
   ============================================================ */
(function () {
  "use strict";
  if (window.__p5bgfx) return;
  window.__p5bgfx = true;

  const root = document.documentElement;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

  function loop() {
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    root.style.setProperty("--mx", cx.toFixed(4));
    root.style.setProperty("--my", cy.toFixed(4));
    raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : 0;
  }
  function kick() {
    if (!raf) raf = requestAnimationFrame(loop);
  }

  window.addEventListener("mousemove", (e) => {
    if (calm.matches) return;
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
    kick();
  }, { passive: true });
  document.addEventListener("mouseleave", () => { tx = 0; ty = 0; kick(); });

  /* ============================================================
     KURSOR KUSTOM + JEJAK BINTANG + LEDAKAN KLIK (hanya mouse)
     Elemen berkelas .p5-fx-keep dipertahankan router saat pindah halaman.
     ============================================================ */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (fine.matches && document.body) {
    const NS = "http://www.w3.org/2000/svg";
    const cur = document.createElement("div");
    cur.className = "p5-cursor p5-fx-keep";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML =
      '<svg viewBox="0 0 34 38" width="34" height="38" xmlns="' + NS + '">' +
      '<path class="c-edge" d="M3 2 L31 17 L18 20 L25 35 L17 36 L10 22 L3 31 Z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="miter" stroke-miterlimit="8"/>' +
      '<path class="c-body" d="M3 2 L31 17 L18 20 L25 35 L17 36 L10 22 L3 31 Z" fill="#d90429"/>' +
      '<path class="c-shade" d="M3 2 L10 22 L3 31 Z" fill="#0b090a"/>' +
      '<path class="c-shade" d="M18 20 L25 35 L17 36 L10 22 Z" fill="#0b090a"/>' +
      "</svg>";
    document.body.appendChild(cur);

    const cv = document.createElement("canvas");
    cv.className = "p5-fxcanvas p5-fx-keep";
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    const g = cv.getContext("2d");
    let dpr = 1;
    function fit() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
    }
    fit();
    window.addEventListener("resize", fit);

    const HOT = "a, button, [role='button'], label, select, summary, .menu-item, .p5-menu-li, .project-card, .cert-card, .p5-btn, .p5-tab-btn, .pm-card, .skill-card, .gallery-item";
    const COLORS = ["#0b090a", "#ffffff", "#ef233c", "#d90429"];
    let mx = -100, my = -100, px = -100, py = -100, lx = null, ly = null;
    let seen = false, hot = false, loopOn = false;
    const stars = [];

    function spawn(x, y, burst) {
      const col = COLORS[(Math.random() * COLORS.length) | 0];
      const a = Math.random() * Math.PI * 2;
      const sp = burst ? 2 + Math.random() * 5 : 0.3 + Math.random() * 1.2;
      stars.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp + (burst ? 0 : 0.35),
        r: burst ? 6 + Math.random() * 9 : 4 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        pts: Math.random() < 0.5 ? 4 : 5,
        life: 0,
        max: burst ? 38 + Math.random() * 20 : 26 + Math.random() * 14,
        col,
      });
      if (stars.length > 160) stars.splice(0, stars.length - 160);
    }

    function drawStar(s) {
      const k = s.life / s.max;
      const rad = s.r * (1 - k * 0.7);
      const inner = rad * (s.pts === 4 ? 0.32 : 0.45);
      g.save();
      g.translate(s.x, s.y);
      g.rotate(s.rot);
      g.globalAlpha = 1 - k * k;
      g.beginPath();
      for (let i = 0; i < s.pts * 2; i++) {
        const r = i % 2 ? inner : rad;
        const ang = (i / (s.pts * 2)) * Math.PI * 2 - Math.PI / 2;
        g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      g.closePath();
      g.fillStyle = s.col;
      g.fill();
      g.lineWidth = 1.5;
      g.lineJoin = "miter";
      g.strokeStyle = s.col === "#ffffff" ? "#0b090a" : "#ffffff";
      g.stroke();
      g.restore();
    }

    function frame() {
      // kursor mengikuti mouse dengan halus
      px += (mx - px) * 0.42;
      py += (my - py) * 0.42;
      cur.style.transform = "translate3d(" + (px - 3).toFixed(1) + "px," + (py - 2).toFixed(1) + "px,0)";
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.rot += s.vr;
        if (s.life >= s.max) stars.splice(i, 1);
        else drawStar(s);
      }
      const moving = Math.abs(mx - px) > 0.3 || Math.abs(my - py) > 0.3;
      if (moving || stars.length) requestAnimationFrame(frame);
      else loopOn = false;
    }
    function kickLoop() {
      if (!loopOn) {
        loopOn = true;
        requestAnimationFrame(frame);
      }
    }

    function setHot(v) {
      if (v === hot) return;
      hot = v;
      cur.classList.toggle("is-hot", v);
    }

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!seen) {
        seen = true;
        px = mx;
        py = my;
        document.documentElement.classList.add("p5-has-cursor");
        cur.classList.add("is-on");
      }
      setHot(!!(e.target && e.target.closest && e.target.closest(HOT)));
      if (!calm.matches) {
        if (lx === null || Math.hypot(mx - lx, my - ly) > 16) {
          spawn(mx, my, false);
          lx = mx;
          ly = my;
        }
      }
      kickLoop();
    }, { passive: true });

    window.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      cur.classList.add("is-down");
      if (calm.matches) return;
      for (let i = 0; i < 12; i++) spawn(e.clientX, e.clientY, true);
      kickLoop();
    }, true);
    window.addEventListener("mouseup", () => cur.classList.remove("is-down"), true);
    document.addEventListener("mouseleave", () => cur.classList.remove("is-on"));
    document.addEventListener("mouseenter", () => seen && cur.classList.add("is-on"));
  }
})();
