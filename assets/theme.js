/**
 * assets/theme.js
 * Dark / light mode toggle.
 * - Persists preference in localStorage
 * - Respects the OS prefers-color-scheme as default value
 * - Injects the floating toggle button into the DOM automatically
 */

(function () {
  var STORAGE_KEY = 'blog-theme';
  var ICON_DARK   = '🌙';
  var ICON_LIGHT  = '☀️';

  /* ── 1. Determine initial theme ── */
  function getInitialTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    // Fall back to the OS color scheme preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /* ── 2. Apply theme to <html> ── */
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(STORAGE_KEY, theme);
    updateButton(theme);
  }

  /* ── 3. Update button icon and label ── */
  function updateButton(theme) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    if (theme === 'dark') {
      btn.textContent = ICON_LIGHT;
      btn.title = 'Switch to light mode';
      btn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      btn.textContent = ICON_DARK;
      btn.title = 'Switch to dark mode';
      btn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  /* ── 4. Create and inject the toggle button ── */
  function injectButton() {
    var btn = document.createElement('button');
    btn.id   = 'theme-toggle';
    btn.type = 'button'; // prevent scroll-to-top on iOS
    btn.setAttribute('aria-label', 'Toggle theme');

    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    document.body.appendChild(btn);
  }

  /* ── 5. Initialize ── */
  // Apply theme before DOM is ready to avoid flash of wrong theme
  var theme = getInitialTheme();
  applyTheme(theme);

  // Inject button once the DOM is available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectButton();
      updateButton(theme);
    });
  } else {
    injectButton();
    updateButton(theme);
  }

})();
