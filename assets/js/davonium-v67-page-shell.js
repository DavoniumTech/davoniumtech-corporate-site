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


/* V69: site-wide consent loader and PWA registration */(function(){function inject(path,id){if(document.querySelector('[data-v69-loader="'+id+'"]'))return;var s=document.createElement("script");s.src=location.origin+path;s.async=true;s.dataset.v69Loader=id;document.head.appendChild(s);}function start(){inject("/assets/js/davonium-v69-cookie-consent.js","consent");if("serviceWorker"in navigator&&!location.pathname.startsWith("/admin"))navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(function(e){console.warn("PWA worker registration failed",e);});}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();})();