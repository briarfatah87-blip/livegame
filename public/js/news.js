(function () {
  window.currentNewsFontSize = 18;
  window.changeFontSize = function(stamp) {
    window.currentNewsFontSize += stamp * 2;
    if (window.currentNewsFontSize < 14) window.currentNewsFontSize = 14;
    if (window.currentNewsFontSize > 36) window.currentNewsFontSize = 36;
    const body = document.getElementById('news-detail-content');
    if (body) {
      body.style.fontSize = window.currentNewsFontSize + 'px';
    }
  };

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString([], {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  function nl2br(value) {
    return escapeHtml(value || '').replace(/\n/g, '<br>');
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  function renderListCard(item) {
    return `
      <a class="news-card" href="/news.html?id=${item.id}">
        <div class="news-image-wrap">
          ${item.image_url
            ? `<img src="${item.image_url}" alt="${escapeHtml(item.title)}" onerror="this.outerHTML='<div class=&quot;news-image-fallback&quot;>NEWS</div>'">`
            : '<div class="news-image-fallback">NEWS</div>'}
        </div>
        <div class="news-content">
          <div class="news-date">${formatDate(item.created_at)}</div>
          <h3 class="news-title">${escapeHtml(item.title)}</h3>
        </div>
      </a>
    `;
  }

  function renderDetail(item) {
    return `
      <div class="news-detail-card" dir="auto">
        <div class="news-detail-meta" dir="auto">${formatDate(item.created_at)}</div>
        <div class="news-font-controls">
          <button class="font-btn" onclick="window.changeFontSize(1)" title="${t('news.fontIncrease')}">+</button>
          <button class="font-btn" onclick="window.changeFontSize(-1)" title="${t('news.fontDecrease')}">-</button>
        </div>
        <h1 class="news-detail-title" dir="auto">${escapeHtml(item.title)}</h1>
        ${item.image_url ? `<div class="news-detail-image-wrap"><img src="${item.image_url}" alt="${escapeHtml(item.title)}"></div>` : ''}
        <div class="news-detail-body" id="news-detail-content" dir="auto">${nl2br(item.summary || '')}</div>
        ${item.link_url ? `<a class="btn btn-primary news-source-link" href="${item.link_url}" target="_blank" rel="noopener noreferrer" dir="auto">${t('news.openSource')}</a>` : ''}
      </div>
    `;
  }

  async function loadNewsList() {
    const grid = document.getElementById('news-page-grid');
    const empty = document.getElementById('news-page-empty');
    if (!grid || !empty) return;

    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to load news');
      const rows = await res.json();

      if (!rows.length) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
      }

      empty.style.display = 'none';
      grid.style.display = 'grid';
      grid.innerHTML = rows.map(renderListCard).join('');
    } catch (err) {
      showToast(t('admin.errorLoadingNews'), 'error');
    }
  }

  async function loadNewsDetail(id) {
    const detail = document.getElementById('news-detail');
    if (!detail) return;

    try {
      const res = await fetch(`/api/news/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('News not found');
      const item = await res.json();
      detail.innerHTML = renderDetail(item);
      document.title = `${item.title} - LiveGame`;
    } catch (err) {
      detail.innerHTML = `<div class="empty-state"><p>${t('news.notFound')}</p></div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const listHeader = document.getElementById('news-list-header');
    const listSection = document.getElementById('news-list-section');
    const detailSection = document.getElementById('news-detail-section');

    if (id) {
      if (listHeader) listHeader.style.display = 'none';
      if (listSection) listSection.style.display = 'none';
      if (detailSection) detailSection.style.display = 'block';
      loadNewsDetail(id);
    } else {
      if (detailSection) detailSection.style.display = 'none';
      loadNewsList();
    }
  });
})();