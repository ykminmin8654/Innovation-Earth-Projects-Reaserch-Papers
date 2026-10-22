# Innovation Earth Projects — Research Papers

A small static **download site** (GitHub Pages) for research papers from the
research division of [Innovation Earth Projects](https://innovationearthprojects.org/home/).
The site is exactly two pages: an **About page** (`index.html`) explaining what
the papers are and who writes them, and a separate **Downloads page**
(`downloads/`) holding a searchable list of raw PDF download links. No
accounts, no tracking, no admin panel — the main website simply links here.

## File map (what a reviewer/auditor needs to know)

```
index.html                  ← About page: what this site is, who writes the papers
downloads/              ← Searchable list of raw PDF download links (the files page)
css/styles.css              ← ALL styling; numbered sections in the header comment
js/papers-data.json         ← THE PAPER LIST (single source of truth) — edit this to publish
js/downloads.js             ← renders the download rows on downloads/ + search/filter
js/paper-page.js            ← fills the preprint header on a paper page: metadata, keywords, citation
js/main.js                  ← shared scroll-reveal animation only
papers/<id>.md              ← paper SOURCE in Markdown (this is what authors write/edit)
papers/<id>/index.html (URL: /papers/<id>/)            ← GENERATED readable web page (do not hand-edit; rebuilt by build.py)
papers/feed.json            ← GENERATED machine-readable catalog (for the main site to fetch/link)
downloads/<id>.pdf          ← GENERATED download copy
downloads/<id>.md           ← GENERATED copy of the markdown source for download
downloads/all-papers.zip    ← GENERATED bundle of every paper
build.py                    ← the generator: markdown -> html + pdf + zip + feed.json
```

Design tokens (teal #008080 / cyan #00CED1 / lime #32CD32, Inter + JetBrains Mono,
animated hero orbs, sticky glass nav) are replicated from innovationearthprojects.org
so this site visually links into the main IEP website.

## How to publish a new paper (4 steps, no HTML editing)

1. Write the paper as Markdown: `papers/paper-03-my-topic.md`
   (a `# Title`, a `## Abstract` section, then the body; optional YAML
   front matter overrides fields from step 2)
2. Add one entry to `js/papers-data.json` (title, authors, summary, category,
   date, version, pages, keywords, id).
3. Run the build: `pip install fpdf2 && python3 build.py`
4. Commit + push → GitHub Pages updates automatically.

Everything generated (`.html`, `.pdf`, `.zip`, `feed.json`) is reproducible
from the `.md` sources plus the JSON list — which means an auditor can
regenerate the site and diff it against what is deployed.

## Local preview

```
python3 -m http.server 8000   # then open http://localhost:8000
```
(A plain file:// open works too, but some browsers block fetch() of the JSON locally.)

## Linking from the main website

`papers/feed.json` is a plain, CORS-friendly catalog of everything published
here: slug, title, description, authors, category, keywords, date, version,
pages, and absolute base URLs for reading and downloading each paper. The
main site (innovationearthprojects.org) can fetch it to show a papers list
or link directly to any PDF:

```
https://researchpapers.innovationearthprojects.org/papers/feed.json
https://researchpapers.innovationearthprojects.org/downloads/<id>.pdf
```

There is deliberately NO publishing/admin surface on this site. Papers are
added only through the repo (edit files → run build.py → push), so every
change has a git history an auditor can follow: `git log -- js/papers-data.json papers/`.

