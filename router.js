/* ============================================================
   P5 ROUTER — perpindahan halaman tanpa reload penuh (pjax)
   Elemen <audio> dan widget musik tidak pernah dibongkar, jadi lagu
   tidak putus saat pindah halaman. Jika ada yang gagal, otomatis
   kembali ke pindah halaman biasa (location.href).
   ============================================================ */
(function () {
  "use strict";
  if (window.p5Router) return;
  if (!window.fetch || !window.DOMParser || !history.pushState) return; // browser lama: tetap multi-halaman

  const wAdd = window.addEventListener.bind(window);
  const dAdd = document.addEventListener.bind(document);
  const origRemove = EventTarget.prototype.removeEventListener;
  const nativeST = window.setTimeout;
  const nativeSI = window.setInterval;
  const nativeCI = window.clearInterval;
  const nativeRAF = window.requestAnimationFrame;

  let gen = 0; // generasi halaman; callback halaman lama dibuang
  let booting = false;
  let boot = [];
  const owned = []; // listener milik halaman (dilepas saat pindah)

  /* pemanggil milik router/music (persisten) atau milik halaman? */
  function persistentCaller() {
    const lines = (new Error().stack || "").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (/^Error/.test(l) || l.indexOf("router.js") > -1) continue;
      return /music\.js|bgfx\.js/.test(l);
    }
    return false;
  }

  function patchTarget(t) {
    const orig = t.addEventListener;
    t.addEventListener = function (type, fn, opt) {
      if (booting && ((this === document && type === "DOMContentLoaded") || (this === window && type === "load"))) {
        boot.push([this, fn]);
        return;
      }
      if (!persistentCaller()) owned.push([this, type, fn, opt]);
      return orig.call(this, type, fn, opt);
    };
  }
  patchTarget(window);
  patchTarget(document);

  window.setTimeout = function (f, d) {
    if (typeof f !== "function" || persistentCaller()) return nativeST.apply(window, arguments);
    const g = gen;
    const a = Array.prototype.slice.call(arguments, 2);
    return nativeST.call(window, function () { if (g === gen) f.apply(this, a); }, d);
  };
  window.setInterval = function (f, d) {
    if (typeof f !== "function" || persistentCaller()) return nativeSI.apply(window, arguments);
    const g = gen;
    const a = Array.prototype.slice.call(arguments, 2);
    const id = nativeSI.call(window, function () {
      if (g !== gen) { nativeCI(id); return; }
      f.apply(this, a);
    }, d);
    return id;
  };
  window.requestAnimationFrame = function (f) {
    if (typeof f !== "function" || persistentCaller()) return nativeRAF.call(window, f);
    const g = gen;
    return nativeRAF.call(window, function (t) { if (g === gen) f(t); });
  };

  /* ---------- pengambilan halaman ---------- */
  const cache = new Map();
  function fetchText(url) {
    if (!cache.has(url)) {
      const p = fetch(url, { credentials: "same-origin" }).then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      });
      p.catch(() => cache.delete(url));
      cache.set(url, p);
    }
    return cache.get(url);
  }
  function prefetch(url) {
    try { fetchText(new URL(url, location.href).href).catch(() => {}); } catch (e) {}
  }

  function abs(href, base) { return new URL(href, base).href; }
  function baseName(src) { return String(src).split("?")[0].split("/").pop(); }

  function loadScript(src) {
    return new Promise((res) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = s.onerror = () => res();
      document.head.appendChild(s);
    });
  }

  function swapHead(doc, base) {
    const have = new Map();
    document.head.querySelectorAll('link[rel="stylesheet"]').forEach((l) => have.set(l.href, l));
    const want = [];
    doc.head.querySelectorAll('link[rel="stylesheet"]').forEach((l) => want.push(abs(l.getAttribute("href"), base)));
    const waits = [];
    want.forEach((href) => {
      if (have.has(href)) return;
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      waits.push(new Promise((res) => {
        l.onload = l.onerror = () => res();
        nativeST.call(window, res, 4000);
      }));
      document.head.appendChild(l);
    });
    return Promise.all(waits).then(() => {
      have.forEach((l, href) => { if (want.indexOf(href) < 0) l.remove(); });
      if (doc.title) document.title = doc.title;
      const nd = doc.head.querySelector('meta[name="description"]');
      const od = document.head.querySelector('meta[name="description"]');
      if (nd && od) od.setAttribute("content", nd.getAttribute("content"));
    });
  }

  function teardown() {
    owned.splice(0).forEach((o) => { try { origRemove.call(o[0], o[1], o[2], o[3]); } catch (e) {} });
    gen++;
  }

  function runPageScript(code, name) {
    booting = true;
    try { (0, eval)(code + "\n//# sourceURL=p5page/" + name); }
    finally { booting = false; }
  }

  /* ---------- pindah halaman ---------- */
  let busy = null;
  async function load(url, pop) {
    const u = new URL(url, location.href);
    const html = await fetchText(u.href);
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc.body) throw new Error("no body");

    await swapHead(doc, u.href);

    // skrip eksternal di <head> yang belum ada (mis. AOS)
    for (const s of doc.head.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"), u.href);
      if (/\/(router|music|bgfx)\.js$/.test(src)) continue;
      if (!document.querySelector('script[src="' + s.getAttribute("src") + '"]') && !document.querySelector('script[src="' + src + '"]')) await loadScript(src);
    }

    teardown();
    if (!pop) history.pushState({ p5: 1 }, "", u.href);

    const keep = (n) => n.nodeType === 1 && (n.classList.contains("p5-music") || n.classList.contains("p5-page-transition-overlay") || n.classList.contains("p5-fx-keep"));
    Array.prototype.slice.call(document.body.childNodes).forEach((n) => { if (!keep(n)) n.remove(); });
    document.body.className = doc.body.className;
    document.documentElement.classList.remove("p5-arriving");

    const scripts = [];
    Array.prototype.slice.call(doc.body.childNodes).forEach((n) => {
      if (n.nodeType === 1 && n.tagName === "SCRIPT") { scripts.push(n); return; }
      if (n.nodeType === 1 && n.classList.contains("p5-music")) return;
      document.body.appendChild(document.importNode(n, true));
    });
    if (!pop) window.scrollTo(0, 0);

    boot = [];
    for (const s of scripts) {
      const src = s.getAttribute("src");
      if (!src) { if (s.textContent.trim()) runPageScript(s.textContent, "inline.js"); continue; }
      const name = baseName(src);
      if (name === "music.js" || name === "router.js" || name === "bgfx.js") continue;
      if (/^https?:/i.test(src)) {
        if (!document.querySelector('script[src="' + src + '"]')) await loadScript(src);
        continue;
      }
      runPageScript(await fetchText(abs(src, u.href)), name);
    }
    const pending = boot; boot = [];
    pending.forEach((p) => {
      try { p[1].call(p[0], new Event(p[0] === window ? "load" : "DOMContentLoaded")); } catch (e) { console.error(e); }
    });
    window.dispatchEvent(new Event("p5:pagechange"));
  }

  function go(url, opts) {
    const pop = !!(opts && opts.pop);
    const target = new URL(url, location.href).href;
    const run = (busy || Promise.resolve()).then(() => load(target, pop));
    busy = run.catch(() => {});
    return run.catch((err) => {
      console.warn("[p5Router] fallback:", err);
      location.href = target;
    });
  }

  try { history.scrollRestoration = "manual"; } catch (e) {}

  // tombol Back/Forward browser
  wAdd("popstate", () => {
    try { sessionStorage.setItem("p5_nav", "1"); } catch (e) {}
    if (typeof window.p5Navigate === "function") window.p5Navigate(location.href, true);
    else go(location.href, { pop: true });
  });

  window.p5Router = { go: go, prefetch: prefetch };
})();
