/* ============================================================
   papers.js — Research Papers library page logic
   ------------------------------------------------------------
   WHAT THIS FILE DOES (plain-English summary for reviewers):
   1. Fetches the file js/papers-data.json, which is the single
      list of every research paper published on this site.
   2. Renders one card per paper into the grid on the page.
   3. Wires up the search box and the category filter buttons
      so they only show matching cards.
   4. Adds scroll-reveal animation (same behaviour as the
      main IEP website's motion script).

   TO ADD A NEW PAPER: you do NOT need to edit any HTML.
   Just add an entry to js/papers-data.json and drop the
   files in these folders:
     - papers/<id>.html   (the readable web version)
     - downloads/<id>.md  (markdown source, optional download)
     - downloads/<id>.pdf (pdf version, optional download)
   Then run:  python3 build.py
   ============================================================ */

(function () {
  "use strict";

  // ---- 1. Load the paper list -------------------------------------------
  fetch("js/papers-data.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load papers-data.json (HTTP " + res.status + ")");
      return res.json();
    })
    .then(function (data) {
      renderCards(data.papers);
      wireFilters(data.papers);
    })
    .catch(function (err) {
      showError(err.message);
    });

  // ---- 2. Render one card per paper -------------------------------------
  function renderCards(papers) {
    var grid = document.getElementById("paper-grid");
    if (!grid) return;

    var html = "";
    papers.forEach(function (p) {
      // p.status decides the little badge colour: live / new / draft
      var badgeClass = "badge badge--" + (p.status || "live");
      html +=
        '<article class="paper-card reveal" data-id="' + esc(p.id) + '" ' +
        'data-category="' + esc(p.category) + '" ' +
        'data-search="' + esc((p.title + " " + p.summary + " " + p.keywords.join(" ")).toLowerCase()) + '">' +
          '<div class="paper-card__top">' +
            '<span class="paper-card__num">' + esc(p.number) + '</span>' +
            '<span class="' + badgeClass + '">' + esc(cap(p.status || "live")) + '</span>' +
          '</div>' +
          '<h3 class="paper-card__title">' + esc(p.title) + '</h3>' +
          '<p class="paper-card__summary">' + esc(p.summary) + '</p>' +
          '<ul class="paper-card__meta">' +
            '<li><i class="fas fa-tag"></i> ' + esc(p.category) + '</li>' +
            '<li><i class="fas fa-calendar"></i> ' + esc(p.date) + '</li>' +
            '<li><i class="fas fa-file-lines"></i> ' + esc(p.pages) + ' pages</li>' +
          '</ul>' +
          '<div class="paper-card__actions">' +
            '<a class="btn btn--primary btn--sm" href="' + esc(p.readUrl) + '">Read online <i class="fas fa-arrow-right"></i></a>' +
            '<a class="btn btn--secondary btn--sm" href="' + esc(p.pdfUrl) + '" download><i class="fas fa-file-pdf"></i> PDF</a>' +
            '<a class="btn btn--ghost btn--sm" href="' + esc(p.mdUrl) + '" download><i class="fab fa-markdown"></i> Markdown</a>' +
          '</div>' +
        '</article>';
    });
    grid.innerHTML = html;
    observeReveals(grid.querySelectorAll(".reveal"));
  }

  // ---- 3. Search + category filters --------------------------------------
  function wireFilters(papers) {
    var searchBox = document.getElementById("paper-search");
    var filterWrap = document.getElementById("category-filters");
    var countEl = document.getElementById("result-count");
    var activeCategory = "all";

    // Build category buttons from whatever categories exist in the JSON,
    // so adding a paper with a new category needs no HTML change either.
    if (filterWrap) {
      var cats = ["all"];
      papers.forEach(function (p) { if (cats.indexOf(p.category) === -1) cats.push(p.category); });
      var btnsHtml = cats.map(function (c, i) {
        return '<button class="filter-btn' + (i === 0 ? " is-active" : "") + '" data-cat="' + esc(c) + '">' +
               esc(cap(c)) + "</button>";
      }).join("");
      filterWrap.innerHTML = btnsHtml;
      filterWrap.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter-btn");
        if (!btn) return;
        activeCategory = btn.dataset.cat;
        filterWrap.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        applyFilters();
      });
    }

    if (searchBox) {
      searchBox.addEventListener("input", applyFilters);
    }

    function applyFilters() {
      var q = (searchBox && searchBox.value.trim().toLowerCase()) || "";
      var visible = 0;
      document.querySelectorAll("#paper-grid .paper-card").forEach(function (card) {
        var catOk = activeCategory === "all" || card.dataset.category === activeCategory;
        var textOk = !q || card.dataset.search.indexOf(q) !== -1;
        var show = catOk && textOk;
        card.hidden = !show;
        if (show) visible++;
      });
      if (countEl) {
        countEl.textContent = visible === 1 ? "1 paper" : visible + " papers";
      }
      var empty = document.getElementById("no-results");
      if (empty) empty.hidden = visible !== 0;
    }
  }

  // ---- 4. Scroll reveal (mirrors innovationearthprojects.org motion.js) --
  function observeReveals(els) {
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }
  // Reveal static page elements too (hero, section heads).
  observeReveals(document.querySelectorAll(".reveal:not(.paper-card .reveal)"));

  // ---- helpers -------------------------------------------------------------
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function showError(msg) {
    var grid = document.getElementById("paper-grid");
    if (grid) {
      grid.innerHTML = '<p class="load-error"><strong>Papers failed to load.</strong> ' +
        esc(msg) + " — check that js/papers-data.json exists next to this script.</p>";
    }
  }
})();
