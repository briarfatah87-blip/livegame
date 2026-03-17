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
const isStandalone = !!(
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: fullscreen)').matches ||
  window.matchMedia('(display-mode: minimal-ui)').matches ||
  navigator.standalone
);

function showAnimatedPwaSplash() {
  const fromPwaStart = new URLSearchParams(window.location.search).get('source') === 'pwa';
  const shouldShow = isStandalone || fromPwaStart;
  if (!shouldShow) return;
  if (sessionStorage.getItem('pwa_splash_shown') === '1') return;
  sessionStorage.setItem('pwa_splash_shown', '1');

  const style = document.createElement('style');
  style.id = 'pwa-splash-style';
  style.textContent = `
    .pwa-splash {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 30% 20%, #10335a 0%, #0a0e17 60%);
      opacity: 1;
      transition: opacity 0.35s ease;
    }
    .pwa-splash.hide { opacity: 0; pointer-events: none; }
    .pwa-splash-card {
      text-align: center;
      color: #e7f3ff;
      animation: pwaSplashFloat 1.5s ease-in-out infinite;
    }
    .pwa-splash-logo {
      width: 88px;
      height: 88px;
      border-radius: 24px;
      margin: 0 auto 14px;
      display: grid;
      place-items: center;
      background: linear-gradient(145deg, #00e676, #00b25a);
      box-shadow: 0 14px 34px rgba(0, 230, 118, 0.35);
    }
    .pwa-splash-logo svg {
      width: 52px;
      height: 52px;
      stroke: #082112;
      animation: pwaSplashSpin 2.4s linear infinite;
    }
    .pwa-splash-title {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: 0.01em;
    }
    .pwa-splash-title span { color: #00e676; }
    .pwa-splash-sub {
      margin-top: 6px;
      color: #8cb5d8;
      font-size: 13px;
      letter-spacing: 0.12em;
    }
    .pwa-splash-loader {
      width: 120px;
      height: 4px;
      margin: 16px auto 0;
      border-radius: 999px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.15);
    }
    .pwa-splash-loader::after {
      content: '';
      display: block;
      width: 42%;
      height: 100%;
      background: #00e676;
      border-radius: inherit;
      animation: pwaSplashLoad 1.05s ease-in-out infinite;
    }
    @keyframes pwaSplashFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-7px); }
    }
    @keyframes pwaSplashSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pwaSplashLoad {
      0% { transform: translateX(-110%); }
      100% { transform: translateX(280%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .pwa-splash-card,
      .pwa-splash-logo svg,
      .pwa-splash-loader::after { animation: none !important; }
    }
  `;
  document.head.appendChild(style);

  const splash = document.createElement('div');
  splash.className = 'pwa-splash';
  splash.innerHTML = `
    <div class="pwa-splash-card" aria-label="Loading application">
      <div class="pwa-splash-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m12 12-3.5 1.5L7 10l3-2.5L13.5 9l-1.5 3z"></path>
          <path d="M12 2v5.5"></path><path d="M12 22v-5.5"></path>
          <path d="M22 12h-5.5"></path><path d="M2 12h5.5"></path>
        </svg>
      </div>
      <div class="pwa-splash-title">Live<span>Game</span></div>
      <div class="pwa-splash-sub">P2P STREAM LOADING</div>
      <div class="pwa-splash-loader"></div>
    </div>
  `;

  const removeSplash = () => {
    splash.classList.add('hide');
    setTimeout(() => {
      splash.remove();
      style.remove();
    }, 380);
  };

  document.body.appendChild(splash);
  if (document.readyState === 'complete') {
    setTimeout(removeSplash, 900);
  } else {
    window.addEventListener('load', () => setTimeout(removeSplash, 900), { once: true });
  }
}

showAnimatedPwaSplash();

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


