/**
 * assets/layout.js
 * ============================================================
 * Single source of truth for the site header and footer.
 * Edit SITE_CONFIG, nav links and footer text here —
 * every page that includes this script updates automatically.
 *
 * Works with file://, GitHub Pages, and any static host
 * because it uses DOM injection (no fetch required).
 *
 * Usage — add to any page:
 *   <div id="site-header"></div>
 *   ...page content...
 *   <div id="site-footer"></div>
 *   <script src="assets/layout.js"></script>
 * ============================================================
 */

/* ══════════════════════════════════════════════════
   SITE CONFIGURATION — edit this block
══════════════════════════════════════════════════ */
var SITE_CONFIG = {
  name:       'IamSaulC - Blog',
  nameAccent: ' - ',
  tagline:    'Un lugar donde comparto proyectos, guías e ideas',
  github:     'https://github.com/iamsaulc/iamsaulc.github.io',

  // Navigation links — add, remove or reorder freely
  nav: [
    { label: '<i class="fa-solid fa-house"></i>Inicio',   href: 'index.html' },
    { label: '<i class="fa-solid fa-user"></i>Sobre mí', href: 'about.html' },
    { label: '<i class="fa-brands fa-github"></i>GitHub',   href: 'https://github.com/iamsaulc', external: true },
  ],
};

/* ══════════════════════════════════════════════════
   INJECT — no need to edit below this line
══════════════════════════════════════════════════ */

(function () {

  /* ── Logo HTML ── */
  function buildLogo() {
    var name   = SITE_CONFIG.name;
    var accent = SITE_CONFIG.nameAccent;
    if (accent && name.indexOf(accent) !== -1) {
      name = name.replace(accent, '<span>' + accent + '</span>');
    }
    return '<a href="index.html" class="logo">' + name + '</a>';
  }

  /* ── Nav HTML ── */
  function buildNav() {
    var links = (SITE_CONFIG.nav || []).map(function (item) {
      var extra = item.external ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + item.href + '"' + extra + '>' + item.label + '</a>';
    }).join('');
    return '<nav class="site-nav">' + links + '</nav>';
  }

  /* ── Full header HTML ── */
  function buildHeader() {
    return '<header class="site-header">' +
      '<div class="wrap">' + buildLogo() + buildNav() + '</div>' +
    '</header>';
  }

  /* ── Full footer HTML ── */
  function buildFooter() {
    var year = new Date().getFullYear();
    return '<footer class="site-footer">' +
      '<div class="wrap">' +
        '<span>\u00a9 ' + year + ' ' + SITE_CONFIG.name +
          (SITE_CONFIG.tagline ? ' \u2014 ' + SITE_CONFIG.tagline : '') +
        '</span>' +
        '<a href="' + SITE_CONFIG.github + '" target="_blank" rel="noopener">GitHub \u2197</a>' +
      '</div>' +
    '</footer>';
  }

  /* ── Replace placeholder divs with real HTML ── */
  function inject() {
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) h.outerHTML = buildHeader();
    if (f) f.outerHTML = buildFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
