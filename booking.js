
/* ==========================================
   DAGDELEN LASHES
   INTERAKTIV BOOKINGDEMO
   INGEN BACKEND ELLER LAGRING
========================================== */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {

    const root = document.querySelector(
      "[data-booking-demo]"
    );

    if (!root) return;

    /* ======================================
       ELEMENTER
    ====================================== */

    const serviceButtons = [
      ...root.querySelectorAll("[data-service]")
    ];

    const calendarGrid = root.querySelector(
      "#booking-calendar-grid"
    );

    const calendarLabel = root.querySelector(
      "#booking-calendar-label"
    );

    const previousMonth = root.querySelector(
      "#booking-prev-month"
    );

    const nextMonth = root.querySelector(
      "#booking-next-month"
    );

    const timeGrid = root.querySelector(
      "#booking-time-grid"
    );

    const timeMessage = root.querySelector(
      "#booking-time-message"
    );

    const summaryService = root.querySelector(
      "#summary-service"
    );

    const summaryDate = root.querySelector(
      "#summary-date"
    );

    const summaryTime = root.querySelector(
      "#summary-time"
    );

    const summaryPrice = root.querySelector(
      "#summary-price"
    );

    const previewButton = root.querySelector(
      "#booking-preview-button"
    );

    const preview = root.querySelector(
      "#booking-preview"
    );

    const previewText = root.querySelector(
      "#booking-preview-text"
    );

    const editButton = root.querySelector(
      "#booking-edit-button"
    );

    /* ======================================
       DATOER OG DANSK TID
    ====================================== */

    const dateFormatter = new Intl.DateTimeFormat(
      "da-DK",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
      }
    );

    const monthFormatter = new Intl.DateTimeFormat(
      "da-DK",
      {
        month: "long",
        year: "numeric",
        timeZone: "UTC"
      }
    );

    const copenhagenClock = new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: "Europe/Copenhagen",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
      }
    );

    function clockParts() {
      return Object.fromEntries(
        copenhagenClock
          .formatToParts(new Date())
          .filter(part => part.type !== "literal")
          .map(part => [part.type, part.value])
      );
    }

    const pad = n => String(n).padStart(2, "0");

    const iso = (year, month, day) =>
      `${year}-${pad(month + 1)}-${pad(day)}`;

    function utcDate(key) {
      const [y, m, d] = key.split("-").map(Number);

      return new Date(
        Date.UTC(y, m - 1, d, 12)
      );
    }

    const prettyDate = key =>
      dateFormatter.format(utcDate(key));

    const timeLabel = hour =>
      `${pad(hour)}.00`;

    const priceLabel = price =>
      `${price} kr.`;

    const now = clockParts();

    const firstDay =
      `${now.year}-${now.month}-${now.day}`;

    const firstDayDate = utcDate(firstDay);

    const lastDayDate = new Date(
      firstDayDate.getTime() +
      60 * 86400000
    );

    const lastDay = iso(
      lastDayDate.getUTCFullYear(),
      lastDayDate.getUTCMonth(),
      lastDayDate.getUTCDate()
    );

    let viewYear = Number(now.year);
    let viewMonth = Number(now.month) - 1;

    let selectedService = null;
    let selectedDate = null;
    let selectedTime = null;

    /* ======================================
       OPDATER BOOKINGOVERSIGTEN
    ====================================== */

    function resetPreview() {
      preview.hidden = true;
    }

    function updateSummary() {

      summaryService.textContent =
        selectedService?.name ||
        "Ikke valgt endnu";

      summaryPrice.textContent =
        selectedService
          ? priceLabel(selectedService.price)
          : "—";

      summaryDate.textContent =
        selectedDate
          ? prettyDate(selectedDate)
          : "Ikke valgt endnu";

      summaryTime.textContent =
        selectedTime !== null
          ? `${timeLabel(selectedTime)}–${timeLabel(selectedTime + 1)}`
          : "Ikke valgt endnu";

      previewButton.disabled = !(
        selectedService &&
        selectedDate &&
        selectedTime !== null
      );

      resetPreview();
    }

    /* ======================================
       VÆLG BEHANDLING
    ====================================== */

    function chooseService(button) {

      selectedService = {
        id: button.dataset.service,
        name: button.dataset.name,
        price: Number(button.dataset.price)
      };

      serviceButtons.forEach(item => {

        const active = item === button;

        item.classList.toggle(
          "is-selected",
          active
        );

        item.setAttribute(
          "aria-pressed",
          String(active)
        );

      });

      updateSummary();
    }

    serviceButtons.forEach(button => {

      button.addEventListener("click", () => {
        chooseService(button);
      });

    });

    /* ======================================
       GENERER KALENDER
    ====================================== */

    function renderCalendar() {

      calendarLabel.textContent =
        monthFormatter.format(
          new Date(
            Date.UTC(viewYear, viewMonth, 1, 12)
          )
        );

      const currentMonthIndex =
        Number(now.year) * 12 +
        Number(now.month) - 1;

      const viewedMonthIndex =
        viewYear * 12 + viewMonth;

      previousMonth.disabled =
        viewedMonthIndex <= currentMonthIndex;

      const followingMonth = new Date(
        Date.UTC(viewYear, viewMonth + 1, 1)
      );

      nextMonth.disabled = iso(
        followingMonth.getUTCFullYear(),
        followingMonth.getUTCMonth(),
        1
      ) > lastDay;

      const fragment =
        document.createDocumentFragment();

      // Kalenderen starter på mandag.
      const offset = (
        new Date(
          Date.UTC(viewYear, viewMonth, 1)
        ).getUTCDay() + 6
      ) % 7;

      const days = new Date(
        Date.UTC(viewYear, viewMonth + 1, 0)
      ).getUTCDate();

      // Tomme felter før månedens første dato.
      for (let i = 0; i < offset; i++) {

        const blank =
          document.createElement("span");

        blank.className = "dl-cal-blank";
        blank.setAttribute("aria-hidden", "true");

        fragment.append(blank);
      }

      // Lav knap til hver dag.
      for (let day = 1; day <= days; day++) {

        const date = iso(
          viewYear,
          viewMonth,
          day
        );

        const button =
          document.createElement("button");

        button.type = "button";
        button.textContent = String(day);
        button.className = "dl-cal-day";

        // Kun i dag og de kommende 60 dage.
        button.disabled =
          date < firstDay || date > lastDay;

        button.setAttribute(
          "aria-label",
          prettyDate(date)
        );

        button.setAttribute(
          "aria-pressed",
          String(date === selectedDate)
        );

        if (date === firstDay) {
          button.setAttribute(
            "aria-current",
            "date"
          );
        }

        if (date === selectedDate) {
          button.classList.add("is-selected");
        }

        button.addEventListener("click", () => {

          selectedDate = date;
          selectedTime = null;

          renderCalendar();
          renderTimes();
          updateSummary();

        });

        fragment.append(button);
      }

      calendarGrid.replaceChildren(fragment);
    }

    /* ======================================
       SKIFT MÅNED
    ====================================== */

    function changeMonth(delta) {

      const next = new Date(
        Date.UTC(
          viewYear,
          viewMonth + delta,
          1
        )
      );

      viewYear = next.getUTCFullYear();
      viewMonth = next.getUTCMonth();

      renderCalendar();
    }

    previousMonth.addEventListener(
      "click",
      () => changeMonth(-1)
    );

    nextMonth.addEventListener(
      "click",
      () => changeMonth(1)
    );

    /* ======================================
       GENERER TIDSPUNKTER
    ====================================== */

    function renderTimes() {

      timeGrid.replaceChildren();

      if (!selectedDate) {

        timeMessage.textContent =
          "Vælg en dato i kalenderen for at se tidspunkter.";

        return;
      }

      const weekday =
        utcDate(selectedDate).getUTCDay();

      // Søndag = 0, lørdag = 6.
      const weekend =
        weekday === 0 || weekday === 6;

      // Mandag-fredag 16-20.
      // Lørdag-søndag 14-22.
      const opensAt = weekend ? 14 : 16;
      const closesAt = weekend ? 22 : 20;

      const current = clockParts();

      const isToday =
        selectedDate ===
        `${current.year}-${current.month}-${current.day}`;

      let count = 0;

      // Hver bookingdemo-tid varer 1 time.
      for (
        let hour = opensAt;
        hour + 1 <= closesAt;
        hour++
      ) {

        // Skjul tider, der allerede er begyndt i dag.
        if (
          isToday &&
          hour <= Number(current.hour)
        ) {
          continue;
        }

        const button =
          document.createElement("button");

        button.type = "button";
        button.className = "dl-slot";

        button.setAttribute(
          "aria-pressed",
          String(hour === selectedTime)
        );

        button.setAttribute(
          "aria-label",
          `${timeLabel(hour)} til ${timeLabel(hour + 1)}`
        );

        if (hour === selectedTime) {
          button.classList.add("is-selected");
        }

        const start =
          document.createElement("strong");

        start.textContent =
          timeLabel(hour);

        const end =
          document.createElement("small");

        end.textContent =
          `til ${timeLabel(hour + 1)}`;

        button.append(start, end);

        button.addEventListener("click", () => {

          selectedTime = hour;

          renderTimes();
          updateSummary();

        });

        timeGrid.append(button);
        count++;
      }

      timeMessage.textContent = count
        ? "Viste tider følger åbningstiderne – de er ikke kontrolleret for ledighed."
        : "Der er ingen resterende starttider i dag. Vælg en anden dato.";
    }

    /* ======================================
       BOOKINGDEMOENS OVERSIGT
    ====================================== */

    previewButton.addEventListener("click", () => {

      if (previewButton.disabled) return;

      previewText.textContent =
        `${selectedService.name} · ` +
        `${prettyDate(selectedDate)} · ` +
        `${timeLabel(selectedTime)}–` +
        `${timeLabel(selectedTime + 1)} · ` +
        `${priceLabel(selectedService.price)}`;

      preview.hidden = false;

      preview.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches ? "auto" : "smooth",
        block: "nearest"
      });

    });

    /* ======================================
       RET BOOKINGDEMOEN
    ====================================== */

    editButton.addEventListener("click", () => {

      resetPreview();

      root.querySelector(
        "#booking-treatment-title"
      ).scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches ? "auto" : "smooth",
        block: "start"
      });

    });

    /* ======================================
       VÆLG FRA BEHANDLINGSSIDEN
    ====================================== */

    const preselect = new URLSearchParams(
      window.location.search
    ).get("service");

    const initialButton = serviceButtons.find(
      button => button.dataset.service === preselect
    );

    if (initialButton) {
      chooseService(initialButton);
    }

    /* START KALENDEREN */

    renderCalendar();
    renderTimes();
    updateSummary();

  });

})();
