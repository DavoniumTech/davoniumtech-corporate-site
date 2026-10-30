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
    a.href = 'https://wa.me/2348032076924?text=Hello%20Davonium%20Technologies';
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
        var faceX = isHead ? .505 : .555; var faceY = isHead ? .55 : .205;
        var mouthW = drawW * (isHead ? .15 : .095); var mouthH = Math.max(4, drawH * (isHead ? .035 : .016));
        mouth.style.left = (relLeft + drawW * faceX) + 'px';
        mouth.style.top = (relTop + drawH * faceY) + 'px';
        mouth.style.setProperty('--v60-mouth-width', mouthW + 'px');
        mouth.style.setProperty('--v60-mouth-height', mouthH + 'px');
        mouth.style.setProperty('--v60-mouth-open', Math.max(8, mouthH * 1.7) + 'px');
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
