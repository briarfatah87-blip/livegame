(function() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  document.addEventListener('DOMContentLoaded', function() {
    const btns = document.querySelectorAll('.theme-toggle');
    
    function updateIcon(theme) {
      btns.forEach(btn => {
        // If it's a button with just text/emoji
        if (btn.tagName === 'BUTTON' && !btn.querySelector('.nav-icon')) {
            btn.textContent = theme === 'dark' ? '🌙' : '☀️';
        } 
        // If it's the bottom nav item with separate icon span
        const iconSpan = btn.querySelector('.nav-icon');
        if (iconSpan) {
            iconSpan.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
      });
    }
    updateIcon(saved);

    btns.forEach(btn => {
      btn.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateIcon(next);
      });
    });
  });
})();
