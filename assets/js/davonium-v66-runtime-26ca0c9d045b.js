
/* --- bundled from assets/js/theme-init.js --- */
;
/* Davonium theme preference bootstrap — external file for strict CSP compatibility. */
(function () {
  'use strict';
  try {
    var key = 'davonium-theme-choice';
    var choice = localStorage.getItem(key);
    if (choice !== 'light' && choice !== 'dark') {
      choice = 'dark';
      localStorage.setItem(key, choice);
    }
    document.documentElement.dataset.theme = choice;
    document.documentElement.classList.toggle('dark', choice === 'dark');
    document.documentElement.classList.toggle('light', choice === 'light');
  } catch (error) {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.classList.add('dark');
  }
}());


/* --- bundled from assets/js/davonium-v58-experience.js --- */
;
/* DAVONIUM TECHNOLOGIES V58 - accessible transitions, focused photo view, and DVNM Bot voice. */
(function () {
  'use strict';
  if (window.__davoniumV58Ready) return;
  window.__davoniumV58Ready = true;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;
  var currentPage = (body && body.getAttribute('data-page')) || '';
  var demoSlugMap = {
    'demo-biz': 'biz',
    'demo-market': 'market',
    'demo-creative': 'creative',
    'demo-skills': 'skills',
    'demo-digital': 'digital'
  };

  function makeRouteCurtain() {
    if (document.querySelector('.v58-route-curtain')) return;
    var curtain = document.createElement('div');
    curtain.className = 'v58-route-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    var mark = document.createElement('div');
    mark.className = 'v58-route-curtain-mark';
    mark.textContent = 'D';
    curtain.appendChild(mark);
    document.body.appendChild(curtain);
  }

  function assignViewTransitionNames() {
    if (!('CSS' in window) || !CSS.supports || !CSS.supports('view-transition-name: none')) return;
    document.querySelectorAll('.dvnm-demo-card, .demo-card-art').forEach(function (card) {
      var link = card.matches('.demo-card-art') ? card : card.querySelector('.v58-demo-image-link');
      var image = card.matches('.demo-card-art') ? card.querySelector('img') : card.querySelector('.dvnm-demo-preview img');
      if (!link || !image) return;
      var href = link.getAttribute('href') || '';
      var slug = /business/.test(href) ? 'biz' : /shop/.test(href) ? 'market' : /portfolio/.test(href) ? 'creative' : /learning/.test(href) ? 'skills' : /technology/.test(href) ? 'digital' : '';
      if (slug) image.style.viewTransitionName = 'dvnm-' + slug;
    });
    var targetSlug = demoSlugMap[currentPage];
    if (targetSlug) {
      var heroImage = document.querySelector('.demo-hero-art img, .v57-digital-backdrop');
      if (heroImage) heroImage.style.viewTransitionName = 'dvnm-' + targetSlug;
    }
  }

  function enhanceDemoHeader() {
    if (!body || !body.classList.contains('demo-page') || body.classList.contains('demo-studio')) return;
    var brand = document.querySelector('.head .brand');
    if (!brand || document.querySelector('.v58-demo-back')) return;
    var back = document.createElement('a');
    back.className = 'v58-demo-back';
    back.href = './';
    back.setAttribute('aria-label', 'Return to the Davonium Demo Studio');
    back.innerHTML = '<span aria-hidden="true">&#8592;</span><span class="v58-back-label">Demo Studio</span>';
    brand.insertAdjacentElement('afterend', back);
  }

  function installRouteFallback() {
    var hasNativeCrossDoc = ('CSS' in window) && CSS.supports && CSS.supports('view-transition-name: none');
    if (hasNativeCrossDoc || reduceMotion) return;
    makeRouteCurtain();
    document.addEventListener('click', function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (anchor.hasAttribute('download') || anchor.target || anchor.hasAttribute('data-no-transition')) return;
      var raw = anchor.getAttribute('href') || '';
      if (!raw || raw.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
      var url;
      try { url = new URL(anchor.href, window.location.href); } catch (_) { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      var curtain = document.querySelector('.v58-route-curtain');
      if (curtain) curtain.classList.add('is-active');
      window.setTimeout(function () { window.location.assign(url.href); }, 190);
    });
  }

  function addImageLightbox() {
    var dialog = document.createElement('div');
    dialog.className = 'v58-lightbox';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Expanded image view');
    dialog.setAttribute('aria-hidden', 'true');
    var close = document.createElement('button');
    close.className = 'v58-lightbox-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close expanded image');
    close.textContent = '×';
    var figure = document.createElement('figure');
    var image = document.createElement('img');
    image.alt = '';
    var caption = document.createElement('figcaption');
    figure.appendChild(image);
    figure.appendChild(caption);
    dialog.appendChild(close);
    dialog.appendChild(figure);
    document.body.appendChild(dialog);

    var previousFocus = null;
    function shut() {
      dialog.classList.remove('is-open');
      dialog.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('v58-lightbox-open');
      if (previousFocus && previousFocus.focus) previousFocus.focus();
    }
    function show(source, captionText) {
      previousFocus = document.activeElement;
      image.src = source;
      image.alt = captionText || 'Expanded image';
      caption.textContent = captionText || '';
      dialog.setAttribute('aria-hidden', 'false');
      dialog.classList.add('is-open');
      document.body.classList.add('v58-lightbox-open');
      close.focus();
    }
    close.addEventListener('click', shut);
    dialog.addEventListener('click', function (event) { if (event.target === dialog) shut(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && dialog.classList.contains('is-open')) shut(); });
    document.addEventListener('click', function (event) {
      var button = event.target && event.target.closest ? event.target.closest('.v58-gallery-shot, .v57-demo-photo') : null;
      if (!button) return;
      if (button.matches('.v58-gallery-shot')) {
        var img = button.querySelector('img');
        if (!img) return;
        event.preventDefault();
        show(img.currentSrc || img.src, button.getAttribute('data-caption') || img.alt || 'Davonium visual');
      } else if (event.target && event.target.closest && event.target.closest('img')) {
        var photo = button.querySelector('img');
        if (!photo) return;
        event.preventDefault();
        show(photo.currentSrc || photo.src, photo.alt || 'Davonium project image');
      }
    });
  }

  function installBotVoice() {
    var button = document.getElementById('v58-bot-speak');
    var select = document.getElementById('v58-bot-voice');
    var status = document.getElementById('v58-bot-audio-status');
    if (!button || !status) return;
    var synth = window.speechSynthesis;
    var voices = [];
    var speaking = false;
    var utterance = null;
    var intro = 'Welcome to Davonium Technologies. Davonium engineers websites, mobile applications and software systems for organisations that require clarity, dependable delivery and lasting digital value. Explore the five digital experiences: DVNM Biz, DVNM Market, DVNM Creative, DVNM Skills and DVNM Digital. Each experience has its own design direction and purpose. The product pages show the current development status of Ready2Go Learning, Marvel Chat and Davonium Nexus. Use the website navigation to explore services, work and documentation, or contact Davonium Technologies through WhatsApp.';

    function allowedEnglish(v) {
      return /^en-(GB|US|AU|CA|NZ)(-|$)/i.test(v.lang || '');
    }
    function refreshVoices() {
      if (!synth || !select) return;
      voices = synth.getVoices ? synth.getVoices() : [];
      var eligible = voices.filter(allowedEnglish);
      var selected = select.value;
      while (select.options.length > 1) select.remove(1);
      eligible.forEach(function (voice) {
        var option = document.createElement('option');
        option.value = String(voices.indexOf(voice));
        option.textContent = voice.name + ' (' + voice.lang + ')';
        select.appendChild(option);
      });
      if (selected && Array.prototype.some.call(select.options, function (o) { return o.value === selected; })) select.value = selected;
      else select.value = 'auto';
    }
    function stop(message) {
      if (synth) { try { synth.cancel(); } catch (_) {} }
      if (window.DVNMV60Talk) window.DVNMV60Talk(false);
      speaking = false;
      button.textContent = '▶ Hear DVNM Bot introduction';
      button.setAttribute('aria-pressed', 'false');
      if (message) status.textContent = message;
    }
    function start() {
      if (!synth || !('SpeechSynthesisUtterance' in window)) {
        status.textContent = 'Spoken guidance is not supported by this browser. The written company information remains available.';
        return;
      }
      try {
        synth.cancel();
        utterance = new SpeechSynthesisUtterance(intro);
        var voice = null;
        if (select && select.value !== 'auto') voice = voices[Number(select.value)] || null;
        if (!voice) voice = voices.find(allowedEnglish) || null;
        if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
        else { utterance.lang = 'en-GB'; }
        utterance.rate = .96;
        utterance.pitch = 1.02;
        utterance.volume = 1;
        utterance.onstart = function () { speaking = true; if (window.DVNMV60Talk) window.DVNMV60Talk(true); button.textContent = '■ Stop speaking'; button.setAttribute('aria-pressed', 'true'); status.textContent = 'DVNM Bot is speaking. Select Stop speaking at any time.'; };
        utterance.onboundary = function (event) { if (window.DVNMV60Talk) window.DVNMV60Talk(true, Math.max(120, Math.min(280, ((event && event.charLength) || 3) * 34))); };
        utterance.onpause = function () { if (window.DVNMV60Talk) window.DVNMV60Talk(false); };
        utterance.onresume = function () { if (window.DVNMV60Talk) window.DVNMV60Talk(true); };
        utterance.onend = function () { stop('Introduction complete. The written information and links remain available.'); };
        utterance.onerror = function (event) {
          var reason = event && event.error ? String(event.error) : 'unavailable';
          stop('The browser voice could not start (' + reason + '). Check device media volume or install an English speech voice, then try again.');
        };
        status.textContent = 'Starting the DVNM Bot introduction…';
        synth.resume && synth.resume();
        synth.speak(utterance);
      } catch (_) {
        stop('The browser could not start speech. The written company information remains available.');
      }
    }
    button.addEventListener('click', function () {
      if (speaking || (synth && (synth.speaking || synth.pending))) stop('Voice stopped.');
      else start();
    });
    if (synth && synth.addEventListener) synth.addEventListener('voiceschanged', refreshVoices);
    else if (synth) synth.onvoiceschanged = refreshVoices;
    refreshVoices();
    window.addEventListener('pagehide', function () { if (synth && synth.speaking) synth.cancel(); });
  }

  function init() {
    enhanceDemoHeader();
    assignViewTransitionNames();
    addImageLightbox();
    installBotVoice();
    installRouteFallback();
    document.documentElement.classList.add('v58-ready');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();


/* --- bundled from assets/js/davonium-v59-experience.js --- */
;
/* DAVONIUM V59 - global floating DVNM Bot, matching the standing robot. No auto audio/popups. */
(function () {
  'use strict';
  if (window.__davoniumV59Init) return;
  window.__davoniumV59Init = true;
  var baseMeta = document.querySelector('meta[name="site-base"]');
  var base = baseMeta ? baseMeta.content : '.';
  var root = new URL((String(base).replace(/\/$/, '') || '.') + '/', location.href);
  var asset = function (path) { return new URL(path, root).href; };
  var path = location.pathname;
  function makeWA() {
    if (document.querySelector('.wa-float')) return;
    var a = document.createElement('a');
    a.className = 'wa-float'; a.href = 'https://wa.me/2347072604426?text=Hello%20Davonium%20Technologies';
    a.target = '_blank'; a.rel = 'noopener noreferrer'; a.title = 'Chat with Davonium Technologies on WhatsApp';
    a.setAttribute('aria-label', 'Chat with Davonium Technologies on WhatsApp');
    a.innerHTML = '<svg class="wa-icon" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 3C8.83 3 3 8.78 3 15.91c0 2.29.61 4.52 1.74 6.49L3.1 29l6.79-1.78a13.1 13.1 0 0 0 6.12 1.55h.01c7.19 0 13.03-5.78 13.03-12.91 0-3.46-1.36-6.71-3.83-9.15A13.02 13.02 0 0 0 16.04 3Zm.01 23.6h-.01a10.9 10.9 0 0 1-5.55-1.5l-.4-.24-4.03 1.06 1.08-3.9-.26-.4a10.65 10.65 0 0 1-1.64-5.7c0-5.9 4.85-10.7 10.81-10.7 2.89 0 5.61 1.11 7.65 3.13a10.57 10.57 0 0 1 3.17 7.57c0 5.9-4.85 10.7-10.82 10.7Zm5.94-8.02c-.32-.16-1.9-.93-2.2-1.04-.29-.1-.51-.16-.73.16-.21.32-.84 1.04-1.03 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.58-1.59-.95-.84-1.59-1.88-1.78-2.2-.19-.32-.02-.49.14-.65.14-.14.32-.38.49-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.74-1-2.39-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66s1.14 3.09 1.3 3.3c.16.21 2.24 3.39 5.43 4.76.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.9-.77 2.17-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.62-.38Z"/></svg>';
    document.body.appendChild(a);
  }
  function buildBot() {
    if (document.querySelector('.v59-bot-dock')) return;
    // Remove any cached/legacy generated assistant artwork; keep the company page's standing robot and its real head crop.
    document.querySelectorAll('#dvnm-bot-dock,.dvnm-bot-dock,#dvnm-bot-launcher,.dvnm-launcher,#dvnm-welcome-overlay,.dvnm-welcome-overlay').forEach(function (node) { node.remove(); });
    var dock = document.createElement('div'); dock.className = 'v59-bot-dock';
    dock.innerHTML = '<button class="v59-bot-trigger" type="button" aria-expanded="false" aria-controls="v59-bot-card" aria-label="Open DVNM Bot voice and help panel" title="Meet DVNM Bot"><img src="' + asset('assets/images/dvnm-bot-head-match-v57.webp') + '" alt="" width="420" height="420"></button>' +
      '<section class="v59-bot-card" id="v59-bot-card" role="dialog" aria-modal="false" aria-label="DVNM Bot company guide" aria-hidden="true" hidden>' +
      '<div class="v59-bot-card-head"><img src="' + asset('assets/images/dvnm-bot-head-match-v57.webp') + '" alt="" width="420" height="420"><div><strong>DVNM Bot</strong><small>Your Davonium Technologies guide</small></div><button class="v59-bot-close" type="button" aria-label="Close DVNM Bot">×</button></div>' +
      '<p class="v59-bot-copy">Welcome to Davonium Technologies. Explore the company, its services and products, visit five independent digital experiences, read documentation, or contact the team. The standing DVNM Bot shown on this website is the same character represented in this guide.</p>' +
      '<nav class="v59-bot-links" aria-label="DVNM Bot quick links"><a href="' + asset('services') + '">Explore services ↗</a><a href="' + asset('products') + '">View products ↗</a><a href="' + asset('demos/') + '">Open Demo Studio ↗</a><a href="' + asset('work') + '">Explore your work ↗</a></nav>' +
      '<div class="v59-bot-controls"><button class="btn v59-bot-speak" type="button" aria-pressed="false">▶ Hear DVNM Bot</button><label class="v59-bot-voice">Voice<select aria-label="Choose a speech voice"><option value="auto">Automatic English voice</option></select></label><p class="v59-bot-status" role="status" aria-live="polite" data-state="idle">Tap Hear DVNM Bot to listen. Audio starts only after you press the button.</p></div>' +
      '</section>';
    document.body.appendChild(dock);
    var trigger = dock.querySelector('.v59-bot-trigger');
    var card = dock.querySelector('.v59-bot-card');
    var close = dock.querySelector('.v59-bot-close');
    var speak = dock.querySelector('.v59-bot-speak');
    var select = dock.querySelector('select');
    var status = dock.querySelector('.v59-bot-status');
    var synth = window.speechSynthesis || null;
    var voices = [];
    var utterance = null;
    var speaking = false;
    var intro = 'Welcome to Davonium Technologies. We design and engineer websites, web applications, mobile experiences, software products, business systems and automation for people and organisations that value clear thinking, dependable delivery and lasting digital value. Explore DVNM Biz, DVNM Market, DVNM Creative, DVNM Skills and DVNM Digital in the Demo Studio. You can also explore our services, review Ready2Go Learning, Marvel Chat and Davonium Nexus, read the company documentation, or contact the team using the WhatsApp button.';
    function setOpen(open) {
      card.hidden = false;
      trigger.setAttribute('aria-expanded', String(open));
      card.setAttribute('aria-hidden', String(!open));
      card.classList.toggle('is-open', open);
      if (open) { window.setTimeout(function () { close.focus(); }, 80); }
      else { stop('DVNM Bot closed. The written website remains available.'); trigger.focus(); }
      if (!open) window.setTimeout(function () { card.hidden = true; }, 240);
    }
    function refreshVoices() {
      if (!synth || !select) return;
      voices = synth.getVoices ? synth.getVoices() : [];
      var prior = select.value;
      while (select.options.length > 1) select.remove(1);
      voices.forEach(function (voice, index) {
        if (!/^en([_-]|$)/i.test(voice.lang || '')) return;
        var option = document.createElement('option'); option.value = String(index); option.textContent = voice.name + ' (' + voice.lang + ')'; select.appendChild(option);
      });
      if ([].some.call(select.options, function (o) { return o.value === prior; })) select.value = prior;
      else select.value = 'auto';
    }
    function stop(message) {
      if (synth) { try { synth.cancel(); } catch (_) {} }
      speaking = false; utterance = null;
      speak.textContent = '▶ Hear DVNM Bot'; speak.setAttribute('aria-pressed', 'false'); status.dataset.state = 'idle';
      if (message) status.textContent = message;
    }
    function start() {
      if (!synth || !('SpeechSynthesisUtterance' in window)) { status.textContent = 'Speech is not supported by this browser. The written guide and links remain available.'; return; }
      try {
        synth.cancel(); utterance = new SpeechSynthesisUtterance(intro);
        var chosen = select.value !== 'auto' ? voices[Number(select.value)] : null;
        if (!chosen) chosen = voices.find(function (v) { return /^en([_-]|$)/i.test(v.lang || ''); }) || null;
        if (chosen) { utterance.voice = chosen; utterance.lang = chosen.lang; } else { utterance.lang = 'en-GB'; }
        utterance.rate = .96; utterance.pitch = 1.0; utterance.volume = 1;
        utterance.onstart = function () { speaking = true; speak.textContent = '■ Stop speaking'; speak.setAttribute('aria-pressed', 'true'); status.dataset.state = 'speaking'; status.textContent = 'DVNM Bot is speaking. Press Stop speaking at any time.'; };
        utterance.onend = function () { stop('Introduction complete. You can replay it whenever you need.'); };
        utterance.onerror = function (event) { var reason = event && event.error ? String(event.error) : 'unavailable'; stop('The device voice could not start (' + reason + '). Check media volume or available speech voices, then try again.'); };
        status.textContent = 'Starting the DVNM Bot introduction…'; synth.resume && synth.resume(); synth.speak(utterance);
      } catch (error) { stop('The browser could not start speech. The written guide remains available.'); }
    }
    trigger.addEventListener('click', function () { setOpen(card.hidden || card.getAttribute('aria-hidden') === 'true'); });
    close.addEventListener('click', function () { setOpen(false); });
    speak.addEventListener('click', function () { if (speaking || (synth && (synth.speaking || synth.pending))) stop('Voice stopped. Press Hear DVNM Bot to replay.'); else start(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && card.classList.contains('is-open')) setOpen(false); });
    document.addEventListener('click', function (event) { if (card.classList.contains('is-open') && !dock.contains(event.target)) setOpen(false); });
    if (synth && synth.addEventListener) synth.addEventListener('voiceschanged', refreshVoices);
    else if (synth) synth.onvoiceschanged = refreshVoices;
    refreshVoices();
    window.addEventListener('pagehide', function () { if (synth && synth.speaking) synth.cancel(); });
  }
  function init() { makeWA(); buildBot(); document.querySelectorAll('.v59-current-year').forEach(function (node) { node.textContent = String(new Date().getFullYear()); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
})();


/* --- bundled from assets/js/davonium-v60-experience.js --- */
;
/* DAVONIUM TECHNOLOGIES V60 — reliable navigation, theme fallback and DVNM Bot voice sync. */
(function () {
  'use strict';
  if (window.__davoniumV60Ready) return;
  window.__davoniumV60Ready = true;

  var root = document.documentElement;
  var safeStore = {
    get: function (key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };

  function applyTheme(value) {
    value = value === 'light' ? 'light' : 'dark';
    root.dataset.theme = value;
    root.classList.toggle('dark', value === 'dark');
    root.classList.toggle('light', value === 'light');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', value === 'dark' ? '#050b15' : '#f6f9fc');
    var button = document.getElementById('theme-toggle');
    if (button) {
      button.textContent = value === 'dark' ? '☼' : '☾';
      button.setAttribute('aria-label', 'Switch to ' + (value === 'dark' ? 'light' : 'dark') + ' theme');
      button.setAttribute('title', 'Currently ' + value + ' mode. Switch to ' + (value === 'dark' ? 'light' : 'dark') + ' mode.');
    }
  }

  function bindThemeFallback() {
    var button = document.getElementById('theme-toggle');
    var stored = safeStore.get('davonium-theme-choice');
    if (stored !== 'light' && stored !== 'dark') stored = 'dark';
    applyTheme(root.dataset.theme || stored);
    if (!button || button.dataset.v60ThemeBound === 'true') return;
    button.dataset.v60ThemeBound = 'true';
    button.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      safeStore.set('davonium-theme-choice', next);
      applyTheme(next);
    });
  }

  function bindMenuFallback() {
    var button = document.getElementById('menu-toggle');
    var nav = document.getElementById('primary-nav');
    if (!button || !nav || button.dataset.v60MenuBound === 'true') return;
    button.dataset.v60MenuBound = 'true';
    button.type = 'button';
    button.setAttribute('aria-controls', 'primary-nav');
    function setOpen(open) {
      nav.classList.toggle('open', !!open);
      button.setAttribute('aria-expanded', String(!!open));
      button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      button.textContent = open ? '×' : '☰';
      if (open) {
        nav.removeAttribute('hidden');
      }
    }
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(!nav.classList.contains('open'));
    });
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('click', function (event) {
      if (nav.classList.contains('open') && !nav.contains(event.target) && !button.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); button.focus(); }
    });
  }

  function makeWhatsApp() {
    if (document.querySelector('.wa-float')) return;
    var a = document.createElement('a');
    a.className = 'wa-float';
    a.href = 'https://wa.me/2347072604426?text=Hello%20Davonium%20Technologies';
    a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.title = 'Chat with Davonium Technologies on WhatsApp';
    a.setAttribute('aria-label', 'Chat with Davonium Technologies on WhatsApp');
    a.innerHTML = '<svg class="wa-icon" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 3C8.83 3 3 8.78 3 15.91c0 2.29.61 4.52 1.74 6.49L3.1 29l6.79-1.78a13.1 13.1 0 0 0 6.12 1.55h.01c7.19 0 13.03-5.78 13.03-12.91 0-3.46-1.36-6.71-3.83-9.15A13.02 13.02 0 0 0 16.04 3Z"/></svg>';
    document.body.appendChild(a);
  }

  function getBase() {
    var meta = document.querySelector('meta[name="site-base"]');
    var value = meta ? meta.content : '.';
    return new URL((String(value).replace(/\/$/, '') || '.') + '/', location.href);
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>\"']/g, function (character) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' })[character];
    });
  }

  function getPageSummary() {
    var main = document.querySelector('main');
    if (!main) return '';
    var heading = main.querySelector('h1');
    var lead = main.querySelector('.hero .lead, .demo-hero p, .pagehero p, .lead, .intro p, p');
    var title = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : document.title.split('|')[0].trim();
    var copy = lead ? lead.textContent.replace(/\s+/g, ' ').trim() : '';
    if (copy.length > 280) copy = copy.slice(0, 277).replace(/\s+\S*$/, '') + '…';
    return title ? 'You are viewing ' + title + '. ' + copy : copy;
  }

  function installBot() {
    // Upgrade the V59 dock in place with the same approved face and its V60 voice animation.
    var previousDock = document.querySelector('.v59-bot-dock');
    if (previousDock) previousDock.remove();
    var base = getBase();
    function asset(path) { return new URL(path, base).href; }
    var dock = document.createElement('div');
    dock.className = 'v59-bot-dock';
    var introSummary = escapeHTML(getPageSummary());
    dock.innerHTML =
      '<button class="v59-bot-trigger" type="button" aria-expanded="false" aria-controls="v59-bot-card" aria-label="Open DVNM Bot voice and help panel" title="Meet DVNM Bot">' +
        '<span class="v60-face-wrap"><img src="' + asset('assets/images/dvnm-bot-head-match-v57.webp') + '" alt="" width="420" height="420"><span class="v60-face-mouth" aria-hidden="true"></span></span>' +
      '</button>' +
      '<section class="v59-bot-card" id="v59-bot-card" role="dialog" aria-modal="false" aria-label="DVNM Bot company guide" aria-hidden="true" hidden>' +
        '<div class="v59-bot-card-head"><span class="v60-face-wrap"><img src="' + asset('assets/images/dvnm-bot-head-match-v57.webp') + '" alt="" width="420" height="420"><span class="v60-face-mouth" aria-hidden="true"></span></span><div><strong>DVNM Bot</strong><small>Your Davonium Technologies guide</small></div><button class="v59-bot-close" type="button" aria-label="Close DVNM Bot">×</button></div>' +
        '<p class="v59-bot-copy">' + (introSummary || 'Welcome to Davonium Technologies. Explore our company, services, products, five digital experiences and technical resources.') + ' Ask me to introduce the company, explain the products, or guide you to a section.</p>' +
        '<nav class="v59-bot-links" aria-label="DVNM Bot quick links"><a href="' + asset('about') + '">About Davonium ↗</a><a href="' + asset('services') + '">Explore services ↗</a><a href="' + asset('products') + '">View products ↗</a><a href="' + asset('demos/') + '">Open Demo Studio ↗</a><a href="' + asset('work') + '">Explore work ↗</a><a href="' + asset('docs/') + '">Read documentation ↗</a></nav>' +
        '<div class="v59-bot-controls"><button class="btn v59-bot-speak" type="button" aria-pressed="false">▶ Hear DVNM Bot</button><label class="v59-bot-voice">Voice<select aria-label="Choose a speech voice"><option value="auto">Automatic English voice</option></select></label><p class="v59-bot-status" role="status" aria-live="polite" data-state="idle">Tap Hear DVNM Bot to listen. Audio starts only after you press the button.</p></div>' +
      '</section>';
    document.body.appendChild(dock);

    var trigger = dock.querySelector('.v59-bot-trigger');
    var card = dock.querySelector('.v59-bot-card');
    var close = dock.querySelector('.v59-bot-close');
    var speak = dock.querySelector('.v59-bot-speak');
    var select = dock.querySelector('select');
    var status = dock.querySelector('.v59-bot-status');
    var synth = window.speechSynthesis || null;
    var voices = [];
    var utterance = null;
    var speaking = false;
    var mouthTimers = [];
    var fallbackTimer = null;
    var boundarySeen = false;
    var intro = 'Welcome to Davonium Technologies. We design and engineer websites, web applications, mobile applications, software products, business systems, integrations and useful digital experiences. Our approach combines clear design, dependable engineering, accessibility, thoughtful performance and transparent product development. Explore DVNM Biz, DVNM Market, DVNM Creative, DVNM Skills and DVNM Digital in the Demo Studio. You can also review Ready2Go Learning, Marvel Chat and Davonium Nexus, explore the services and company work, read the documentation, or contact the team using WhatsApp. ' + introSummary;

    function setRobotTalking(active) {
      dock.classList.toggle('is-speaking', !!active);
      Array.prototype.forEach.call(document.querySelectorAll('.v60-robot-image-host'), function (host) {
        host.classList.toggle('is-speaking', !!active);
      });
      Array.prototype.forEach.call(dock.querySelectorAll('.v60-face-wrap'), function (face) {
        face.classList.toggle('is-speaking', !!active);
      });
      if (!active) {
        Array.prototype.forEach.call(document.querySelectorAll('.v60-robot-mouth.is-open'), function (mouth) { mouth.classList.remove('is-open'); });
        Array.prototype.forEach.call(dock.querySelectorAll('.v60-face-mouth'), function (mouth) { mouth.classList.remove('is-open'); });
      }
    }
    function pulseMouth(duration) {
      duration = Math.max(110, Math.min(310, duration || 165));
      boundarySeen = true;
      if (fallbackTimer) { window.clearInterval(fallbackTimer); fallbackTimer = null; }
      Array.prototype.forEach.call(document.querySelectorAll('.v60-robot-mouth'), function (mouth) {
        mouth.classList.add('is-open');
        var old = mouth.__v60Timer;
        if (old) window.clearTimeout(old);
        mouth.__v60Timer = window.setTimeout(function () { mouth.classList.remove('is-open'); }, duration);
      });
      Array.prototype.forEach.call(dock.querySelectorAll('.v60-face-wrap'), function (face) {
        face.classList.add('is-talking');
        var mouth = face.querySelector('.v60-face-mouth');
        if (mouth) mouth.classList.add('is-open');
        var old = face.__v60Timer;
        if (old) window.clearTimeout(old);
        face.__v60Timer = window.setTimeout(function () {
          face.classList.remove('is-talking');
          if (mouth) mouth.classList.remove('is-open');
        }, duration);
      });
    }
    // Shared bridge for voice controls embedded in other sections of the website.
    // SpeechSynthesis word-boundary events drive the mouth overlay; chest glow follows active speech.
    window.DVNMV60Talk = function (active, duration) {
      setRobotTalking(!!active);
      if (active && duration) pulseMouth(duration);
    };

    function setOpen(open) {
      card.hidden = false;
      trigger.setAttribute('aria-expanded', String(open));
      card.setAttribute('aria-hidden', String(!open));
      card.classList.toggle('is-open', open);
      if (open) window.setTimeout(function () { close.focus(); }, 60);
      else { stopVoice('DVNM Bot closed. The written website remains available.'); trigger.focus(); window.setTimeout(function () { card.hidden = true; }, 240); }
    }
    function refreshVoices() {
      if (!synth || !select) return;
      voices = synth.getVoices ? synth.getVoices() : [];
      var previous = select.value;
      while (select.options.length > 1) select.remove(1);
      voices.forEach(function (voice, index) {
        if (!/^en([_-]|$)/i.test(voice.lang || '')) return;
        var option = document.createElement('option'); option.value = String(index);
        option.textContent = voice.name + ' (' + voice.lang + ')'; select.appendChild(option);
      });
      if (Array.prototype.some.call(select.options, function (option) { return option.value === previous; })) select.value = previous;
      else select.value = 'auto';
    }
    function clearMouthTimers() {
      mouthTimers.forEach(function (timer) { window.clearTimeout(timer); });
      mouthTimers = [];
      if (fallbackTimer) { window.clearInterval(fallbackTimer); fallbackTimer = null; }
    }
    function stopVoice(message) {
      if (synth) { try { synth.cancel(); } catch (_) {} }
      clearMouthTimers(); speaking = false; utterance = null;
      setRobotTalking(false);
      speak.textContent = '▶ Hear DVNM Bot'; speak.setAttribute('aria-pressed', 'false');
      status.dataset.state = 'idle';
      if (message) status.textContent = message;
    }
    function startVoice() {
      if (!synth || !('SpeechSynthesisUtterance' in window)) {
        status.textContent = 'Spoken guidance is not supported by this browser. The written guide and links remain available.';
        return;
      }
      try {
        synth.cancel(); clearMouthTimers(); boundarySeen = false;
        utterance = new SpeechSynthesisUtterance(intro);
        var chosen = select.value !== 'auto' ? voices[Number(select.value)] : null;
        if (!chosen) chosen = voices.find(function (voice) { return /^en([_-]|$)/i.test(voice.lang || ''); }) || null;
        if (chosen) { utterance.voice = chosen; utterance.lang = chosen.lang; } else utterance.lang = 'en-GB';
        utterance.rate = .95; utterance.pitch = 1.02; utterance.volume = 1;
        utterance.onstart = function () {
          speaking = true; setRobotTalking(true);
          speak.textContent = '■ Stop speaking'; speak.setAttribute('aria-pressed', 'true');
          status.dataset.state = 'speaking'; status.textContent = 'DVNM Bot is speaking. Its mouth and chest respond to the voice. Press Stop speaking at any time.';
          // Some browser voices omit boundary events; only then use a restrained fallback mouth rhythm.
          fallbackTimer = window.setTimeout(function () {
            if (speaking && !boundarySeen) {
              fallbackTimer = window.setInterval(function () { if (speaking && !boundarySeen) pulseMouth(170); }, 360);
            }
          }, 900);
        };
        utterance.onboundary = function (event) {
          if (!speaking) return;
          var count = event && event.charLength ? event.charLength : 3;
          pulseMouth(Math.max(120, Math.min(280, count * 34)));
        };
        utterance.onpause = function () { setRobotTalking(false); };
        utterance.onresume = function () { if (speaking) setRobotTalking(true); };
        utterance.onend = function () { stopVoice('Introduction complete. Ask DVNM Bot to replay it whenever you need.'); };
        utterance.onerror = function (event) {
          var reason = event && event.error ? String(event.error) : 'unavailable';
          stopVoice('The device voice could not start (' + reason + '). Check the media volume and available English voices, then try again.');
        };
        status.textContent = 'Starting the DVNM Bot introduction…';
        if (synth.resume) synth.resume();
        synth.speak(utterance);
      } catch (_) {
        stopVoice('The browser could not start speech. The written guide remains available.');
      }
    }

    trigger.addEventListener('click', function () { setOpen(card.hidden || card.getAttribute('aria-hidden') === 'true'); });
    close.addEventListener('click', function () { setOpen(false); });
    speak.addEventListener('click', function () {
      if (speaking || (synth && (synth.speaking || synth.pending))) stopVoice('Voice stopped. Press Hear DVNM Bot to replay.');
      else startVoice();
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && card.classList.contains('is-open')) setOpen(false); });
    document.addEventListener('click', function (event) { if (card.classList.contains('is-open') && !dock.contains(event.target)) setOpen(false); });
    if (synth && synth.addEventListener) synth.addEventListener('voiceschanged', refreshVoices);
    else if (synth) synth.onvoiceschanged = refreshVoices;
    refreshVoices();
    window.addEventListener('pagehide', function () { stopVoice(); });
    return dock;
  }

  function attachRobotOverlays() {
    var selectors = [
      'img.v55-robot-fullbody','img.v57-work-robot','img.v57-digital-robot','img.dvnm-robot-art-image',
      '.dvnm-head-feature-card img','img[src*="dvnm-bot-cutout.webp"]','img[src*="dvnm-bot-3d.webp"]'
    ].join(',');
    Array.prototype.forEach.call(document.querySelectorAll(selectors), function (img) {
      if (img.dataset.v60FaceAttached === 'true' || img.closest('.v59-bot-dock')) return;
      if (!img.parentElement) return;
      img.dataset.v60FaceAttached = 'true';
      var host = img.parentElement;
      host.classList.add('v60-robot-image-host');
      if (window.getComputedStyle(host).position === 'static') host.style.position = 'relative';
      var mouth = document.createElement('span'); mouth.className = 'v60-robot-mouth'; mouth.setAttribute('aria-hidden','true');
      host.appendChild(mouth);
      var isHead = img.closest('.dvnm-head-feature-card') || /head-match|bot-head/i.test(img.currentSrc || img.src || '');
      var chest = null;
      if (!isHead) { chest = document.createElement('span'); chest.className = 'v60-robot-chest'; chest.setAttribute('aria-hidden','true'); host.appendChild(chest); }
      function update() {
        if (!img.isConnected || !img.naturalWidth || !img.naturalHeight) return;
        var p = host.getBoundingClientRect(); var r = img.getBoundingClientRect();
        var scale = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight);
        var drawW = img.naturalWidth * scale; var drawH = img.naturalHeight * scale;
        var pos = (window.getComputedStyle(img).objectPosition || '50% 50%').toLowerCase();
        var xFactor = pos.indexOf('left') >= 0 ? 0 : (pos.indexOf('right') >= 0 ? 1 : .5);
        var yFactor = pos.indexOf('top') >= 0 ? 0 : (pos.indexOf('bottom') >= 0 ? 1 : .5);
        var offX = (r.width - drawW) * xFactor; var offY = (r.height - drawH) * yFactor;
        var relLeft = r.left - p.left + offX; var relTop = r.top - p.top + offY;
        var faceX = isHead ? .505 : .512; var faceY = isHead ? .55 : .201;
        var mouthW = drawW * (isHead ? .15 : .078); var mouthH = Math.max(4, drawH * (isHead ? .035 : .0125));
        mouth.style.left = (relLeft + drawW * faceX) + 'px';
        mouth.style.top = (relTop + drawH * faceY) + 'px';
        mouth.style.setProperty('--v60-mouth-width', mouthW + 'px');
        mouth.style.setProperty('--v60-mouth-height', mouthH + 'px');
        mouth.style.setProperty('--v60-mouth-open', Math.max(7, mouthH * 1.55) + 'px');
        if (chest) {
          var chestX = relLeft + drawW * .555; var chestY = relTop + drawH * .355;
          chest.style.left = chestX + 'px'; chest.style.top = chestY + 'px';
          chest.style.setProperty('--v60-chest-size', Math.max(25,drawW * .115) + 'px');
        }
      }
      if (img.complete) update(); else img.addEventListener('load', update, { once:true });
      window.addEventListener('resize', update, { passive:true });
      if (window.ResizeObserver) { var observer = new ResizeObserver(update); observer.observe(img); observer.observe(host); }
    });
  }

  function init() {
    bindThemeFallback();
    bindMenuFallback();
    makeWhatsApp();
    installBot();
    attachRobotOverlays();
    document.querySelectorAll('.v59-current-year').forEach(function (node) { node.textContent = String(new Date().getFullYear()); });
    // Re-scan for lazy-loaded or progressively inserted character art.
    if (window.MutationObserver) {
      var observer = new MutationObserver(function (records) {
        if (records.some(function (record) { return record.addedNodes && record.addedNodes.length; })) attachRobotOverlays();
      });
      observer.observe(document.body, { childList:true, subtree:true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();


/* --- bundled from assets/js/davonium-v61-experience.js --- */
;
/* DAVONIUM TECHNOLOGIES V61 - starfield, motion transitions and accessible DVNM Bot voice controls. */
(function () {
  'use strict';
  if (window.__davoniumV61Ready) return;
  window.__davoniumV61Ready = true;

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }
  function storeGet(key, fallback) { try { var v = localStorage.getItem(key); return v == null ? fallback : v; } catch (_) { return fallback; } }
  function storeSet(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }

  function installStarfield() {
    if (!document.body || document.getElementById('v61-star-canvas')) return;
    var canvas = document.createElement('canvas');
    canvas.id = 'v61-star-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var stars = [];
    var width = 0, height = 0, dpr = 1, raf = 0, lastFrame = 0, lastTime = 0;
    var seed = 91427;
    function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    function resize() {
      width = Math.max(1, window.innerWidth || 1);
      height = Math.max(1, window.innerHeight || 1);
      dpr = Math.min(window.devicePixelRatio || 1, 1.55);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(520, Math.min(1450, Math.round(width * height / 1050)));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({ x: random() * width, y: random() * height, r: .62 + random() * 1.95,
          phase: random() * Math.PI * 2, speed: 1.2 + random() * 3.1,
          drift: 1.5 + random() * 6.8, glint: i % 8 === 0 || random() > .90 });
      }
      draw(0, true);
    }
    function themeColors() {
      return document.documentElement.dataset.theme === 'light'
        ? { main:'25,112,148', accent:'42,155,190', violet:'103,105,178' }
        : { main:'214,246,255', accent:'82,231,250', violet:'180,167,255' };
    }
    function draw(time, staticFrame) {
      if (!ctx) return;
      var c = themeColors();
      ctx.clearRect(0, 0, width, height);
      var seconds = (time || 0) * .001;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var twinkle = staticFrame || reduced ? .92 : .12 + (Math.sin(seconds * s.speed + s.phase) + 1) * .44;
        var y = (s.y - (staticFrame || reduced ? 0 : seconds * s.drift)) % height;
        var x = s.x + (staticFrame || reduced ? 0 : Math.sin(seconds * .18 + s.phase) * 7);
        if (y < 0) y += height;
        if (x < 0) x += width; else if (x > width) x -= width;
        var rgb = s.glint ? c.accent : (i % 9 === 0 ? c.violet : c.main);
        var alpha = (s.glint ? .43 : .25) + twinkle * (s.glint ? .56 : .68);
        ctx.shadowBlur = s.glint ? 16 : 6;
        ctx.shadowColor = 'rgba(' + rgb + ',' + (s.glint ? .78 : .38) + ')';
        ctx.fillStyle = 'rgba(' + rgb + ',' + Math.min(.98, alpha) + ')';
        ctx.beginPath(); ctx.arc(x, y, s.r * (s.glint ? 1.08 : .84), 0, Math.PI * 2); ctx.fill();
        if (s.glint) {
          var reach = s.r * (3.0 + twinkle * 3.1);
          ctx.strokeStyle = 'rgba(' + rgb + ',' + Math.min(.88, alpha * .78) + ')';
          ctx.lineWidth = .72;
          ctx.beginPath(); ctx.moveTo(x - reach, y); ctx.lineTo(x + reach, y); ctx.moveTo(x, y - reach); ctx.lineTo(x, y + reach); ctx.stroke();
          if (twinkle > .78) {
            ctx.beginPath(); ctx.moveTo(x - reach * .54, y - reach * .54); ctx.lineTo(x + reach * .54, y + reach * .54); ctx.moveTo(x - reach * .54, y + reach * .54); ctx.lineTo(x + reach * .54, y - reach * .54); ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
      }
    }
    function loop(time) {
      raf = 0;
      if (document.hidden) return;
      if (time - lastFrame >= 30) { draw(time, false); lastFrame = time; lastTime = time; }
      raf = window.requestAnimationFrame(loop);
    }
    function start() { if (!reduced && !document.hidden && !raf) raf = window.requestAnimationFrame(loop); }
    function stop() { if (raf) window.cancelAnimationFrame(raf); raf = 0; }
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else { draw(lastTime, false); start(); } });
    if (window.matchMedia) {
      var themeObserver = new MutationObserver(function () { draw(lastTime, true); });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    resize(); start();
  }

  function installTransitions() {
    if (!document.body || document.getElementById('v61-page-transition')) return;
    var layer = document.createElement('div');
    layer.id = 'v61-page-transition';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      layer.classList.add('is-entering');
      window.setTimeout(function () { layer.classList.remove('is-entering'); }, 480);
    }
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!link || link.hasAttribute('download') || link.target && link.target !== '_self' || link.classList.contains('skip')) return;
      var raw = link.getAttribute('href') || '';
      if (!raw || raw.charAt(0) === '#' || /^(mailto:|tel:|javascript:|data:)/i.test(raw)) return;
      var url;
      try { url = new URL(raw, location.href); } catch (_) { return; }
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search && url.hash)) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      event.preventDefault();
      layer.classList.remove('is-entering'); layer.classList.add('is-leaving');
      window.setTimeout(function () { location.assign(url.href); }, 190);
    }, true);
  }

  var TOPICS = [
    { key:'company', label:'About Davonium', text:'Davonium Technologies designs and engineers useful digital products and services. The company focuses on websites, web applications, mobile experiences, software systems, product engineering and connected technology. The goal is clear digital experiences, dependable delivery and long-term value.', link:'about' },
    { key:'services', label:'Services', text:'Our services cover corporate websites and web applications, mobile applications, custom software and business systems, product engineering, user interface and experience design, cloud services, integrations, reporting, progressive web apps and technical documentation.', link:'services' },
    { key:'products', label:'Products', text:'Davonium has three named product initiatives. Ready2Go Learning is an educational and exam-practice product in development. Marvel Chat has an initial build with active development and refinement continuing. Davonium Nexus is a client project and delivery workspace in development. Product status is described honestly on the website.', link:'products' },
    { key:'studio', label:'Five demo experiences', text:'The Davonium Demo Studio contains five independent experiences. DVNM Biz demonstrates a business website. DVNM Market demonstrates digital commerce. DVNM Creative demonstrates a creative portfolio. DVNM Skills demonstrates digital learning. DVNM Digital presents a technology company and connected digital products. Each has its own visual identity and navigation.', link:'demos/' },
    { key:'work', label:'Our work', text:'The Work section documents Davonium product development, design decisions, capabilities and delivery process. It distinguishes real Davonium product work from illustrative demonstrations and does not invent client case studies or testimonials.', link:'work' },
    { key:'docs', label:'Documentation and support', text:'The documentation library provides guides on products, engineering, accessibility, privacy, performance, browser behaviour, installation and support. The Support page explains how to get help, and the Contact page provides a route to discuss a project.', link:'docs/' },
    { key:'contact', label:'Contact and support', text:'You can contact Davonium Technologies at support@davoniumtech.com or call +234 707 260 4426. For WhatsApp enquiries, use the WhatsApp button on the website. The Contact page explains how to share a project brief and start a conversation.', link:'contact' }
  ];

  function installBotEnhancements() {
    var dock = document.querySelector('.v59-bot-dock');
    if (!dock || dock.dataset.v61Enhanced === 'true') return;
    dock.dataset.v61Enhanced = 'true';
    var card = dock.querySelector('.v59-bot-card');
    var copy = dock.querySelector('.v59-bot-copy');
    var speak = dock.querySelector('.v59-bot-speak');
    var voiceSelect = dock.querySelector('.v59-bot-voice select');
    var status = dock.querySelector('.v59-bot-status');
    if (!card || !copy || !speak || !status) return;

    var topicGroup = document.createElement('div');
    topicGroup.className = 'v61-bot-topics';
    topicGroup.setAttribute('role', 'group');
    topicGroup.setAttribute('aria-label', 'Choose a Davonium topic to hear');
    TOPICS.forEach(function (topic) {
      var button = document.createElement('button');
      button.type = 'button'; button.className = 'v61-bot-topic'; button.textContent = topic.label;
      button.setAttribute('data-topic', topic.key); button.setAttribute('aria-pressed', 'false');
      topicGroup.appendChild(button);
    });
    copy.insertAdjacentElement('afterend', topicGroup);

    var controls = dock.querySelector('.v59-bot-controls');
    var audio = document.createElement('label');
    audio.className = 'v61-bot-audio';
    audio.innerHTML = '<span class="v61-volume-icon" aria-hidden="true">&#128266;</span><input type="range" min="0" max="1" step="0.05" value="0.85" aria-label="DVNM Bot speaking volume"><output aria-live="off">85%</output>';
    var volume = audio.querySelector('input');
    var volumeOutput = audio.querySelector('output');
    var savedVolume = Number(storeGet('davonium-bot-volume', '0.85'));
    if (!isFinite(savedVolume)) savedVolume = .85;
    savedVolume = Math.max(0, Math.min(1, savedVolume));
    volume.value = String(savedVolume); volumeOutput.textContent = Math.round(savedVolume * 100) + '%';
    if (controls) controls.insertBefore(audio, status);

    var synth = window.speechSynthesis || null;
    var voices = [];
    var activeUtterance = null;
    var isSpeaking = false;
    var fallbackStart = 0, fallbackPulse = 0;
    var boundarySeen = false;
    var activeTopic = null;
    var speechVersion = 0;
    var baseIntro = 'Welcome to Davonium Technologies. Digital products, engineered for impact. We design and build websites, mobile applications, software products and useful digital systems for organisations that value clear design, dependable engineering and lasting digital value. Choose a topic to learn about our company, services, products, five demo experiences, our work or documentation and support.';

    function talkState(active) {
      isSpeaking = !!active;
      dock.classList.toggle('is-speaking', isSpeaking);
      if (window.DVNMV60Talk) window.DVNMV60Talk(isSpeaking);
      Array.prototype.forEach.call(dock.querySelectorAll('.v60-face-wrap'), function (face) { face.classList.toggle('is-talking', isSpeaking); });
    }
    function pulseMouth(duration) {
      duration = Math.max(100, Math.min(320, duration || 175));
      var nodes = document.querySelectorAll('.v60-robot-mouth,.v60-face-mouth');
      Array.prototype.forEach.call(nodes, function (mouth) {
        mouth.classList.add('is-open');
        if (mouth.__v61PulseTimer) window.clearTimeout(mouth.__v61PulseTimer);
        mouth.__v61PulseTimer = window.setTimeout(function () { mouth.classList.remove('is-open'); }, duration);
      });
      Array.prototype.forEach.call(dock.querySelectorAll('.v60-face-wrap'), function (face) { face.classList.add('is-talking'); });
    }
    function clearTimers() {
      if (fallbackStart) { window.clearTimeout(fallbackStart); fallbackStart = 0; }
      if (fallbackPulse) { window.clearInterval(fallbackPulse); fallbackPulse = 0; }
    }
    function stopVoice(message) {
      speechVersion += 1;
      clearTimers();
      if (synth) { try { synth.cancel(); } catch (_) {} }
      activeUtterance = null; talkState(false);
      speak.textContent = 'Hear DVNM Bot'; speak.setAttribute('aria-pressed', 'false');
      if (status) { status.dataset.state = 'idle'; if (message) status.textContent = message; }
      Array.prototype.forEach.call(topicGroup.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-topic') === activeTopic ? 'true' : 'false'); });
    }
    function refreshVoices() {
      if (!synth || !voiceSelect) return;
      voices = synth.getVoices ? synth.getVoices() : [];
      var previous = voiceSelect.value;
      while (voiceSelect.options.length > 1) voiceSelect.remove(1);
      voices.forEach(function (voice, index) {
        if (!/^en([_-]|$)/i.test(voice.lang || '')) return;
        var option = document.createElement('option'); option.value = String(index); option.textContent = voice.name + ' (' + voice.lang + ')'; voiceSelect.appendChild(option);
      });
      if (Array.prototype.some.call(voiceSelect.options, function (o) { return o.value === previous; })) voiceSelect.value = previous;
      else voiceSelect.value = 'auto';
    }
    function speakText(text) {
      if (!synth || !('SpeechSynthesisUtterance' in window)) {
        status.textContent = 'This browser does not support spoken guidance. Use the written topic links instead.';
        return;
      }
      try {
        stopVoice();
        boundarySeen = false;
        activeUtterance = new SpeechSynthesisUtterance(text);
        var currentUtterance = activeUtterance;
        var currentVersion = speechVersion;
        var voice = voiceSelect && voiceSelect.value !== 'auto' ? voices[Number(voiceSelect.value)] : null;
        if (!voice) voice = voices.find(function (v) { return /^en([_-]|$)/i.test(v.lang || ''); }) || null;
        if (voice) { activeUtterance.voice = voice; activeUtterance.lang = voice.lang; }
        else activeUtterance.lang = 'en-GB';
        activeUtterance.rate = .94; activeUtterance.pitch = 1.02; activeUtterance.volume = Number(volume.value);
        activeUtterance.onstart = function () {
          if (currentVersion !== speechVersion || activeUtterance !== currentUtterance) return;
          talkState(true); speak.textContent = 'Stop speaking'; speak.setAttribute('aria-pressed', 'true');
          status.dataset.state = 'speaking'; status.textContent = 'DVNM Bot is speaking. Mouth movement follows speech events; chest light pulses while speaking.';
          fallbackStart = window.setTimeout(function () {
            if (isSpeaking && !boundarySeen && !fallbackPulse) fallbackPulse = window.setInterval(function () { if (isSpeaking && !boundarySeen) pulseMouth(170); }, 340);
          }, 850);
        };
        activeUtterance.onboundary = function (event) {
          if (!isSpeaking || currentVersion !== speechVersion || activeUtterance !== currentUtterance) return;
          boundarySeen = true;
          if (fallbackStart) { window.clearTimeout(fallbackStart); fallbackStart = 0; }
          if (fallbackPulse) { window.clearInterval(fallbackPulse); fallbackPulse = 0; }
          var chars = event && event.charLength ? event.charLength : 4;
          pulseMouth(Math.max(115, Math.min(280, chars * 30)));
        };
        activeUtterance.onpause = function () { if (currentVersion !== speechVersion || activeUtterance !== currentUtterance) return; clearTimers(); talkState(false); status.textContent = 'DVNM Bot speech paused.'; };
        activeUtterance.onresume = function () { if (currentVersion === speechVersion && activeUtterance === currentUtterance) talkState(true); };
        activeUtterance.onend = function () { if (currentVersion === speechVersion && activeUtterance === currentUtterance) stopVoice('Introduction complete. Choose another topic or replay the introduction.'); };
        activeUtterance.onerror = function () { if (currentVersion === speechVersion && activeUtterance === currentUtterance) stopVoice('The device voice could not start. Check the device sound and selected voice, then try again.'); };
        if (synth.resume) synth.resume();
        status.textContent = 'Starting DVNM Bot voice…';
        synth.speak(activeUtterance);
      } catch (_) { stopVoice('The browser could not start speech. Written guidance remains available.'); }
    }

    // Capture the existing button before V60's handler so there is a single, consistent speech controller.
    speak.addEventListener('click', function (event) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (isSpeaking || (synth && (synth.speaking || synth.pending))) { stopVoice('Voice stopped. Choose a topic or press Hear DVNM Bot to listen again.'); return; }
      activeTopic = null;
      Array.prototype.forEach.call(topicGroup.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', 'false'); });
      copy.textContent = baseIntro;
      speakText(baseIntro);
    }, true);
    topicGroup.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-topic]'); if (!button) return;
      var topic = TOPICS.find(function (item) { return item.key === button.getAttribute('data-topic'); }); if (!topic) return;
      activeTopic = topic.key;
      Array.prototype.forEach.call(topicGroup.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      copy.textContent = topic.text;
      speakText(topic.text);
    });
    volume.addEventListener('input', function () {
      var value = Math.max(0, Math.min(1, Number(volume.value) || 0));
      volumeOutput.textContent = Math.round(value * 100) + '%';
      storeSet('davonium-bot-volume', String(value));
      if (activeUtterance && isSpeaking) { try { activeUtterance.volume = value; } catch (_) {} }
    });
    if (synth && synth.addEventListener) synth.addEventListener('voiceschanged', refreshVoices);
    else if (synth) synth.onvoiceschanged = refreshVoices;
    refreshVoices();
    var closeButton = dock.querySelector('.v59-bot-close');
    if (closeButton) closeButton.addEventListener('click', function () { stopVoice('DVNM Bot closed. Open the Bot again whenever you need help.'); }, true);
    window.addEventListener('pagehide', function () { stopVoice(); });
    window.DVNMV61Bot = { stop: stopVoice, play: function (text) { speakText(String(text || baseIntro)); }, topics: TOPICS };
  }

  function addDemoReturnLinks() {
    var pages = ['business', 'shop', 'portfolio', 'learning', 'technology'];
    if (!/\/demos\/(business|shop|portfolio|learning|technology)(\.html)?\/?$/i.test(location.pathname)) return;
    var hero = document.querySelector('main .demo-hero');
    if (!hero || hero.querySelector('.v61-demo-back')) return;
    var back = document.createElement('div'); back.className = 'wrap v61-demo-back-wrap';
    back.innerHTML = '<a class="v61-demo-back" href="./"><span aria-hidden="true">&#8592;</span> Back to Demo Studio</a>';
    hero.insertBefore(back, hero.firstChild);
  }

  onReady(function () {
    installStarfield();
    installTransitions();
    installBotEnhancements();
    addDemoReturnLinks();
  });
})();


/* --- bundled from assets/js/davonium-v62-experience.js --- */
;
/* DAVONIUM TECHNOLOGIES V62 - page-aware DVNM Bot controls and shared header voice access. */
(function () {
  'use strict';
  if (window.__davoniumV62Ready) return;
  window.__davoniumV62Ready = true;

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function currentPageSummary() {
    var main = document.querySelector('main');
    if (!main) return 'Welcome to Davonium Technologies. Explore our company, services, products, work, five digital experiences and support resources.';
    var heading = main.querySelector('h1');
    var title = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : document.title.split('|')[0].trim();
    var selectors = [
      '.pagehero .lead', '.hero .lead', '.demo-hero .lead', '.demo-hero p',
      '.intro .lead', '.pagehero p', '.demo-hero-copy p', 'p'
    ];
    var paragraphs = [];
    selectors.some(function (selector) {
      var nodes = Array.prototype.slice.call(main.querySelectorAll(selector));
      paragraphs = nodes.map(function (node) { return node.textContent.replace(/\s+/g, ' ').trim(); })
        .filter(function (value) { return value.length > 45; });
      return paragraphs.length > 0;
    });
    var summary = (title ? 'You are viewing ' + title + '. ' : '') + paragraphs.slice(0, 3).join(' ');
    if (summary.length > 1150) summary = summary.slice(0, 1147).replace(/\s+\S*$/, '') + '...';
    return summary || 'Welcome to Davonium Technologies. Explore useful digital products, services and independent demo experiences.';
  }

  function absoluteSectionUrl(path) {
    path = String(path || '').replace(/^\/+/, '');
    try { return new URL(path || './', location.origin + '/').href; }
    catch (_) { return location.origin + '/' + path; }
  }

  function enhanceBot() {
    var dock = document.querySelector('.v59-bot-dock');
    if (!dock) return;
    var trigger = dock.querySelector('.v59-bot-trigger');
    var card = dock.querySelector('.v59-bot-card');
    var copy = dock.querySelector('.v59-bot-copy');
    var topicGroup = dock.querySelector('.v61-bot-topics');
    if (!trigger || !card || !copy || !topicGroup) return;

    var topics = window.DVNMV61Bot && Array.isArray(window.DVNMV61Bot.topics) ? window.DVNMV61Bot.topics : [];
    var currentButton = topicGroup.querySelector('[data-topic="v62-current-page"]');
    if (!currentButton) {
      currentButton = document.createElement('button');
      currentButton.type = 'button';
      currentButton.className = 'v61-bot-topic';
      currentButton.setAttribute('data-topic', 'v62-current-page');
      currentButton.setAttribute('aria-pressed', 'false');
      currentButton.textContent = 'Explain this page';
      topicGroup.appendChild(currentButton);
    }

    var openSection = dock.querySelector('.v62-bot-open-section');
    if (!openSection) {
      openSection = document.createElement('a');
      openSection.className = 'v62-bot-open-section';
      openSection.hidden = true;
      openSection.textContent = 'Open this section';
      openSection.setAttribute('aria-label', 'Open the selected Davonium section');
      topicGroup.insertAdjacentElement('afterend', openSection);
    }

    function showTopicLink(path, label) {
      openSection.href = absoluteSectionUrl(path);
      openSection.textContent = label || 'Open this section';
      openSection.hidden = false;
    }

    var pageTopicMap = {
      about:'company', services:'services', products:'products', work:'work',
      'demo-studio':'studio', 'demo-biz':'studio', 'demo-shop':'studio',
      'demo-portfolio':'studio', 'demo-learning':'studio', 'demo-technology':'studio',
      docs:'docs', documentation:'docs', contact:'contact', support:'contact'
    };
    topicGroup.addEventListener('click', function (event) {
      var button = event.target && event.target.closest ? event.target.closest('button[data-topic]') : null;
      if (!button) return;
      var key = button.getAttribute('data-topic');
      var currentPage = document.body.getAttribute('data-page') || '';
      // On a matching company page, make that topic explain the visible page rather than a generic summary.
      if (key !== 'v62-current-page' && pageTopicMap[currentPage] === key) {
        event.preventDefault(); event.stopImmediatePropagation();
        var matchingSummary = currentPageSummary();
        copy.textContent = matchingSummary;
        Array.prototype.forEach.call(topicGroup.querySelectorAll('button'), function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        showTopicLink(location.pathname.replace(/^\//, '') + location.hash, 'Open this page ↗');
        if (window.DVNMV61Bot && typeof window.DVNMV61Bot.play === 'function') window.DVNMV61Bot.play(matchingSummary);
        return;
      }
      if (key === 'v62-current-page') {
        var summary = currentPageSummary();
        copy.textContent = summary;
        Array.prototype.forEach.call(topicGroup.querySelectorAll('button'), function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        showTopicLink(location.pathname.replace(/^\//, '') + location.hash, 'Open this page ↗');
        if (window.DVNMV61Bot && typeof window.DVNMV61Bot.play === 'function') window.DVNMV61Bot.play(summary);
        return;
      }
      var topic = topics.find(function (item) { return item.key === key; });
      if (topic) showTopicLink(topic.link, 'Open ' + topic.label + ' ↗');
    }, true);

    // Tapping the existing approved Bot head opens its card and reads the current page.
    // Audio remains user-initiated; nothing speaks on page load.
    trigger.addEventListener('click', function () {
      window.setTimeout(function () {
        if (card.classList.contains('is-open') && window.DVNMV61Bot && typeof window.DVNMV61Bot.play === 'function') {
          window.DVNMV61Bot.play(currentPageSummary());
        }
      }, 320);
    });
  }

  function installHeaderVoiceShortcut() {
    var actions = document.querySelector('.head .actions');
    if (!actions || actions.querySelector('.v62-bot-audio-shortcut')) return;
    var theme = actions.querySelector('#theme-toggle, .icon');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'v62-bot-audio-shortcut';
    button.setAttribute('aria-label', 'Open DVNM Bot voice guide');
    button.setAttribute('title', 'Hear the DVNM Bot guide');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h3l5 4V6l-5 4H4Z"/><path d="M16 9.2a4 4 0 0 1 0 5.6"/><path d="M18.7 6.7a7.5 7.5 0 0 1 0 10.6"/></svg>';
    button.addEventListener('click', function () {
      var trigger = document.querySelector('.v59-bot-dock .v59-bot-trigger');
      var card = document.querySelector('.v59-bot-dock .v59-bot-card');
      if (!trigger || !card) return;
      if (card.classList.contains('is-open')) {
        if (window.DVNMV61Bot && typeof window.DVNMV61Bot.play === 'function') window.DVNMV61Bot.play(currentPageSummary());
      } else {
        trigger.click();
      }
    });
    if (theme) actions.insertBefore(button, theme);
    else actions.insertBefore(button, actions.firstChild);
  }

  function ensureDemoNavigation() {
    if (!document.body.classList.contains('demo-page')) return;
    var header = document.querySelector('body > header.head, body > header');
    if (header) {
      header.style.position = 'sticky';
      header.style.top = '0';
      header.style.zIndex = '30000';
    }
    var nav = document.querySelector('#primary-nav');
    var toggle = document.querySelector('#menu-toggle, .menu-toggle, [data-menu-toggle]');
    if (nav && toggle) {
      toggle.setAttribute('aria-controls', nav.id || 'primary-nav');
      if (!nav.id) nav.id = 'primary-nav';
    }
  }

  onReady(function () {
    enhanceBot();
    installHeaderVoiceShortcut();
    ensureDemoNavigation();
  });
})();
