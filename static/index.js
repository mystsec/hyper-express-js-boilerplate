window.onload = function() {
  initTheme();
}

function initTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('color-theme', 'dark');
  }
}