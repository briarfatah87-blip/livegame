// chat.js — Socket.IO live chat for watch page

const chatParams = new URLSearchParams(window.location.search);
const chatMatchId = chatParams.get('id');

let socket = null;
let chatUsername = sessionStorage.getItem('chat_username') || null;
let typingTimeout = null;
let isAtBottom = true;

const EMOJIS = ['😂','😍','🔥','👏','⚽','🥅','🎉','💯','😤','😮','👀','❤️','🤙','💪','😢','🤣','👍','😱','🏆','⭐'];

// ─── Init ─────────────────────────────────────────────────────────────────────
function initChat() {
  if (!chatMatchId) return;

  buildEmojiPicker();

  if (chatUsername) {
    showChatInput();
    connectSocket();
  } else {
    document.getElementById('username-prompt').style.display = 'flex';
    document.getElementById('chat-input-main').style.display = 'none';
    document.getElementById('username-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') joinChat();
    });
  }
}

function joinChat() {
  const input = document.getElementById('username-input');
  const name = input.value.trim().replace(/[^a-zA-Z0-9_\u0600-\u06FF ]/g, '').slice(0, 20);
  if (!name) { input.focus(); input.style.borderColor = 'var(--red)'; return; }
  chatUsername = name;
  sessionStorage.setItem('chat_username', name);
  showChatInput();
  connectSocket();
}

function showChatInput() {
  document.getElementById('username-prompt').style.display = 'none';
  document.getElementById('chat-input-main').style.display = 'block';

  const msgInput = document.getElementById('message-input');
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  msgInput.addEventListener('input', onTyping);
}

// ─── Socket.IO ────────────────────────────────────────────────────────────────
function connectSocket() {
  socket = io();

  socket.on('connect', () => {
    socket.emit('join_match', { matchId: chatMatchId, username: chatUsername });
  });

  socket.on('chat_history', (messages) => {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    messages.forEach(m => appendMessage(m, false));
    scrollToBottom(true);
  });

  socket.on('new_message', (msg) => {
    appendMessage(msg, true);
    if (isAtBottom) scrollToBottom();
  });

  socket.on('viewer_count', (count) => {
    const label = count !== 1 ? t('chat.viewers') : t('chat.viewer');
    document.getElementById('viewer-count').textContent = `👁 ${count} ${label}`;
  });

  socket.on('user_typing', ({ username }) => {
    const el = document.getElementById('typing-indicator');
    el.textContent = `${username} ${t('chat.isTyping')}`;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => el.textContent = '', 2000);
  });

  socket.on('banned', ({ reason }) => {
    appendSystemMsg(t('chat.bannedShort') + (reason ? ' ' + reason : ''));
    document.getElementById('chat-input-main').style.display = 'none';
    const prompt = document.getElementById('username-prompt');
    prompt.innerHTML = `<p style="color:var(--red)">🚫 ${t('chat.banned')}</p>`;
    prompt.style.display = 'flex';
  });

  // Listen for match updates and re-dispatch as custom event for player.js
  socket.on('match_updated', (m) => {
    document.dispatchEvent(new CustomEvent('match_updated_event', { detail: m }));
    // Update score directly
    document.getElementById('score-home').textContent = m.score_home;
    document.getElementById('score-away').textContent = m.score_away;
    if (m.minute) document.getElementById('match-minute').textContent = m.minute;
  });

  socket.on('user_banned', ({ username }) => {
    if (username === chatUsername) {
      appendSystemMsg(t('chat.bannedShort'));
      document.getElementById('chat-input-main').style.display = 'none';
    }
  });

  socket.on('disconnect', () => {
    setTimeout(() => {
      if (socket) socket.connect();
    }, 3000);
  });
}

// ─── Message rendering ────────────────────────────────────────────────────────
function userInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

function formatMsgTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(msg, animate = true) {
  const container = document.getElementById('chat-messages');
  const el = document.createElement('div');
  el.className = 'chat-msg';
  el.dataset.msgId = msg.id;

  const color = msg.avatar_color || '#00e676';
  const isSelf = msg.username === chatUsername;

  el.innerHTML = `
    <div class="chat-avatar" style="background:${color};">${userInitials(msg.username)}</div>
    <div class="chat-msg-content">
      <div class="chat-msg-header">
        <span class="chat-msg-user" style="color:${color};">${escapeHtml(msg.username)}</span>
        <span class="chat-msg-time">${formatMsgTime(msg.timestamp)}</span>
      </div>
      <div class="chat-msg-text">${escapeHtml(msg.message)}</div>
    </div>
  `;

  if (!animate) el.style.animation = 'none';
  container.appendChild(el);
}

function appendSystemMsg(text) {
  const container = document.getElementById('chat-messages');
  const el = document.createElement('div');
  el.style.cssText = 'text-align:center;font-size:12px;color:var(--text-muted);padding:8px 16px;';
  el.textContent = text;
  container.appendChild(el);
  scrollToBottom();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Send ─────────────────────────────────────────────────────────────────────
function sendMessage() {
  if (!socket || !chatUsername) return;
  const input = document.getElementById('message-input');
  const msg = input.value.trim();
  if (!msg) return;
  socket.emit('send_message', { matchId: chatMatchId, message: msg });
  input.value = '';
  input.focus();
  closeEmoji();
}

function onTyping() {
  if (socket) socket.emit('typing', { matchId: chatMatchId });
}

// ─── Emoji ────────────────────────────────────────────────────────────────────
function buildEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-pick-btn';
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      const input = document.getElementById('message-input');
      input.value += emoji;
      input.focus();
    });
    picker.appendChild(btn);
  });
}

function toggleEmoji() {
  document.getElementById('emoji-picker').classList.toggle('open');
}

function closeEmoji() {
  document.getElementById('emoji-picker').classList.remove('open');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.emoji-wrap')) closeEmoji();
});

// ─── Scroll ───────────────────────────────────────────────────────────────────
function scrollToBottom(force = false) {
  const container = document.getElementById('chat-messages');
  if (force || isAtBottom) {
    container.scrollTop = container.scrollHeight;
  }
}

document.getElementById('chat-messages').addEventListener('scroll', () => {
  const el = document.getElementById('chat-messages');
  isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
});

initChat();
