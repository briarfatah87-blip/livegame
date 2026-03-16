(function() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  document.addEventListener('DOMContentLoaded', function() {
    const btns = document.querySelectorAll('.theme-toggle');
    
    function updateIcon(theme) {
      btns.forEach(btn => {
        const moon = btn.querySelector('.icon-moon');
        const sun = btn.querySelector('.icon-sun');
        if (moon && sun) {
          if (theme === 'dark') {
            moon.classList.remove('hidden');
            sun.classList.add('hidden');
          } else {
            moon.classList.add('hidden');
            sun.classList.remove('hidden');
          }
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
