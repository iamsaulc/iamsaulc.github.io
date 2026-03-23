/**
 * assets/app.js
 * Blog index logic: pagination, full-text search,
 * tag filtering, reading time.
 */

var POSTS_PER_PAGE = 5;   // ← change this number to your preference

var allPosts    = [];
var filtered    = [];
var currentPage = 1;
var activeTag   = null;

document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('posts-list');
  if (!container) return;

  if (!window.POSTS || !Array.isArray(window.POSTS)) {
    container.innerHTML = '<div class="err-box"><strong>Error</strong> Could not find <code>posts/posts.js</code>.</div>';
    return;
  }

  allPosts = window.POSTS.slice().sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  if (allPosts.length === 0) {
    container.innerHTML = '<div class="msg"><strong>Sin posts</strong>Agrega posts en <code>posts/posts.js</code>.</div>';
    return;
  }

  // Collect unique tags
  var tagSet = {};
  allPosts.forEach(function (p) { (p.tags || []).forEach(function (t) { tagSet[t] = true; }); });
  buildTagFilter(Object.keys(tagSet).sort());

  // Search input listener
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentPage = 1;
      applyFilters();
    });
  }

  filtered = allPosts.slice();
  renderPage();
});

/* ── Combined filter (search + tag) ─────────────────────── */
function applyFilters() {
  var q = ((document.getElementById('search-input') || {}).value || '').trim().toLowerCase();

  filtered = allPosts.filter(function (p) {
    var matchTag = !activeTag || (p.tags || []).indexOf(activeTag) !== -1;
    var searchIndex = ((p.title || '') + ' ' + (p.description || '') + ' ' +
      (p.tags || []).join(' ') + ' ' +
      (p.content || '').replace(/<[^>]+>/g, ' ')).toLowerCase();
    var matchQ = !q || searchIndex.indexOf(q) !== -1;
    return matchTag && matchQ;
  });

  currentPage = 1;
  renderPage();
}

/* ── Pagination ──────────────────────────────────────────── */
function renderPage() {
  var container = document.getElementById('posts-list');
  var countEl   = document.getElementById('results-count');

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = '<div class="msg"><strong>Sin resultados</strong>Probá con otros términos o tags.</div>';
    if (countEl) countEl.textContent = '0 resultados';
    renderPagination(0);
    return;
  }

  var totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;

  var start     = (currentPage - 1) * POSTS_PER_PAGE;
  var pagePosts = filtered.slice(start, start + POSTS_PER_PAGE);

  pagePosts.forEach(function (post, i) {
    var card = createCard(post);
    card.style.animationDelay = (i * 55) + 'ms';
    container.appendChild(card);
  });

  // Results counter
  if (countEl) {
    var q = ((document.getElementById('search-input') || {}).value || '').trim();
    var parts = [];
    if (q) parts.push('"' + q + '"');
    if (activeTag) parts.push('#' + activeTag);
    var label = parts.length
      ? filtered.length + ' resultado' + (filtered.length !== 1 ? 's' : '') + ' para ' + parts.join(' + ')
      : filtered.length + ' artículo' + (filtered.length !== 1 ? 's' : '');
    countEl.textContent = label;
  }

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  var el = document.getElementById('pagination');
  if (!el) return;
  el.innerHTML = '';
  if (totalPages <= 1) return;

  function btn(label, page, disabled, active) {
    var b = document.createElement('button');
    b.className = 'page-btn' + (active ? ' active' : '');
    b.textContent = label;
    b.disabled = disabled;
    if (!disabled) b.addEventListener('click', function () {
      currentPage = page;
      renderPage();
      // Smooth scroll back to top of list
      var hero = document.querySelector('.hero');
      if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    return b;
  }

  el.appendChild(btn('← Anterior', currentPage - 1, currentPage === 1));

  for (var p = 1; p <= totalPages; p++) {
    // Always show first, last, current and adjacent pages; collapse the rest with "…"
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      el.appendChild(btn(p, p, false, p === currentPage));
    } else if (Math.abs(p - currentPage) === 2) {
      var dots = document.createElement('span');
      dots.className = 'page-dots';
      dots.textContent = '…';
      el.appendChild(dots);
    }
  }

  el.appendChild(btn('Siguiente →', currentPage + 1, currentPage === totalPages));
}

/* ── Tag filter ──────────────────────────────────────────── */
function buildTagFilter(tags) {
  var bar = document.getElementById('tag-bar');
  if (!bar || tags.length === 0) { if (bar) bar.style.display = 'none'; return; }

  bar.innerHTML = '<span class="tag-bar-label">Filtrar:</span>';
  tags.forEach(function (tag) {
    var btn = document.createElement('button');
    btn.className = 'tag';
    btn.textContent = tag;
    btn.dataset.tag = tag;
    btn.addEventListener('click', function () { toggleTag(tag); });
    bar.appendChild(btn);
  });

  var reset = document.createElement('button');
  reset.className = 'tag-reset';
  reset.textContent = '✕ todos';
  reset.addEventListener('click', clearTag);
  bar.appendChild(reset);
}

function toggleTag(tag) {
  activeTag = (activeTag === tag) ? null : tag;
  document.querySelectorAll('#tag-bar .tag').forEach(function (b) {
    b.classList.toggle('active', b.dataset.tag === activeTag);
  });
  applyFilters();
}

function clearTag() {
  activeTag = null;
  document.querySelectorAll('#tag-bar .tag').forEach(function (b) { b.classList.remove('active'); });
  applyFilters();
}

/* ── Reading time ────────────────────────────────────────── */
function readingTime(post) {
  var words = ((post.title || '') + ' ' + (post.description || '') + ' ' + (post.content || ''))
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    .split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) + ' min';
}

/* ── Build post card ─────────────────────────────────────── */
function createCard(post) {
  var article = document.createElement('article');
  article.className = 'post-card';
  article.dataset.tags = (post.tags || []).join(',');

  var href    = 'post.html?id=' + encodeURIComponent(post.id);
  var dateObj = new Date(post.date + 'T00:00:00');
  var day     = dateObj.getDate();
  var month   = dateObj.toLocaleDateString('es-ES', { month: 'short' });
  var year    = dateObj.getFullYear();
  var full    = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  var dateCol = document.createElement('div');
  dateCol.className = 'card-date-col';
  dateCol.innerHTML =
    '<span class="card-date-day" title="' + esc(full) + '">' + day + '</span>' +
    '<span class="card-date-month">' + esc(month) + ' ' + year + '</span>';

  var contentCol = document.createElement('div');
  contentCol.className = 'card-content-col';
  contentCol.innerHTML =
    '<h2 class="card-title"><a href="' + href + '">' + esc(post.title) + '</a></h2>' +
    '<p class="card-desc">' + esc(post.description || '') + '</p>';

  var footer = document.createElement('div');
  footer.className = 'card-footer';

  var tagsDiv = document.createElement('div');
  tagsDiv.className = 'card-tags';
  (post.tags || []).forEach(function (tag) {
    var b = document.createElement('button');
    b.className = 'tag';
    b.textContent = tag;
    b.addEventListener('click', function (e) { e.preventDefault(); toggleTag(tag); });
    tagsDiv.appendChild(b);
  });

  var rt = document.createElement('span');
  rt.className = 'reading-time';
  rt.textContent = '⏱ ' + readingTime(post);

  footer.appendChild(tagsDiv);
  footer.appendChild(rt);
  contentCol.appendChild(footer);
  article.appendChild(dateCol);
  article.appendChild(contentCol);
  return article;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
