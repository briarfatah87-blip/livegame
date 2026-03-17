require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3009;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'livegame2024';

app.use(cors());
app.use(express.json());
app.get('/watch.html', (req, res) => {
  const matchId = req.query.id;
  const watchPath = path.join(__dirname, 'public', 'watch.html');

  if (!matchId) return res.sendFile(watchPath);

  try {
    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
    if (!match) return res.sendFile(watchPath);

    let html = fs.readFileSync(watchPath, 'utf8');

    const title = match.seo_description || `${match.team_home} vs ${match.team_away} - LiveGame ⚽`;
    const desc = match.seo_description || `Watch live ${match.team_home} vs ${match.team_away} stream with P2P technology and real-time live chat.`;

    // Inject meta tags into the HTML
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${desc}">`);
    
    // OG Tags
    html = html.replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${title}">`);
    html = html.replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${desc}">`);
    
    // Twitter Tags
    html = html.replace(/<meta property="twitter:title" content=".*?">/, `<meta property="twitter:title" content="${title}">`);
    html = html.replace(/<meta property="twitter:description" content=".*?">/, `<meta property="twitter:description" content="${desc}">`);

    res.send(html);
  } catch (err) {
    console.error('[SEO] Error injecting tags:', err);
    res.sendFile(watchPath);
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Explicit PWA routes to ensure correct serving
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

app.get('/js/pwa-register.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'js', 'pwa-register.js'));
});

// ─── Middleware: admin auth ───────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ─── REST API ─────────────────────────────────────────────────────────────────

// GET all matches
app.get('/api/matches', (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM matches ORDER BY start_time ASC';
  let matches;
  if (status) {
    matches = db.prepare('SELECT * FROM matches WHERE status = ? ORDER BY start_time ASC').all(status);
  } else {
    matches = db.prepare(query).all();
  }
  res.json(matches);
});

// GET single match
app.get('/api/matches/:id', (req, res) => {
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

// POST create match (admin)
app.post('/api/matches', requireAdmin, (req, res) => {
  const {
    title, team_home, team_home_logo, team_away, team_away_logo,
    stream_url = '', iframe_url = '', lineup = '', start_time, status = 'upcoming', competition = 'Football',
    competition_logo = '', stadium = '', score_home = 0, score_away = 0, minute = 0,
    seo_description = ''
  } = req.body;
  if (!title || !team_home || !team_away || !start_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const info = db.prepare(`
    INSERT INTO matches (title, team_home, team_home_logo, team_away, team_away_logo,
      stream_url, iframe_url, lineup, start_time, status, competition, competition_logo, stadium, score_home, score_away, minute, seo_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, team_home, team_home_logo, team_away, team_away_logo,
    stream_url, iframe_url, lineup, start_time, status, competition, competition_logo, stadium,
    score_home, score_away, minute, seo_description);
  res.json({ id: info.lastInsertRowid, message: 'Match created' });
});

// PATCH update match (admin)
app.patch('/api/matches/:id', requireAdmin, (req, res) => {
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  const {
    title, team_home, team_home_logo, team_away, team_away_logo,
    stream_url, iframe_url, lineup, start_time, status, competition, competition_logo, stadium,
    score_home, score_away, minute, seo_description
  } = req.body;
  db.prepare(`
    UPDATE matches SET
      title = COALESCE(?, title),
      team_home = COALESCE(?, team_home),
      team_home_logo = COALESCE(?, team_home_logo),
      team_away = COALESCE(?, team_away),
      team_away_logo = COALESCE(?, team_away_logo),
      stream_url = COALESCE(?, stream_url),
      iframe_url = COALESCE(?, iframe_url),
      lineup = COALESCE(?, lineup),
      start_time = COALESCE(?, start_time),
      status = COALESCE(?, status),
      competition = COALESCE(?, competition),
      competition_logo = COALESCE(?, competition_logo),
      stadium = COALESCE(?, stadium),
      score_home = COALESCE(?, score_home),
      score_away = COALESCE(?, score_away),
      minute = COALESCE(?, minute),
      seo_description = COALESCE(?, seo_description)
    WHERE id = ?
  `).run(title, team_home, team_home_logo, team_away, team_away_logo,
    stream_url, iframe_url, lineup, start_time, status, competition, competition_logo, stadium,
    score_home, score_away, minute, seo_description, req.params.id);

  // Broadcast match update to viewers
  io.to(`match-${req.params.id}`).emit('match_updated', db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id));
  res.json({ message: 'Match updated' });
});

// DELETE match (admin)
app.delete('/api/matches/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM matches WHERE id = ?').run(req.params.id);
  res.json({ message: 'Match deleted' });
});

// GET chat history for a match
app.get('/api/matches/:id/chat', (req, res) => {
  const messages = db.prepare(
    'SELECT * FROM chat_messages WHERE match_id = ? ORDER BY timestamp ASC LIMIT 100'
  ).all(req.params.id);
  res.json(messages);
});

// DELETE chat message (admin)
app.delete('/api/chat/:messageId', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM chat_messages WHERE id = ?').run(req.params.messageId);
  res.json({ message: 'Message deleted' });
});

// POST ban user (admin)
app.post('/api/ban', requireAdmin, (req, res) => {
  const { username, reason = '' } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    db.prepare('INSERT OR IGNORE INTO banned_users (username, reason) VALUES (?, ?)').run(username, reason);
    io.emit('user_banned', { username });
    res.json({ message: `User ${username} banned` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE unban user (admin)
app.delete('/api/ban/:username', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM banned_users WHERE username = ?').run(req.params.username);
  res.json({ message: 'User unbanned' });
});

// GET banned users list (admin)
app.get('/api/bans', requireAdmin, (req, res) => {
  const bans = db.prepare('SELECT * FROM banned_users ORDER BY banned_at DESC').all();
  res.json(bans);
});

// GET viewer counts
app.get('/api/viewers', (req, res) => {
  const rooms = io.sockets.adapter.rooms;
  const counts = {};
  rooms.forEach((sockets, roomName) => {
    if (roomName.startsWith('match-')) {
      const matchId = roomName.replace('match-', '');
      counts[matchId] = sockets.size;
    }
  });
  res.json(counts);
});

// GET news (public)
app.get('/api/news', (req, res) => {
  const parsedLimit = parseInt(req.query.limit, 10);
  let rows;

  if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
    const limit = Math.min(parsedLimit, 50);
    rows = db.prepare(
      'SELECT * FROM news WHERE is_published = 1 ORDER BY datetime(created_at) DESC LIMIT ?'
    ).all(limit);
  } else {
    rows = db.prepare(
      'SELECT * FROM news WHERE is_published = 1 ORDER BY datetime(created_at) DESC'
    ).all();
  }

  res.json(rows);
});

// GET single news item (public)
app.get('/api/news/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM news WHERE id = ? AND is_published = 1').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'News not found' });
  res.json(row);
});

// GET all news for admin
app.get('/api/admin/news', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM news ORDER BY datetime(created_at) DESC').all();
  res.json(rows);
});

// POST create news (admin)
app.post('/api/admin/news', requireAdmin, (req, res) => {
  const {
    title,
    summary = '',
    image_url = '',
    link_url = '',
    is_published = 1
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const info = db.prepare(`
    INSERT INTO news (title, summary, image_url, link_url, is_published, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(
    title.trim(),
    summary.trim(),
    image_url.trim(),
    link_url.trim(),
    is_published ? 1 : 0
  );

  res.json({ id: info.lastInsertRowid, message: 'News created' });
});

// PATCH update news (admin)
app.patch('/api/admin/news/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'News not found' });

  const {
    title,
    summary,
    image_url,
    link_url,
    is_published
  } = req.body;

  db.prepare(`
    UPDATE news SET
      title = COALESCE(?, title),
      summary = COALESCE(?, summary),
      image_url = COALESCE(?, image_url),
      link_url = COALESCE(?, link_url),
      is_published = COALESCE(?, is_published),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title?.trim(),
    summary?.trim(),
    image_url?.trim(),
    link_url?.trim(),
    typeof is_published === 'undefined' ? null : (is_published ? 1 : 0),
    req.params.id
  );

  res.json({ message: 'News updated' });
});

// DELETE news (admin)
app.delete('/api/admin/news/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ message: 'News deleted' });
});

// ─── Match News (short per-game news items) ───────────────────────────────────
// GET all news for a match (public)
app.get('/api/matches/:id/news', (req, res) => {
  const items = db.prepare('SELECT * FROM match_news WHERE match_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(items);
});

// POST add news to a match (admin)
app.post('/api/admin/matches/:id/news', requireAdmin, (req, res) => {
  const { title_en, title_ar } = req.body;
  if (!title_en && !title_ar) return res.status(400).json({ error: 'At least one title is required' });
  const info = db.prepare(
    'INSERT INTO match_news (match_id, title_en, title_ar) VALUES (?, ?, ?)'
  ).run(req.params.id, (title_en || '').trim(), (title_ar || '').trim());
  res.json({ id: info.lastInsertRowid, message: 'Match news added' });
});

// DELETE a match news item (admin)
app.delete('/api/admin/match-news/:newsId', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM match_news WHERE id = ?').run(req.params.newsId);
  res.json({ message: 'Match news deleted' });
});

// Admin verify token
app.post('/api/admin/verify', (req, res) => {
  const { token } = req.body;
  if (token === ADMIN_TOKEN) return res.json({ valid: true });
  res.status(401).json({ valid: false });
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#00ff88', '#ff6b6b', '#ffd93d', '#6bcbff', '#c77dff',
  '#ff8fa3', '#72efdd', '#f8961e', '#90e0ef', '#a8dadc'
];

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentUsername = null;
  let userColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  // Join a match room
  socket.on('join_match', ({ matchId, username }) => {
    // Check if banned
    const banned = db.prepare('SELECT * FROM banned_users WHERE username = ?').get(username);
    if (banned) {
      socket.emit('banned', { reason: banned.reason });
      return;
    }

    if (currentRoom) socket.leave(currentRoom);
    currentRoom = `match-${matchId}`;
    currentUsername = username;
    socket.join(currentRoom);

    // Send chat history
    const history = db.prepare(
      'SELECT * FROM chat_messages WHERE match_id = ? ORDER BY timestamp ASC LIMIT 100'
    ).all(matchId);
    socket.emit('chat_history', history);

    // Notify room of viewer count
    const viewerCount = io.sockets.adapter.rooms.get(currentRoom)?.size || 1;
    io.to(currentRoom).emit('viewer_count', viewerCount);
  });

  // Send chat message
  socket.on('send_message', ({ matchId, message }) => {
    if (!currentUsername || !message?.trim()) return;
    const trimmed = message.trim().slice(0, 300);

    // Check if banned
    const banned = db.prepare('SELECT * FROM banned_users WHERE username = ?').get(currentUsername);
    if (banned) {
      socket.emit('banned', { reason: banned.reason });
      return;
    }

    const info = db.prepare(
      'INSERT INTO chat_messages (match_id, username, message, avatar_color) VALUES (?, ?, ?, ?)'
    ).run(matchId, currentUsername, trimmed, userColor);

    const msg = {
      id: info.lastInsertRowid,
      match_id: matchId,
      username: currentUsername,
      message: trimmed,
      avatar_color: userColor,
      timestamp: new Date().toISOString()
    };

    io.to(`match-${matchId}`).emit('new_message', msg);
  });

  // Typing indicator
  socket.on('typing', ({ matchId }) => {
    socket.to(`match-${matchId}`).emit('user_typing', { username: currentUsername });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (currentRoom) {
      setTimeout(() => {
        const viewerCount = io.sockets.adapter.rooms.get(currentRoom)?.size || 0;
        io.to(currentRoom).emit('viewer_count', viewerCount);
      }, 500);
    }
  });
});

// ─── Automatic Status Updates ────────────────────────────────────────────────
function checkMatchStatuses() {
  try {
    const now = new Date().toISOString();
    // Find upcoming matches that should be live
    const pendingLive = db.prepare(`
      SELECT * FROM matches 
      WHERE status = 'upcoming' AND start_time <= ?
    `).all(now);

    if (pendingLive.length > 0) {
      console.log(`[AUTO-STATUS] Found ${pendingLive.length} matches to set LIVE`);
      
      const updateStmt = db.prepare("UPDATE matches SET status = 'live' WHERE id = ?");
      
      pendingLive.forEach(match => {
        updateStmt.run(match.id);
        console.log(`[AUTO-STATUS] Match ${match.id} (${match.team_home} vs ${match.team_away}) is now LIVE`);
        
        // Broadcast update to all clients
        io.emit('match_status_changed', {
          id: match.id,
          status: 'live',
          team_home: match.team_home,
          team_away: match.team_away
        });
      });
    }
  } catch (err) {
    console.error('[AUTO-STATUS] Error checking match statuses:', err);
  }
}

// Check every 30 seconds for more responsiveness
setInterval(checkMatchStatuses, 30000);

// ─── Start server ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n⚽ LiveGame server running at http://localhost:${PORT}\n`);
});
