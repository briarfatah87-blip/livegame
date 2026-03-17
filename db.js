const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'livegame.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    team_home TEXT NOT NULL,
    team_home_logo TEXT DEFAULT '',
    team_away TEXT NOT NULL,
    team_away_logo TEXT DEFAULT '',
    score_home INTEGER DEFAULT 0,
    score_away INTEGER DEFAULT 0,
    stream_url TEXT DEFAULT '',
    start_time TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming',
    competition TEXT DEFAULT 'Football',
    competition_logo TEXT DEFAULT '',
    stadium TEXT DEFAULT '',
    minute INTEGER DEFAULT 0,
    thumbnail TEXT DEFAULT '',
    seo_description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#00ff88',
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS banned_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    reason TEXT DEFAULT '',
    banned_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    link_url TEXT DEFAULT '',
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS match_news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    title_en TEXT NOT NULL DEFAULT '',
    title_ar TEXT NOT NULL DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
  );
`);

// Ensure seo_description column exists for existing databases
try {
  db.exec('ALTER TABLE matches ADD COLUMN seo_description TEXT DEFAULT ""');
} catch (e) {}
try {
  db.exec('ALTER TABLE matches ADD COLUMN iframe_url TEXT DEFAULT ""');
} catch (e) {}
try {
  db.exec('ALTER TABLE matches ADD COLUMN lineup TEXT DEFAULT ""');
} catch (e) {}

// Seed demo data only if matches table is empty
const count = db.prepare('SELECT COUNT(*) as c FROM matches').get();
if (count.c === 0) {
  const now = new Date();
  const insert = db.prepare(`
    INSERT INTO matches (title, team_home, team_home_logo, team_away, team_away_logo,
      score_home, score_away, stream_url, start_time, status, competition, stadium, minute)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Live match
  insert.run(
    'Premier League - Matchday 28',
    'Arsenal', 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    'Chelsea', 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    2, 1,
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    now.toISOString(),
    'live',
    'Premier League',
    'Emirates Stadium',
    67
  );

  // Another live match
  const now2 = new Date(now);
  insert.run(
    'La Liga - Matchday 26',
    'Real Madrid', 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    'FC Barcelona', 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    1, 1,
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    now2.toISOString(),
    'live',
    'La Liga',
    'Estadio Santiago Bernabéu',
    45
  );

  // Upcoming matches
  const upcoming1 = new Date(now);
  upcoming1.setHours(upcoming1.getHours() + 2);
  insert.run(
    'Champions League - Quarter Final',
    'Manchester City', 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    'Bayern Munich', 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
    0, 0,
    '',
    upcoming1.toISOString(),
    'upcoming',
    'Champions League',
    'Etihad Stadium',
    0
  );

  const upcoming2 = new Date(now);
  upcoming2.setHours(upcoming2.getHours() + 4);
  insert.run(
    'Serie A - Matchday 30',
    'AC Milan', 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
    'Juventus', 'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_icon_%28black%29.svg',
    0, 0,
    '',
    upcoming2.toISOString(),
    'upcoming',
    'Serie A',
    'San Siro',
    0
  );

  const upcoming3 = new Date(now);
  upcoming3.setDate(upcoming3.getDate() + 1);
  insert.run(
    'Bundesliga - Matchday 25',
    'Borussia Dortmund', 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
    'Bayer Leverkusen', 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg',
    0, 0,
    '',
    upcoming3.toISOString(),
    'upcoming',
    'Bundesliga',
    'Signal Iduna Park',
    0
  );

  // Finished
  const finished1 = new Date(now);
  finished1.setDate(finished1.getDate() - 1);
  insert.run(
    'Europa League - Round of 16',
    'Liverpool', 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    'Atletico Madrid', 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
    3, 2,
    '',
    finished1.toISOString(),
    'finished',
    'Europa League',
    'Anfield',
    90
  );

  console.log('[DB] Seeded 6 demo matches');
}

module.exports = db;
