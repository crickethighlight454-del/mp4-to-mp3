/**
 * Shared PWA bootstrap.
 * Each page sets window.PWA_ROOT to a relative path pointing at the site root
 * before loading this script, e.g. "./" on the hub page or "../../" on a
 * page nested two folders deep under /tools/<tool-name>/.
 */
(function () {
  const ROOT = window.PWA_ROOT || './';

  // ---- Service worker registration (explicit scope = site root) ----
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(ROOT + 'service-worker.js', { scope: ROOT })
        .catch((err) => console.warn('Service worker registration failed:', err));
    });
  }

  // ---- Install prompt (Chrome / Edge / Android) ----
  let deferredPrompt;
  const installBtn = document.getElementById('installBtn');
  const iosHint = document.getElementById('iosHint');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.style.display = 'none';
    deferredPrompt = null;
  });

  // ---- iOS Safari doesn't fire beforeinstallprompt: show a manual hint ----
  function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }
  function isInStandaloneMode() {
    return ('standalone' in window.navigator) && window.navigator.standalone;
  }
  if (isIos() && !isInStandaloneMode() && iosHint) {
    iosHint.style.display = 'inline-flex';
    iosHint.textContent = '📲 iPhone/iPad: tap Share → "Add to Home Screen" to install';
  }
})();
