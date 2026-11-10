
/* =========================================
   DAGDELEN LASHES
   PREMIUM WOW ANIMATIONER
========================================= */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {

    const motion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const canObserve =
      "IntersectionObserver" in window;

    /* ======================================
       1. OVERSKRIFTER ORD FOR ORD
    ====================================== */

    if (canObserve && !motion.matches) {

      const headings = document.querySelectorAll(
        ".display-title, " +
        ".closing h2, " +
        ".quote-section h2, " +
        ".about-ending h2"
      );

      const wordObserver = new IntersectionObserver(
        (entries, observer) => {

          entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              "wow-words--visible"
            );

            observer.unobserve(entry.target);

          });

        },
        {
          threshold: 0.04,
          rootMargin: "0px 0px -6% 0px"
        }
      );

      headings.forEach(heading => {

        const walker = document.createTreeWalker(
          heading,
          NodeFilter.SHOW_TEXT
        );

        const textNodes = [];

        while (walker.nextNode()) {
          textNodes.push(walker.currentNode);
        }

        let wordIndex = 0;

        textNodes.forEach(textNode => {

          const text = textNode.textContent;

          if (!text.trim()) return;

          const fragment =
            document.createDocumentFragment();

          const parts =
            text.match(/\s+|[^\s]+/g) || [];

          parts.forEach(part => {

            if (/^\s+$/.test(part)) {

              fragment.appendChild(
                document.createTextNode(part)
              );

            } else {

              const span =
                document.createElement("span");

              span.className = "wow-word";
              span.textContent = part;

              span.style.setProperty(
                "--wow-delay",
                `${Math.min(wordIndex, 15) * 70}ms`
              );

              fragment.appendChild(span);

              wordIndex++;

            }

          });

          textNode.replaceWith(fragment);

        });

        if (wordIndex > 0) {

          heading.classList.add(
            "wow-words"
          );

          wordObserver.observe(heading);

        }

      });

      motion.addEventListener?.("change", () => {

        if (motion.matches) {

          headings.forEach(heading => {
            heading.classList.add(
              "wow-words--visible"
            );
          });

        }

      });

    }

    /* ======================================
       2. CINEMATIC IMAGE REVEAL
    ====================================== */

    const treatment = document.querySelector(
      ".experience__photo"
    );

    if (
      treatment &&
      canObserve &&
      !motion.matches
    ) {

      treatment.classList.add(
        "wow-photo-reveal"
      );

      const photoObserver =
        new IntersectionObserver(
          (entries, observer) => {

            entries.forEach(entry => {

              if (entry.isIntersecting) {

                entry.target.classList.add(
                  "wow-photo-reveal--visible"
                );

                observer.unobserve(
                  entry.target
                );

              }

            });

          },
          {
            threshold: 0.07,
            rootMargin: "0px 0px -6% 0px"
          }
        );

      photoObserver.observe(treatment);

      motion.addEventListener?.("change", () => {

        if (motion.matches) {

          treatment.classList.add(
            "wow-photo-reveal--visible"
          );

        }

      });

    }

    /* ======================================
       3. DISKRET PARALLAX
    ====================================== */

    if (canObserve && !motion.matches) {

      // Første klinikbillede påvirkes ikke.

      const images = document.querySelectorAll(
        ".studio-card:not(:first-child) " +
        ".image-wrap img, " +
        ".result-card .image-wrap img"
      );

      const visible = new Map();

      let frame = 0;

      const observer = new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              visible.set(
                entry.target,
                entry.target.querySelector(
                  "img.wow-parallax"
                )
              );

            } else {

              visible.delete(entry.target);

            }

          });

          requestParallax();

        },
        {
          rootMargin: "70px 0px"
        }
      );

      function updateParallax() {

        frame = 0;

        const center =
          window.innerHeight / 2;

        const range = window.matchMedia(
          "(max-width: 760px)"
        ).matches ? 13 : 10;

        visible.forEach((img, wrap) => {

          if (!img) return;

          const rect =
            wrap.getBoundingClientRect();

          const distance =
            (
              center -
              (rect.top + rect.height / 2)
            ) /
            (center + rect.height / 2);

          const offset = Math.max(
            -range,
            Math.min(
              range,
              distance * range
            )
          );

          img.style.setProperty(
            "--wow-parallax-y",
            `${offset.toFixed(1)}px`
          );

        });

      }

      function requestParallax() {

        if (!frame) {

          frame = requestAnimationFrame(
            updateParallax
          );

        }

      }

      images.forEach(img => {

        img.classList.add(
          "wow-parallax"
        );

        observer.observe(
          img.closest(".image-wrap")
        );

      });

      window.addEventListener(
        "scroll",
        requestParallax,
        { passive: true }
      );

      window.addEventListener(
        "resize",
        requestParallax
      );

      motion.addEventListener?.("change", () => {

        if (motion.matches) {

          images.forEach(img => {

            img.style.removeProperty(
              "--wow-parallax-y"
            );

          });

        }

      });

      requestParallax();

    }

    /* ======================================
       4. INTERAKTIVT KUNDEGALLERI
    ====================================== */

    const galleryImages = [
      ...document.querySelectorAll(
        ".results-grid .result-card img"
      )
    ];

    if (
      !galleryImages.length ||
      typeof HTMLDialogElement === "undefined"
    ) {
      return;
    }

    /* OPRET BILLEDVISNING */

    const dialog =
      document.createElement("dialog");

    dialog.className = "wow-lightbox";

    dialog.setAttribute(
      "aria-label",
      "Kundebilleder fra Dagdelen Lashes"
    );

    dialog.innerHTML = `
      <div class="wow-lightbox__inner">

        <button
          class="wow-lightbox__close"
          type="button"
          aria-label="Luk billedvisning"
        >×</button>

        <div class="wow-lightbox__media">
          <img
            class="wow-lightbox__image"
            alt=""
            draggable="false"
          >
        </div>

        <div class="wow-lightbox__bottom">

          <button
            class="wow-lightbox__prev"
            type="button"
            aria-label="Forrige billede"
          >←</button>

          <span
            class="wow-lightbox__counter"
            aria-live="polite"
          ></span>

          <button
            class="wow-lightbox__next"
            type="button"
            aria-label="Næste billede"
          >→</button>

        </div>

        <p class="wow-lightbox__caption"></p>

      </div>
    `;

    document.body.appendChild(dialog);

    const fullImage = dialog.querySelector(
      ".wow-lightbox__image"
    );

    const counter = dialog.querySelector(
      ".wow-lightbox__counter"
    );

    const caption = dialog.querySelector(
      ".wow-lightbox__caption"
    );

    const media = dialog.querySelector(
      ".wow-lightbox__media"
    );

    let index = 0;
    let lastTrigger = null;

    /* VIS ET BILLEDE */

    function showImage(nextIndex) {

      index = (
        nextIndex + galleryImages.length
      ) % galleryImages.length;

      const img = galleryImages[index];

      fullImage.src =
        img.currentSrc || img.src;

      fullImage.alt =
        img.alt || "Kundebillede";

      counter.textContent =
        `${index + 1} / ${galleryImages.length}`;

      caption.textContent =
        img.closest("figure")
          ?.querySelector("figcaption")
          ?.textContent.trim() ||
        "Dagdelen Lashes";

    }

    /* GØR BILLEDERNE KLIKBARE */

    galleryImages.forEach(
      (img, imageIndex) => {

        const button =
          document.createElement("button");

        button.type = "button";

        button.className =
          "wow-gallery-trigger";

        button.setAttribute(
          "aria-label",
          `Se kundebillede ${imageIndex + 1} i stor størrelse`
        );

        img.replaceWith(button);

        button.appendChild(img);

        button.addEventListener("click", () => {

          lastTrigger = button;

          showImage(imageIndex);

          dialog.showModal();

          document.body.classList.add(
            "wow-lightbox-open"
          );

        });

      }
    );

    /* LUK BILLEDVISNING */

    dialog.querySelector(
      ".wow-lightbox__close"
    ).addEventListener("click", () => {

      dialog.close();

    });

    /* FORRIGE BILLEDE */

    dialog.querySelector(
      ".wow-lightbox__prev"
    ).addEventListener("click", () => {

      showImage(index - 1);

    });

    /* NÆSTE BILLEDE */

    dialog.querySelector(
      ".wow-lightbox__next"
    ).addEventListener("click", () => {

      showImage(index + 1);

    });

    /* LUK VED KLIK PÅ BAGGRUNDEN */

    dialog.addEventListener("click", event => {

      if (event.target === dialog) {

        dialog.close();

      }

    });

    /* PILETASTER PÅ COMPUTER */

    dialog.addEventListener("keydown", event => {

      if (event.key === "ArrowLeft") {

        event.preventDefault();
        showImage(index - 1);

      }

      if (event.key === "ArrowRight") {

        event.preventDefault();
        showImage(index + 1);

      }

    });

    /* NÅR BILLEDVISNINGEN LUKKES */

    dialog.addEventListener("close", () => {

      document.body.classList.remove(
        "wow-lightbox-open"
      );

      fullImage.removeAttribute("src");

      lastTrigger?.focus({
        preventScroll: true
      });

    });

    /* ======================================
       5. SWIPE PÅ TELEFON
    ====================================== */

    let startPoint = null;

    media.addEventListener("pointerdown", event => {

      if (event.button !== 0) return;

      startPoint = {
        x: event.clientX,
        y: event.clientY,
        id: event.pointerId
      };

    });

    media.addEventListener("pointerup", event => {

      if (
        !startPoint ||
        event.pointerId !== startPoint.id
      ) {
        return;
      }

      const dx =
        event.clientX - startPoint.x;

      const dy =
        event.clientY - startPoint.y;

      startPoint = null;

      if (
        Math.abs(dx) > 50 &&
        Math.abs(dx) > Math.abs(dy) * 1.3
      ) {

        showImage(
          index + (dx < 0 ? 1 : -1)
        );

      }

    });

    media.addEventListener("pointercancel", () => {

      startPoint = null;

    });

  });

})();
