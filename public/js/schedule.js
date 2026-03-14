// schedule.js — Match schedule page

let allMatches = [];
let currentFilter = 'all';
let searchQuery = '';

function formatDate(isoString) {
  const d = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function teamLogoHtml(logo, name) {
  if (logo) {
    return `<img class="schedule-team-logo" src="${logo}" alt="${name}"
      onerror="this.outerHTML='<span style=font-weight:700;color:var(--text-secondary)>${name[0]}</span>'">`;
  }
  return `<span style="font-weight:700;color:var(--text-secondary);">${name[0]}</span>`;
}

function renderSchedule() {
  const container = document.getElementById('schedule-container');
  const empty = document.getElementById('schedule-empty');

  let filtered = allMatches;

  // Status filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(m => m.status === currentFilter);
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(m =>
      m.team_home.toLowerCase().includes(q) ||
      m.team_away.toLowerCase().includes(q) ||
      m.competition.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q)
    );
  }

  if (!filtered.length) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  // Group by date
  const groups = {};
  filtered.forEach(m => {
    const dateKey = new Date(m.start_time).toDateString();
    if (!groups[dateKey]) groups[dateKey] = { label: formatDate(m.start_time), matches: [], ts: new Date(m.start_time) };
    groups[dateKey].matches.push(m);
  });

  const sortedGroups = Object.values(groups).sort((a, b) => a.ts - b.ts);

  container.innerHTML = sortedGroups.map(group => `
    <div class="date-group">
      <div class="date-label">${group.label}</div>
      <div class="schedule-list">
        ${group.matches.map(m => renderScheduleItem(m)).join('')}
      </div>
    </div>
  `).join('');
}

function renderScheduleItem(m) {
  const isLive = m.status === 'live';
  const isFinished = m.status === 'finished';
  const isUpcoming = m.status === 'upcoming';
  const href = isUpcoming || isLive ? `/watch.html?id=${m.id}` : '#';

  const timeDisplay = isLive
    ? `<div class="schedule-time live-time">🔴 LIVE${m.minute ? ` ${m.minute}'` : ''}</div>`
    : `<div class="schedule-time">${formatTime(m.start_time)}</div>`;

  const scorePart = (isLive || isFinished)
    ? `<div class="schedule-score">${m.score_home} — ${m.score_away}</div>`
    : `<div class="schedule-score" style="font-size:13px;color:var(--text-muted);">VS</div>`;

  const badge = isLive
    ? `<div class="status-badge live schedule-badge"><div class="live-dot"></div>LIVE</div>`
    : isFinished
    ? `<div class="status-badge finished schedule-badge">FT</div>`
    : `<div class="status-badge upcoming schedule-badge">⏰</div>`;

  return `
    <a href="${href}" class="schedule-item ${isLive ? 'live-item' : ''}">
      ${timeDisplay}
      <div class="schedule-sep"></div>
      <div class="schedule-teams">
        <div class="schedule-team-row">
          ${teamLogoHtml(m.team_home_logo, m.team_home)}
          <span class="schedule-team-name">${m.team_home}</span>
        </div>
        <div class="schedule-team-row">
          ${teamLogoHtml(m.team_away_logo, m.team_away)}
          <span class="schedule-team-name">${m.team_away}</span>
        </div>
        <div class="schedule-competition">⚽ ${m.competition}</div>
      </div>
      ${scorePart}
      ${badge}
    </a>
  `;
}

async function loadSchedule() {
  try {
    const res = await fetch('/api/matches');
    allMatches = await res.json();

    // Count live
    const liveCount = allMatches.filter(m => m.status === 'live').length;
    const liveEl = document.getElementById('live-count');
    if (liveEl) liveEl.textContent = liveCount;

    renderSchedule();
  } catch (e) {
    console.error('Failed to load schedule:', e);
  }
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderSchedule();
  });
});

// Search
document.getElementById('schedule-search').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderSchedule();
});

loadSchedule();
setInterval(loadSchedule, 30000);
