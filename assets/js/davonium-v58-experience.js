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
