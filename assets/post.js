/**
 * assets/post.js
 * Individual post viewer.
 * Reads from window.POSTS using the ?id= URL parameter.
 * Zero fetch — works with file://, GitHub Pages, any static host.
 */

document.addEventListener('DOMContentLoaded', function () {

  var contentEl = document.getElementById('post-content');
  if (!contentEl) return;

  if (!window.POSTS || !Array.isArray(window.POSTS)) {
    renderError(contentEl, 'Could not find <code>posts/posts.js</code>. Make sure the script is included in the HTML.');
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var id     = params.get('id');

  if (!id) { renderError(contentEl, 'Missing <code>id</code> parameter in URL.'); return; }

  var post = null;
  for (var i = 0; i < window.POSTS.length; i++) {
    if (window.POSTS[i].id === id) { post = window.POSTS[i]; break; }
  }

  if (!post) { renderError(contentEl, 'No post found with id <code>' + esc(id) + '</code>.'); return; }

  renderPost(contentEl, post);
  updateSEO(post);

  // Wait for post DOM to be ready before building TOC
  setTimeout(function () {
    buildTOC(contentEl);
  }, 0);
});

/* ── Reading time ────────────────────────────────────────── */
function readingTime(post) {
  var words = ((post.title || '') + ' ' + (post.content || ''))
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    .split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* ── Render post ─────────────────────────────────────────── */
function renderPost(el, post) {
  var dateStr = '';
  if (post.date) {
    var d = new Date(post.date + 'T00:00:00');
    dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  var mins = readingTime(post);

  var tagsHTML = '';
  if (post.tags && post.tags.length) {
    tagsHTML = '<div class="card-tags" style="margin-top:.8rem">' +
      post.tags.map(function (t) {
        return '<a href="index.html" class="tag">' + esc(t) + '</a>';
      }).join('') + '</div>';
  }

  el.innerHTML =
    '<div class="post-header">' +
      '<div class="post-meta">' +
        '<a href="index.html" class="back-link">Volver al inicio</a>' +
        (dateStr
          ? '<span style="color:var(--border)">·</span><time datetime="' + esc(post.date) + '">' + esc(dateStr) + '</time>'
          : '') +
        '<span style="color:var(--border)">·</span>' +
        '<span class="reading-time-header">⏱ ' + mins + ' min de lectura</span>' +
      '</div>' +
      '<h1>' + esc(post.title) + '</h1>' +
      tagsHTML +
    '</div>' +
    // Article wrapper — relative positioning needed for the TOC aside
    '<div class="post-layout">' +
      '<div class="post-body" id="post-body">' + (post.content || '') + '</div>' +
      '<aside class="toc-aside" id="toc-aside"></aside>' +
    '</div>';
}

/* ── Table of contents ───────────────────────────────────── */
function buildTOC(contentEl) {
  var body  = contentEl.querySelector('#post-body');
  var aside = contentEl.querySelector('#toc-aside');
  if (!body || !aside) return;

  var headings = body.querySelectorAll('h2, h3');
  if (headings.length < 2) { aside.style.display = 'none'; return; }

  // Assign IDs to headings that don't already have one
  headings.forEach(function (h, i) {
    if (!h.id) {
      h.id = 'heading-' + i + '-' + h.textContent.trim()
        .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
  });

  var items = Array.prototype.map.call(headings, function (h) {
    var indent = h.tagName === 'H3' ? ' toc-h3' : '';
    return '<li class="toc-item' + indent + '">' +
      '<a href="#' + h.id + '" class="toc-link">' + esc(h.textContent) + '</a>' +
    '</li>';
  }).join('');

  aside.innerHTML =
    '<div class="toc-box">' +
      '<div class="toc-title">Contenidos</div>' +
      '<ul class="toc-list">' + items + '</ul>' +
    '</div>';

  // Highlight active heading on scroll
  var links    = aside.querySelectorAll('.toc-link');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('active'); });
        var active = aside.querySelector('a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-10% 0px -80% 0px' });

  headings.forEach(function (h) { observer.observe(h); });
}

/* ── Dynamic SEO ─────────────────────────────────────────── */
function updateSEO(post) {
  document.title = (post.title ? post.title + ' — ' : '') + 'Blog';
  setMeta('name', 'description', post.description || '');
  setMeta('name', 'keywords', (post.tags || []).join(', '));
  setMeta('property', 'og:title', post.title || '');
  setMeta('property', 'og:description', post.description || '');
  setMeta('property', 'og:type', 'article');
}

function setMeta(attr, key, value) {
  if (!value) return;
  var el = document.querySelector('meta[' + attr + '="' + key + '"]');
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
}

/* ── Error state ─────────────────────────────────────────── */
function renderError(el, msg) {
  document.title = 'Error — Blog';
  el.innerHTML =
    '<a href="index.html" class="back-link" style="display:inline-block;margin:2rem 0 1rem">Volver al inicio</a>' +
    '<div class="err-box"><strong>Could not load post</strong><p style="margin-top:.3rem">' + msg + '</p></div>';
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
