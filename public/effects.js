(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function safe(fn) { try { fn(); } catch (e) {} }

  /* Shared RAF scheduler for scrambles — single loop instead of per-element */
  var _scItems = [], _scRAF = null;
  function _scTickAll() {
    for (var i = _scItems.length - 1; i >= 0; i--) {
      var item = _scItems[i];
      if (item.cancelled) { _scItems.splice(i, 1); continue; }
      var elapsed = performance.now() - item.t0;
      var q = item.q, el = item.el, parts = [], done = 0;
      for (var j = 0; j < q.length; j++) {
        var c = q[j];
        if (elapsed >= c.end) { done++; parts.push(c.to); }
        else if (elapsed >= c.start) {
          if (!/^[a-zA-Z0-9]$/.test(c.to)) parts.push(c.to);
          else {
            if (!c.char || Math.random() < 0.28) {
              var pool = c.to >= "A" && c.to <= "Z" ? item.upper : item.lower;
              if (!pool.length) pool = item.all;
              c.char = pool[Math.floor(Math.random() * pool.length)];
            }
            parts.push(c.char);
          }
        } else parts.push(c.from);
      }
      var out = parts.join("");
      if (out !== item._last) { el.textContent = out; item._last = out; }
      if (done === q.length) {
        el.classList.remove("is-scrambling");
        el._scItem = null;
        _scItems.splice(i, 1);
      }
    }
    if (_scItems.length) { _scRAF = requestAnimationFrame(_scTickAll); }
    else { _scRAF = null; }
  }
  function _scStart(el, q, pools) {
    el.classList.add("is-scrambling");
    el._scItem = { el: el, q: q, t0: performance.now(), upper: pools.upper, lower: pools.lower, all: pools.all };
    _scItems.push(el._scItem);
    if (!_scRAF) { _scRAF = requestAnimationFrame(_scTickAll); }
  }

  /* =======================================================
   * 1. Custom cursor
   * ===================================================== */
  function initCursor() {
    if (reduceMotion || !finePointer) return;
    document.body.classList.add("has-custom-cursor");
    var ring = document.createElement("div"); ring.className = "cursor";
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    document.body.appendChild(ring); document.body.appendChild(dot);

    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0) translate(-50%,-50%)";
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();

    setInterval(function () {
      var p = document.createElement("div");
      p.className = "cursor-particle";
      var angle = Math.random() * Math.PI * 2;
      var dist = 5 + Math.random() * 12;
      p.style.left = mx + "px"; p.style.top = my + "px";
      p.style.setProperty("--p-dx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--p-dy", Math.sin(angle) * dist + "px");
      document.body.appendChild(p);
      p.addEventListener("animationend", function () { p.remove(); });
    }, 80);

    addEventListener("click", function () {
      ring.classList.add("is-click");
      setTimeout(function () { ring.classList.remove("is-click"); }, 200);
      var rip = document.createElement("div");
      rip.className = "cursor-click-ripple";
      rip.style.left = rx + "px"; rip.style.top = ry + "px";
      document.body.appendChild(rip);
      rip.addEventListener("animationend", function () { rip.remove(); });
    });

    var sel = "button, .btn, select";
    document.querySelectorAll(sel).forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("is-hover"); });
    });
  }

  /* =======================================================
   * 2. Magnetic buttons (CSS vars, no transform conflict)
   * ===================================================== */
  function initMagnetic() {
    if (reduceMotion || !finePointer) return;
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var s = 0.4;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - (r.left + r.width / 2)) * s) + "px");
        el.style.setProperty("--my", ((e.clientY - (r.top + r.height / 2)) * s) + "px");
      });
      el.addEventListener("mouseleave", function () {
        el.style.setProperty("--mx", "0px"); el.style.setProperty("--my", "0px");
      });
    });
  }

  /* =======================================================
   * 3. On-hover 3D reveal tilt for cards
   * ===================================================== */
  function initHoverTilt() {
    if (reduceMotion || !finePointer) return;
    document.querySelectorAll(".bento__node, .plan, .quote").forEach(function (el) {
      el.classList.add("tilt-3d");
      var maxRot = 9;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          "translateY(-4px) rotateY(" + (px * maxRot).toFixed(2) + "deg) rotateX(" + (-py * maxRot).toFixed(2) +
          "deg) translateZ(18px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* =======================================================
   * 4. Scroll reveals — reversible (hides on scroll up,
   *    shows on scroll down). Scramble runs on every
   *    enter/leave transition (forward on enter, reverse
   *    on leave) for all [data-scramble] elements.
   * ===================================================== */
  function initScrollReveals() {
    var targets = document.querySelectorAll("[data-anim], .mask-reveal, .text-reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: "0px 0px -5% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  }

  function buildTextReveals() {
    document.querySelectorAll("[data-text-reveal]").forEach(function (el) {
      if (el.dataset.built) return;
      el.dataset.built = "1"; el.classList.add("text-reveal");
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = "";
      words.forEach(function (w, i) {
        var wrap = document.createElement("span"); wrap.className = "tr-word";
        var inner = document.createElement("span");
        inner.textContent = w; inner.style.setProperty("--w-delay", (i * 55) + "ms");
        wrap.appendChild(inner); el.appendChild(wrap); el.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* =======================================================
   * 5. Text scramble — auto-applies to all text elements
   *    within <main>. Plays forward on scroll into view,
   *    reverse (scrambles away) on scroll out. Also
   *    triggers on hover for [data-scramble] elements.
   * ===================================================== */
  function initScramble() {
    if (reduceMotion) return;
    var skipParent = "button, a, .btn, nav, .site-footer, .stat-value, [data-text-reveal]";
    var textTags = "h1, h2, h3, h4, p, li, dt, dd, blockquote, .step__num";
    document.querySelectorAll("main " + textTags).forEach(function (el) {
      if (el.closest(skipParent)) return;
      if (el.hasAttribute("data-text-reveal")) return;
      if (el.children.length > 0) return;
      if (el.textContent.trim().length < 3) return;
      el.setAttribute("data-scramble", "");
    });

    var scrambleEls = document.querySelectorAll("[data-scramble]");
    scrambleEls.forEach(function (el) {
      el.classList.add("scramble");
      var original = el.textContent;
      var poolChars = (function () {
        var seen = {}, chars = "";
        for (var i = 0; i < original.length; i++) {
          var c = original[i];
          if (/^[a-zA-Z0-9]$/.test(c) && !seen[c]) { seen[c] = true; chars += c; }
        }
        return chars.length > 2 ? chars : "abcdefghijklmnopqrstuvwxyz0123456789";
      })();
      var upperPool = "", lowerPool = "";
      for (var i = 0; i < poolChars.length; i++) {
        var c = poolChars[i];
        if (c >= "A" && c <= "Z") upperPool += c;
        else lowerPool += c;
      }

      function shuffleText(txt) {
        var arr = txt.split("");
        var idx = [];
        for (var i = 0; i < arr.length; i++) {
          if (/^[a-zA-Z0-9]$/.test(arr[i])) idx.push(i);
        }
        for (var i = idx.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = arr[idx[i]]; arr[idx[i]] = arr[idx[j]]; arr[idx[j]] = tmp;
        }
        return arr.join("");
      }

      function buildAnagramQueue(staggered) {
        var shuffled = shuffleText(original);
        var q = [];
        for (var i = 0; i < original.length; i++) {
          if (/^[a-zA-Z0-9]$/.test(original[i])) {
            var s = staggered ? Math.random() * 80 : 0;
            q.push({
              from: shuffled[i], to: original[i],
              start: s,
              end: s + 250,
              char: null
            });
          } else {
            q.push({ from: original[i], to: original[i], start: 0, end: 0, char: null });
          }
        }
        return q;
      }

      function run() {
        var now = Date.now();
        if (el._scCooldown && now - el._scCooldown < 300) return;
        el._scCooldown = now;
        if (el._scItem) { el._scItem.cancelled = true; el._scItem = null; }
        var pools = { upper: upperPool, lower: lowerPool, all: poolChars };
        _scStart(el, buildAnagramQueue(true), pools);
      }

      function runReverse() {
        var now = Date.now();
        if (el._scCooldown && now - el._scCooldown < 300) return;
        el._scCooldown = now;
        if (el._scItem) { el._scItem.cancelled = true; el._scItem = null; }
        var pools = { upper: upperPool, lower: lowerPool, all: poolChars };
        _scStart(el, buildAnagramQueue(false), pools);
      }

      el.__scramble = run;
      el.__unscramble = runReverse;
    });

    // Event delegation: one listener on <main> instead of per-element
    var mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.addEventListener("mouseenter", function (e) {
        var t = e.target;
        while (t && t !== mainEl) {
          if (t.__scramble) { t.__scramble(); return; }
          t = t.parentNode;
        }
      }, true);
    }

    if ("IntersectionObserver" in window) {
      var scIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (entry.isIntersecting) { if (el.__scramble) setTimeout(el.__scramble, Math.random() * 120); }
          else { if (el.__unscramble) setTimeout(el.__unscramble, Math.random() * 120); }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -4% 0px" });
      scrambleEls.forEach(function (el) {
        scIO.observe(el);
      });
    }
  }

  /* =======================================================
   * 6. Scroll fade: sections gently fade as they leave
   *    viewport center (opacity only — no 3D transforms,
   *    avoids breaking pointer events on interactive elements).
   * ===================================================== */
  var scrollProgress = 0;
  function initScrollFade() {
    if (reduceMotion) return;
    var sections = Array.prototype.slice.call(document.querySelectorAll("main > section"));
    var ticking = false;
    function frame() {
      var vh = innerHeight;
      var max = document.documentElement.scrollHeight - vh;
      scrollProgress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      sections.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        var center = r.top + r.height / 2;
        var rel = (center - vh / 2) / vh;
        var clamped = Math.max(-1, Math.min(1, rel));
        var op = (1 - Math.min(1, Math.abs(clamped) * 0.55)).toFixed(3);
        sec.style.opacity = op;
      });
      ticking = false;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    frame();
  }

  /* =======================================================
   * 7. Hero parallax glow
   * ===================================================== */
  function initParallax() {
    if (reduceMotion || !finePointer) return;
    var glow = document.querySelector(".hero__glow");
    if (!glow) return;
    addEventListener("mousemove", function (e) {
      var x = (e.clientX / innerWidth - 0.5) * 30;
      var y = (e.clientY / innerHeight - 0.5) * 30;
      glow.style.transform = "translateX(-50%) translate(" + x + "px," + y + "px)";
    }, { passive: true });
  }

  /* =======================================================
   * 8. Three.js persistent scene — evenly-spaced threads
   *    across the full background. Sine-wave deformation,
   *    scroll-driven color/opacity, camera parallax.
   *    (Three.js permitted per PRD §2)
   * ===================================================== */
  function initThree() {
    if (reduceMotion) return;
    var canvas = document.createElement("canvas");
    canvas.id = "bg-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    var script = document.createElement("script");
    script.src = "https://unpkg.com/three@0.160.0/build/three.min.js";
    script.async = true;
    script.onload = function () { safe(function () { buildScene(canvas); }); };
    if (window.requestIdleCallback) requestIdleCallback(function () { document.head.appendChild(script); });
    else setTimeout(function () { document.head.appendChild(script); }, 200);
  }

  function buildScene(canvas) {
    var THREE = window.THREE;
    if (!THREE) return;
    var w = innerWidth, h = innerHeight;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 14);
    camera.lookAt(0, 0, 0);

    var SEGS = 64, HEIGHT = 13;

    function getFrustumWidth() {
      var fh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      return fh * camera.aspect;
    }

    function buildThreads() {
      // remove old threads
      threadData.forEach(function (t) {
        scene.remove(t.line);
        scene.remove(t.glow);
        t.geo.dispose();
        t.glow.geometry.dispose();
        t.line.material.dispose();
        t.glow.material.dispose();
      });
      threadData = [];

      var fw = getFrustumWidth();
      var spacing = 1.5;
      var count = Math.max(8, Math.round(fw / spacing));
      var startX = -(count - 1) * spacing / 2;

      for (var j = 0; j < count; j++) {
        var baseX = startX + j * spacing;
        var zDepth = (j / count - 0.5) * 2.5; // -1.25 to +1.25 (back to front)
        var positions = new Float32Array((SEGS + 1) * 3);
        var geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        var baseOp = 0.06 + (j / count) * 0.12;
        var mat = new THREE.LineBasicMaterial({
          color: new THREE.Color("#D9E8E2"),
          transparent: true,
          opacity: baseOp
        });
        var line = new THREE.Line(geo, mat);
        line.position.z = zDepth;
        scene.add(line);
        var glowMat = new THREE.LineBasicMaterial({
          color: new THREE.Color("#D9E8E2"),
          transparent: true,
          opacity: baseOp * 0.3
        });
        var glowLine = new THREE.Line(geo.clone(), glowMat);
        glowLine.position.z = zDepth - 0.08;
        scene.add(glowLine);

        threadData.push({
          line: line, glow: glowLine, positions: positions, geo: geo,
          baseX: baseX, baseOp: baseOp, zDepth: zDepth,
          phase: Math.random() * Math.PI * 2,
          freq: 0.5 + Math.random() * 0.6,
          amp: 0.04 + Math.random() * 0.08
        });
      }
    }

    var threadData = [];
    buildThreads();

    // Background particles
    var pCount = 600, pPos = new Float32Array(pCount * 3);
    for (var i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * getFrustumWidth() * 1.6;
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    var pMat = new THREE.PointsMaterial({ color: new THREE.Color("#114C5A"), size: 0.02, transparent: true, opacity: 0.35 });
    var points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    var tx = 0, ty = 0;
    addEventListener("mousemove", function (e) { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5); }, { passive: true });

    canvas.style.opacity = "1";
    var running = true;

    function updateThreads() {
      var s = Math.min(1, scrollProgress * 1.5);
      var time = Date.now() * 0.0008;
      threadData.forEach(function (t) {
        var waveAmp = t.amp * (1 + s * 3.5);
        var swayOffset = Math.sin(time * 0.35 + t.phase) * s * 0.4;
        for (var i = 0; i <= SEGS; i++) {
          var y = -HEIGHT / 2 + (i / SEGS) * HEIGHT;
          var wave = Math.sin(i * t.freq * 0.35 + t.phase + time * 0.6 + s * 2.5) * waveAmp;
          var rollOff = 1 - Math.pow(Math.abs(i / SEGS - 0.5) * 1.8, 3);
          t.positions[i * 3] = t.baseX + wave * rollOff + swayOffset;
          t.positions[i * 3 + 1] = y;
          t.positions[i * 3 + 2] = Math.cos(i * t.freq * 0.2 + t.phase + time * 0.35) * waveAmp * 0.3 * rollOff;
        }
        t.geo.attributes.position.needsUpdate = true;
        t.glow.geometry.attributes.position.needsUpdate = true;
        var op = Math.min(0.5, t.baseOp + s * 0.35);
        t.line.material.opacity = op;
        t.glow.material.opacity = op * 0.3;
        var hue = 0.42 - s * 0.06;
        var light = 0.45 + s * 0.35;
        var c = new THREE.Color().setHSL(hue, 0.5, light);
        t.line.material.color = c;
        t.glow.material.color = c;
      });
    }

    function animate() {
      if (!running) return;
      updateThreads();
      points.rotation.y += 0.0002;
      camera.position.x += (tx * 0.6 - camera.position.x) * 0.02;
      camera.position.y += (-ty * 0.6 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    addEventListener("resize", function () {
      w = innerWidth; h = innerHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      buildThreads();
    });

    addEventListener("visibilitychange", function () {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; animate(); }
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    document.documentElement.classList.add("js-anim");
    safe(buildTextReveals);       // builds per-word spans before scramble marks text
    safe(initScramble);           // auto-marks all plain text, sets up fwd + rev
    safe(initScrollReveals);      // observes [data-anim], .mask-reveal, scrambles on scroll
    safe(initCursor);
    safe(initMagnetic);
    safe(initHoverTilt);
    safe(initScrollFade);
    safe(initParallax);
    safe(initThree);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
