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

function getCompetitionEmoji(competition) {
  return EMOJIS_BY_COMPETITION[competition] || '⚽';
}

function formatTime(isoString, forCard = true) {
  const d = new Date(isoString);
  if (forCard) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
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
  const competitionEmoji = getCompetitionEmoji(match.competition);

  const statusBadge = isLive
    ? `<div class="status-badge live"><div class="live-dot"></div>LIVE ${match.minute ? `${match.minute}'` : ''}</div>`
    : isFinished
    ? `<div class="status-badge finished">FT</div>`
    : `<div class="status-badge upcoming">🗓 ${formatTime(match.start_time)}</div>`;

  const scoreOrTime = isLive || isFinished
    ? `<div class="score">
        <span class="score-num">${match.score_home}</span>
        <span class="score-sep">:</span>
        <span class="score-num">${match.score_away}</span>
      </div>`
    : `<div class="match-time">${formatTime(match.start_time)}</div>`;

  const watchBtn = isLive
    ? `<button class="watch-btn live-btn">▶ Watch Live</button>`
    : isFinished
    ? `<button class="watch-btn disabled-btn">✅ Finished</button>`
    : `<button class="watch-btn disabled-btn">⏰ Upcoming</button>`;

  return `
    <a href="${href}" class="match-card ${match.status}">
      <div class="card-header">
        <div class="competition-badge">${competitionEmoji} ${match.competition}</div>
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
        <div class="stadium-info">${match.stadium ? `📍 ${match.stadium}` : ''}</div>
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
    showToast('Failed to load matches', 'error');
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

document.addEventListener('DOMContentLoaded', loadMatches);
// Auto-refresh every 30 seconds
setInterval(loadMatches, 30000);
