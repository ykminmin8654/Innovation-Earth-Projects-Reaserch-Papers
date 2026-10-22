# IEP Research Papers — automatic PDF download site

Part of [innovationearthprojects.org](https://innovationearthprojects.org/home/).
Live at: https://researchpapers.innovationearthprojects.org

## The one rule

**A paper exists if there is a PDF in `papers/`.** That's the whole system.

To publish: upload `papers/<name>.pdf` to this repo (drag-and-drop on
github.com works), commit, push. Within seconds the file appears as a
download row on `/downloads/` — no JSON edits, no markdown, no build
step, no extra files. The list is generated live by reading the GitHub
API for whatever is in the folder right now (`js/catalog.js`).

## Pages

| URL | What it is |
|---|---|
| `/` | About page — what this site is, links back to the main IEP site |
| `/downloads/` | Searchable list of raw PDF download links, built automatically from `papers/` |

## Files

```
index.html                  ← About page (static, hand-written)
downloads/index.html        ← Download-list page (static shell; rows injected by JS)
css/styles.css              ← ALL styling (numbered sections in header comment)
js/site-config.json         ← THE ONLY CONFIG: which GitHub repo to list
js/catalog.js               ← asks GitHub what PDFs are in papers/, exposes loadPapers()
js/downloads.js             ← renders one download row per PDF + search/filter
js/main.js                  ← shared scroll-reveal animation
papers/<name>.pdf           ← YOUR UPLOADS GO HERE. This IS the publication.
papers/feed.json            ← optional static fallback snapshot (see build.py)
downloads/<name>.pdf        ← optional mirror copies for stable short links
downloads/all-papers.zip    ← optional "download everything" bundle
build.py                    ← OPTIONAL helper that regenerates the mirror/zip/snapshot
CNAME                       ← custom domain for GitHub Pages
```

## How the automatic list works (for auditors)

1. A visitor opens `/downloads/`.
2. `js/catalog.js` reads `js/site-config.json` → owner/repo name.
3. It calls `https://api.github.com/repos/<owner>/<repo>/contents/papers`.
4. Every `*.pdf` entry becomes exactly one row; the link points straight
   at `papers/<name>.pdf` (the raw file in this repo). Titles come from
   the filename; dates from GitHub's last-modified timestamp.
5. If the API is unreachable, it falls back to `papers/feed.json`.

The script never writes anything and shows nothing that isn't a real
file in the repo — you can always verify the list by opening the
`papers/` folder on GitHub yourself.

## Optional niceties

`python3 build.py` mirrors every PDF into `downloads/`, rebuilds
`all-papers.zip`, and refreshes the `feed.json` fallback. Purely for
stable short links and offline resilience — run it whenever, or never.
(`build.py --clean` additionally removes stale mirrored PDFs.)

## Linking from the main website

- List page: `https://researchpapers.innovationearthprojects.org/downloads/`
- Any PDF: `.../papers/<name>.pdf` (canonical) or `.../downloads/<name>.pdf` (mirror)
- Everything at once: `.../downloads/all-papers.zip`
- Machine-readable snapshot: `.../papers/feed.json`
