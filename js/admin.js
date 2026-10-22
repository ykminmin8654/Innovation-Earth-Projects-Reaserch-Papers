/* ============================================================
   admin.js — Research Papers Manager logic
   ------------------------------------------------------------
   WHAT THIS FILE DOES (plain-English summary for reviewers):
   1. AUTH: identical to the main site's admin
      (innovationearthprojects.org/admin/). The admin key is sent
      once to POST /gate on the Cloudflare Worker; the Worker
      returns a signed 30-minute ticket kept in sessionStorage.
      Wrong keys are rate-limited by the Worker (5 tries, then a
      10-minute lockout with a live countdown shown here).
   2. READS: lists papers from papers/feed.json in this repo
      (fetched through the same GitHub proxy so private repos work
      too, and with a cache-buster so fresh saves show instantly).
   3. WRITES: create/edit/delete commits markdown files into
      papers/data/<slug>.md in this repository THROUGH the Worker
      proxy — the exact same mechanism the products admin uses for
      products/data/*.md. Front matter uses the same field names
      (title, description, status, tags, order, updatedAt) plus
      paper-specific ones (authors, category, version, pages).
   4. After each save the file sits in the repo; the GitHub Action
      (.github/workflows/build-papers.yml) runs build.py and
      publishes the regenerated site automatically.

   SECURITY NOTES FOR AUDITORS:
   - No GitHub token ever reaches the browser. Auth is the shared
     Worker ticket only.
   - All user text written into commit messages/files is escaped
     when rendered back into HTML (see esc()).
   ============================================================ */
(function () {
  'use strict';

  // ---- endpoints (identical server to the main-site admin) --------------
  var WORKER = 'https://decap-proxy.ykminmin8654.workers.dev';
  var REPO = '/repos/ykminmin8654/Innovation-Earth-Projects-Reaserch-Papers';
  var DIR = 'papers/data';            // where admin writes .md sources
  var FEED_PATH = 'papers/feed.json'; // what the list reads (built output)
  var TICKET_KEY = 'iep-admin-ticket';// SAME storage key as main admin:
                                      // if you unlocked one, this page
                                      // reuses that session ticket.

  // ---- tiny helpers ------------------------------------------------------
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function b64encode(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  var CB = 0;
  function cb() { return '_cb=' + Date.now() + '-' + (++CB); }

  // ---- lockout handling (mirrors main admin exactly) --------------------
  var lockTimer = null;
  function fmtLeft(sec) {
    var m = Math.floor(sec / 60), r = sec % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }
  function startLockCountdown(seconds, msgEl) {
    if (lockTimer) { clearInterval(lockTimer); lockTimer = null; }
    var btn = $('keyBtn'), input = $('adminKey');
    var left = Math.max(1, Math.ceil(Number(seconds) || 600));
    btn.disabled = true; input.disabled = true; btn.textContent = 'Locked (' + fmtLeft(left) + ')';
    if (msgEl) msgEl.textContent = 'Too many failed attempts. Locked for about ' + fmtLeft(left) + '. You can try again when the countdown ends.';
    lockTimer = setInterval(function () {
      left -= 1;
      if (left <= 0) {
        clearInterval(lockTimer); lockTimer = null;
        btn.disabled = false; input.disabled = false; btn.textContent = 'Unlock';
        if (msgEl) msgEl.textContent = 'Lockout over — you can try again.';
        try { input.focus(); } catch (e) {}
      } else {
        btn.textContent = 'Locked (' + fmtLeft(left) + ')';
      }
    }, 1000);
  }

  // ---- Worker API helper (same shape as main admin's gh()) --------------
  function gh(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({
      Authorization: 'Bearer ' + (sessionStorage.getItem(TICKET_KEY) || ''),
      'Content-Type': 'application/json'
    }, opts.headers || {});
    return fetch(WORKER + '/api/v1/github' + path, opts).then(function (r) {
      return r.text().then(function (body) {
        if (!r.ok) {
          var msg = body; try { msg = (JSON.parse(body).error || JSON.parse(body).message) || body; } catch (e) {}
          var err = new Error(String(msg || ('HTTP ' + r.status))); err.status = r.status; throw err;
        }
        try { return JSON.parse(body); } catch (e) { return body; }
      });
    });
  }

  // ---- YAML serializer for the fields we support ------------------------
  function yamlStr(s) { return JSON.stringify(String(s == null ? '' : s)); }
  function buildMd(p) {
    var lines = ['---'];
    lines.push('title: ' + yamlStr(p.title));
    if (p.authors) lines.push('authors: [' + p.authors.split(',').map(function (t) { return t.trim(); }).filter(Boolean).map(yamlStr).join(', ') + ']');
    if (p.description) lines.push('description: ' + yamlStr(p.description));
    lines.push('status: ' + yamlStr(p.status || 'live'));
    if (p.category) lines.push('category: ' + yamlStr(p.category));
    lines.push('version: ' + yamlStr(p.version || '1.0'));
    lines.push('pages: ' + (Number(p.pages) || 10));
    if (p.tags) lines.push('tags: [' + p.tags.split(',').map(function (t) { return t.trim(); }).filter(Boolean).map(yamlStr).join(', ') + ']');
    lines.push('order: ' + (Number(p.order) || 999));
    lines.push('updatedAt: ' + yamlStr(new Date().toISOString().slice(0, 10)));
    lines.push('---', '', '# ' + p.title, '', p.body || '', '');
    return lines.join('\n');
  }

  // ---- gate --------------------------------------------------------------
  $('keyForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    if ($('keyBtn').disabled) return; // locked out — countdown running
    var btn = $('keyBtn'), msg = $('gateMsg');
    msg.textContent = ''; btn.disabled = true; btn.textContent = 'Checking…';
    fetch(WORKER + '/gate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: $('adminKey').value })
    }).then(function (r) { return r.json().then(function (d) { return { status: r.status, ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d.ok) {
          if (res.status === 429 || res.d.locked) {
            startLockCountdown(res.d.retry_after_seconds || 600, msg);
          } else {
            throw new Error(res.d.error || 'Server refused the key.');
          }
          return;
        }
        sessionStorage.setItem(TICKET_KEY, res.d.ticket);
        enterApp();
      })
      .catch(function (e) { msg.textContent = e.message; $('adminKey').value = ''; })
      .finally(function () { if (!lockTimer) { btn.disabled = false; btn.textContent = 'Unlock'; } });
  });

  function enterApp() {
    $('gate').classList.add('hidden');
    $('app').classList.remove('hidden');
    loadList();
  }
  $('logoutBtn').addEventListener('click', function () {
    sessionStorage.removeItem(TICKET_KEY);
    location.reload();
  });

  // ---- list ---------------------------------------------------------------
  // Reads papers/feed.json — the generated catalog the public library also
  // renders. One endpoint, one source of truth (same principle as the
  // products admin reading the Worker's /products feed).
  var editShas = {}; // slug -> git sha, filled in by loadList, used by save/delete
  function loadList() {
    setMsg('<span class="spinner"></span>Loading papers…', '');
    return gh(REPO + '/contents/' + FEED_PATH + '?' + cb())
      .then(function (info) {
        if (!info || !info.content) throw new Error('feed.json not found yet — run build.py or wait for the Actions build once after the first publish.');
        var json = decodeURIComponent(escape(atob(info.content.replace(/\n/g, ''))));
        var feed = JSON.parse(json);
        var items = (feed.papers || []).filter(function (p) { return p && p.slug && p.title; });
        items.sort(function (a, b) {
          var ao = Number(a.order ?? 999), bo = Number(b.order ?? 999);
          if (ao !== bo) return ao - bo;
          return String(a.title || '').localeCompare(String(b.title || ''));
        });
        setMsg('', '');
        render(items);
        // Fetch the data-dir listing separately so Edit/Delete know each
        // file's current git sha (GitHub requires it for updates).
        return gh(REPO + '/contents/' + DIR + '?' + cb());
      })
      .then(function (listing) {
        editShas = {};
        (Array.isArray(listing) ? listing : []).forEach(function (f) {
          var m = String(f.path || '').match(/([^/]+)\.md$/);
          if (m) editShas[m[1]] = f.sha;
        });
      })
      .catch(function (e) {
        if (e.status === 401) {
          setMsg('Session expired — please unlock again.', 'err');
          sessionStorage.removeItem(TICKET_KEY);
          setTimeout(function () { location.reload(); }, 1200);
          throw e;
        }
        setMsg('Could not load papers: ' + e.message, 'err');
      });
  }

  function statusBadge(st) {
    if (st === 'draft') return '<span class="badge soon">DRAFT</span>';
    if (st === 'beta') return '<span class="badge beta">BETA</span>';
    return '<span class="badge live">LIVE</span>';
  }

  function render(items) {
    var el = $('list');
    var liveCount = items.filter(function (p) { return (p.status || 'live') === 'live'; }).length;
    $('stats').innerHTML =
      '<div class="stat"><b>' + items.length + '</b> paper' + (items.length === 1 ? '' : 's') + '</div>' +
      '<div class="stat"><b>' + liveCount + '</b> live</div>' +
      '<div class="stat"><b>' + (items.length - liveCount) + '</b> drafts</div>';

    if (!items.length) {
      el.innerHTML = '<div class="empty" style="grid-column:1/-1"><strong>No papers yet</strong>Click “＋ New paper” to publish your first preprint to the library.</div>';
      window.__items = items;
      return;
    }
    var BASE = 'https://ykminmin8654.github.io/Innovation-Earth-Projects-Reaserch-Papers/';
    el.innerHTML = items.map(function (p, idx) {
      return '<div class="prod" style="animation-delay:' + Math.min(idx * 60, 400) + 'ms">' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<div class="badges">' + statusBadge(p.status) +
        '<span class="badge free">v' + esc(String(p.version || '1.0').replace(/^v/i, '')) + '</span>' +
        '</div>' +
        '<p class="desc">' + esc((p.description || '').slice(0, 160)) + '</p>' +
        '<p class="link"><a href="' + esc(BASE + (p.readUrl || '')) + '" target="_blank" rel="noopener">' + esc(BASE + (p.readUrl || '')) + '</a></p>' +
        '<div class="row">' +
        '<button type="button" data-edit="' + esc(p.slug) + '">Edit</button>' +
        '</div></div>';
    }).join('');
    window.__items = items;
    Array.prototype.forEach.call(el.querySelectorAll('[data-edit]'), function (b) {
      b.addEventListener('click', function () { openEditor(findSlug(b.getAttribute('data-edit'))); });
    });
  }
  function findSlug(slug) { return (window.__items || []).filter(function (p) { return p.slug === slug; })[0]; }

  // ---- editor -------------------------------------------------------------
  var editing = null;
  $('newBtn').addEventListener('click', function () { openEditor(null); });
  $('cancelBtn').addEventListener('click', function () { $('editor').close(); });

  function openEditor(p) {
    editing = p;
    $('edTitle').textContent = p ? 'Edit: ' + p.title : 'New paper';
    $('f_slug').value = p ? p.slug : '';
    $('f_slug').disabled = !!p;
    $('f_title').value = p ? (p.title || '') : '';
    $('f_authors').value = p ? ((p.authors || []).join(', ')) : 'IEP Research Division';
    $('f_description').value = p ? (p.description || '') : '';
    $('f_status').value = p ? (p.status || 'live') : 'live';
    $('f_category').value = p ? (p.category || '') : '';
    $('f_version').value = p ? String(p.version || '1.0').replace(/^v/i, '') : '1.0';
    $('f_pages').value = p ? (p.pages || 10) : 10;
    $('f_tags').value = p ? ((p.keywords || []).join(', ')) : '';
    $('f_order').value = p ? (p.order || 999) : 999;
    $('f_body').value = ''; // full body lives in the .md file; editing it
                            // happens there (kept simple + auditable)
    $('edMsg').textContent = '';
    $('deleteBtn').classList.toggle('hidden', !p);
    $('editor').showModal();
  }

  function collect() {
    return {
      slug: $('f_slug').value.trim().toLowerCase(),
      title: $('f_title').value.trim(),
      authors: $('f_authors').value.trim(),
      description: $('f_description').value.trim(),
      status: $('f_status').value,
      category: $('f_category').value.trim(),
      version: $('f_version').value.trim() || '1.0',
      pages: Number($('f_pages').value) || 10,
      tags: $('f_tags').value.trim(),
      order: Number($('f_order').value) || 999,
      body: $('f_body').value.trim()
    };
  }

  $('edForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var p = collect();
    if (!/^[a-z0-9][a-z0-9\-]*$/.test(p.slug)) { $('edMsg').textContent = 'Slug must be lowercase letters/numbers/dashes.'; return; }
    if (!p.title) { $('edMsg').textContent = 'Title is required.'; return; }
    if (!p.description) { $('edMsg').textContent = 'Summary/abstract is required.'; return; }
    var btn = $('saveBtn'); btn.disabled = true; btn.textContent = 'Publishing…';
    var md = buildMd(p);
    var exists = !!editing;

    // If editing without a new body typed in, preserve the existing article
    // text: read the current file and reuse everything below its front matter.
    var prep = Promise.resolve(md);
    if (exists && !p.body) {
      prep = gh(REPO + '/contents/' + DIR + '/' + p.slug + '.md?' + cb())
        .then(function (info) {
          if (info && typeof info.content === 'string') {
            var old = decodeURIComponent(escape(atob(info.content.replace(/\n/g, ''))));
            var m = old.match(/^---\s*\n[\s\S]*?\n---\s*\n?([\s\S]*)$/);
            p.body = m ? m[1].trim() : '';
          }
          return buildMd(p);
        });
    }

    prep.then(function (mdFinal) {
      return putWith(editShas[p.slug]);
      function putWith(sha) {
        var body = { message: (exists ? 'Update' : 'Create') + ' paper "' + p.title + '" via admin', content: b64encode(mdFinal) };
        if (sha) body.sha = sha;
        return gh(REPO + '/contents/' + DIR + '/' + p.slug + '.md', { method: 'PUT', body: JSON.stringify(body) });
      }
    })
      .then(function () {
        $('editor').close();
        setMsg('Saved "' + p.title + '". The build action will publish it to the library in about two minutes.', 'ok');
        loadList();
      })
      .catch(function (e) { $('edMsg').textContent = 'Save failed: ' + e.message; })
      .finally(function () { btn.disabled = false; btn.textContent = 'Save & publish'; });
  });

  $('deleteBtn').addEventListener('click', function () {
    if (!editing) return;
    if (!confirm('Delete "' + editing.title + '" from the library?')) return;
    var doDelete = function (sha) {
      return gh(REPO + '/contents/' + DIR + '/' + editing.slug + '.md', {
        method: 'DELETE',
        body: JSON.stringify({ message: 'Delete paper "' + editing.title + '" via admin', sha: sha })
      });
    };
    Promise.resolve(editShas[editing.slug])
      .then(function (sha) { return sha || gh(REPO + '/contents/' + DIR + '/' + editing.slug + '.md?' + cb()).then(function (i) { return i.sha; }); })
      .then(doDelete)
      .then(function () { $('editor').close(); setMsg('Deleted. Rebuild will remove it from the library within about two minutes.', 'ok'); loadList(); })
      .catch(function (e) { $('edMsg').textContent = 'Delete failed: ' + e.message; });
  });

  $('refreshBtn').addEventListener('click', loadList);

  function setMsg(html, cls) { var el = $('appMsg'); el.innerHTML = html; el.className = 'msg ' + (cls || ''); }

  // ---- auto-resume session (ticket valid ~30 min, shared with main admin) -
  if (sessionStorage.getItem(TICKET_KEY)) {
    loadList().then(function () { enterApp(); }).catch(function (e) {
      if (e && e.status === 401) {
        sessionStorage.removeItem(TICKET_KEY);
        location.reload();
      } else {
        enterApp(); // show the app; loadList() already surfaced the real error
      }
    });
  }
})();
