if ('serviceWorker' in navigator) {
  const registerSW = () => {
    console.log('[PWA] Attempting to register Service Worker...');
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('[PWA] Service Worker Registered Successfully!', reg.scope);
      })
      .catch(err => {
        console.error('[PWA] Service Worker Registration Failed:', err);
      });
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}

// PWA Install Prompt Logic
let deferredPrompt;
const installBtn = document.getElementById('pwa-install-btn');

// Enhanced standalone mode detection
const isPwaParam = window.location.search.includes('source=pwa');
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                   window.matchMedia('(display-mode: fullscreen)').matches ||
                   window.matchMedia('(display-mode: minimal-ui)').matches ||
                   navigator.standalone || 
                   isPwaParam;

console.log('[PWA] Standalone Mode:', isStandalone);

if (installBtn) {
  if (isStandalone) {
    installBtn.style.display = 'none';
  } else {
    // Show only if not standalone
    installBtn.style.display = 'flex';
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] beforeinstallprompt event fired');
  e.preventDefault();
  deferredPrompt = e;
});

if (installBtn) {
  installBtn.addEventListener('click', (e) => {
    if (deferredPrompt) {
      // Hide button when prompting
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt');
        } else {
          console.log('[PWA] User dismissed the install prompt');
          installBtn.style.display = 'flex'; // Show it back if dismissed
        }
        deferredPrompt = null;
      });
    } else {
      // Manual fallback instructions
      alert('To install this app manually:\n\n1. Open your browser menu (three dots or share icon).\n2. Select "Add to Home Screen" or "Install App".\n\nNote: Automated installation requires HTTPS.');
    }
  });
}

window.addEventListener('appinstalled', (evt) => {
  console.log('[PWA] App was installed');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
});


