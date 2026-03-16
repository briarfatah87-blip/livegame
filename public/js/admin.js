// admin.js — Admin panel management

let adminToken = localStorage.getItem('admin_token') || null;
let editingMatchId = null;

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function login() {
  const password = document.getElementById('admin-password').value;
  const errEl = document.getElementById('login-error');
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: password })
    });
    const data = await res.json();
    if (data.valid) {
      adminToken = password;
      localStorage.setItem('admin_token', password);
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('admin-dashboard').style.display = 'block';
      loadMatchesTable();
    } else {
      errEl.style.display = 'block';
    }
  } catch (e) {
    errEl.style.display = 'block';
  }
}

function logout() {
  adminToken = null;
  localStorage.removeItem('admin_token');
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard').style.display = 'none';
  document.getElementById('admin-password').value = '';
}

// Auto login if token stored
if (adminToken) {
  fetch('/api/admin/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: adminToken })
  }).then(r => r.json()).then(data => {
    if (data.valid) {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('admin-dashboard').style.display = 'block';
      loadMatchesTable();
    } else {
      adminToken = null; localStorage.removeItem('admin_token');
    }
  }).catch(() => {
    adminToken = null; localStorage.removeItem('admin_token');
  });
}

// Enter key login
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('admin-password')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') login();
  });
});

// ─── Panel switching ──────────────────────────────────────────────────────────
function showPanel(panel, skipReset = false) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-nav button, .admin-nav a').forEach(b => b.classList.remove('active'));

  document.getElementById(`panel-${panel}`).classList.add('active');
  const navBtn = document.getElementById(`nav-${panel}`);
  if (navBtn) navBtn.classList.add('active');

  if (panel === 'matches') loadMatchesTable();
  if (panel === 'add-match' && !skipReset) {
    resetForm();
    document.getElementById('match-form-title').textContent = t('admin.addNewMatchTitle');
    document.getElementById('submit-match-btn').textContent = t('admin.saveMatchBtn');
  }
  if (panel === 'bans') loadBansTable();
}

// ─── Matches ──────────────────────────────────────────────────────────────────
async function loadMatchesTable() {
  const tbody = document.getElementById('matches-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px;">' + t('admin.loading') + '</td></tr>';
  try {
    const res = await fetch('/api/matches');
    const matches = await res.json();
    if (!matches.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px;">' + t('admin.noMatches') + '</td></tr>';
      return;
    }
    tbody.innerHTML = matches.map(m => `
      <tr>
        <td style="color:var(--text-muted);">${m.id}</td>
        <td>
          <div class="cell-teams">
            <div class="t">${m.team_home}</div>
            <div class="t vs">vs</div>
            <div class="t">${m.team_away}</div>
          </div>
        </td>
        <td style="font-weight:700;">${m.score_home} — ${m.score_away}</td>
        <td><div class="status-badge ${m.status}">${m.status.toUpperCase()}</div></td>
        <td>${m.competition}</td>
        <td style="font-size:12px;color:var(--text-muted);">${new Date(m.start_time).toLocaleString([], {dateStyle:'short',timeStyle:'short'})}</td>
        <td>
          <div class="table-actions">
            <button class="tbl-btn edit" onclick="editMatch(${m.id})"><svg viewBox="0 0 24 24" class="icon icon-sm" style="stroke:currentColor;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Edit</button>
            <button class="tbl-btn del" onclick="deleteMatch(${m.id})"><svg viewBox="0 0 24 24" class="icon icon-sm" style="stroke:currentColor;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--red);padding:24px;">${t('admin.errorLoadingMatches')}</td></tr>`;
  }
}

async function editMatch(id) {
  try {
    const res = await fetch(`/api/matches/${id}`);
    const m = await res.json();
    editingMatchId = id;

    document.getElementById('f-title').value = m.title;
    document.getElementById('f-home').value = m.team_home;
    document.getElementById('f-home-logo').value = m.team_home_logo || '';
    document.getElementById('f-away').value = m.team_away;
    document.getElementById('f-away-logo').value = m.team_away_logo || '';
    document.getElementById('f-competition').value = m.competition;
    document.getElementById('f-stadium').value = m.stadium || '';
    document.getElementById('f-status').value = m.status;
    document.getElementById('f-score-home').value = m.score_home;
    document.getElementById('f-score-away').value = m.score_away;
    document.getElementById('f-minute').value = m.minute || 0;
    document.getElementById('f-stream-url').value = m.stream_url || '';
    document.getElementById('f-seo-description').value = m.seo_description || '';

    // Convert datetime to local datetime-local format
    const dt = new Date(m.start_time);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    document.getElementById('f-start-time').value = dt.toISOString().slice(0, 16);

    document.getElementById('match-form-title').textContent = t('admin.editMatchTitle');
    document.getElementById('submit-match-btn').textContent = t('admin.updateMatchBtn');
    showPanel('add-match', true);
  } catch (e) {
    showToast(t('admin.failedLoadMatch'), 'error');
  }
}

async function submitMatch() {
  const title = document.getElementById('f-title').value.trim();
  const team_home = document.getElementById('f-home').value.trim();
  const team_away = document.getElementById('f-away').value.trim();
  const start_time_raw = document.getElementById('f-start-time').value;

  if (!title || !team_home || !team_away || !start_time_raw) {
    showToast(t('admin.fillRequired'), 'error');
    return;
  }

  const payload = {
    title,
    team_home,
    team_home_logo: document.getElementById('f-home-logo').value.trim(),
    team_away,
    team_away_logo: document.getElementById('f-away-logo').value.trim(),
    competition: document.getElementById('f-competition').value.trim() || 'Football',
    stadium: document.getElementById('f-stadium').value.trim(),
    start_time: new Date(start_time_raw).toISOString(),
    status: document.getElementById('f-status').value,
    score_home: parseInt(document.getElementById('f-score-home').value) || 0,
    score_away: parseInt(document.getElementById('f-score-away').value) || 0,
    minute: parseInt(document.getElementById('f-minute').value) || 0,
    stream_url: document.getElementById('f-stream-url').value.trim(),
    seo_description: document.getElementById('f-seo-description').value.trim(),
  };

  const btn = document.getElementById('submit-match-btn');
  btn.textContent = t('admin.saving');
  btn.disabled = true;

  try {
    const url = editingMatchId ? `/api/matches/${editingMatchId}` : '/api/matches';
    const method = editingMatchId ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast(editingMatchId ? t('admin.matchUpdated') : t('admin.matchCreated'), 'success');
      editingMatchId = null;
      showPanel('matches');
    } else {
      const err = await res.json();
      showToast(err.error || t('admin.errorSaving'), 'error');
    }
  } catch (e) {
    showToast(t('admin.networkError'), 'error');
  } finally {
    btn.disabled = false;
  }
}

async function deleteMatch(id) {
  if (!confirm(t('admin.deleteConfirm'))) return;
  try {
    const res = await fetch(`/api/matches/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });
    if (res.ok) {
      showToast(t('admin.matchDeleted'), 'success');
      loadMatchesTable();
    }
  } catch (e) {
    showToast(t('admin.errorDeleting'), 'error');
  }
}

function resetForm() {
  editingMatchId = null;
  ['f-title','f-home','f-home-logo','f-away','f-away-logo','f-competition','f-stadium','f-stream-url','f-seo-description'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-status').value = 'upcoming';
  document.getElementById('f-score-home').value = 0;
  document.getElementById('f-score-away').value = 0;
  document.getElementById('f-minute').value = 0;
  document.getElementById('f-start-time').value = '';
}

// ─── Bans ─────────────────────────────────────────────────────────────────────
// Note: bans list requires a dedicated API endpoint; for now we use the POST ban endpoint
async function banUser() {
  const username = document.getElementById('ban-username').value.trim();
  const reason = document.getElementById('ban-reason').value.trim();
  if (!username) { showToast(t('admin.enterUsername'), 'error'); return; }

  try {
    const res = await fetch('/api/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
      body: JSON.stringify({ username, reason })
    });
    if (res.ok) {
      showToast(`${username} ${t('admin.userBanned')}`, 'success');
      document.getElementById('ban-username').value = '';
      document.getElementById('ban-reason').value = '';
      loadBansTable();
    }
  } catch (e) {
    showToast(t('admin.errorBanning'), 'error');
  }
}

async function unbanUser(username) {
  try {
    const res = await fetch(`/api/ban/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });
    if (res.ok) {
      showToast(`${username} ${t('admin.userUnbanned')}`, 'success');
      loadBansTable();
    }
  } catch (e) {
    showToast(t('admin.errorUnbanning'), 'error');
  }
}

async function loadBansTable() {
  const tbody = document.getElementById('ban-tbody');
  try {
    const res = await fetch('/api/bans', { headers: { 'x-admin-token': adminToken } });
    const bans = await res.json();
    if (!bans.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">' + t('admin.noBans') + '</td></tr>';
      return;
    }
    tbody.innerHTML = bans.map(b => `
      <tr>
        <td style="font-weight:600;">${b.username}</td>
        <td style="color:var(--text-muted);">${b.reason || '—'}</td>
        <td style="font-size:12px;color:var(--text-muted);">${new Date(b.banned_at).toLocaleString()}</td>
        <td><button class="tbl-btn edit" onclick="unbanUser('${b.username}')">${t('admin.unban')}</button></td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--red);padding:20px;">' + t('admin.errorLoadingBans') + '</td></tr>';
  }
}
