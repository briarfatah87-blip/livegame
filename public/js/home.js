// home.js — Home page: fetch matches and render cards

const EMOJIS_BY_COMPETITION = {
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'La Liga': '🇪🇸',
  'Champions League': '⭐',
  'Serie A': '🇮🇹',
  'Bundesliga': '🇩🇪',
  'Europa League': '🌍',
  'Ligue 1': '🇫🇷',
};

function getCompetitionIcon(competition) {
  return `<svg viewBox="0 0 24 24" class="icon icon-sm" style="margin-right:6px;"><circle cx="12" cy="12" r="10"></circle><path d="m12 12-3.5 1.5L7 10l3-2.5L13.5 9l-1.5 3z"></path><path d="M12 2v5.5"></path><path d="M12 22v-5.5"></path><path d="M22 12h-5.5"></path><path d="M2 12h5.5"></path><path d="m7 10-3-1.5"></path><path d="m17 10 3-1.5"></path><path d="m7 14-3 1.5"></path><path d="m17 14 3-1.5"></path></svg>`;
}

function formatTime(isoString) {
  const d = new Date(isoString);
  const locale = window.__lang === 'ar' ? 'ar' : [];
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString) {
  const d = new Date(isoString);
  const locale = window.__lang === 'ar' ? 'ar' : [];
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

function teamLogoHtml(logo, name) {
  if (logo) {
    return `<img src="${logo}" alt="${name}" onerror="this.outerHTML='<div class=team-logo-placeholder>${name[0]}</div>'">`;
  }
  return `<div class="team-logo-placeholder">${name[0]}</div>`;
}

function renderMatchCard(match) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const isUpcoming = match.status === 'upcoming';
  const href = isUpcoming || isLive ? `/watch.html?id=${match.id}` : '#';

  const statusBadge = isLive
    ? `<div class="status-badge live"><div class="live-dot"></div>${t('status.live').toUpperCase()} ${match.minute ? `${match.minute}'` : ''}</div>`
    : isFinished
    ? `<div class="status-badge finished">${t('watch.fullTime')}</div>`
    : `<div class="status-badge upcoming"><svg viewBox="0 0 24 24" class="icon icon-sm" style="margin-right:4px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${formatTime(match.start_time)}</div>`;

  const scoreOrTime = isLive || isFinished
    ? `<div class="score">
        <span class="score-num">${match.score_home}</span>
        <span class="score-sep">:</span>
        <span class="score-num">${match.score_away}</span>
      </div>`
    : `<div class="match-time">${formatDate(match.start_time)}</div>`;

  const watchBtn = isLive
    ? `<button class="watch-btn live-btn">${t('card.watchLive')}</button>`
    : isFinished
    ? `<button class="watch-btn disabled-btn">${t('card.finished')}</button>`
    : `<button class="watch-btn disabled-btn">${t('card.upcoming')}</button>`;

  return `
    <a href="${href}" class="match-card ${match.status}">
      <div class="card-header">
        <div class="competition-badge">${getCompetitionIcon(match.competition)} ${t(match.competition)}</div>
        ${statusBadge}
      </div>
      <div class="teams-row">
        <div class="team">
          <div class="team-logo-wrap">${teamLogoHtml(match.team_home_logo, match.team_home)}</div>
          <div class="team-name">${match.team_home}</div>
        </div>
        <div class="score-block">
          ${scoreOrTime}
          ${isLive ? `<div class="match-minute">${match.minute}'</div>` : ''}
        </div>
        <div class="team">
          <div class="team-logo-wrap">${teamLogoHtml(match.team_away_logo, match.team_away)}</div>
          <div class="team-name">${match.team_away}</div>
        </div>
      </div>
      <div class="card-footer">
        <div class="stadium-info">${match.stadium ? `<svg viewBox="0 0 24 24" class="icon icon-sm" style="margin-right:4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${match.stadium}` : ''}</div>
        ${watchBtn}
      </div>
    </a>
  `;
}

async function loadMatches() {
  try {
    const res = await fetch('/api/matches');
    const matches = await res.json();

    const live = matches.filter(m => m.status === 'live');
    const upcoming = matches.filter(m => m.status === 'upcoming');
    const finished = matches.filter(m => m.status === 'finished');

    // Update stats
    document.getElementById('stat-live').textContent = live.length;
    document.getElementById('stat-upcoming').textContent = upcoming.length;
    document.getElementById('live-count').textContent = live.length;

    // Render sections
    const liveSection = document.getElementById('live-matches-section');
    
    if (live.length === 0) {
      if (liveSection) liveSection.style.display = 'none';
    } else {
      if (liveSection) liveSection.style.display = 'block';
      renderSection('live-grid', 'live-empty', live);
    }

    renderSection('upcoming-grid', 'upcoming-empty', upcoming);
    renderSection('finished-grid', 'finished-empty', finished);

    // Setup upcoming filters
    setupFilters(upcoming);

  } catch (err) {
    console.error('Failed to load matches:', err);
    showToast(t('home.failedLoadMatches'), 'error');
  }
}

function renderSection(gridId, emptyId, matches) {
  const grid = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);
  if (!matches.length) {
    grid.innerHTML = '';
    grid.style.display = 'none';
    empty.style.display = 'block';
  } else {
    grid.style.display = 'grid';
    empty.style.display = 'none';
    grid.innerHTML = matches.map(renderMatchCard).join('');
  }
}

let allUpcoming = [];
function setupFilters(upcoming) {
  allUpcoming = upcoming;
  const filterBtns = document.querySelectorAll('#upcoming-filters .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const filtered = filter === 'all' ? allUpcoming : allUpcoming.filter(m => m.competition === filter);
      renderSection('upcoming-grid', 'upcoming-empty', filtered);
    });
  });
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderNewsCard(item) {
  const hasImage = Boolean(item.image_url);
  const href = `/news.html?id=${item.id}`;

  return `
    <a class="news-card news-card-home" href="${href}">
      <div class="news-image-wrap">
        ${hasImage ? `<img src="${item.image_url}" alt="${escapeHtml(item.title)}" onerror="this.outerHTML='<div class=&quot;news-image-fallback&quot;>NEWS</div>'">` : '<div class="news-image-fallback">NEWS</div>'}
      </div>
      <div class="news-content">
        <h3 class="news-title">${escapeHtml(item.title)}</h3>
      </div>
    </a>
  `;
}

async function loadNews() {
  const grid = document.getElementById('news-grid');
  const empty = document.getElementById('news-empty');
  if (!grid || !empty) return;

  try {
    const res = await fetch('/api/news?limit=4');
    const rows = await res.json();

    if (!rows.length) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      grid.innerHTML = '';
      return;
    }

    empty.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = rows.map(renderNewsCard).join('');
  } catch (err) {
    grid.style.display = 'none';
    empty.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadMatches();
  loadNews();
});
// Auto-refresh every 30 seconds
setInterval(() => {
  loadMatches();
  loadNews();
}, 30000);
