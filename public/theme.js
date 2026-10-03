// @ts-check
(() => {
  const key = 'reasonably-clever-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  /** @type {'light' | 'dark' | null} */
  let preference = null;
  /** @type {HTMLButtonElement | null} */
  let button = null;

  /** @param {string | null} value */
  function validTheme(value) {
    return value === 'light' || value === 'dark' ? value : null;
  }

  function applyTheme() {
    const theme = preference ?? (system.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', `Use ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      const matches = meta.getAttribute('content') === (theme === 'dark' ? '#1B2723' : '#FFFFFF');
      meta.setAttribute('media', matches ? 'all' : 'not all');
    }
    for (const icon of document.querySelectorAll('link[rel="icon"]')) {
      const matches = icon.getAttribute('href') === (theme === 'dark' ? '/favicon-dark.svg' : '/favicon.svg');
      icon.setAttribute('media', matches ? 'all' : 'not all');
    }
  }

  try {
    preference = validTheme(window.localStorage.getItem(key));
  } catch (error) {
    console.warn('Theme preference could not be read; using the device preference.', error);
  }
  applyTheme();

  system.addEventListener('change', () => {
    if (preference === null) applyTheme();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) {
      preference = validTheme(event.newValue);
      applyTheme();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('.theme-toggle');
    if (!button) {
      console.error('Theme toggle control is missing.');
      return;
    }
    applyTheme();
    button.hidden = false;
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      try {
        window.localStorage.setItem(key, preference);
      } catch (error) {
        console.warn('Theme preference could not be saved; it will only apply to this visit.', error);
      }
    });
  });
})();
