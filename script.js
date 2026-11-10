
/* =========================================
   DAGDELEN LASHES
   NAVIGATION OG SCROLL-ANIMATIONER
========================================= */

(() => {
  "use strict";

  const header = document.querySelector(
    "[data-header]"
  );

  const menuButton = document.querySelector(
    ".menu-toggle"
  );

  const nav = document.querySelector(
    ".site-nav"
  );

  const heroStage = document.querySelector(
    "[data-hero-stage]"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const clamp = (n, min, max) =>
    Math.min(max, Math.max(min, n));

  const smoothstep = x =>
    x * x * (3 - 2 * x);

  /* ======================================
     1. MOBILMENU
  ====================================== */

  function setMenu(open) {

    if (!menuButton || !nav) return;

    menuButton.setAttribute(
      "aria-expanded",
      String(open)
    );

    menuButton.setAttribute(
      "aria-label",
      open ? "Luk menu" : "Åbn menu"
    );

    nav.classList.toggle("is-open", open);

    document.body.classList.toggle(
      "menu-open",
      open
    );
  }

  if (menuButton && nav) {

    menuButton.addEventListener("click", () => {

      const isOpen =
        menuButton.getAttribute("aria-expanded") === "true";

      setMenu(!isOpen);

    });

    nav.querySelectorAll("a").forEach(link => {

      link.addEventListener("click", () => {
        setMenu(false);
      });

    });

    document.addEventListener("click", event => {

      if (
        !nav.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        setMenu(false);
      }

    });

    document.addEventListener("keydown", event => {

      if (
        event.key === "Escape" &&
        nav.classList.contains("is-open")
      ) {

        setMenu(false);
        menuButton.focus();

      }

    });

    window.addEventListener("resize", () => {

      if (window.innerWidth > 760) {
        setMenu(false);
      }

    });

  }

  /* ======================================
     2. CINEMATISK HERO SCROLL-FADE
  ====================================== */

  let scrollFrame = 0;

  function updateScroll() {

    scrollFrame = 0;

    header?.classList.toggle(
      "is-scrolled",
      window.scrollY > 24
    );

    if (!heroStage) return;

    if (reducedMotion.matches) {

      heroStage.style.setProperty(
        "--hero-visibility",
        "1"
      );

      heroStage.style.setProperty(
        "--hero-wash",
        "0"
      );

      return;
    }

    const rect =
      heroStage.getBoundingClientRect();

    const distance = Math.max(
      1,
      heroStage.offsetHeight - window.innerHeight
    );

    const progress = clamp(
      -rect.top / distance,
      0,
      1
    );

    const fade = smoothstep(
      clamp((progress - 0.06) / 0.86, 0, 1)
    );

    heroStage.style.setProperty(
      "--hero-visibility",
      String(1 - fade)
    );

    heroStage.style.setProperty(
      "--hero-wash",
      String(fade)
    );

  }

  function requestScroll() {

    if (!scrollFrame) {

      scrollFrame = requestAnimationFrame(
        updateScroll
      );

    }

  }

  window.addEventListener(
    "scroll",
    requestScroll,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestScroll
  );

  updateScroll();

  /* ======================================
     3. ANIMATIONER NÅR MAN SCROLLER
  ====================================== */

  const revealItems = [
    ...document.querySelectorAll(".reveal")
  ];

  if (
    "IntersectionObserver" in window &&
    !reducedMotion.matches
  ) {

    document.documentElement.classList.add(
      "has-reveal"
    );

    const observer = new IntersectionObserver(
      (entries, obs) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add(
            "is-visible"
          );

          obs.unobserve(entry.target);

        });

      },
      {
        threshold: 0.04,
        rootMargin: "0px 0px -7% 0px"
      }
    );

    revealItems.forEach(item => {
      observer.observe(item);
    });

  } else {

    revealItems.forEach(item => {
      item.classList.add("is-visible");
    });

  }

  /* ======================================
     4. INDSTILLINGER FOR BEVÆGELSE
  ====================================== */

  function onMotionChange() {

    if (reducedMotion.matches) {

      document.documentElement.classList.remove(
        "has-reveal"
      );

      revealItems.forEach(item => {
        item.classList.add("is-visible");
      });

    }

    requestScroll();

  }

  reducedMotion.addEventListener?.(
    "change",
    onMotionChange
  );

  /* ======================================
     5. COPYRIGHT-ÅRSTAL
  ====================================== */

  document.querySelectorAll("[data-year]").forEach(
    element => {

      element.textContent = String(
        new Date().getFullYear()
      );

    }
  );

  /* ======================================
     6. BLØDE OVERGANGE MELLEM SIDER
  ====================================== */

  let navigating = false;

  document.addEventListener("click", event => {

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      reducedMotion.matches ||
      navigating
    ) {
      return;
    }

    const link = event.target.closest?.(
      "a[href]"
    );

    if (
      !link ||
      link.hasAttribute("download") ||
      (link.target && link.target !== "_self")
    ) {
      return;
    }

    const next = new URL(
      link.href,
      window.location.href
    );

    if (
      next.origin !== window.location.origin ||
      !next.pathname.endsWith(".html")
    ) {
      return;
    }

    if (
      next.pathname === window.location.pathname &&
      next.search === window.location.search
    ) {
      return;
    }

    event.preventDefault();

    navigating = true;

    document.body.classList.add(
      "is-page-leaving"
    );

    window.setTimeout(() => {

      window.location.assign(next.href);

    }, 220);

  });

  window.addEventListener("pageshow", () => {

    navigating = false;

    document.body.classList.remove(
      "is-page-leaving"
    );

  });

})();
