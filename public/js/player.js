// player.js — P2P HLS Player with hls.js + p2p-media-loader

const params = new URLSearchParams(window.location.search);
const matchId = params.get('id');

if (!matchId) {
  window.location.href = '/';
}

let matchData = null;

// ─── Load match info ──────────────────────────────────────────────────────────
async function loadMatch() {
  try {
    const res = await fetch(`/api/matches/${matchId}`);
    if (!res.ok) { window.location.href = '/'; return; }
    matchData = await res.json();
    applyMatchInfo(matchData);
    
    if (matchData.status === 'upcoming') {
      showCountdown(matchData);
    } else {
      initPlayer(matchData.stream_url, matchData.iframe_url);
    }
  } catch (e) {
    showOverlay(t('player.errorLoadingMatch'), true);
  }
}

function applyMatchInfo(m) {
  console.log('[SEO] Applying match info:', m);
  // SEO & Title
  const defaultTitle = `${m.team_home} vs ${m.team_away} - LiveGame`;
  const seoDesc = m.seo_description || `Watch live ${m.team_home} vs ${m.team_away} stream with P2P technology and real-time live chat.`;
  
  document.title = defaultTitle;
  
  // Update Meta Tags
  updateMeta('description', seoDesc);
  updateMeta('og:title', document.title, true);
  updateMeta('og:description', seoDesc, true);
  updateMeta('twitter:title', document.title);
  updateMeta('twitter:description', seoDesc);

  // Competition
  document.getElementById('match-competition').innerHTML = `<svg viewBox="0 0 24 24" class="icon icon-sm" style="margin-right:8px;"><circle cx="12" cy="12" r="10"></circle><path d="m12 12-3.5 1.5L7 10l3-2.5L13.5 9l-1.5 3z"></path><path d="M12 2v5.5"></path><path d="M12 22v-5.5"></path><path d="M22 12h-5.5"></path><path d="M2 12h5.5"></path><path d="m7 10-3-1.5"></path><path d="m17 10 3-1.5"></path><path d="m7 14-3 1.5"></path><path d="m17 14 3-1.5"></path></svg> ${m.competition}`;

  // Status badge
  if (m.status === 'live') {
    document.getElementById('status-badge').style.display = 'flex';
  }

  // Score
  document.getElementById('home-name').textContent = m.team_home;
  document.getElementById('away-name').textContent = m.team_away;
  document.getElementById('score-home').textContent = m.score_home;
  document.getElementById('score-away').textContent = m.score_away;

  // Logos with Fallbacks
  const setLogo = (imgId, containerId, logoUrl, teamName) => {
    const img = document.getElementById(imgId);
    const container = document.getElementById(containerId);
    if (!container || !img) return;

    if (logoUrl) {
      img.src = logoUrl;
      img.classList.remove('hidden');
      container.classList.remove('has-fallback');
      container.textContent = ''; // Clear fallback text
      container.appendChild(img); // Re-add img if it was cleared
      
      img.onerror = () => {
        img.classList.add('hidden');
        container.classList.add('has-fallback');
        container.textContent = teamName ? teamName[0].toUpperCase() : '?';
      };
    } else {
      img.classList.add('hidden');
      container.classList.add('has-fallback');
      container.textContent = teamName ? teamName[0].toUpperCase() : '?';
    }
  };

  setLogo('home-logo', 'home-logo-container', m.team_home_logo, m.team_home);
  setLogo('away-logo', 'away-logo-container', m.team_away_logo, m.team_away);

  // Minute
  if (m.status === 'live' && m.minute) {
    const badge = document.getElementById('minute-badge');
    badge.style.display = 'flex';
    document.getElementById('match-minute').textContent = m.minute;
  }

  // Time display
  const timeEl = document.getElementById('match-time-display');
  if (m.status === 'upcoming') {
    const d = new Date(m.start_time);
    timeEl.textContent = d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  } else if (m.status === 'finished') {
    timeEl.textContent = t('watch.fullTime');
  }

  // Stadium
  if (m.stadium) {
    document.getElementById('match-venue').style.display = 'flex';
    document.getElementById('stadium-name').textContent = m.stadium;
  }

  // Lineup / Round Schedule
  if (m.lineup) {
    const lineupEl = document.getElementById('match-lineup');
    const lineupBody = document.getElementById('match-lineup-body');
    if (lineupEl && lineupBody) {
      const decodedLineup = decodeEmbedValue(m.lineup);
      if (/<iframe[\s\S]*?>/i.test(decodedLineup)) {
        // Render iframe embeds if admin pasted embed code here.
        lineupBody.innerHTML = decodedLineup.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
      } else {
        lineupBody.textContent = m.lineup;
      }
      lineupEl.style.display = 'flex';
    }
  }
}

// ─── Player ───────────────────────────────────────────────────────────────────
let hls = null;
let totalP2PBytes = 0;
let totalCDNBytes = 0;
let intervalId = null;

function showOverlay(text, isError = false) {
  const overlay = document.getElementById('player-overlay');
  overlay.classList.remove('hidden');
  if (isError) {
    document.getElementById('overlay-text').innerHTML = `<div class="player-error-msg"><svg viewBox="0 0 24 24" class="icon icon-lg" style="stroke:var(--red);margin-bottom:12px;display:block;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> ${text}</div>`;
  } else {
    document.getElementById('overlay-text').innerHTML = `<div class="player-loading-text">${text}</div>`;
  }
}

function hideOverlay() {
  document.getElementById('player-overlay').classList.add('hidden');
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B/s';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB/s';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB/s';
}

function decodeHtmlEntities(value) {
  const txt = document.createElement('textarea');
  txt.innerHTML = String(value || '');
  return txt.value;
}

function decodeEmbedValue(rawValue) {
  let value = decodeHtmlEntities(rawValue).trim();
  // Handle values stored as URL-encoded iframe HTML (e.g. %3Ciframe ... %3E)
  if (/%3Ciframe/i.test(value) || /%3Cdiv/i.test(value)) {
    try {
      value = decodeURIComponent(value);
    } catch (e) {
      // Keep original if malformed encoding
    }
  }
  return value;
}

function applyEmbedToIframe(iframe, rawValue) {
  const value = decodeEmbedValue(rawValue);
  if (!value) return false;

  const isIframeCode = /<iframe[\s\S]*?>/i.test(value);
  if (isIframeCode) {
    const srcMatch = value.match(/src=["'](.*?)["']/i);
    if (srcMatch && srcMatch[1]) {
      iframe.src = srcMatch[1];
    } else {
      iframe.srcdoc = value;
    }
    return true;
  }

  iframe.src = value;
  return true;
}

function initPlayer(streamUrl, iframeUrl) {
  const video = document.getElementById('video-player');
  const iframe = document.getElementById('iframe-player');

  // Prefer dedicated iframe_url if provided
  if (iframeUrl) {
    console.log('[Player] Using dedicated iframe_url');
    video.classList.add('hidden');
    iframe.classList.remove('hidden');
    document.getElementById('p2p-stats-bar').style.display = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
    applyEmbedToIframe(iframe, iframeUrl);
    document.getElementById('player-overlay').classList.add('hidden');
    return;
  }

  if (!streamUrl) {
    if (matchData && matchData.status === 'upcoming') {
      showCountdown(matchData);
      return;
    }
    showOverlay(t('watch.noStream'), true);
    return;
  }

  // Detect if streamUrl is an iframe code or just a URL that needs an iframe
  const isIframeCode = streamUrl.toLowerCase().includes('<iframe');
  const isHls = streamUrl.toLowerCase().includes('.m3u8') || streamUrl.toLowerCase().includes('.mpd');

  if (isIframeCode || !isHls) {
    console.log('[Player] Using Iframe mode');
    video.classList.add('hidden');
    iframe.classList.remove('hidden');

    // Apply Sandbox to prevent pop-ups
    // allow-popups is OMITTED to block ad tabs
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');

    applyEmbedToIframe(iframe, streamUrl);

    hideOverlay();
    return;
  }

  // Else: Use HLS player
  video.classList.remove('hidden');
  iframe.classList.add('hidden');
  

  showOverlay(t('watch.initP2P'));

  // Try p2p-media-loader first, fall back to plain hls.js
  let engine = null;
  let hlsConfig = {};

  try {
    if (window.HlsJsP2PEngine) {
      engine = new HlsJsP2PEngine.Engine({
        segments: {
          swarmId: `livegame-match-${matchId}`,
        }
      });

      hlsConfig = HlsJsP2PEngine.Engine.injectMixin({
        // hls.js config
        enableWorker: true,
        lowLatencyMode: true,
      });

      engine.addEventListener('onPeerConnect', () => updatePeerCount(engine));
      engine.addEventListener('onPeerClose', () => updatePeerCount(engine));
      engine.addEventListener('onChunkDownloaded', (e) => {
        if (e.detail?.downloadSource === 'p2p') {
          totalP2PBytes += e.detail.bytesLength || 0;
        } else {
          totalCDNBytes += e.detail?.bytesLength || 0;
        }
        updateP2PStats();
      });
      console.log('[P2P] Engine initialized');
    }
  } catch (err) {
    console.warn('[P2P] Engine init failed, using plain hls.js:', err);
  }

  // Init hls.js (with or without P2P)
  if (Hls.isSupported()) {
    hls = new Hls(hlsConfig || {});
    if (engine) engine.bindHls(hls);
    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      hideOverlay();
      video.play().catch(() => { });
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            showOverlay(t('watch.networkError'), false);
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            showOverlay(t('watch.streamError'), true);
        }
      }
    });

    // Simulate P2P stats update
    simulateP2PStats();

  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari native HLS
    video.src = streamUrl;
    video.addEventListener('loadedmetadata', () => hideOverlay());
    video.play().catch(() => { });
  } else {
    showOverlay(t('watch.browserNoHls'), true);
  }
}

function updatePeerCount(engine) {
  try {
    const count = engine.getPeers?.()?.length || 0;
    document.getElementById('p2p-peers').textContent = count;
  } catch (e) { }
}

function updateP2PStats() {
  const total = totalP2PBytes + totalCDNBytes;
  const pct = total > 0 ? Math.round((totalP2PBytes / total) * 100) : 0;
  document.getElementById('p2p-saved').textContent = pct + '%';
}

// Simulate P2P stats for demo purposes when real events aren't available
function simulateP2PStats() {
  let peers = 0;
  let p2pRate = 0;
  let upRate = 0;

  setInterval(() => {
    // Gradual increase to simulate peers joining
    if (peers < 8) peers += Math.random() > 0.6 ? 1 : 0;
    if (peers > 0 && Math.random() > 0.85) peers = Math.max(0, peers - 1);

    p2pRate = peers > 0 ? Math.floor(Math.random() * 180 + 60) * 1024 : 0;
    upRate = peers > 0 ? Math.floor(Math.random() * 80 + 20) * 1024 : 0;

    document.getElementById('p2p-peers').textContent = peers;
    document.getElementById('p2p-down').textContent = peers > 0 ? formatBytes(p2pRate) : '0 KB/s';
    document.getElementById('p2p-up').textContent = peers > 0 ? formatBytes(upRate) : '0 KB/s';

    totalP2PBytes += p2pRate / 4;
    totalCDNBytes += (peers > 0 ? Math.random() * 50000 : Math.random() * 200000);
    updateP2PStats();
  }, 2000);
}

// ─── Share ────────────────────────────────────────────────────────────────────
function shareMatch() {
  if (navigator.share) {
    navigator.share({
      title: matchData ? `${matchData.team_home} vs ${matchData.team_away} - LiveGame` : 'LiveGame',
      url: window.location.href
    }).catch(() => { });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast(t('watch.linkCopied'), 'success');
    }).catch(() => {
      showToast(t('player.copyManually') + window.location.href);
    });
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ─── Listen for live match updates ────────────────────────────────────────────
// (Socket.IO match_updated event is emitted by server.js when admin updates score)
document.addEventListener('match_updated_event', (e) => {
  const m = e.detail;
  if (String(m.id) === String(matchId)) {
    applyMatchInfo(m);
  }
});

// ─── Helper ───────────────────────────────────────────────────────────────────
function updateMeta(name, content, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

loadMatch();

let _matchNewsItems = [];

async function loadMatchShortNews() {
  try {
    const res = await fetch(`/api/matches/${matchId}/news`);
    if (!res.ok) return;
    _matchNewsItems = await res.json();
    renderMatchShortNews();
  } catch (e) { /* silent */ }
}

function renderMatchShortNews() {
  if (!_matchNewsItems.length) return;
  const container = document.getElementById('match-short-news');
  const list = document.getElementById('match-short-news-list');
  const lang = window.__lang || localStorage.getItem('lang') || 'en';
  const isAr = lang === 'ar';

  list.innerHTML = _matchNewsItems.map(item => {
    const title = isAr
      ? (item.title_ar || item.title_en || '')
      : (item.title_en || item.title_ar || '');
    if (!title) return '';
    const dir = /[\u0600-\u06FF]/.test(title) ? 'rtl' : 'ltr';
    return `<li class="match-short-news-item" dir="${dir}">${title}</li>`;
  }).join('');

  container.style.display = 'flex';
}

loadMatchShortNews();

// Re-render news when language is toggled
const _origToggleLang = window.toggleLang;
window.toggleLang = function () {
  if (_origToggleLang) _origToggleLang();
  renderMatchShortNews();
};

// ─── Countdown Logic ──────────────────────────────────────────────────────────
let countdownInterval = null;

function showCountdown(m) {
  if (countdownInterval) clearInterval(countdownInterval);
  const overlay = document.getElementById('player-overlay');
  overlay.classList.remove('hidden');
  
  const startTime = new Date(m.start_time).getTime();
  let lastValues = { days: -1, hours: -1, mins: -1, secs: -1 };

  const update = () => {
    const now = new Date().getTime();
    const diff = startTime - now;
    
    if (diff <= 0) {
      clearInterval(countdownInterval);
      overlay.innerHTML = '<div class="player-loading-text">' + t('watch.matchStarting') + '</div>';
      setTimeout(loadMatch, 2000);
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Initial Render
    if (!overlay.querySelector('.countdown-container')) {
      overlay.innerHTML = `
        <div class="countdown-bg"></div>
        <div class="countdown-container">
          <div class="countdown-teams">
            <div class="countdown-team">
              <div class="countdown-logo">${m.team_home_logo ? `<img src="${m.team_home_logo}" alt="${m.team_home}">` : m.team_home[0]}</div>
              <div class="countdown-team-name">${m.team_home}</div>
            </div>
            <div class="countdown-vs">VS</div>
            <div class="countdown-team">
              <div class="countdown-logo">${m.team_away_logo ? `<img src="${m.team_away_logo}" alt="${m.team_away}">` : m.team_away[0]}</div>
              <div class="countdown-team-name">${m.team_away}</div>
            </div>
          </div>
          
          <div class="countdown-timer">
            ${days > 0 ? `
              <div class="countdown-box" id="cd-days-box">
                <div class="countdown-value" id="cd-days">${days}</div>
                <div class="countdown-label">${t('countdown.days')}</div>
              </div>
            ` : ''}
            <div class="countdown-box" id="cd-hours-box">
              <div class="countdown-value" id="cd-hours">${hours.toString().padStart(2, '0')}</div>
              <div class="countdown-label">${t('countdown.hours')}</div>
            </div>
            <div class="countdown-box" id="cd-mins-box">
              <div class="countdown-value" id="cd-mins">${mins.toString().padStart(2, '0')}</div>
              <div class="countdown-label">${t('countdown.mins')}</div>
            </div>
            <div class="countdown-box" id="cd-secs-box">
              <div class="countdown-value" id="cd-secs">${secs.toString().padStart(2, '0')}</div>
              <div class="countdown-label">${t('countdown.secs')}</div>
            </div>
          </div>
          
          <div class="countdown-message">${t('countdown.matchIn')} ${m.competition}</div>
        </div>
      `;
    } else {
      // Modular Updates
      const updateVal = (id, newVal, lastVal) => {
        if (newVal !== lastVal) {
          const el = document.getElementById(id);
          if (el) {
            el.textContent = newVal.toString().padStart(2, id === 'cd-days' ? 0 : '0');
            el.classList.remove('number-pop');
            void el.offsetWidth; // Trigger reflow
            el.classList.add('number-pop');
          }
        }
      };

      updateVal('cd-days', days, lastValues.days);
      updateVal('cd-hours', hours, lastValues.hours);
      updateVal('cd-mins', mins, lastValues.mins);
      updateVal('cd-secs', secs, lastValues.secs);
    }
    
    lastValues = { days, hours, mins, secs };
  };
  
  update();
  countdownInterval = setInterval(update, 1000);
}
