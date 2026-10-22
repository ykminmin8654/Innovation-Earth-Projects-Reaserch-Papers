#!/usr/bin/env python3
"""
build.py - turns markdown papers into the website's HTML pages,
PDF downloads, and a ZIP bundle. Deterministic and dependency-light
so any human can read it, run it, and check its output.

Usage:
    python3 build.py            # rebuild everything
    python3 build.py --clean    # remove generated files first

WHAT IT DOES, STEP BY STEP:
  1. Reads js/papers-data.json (the list of all papers).
  2. For each paper, reads papers/<id>.md  (markdown source = editable truth).
  3. Writes papers/<id>.html               (styled web page, shared css/js).
  4. Writes downloads/<id>.pdf             (print version; needs weasyprint,
                                            otherwise skipped with a warning).
  5. Copies downloads/<id>.md so it can be downloaded from the site too.
  6. Builds downloads/all-papers.zip containing every .md and .pdf.
"""
import json, os, re, shutil, sys, zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))

def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()

def write(path, text):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(text)
    print("  wrote", path)

# ---------------------------------------------------------------- small helpers
MONTHS = ["January","February","March","April","May","June",
          "July","August","September","October","November","December"]

def nice_date(iso):
    """'2026-10-22' -> 'October 22, 2026'. Anything else passes through."""
    parts = str(iso).split("-")
    if len(parts) == 3 and all(x.isdigit() for x in parts):
        return f"{MONTHS[int(parts[1]) - 1]} {int(parts[2])}, {parts[0]}"
    return str(iso)

def escape(s):
    """Minimal HTML-escaping for values dropped into the page template."""
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))

def fm_plain(s):
    """Strip markdown bold markers from a string (used for author lines)."""
    return re.sub(r"\*\*(.+?)\*\*", r"\1", s)

# ---------------------------------------------------------------- template
PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title} - IEP Preprints</title>
<meta name="description" content="{summary_meta}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
<link rel="stylesheet" href="../css/styles.css" />
</head>
<body data-page="paper-detail" data-paper-id="{id}">

<header class="nav">
  <div class="nav__inner">
    <a class="nav__brand" href="https://innovationearthprojects.org/home/">
      <span class="nav__mark"><i class="fas fa-globe"></i></span>
      <span class="nav__wordmark">Innovation Earth Projects</span>
    </a>
    <nav class="nav__links">
      <a href="../index.html">Library</a>
      <a href="https://innovationearthprojects.org/products">Tools</a>
      <a href="https://innovationearthprojects.org/about">About</a>
    </nav>
  </div>
</header>

<main>
  <article class="section section--tint paper-detail">
    <div class="container paper">
      <p class="paper-detail__crumbs"><a href="../index.html"><i class="fas fa-arrow-left"></i> Back to paper library</a></p>

      <!-- ======= PREPRINT HEADER (standard industry layout) ======= -->
      <header class="paper-header reveal">
        <span class="paper-header__series">Innovation Earth Projects &middot; Preprint</span>
        {heading}
        <p class="paper-header__authors"><i class="fas fa-user-pen"></i> {authors}</p>
        <dl class="paper-header__badges">
          <div><dt>Submitted</dt><dd>{date}</dd></div>
          <div><dt>Category</dt><dd>{category}</dd></div>
          <div><dt>Version</dt><dd>v{version}</dd></div>
          <div><dt>Pages</dt><dd>{pages}</dd></div>
        </dl>
      </header>

      <!-- Abstract box: the first "## Abstract" section of the markdown
           is moved up here automatically by build.py (see split_abstract). -->
      {abstract_box}

      <!-- Summary + metadata strip, filled at runtime by js/paper-page.js
           from js/papers-data.json (keywords, identifier, citation). -->
      <section class="pmeta-card reveal" aria-label="Paper summary and metadata">
        <h2 class="pmeta-card__title"><i class="fas fa-circle-info"></i> Summary &amp; details</h2>
        <p class="pmeta-card__text">{summary}</p>
        <div id="paper-meta" class="pmeta"><!-- rows injected by js/paper-page.js --></div>
        <div class="citation">
          <span class="citation__label">Cite as</span>
          <p id="citation-text" class="citation__text">&nbsp;</p>
          <button id="copy-citation" class="btn btn--ghost btn--sm" type="button"><i class="fas fa-quote-left"></i> Copy citation</button>
        </div>
      </section>

      <!-- ======= FULL ARTICLE (rendered from papers/<id>.md) ======= -->
      <div class="paper-body">
{body}
      </div>

      <hr class="rule" />
      <div class="paper-detail__downloads">
        <a class="btn btn--primary" href="../downloads/{id}.pdf" download><i class="fas fa-file-arrow-down"></i> Download article (PDF)</a>
        <a class="btn btn--secondary" href="../downloads/{id}.md" download><i class="fab fa-markdown"></i> Download Markdown source</a>
        <a class="btn btn--ghost" href="https://innovationearthprojects.org/home/"><i class="fas fa-globe"></i> innovationearthprojects.org</a>
      </div>
    </div>
  </article>
</main>

<footer class="footer">
  <div class="container">
    <div class="footer__brand"><i class="fas fa-globe" style="color:var(--teal)"></i> Innovation Earth Projects - Research Papers</div>
    <p class="footer__tagline">Published by the research division of Innovation Earth Projects. Free to read, download, and cite.</p>
  </div>
</footer>

<script src="../js/main.js"></script>
<script src="../js/paper-page.js"></script>
</body>
</html>
"""

def split_abstract(md_text):
    """Preprint-style layout helper.

    Splits a paper's markdown into:
      title_h1     -> the '# ...' line (rendered in the page header)
      front_matter -> any bold 'key: value' lines right after the title
                      (Type/Subject/Author blocks) - shown as metadata chips
      abstract     -> the text under the first '## Abstract' heading, moved
                      up into a highlighted box (standard preprint placement)
      rest         -> everything else, rendered as the article body below

    If a paper has no '## Abstract' section, abstract is None and the
    builder falls back to putting everything in the body (nothing breaks).
    """
    lines = md_text.splitlines()
    title_h1, i = None, 0
    for idx, ln in enumerate(lines):
        if ln.startswith("# "):
            title_h1 = ln[2:].strip(); i = idx + 1; break
    if title_h1 is None:
        return None, "", None, md_text

    # Front matter: consecutive non-empty lines of '**Key:** value' style.
    front = []
    while i < len(lines):
        s = lines[i].strip()
        if not s or s == "---":
            i += 1; continue
        if re.match(r"^\*\*.*?\*\*", s):
            front.append(s); i += 1
        else:
            break
    fm_html = ""
    if front:
        chips = []
        for f_ in front:
            txt = re.sub(r"\*\*(.+?)\*\*", r"\1", f_)  # strip bold markers
            chips.append('<span class="chip chip--fm">' + txt.strip() + "</span>")
        fm_html = '<div class="paper-header__front">' + " ".join(chips) + "</div>"

    rest_lines = lines[i:]
    full_rest = "\n".join(rest_lines)

    # Pull out the Abstract section (## Abstract ... up to next ## heading).
    m = re.search(r"^## Abstract\s*$", full_rest, re.M)
    abstract_md = None
    if m:
        start = m.end()
        nxt = re.search(r"^## ", full_rest[start:], re.M)
        end = start + (nxt.start() if nxt else len(full_rest))
        abstract_md = full_rest[start:end].strip().rstrip("-").strip()
        full_rest = full_rest[:m.start()] + full_rest[end:]

    return title_h1, fm_html, abstract_md, full_rest.strip()


def md_to_html(md_text):
    """Markdown -> HTML using the 'markdown' package if installed,
    otherwise a deliberately tiny fallback (headings, paragraphs, hr)."""
    try:
        import markdown
        return markdown.markdown(md_text, extensions=["tables"])
    except ImportError:
        out, buf = [], []
        def flush():
            if buf:
                out.append("<p>" + " ".join(buf) + "</p>"); buf.clear()
        for line in md_text.splitlines():
            s = line.strip()
            if not s: flush(); continue
            if s == "---": flush(); out.append("<hr class='rule'/>"); continue
            m = re.match(r"^(#{1,4})\s+(.*)$", s)
            if m:
                flush()
                lvl = len(m.group(1))
                cls = {1:"h1",2:"h2",3:"h3",4:"h4"}[lvl]
                out.append(f'<{cls} class="{cls}">{m.group(2)}</{cls}>')
                continue
            buf.append(s)
        flush()
        return "\n".join(out)

def make_pdf(md_text, title, out_rel_path):
    """Render a simple, readable PDF straight from the markdown source.

    Uses fpdf2 (pip install fpdf2). Headings become bold larger text,
    '- ' bullets become real bullets, numbered lists keep their numbers,
    and '**bold**' markers are stripped for plain running text.
    This is intentionally basic: it's a download copy, the styled web
    page is the primary reading format.
    """
    from fpdf import FPDF

    def latin1_safe(s):
        """Core PDF fonts only cover Latin-1. Map fancy Unicode punctuation
        to plain equivalents so any paper renders without a crash."""
        table = {
            "\u2014": "-", "\u2013": "-", "\u2018": "'", "\u2019": "'",
            "\u201c": '"', "\u201d": '"', "\u2026": "...", "\u00a0": " ",
            "\u2010": "-", "\u2011": "-", "\u2012": "-", "\u2015": "-",
            "\u00b7": "|", "\u2022": "\u00b7",  # bullet -> middle dot (latin-1 ok)
        }
        for k, v in table.items():
            s = s.replace(k, v)
        return s.encode("latin-1", "replace").decode("latin-1")

    teal = (0, 95, 95)
    ink = (11, 26, 31)
    pdf = FPDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=22)
    pdf.add_page()

    def line(s, size=11, style="", color=ink, gap_before=0, gap_after=1):
        s = latin1_safe(s)
        if gap_before: pdf.ln(gap_before)
        pdf.set_font("Helvetica", style, size)
        pdf.set_text_color(*color)
        pdf.multi_cell(0, size * 0.5, s)
        pdf.set_text_color(*ink)
        if gap_after: pdf.ln(gap_after)

    # Title block
    line("Innovation Earth Projects - Research Papers", 9, "", (106, 128, 133), 0, 1)
    line(title, 16, "B", teal, 1, 3)
    pdf.set_draw_color(0, 206, 209); pdf.set_line_width(0.6)
    y = pdf.get_y(); pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y); pdf.ln(4)

    for raw in md_text.splitlines():
        s = raw.strip()
        if not s:
            pdf.ln(1.5); continue
        clean = re.sub(r"\*\*(.+?)\*\*", r"\1", s)          # strip bold markers
        clean = re.sub(r"\*(.+?)\*", r"\1", clean)          # strip italic markers
        clean = clean.replace("`", "")                       # strip code ticks
        if clean.startswith("# "):
            line(clean[2:], 15, "B", teal, 3, 2)
        elif clean.startswith("## "):
            line(clean[3:], 13, "B", teal, 4, 1.5)
        elif clean.startswith("### ") or clean.startswith("#### "):
            line(re.sub(r"^#+ ", "", clean), 11.5, "B", ink, 3, 1)
        elif clean == "---":
            pdf.ln(2)
        elif clean.startswith("- "):
            line("\u2022  " + clean[2:], 11, "", ink, 0, 0.5)
        elif re.match(r"^\d+\.\s", clean):
            line(clean, 11, "", ink, 0, 0.5)
        else:
            line(clean, 11, "", ink, 0, 1)

    pdf.output(os.path.join(ROOT, out_rel_path))


def main():
    if "--clean" in sys.argv:
        for d in ("papers", "downloads"):
            for f in os.listdir(os.path.join(ROOT, d)):
                if f.endswith((".html", ".pdf")) or f == "all-papers.zip":
                    os.remove(os.path.join(ROOT, d, f))
        print("cleaned generated files")

    data = json.loads(read("js/papers-data.json"))
    papers = data["papers"]
    print(f"Building {len(papers)} paper(s)...")

    try:
        import fpdf  # noqa: F401  (fpdf2 - used by make_pdf below)
        have_pdf = True
    except ImportError:
        have_pdf = False
        print("  NOTE: fpdf2 not installed - PDF step will be skipped.")

    for p in papers:
        pid = p["id"]
        md_path = f"papers/{pid}.md"
        if not os.path.exists(os.path.join(ROOT, md_path)):
            print(f"  SKIP {pid}: missing source {md_path}")
            continue
        md_text = read(md_path)

        # 1. HTML page (preprint layout: header + abstract box + body)
        title_h1, fm_html, abstract_md, rest_md = split_abstract(md_text)
        # Escape the H1 text; keep markdown syntax intact for the body so it
        # still renders (**bold**, links, tables all keep working).
        heading = f"<h1 class='h1'>{escape(fm_plain(title_h1))}</h1>" if title_h1 else ""
        authors = ", ".join(p.get("authors") or ["IEP Research Division"])
        date_fmt = nice_date(p.get("date", ""))
        if abstract_md:
            abstract_box = ("<aside class='abstract-box reveal'><h2 class='abstract-box__title'>"
                            "<i class='fas fa-align-left'></i> Abstract</h2>"
                            + md_to_html(abstract_md) + "</aside>")
        else:
            abstract_box = ""
        body = md_to_html(rest_md)
        # Normalise version so the template's literal "v" prefix doesn't double it
        raw_version = str(p.get("version", "1.0")).lstrip("vV")
        page = PAGE_TEMPLATE.format(
            title=p["title"], summary_meta=p["summary"].replace('"', "&quot;"),
            id=pid, heading=heading, authors=escape(fm_plain(authors)),
            date=date_fmt, category=escape(p["category"]),
            version=escape(raw_version), pages=p.get("pages", "-"),
            abstract_box=fm_html + "\n      " + abstract_box,
            summary=p["summary"], body=body)
        write(f"papers/{pid}.html", page)

        # 2. Copy markdown into downloads/ for site visitors
        os.makedirs(os.path.join(ROOT, "downloads"), exist_ok=True)
        shutil.copyfile(os.path.join(ROOT, md_path),
                        os.path.join(ROOT, f"downloads/{pid}.md"))
        print(f"  copied downloads/{pid}.md")

        # 3. PDF (optional - needs the 'fpdf2' package)
        if have_pdf:
            make_pdf(md_text, p["title"], f"downloads/{pid}.pdf")
            print(f"  built downloads/{pid}.pdf")

    # 4. ZIP bundle of everything downloadable
    zip_path = os.path.join(ROOT, "downloads", "all-papers.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for d in ("downloads",):
            for f in sorted(os.listdir(os.path.join(ROOT, d))):
                if f.endswith((".md", ".pdf")):
                    z.write(os.path.join(ROOT, d, f), arcname=f)
    print("  bundled downloads/all-papers.zip")
    print("Done.")

if __name__ == "__main__":
    main()
