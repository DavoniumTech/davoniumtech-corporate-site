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
    a.className = 'wa-float'; a.href = 'https://wa.me/2348032076924?text=Hello%20Davonium%20Technologies';
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
