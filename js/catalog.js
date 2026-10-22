/* ============================================================
   catalog.js — decides what the download list contains.
   Loaded by downloads.js and papers.js BEFORE they run.
   ------------------------------------------------------------
   THE RULE (plain English):
     A paper exists if there is a PDF file in the papers/ folder.
     That's it. To publish: drop  papers/<name>.pdf  on GitHub,
     commit, push. No JSON edits, no markdown, no build step,
     no extra files of any kind.

   HOW IT WORKS:
   1. We ask GitHub for the current contents of the papers/
      folder:  api.github.com/repos/<owner>/<repo>/contents/papers
      The owner/repo pair comes from ONE tiny settings file:
        js/site-config.json -> { "github": { "owner": "...", "repo": "..." } }
   2. Every *.pdf entry becomes one row. The download link points
      straight at the raw file in the repo: /papers/<name>.pdf
   3. Titles are made from the file name ("deep-learning.md.pdf"
      style names read naturally); dates come from GitHub's own
      last-modified timestamp. Nothing to fill in anywhere.
   4. If the API is unreachable (offline preview, rate limit), we
      fall back to the static feed.json so the page still works.

   AUDIT NOTE: this file reads nothing and writes nothing. It only
   lists files that already exist in the repository — verify the
   list yourself by opening the papers/ folder on GitHub. One row
   per PDF, always.
   ============================================================ */

(function (global) {
  "use strict";

  // ---- tiny helpers -------------------------------------------------------
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // "paper-01-iep-case-study" -> "Paper 01 Iep Case Study"
  function titleFromFilename(name) {
    return name.replace(/\.pdf$/i, "")
               .replace(/[-_]+/g, " ")
               .replace(/\s+/g, " ")
               .trim()
               .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  // arXiv-style id derived from a stable hash of the filename.
  function identifier(name, dateStr) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 9000;
    var num = String(1000 + h);
    while (num.length < 4) num = "0" + num;
    var year = String(dateStr || "").slice(0, 4) || new Date().getFullYear();
    return "IEP-" + year + "." + num;
  }

  // ---- one tiny settings file (the ONLY configuration on this site) --------
  // js/site-config.json  ->  { "github": { "owner": "<login>", "repo": "<name>" } }
  function loadConfig(base) {
    return fetch(base + "js/site-config.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("no config"); return r.json(); })
      .catch(function () { return {}; });
  }

  // ---- main entry point ----------------------------------------------------
  // base = URL prefix of the site root with trailing slash (e.g. "/")
  global.loadPapers = function (base) {
    return loadConfig(base).then(function (cfg) {
      var owner = cfg.github && cfg.github.owner;
      var repo  = cfg.github && cfg.github.repo;

      var fromGithub = (owner && repo)
        ? fetchGitHubList(owner, repo)
        : Promise.reject(new Error("site-config.json missing github.owner/repo"));

      return fromGithub.catch(function () {
        // Fallback path: static catalog (only used if GitHub API fails).
        return loadFallbackCatalog(base);
      });
    });
  };

  // Ask GitHub which PDFs live in papers/ right now.
  function fetchGitHubList(owner, repo) {
    var api = "https://api.github.com/repos/" + encodeURIComponent(owner) +
              "/" + encodeURIComponent(repo) + "/contents/papers";
    return fetch(api, {
      headers: { "Accept": "application/vnd.github+json" },
      cache: "no-store"
    })
      .then(function (r) {
        if (!r.ok) throw new Error("GitHub API HTTP " + r.status);
        return r.json();
      })
      .then(function (entries) {
        if (!Array.isArray(entries)) throw new Error("unexpected API response");
        return entries
          .filter(function (e) { return e.type === "file" && /\.pdf$/i.test(e.name); })
          .map(function (e) {
            return {
              id: e.name.replace(/\.pdf$/i, ""),
              title: titleFromFilename(e.name),
              summary: "",
              authors: [],
              category: "Research Papers",
              keywords: [],
              date: (e.last_modified || "").slice(0, 10),
              version: "1.0",
              pages: null,
              sizeKb: Math.round((e.size || 0) / 1024),
              pdfUrl: "papers/" + encodeURIComponent(e.name),
              direct: true   // row came from the folder listing itself
            };
          });
      });
  }

  // Static catalogs, used only as a fallback when the API call fails.
  function loadFallbackCatalog(base) {
    return fetch(base + "papers/feed.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("no feed"); return r.json(); })
      .then(function (data) {
        return (data.papers || []).map(function (p) {
          return {
            id: p.id || p.slug,
            title: p.title,
            summary: p.summary || p.description || "",
            authors: p.authors || [],
            category: p.category || "Research Papers",
            keywords: p.keywords || [],
            date: p.date || "",
            version: p.version || "1.0",
            pages: p.pages || null,
            pdfUrl: p.pdfUrl || ("downloads/" + (p.id || p.slug) + ".pdf"),
            readUrl: p.readUrl,
            direct: false
          };
        });
      });
  }

  global.catalogUtils = { esc: esc, identifier: identifier, titleFromFilename: titleFromFilename };
})(window);
