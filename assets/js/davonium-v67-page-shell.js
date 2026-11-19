/* Davonium Technologies V67 - lightweight theme and responsive navigation shell. */
(function () {
  'use strict';
  var menu = document.getElementById('menu-toggle');
  var nav = document.getElementById('primary-nav');
  if (menu && nav) {
    menu.addEventListener('click', function () {
      var open = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!open));
      menu.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('open', !open);
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
    });
  }
  var theme = document.getElementById('theme-toggle');
  if (theme) theme.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.classList.toggle('light', next === 'light');
    try { localStorage.setItem('davonium-theme-choice', next); } catch (_) {}
  });
})();
