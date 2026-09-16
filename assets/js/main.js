// ---------------------------------------------------------------
// 1. Smooth, fluid "water-like" page scroll (Lenis)
// ---------------------------------------------------------------
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion && window.Lenis) {
  const lenis = new Lenis({
    duration: 1.35, // higher = slower, heavier, more "liquid" glide
    easing: (t) => 1 - Math.pow(1 - t, 4), // strong ease-out, like water settling
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.1,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ---------------------------------------------------------------
// 2. Suitable image loading: lazy-load + soft blur-up fade-in
//    Each <img data-src="..."> swaps into `src` only once it's
//    close to the viewport, then cross-fades from a blurred,
//    slightly scaled state into full clarity.
// ---------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll("img.fade-img[data-src]");

  const loadImage = (img) => {
    const src = img.getAttribute("data-src");
    if (!src) return;

    // Preload so the fade only starts once bytes are actually ready
    const preloader = new Image();
    preloader.src = src;
    preloader.onload = () => {
      img.src = src;
      // next frame, so the transition reliably triggers
      requestAnimationFrame(() => {
        img.classList.add("is-loaded");
      });
    };
    preloader.onerror = () => {
      img.src = src;
      img.classList.add("is-loaded");
    };
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    images.forEach((img) => io.observe(img));
  } else {
    // fallback: just load everything
    images.forEach(loadImage);
  }

  // ---------------------------------------------------------------
  // 3. Scroll reveal: sections drift up into place as they arrive,
  //    reinforcing the same slow, settling motion as the scroll itself.
  // ---------------------------------------------------------------
  const revealEls = document.querySelectorAll(".reveal-up, .reveal-write");
  if ("IntersectionObserver" in window && revealEls.length) {
    const revealIo = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealEls.forEach((el) => revealIo.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------------------------------------------------------------
  // 4. Scale reveal: image grows from an inset card to full-bleed
  //    as it scrolls up into place. Progress is recalculated every
  //    frame from the element's real position, so it tracks the
  //    scroll (and Lenis's easing) exactly, not just a one-shot
  //    trigger.
  // ---------------------------------------------------------------
  const scaleRevealEls = document.querySelectorAll(".scale-reveal");
  if (scaleRevealEls.length && !prefersReducedMotion) {
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    const updateScaleReveal = () => {
      const vh = window.innerHeight;
      const start = vh * 0.95; // starts growing just before it enters view
      const end = vh * 0.4; // fully grown by the time it nears the upper third

      scaleRevealEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const progress = clamp((start - rect.top) / (start - end), 0, 1);
        el.style.setProperty("--reveal-progress", progress.toFixed(4));
      });

      requestAnimationFrame(updateScaleReveal);
    };

    requestAnimationFrame(updateScaleReveal);
  }

  // ---------------------------------------------------------------
  // 5. Reservation form: front-end only. Confirms the request
  //    inline instead of actually submitting anywhere.
  // ---------------------------------------------------------------
  const reserveForm = document.getElementById("reserveForm");
  const reserveConfirmation = document.getElementById("reserveConfirmation");

  if (reserveForm && reserveConfirmation) {
    reserveForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("reserveName").value.trim();
      const date = document.getElementById("reserveDate").value;
      const time = document.getElementById("reserveTime").value;
      const guests = document.getElementById("reserveGuests").value;

      if (!name || !date || !time || !guests) {
        reserveConfirmation.textContent = "Fill in every field to request a table.";
        return;
      }

      const formattedDate = new Date(`${date}T${time}`).toLocaleString(
        undefined,
        { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }
      );

      reserveConfirmation.textContent =
        `Table for ${guests} requested, ${formattedDate}. We'll confirm with ${name} shortly.`;

      reserveForm.reset();
      document.getElementById("reserveGuests").value = 2;
    });
  }

  // ---------------------------------------------------------------
  // 6. Contact form: front-end only. Confirms the message inline
  //    instead of actually submitting anywhere.
  // ---------------------------------------------------------------
  const contactForm = document.getElementById("contactForm");
  const contactConfirmation = document.getElementById("contactConfirmation");

  if (contactForm && contactConfirmation) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("contactName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const message = document.getElementById("contactMessage").value.trim();

      if (!name || !email || !message) {
        contactConfirmation.textContent = "Fill in your name, email, and message to send.";
        return;
      }

      contactConfirmation.textContent =
        `Thanks, ${name} — we'll reply to ${email} shortly.`;

      contactForm.reset();
    });
  }
});