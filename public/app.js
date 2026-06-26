(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
   * Entry orchestration (PRD §5 / §7): total <= 500ms,
   * non-blocking, does not delay TTI. Uses native CSS only.
   * ======================================================= */
  function runEntry() {
    var reveals = document.querySelectorAll(".reveal");
    reveals.forEach(function (el) {
      el.style.setProperty("--reveal-i", el.getAttribute("data-reveal") || 0);
    });
    // Trigger on next frame so transitions apply.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        reveals.forEach(function (el) { el.classList.add("is-in"); });
      });
    });
    var loader = document.getElementById("loader");
    if (loader) {
      // Dismiss loader well within the 500ms budget.
      window.setTimeout(function () { loader.classList.add("is-done"); }, 250);
    }
  }

  /* =========================================================
   * FEATURE 1: Matrix-driven pricing + isolated currency/
   * billing switcher. No hardcoded UI values; all prices are
   * computed from a multi-dimensional matrix. Updates write
   * ONLY to the targeted price text nodes (no parent re-render).
   * ======================================================= */
  var PRICING_MATRIX = {
    // 1) base tier rate (in a neutral base unit)
    baseRates: { starter: 0, pro: 29, enterprise: 99 },
    // 2) flat 20% annual discount multiplier
    annualMultiplier: 0.8,
    // 3) regional tariff variables (FX + regional load) per currency
    regions: {
      USD: { symbol: "$", tariff: 1.0, position: "prefix" },
      EUR: { symbol: "\u20ac", tariff: 0.92, position: "prefix" },
      INR: { symbol: "\u20b9", tariff: 83.0, position: "prefix" }
    },
    tiers: ["starter", "pro", "enterprise"]
  };

  var priceState = { currency: "USD", cycle: "monthly" };

  // Cache the exact text-node targets once, so updates are O(1)
  // and strictly localized (no re-rendering of parent layout).
  var priceNodes = {};
  PRICING_MATRIX.tiers.forEach(function (tier) {
    priceNodes[tier] = {
      symbol: document.querySelector('[data-price-symbol="' + tier + '"]'),
      amount: document.querySelector('[data-price-amount="' + tier + '"]'),
      per: document.querySelector('[data-price-per="' + tier + '"]')
    };
  });

  function computePrice(tier) {
    var base = PRICING_MATRIX.baseRates[tier];
    var region = PRICING_MATRIX.regions[priceState.currency];
    var cycleMult = priceState.cycle === "annual" ? PRICING_MATRIX.annualMultiplier : 1;
    var value = base * cycleMult * region.tariff;
    // INR shown as whole numbers; USD/EUR rounded to nearest integer.
    return Math.round(value);
  }

  function formatAmount(n, currency) {
    try {
      return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US").format(n);
    } catch (e) {
      return String(n);
    }
  }

  // Scramble a single text node from its current value to a target value.
  // Mutates only nodeValue -> stays within the isolation guarantee (no reflow
  // of siblings, no parent re-render). Numeric/symbol glyphs only.
  var GLYPHS = "0123456789$\u20ac\u20b9.,";
  function scrambleNode(node, target, frames) {
    if (!node || !node.firstChild) return;
    if (reduceMotion) { node.firstChild.nodeValue = target; return; }
    if (node.__raf) cancelAnimationFrame(node.__raf);
    var steps = frames || 12, frame = 0;
    function tick() {
      frame++;
      var progress = frame / steps;
      var revealCount = Math.floor(target.length * progress);
      var out = "";
      for (var i = 0; i < target.length; i++) {
        out += i < revealCount ? target[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      node.firstChild.nodeValue = out;
      if (frame < steps) { node.__raf = requestAnimationFrame(tick); }
      else { node.firstChild.nodeValue = target; node.__raf = null; }
    }
    node.__raf = requestAnimationFrame(tick);
  }

  // Writes only to text nodes; touches no layout-affecting structure.
  // `animate` enables the scramble transition (used on user interaction).
  function renderPrices(animate) {
    var region = PRICING_MATRIX.regions[priceState.currency];
    var per = priceState.cycle === "annual" ? "/mo billed yearly" : "/mo";
    PRICING_MATRIX.tiers.forEach(function (tier) {
      var nodes = priceNodes[tier];
      if (!nodes.amount) return;
      var amount = computePrice(tier);
      var amountText = amount === 0 ? "0" : formatAmount(amount, priceState.currency);
      // nodeValue updates avoid re-creating elements -> no reflow of siblings
      if (nodes.symbol) nodes.symbol.firstChild.nodeValue = region.symbol;
      if (animate) { scrambleNode(nodes.amount, amountText, 12); }
      else { nodes.amount.firstChild.nodeValue = amountText; }
      if (nodes.per) nodes.per.firstChild.nodeValue = per;
    });
  }

  function initPricing() {
    var select = document.getElementById("currency-select");
    var toggle = document.getElementById("billing-toggle");

    if (select) {
      select.addEventListener("change", function (e) {
        priceState.currency = e.target.value;
        renderPrices(true); // isolated text-node update + scramble transition
      });
    }
    if (toggle) {
      toggle.addEventListener("click", function (e) {
        var btn = e.target.closest(".toggle__btn");
        if (!btn) return;
        priceState.cycle = btn.getAttribute("data-cycle");
        toggle.querySelectorAll(".toggle__btn").forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });
        renderPrices(true); // isolated text-node update + scramble transition
      });
    }
    renderPrices(false);
  }

  /* =========================================================
   * FEATURE 2: Bento (desktop) <-> Accordion (mobile).
   * Tracks active index at all times. On resize crossing the
   * mobile breakpoint (desktop->mobile), transfers active index
   * to the accordion and opens the matching panel smoothly.
   * Transitions written from scratch with native CSS height anim.
   * ======================================================= */
  var MOBILE_BP = 768;

  function initFeatureComponent() {
    var root = document.getElementById("feature-component");
    if (!root) return;

    var nodes = Array.prototype.slice.call(root.querySelectorAll(".bento__node"));
    var items = Array.prototype.slice.call(root.querySelectorAll(".accordion__item"));
    var state = { active: parseInt(root.getAttribute("data-active"), 10) || 0 };

    function setActiveBento(i) {
      state.active = i;
      root.setAttribute("data-active", String(i));
      nodes.forEach(function (n, idx) { n.classList.toggle("is-active", idx === i); });
    }

    // Smooth height animation written from scratch (no libraries).
    function setPanelOpen(item, open) {
      var panel = item.querySelector(".accordion__panel");
      var trigger = item.querySelector(".accordion__trigger");
      var inner = item.querySelector(".accordion__panel-inner");
      item.classList.toggle("is-open", open);
      item.classList.toggle("is-active", open);
      if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        panel.style.height = inner.offsetHeight + "px";
      } else {
        // animate from current pixel height to 0
        panel.style.height = panel.offsetHeight + "px";
        requestAnimationFrame(function () { panel.style.height = "0px"; });
      }
    }

    function openAccordion(i) {
      state.active = i;
      items.forEach(function (item, idx) { setPanelOpen(item, idx === i); });
    }

    // Desktop hover/focus tracking -> active index
    nodes.forEach(function (node, idx) {
      node.addEventListener("mouseenter", function () { setActiveBento(idx); });
      node.addEventListener("focus", function () { setActiveBento(idx); });
      node.addEventListener("click", function () { setActiveBento(idx); });
    });

    // Accordion triggers (mobile)
    items.forEach(function (item, idx) {
      var trigger = item.querySelector(".accordion__trigger");
      trigger.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        openAccordion(isOpen ? -1 : idx);
        if (!isOpen) state.active = idx;
      });
    });

    // Initialize accordion height for the pre-opened first panel.
    function syncAccordionInitial() {
      items.forEach(function (item, idx) {
        var panel = item.querySelector(".accordion__panel");
        var inner = item.querySelector(".accordion__panel-inner");
        if (item.classList.contains("is-open")) {
          panel.style.height = inner.offsetHeight + "px";
        } else {
          panel.style.height = "0px";
        }
      });
    }

    // Context-lock: detect crossing the mobile breakpoint.
    var wasMobile = window.innerWidth < MOBILE_BP;
    function onResize() {
      var isMobile = window.innerWidth < MOBILE_BP;
      if (isMobile && !wasMobile) {
        // desktop -> mobile: transfer the active bento index to accordion
        openAccordion(state.active);
      }
      if (!isMobile && wasMobile) {
        // INFERRED reverse transfer (not mandated): keep bento highlight in sync
        setActiveBento(state.active);
      }
      wasMobile = isMobile;
    }

    window.addEventListener("resize", onResize);
    setActiveBento(state.active);
    syncAccordionInitial();
  }

  /* =========================================================
   * Stats counter — values reach target when section is centered
   * in the viewport; scroll-synced with centered progress.
   * ======================================================= */
  function initStatsCounter() {
    var band = document.querySelector(".stats-band");
    if (!band) return;
    var items = [];
    band.querySelectorAll("[data-target]").forEach(function (dd) {
      var raw = dd.getAttribute("data-target");
      var num = parseFloat(raw) || 0;
      var suffix = raw.replace(/^[\d.]+/, "");
      items.push({ el: dd, target: num, suffix: suffix, startText: dd.textContent });
    });
    if (reduceMotion) {
      items.forEach(function (i) { i.el.textContent = i.target + i.suffix; });
      return;
    }
    var ticking = false;
    function update() {
      var rect = band.getBoundingClientRect();
      var vh = innerHeight;
      if (rect.top > vh || rect.bottom < 0) { ticking = false; return; }
      // progress = 1 when section center reaches viewport center
      var center = rect.top + rect.height / 2;
      var dist = center - vh / 2;
      var progress = Math.max(0, Math.min(1, 1 - dist / (vh / 2)));
      items.forEach(function (item) {
        var val = item.target * Math.min(1, progress);
        var display;
        if (item.target === Math.floor(item.target)) {
          display = Math.round(val);
        } else {
          var decimals = (item.target.toString().split(".")[1] || "").length;
          display = Number(val.toFixed(decimals)).toString();
        }
        item.el.textContent = display + item.suffix;
      });
      ticking = false;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  /* =========================================================
   * FAQ accordion — single-open, height-animated (from scratch).
   * ======================================================= */
  function initFAQ() {
    var items = document.querySelectorAll(".faq__item");
    if (!items.length) return;
    items.forEach(function (item) {
      var trigger = item.querySelector(".faq__q");
      var panel = item.querySelector(".faq__a");
      var inner = item.querySelector(".faq__a-inner");
      if (!trigger || !panel || !inner) return;

      trigger.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        // close all others
        items.forEach(function (other) {
          if (other !== item && other.classList.contains("is-open")) {
            other.classList.remove("is-open");
            var ot = other.querySelector(".faq__q");
            var op = other.querySelector(".faq__a");
            if (ot) ot.setAttribute("aria-expanded", "false");
            if (op) {
              op.style.height = op.offsetHeight + "px";
              requestAnimationFrame(function () { op.style.height = "0px"; });
            }
          }
        });
        // toggle current
        item.classList.toggle("is-open", !isOpen);
        trigger.setAttribute("aria-expanded", !isOpen ? "true" : "false");
        if (!isOpen) {
          panel.style.height = inner.offsetHeight + "px";
        } else {
          panel.style.height = panel.offsetHeight + "px";
          requestAnimationFrame(function () { panel.style.height = "0px"; });
        }
      });
    });
    // sync initial open state
    items.forEach(function (item) {
      var panel = item.querySelector(".faq__a");
      var inner = item.querySelector(".faq__a-inner");
      if (item.classList.contains("is-open") && panel && inner) {
        panel.style.height = inner.offsetHeight + "px";
      }
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initPricing();
    initFeatureComponent();
    initFAQ();
    initStatsCounter();
    runEntry();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
