(() => {
  'use strict';
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const themeColor = document.querySelector('[data-theme-color]');
  const metaTheme = { light: '#f7f7fc', dark: '#0d0c18' };
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('davonium-theme'); } catch (_) {}
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
  applyTheme(initialTheme);
  function applyTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = next;
    if (themeColor) themeColor.setAttribute('content', metaTheme[next]);
    themeButtons.forEach(button => {
      const darkNow = next === 'dark';
      button.setAttribute('aria-label', darkNow ? 'Switch to light mode' : 'Switch to dark mode');
      const label = button.querySelector('.theme-label');
      const icon = button.querySelector('.theme-icon');
      if (label) label.textContent = darkNow ? 'Light mode' : 'Dark mode';
      if (icon) icon.textContent = darkNow ? '☼' : '◐';
    });
  }
  themeButtons.forEach(button => button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('davonium-theme', next); } catch (_) {}
  }));

  const menu = document.querySelector('#primary-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  function closeMenu() {
    if (!menu || !menuToggle) return;
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }
  if (menu && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menu.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 850) closeMenu(); });
  }

  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });

  const revealItems = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducedMotion) {
    root.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -18px 0px' });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min((index % 4) * 55, 165)}ms`;
      observer.observe(item);
    });
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  // A few browsers keep the pre-theme frame for a moment; page is fully usable without JavaScript.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(error => console.info('Offline support unavailable in this context:', error)));
  }
})();
