/* ============================================================
   main.js — shared page behaviour (loaded on every page)
   ------------------------------------------------------------
   Does exactly two small things:
   1. Scroll-reveal: elements with class="reveal" fade/slide in
      when they enter the viewport (same behaviour as the IEP
      main site's motion script).
   2. Reduced-motion respect: if the visitor prefers reduced
      motion, everything is shown immediately.

   The library page additionally loads papers.js, which does
   the paper-card rendering and filtering. See downloads.js for
   a full plain-English explanation of that logic.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // Show everything at once — no animation.
    els.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting || e.boundingClientRect.top < 0) {
        // Show when scrolled into view — or immediately if the element is
        // ABOVE the viewport (a tall page can push a low-threshold element
        // past 12% visibility before the observer's first callback fires).
        e.target.classList.add("is-visible");
        io.unobserve(e.target); // reveal once, then stop watching
      }
    });
  }, { threshold: [0, 0.12] });

  els.forEach(function (el) { io.observe(el); });
})();
