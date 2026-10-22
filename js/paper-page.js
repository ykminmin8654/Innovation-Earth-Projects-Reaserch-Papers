/* ============================================================
   paper-page.js — logic for ONE paper's detail page
   ------------------------------------------------------------
   WHAT THIS FILE DOES (plain-English summary for reviewers):
   1. Looks at the URL to work out which paper is being viewed
      (e.g. papers/paper-01-iep-case-study.html -> id
      "paper-01-iep-case-study").
   2. Finds that paper's entry in js/papers-data.json.
   3. Fills in the metadata strip on the page: authors, date,
      category, page count, keywords, version status, and an
      arXiv-style identifier (IEP-YYYY.NNNN).
   4. Builds a standard preprint citation string and wires up
      the "Copy citation" button.

   The full paper TEXT itself is already inside this HTML file
   (generated from papers/<id>.md by build.py), so this script
   only handles the summary/metadata chrome around it.
   ============================================================ */

(function () {
  "use strict";

  // The <body> tag carries data-paper-id="..." (set by build.py).
  var body = document.querySelector("body[data-paper-id]");
  if (!body) return;
  var paperId = body.getAttribute("data-paper-id");

  fetch("../js/papers-data.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load papers-data.json (HTTP " + res.status + ")");
      return res.json();
    })
    .then(function (data) {
      var paper = null;
      data.papers.forEach(function (p) { if (p.id === paperId) paper = p; });
      if (!paper) throw new Error('No entry with id "' + paperId + '" in papers-data.json');
      fillMetadata(paper);
    })
    .catch(function (err) {
      var meta = document.getElementById("paper-meta");
      if (meta) meta.innerHTML = '<p class="load-error"><strong>Paper metadata failed to load.</strong> ' +
        esc(err.message) + "</p>";
    });

  // ---- fill the metadata strip -------------------------------------------
  function fillMetadata(p) {
    var meta = document.getElementById("paper-meta");
    if (!meta) return;

    var rows = [
      { icon: "fa-user-pen", label: "Authors", value: joinLast(p.authors) },
      { icon: "fa-calendar", label: "Date published", value: niceDate(p.date) },
      { icon: "fa-tag", label: "Category", value: p.category },
      { icon: "fa-file-lines", label: "Length", value: p.pages + " pages" }
    ];
    if (p.version) rows.push({ icon: "fa-code-branch", label: "Version", value: p.version });

    var html = "";
    rows.forEach(function (r) {
      html += '<div class="pmeta__row">' +
                '<span class="pmeta__label"><i class="fas ' + r.icon + '"></i> ' + esc(r.label) + "</span>" +
                '<span class="pmeta__value">' + esc(r.value) + "</span>" +
              "</div>";
    });

    // Keywords as clickable chips that link back to a filtered library view.
    if (p.keywords && p.keywords.length) {
      html += '<div class="pmeta__row"><span class="pmeta__label"><i class="fas fa-keywords"></i> Keywords</span>' +
              '<span class="pmeta__value">';
      p.keywords.forEach(function (k) {
        html += '<a class="chip" href="../index.html?q=' + encodeURIComponent(k) + '">' + esc(k) + "</a> ";
      });
      html += "</span></div>";
    }

    // Standard preprint identifier, e.g. IEP-2026.0001
    var ident = identifier(p);
    html += '<div class="pmeta__row"><span class="pmeta__label"><i class="fas fa-fingerprint"></i> Identifier</span>' +
            '<span class="pmeta__value"><code>' + esc(ident) + "</code></span></div>";

    meta.innerHTML = html;

    // ---- citation box ------------------------------------------------------
    var citeEl = document.getElementById("citation-text");
    if (citeEl) {
      citeEl.textContent = citation(p, ident);
      wireCopy(citeEl);
    }
  }

  // ---- helpers -------------------------------------------------------------
  function citation(p, ident) {
    // "Innovation Earth Projects Research Division (2026). Title.
    //  Innovation Earth Projects Preprints. IEP-2026.0001."
    var org = "Innovation Earth Projects Research Division";
    var year = String(p.date || "").slice(0, 4) || "n.d.";
    return org + " (" + year + "). " + p.title + ". Innovation Earth Projects Preprints. " + ident + ".";
  }

  function identifier(p) {
    // Number derived from position in the list ("Paper 01" -> 0001).
    var num = (p.number || "").replace(/\D+/g, "") || "0001";
    while (num.length < 4) num = "0" + num;
    var year = String(p.date || "").slice(0, 4) || "2026";
    return "IEP-" + year + "." + num;
  }

  function joinLast(list) {
    if (!list || !list.length) return "Innovation Earth Projects Research Division";
    if (list.length === 1) return list[0];
    return list.slice(0, -1).join(", ") + ", and " + list[list.length - 1];
  }

  function niceDate(iso) {
    var parts = String(iso || "").split("-");
    if (parts.length !== 3) return iso || "";
    var months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
    return months[parseInt(parts[1], 10) - 1] + " " + parseInt(parts[2], 10) + ", " + parts[0];
  }

  function wireCopy(citeEl) {
    var btn = document.getElementById("copy-citation");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var text = citeEl.textContent;
      function done() {
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(function () {
          btn.innerHTML = '<i class="fas fa-quote-left"></i> Copy citation';
        }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      } else { fallbackCopy(text); done(); }
    });
  }

  function fallbackCopy(text) {
    // Older browsers / non-HTTPS contexts: select the text instead.
    var range = document.createRange();
    range.selectNodeContents(document.getElementById("citation-text"));
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
