/* ===================================================================
   Pratham Kairamkonda — Portfolio
   Stage 2: Global Interactive Chrome (Spec §4.1–4.3)
   =================================================================== */

(function () {
  "use strict";

  /* --- Refs --- */
  const cd = document.getElementById("cd");
  const cr = document.getElementById("cr");
  const pb = document.getElementById("pb");
  const nav = document.querySelector("nav");
  const hamburger = document.querySelector(".hamburger");
  const mmenu = document.querySelector(".mmenu");
  const mmenuLinks = document.querySelectorAll(".mmenu-link");

  /* ============================
     §4.1 — Custom Cursor
     ============================ */

  /* Mouse position tracking */
  let mx = -40, my = -40;   // actual mouse position (dot snaps here)
  let rx = -40, ry = -40;   // ring position (lerps toward mouse)

  /* Detect touch device — if so, skip cursor logic entirely */
  const isTouch = window.matchMedia("(hover: none)").matches;

  if (!isTouch) {
    /* Detect Chromium engines (Chrome/Edge/Brave/etc.) — only these reliably
       render SVG url() backdrop-filters; everything else keeps the frost look.
       Note: Chrome's UA also contains "Safari/537.36", so we must detect
       positively and only exclude real non-Chromium engines. */
    const isChromium = (function () {
      const ua = window.navigator.userAgent.toLowerCase();
      return /chrome|chromium|crios|edg\//.test(ua) && !/firefox|opr|vivaldi/.test(ua);
    })();

    /* Build the displacement map for the glass lens (run once at startup) */
    function initCursorLens() {
      const mapEl = document.getElementById("cr-lens-map");
      if (!mapEl || typeof document.createElement("canvas").getContext !== "function") return;

      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = (y * size + x) * 4;
          // R = normalized x, G = normalized y — 128 at center = no displacement
          img.data[i] = Math.round((x / (size - 1)) * 255);
          img.data[i + 1] = Math.round((y / (size - 1)) * 255);
          img.data[i + 2] = 128;
          img.data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      mapEl.setAttribute("href", canvas.toDataURL());

      if (isChromium) cr.classList.add("lens-on");
    }
    initCursorLens();

    /* Track mouse position */
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    /* Lerp animation loop for the lagging ring */
    function animateCursor() {
      // Dot: snap instantly (centered on 8×8)
      cd.style.left = mx - 4 + "px";
      cd.style.top = my - 4 + "px";

      // Ring: lerp toward mouse (centered on current ring size)
      const lerpFactor = 0.15;
      rx += (mx - rx) * lerpFactor;
      ry += (my - ry) * lerpFactor;

      const ringW = cr.offsetWidth;
      cr.style.left = rx - ringW / 2 + "px";
      cr.style.top = ry - ringW / 2 + "px";

      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    /* Cursor hover: grow ring on interactive elements */
    function addCursorHover(el) {
      el.addEventListener("mouseenter", () => cr.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => cr.classList.remove("cursor-hover"));
    }

    /* Apply hover to all interactive elements (now and in the future) */
    function bindCursorHovers() {
      const targets = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select, .nav-logo, .nav-cta'
      );
      targets.forEach(addCursorHover);
    }
    bindCursorHovers();

    /* Re-bind after any dynamic content loads (future stages can call this) */
    window.rebindCursorHovers = bindCursorHovers;
  }

  /* ============================
     §4.2 — Scroll Progress Bar
     ============================ */

  function updateProgressBar() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    pb.style.transform = "scaleX(" + progress + ")";
  }

  /* ============================
     §4.3 — Nav scroll state
     ============================ */

  const NAV_SCROLL_THRESHOLD = 50;

  function updateNavState() {
    if (window.scrollY > NAV_SCROLL_THRESHOLD) {
      nav.classList.add("on");
    } else {
      nav.classList.remove("on");
    }
  }

  /* Combined scroll handler */
  function onScroll() {
    updateProgressBar();
    updateNavState();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  /* Initialize on load */
  onScroll();

  /* ============================
     §4.3 — Mobile Menu (hamburger)
     ============================ */

  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
    hamburger.classList.toggle("open", menuOpen);
    mmenu.classList.toggle("open", menuOpen);
    hamburger.setAttribute("aria-expanded", menuOpen);
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }

  hamburger.addEventListener("click", toggleMenu);

  /* Close menu when a link is clicked */
  mmenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (menuOpen) toggleMenu();
    });
  });

  /* Close menu on Escape key */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuOpen) toggleMenu();
  });

  /* ============================
     Smooth scroll for nav links
     ============================ */

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ============================
     §7.1 — Projects Sticky Scroll-Jack (Desktop)
     ============================ */
  function initProjectsScroll() {
    const projWrap = document.getElementById("proj-wrap");
    const projSticky = document.getElementById("proj-sticky");
    if (!projWrap || !projSticky) return;

    const cards = projSticky.querySelectorAll(".pcard");
    const hudTitle = projSticky.querySelector(".phud-title");
    const hudDots = projSticky.querySelectorAll(".phud-dot");
    const hudCounter = projSticky.querySelector(".phud-counter");

    const projectTitles = [
      "Sanjaya",
      "VocalNote",
      "CodeLab",
      "Telugu-OCR for Chandamama Kathalu",
      "Belirix"
    ];

    function updateProjectsScroll() {
  if (window.innerWidth <= 780) {
    cards.forEach((card) => {
      card.classList.remove("active", "past", "future");
    });
    return;
  }

  const rect = projWrap.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  
  // Calculate normalized progress (0 to 1) through the pinned range
  let progress = -rect.top / travel;
  progress = Math.max(0, Math.min(progress, 1));

  // Divide progress into 5 segments (one per card)
  let activeIndex = Math.floor(progress * 5);
  activeIndex = Math.min(activeIndex, 4); // clamp to last index

  // Update classes on cards
  cards.forEach((card, idx) => {
    card.classList.remove("active", "past", "future");
    if (idx === activeIndex) {
      card.classList.add("active");
    } else if (idx < activeIndex) {
      card.classList.add("past");
    } else {
      card.classList.add("future");
    }
  });

  // Update HUD elements
  if (hudTitle) {
    hudTitle.textContent = projectTitles[activeIndex];
  }
  if (hudCounter) {
    hudCounter.textContent = "0" + (activeIndex + 1);
  }
  hudDots.forEach((dot, idx) => {
    if (idx === activeIndex) {
      dot.classList.add("on");
    } else {
      dot.classList.remove("on");
    }
  });
}

    window.addEventListener("scroll", updateProjectsScroll, { passive: true });
    window.addEventListener("resize", updateProjectsScroll, { passive: true });
    // Initialize active states
    updateProjectsScroll();
  }

  // Initialize projects scroll tracker
  initProjectsScroll();

  /* ============================
     §4.6 — Scroll Reveal System
     ============================ */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(".rv");
    
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("on");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    revealElements.forEach((el) => {
      observer.observe(el);
    });
  }

  // Initialize scroll reveal
  initScrollReveal();

  /* ============================
     Document Viewer Modal — Resume / Certificates
     Desktop: opens an in-page modal with an embedded PDF preview.
     Mobile (≤780px): bypasses the modal entirely — lets the link's
     native href/target="_blank" behavior open the PDF in a new tab,
     since in-page PDF embeds are unreliable on mobile browsers.
     ============================ */
  function initDocViewer() {
    const modal = document.getElementById("doc-modal");
    const frameContainer = document.querySelector(".doc-modal-body");
    let frame = document.getElementById("doc-modal-frame");
    const titleEl = document.getElementById("doc-modal-title");
    const downloadEl = document.getElementById("doc-modal-download");
    if (!modal || !frame || !frameContainer) return;

    const MOBILE_BREAKPOINT = 780;
    let lastFocused = null;

    function isMobile() {
      return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    // Build a brand new iframe element. Used both to open (so each open
    // starts from a completely clean element) and to fully tear down on
    // close — clearing src alone can leave WebKit's native PDF renderer
    // holding onto compositing state, which is the likely cause of any
    // lingering visual tint after closing. Removing and recreating the
    // element guarantees that state cannot survive.
    function freshFrame() {
      const next = document.createElement("iframe");
      next.id = "doc-modal-frame";
      next.className = "doc-modal-frame";
      next.title = "Document preview";
      frame.replaceWith(next);
      frame = next;
      return next;
    }

    function openModal(url, title) {
      freshFrame();
      frame.src = url;
      titleEl.textContent = title || "Document";
      downloadEl.href = url;
      downloadEl.setAttribute("download", "");

      lastFocused = document.activeElement;

      // Counter the display:none set on close — must happen before the
      // "open" class is added, and the forced reflow (offsetHeight read)
      // ensures the browser registers display:flex before the opacity
      // transition starts, otherwise the fade-in won't animate.
      modal.style.display = "flex";
      void modal.offsetHeight;

      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      // Belt-and-suspenders teardown: remove the iframe entirely (rather
      // than just clearing src) so WebKit's native PDF renderer can't hold
      // onto any compositing state, then force display:none after the
      // transition so the modal's own layer is fully torn down too.
      window.setTimeout(() => {
        if (!modal.classList.contains("open")) {
          modal.style.display = "none";
          freshFrame();
          // Double rAF forces the browser to commit a fresh paint after
          // the layer teardown above, as a final safety net against any
          // stale composited frame being left on screen.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              document.body.style.background = "var(--bg)";
            });
          });
        }
      }, 350);
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    // Close on backdrop click or any element marked data-doc-close
    modal.querySelectorAll("[data-doc-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    // Close on Escape (mirrors the mobile menu's Escape handling)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });

    // Resume buttons (nav + mobile menu)
    document.querySelectorAll("[data-doc='resume']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-doc-url");
        const title = btn.getAttribute("data-doc-title") || "Resume";
        if (isMobile()) {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          openModal(url, title);
        }
      });
    });

    // Certificate links — intercept on desktop only, let mobile fall
    // through to the link's native target="_blank" behavior untouched.
    document.querySelectorAll(".doc-viewer-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        if (isMobile()) return; // let default <a> behavior happen
        e.preventDefault();
        const url = link.getAttribute("href");
        const title = link.getAttribute("data-doc-title") || "Certificate";
        openModal(url, title);
      });
    });
  }

  initDocViewer();

  /* ============================================================
     §10.5 — Homelab Live Status Check
     Pings each service's URL from the visitor's browser using a
     no-cors fetch. This cannot read the actual HTTP status (CORS
     blocks that for cross-origin, no-cors responses), so it can
     only distinguish "the request reached *something*" (treated as
     online) from "the request failed outright" — DNS failure,
     connection refused, or our own timeout (treated as offline).
     A stale Cloudflare Tunnel registration can occasionally still
     report "online" for a few seconds after the origin actually
     drops; this is a best-effort indicator, not a guarantee.
     ============================================================ */
  function initHomelabStatus() {
    const cards = document.querySelectorAll("[data-hl-check]");
    if (!cards.length) return;

    const TIMEOUT_MS = 5000;

    function setStatus(key, state, label) {
      const el = document.querySelector('[data-hl-status="' + key + '"]');
      if (!el) return;
      el.setAttribute("data-state", state);
      const text = el.querySelector(".hl-status-text");
      if (text) text.textContent = label;
    }

    function checkService(card) {
      const url = card.getAttribute("data-hl-check");
      const statusEl = card.querySelector("[data-hl-status]");
      const key = statusEl ? statusEl.getAttribute("data-hl-status") : null;
      if (!url || !key) return;

      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

      fetch(url, {
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal
      })
        .then(() => {
          // no-cors responses are always "opaque" — we can't read
          // status codes, only that a response was returned at all.
          window.clearTimeout(timer);
          setStatus(key, "online", "Online");
        })
        .catch(() => {
          window.clearTimeout(timer);
          setStatus(key, "offline", "Offline");
        });
    }

    cards.forEach((card) => {
      const statusEl = card.querySelector("[data-hl-status]");
      if (statusEl) statusEl.setAttribute("data-state", "checking");
      checkService(card);
    });
  }

  initHomelabStatus();

})();