# Innovation Earth Projects — Research Papers

A small static website (GitHub Pages) that publishes **research papers** from the
research division of [Innovation Earth Projects](https://innovationearthprojects.org/home/).
Every paper can be read online or downloaded as PDF / Markdown. No accounts, no tracking.

## File map (what a reviewer/auditor needs to know)

```
index.html                  ← the public library page (search + category filters)
css/styles.css              ← ALL styling; numbered sections 1–10 in the header comment
js/papers-data.json         ← THE PAPER LIST (single source of truth) — edit this to publish
js/papers.js                ← renders cards from the JSON + search/filter logic (plain-English comments)
js/main.js                  ← shared scroll-reveal animation only
papers/<id>.md              ← paper SOURCE in Markdown (this is what authors write/edit)
papers/<id>.html            ← GENERATED readable web page (do not hand-edit; rebuilt by build.py)
downloads/<id>.pdf          ← GENERATED download copy
downloads/<id>.md           ← GENERATED copy of the markdown source for download
downloads/all-papers.zip    ← GENERATED bundle of every paper
build.py                    ← the generator: markdown -> html + pdf + zip (readable, ~230 lines)
```

Design tokens (teal #008080 / cyan #00CED1 / lime #32CD32, Inter + JetBrains Mono,
animated hero orbs, sticky glass nav) are replicated from innovationearthprojects.org
so this site visually links into the main IEP website.

## How to publish a new paper (4 steps, no HTML editing)

1. Write the paper as Markdown: `papers/paper-03-my-topic.md`
2. Add one entry to `js/papers-data.json` (title, summary, category, date, keywords, id).
3. Run the build: `pip install fpdf2 markdown && python3 build.py`
4. Commit + push → GitHub Pages updates automatically.

Everything generated (`.html`, `.pdf`, `.zip`) is reproducible from the `.md` sources
plus the JSON list — which means an auditor can regenerate the site and diff it
against what is deployed.

## Local preview

```
python3 -m http.server 8000   # then open http://localhost:8000
```
(A plain file:// open works too, but some browsers block fetch() of the JSON locally.)
