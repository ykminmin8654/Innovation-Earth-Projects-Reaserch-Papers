/* ============================================================
   downloads.js — the PDF download list page (site root /downloads/)
   ------------------------------------------------------------
   WHAT THIS FILE DOES (plain-English summary for reviewers):
   1. Calls loadPapers() from catalog.js, which lists the PDFs
      that currently exist in the repo's papers/ folder. Adding a
      paper = uploading a PDF there. Nothing else.
   2. Renders ONE ROW PER PAPER into #download-rows. Each row's
      primary action is a raw link straight to the PDF file. No
      intermediate pages, no dialogs — clicking "PDF" downloads.
   3. Wires up the search box and category filter buttons so only
      matching rows stay visible.
   4. Supports deep links like /downloads/?q=privacy (pre-fills
      the search box) so other sites can link into a filtered view.

   This page never needs editing when a paper is added.
   ============================================================ */

(function () {
  "use strict";

  var esc = window.catalogUtils.esc;
  var identifier = window.catalogUtils.identifier;

  // ---- 1. Load the paper list (straight from the papers/ folder) ----------
  // Site root prefix: this page lives at <root>/downloads/, so ../ is root.
  var base = "../";

  window.loadPapers(base)
    .then(function (papers) {
      // Newest first using the ISO date string (safe lexicographic sort).
      papers.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
      renderRows(papers);
      wireFilters(papers);
    })
    .catch(function (err) { showError(err.message); });

  // ---- 2. Render one compact row per paper --------------------------------
  function renderRows(papers) {
    var list = document.getElementById("download-rows");
    if (!list) return;

    var html = "";
    papers.forEach(function (p) {
      var authors = (p.authors && p.authors.length) ? p.authors.join(", ") : "IEP Research Division";
      var ident = identifier(p.id, p.date);
      var bits = [];
      if (p.pages) bits.push(esc(String(p.pages)) + " pp.");
      if (p.sizeKb) bits.push("~" + p.sizeKb + " KB");
      var sizeHint = bits.join(" · ");
      var hay = (p.title + " " + (p.summary || "") + " " + authors + " " +
                 (p.keywords || []).join(" ") + " " + ident).toLowerCase();

      html +=
        '<li class="dl-row" data-category="' + esc(p.category) + '" ' +
        'data-search="' + esc(hay) + '">' +
          '<div class="dl-row__icon"><i class="fas fa-file-pdf"></i></div>' +
          '<div class="dl-row__main">' +
            // rel="external": cross-origin links ignore the `download`
            // attribute, so we make intent explicit and open in a new tab.
            '<a class="dl-row__title" href="' + esc(p.pdfUrl) + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>' +
            '<p class="dl-row__byline">' + esc(ident) + ' · ' + esc(authors) + '</p>' +
          '</div>' +
          '<div class="dl-row__meta">' +
            '<span>' + esc(p.category) + '</span>' +
            (p.date ? '<span>' + esc(p.date) + '</span>' : '') +
            (sizeHint ? '<span>' + sizeHint + '</span>' : '') +
          '</div>' +
          '<div class="dl-row__actions">' +
            '<a class="btn btn--primary btn--sm" href="' + esc(p.pdfUrl) + '" target="_blank" rel="noopener"><i class="fas fa-file-arrow-down"></i> PDF</a>' +
          '</div>' +
        '</li>';
    });
    list.innerHTML = html;
    // Rows are NOT given class="reveal": they must be visible immediately
    // even if IntersectionObserver never fires (this was a past bug).
  }

  // ---- 3. Search + category filters ----------------------------------------
  function wireFilters(papers) {
    var searchBox = document.getElementById("paper-search");
    var filterWrap = document.getElementById("category-filters");
    var countEl = document.getElementById("result-count");
    var activeCategory = "all";

    if (filterWrap) {
      var cats = ["all"];
      papers.forEach(function (p) { if (cats.indexOf(p.category) === -1) cats.push(p.category); });
      filterWrap.innerHTML = cats.map(function (c, i) {
        return '<button class="filter-btn' + (i === 0 ? " is-active" : "") + '" data-cat="' + esc(c) + '">' +
               esc(cap(c)) + "</button>";
      }).join("");
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
      var params = new URLSearchParams(window.location.search);
      if (params.get("q")) { searchBox.value = params.get("q"); applyFilters(); }
    }

    function applyFilters() {
      var q = (searchBox && searchBox.value.trim().toLowerCase()) || "";
      var visible = 0;
      document.querySelectorAll("#download-rows .dl-row").forEach(function (row) {
        var catOk = activeCategory === "all" || row.dataset.category === activeCategory;
        var textOk = !q || row.dataset.search.indexOf(q) !== -1;
        var show = catOk && textOk;
        row.hidden = !show;
        if (show) visible++;
      });
      if (countEl) countEl.textContent = visible === 1 ? "1 paper" : visible + " papers";
      var empty = document.getElementById("no-results");
      if (empty) empty.hidden = visible !== 0;
    }
  }

  // ---- helpers ---------------------------------------------------------------
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function showError(msg) {
    var list = document.getElementById("download-rows");
    if (list) {
      list.innerHTML = '<p class="load-error"><strong>The download list failed to load.</strong> ' +
        esc(msg) + "</p>";
    }
  }
})();
