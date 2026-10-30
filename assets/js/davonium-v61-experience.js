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
      var count = Math.max(150, Math.min(360, Math.round(width * height / 4700)));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({ x: random() * width, y: random() * height, r: .58 + random() * 1.72,
          phase: random() * Math.PI * 2, speed: .78 + random() * 2.15,
          drift: .9 + random() * 4.1, glint: i % 9 === 0 || random() > .935 });
      }
      draw(0, true);
    }
    function themeColors() {
      return document.documentElement.dataset.theme === 'light'
        ? { main:'37,129,160', accent:'63,161,198', violet:'111,119,190' }
        : { main:'194,239,255', accent:'70,222,245', violet:'164,153,255' };
    }
    function draw(time, staticFrame) {
      if (!ctx) return;
      var c = themeColors();
      ctx.clearRect(0, 0, width, height);
      var seconds = (time || 0) * .001;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var twinkle = staticFrame || reduced ? .72 : .43 + (Math.sin(seconds * s.speed + s.phase) + 1) * .285;
        var y = (s.y - (staticFrame || reduced ? 0 : seconds * s.drift)) % height;
        if (y < 0) y += height;
        var rgb = s.glint ? c.accent : (i % 9 === 0 ? c.violet : c.main);
        var alpha = (s.glint ? .45 : .23) + twinkle * (s.glint ? .48 : .50);
        ctx.fillStyle = 'rgba(' + rgb + ',' + Math.min(.96, alpha) + ')';
        ctx.beginPath(); ctx.arc(s.x, y, s.r * (s.glint ? 1.02 : .82), 0, Math.PI * 2); ctx.fill();
        if (s.glint) {
          var reach = s.r * (2.8 + twinkle * 2.5);
          ctx.strokeStyle = 'rgba(' + rgb + ',' + Math.min(.72, alpha * .7) + ')';
          ctx.lineWidth = .65;
          ctx.beginPath(); ctx.moveTo(s.x - reach, y); ctx.lineTo(s.x + reach, y); ctx.moveTo(s.x, y - reach); ctx.lineTo(s.x, y + reach); ctx.stroke();
        }
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
    { key:'docs', label:'Documentation and support', text:'The documentation library provides guides on products, engineering, accessibility, privacy, performance, browser behaviour, installation and support. The Support page explains how to get help, and the Contact page provides a route to discuss a project.', link:'docs/' }
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
