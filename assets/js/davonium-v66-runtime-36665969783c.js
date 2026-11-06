
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


/* --- bundled from assets/js/site.js --- */
;
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const safeStore = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };

  // Copyright year stays current without changing any published copy.
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // V59: dark mode is the company-wide default on every device. A deliberate visitor choice is remembered.
  const theme = $('#theme-toggle');
  let themePreference = safeStore.get('davonium-theme-choice');
  if (!['light', 'dark'].includes(themePreference)) {
    themePreference = 'dark';
    safeStore.set('davonium-theme-choice', 'dark');
  }
  const renderTheme = () => {
    const value = themePreference;
    document.documentElement.dataset.theme = value;
    document.documentElement.classList.toggle('dark', value === 'dark');
    document.documentElement.classList.toggle('light', value === 'light');
    const themeColor = $('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', value === 'dark' ? '#050b15' : '#f5f8fb');
    if (theme) {
      const next = value === 'dark' ? 'light' : 'dark';
      theme.textContent = value === 'dark' ? '☀' : '☾';
      theme.setAttribute('aria-label', `Switch to ${next} theme`);
      theme.setAttribute('title', `Currently ${value} mode. Switch to ${next} mode.`);
    }
  };
  renderTheme();
  if (theme) theme.dataset.v60ThemeBound = 'true';
  if (theme) theme.addEventListener('click', () => {
    document.documentElement.classList.add('theme-transition');
    window.setTimeout(() => document.documentElement.classList.remove('theme-transition'), 360);
    themePreference = themePreference === 'dark' ? 'light' : 'dark';
    safeStore.set('davonium-theme-choice', themePreference);
    renderTheme();
  });
  window.addEventListener('storage', event => {
    if (event.key === 'davonium-theme-choice' && ['light', 'dark'].includes(event.newValue)) {
      themePreference = event.newValue;
      renderTheme();
    }
  });

  // Mobile menu: close after navigation, outside click, or Escape; keep the existing page links unchanged.
  const menu = $('#menu-toggle');
  const nav = $('#primary-nav');
  const closeMenu = () => {
    if (!menu || !nav) return;
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    menu.textContent = '☰';
  };
  if (menu && nav) {
    menu.dataset.v60MenuBound = 'true';
    menu.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      menu.textContent = open ? '×' : '☰';
    });
    $$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', event => {
      if (nav.classList.contains('open') && !nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1050) closeMenu(); }, { passive: true });
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  // Slim scroll progress line for long pages and documentation.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);
  let progressQueued = false;
  const updateProgress = () => {
    const root = document.documentElement;
    const available = Math.max(1, root.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / available))})`;
    progressQueued = false;
  };
  window.addEventListener('scroll', () => {
    if (!progressQueued) {
      progressQueued = true;
      (window.requestAnimationFrame || (fn => setTimeout(fn, 16)))(updateProgress);
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  // Gentle reveal-on-scroll. If reduced motion is requested, content stays fully visible.
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const lowPower = Boolean((connection && connection.saveData) || (Number(navigator.deviceMemory) > 0 && Number(navigator.deviceMemory) <= 2));
  if (!reduceMotion && !lowPower && 'IntersectionObserver' in window) {
    const selector = window.innerWidth <= 650
      ? '.hero-grid, .principles, .section-head, .card, .band, .pagehero .wrap'
      : '.hero-grid, .principles, .section-head, .card, .band, .quote, .notice, .steps .step, .pagehero .wrap, .prose > h2, .checks li';
    const revealTargets = $$(selector).slice(0, 54);
    if (revealTargets.length) {
      revealTargets.forEach((element, index) => {
        element.dataset.reveal = 'true';
        element.style.setProperty('--reveal-index', String(index % 4));
      });
      document.body.classList.add('motion-ready');
      const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            instance.unobserve(entry.target);
          }
        });
      }, { threshold: 0.04, rootMargin: '0px 0px -20px 0px' });
      revealTargets.forEach(element => observer.observe(element));
    }
  }

  // Install invitation: visible navigation affordance everywhere, with a polite recurring offer on key entry pages.
  let promptEvent = null;
  const dialog = $('#install-dialog');
  const installButton = $('#install-action');
  const status = $('#install-status');
  let lastFocus = null;
  const invitationKey = 'davonium-install-invitation-dismissed-at-v4';
  const installedKey = 'davonium-install-completed-v3';
  const invitationInterval = 3 * 24 * 60 * 60 * 1000;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const markInvitationDismissed = () => safeStore.set(invitationKey, String(Date.now()));
  const show = () => {
    if (!dialog || standalone() || safeStore.get(installedKey) === 'yes') return;
    lastFocus = document.activeElement;
    dialog.classList.add('open');
    document.body.classList.add('install-dialog-open');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => installButton && installButton.focus(), 25);
  };
  const hide = (recordDismissal = true) => {
    if (!dialog) return;
    dialog.classList.remove('open');
    document.body.classList.remove('install-dialog-open');
    document.body.style.overflow = '';
    if (recordDismissal) markInvitationDismissed();
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  };
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    promptEvent = event;
  });
  window.addEventListener('appinstalled', () => {
    promptEvent = null;
    safeStore.set(installedKey, 'yes');
    markInvitationDismissed();
    if (status) status.textContent = 'Davonium Technologies has been installed on this device.';
    hide(false);
  });
  const manualInstallHelp = () => {
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return 'To install on iPhone or iPad, open this site in Safari, tap Share, choose Add to Home Screen, then confirm.';
    }
    if (/Android/i.test(ua)) return 'Open the browser menu and choose Install app or Add to Home screen. Your browser may use a different label.';
    return 'In a compatible desktop browser, open the browser menu or address bar and choose Install page as app. The option varies by browser.';
  };
  async function runInstall(statusElement = status, button = installButton) {
    if (standalone()) {
      if (statusElement) statusElement.textContent = 'This website is already running in its installed app window.';
      return;
    }
    if (!promptEvent) {
      if (statusElement) statusElement.textContent = manualInstallHelp();
      return;
    }
    try {
      const event = promptEvent;
      promptEvent = null;
      await event.prompt();
      const choice = await event.userChoice;
      if (statusElement) statusElement.textContent = choice && choice.outcome === 'accepted'
        ? 'Installation was accepted by your browser.'
        : 'Installation was not completed. You can try again from the browser menu.';
      if (choice && choice.outcome === 'accepted') {
        if (button) button.textContent = 'Installation accepted';
        markInvitationDismissed();
      }
      if (dialog && dialog.classList.contains('open')) hide();
    } catch (_) {
      if (statusElement) statusElement.textContent = manualInstallHelp();
    }
  }
  if (installButton) installButton.addEventListener('click', () => runInstall());
  const pageInstall = $('#install-page-action');
  if (pageInstall) pageInstall.addEventListener('click', () => runInstall($('#install-page-status'), pageInstall));
  const close = $('#install-close');
  const continueButton = $('#install-continue');
  if (close) close.addEventListener('click', () => hide());
  if (continueButton) continueButton.addEventListener('click', () => hide());
  if (dialog) {
    dialog.addEventListener('click', event => { if (event.target === dialog) hide(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && dialog.classList.contains('open')) hide(); });
  }
  // The revised invitation is shown again for this release; dismissals are respected for three days.
  const page = document.body.dataset.page || '';
  const invitePage = false; // V45: install is opt-in; do not interrupt the visitor's first view.
  const dismissedAt = Number(safeStore.get(invitationKey) || 0);
  const invitationDue = !dismissedAt || (Date.now() - dismissedAt) >= invitationInterval;
  if (dialog && invitePage && invitationDue && !standalone() && safeStore.get(installedKey) !== 'yes') {
    window.setTimeout(() => {
      if ((!Number(safeStore.get(invitationKey) || 0) || Date.now() - Number(safeStore.get(invitationKey) || 0) >= invitationInterval)
          && !standalone() && safeStore.get(installedKey) !== 'yes') show();
    }, 2100);
  }

  // Keep keyboard users inside the dialog while it is open.
  if (dialog) dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !dialog.classList.contains('open')) return;
    const focusable = $$('button, a[href]', dialog).filter(el => !el.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  // Documentation search remains local, instant, and compatible with offline use.
  const search = $('#docs-search');
  const clear = $('#docs-clear');
  if (search) {
    const cards = $$('.doc-card');
    const groups = $$('.doc-group');
    const count = $('#docs-result-count');
    const filter = () => {
      const query = search.value.trim().toLowerCase();
      let matches = 0;
      cards.forEach(card => {
        const haystack = `${card.dataset.search || ''} ${card.textContent || ''}`.toLowerCase();
        const hit = !query || haystack.includes(query);
        card.classList.toggle('hidden', !hit);
        if (hit) matches++;
      });
      groups.forEach(group => group.classList.toggle('hidden', !$$('.doc-card:not(.hidden)', group).length));
      if (count) count.textContent = query ? `${matches} ${matches === 1 ? 'guide' : 'guides'} match “${search.value.trim()}”.` : `Browse all ${cards.length} published guides.`;
      let empty = $('#docs-empty');
      if (!matches) {
        if (!empty) {
          empty = document.createElement('div');
          empty.id = 'docs-empty';
          empty.className = 'empty';
          empty.textContent = 'No guides matched. Try a broader term or clear the search.';
          $('#docs-results')?.appendChild(empty);
        }
        empty?.classList.remove('hidden');
      } else if (empty) empty.classList.add('hidden');
    };
    search.addEventListener('input', filter);
    if (clear) clear.addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
    filter();
  }

  // Keep product-to-company navigation contextual when a visitor asks about Nexus.
  const contactTopic = $('#contact-topic');
  const requestedTopic = new URLSearchParams(location.search).get('topic');
  const topicMap = {
    nexus: 'Product question',
    'learning-product': 'Product question',
    website: 'Website project',
    'marketing-website': 'Website project',
    'online-store': 'Website project',
    'portfolio-website': 'Website project',
    'dvnm-bot': 'Website project',
    'website-demo-studio': 'Website project'
  };
  if (contactTopic && requestedTopic && topicMap[requestedTopic.toLowerCase()]) {
    contactTopic.value = topicMap[requestedTopic.toLowerCase()];
  }

  // Static contact form opens a prepared email; it never claims to submit a ticket server-side.
  const form = $('#contact-form');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const topic = String(data.get('topic') || 'Enquiry');
    const message = String(data.get('message') || '').trim();
    const subject = `Davonium Technologies enquiry: ${topic}`;
    const body = `Name: ${name}\nReply email: ${email}\nTopic: ${topic}\n\n${message}`;
    const feedback = $('#contact-status');
    if (feedback) feedback.textContent = 'Your email app should open with a prepared message. Review it and press Send there. If no app opens, email support@davoniumtech.com directly.';
    window.location.href = `mailto:support@davoniumtech.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  // One-tap contact action; uses the company's published WhatsApp number and does not replace the existing contact links.
  if (!$('.wa-float')) {
    const contact = document.createElement('a');
    contact.className = 'wa-float';
    contact.href = 'https://wa.me/2347072604426';
    contact.target = '_blank';
    contact.rel = 'noopener noreferrer';
    contact.setAttribute('aria-label', 'Talk to Davonium Technologies on WhatsApp at +234 707 260 4426');
    contact.title = 'Chat on WhatsApp'; contact.dataset.label = 'Chat on WhatsApp'; contact.innerHTML = '<svg class="wa-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.04 3C8.83 3 3 8.78 3 15.91c0 2.29.61 4.52 1.74 6.49L3.1 29l6.79-1.78a13.1 13.1 0 0 0 6.12 1.55h.01c7.19 0 13.03-5.78 13.03-12.91 0-3.46-1.36-6.71-3.83-9.15A13.02 13.02 0 0 0 16.04 3Zm.01 23.6h-.01a10.9 10.9 0 0 1-5.55-1.5l-.4-.24-4.03 1.06 1.08-3.9-.26-.4a10.65 10.65 0 0 1-1.64-5.7c0-5.9 4.85-10.7 10.81-10.7 2.89 0 5.61 1.11 7.65 3.13a10.57 10.57 0 0 1 3.17 7.57c0 5.9-4.85 10.7-10.82 10.7Zm5.94-8.02c-.32-.16-1.9-.93-2.2-1.04-.29-.1-.51-.16-.73.16-.21.32-.84 1.04-1.03 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.58-1.59-.95-.84-1.59-1.88-1.78-2.2-.19-.32-.02-.49.14-.65.14-.14.32-.38.49-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.74-1-2.39-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66s1.14 3.09 1.3 3.3c.16.21 2.24 3.39 5.43 4.76.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.9-.77 2.17-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.62-.38Z"/></svg><span class="wa-sr">Chat with Davonium Technologies on WhatsApp</span>';
    document.body.appendChild(contact);
  }


  // V57 remove legacy floating robot nodes from stale cached markup.
  document.querySelectorAll('#dvnm-bot-dock,.dvnm-bot-dock,#dvnm-bot-launcher,.dvnm-launcher,#dvnm-welcome-overlay,.dvnm-welcome-overlay').forEach(el => el.remove());

  // DVNM Bot: browser-native speech, explicit user activation, and simple site navigation.
  // No audio starts automatically and no visitor content is sent to an external service.
  const botBaseMeta = $('meta[name="site-base"]');
  const botBase = botBaseMeta ? botBaseMeta.content : '.';
  const botRoot = new URL(`${botBase.replace(/\/$/, '')}/`, location.href);
  const botUrl = (path) => new URL(path, botRoot).href;
  // DVNM Bot is represented by a clean, angular head-only mark in the assistant UI.
  // The full-body character is intentionally not repeated beside the WhatsApp control.
  const robotMarkup = (extra = '') => `<span class="dvnm-mini dvnm-bot-head-icon ${extra}" aria-hidden="true"><svg viewBox="0 0 96 96" focusable="false"><defs><linearGradient id="dvnm-shell-${extra.replace(/[^a-z0-9_-]/gi,'')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b8dce4"/></linearGradient></defs><ellipse cx="48" cy="84" rx="26" ry="4" fill="#23d8e7" opacity=".18"/><path class="bot-shell" d="M28 13Q31 8 38 8H58Q65 8 68 13L79 27 78 56Q77 68 66 75L56 81H40L30 75Q19 68 18 56L17 27Z" fill="url(#dvnm-shell-${extra.replace(/[^a-z0-9_-]/gi,'')})" stroke="#83b9c9" stroke-width="2.5" stroke-linejoin="round"/><path class="bot-visor" d="M25 31Q25 25 32 24H64Q71 25 71 31V49Q70 57 63 59H33Q26 57 25 49Z" fill="#092331" stroke="#267f96" stroke-width="2"/><circle class="bot-eye" cx="38" cy="40" r="4.5" fill="#57f8f0"/><circle class="bot-eye" cx="58" cy="40" r="4.5" fill="#57f8f0"/><path class="bot-mouth" d="M41 50Q48 54 55 50" fill="none" stroke="#55f7f0" stroke-width="2.6" stroke-linecap="round"/><path d="M33 67Q48 73 63 67" stroke="#69dfe8" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 79H60" stroke="#34dbe5" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="7" r="4" fill="#66fff4" stroke="#9cf9f8" stroke-width="1.5"/></svg></span>`;
  const botCssHref = botUrl('assets/css/dvnm-bot.css?v=51');
  if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === botCssHref)) {
    const botStylesheet = document.createElement('link'); botStylesheet.rel = 'stylesheet'; botStylesheet.href = botCssHref; document.head.appendChild(botStylesheet);
  }
  if (false && document.body && !$('#dvnm-bot-dock')) { // V57: remove the floating robot launcher and automatic mascot overlay.
    const dock = document.createElement('div');
    dock.className = 'dvnm-bot-dock'; dock.id = 'dvnm-bot-dock';
    dock.innerHTML = `<button class="dvnm-launcher" id="dvnm-bot-launcher" type="button" aria-expanded="false" aria-controls="dvnm-bot-panel" aria-label="Open DVNM Bot, the Davonium website guide">${robotMarkup('dvnm-launcher-head')}<span class="dvnm-launcher-label">DVNM Bot</span></button><section class="dvnm-panel" id="dvnm-bot-panel" role="dialog" aria-modal="false" aria-label="DVNM Bot website guide" hidden><header class="dvnm-panel-head">${robotMarkup('dvnm-panel-head-avatar')}<div><strong>DVNM Bot</strong><small>Your Davonium Technologies guide</small></div><button class="dvnm-panel-close" type="button" id="dvnm-bot-close" aria-label="Close DVNM Bot">×</button></header><div class="dvnm-panel-intro"><p id="dvnm-bot-greeting">Hi! I’m DVNM Bot, and I’m here to assist you. Choose a topic and I’ll guide you to the right place.</p></div><div class="dvnm-panel-label">What would you like to explore?</div><div class="dvnm-questions" role="group" aria-label="Questions for DVNM Bot"><button class="dvnm-question" type="button" data-dvnm-topic="company" aria-pressed="true">About Davonium</button><button class="dvnm-question" type="button" data-dvnm-topic="products" aria-pressed="false">Products and status</button><button class="dvnm-question" type="button" data-dvnm-topic="services" aria-pressed="false">Web and digital services</button><button class="dvnm-question" type="button" data-dvnm-topic="demos" aria-pressed="false">Five demo experiences</button><button class="dvnm-question" type="button" data-dvnm-topic="docs" aria-pressed="false">Documentation and offline use</button><button class="dvnm-question" type="button" data-dvnm-topic="contact" aria-pressed="false">Contact our team</button></div><div class="dvnm-answerbox"><p id="dvnm-bot-answer" aria-live="polite"></p><a class="dvnm-answer-link" id="dvnm-bot-link" href="${botUrl('about')}">Learn about the company →</a></div><details class="dvnm-voice-settings" id="dvnm-voice-settings"><summary>Voice and speaking settings</summary><div class="dvnm-voice-settings-inner"><label for="dvnm-bot-voice">DVNM Voice<select id="dvnm-bot-voice" disabled><option value="auto">DVNM Voice · automatic device support</option></select></label><label for="dvnm-bot-volume">Speech volume <output id="dvnm-bot-volume-value" for="dvnm-bot-volume">72%</output></label><input id="dvnm-bot-volume" type="range" min="0.10" max="1" step="0.05" value="0.72" aria-label="Speech volume"><label for="dvnm-bot-rate">Speaking pace <output id="dvnm-bot-rate-value" for="dvnm-bot-rate">0.90×</output></label><input id="dvnm-bot-rate" type="range" min="0.75" max="1.05" step="0.01" value="0.90" aria-label="Speaking pace"><p>Recommended DVNM Voice selects a compatible English voice when available. You may choose any other voice exposed by your browser or device. Options and naturalness vary by device.</p></div></details><div class="dvnm-panel-actions"><button class="btn" id="dvnm-bot-speak" type="button" aria-pressed="false">▶ Hear this answer</button></div><p class="dvnm-voice-status" id="dvnm-bot-status" aria-live="polite">Your written answer is always available. Press Hear this answer when you want spoken output.</p></section>`;
    document.body.appendChild(dock);
    const panel = $('#dvnm-bot-panel', dock), launcher = $('#dvnm-bot-launcher', dock), closeBot = $('#dvnm-bot-close', dock);
    const answer = $('#dvnm-bot-answer', dock), answerLink = $('#dvnm-bot-link', dock), statusText = $('#dvnm-bot-status', dock);
    const speakBtn = $('#dvnm-bot-speak', dock);
    const voiceSelect = $('#dvnm-bot-voice', dock), volumeControl = $('#dvnm-bot-volume', dock), rateControl = $('#dvnm-bot-rate', dock);
    const volumeOutput = $('#dvnm-bot-volume-value', dock), rateOutput = $('#dvnm-bot-rate-value', dock);
    const topicText = (lines) => lines.join('\n');
    const topics = {
      company: { text: topicText([
        'Welcome to Davonium Technologies, a technology company building useful digital experiences.',
        'Davonium work brings together website engineering, software, applications, digital products, and clear documentation for organisations worldwide.',
        'We aim to make technology easier to understand, access, and use.',
        'We design responsive experiences for phones, tablets, laptops, and desktop screens.',
        'We care about accessibility, page speed, readable content, and useful navigation.',
        'Our public website explains the company, our service areas, and product development status.',
        'Our Demo Studio highlights five focused sample experiences built around real digital needs.',
        'Those samples show the kinds of experiences we can plan and build; they are not claimed client projects.',
        'Our documentation explains how features work and what is available today.',
        'Explore the company page to learn more about our approach and direction.'
      ]), link: 'about', label: 'Learn about Davonium Technologies →' },
      products: { text: topicText([
        'Davonium Technologies develops digital products for communication, learning, and work.',
        'Marvel Chat is our communication product and remains under active development and testing.',
        'Davonium Nexus is a developing workspace concept for clearer project coordination and handoffs.',
        'Ready2Go Learning is under development and is not presented as a public production launch.',
        'We publish the status of these products so visitors can understand what is available.',
        'A product page may explain the purpose and direction without implying every feature is released.',
        'Our team prioritises reliability, safety, understandable interfaces, and a practical first release.',
        'When a feature is a sample or under development, we label that status clearly.',
        'Visit the Products page for the current public descriptions and linked product guides.',
        'Please contact us for project questions instead of assuming an unreleased feature is live.'
      ]), link: 'products', label: 'Explore our products and status →' },
      services: { text: topicText([
        'We plan and build digital experiences for individuals, startups, established companies, enterprises, institutions, and teams.',
        'A project can include a clear homepage, service pages, contact journeys, and useful calls to action.',
        'We can design campaign landing pages that explain an offer and guide visitors to the next step.',
        'We also plan catalogue and shop experiences, while payment processing is scoped separately.',
        'Progressive web app work can include installability and selected offline access where appropriate.',
        'Technical SEO foundations include page titles, descriptions, canonical URLs, structured data, and sitemaps.',
        'We value readable documentation, accessibility, fast loading, and graceful error states.',
        'Each project begins with audience, goals, constraints, and a realistic release scope.',
        'Demo pages help start a conversation about layout and functionality without promising an identical final build.',
        'Open Services to see the service areas and contact us to discuss the right scope.'
      ]), link: 'services', label: 'Explore our services →' },
      demos: { text: topicText([
        'Our Demo Studio highlights five focused Davonium experiences. Older sample routes remain available for compatibility, but they are not promoted as core demos.',
        'DVNM Biz explores a business and service website that can be adapted for organisations of any size and in any market.',
        'DVNM Biz folds the strongest marketing and conversion patterns into a clear business website experience.',
        'DVNM Market demonstrates product discovery and a sample retail catalogue.',
        'DVNM Creative presents a portfolio for independent creators and technical professionals.',
        'DVNM Skills explores learning and practical skills-development content.',
        'DVNM Digital showcases the Davonium Technologies brand and digital service pathways.',
        'DVNM Skills folds community, learning, and practical skills-sharing into one learning experience.',
        'Each sample has its own page and QR code so visitors can open it quickly on a phone.',
        'These are illustrative samples, not claims of commissioned client work or live production services.'
      ]), link: 'demos/', label: 'Explore the five primary demo experiences →' },
      docs: { text: topicText([
        'Our documentation is written by Davonium Technologies to help visitors understand our work.',
        'It covers company information, our product status, website delivery, and how to contact us.',
        'Engineering guides explain accessibility, security basics, performance, browser compatibility, and SEO.',
        'The DVNM Bot guide explains voice controls, curated answers, privacy, and device limitations.',
        'Demo Studio guides explain sample scope, QR codes, and the non-official showcase record.',
        'The website uses a service worker to cache selected pages and assets after they are available online.',
        'Some visited or pre-cached pages may remain available offline when the browser retains its cache.',
        'Offline access does not mean contact delivery, hosted services, voice synthesis, or every interaction works offline.',
        'Open the install page for help adding the site to a compatible device.',
        'Visit Documentation to search the guides and read the details at your own pace.'
      ]), link: 'docs/', label: 'Browse the documentation library →' },
      contact: { text: topicText([
        'We welcome enquiries about websites, digital products, product demonstrations, and technical project needs.',
        'Tell us what your organisation does and who the website or product is for.',
        'Share the main goal, the pages or features you need, and your preferred launch window.',
        'A budget range can help us discuss a realistic first release and priorities.',
        'You can point our team to a DVNM sample that resembles the direction you have in mind.',
        'We can then discuss how a real project would differ from that sample.',
        'Use the contact page to see the available ways to reach Davonium Technologies.',
        'For a contact form, the website prepares an email in your own email application.',
        'If that does not open, use the published support email or WhatsApp contact.',
        'Never send passwords, one-time verification codes, API keys, or other private credentials.'
      ]), link: 'contact', label: 'Contact Davonium Technologies →' }
    };
    const welcomeLines = [
      'Hi, I’m DVNM Bot, the Davonium Technologies website guide.',
      'I can introduce our company and explain the products and services we build.',
      'I can guide you through five sample experiences for business, commerce, creative work, learning, and digital products.',
      'You can explore documentation, check current product status, or contact our team whenever you are ready.'
    ];
    const welcomeIntroText = () => {
      const fieldName = String($('#dvnm-visitor-name')?.value || visitorName || '').trim().slice(0, 40);
      const lines = [...welcomeLines];
      lines[0] = fieldName
        ? `Hello, ${fieldName}. I’m DVNM Bot, the Davonium Technologies website guide.`
        : 'Hi, I’m DVNM Bot, the Davonium Technologies website guide.';
      return topicText(lines);
    };
    let visitorName = '';
    let selectedAnswer = topics.company.text;
    let selectedVoice = null;
    let selectedVoiceKey = safeStore.get('dvnm-voice-choice-v32') || 'auto';
    let availableVoices = [];
    const mouthPulseTimers = new WeakMap();
    const setSpeaking = (active) => {
      document.querySelectorAll('.dvnm-character, .dvnm-robot-art, .dvnm-hero-robot, .dvnm-launcher').forEach(character => character.classList.toggle('is-speaking', active));
      window.dispatchEvent(new CustomEvent('dvnm:robot-speaking', { detail: { active: Boolean(active) } }));
      $$('.dvnm-css-bot').forEach(robot => {
        robot.classList.toggle('is-speaking', active);
        if (!active) {
          robot.classList.remove('has-speech-boundaries', 'is-mouth-pulsing');
          const timer = mouthPulseTimers.get(robot);
          if (timer) window.clearTimeout(timer);
          mouthPulseTimers.delete(robot);
          robot.style.removeProperty('--dvnm-mouth-aperture');
        }
      });
      if (panel) panel.classList.toggle('is-speaking', active);
      const welcomeOverlay = $('#dvnm-welcome-overlay');
      if (welcomeOverlay) welcomeOverlay.classList.toggle('is-speaking', active);
      document.body.classList.toggle('dvnm-voice-active', active);
      if (speakBtn) { speakBtn.textContent = active ? '■ Stop speaking' : '▶ Hear this answer'; speakBtn.setAttribute('aria-pressed', String(Boolean(active))); speakBtn.dataset.speaking = active ? 'yes' : 'no'; }
      const welcomeHearButton = $('#dvnm-welcome-hear');
      if (welcomeHearButton) { welcomeHearButton.textContent = active ? '■ Stop speaking' : '▶ Hear introduction'; welcomeHearButton.setAttribute('aria-pressed', String(Boolean(active))); }
    };
    // SpeechSynthesis exposes word-boundary events in many browsers, but not all.
    // Where available, pulse the mouth for each spoken word; CSS supplies a fast
    // continuous fallback on engines that do not expose boundary timing.
    const pulseRobotMouth = (event) => {
      const charLength = Math.max(1, Math.min(18, Number(event?.charLength) || 4));
      const aperture = Math.max(8, Math.min(48, 8 + charLength * 2.2));
      const duration = Math.max(74, Math.min(230, 48 + charLength * 17));
      window.dispatchEvent(new CustomEvent('dvnm:robot-mouth-pulse', { detail: { duration } }));
      $$('.dvnm-css-bot.is-speaking, .dvnm-reference-bot.is-speaking').forEach(robot => {
        robot.classList.add('has-speech-boundaries', 'is-mouth-pulsing');
        robot.style.setProperty('--dvnm-mouth-aperture', `${aperture}%`);
        const previousTimer = mouthPulseTimers.get(robot);
        if (previousTimer) window.clearTimeout(previousTimer);
        const timer = window.setTimeout(() => {
          robot.classList.remove('is-mouth-pulsing');
          mouthPulseTimers.delete(robot);
        }, duration);
        mouthPulseTimers.set(robot, timer);
      });
    };
    const speechEngine = () => ('speechSynthesis' in window ? window.speechSynthesis : null);
    const setVoiceStatus = (message) => {
      if (statusText) statusText.textContent = message;
      const welcomeStatus = $('#dvnm-welcome-status');
      if (welcomeStatus) welcomeStatus.textContent = message;
    };
    const refreshVoiceChoices = () => {
      const engine = speechEngine();
      if (!engine) {
        [voiceSelect, $('#dvnm-welcome-voice')].filter(Boolean).forEach(target => {
          target.replaceChildren();
          const option = document.createElement('option'); option.value = 'auto';
          option.textContent = 'Voice unavailable in this browser'; target.appendChild(option);
          target.disabled = true;
        });
        return;
      }
      const liveVoices = engine.getVoices?.() || [];
      if (liveVoices.length) availableVoices = liveVoices.slice();
      const voiceKey = (voice, index) => voice.voiceURI || `${voice.name}|${voice.lang}|${index}`;
      const englishRank = voice => /^en-NG$/i.test(voice.lang || '') ? 0 : /^en-GB/i.test(voice.lang || '') ? 1 : /^en-US/i.test(voice.lang || '') ? 2 : /^en/i.test(voice.lang || '') ? 3 : 4;
      const sortedVoices = availableVoices.filter(voice => !/^en-IN(?:-|$)/i.test(voice.lang || '') && !/^hi(?:-|$)/i.test(voice.lang || '') && !/\b(indian|hindi)\b/i.test(voice.name || '')).map((voice, index) => ({ voice, index, key: voiceKey(voice, index) }))
        .sort((a, b) => englishRank(a.voice) - englishRank(b.voice) || Number(b.voice.localService) - Number(a.voice.localService) || a.voice.name.localeCompare(b.voice.name));
      [voiceSelect, $('#dvnm-welcome-voice')].filter(Boolean).forEach(target => {
        const preferred = selectedVoiceKey || target.value || 'auto';
        target.replaceChildren();
        const automatic = document.createElement('option');
        automatic.value = 'auto';
        automatic.textContent = 'Recommended DVNM Voice';
        target.appendChild(automatic);
        const seen = new Set();
        sortedVoices.forEach(({ voice, key }) => {
          if (seen.has(key)) return;
          seen.add(key);
          const option = document.createElement('option');
          option.value = key;
          const language = voice.lang ? ` · ${voice.lang}` : '';
          const localLabel = voice.localService ? ' · on this device' : '';
          option.textContent = `${voice.name || 'Available voice'}${language}${localLabel}`;
          target.appendChild(option);
        });
        target.disabled = availableVoices.length === 0;
        target.value = [...target.options].some(option => option.value === preferred) ? preferred : 'auto';
        target.setAttribute('aria-label', 'Choose the voice used by DVNM Bot');
      });
      if (!([...((voiceSelect && voiceSelect.options) || [])].some(option => option.value === selectedVoiceKey))) selectedVoiceKey = 'auto';
    };
    const chooseVoice = () => {
      try {
        const voices = speechEngine()?.getVoices?.() || availableVoices;
        if (!voices.length) return null;
        // A previously saved preference must not bypass the current language exclusions.
        const isExcludedVoice = voice => /^en-IN(?:-|$)/i.test(voice.lang || '') || /^hi(?:-|$)/i.test(voice.lang || '') || /\b(indian|hindi)\b/i.test(voice.name || '');
        if (selectedVoiceKey !== 'auto') {
          const chosen = voices.find((voice, index) => (voice.voiceURI || `${voice.name}|${voice.lang}|${index}`) === selectedVoiceKey);
          if (chosen && !isExcludedVoice(chosen)) return chosen;
          selectedVoiceKey = 'auto';
          safeStore.set('dvnm-voice-choice-v32', 'auto');
        }
        // Exclude Indian-accent English and Hindi voices for the default guide; prefer natural English voices first.
        const eligible = voices.filter(voice => !isExcludedVoice(voice));
        const english = eligible.filter(voice => /^en(?:-|$)/i.test(voice.lang || ''));
        const pool = english.length ? english : eligible;
        const local = pool.filter(voice => voice.localService);
        const softer = voice => /samantha|ava|aria|jenny|sonia|serena|zira|victoria|susan|karen|hazel|emma|joanna|libby|tessa|moira|fiona/i.test(voice.name || '');
        const british = voice => /^en-GB/i.test(voice.lang || '');
        const american = voice => /^en-US/i.test(voice.lang || '');
        const nigerian = voice => /^en-NG/i.test(voice.lang || '');
        return local.find(softer) || local.find(british) || local.find(american) || local.find(nigerian)
          || pool.find(softer) || pool.find(british) || pool.find(american) || pool.find(nigerian) || local[0] || pool[0] || null;
      } catch (_) { return null; }
    };
    const clearSpeechTimers = () => {
      if (window.__dvnmVoiceStartTimer) window.clearTimeout(window.__dvnmVoiceStartTimer);
      if (window.__dvnmVoiceWatchdog) window.clearTimeout(window.__dvnmVoiceWatchdog);
      window.__dvnmVoiceStartTimer = 0; window.__dvnmVoiceWatchdog = 0;
    };
    let speechRun = 0;
    let intentionallyStopped = false;
    const stopSpeechOnly = () => {
      speechRun += 1; intentionallyStopped = true; clearSpeechTimers();
      const engine = speechEngine();
      if (engine && (engine.speaking || engine.pending)) { try { engine.cancel(); } catch (_) {} }
      setSpeaking(false); if (speakBtn) speakBtn.disabled = false;
    };
    const stopVoice = (message = 'Voice stopped.') => { stopSpeechOnly(); setVoiceStatus(message); };
    const showPanel = (open) => {
      panel.hidden = !open;
      panel.classList.toggle('is-open', open);
      dock.classList.toggle('is-open', open);
      launcher.setAttribute('aria-expanded', String(open));
      if (open) {
        panel.scrollTop = 0;
        const firstQuestion = $('.dvnm-question', dock);
        if (firstQuestion && matchMedia('(min-width: 701px)').matches) firstQuestion.focus({ preventScroll: true });
      } else {
        stopVoice('DVNM Bot closed. Voice stopped. Your written answer remains available.');
      }
    };
    launcher.addEventListener('click', () => showPanel(panel.hidden));
    // V34: close the assistant whenever the visitor taps/clicks outside its visible panel or launcher.
    // Capture-phase pointerdown dismisses the panel immediately while allowing the clicked page control to work.
    document.addEventListener('pointerdown', event => {
      if (panel.hidden) return;
      const target = event.target;
      if (panel.contains(target) || launcher.contains(target)) return;
      showPanel(false);
    }, true);
    closeBot.addEventListener('click', () => { showPanel(false); launcher.focus(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { showPanel(false); launcher.focus(); } });
    $$('[data-dvnm-topic]', dock).forEach(button => button.addEventListener('click', () => {
      const topic = topics[button.dataset.dvnmTopic]; if (!topic) return;
      selectedAnswer = topic.text; answer.textContent = topic.text; answerLink.href = botUrl(topic.link); answerLink.textContent = topic.label;
      $$('[data-dvnm-topic]', dock).forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      stopVoice('Answer selected. Press “Hear this answer” when you want to listen.');
    }));
    // Speak one short sentence/line per utterance. This is more resilient on mobile
    // speech engines that interrupt long multi-paragraph utterances.
    const splitSpeechText = (text) => {
      const lines = String(text || '').split(/\n+/).map(line => line.trim()).filter(Boolean);
      const chunks = [];
      for (const line of lines) {
        if (line.length <= 220) { chunks.push(line); continue; }
        let remaining = line;
        while (remaining.length > 220) {
          let cut = remaining.lastIndexOf(' ', 220);
          if (cut < 100) cut = 220;
          chunks.push(remaining.slice(0, cut).trim());
          remaining = remaining.slice(cut).trim();
        }
        if (remaining) chunks.push(remaining);
      }
      return chunks.length ? chunks : ['Hi, I’m DVNM Bot. I’m here to assist you.'];
    };
    const makeUtterance = (text, token, useSelectedVoice, chunks = [text], chunkIndex = 0) => {
      const engine = speechEngine();
      if (!engine || !('SpeechSynthesisUtterance' in window)) {
        setVoiceStatus('Spoken output is not supported by this browser. The full written answer and its link are ready to use.');
        speakBtn.disabled = false; return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = useSelectedVoice ? chooseVoice() : null;
      selectedVoice = voice;
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || (/^en(?:-|$)/i.test(navigator.language || '') ? navigator.language : 'en-GB');
      utterance.rate = Math.max(0.75, Math.min(1.05, Number(rateControl.value) || 0.90));
      utterance.pitch = 1.03;
      utterance.volume = Math.max(0.03, Math.min(1, Number(volumeControl.value) || 0.72));
      let started = false;
      utterance.onstart = () => {
        if (token !== speechRun) return;
        started = true; clearSpeechTimers(); speakBtn.disabled = false; setSpeaking(true);
        setVoiceStatus(`DVNM Bot is speaking${voice ? ` with ${voice.name}` : ' using your device’s default voice'}. Use the Stop speaking toggle at any time.`);
        // A few Android/iOS speech engines can emit onstart but never emit onend.
        // Give each short chunk enough time to finish, then recover once with the system voice.
        window.__dvnmVoiceWatchdog = window.setTimeout(() => {
          if (token !== speechRun) return;
          clearSpeechTimers();
          if (useSelectedVoice && voice) {
            try { engine.cancel(); } catch (_) {}
            const fallbackToken = ++speechRun; intentionallyStopped = false;
            setVoiceStatus('The selected voice stalled. Retrying with your device’s default voice…');
            window.__dvnmVoiceStartTimer = window.setTimeout(() => {
              if (fallbackToken === speechRun) makeUtterance(text, fallbackToken, false, chunks, chunkIndex);
            }, 160);
            return;
          }
          speechRun += 1;
          try { engine.cancel(); } catch (_) {}
          setSpeaking(false); speakBtn.disabled = false;
          setVoiceStatus('The device voice stopped responding. Tap Hear this answer to retry; the full written answer and link remain available.');
        }, Math.max(12000, Math.min(45000, text.length * 190 + 6500)));
      };
      utterance.onboundary = (event) => {
        if (token !== speechRun) return;
        setSpeaking(true);
        const boundaryName = String(event?.name || '').toLowerCase();
        // Use actual word boundaries where exposed. Sentence-only/unknown timing
        // events keep the rapid CSS fallback active instead of freezing the mouth.
        if (boundaryName === 'word' || (!boundaryName && Number(event?.charLength) > 0)) pulseRobotMouth(event);
      };
      utterance.onend = () => {
        if (token !== speechRun) return;
        clearSpeechTimers();
        if (chunkIndex + 1 < chunks.length) {
          // A tiny sentence-boundary pause makes the output easier to follow and
          // avoids asking mobile engines to process one very long synthesis job.
          window.__dvnmVoiceStartTimer = window.setTimeout(() => {
            if (token === speechRun) makeUtterance(chunks[chunkIndex + 1], token, useSelectedVoice, chunks, chunkIndex + 1);
          }, 90);
          return;
        }
        setSpeaking(false); speakBtn.disabled = false;
        setVoiceStatus('Introduction complete. Choose another question or follow the link above.');
      };
      utterance.onerror = (event) => {
        if (token !== speechRun) return;
        clearSpeechTimers(); setSpeaking(false); speakBtn.disabled = false;
        const reason = String(event?.error || '').toLowerCase();
        if (intentionallyStopped || reason === 'canceled') {
          setVoiceStatus('Voice stopped. Your written answer and link are still ready.'); return;
        }
        if (useSelectedVoice && voice) {
          setVoiceStatus('Trying the device’s default voice…'); speakBtn.disabled = true;
          const fallbackToken = ++speechRun; intentionallyStopped = false;
          window.__dvnmVoiceStartTimer = window.setTimeout(() => {
            if (fallbackToken !== speechRun) return;
            try { makeUtterance(text, fallbackToken, false, chunks, chunkIndex); }
            catch (_) { setVoiceStatus('Voice is unavailable on this device right now. The written answer and link still work.'); }
          }, 180);
          return;
        }
        setVoiceStatus('The device could not start speech. Check media volume or installed voice settings, then tap Hear this answer again. Your written answer and link still work.');
      };
      try {
        engine.resume?.(); engine.speak(utterance);
        window.__dvnmVoiceWatchdog = window.setTimeout(() => {
          if (token !== speechRun || started) return;
          clearSpeechTimers();
          if (useSelectedVoice && voice) {
            try { engine.cancel(); } catch (_) {}
            const fallbackToken = ++speechRun; intentionallyStopped = false;
            setVoiceStatus('Switching to your device’s default voice…');
            window.__dvnmVoiceStartTimer = window.setTimeout(() => {
              if (fallbackToken === speechRun) makeUtterance(text, fallbackToken, false, chunks, chunkIndex);
            }, 180);
            return;
          }
          speechRun += 1;
          try { engine.cancel(); } catch (_) {}
          setSpeaking(false); speakBtn.disabled = false;
          setVoiceStatus('The device did not start the voice in time. Tap Hear this answer to retry; the complete written answer is still ready.');
        }, 9000);
      } catch (_) {
        clearSpeechTimers(); speakBtn.disabled = false; setSpeaking(false);
        setVoiceStatus('The device could not start speech. Check the browser and device voice settings; your written answer and link remain available.');
      }
    };
    const startSpeaking = (text) => {
      const engine = speechEngine();
      if (!engine || !('SpeechSynthesisUtterance' in window)) {
        setVoiceStatus('Spoken output is not supported by this browser. The full written answer and link are ready to use.'); return;
      }
      if (speakBtn.disabled) return;
      clearSpeechTimers(); const token = ++speechRun; intentionallyStopped = false;
      const chunks = splitSpeechText(text);
      speakBtn.disabled = false; speakBtn.textContent = '■ Stop speaking'; speakBtn.dataset.speaking = 'yes'; speakBtn.setAttribute('aria-pressed', 'true'); setVoiceStatus('Starting the voice…');
      if (engine.speaking || engine.pending) {
        try { engine.cancel(); } catch (_) {}
        window.__dvnmVoiceStartTimer = window.setTimeout(() => { if (token === speechRun) makeUtterance(chunks[0], token, true, chunks, 0); }, 220);
      } else makeUtterance(chunks[0], token, true, chunks, 0);
    };
    speakBtn.addEventListener('click', () => { if (speakBtn.dataset.speaking === 'yes' || speechEngine()?.speaking || speechEngine()?.pending) stopVoice('Voice stopped. Your written answer remains available.'); else startSpeaking(selectedAnswer); });
    voiceSelect.addEventListener('change', () => { const value = voiceSelect.value || 'auto'; selectedVoiceKey = value; const welcomeVoice = $('#dvnm-welcome-voice'); if (welcomeVoice && [...welcomeVoice.options].some(option => option.value === value)) welcomeVoice.value = value; });
    const updateVolume = () => { volumeOutput.value = `${Math.round(Number(volumeControl.value) * 100)}%`; volumeOutput.textContent = volumeOutput.value; const welcomeOutput = $('#dvnm-welcome-volume-value'); const welcomeRange = $('#dvnm-welcome-volume'); if (welcomeOutput) welcomeOutput.textContent = volumeOutput.value; if (welcomeRange && welcomeRange.value !== volumeControl.value) welcomeRange.value = volumeControl.value; };
    const updateRate = () => { rateOutput.value = `${Number(rateControl.value).toFixed(2)}×`; rateOutput.textContent = rateOutput.value; const welcomeOutput = $('#dvnm-welcome-rate-value'); const welcomeRange = $('#dvnm-welcome-rate'); if (welcomeOutput) welcomeOutput.textContent = rateOutput.value; if (welcomeRange && welcomeRange.value !== rateControl.value) welcomeRange.value = rateControl.value; };
    volumeControl.addEventListener('input', updateVolume); rateControl.addEventListener('input', updateRate);
    updateVolume(); updateRate(); refreshVoiceChoices();
    if (speechEngine()) speechEngine().addEventListener?.('voiceschanged', refreshVoiceChoices);
    if (speechEngine()) speechEngine().onvoiceschanged = refreshVoiceChoices;

    // First-visit welcome: visible automatically, but audio is always visitor-initiated.
    const welcome = document.createElement('section');
    welcome.className = 'dvnm-welcome-overlay'; welcome.id = 'dvnm-welcome-overlay';
    welcome.hidden = true; welcome.setAttribute('role', 'dialog'); welcome.setAttribute('aria-modal', 'true'); welcome.setAttribute('aria-labelledby', 'dvnm-welcome-title');
    welcome.innerHTML = `<div class="dvnm-welcome-card dvnm-v46-welcome-card"><button type="button" class="dvnm-welcome-x" id="dvnm-welcome-x" aria-label="Close welcome">×</button><div class="dvnm-welcome-hero dvnm-v46-welcome-hero"><div class="dvnm-welcome-robot dvnm-v46-welcome-robot" data-dvnm-robot-host><canvas class="dvnm-robot-canvas" data-dvnm-robot data-robot-size="full" aria-hidden="true"></canvas><img class="dvnm-robot-fallback" src="${botUrl('assets/images/dvnm-robot-fallback-v46.svg')}" alt="DVNM Bot, a compact friendly guide with glowing cyan eyes and a luminous DVNM chest mark" width="520" height="640" decoding="async"></div><div class="dvnm-welcome-heading"><span class="dvnm-welcome-eyebrow"><span class="dvnm-live-dot"></span> YOUR DIGITAL GUIDE</span><h2 id="dvnm-welcome-title">Hi, I’m DVNM Bot.</h2><p class="dvnm-welcome-tagline">Useful technology, built with care.</p><p class="dvnm-welcome-subtitle" id="dvnm-welcome-subtitle">Welcome to Davonium Technologies. Let’s find what you came for.</p><label class="dvnm-name-label" for="dvnm-visitor-name">What may I call you? <span>Optional</span></label><input id="dvnm-visitor-name" class="dvnm-visitor-name" type="text" maxlength="40" autocomplete="given-name" placeholder="Your name (optional)"><p class="dvnm-welcome-privacy">Your name is used for this greeting only.</p></div></div><div class="dvnm-welcome-details dvnm-v46-welcome-details"><p class="dvnm-welcome-section-title">I can help you</p><ol class="dvnm-welcome-points"><li>Explore our company, products and digital services.</li><li>Preview five distinct website experiences.</li><li>Find documentation, product status and contact options.</li></ol></div><p class="dvnm-welcome-status" id="dvnm-welcome-status" aria-live="polite">Voice is off until you choose Hear introduction.</p><div class="dvnm-welcome-actions dvnm-v46-welcome-actions"><button type="button" class="btn" id="dvnm-welcome-continue">Meet DVNM Bot <span aria-hidden="true">↗</span></button><button type="button" class="btn alt" id="dvnm-welcome-hear" aria-pressed="false">▶ Hear introduction</button><button type="button" class="dvnm-welcome-skip" id="dvnm-welcome-skip">Skip and explore the website</button></div></div>`;
    document.body.appendChild(welcome);
    refreshVoiceChoices();
    const welcomeVoiceSelect = $('#dvnm-welcome-voice', welcome);
    const welcomeVolume = $('#dvnm-welcome-volume', welcome);
    const welcomeRate = $('#dvnm-welcome-rate', welcome);
    const welcomeVolumeOutput = $('#dvnm-welcome-volume-value', welcome);
    const welcomeRateOutput = $('#dvnm-welcome-rate-value', welcome);
    const syncVoiceSelection = (value) => {
      selectedVoiceKey = value || 'auto';
      safeStore.set('dvnm-voice-choice-v32', selectedVoiceKey);
      [voiceSelect, welcomeVoiceSelect].filter(Boolean).forEach(target => {
        if ([...target.options].some(option => option.value === selectedVoiceKey)) target.value = selectedVoiceKey;
      });
    };
    if (voiceSelect) voiceSelect.addEventListener('change', () => syncVoiceSelection(voiceSelect.value));
    if (welcomeVoiceSelect) welcomeVoiceSelect.addEventListener('change', () => syncVoiceSelection(welcomeVoiceSelect.value));
    if (welcomeVolume) welcomeVolume.addEventListener('input', () => { volumeControl.value = welcomeVolume.value; updateVolume(); });
    if (welcomeRate) welcomeRate.addEventListener('input', () => { rateControl.value = welcomeRate.value; updateRate(); });
    const nameField = $('#dvnm-visitor-name', welcome);
    const welcomeTitle = $('#dvnm-welcome-title', welcome);
    nameField.addEventListener('input', () => {
      visitorName = String(nameField.value || '').trim().slice(0, 40);
      if (welcomeTitle) welcomeTitle.textContent = visitorName ? `Hi, ${visitorName}! I’m DVNM Bot.` : 'Hi, I’m DVNM Bot.';
      const subtitle = $('#dvnm-welcome-subtitle', welcome);
      if (subtitle) subtitle.textContent = visitorName ? `Welcome to Davonium Technologies, ${visitorName}. Let’s find what you came for.` : 'Welcome to Davonium Technologies. Let’s find what you came for.';
    });
    const closeWelcome = (openAssistant = false) => {
      welcome.hidden = true; document.body.classList.remove('dvnm-welcome-visible');
      try { sessionStorage.setItem('dvnmWelcomeSeen_20261028_v48', '1'); } catch (_) {}
      stopVoice('Welcome closed. You can continue exploring the website.');
      if (openAssistant) {
        visitorName = String(nameField.value || '').trim().slice(0, 40);
        const greeting = $('#dvnm-bot-greeting', dock);
        if (greeting) greeting.textContent = visitorName ? `Welcome, ${visitorName}! I’m DVNM Bot, and I’m here to assist you. Choose any topic and I’ll guide you through Davonium Technologies.` : 'Welcome! I’m DVNM Bot, and I’m here to assist you. Choose any topic and I’ll guide you through Davonium Technologies.';
        const companyButton = $('[data-dvnm-topic="company"]', dock);
        if (companyButton) companyButton.click();
        showPanel(true);
      } else { const main = $('#main'); if (main) main.setAttribute('tabindex', '-1'); }
    };
    welcome.addEventListener('pointerdown', event => { if (event.target === welcome) closeWelcome(false); });
    $('#dvnm-welcome-continue', welcome).addEventListener('click', () => closeWelcome(true));
    $('#dvnm-welcome-skip', welcome).addEventListener('click', () => closeWelcome(false));
    $('#dvnm-welcome-x', welcome).addEventListener('click', () => closeWelcome(false));
    $('#dvnm-welcome-hear', welcome).addEventListener('click', () => {
      if ($('#dvnm-welcome-hear').getAttribute('aria-pressed') === 'true' || speechEngine()?.speaking || speechEngine()?.pending) { stopVoice('Voice stopped. You can keep reading or continue to the website.'); return; }
      setVoiceStatus('Playing the introduction you requested. Tap Stop speaking to end it.');
      startSpeaking(welcomeIntroText());
    });
    const welcomeRobot = $('.dvnm-welcome-robot', welcome);
    if (welcomeRobot) {
      welcomeRobot.setAttribute('role', 'button');
      welcomeRobot.setAttribute('tabindex', '0');
      welcomeRobot.setAttribute('aria-label', 'Tap DVNM Bot to hear the introduction');
      welcomeRobot.addEventListener('click', () => {
        if ($('#dvnm-welcome-hear').getAttribute('aria-pressed') === 'true' || speechEngine()?.speaking || speechEngine()?.pending) { stopVoice('Voice stopped.'); return; }
        setVoiceStatus('Playing the introduction you requested. Tap Stop speaking to end it.');
        startSpeaking(welcomeIntroText());
      });
      welcomeRobot.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if ($('#dvnm-welcome-hear').getAttribute('aria-pressed') === 'true' || speechEngine()?.speaking || speechEngine()?.pending) { stopVoice('Voice stopped.'); return; }
          setVoiceStatus('Playing the introduction you requested. Tap Stop speaking to end it.');
          startSpeaking(welcomeIntroText());
        }
      });
    }
    welcome.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closeWelcome(false); $('#dvnm-welcome-skip', welcome).focus(); }
      if (event.key === 'Tab') {
        const controls = $$('button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, a[href]', welcome).filter(el => !el.hidden && el.getClientRects().length > 0 && (!el.closest('details:not([open])') || el.matches('summary')));
        if (!controls.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    // A short first-visit greeting appears after the wordmark reveal on the homepage only.
    // It is session-scoped, easy to dismiss, and never starts audio automatically.
    const isHomePage = document.body.dataset.page === 'home' || location.pathname === '/' || /\/index\.html$/i.test(location.pathname) && !/\/(docs|demos)\//i.test(location.pathname);
    let welcomeAlreadySeen = false;
    try { welcomeAlreadySeen = sessionStorage.getItem('dvnmWelcomeSeen_20261028_v48') === '1'; } catch (_) {}
    if (false && isHomePage && !welcomeAlreadySeen) { // V59: no intrusive first-visit overlay; visitors open the DVNM Bot when ready.
      window.setTimeout(() => {
        if (!welcome.isConnected || welcomeAlreadySeen) return;
        welcome.hidden = false;
        document.body.classList.add('dvnm-welcome-visible');
        const title = $('#dvnm-welcome-title', welcome);
        if (title && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          const text = title.textContent; title.setAttribute('aria-label', text); title.replaceChildren();
          [...text].forEach((character, index) => { const span = document.createElement('span'); span.className = 'dvnm-v46-welcome-letter'; span.textContent = character; span.setAttribute('aria-hidden', 'true'); span.style.setProperty('--v46-delay', `${Math.min(index * 32, 850)}ms`); title.appendChild(span); });
        }
      }, 2250);
    }
  }

  // The large home-page welcome uses the same character; speaking still requires a click.
  const welcomeButton = $('#dvnm-welcome-speak');
  if (welcomeButton) welcomeButton.addEventListener('click', () => {
    const openBot = $('#dvnm-bot-launcher'); const panel = $('#dvnm-bot-panel');
    if (openBot && panel && panel.hidden) openBot.click();
    const companyQuestion = $('[data-dvnm-topic="company"]'); if (companyQuestion) companyQuestion.click();
    const speak = $('#dvnm-bot-speak'); if (speak) speak.click();
  });
  $$('[data-dvnm-open]').forEach(button => button.addEventListener('click', () => {
    const launcher = $('#dvnm-bot-launcher'); if (launcher) { if ($('#dvnm-bot-panel')?.hidden) launcher.click(); else $('#dvnm-bot-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  }));

  // Load only the small local loader now; Three.js itself is imported on demand when a robot canvas enters view.
  if (document.querySelector('[data-dvnm-robot]')) {
    const robotCssUrl = new URL(`${botBase.replace(/\/$/, '')}/assets/css/dvnm-robot-3d.css?v=51`, location.href).href;
    if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === robotCssUrl)) {
      const robotCss = document.createElement('link'); robotCss.rel = 'stylesheet'; robotCss.href = robotCssUrl; document.head.appendChild(robotCss);
    }
    if (!document.querySelector('script[data-dvnm3d-loader]')) {
      const robotScript = document.createElement('script'); robotScript.src = new URL(`${botBase.replace(/\/$/, '')}/assets/js/dvnm-robot-3d.js?v=51`, location.href).href; robotScript.async = true; robotScript.dataset.dvnm3dLoader = 'true'; document.head.appendChild(robotScript);
    }
  }

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const baseMeta = $('meta[name="site-base"]');
    const basePath = baseMeta ? baseMeta.content : '.';
    const swUrl = new URL(`${basePath}/sw.js`, location.href);
    const swScope = new URL(`${basePath}/`, location.href).pathname;
    window.addEventListener('load', () => navigator.serviceWorker.register(swUrl.href, { scope: swScope, updateViaCache: 'none' }).catch(() => {}));
  }
})();

/* DAVONIUM V29 FINAL — reliable WhatsApp / DVNM floating-button stacking. */
(function () {
  'use strict';
  function describe(el) {
    return [el.id || '', typeof el.className === 'string' ? el.className : '',
      el.getAttribute('aria-label') || '', el.getAttribute('title') || '',
      el.getAttribute('data-widget') || '', el.getAttribute('href') || ''].join(' ').toLowerCase();
  }
  function tagWhatsapp() {
    var candidates = document.querySelectorAll('.wa-float, a[href*="wa.me"], a[href*="whatsapp.com"], a[href*="api.whatsapp.com"], [aria-label*="whatsapp" i], [title*="whatsapp" i], [class*="whatsapp" i], [id*="whatsapp" i]');
    candidates.forEach(function (el) {
      if (!(el instanceof HTMLElement)) return;
      if (!/(wa\.me|whatsapp|wa-float)/i.test(describe(el))) return;
      /* Prefer the known real floating control. Never turn a footer/contact link into a floater. */
      if (el.matches('.wa-float')) { el.classList.add('dvnm-v29-whatsapp-float'); return; }
      var node = el;
      for (var i = 0; node && i < 4; i++, node = node.parentElement) {
        var rect = node.getBoundingClientRect();
        var style = window.getComputedStyle(node);
        var nearRight = rect.right >= window.innerWidth - 220;
        var nearBottom = rect.bottom >= window.innerHeight - 240;
        if (style.position === 'fixed' && nearRight && nearBottom && rect.width >= 26 && rect.width <= 180 && rect.height >= 26 && rect.height <= 180) {
          node.classList.add('dvnm-v29-whatsapp-float');
          break;
        }
      }
    });
  }
  function tagBotFloaters(root) {
    var scope = root || document;
    var list = Array.prototype.slice.call(scope.querySelectorAll('[id], [class], [data-dvnm-assistant], [data-dvnm-launcher], iframe[title]'));
    if (scope instanceof HTMLElement && scope.matches('[id], [class], [data-dvnm-assistant], [data-dvnm-launcher], iframe[title]')) list.unshift(scope);
    list.forEach(function (el) {
      if (!(el instanceof HTMLElement)) return;
      // V51 owns the compact DVNM Bot dock; never paint the retired V29 cutout over it.
      if (el.matches('#dvnm-bot-launcher, .dvnm-launcher, .dvnm-bot-dock, #dvnm-bot-panel')) return;
      var info = describe(el);
      if (!/(dvnm|hoverbot|hoverboard|assistant|chat.?bot)/i.test(info)) return;
      if (/(skeleton|torso|forearm|upper.?arm|shin|thigh|hand|foot|eye|head|stage|hero|orbit|backglow)/i.test(info)) return;
      if (/(panel|window|dialog|drawer|popup|conversation.?box|chat.?panel)/i.test(info)) { el.classList.add('dvnm-v29-mobile-panel'); return; }
      if (/(launcher|launch|fab|toggle|floating|dock|hoverbot|hoverboard|bot.?button|assistant.?button)/i.test(info)) {
        var rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.width <= 460 && rect.height > 0 && rect.height <= 220) el.classList.add('dvnm-v29-mobile-launcher');
      }
    });
  }
  function scan(root) { tagWhatsapp(); tagBotFloaters(root || document); }
  scan(document);
  if ('MutationObserver' in window) {
    var observer = new MutationObserver(function (records) {
      records.forEach(function (record) { record.addedNodes.forEach(function (node) { if (node.nodeType === 1) scan(node); }); });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  window.addEventListener('resize', function () { scan(document); }, { passive: true });
})();


/* DAVONIUM V32 — friendly click awareness; audio remains opt-in. */
(function () {
  'use strict';
  var resetTimer = 0;
  function readRobots() { return Array.prototype.slice.call(document.querySelectorAll('.dvnm-reference-bot')); }
  document.addEventListener('pointerdown', function (event) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var bots = readRobots(); if (!bots.length) return;
    var width = Math.max(1, window.innerWidth), height = Math.max(1, window.innerHeight);
    var nx = Math.max(-1, Math.min(1, (event.clientX / width - .5) * 2));
    var ny = Math.max(-1, Math.min(1, (event.clientY / height - .5) * 2));
    bots.forEach(function (bot) {
      bot.style.setProperty('--dvnm-head-turn', (nx * 3.1).toFixed(2) + 'deg');
      bot.style.setProperty('--dvnm-gaze-x', (nx * 2.3).toFixed(2) + 'px');
      bot.style.setProperty('--dvnm-gaze-y', (ny * 1.1).toFixed(2) + 'px');
      bot.classList.remove('is-reacting');
      void bot.offsetWidth;
      bot.classList.add('is-reacting');
    });
    if (resetTimer) window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () {
      readRobots().forEach(function (bot) { bot.classList.remove('is-reacting'); bot.style.setProperty('--dvnm-head-turn','0deg'); });
    }, 780);
  }, { passive:true });
})();


/* --- bundled from demos/demos.js --- */
;
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  $$('[data-demo-scroll]').forEach(button => button.addEventListener('click', () => {
    const target = $(button.dataset.demoScroll); if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }));
  // v28: each demo detail page stays focused on its own experience.
  // Visitors can use the shared site navigation/footer to return to the Demo Studio index;
  // only the index itself shows the five current core demo cards together; older Growth and Connect URLs redirect to their consolidated core experiences.
  // All forms are demos: never submit or collect personal details.
  $$('[data-demo-form]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault(); const note = $('[data-demo-message]', form) || $('[data-demo-message]');
    if (note) note.textContent = 'Prototype preview only — this sample form does not send or store information. Contact Davonium to build a real form.';
  }));
  // Demo shop bag is local-only; each line can be removed and totals stay in USD.
  let cartItems = [];
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const renderCart = () => {
    const count = $('#demo-cart-count'), total = $('#demo-cart-total');
    const message = $('#demo-cart-message'), list = $('#demo-cart-items');
    if (count) count.textContent = String(cartItems.length);
    if (total) total.textContent = money(cartItems.reduce((sum, item) => sum + item.price, 0));
    if (list) {
      list.replaceChildren();
      cartItems.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'dvnm-cart-line';
        const name = document.createElement('span');
        name.textContent = `${item.name} · ${money(item.price)}`;
        const remove = document.createElement('button');
        remove.type = 'button'; remove.className = 'dvnm-cart-remove';
        remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${item.name}`);
        remove.addEventListener('click', () => { cartItems.splice(index, 1); renderCart(); });
        row.append(name, remove); list.append(row);
      });
    }
    if (message) message.textContent = cartItems.length
      ? 'Your temporary demo bag is updated. No order or payment is created.'
      : 'Your demo bag is empty. Add an item to try the interaction.';
  };
  $$('[data-add-demo]').forEach(button => button.addEventListener('click', () => {
    cartItems.push({ name: button.dataset.product || 'Sample item', price: Number(button.dataset.price || 0) });
    renderCart();
  }));
  const clearCart = $('#demo-cart-clear');
  if (clearCart) clearCart.addEventListener('click', () => { cartItems = []; renderCart(); });


  // DVNM Market catalogue search, category filtering and price sorting.
  const shopList = $('#shop-products');
  const shopSearch = $('#shop-search');
  const shopCategory = $('#shop-category');
  const shopSort = $('#shop-sort');
  const applyShopControls = () => {
    if (!shopList) return;
    const query = (shopSearch?.value || '').trim().toLowerCase();
    const category = shopCategory?.value || 'all';
    const cards = $$('[data-shop-product]', shopList);
    cards.forEach(card => {
      const matchesText = !query || card.textContent.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || card.dataset.productCategory === category;
      card.hidden = !(matchesText && matchesCategory);
    });
    const sorted = [...cards].sort((a,b) => {
      const pa = Number(a.dataset.price || 0), pb = Number(b.dataset.price || 0);
      return shopSort?.value === 'low' ? pa-pb : shopSort?.value === 'high' ? pb-pa : 0;
    });
    sorted.forEach(card => shopList.append(card));
  };
  [shopSearch, shopCategory, shopSort].forEach(control => control?.addEventListener('input', applyShopControls));
  [shopCategory, shopSort].forEach(control => control?.addEventListener('change', applyShopControls));

    $$('[data-community-rsvp]').forEach(button => button.addEventListener('click', () => {
    const message = $('#community-rsvp-message');
    if (message) message.textContent = `Demo RSVP selected for “${button.dataset.communityRsvp}”. No registration was sent or stored. Contact Davonium to plan a real event sign-up flow.`;
  }));
  const filterButtons = $$('[data-filter]');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $$('[data-project-category]').forEach(project => { project.hidden = category !== 'all' && project.dataset.projectCategory !== category; });
  }));
  $$('[data-demo-modal]').forEach(button => button.addEventListener('click', () => {
    const note = $('#demo-portfolio-note'); if (note) note.textContent = `${button.dataset.projectTitle}: sample project detail. This is a fictional portfolio concept, not a claimed client engagement.`;
  }));
})();

/* DAVONIUM V29 FINAL — ensure a visible, keyboard-friendly mobile menu on demo pages. */
(function () {
  'use strict';
  function initDavoniumDemoNavigation() {
    var headers = document.querySelectorAll('header, .demo-header, .site-header, .topbar, .demo-topbar');
    headers.forEach(function (header, index) {
      var nav = header.querySelector('nav, .nav-links, .navigation-links, [data-navigation]');
      if (!nav) return;
      nav.classList.add('dvnm-v29-responsive-nav');
      if (!nav.id) nav.id = 'dvnm-v29-demo-nav-' + index;

      var toggle = header.querySelector('.dvnm-v29-menu-toggle, .demo-menu-toggle, .menu-toggle, .nav-toggle, [data-menu-toggle], #menu-toggle, .menu');
      if (!toggle) {
        var controlledButtons = header.querySelectorAll('button[aria-controls]');
        for (var b = 0; b < controlledButtons.length; b++) {
          if (controlledButtons[b].getAttribute('aria-controls') === nav.id) { toggle = controlledButtons[b]; break; }
        }
      }
      if (!toggle) {
        toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'dvnm-v29-menu-toggle';
        toggle.textContent = '☰';
        toggle.setAttribute('aria-label', 'Open navigation');
        toggle.setAttribute('aria-expanded', 'false');
        var holder = nav.parentElement || header;
        holder.insertBefore(toggle, nav);
      } else {
        toggle.classList.add('dvnm-v29-menu-toggle');
        if (!toggle.getAttribute('aria-label')) toggle.setAttribute('aria-label', 'Open navigation');
        if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');
      }
      toggle.setAttribute('aria-controls', nav.id);
      toggle.setAttribute('aria-haspopup', 'true');
      if (toggle.dataset.dvnmV29NavBound === 'yes') return;
      toggle.dataset.dvnmV29NavBound = 'yes';

      function closeMenu() {
        nav.classList.remove('dvnm-v29-menu-open');
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
        toggle.textContent = '☰';
      }
      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var isOpen = nav.classList.toggle('dvnm-v29-menu-open');
        nav.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        toggle.textContent = isOpen ? '×' : '☰';
      });
      nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
      document.addEventListener('click', function (event) {
        if (nav.classList.contains('dvnm-v29-menu-open') && !nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
      });
      document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDavoniumDemoNavigation, { once: true });
  else initDavoniumDemoNavigation();
})()


/* DAVONIUM V29 FINAL — reliable WhatsApp / DVNM floating-button stacking. */
(function () {
  'use strict';
  function describe(el) {
    return [el.id || '', typeof el.className === 'string' ? el.className : '',
      el.getAttribute('aria-label') || '', el.getAttribute('title') || '',
      el.getAttribute('data-widget') || '', el.getAttribute('href') || ''].join(' ').toLowerCase();
  }
  function tagWhatsapp() {
    var candidates = document.querySelectorAll('.wa-float, a[href*="wa.me"], a[href*="whatsapp.com"], a[href*="api.whatsapp.com"], [aria-label*="whatsapp" i], [title*="whatsapp" i], [class*="whatsapp" i], [id*="whatsapp" i]');
    candidates.forEach(function (el) {
      if (!(el instanceof HTMLElement)) return;
      if (!/(wa\.me|whatsapp|wa-float)/i.test(describe(el))) return;
      /* Prefer the known real floating control. Never turn a footer/contact link into a floater. */
      if (el.matches('.wa-float')) { el.classList.add('dvnm-v29-whatsapp-float'); return; }
      var node = el;
      for (var i = 0; node && i < 4; i++, node = node.parentElement) {
        var rect = node.getBoundingClientRect();
        var style = window.getComputedStyle(node);
        var nearRight = rect.right >= window.innerWidth - 220;
        var nearBottom = rect.bottom >= window.innerHeight - 240;
        if (style.position === 'fixed' && nearRight && nearBottom && rect.width >= 26 && rect.width <= 180 && rect.height >= 26 && rect.height <= 180) {
          node.classList.add('dvnm-v29-whatsapp-float');
          break;
        }
      }
    });
  }
  function tagBotFloaters(root) {
    var scope = root || document;
    var list = Array.prototype.slice.call(scope.querySelectorAll('[id], [class], [data-dvnm-assistant], [data-dvnm-launcher], iframe[title]'));
    if (scope instanceof HTMLElement && scope.matches('[id], [class], [data-dvnm-assistant], [data-dvnm-launcher], iframe[title]')) list.unshift(scope);
    list.forEach(function (el) {
      if (!(el instanceof HTMLElement)) return;
      // V51 owns the compact DVNM Bot dock; never paint the retired V29 cutout over it.
      if (el.matches('#dvnm-bot-launcher, .dvnm-launcher, .dvnm-bot-dock, #dvnm-bot-panel')) return;
      var info = describe(el);
      if (!/(dvnm|hoverbot|hoverboard|assistant|chat.?bot)/i.test(info)) return;
      if (/(skeleton|torso|forearm|upper.?arm|shin|thigh|hand|foot|eye|head|stage|hero|orbit|backglow)/i.test(info)) return;
      if (/(panel|window|dialog|drawer|popup|conversation.?box|chat.?panel)/i.test(info)) { el.classList.add('dvnm-v29-mobile-panel'); return; }
      if (/(launcher|launch|fab|toggle|floating|dock|hoverbot|hoverboard|bot.?button|assistant.?button)/i.test(info)) {
        var rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.width <= 460 && rect.height > 0 && rect.height <= 220) el.classList.add('dvnm-v29-mobile-launcher');
      }
    });
  }
  function scan(root) { tagWhatsapp(); tagBotFloaters(root || document); }
  scan(document);
  if ('MutationObserver' in window) {
    var observer = new MutationObserver(function (records) {
      records.forEach(function (record) { record.addedNodes.forEach(function (node) { if (node.nodeType === 1) scan(node); }); });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  window.addEventListener('resize', function () { scan(document); }, { passive: true });
})();


/* V65 — standalone demo navigation. */
(() => {
  'use strict';
  document.querySelectorAll('.dvnm-demo-header').forEach(header => {
    const toggle = header.querySelector('.dvnm-demo-menu-toggle');
    const nav = header.querySelector('.dvnm-demo-nav');
    if (!toggle || !nav) return;
    const close = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open demo navigation');
      toggle.textContent = '☰';
    };
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close demo navigation' : 'Open demo navigation');
      toggle.textContent = open ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) close();
    });
  });
})();


/* DVNM Skills sample quiz — local feedback only, no learner data is stored. */
(() => {
  'use strict';
  const form = document.querySelector('#dvnm-skills-quiz');
  const feedback = document.querySelector('#skills-quiz-feedback');
  if (!form || !feedback) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = form.querySelector('input[name="skills-answer"]:checked');
    if (!selected) {
      feedback.textContent = 'Choose an answer before checking.';
      return;
    }
    feedback.textContent = selected.value === 'b'
      ? 'Correct. Clear headings help visitors understand what each section is about.'
      : 'Not quite. A useful heading clearly describes the section’s purpose. Try again.';
  });
})();


/* --- bundled from demos/certificate-share.js --- */
;
/* V45: local-only, shareable showcase PNG. No visitor name is sent to a server. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const nameInput = $('certificate-name');
  const demoSelect = $('certificate-demo');
  const recipient = $('certificate-recipient');
  const descriptionDetail = $('certificate-detail-text');
  const dateLabel = $('certificate-date');
  const serialLabel = $('certificate-serial');
  const status = $('certificate-status');
  const downloadButton = $('certificate-download');
  const shareButton = $('certificate-share');
  const printButton = $('certificate-print');
  const samples = [...document.querySelectorAll('[data-sample]')];
  if (!nameInput || !demoSelect || !recipient || !downloadButton || !shareButton || !printButton) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const serial = `DVNM-SHOWCASE-${y}${m}${d}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  serialLabel.textContent = serial;
  dateLabel.textContent = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(now);
  const allSamples = [
    ['biz', '01', 'DVNM Biz', 'Business websites and service pathways'],
    ['market', '02', 'DVNM Market', 'Commerce and product discovery'],
    ['creative', '03', 'DVNM Creative', 'Portfolio storytelling and motion'],
    ['skills', '04', 'DVNM Skills', 'Learning and guided practice'],
    ['digital', '05', 'DVNM Digital', 'Technology and digital products']
  ];
  const selected = () => demoSelect.value;
  const selectedItems = () => selected() === 'all' ? allSamples : allSamples.filter(item => item[0] === selected());
  function updatePreview() {
    const name = String(nameInput.value || '').trim().slice(0, 64) || 'A Digital Explorer';
    recipient.textContent = name;
    if (descriptionDetail) {
      descriptionDetail.textContent = selected() === 'all'
        ? 'explored all five original Davonium Technologies sample experiences and their design directions.'
        : `explored the ${allSamples.find(item => item[0] === selected())?.[2] || 'selected'} sample experience and its design direction.`;
    }
    samples.forEach(li => {
      const active = selected() === 'all' || li.dataset.sample === selected();
      li.classList.toggle('is-selected', selected() !== 'all' && active);
      li.classList.toggle('is-dimmed', selected() !== 'all' && !active);
    });
  }
  const certificateForm = $('certificate-form');
  if (certificateForm) certificateForm.addEventListener('submit', event => event.preventDefault());
  nameInput.addEventListener('input', updatePreview);
  demoSelect.addEventListener('change', updatePreview);
  updatePreview();

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + width, y, x + width, y + height, r); ctx.arcTo(x + width, y + height, x, y + height, r); ctx.arcTo(x, y + height, x, y, r); ctx.arcTo(x, y, x + width, y, r); ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
    const words = String(text).split(/\s+/); let line = ''; let count = 0;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, y); y += lineHeight; count++; line = word; if (count >= maxLines - 1) break; }
      else line = test;
    }
    if (line) { ctx.fillText(line, x, y); y += lineHeight; }
    return y;
  }
  function loadImage(src) {
    return new Promise(resolve => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src; });
  }
  async function renderCertificate() {
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (_) {} }
    const canvas = document.createElement('canvas'); canvas.width = 2400; canvas.height = 1600;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Your browser cannot create the certificate image.');
    const logo = await loadImage('../assets/images/davonium-d-icon.webp');
    const qr = await loadImage('../assets/images/qr-dvnm-demo-studio.png');
    const bg = ctx.createLinearGradient(0, 0, 2400, 1600);
    bg.addColorStop(0, '#050d18'); bg.addColorStop(.56, '#0a1c31'); bg.addColorStop(1, '#11172b');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Quiet star points and a fine geometric signal motif.
    for (let i = 0; i < 145; i++) {
      const x = (i * 173 + 91) % 2360 + 20, y = (i * 293 + 63) % 1560 + 20;
      const radius = i % 11 === 0 ? 3.0 : (i % 4 === 0 ? 1.8 : 1.1);
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = i % 3 === 0 ? 'rgba(134,239,255,.68)' : 'rgba(220,249,255,.42)'; ctx.fill();
    }
    ctx.save(); ctx.globalAlpha = .16; ctx.strokeStyle = '#48d7ef'; ctx.lineWidth = 3;
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(2205, 210, 115 + i * 42, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    // Two-level frame and a restrained luminous signature line.
    ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(99,223,239,.75)'; roundedRect(ctx, 34, 34, 2332, 1532, 30); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(205,236,247,.32)'; roundedRect(ctx, 59, 59, 2282, 1482, 22); ctx.stroke();
    const edge = ctx.createLinearGradient(180, 0, 2220, 0); edge.addColorStop(0, '#2bc8dc'); edge.addColorStop(.5, '#8d8bff'); edge.addColorStop(1, '#e5bd81');
    ctx.fillStyle = edge; roundedRect(ctx, 190, 292, 2020, 5, 3); ctx.fill();
    if (logo) ctx.drawImage(logo, 170, 105, 126, 126);
    ctx.textAlign = 'left'; ctx.fillStyle = '#f4fbff'; ctx.font = '800 40px Manrope, Arial, sans-serif'; ctx.fillText('DAVONIUM TECHNOLOGIES', 330, 157);
    ctx.fillStyle = '#89a8bc'; ctx.font = '700 20px Manrope, Arial, sans-serif'; ctx.letterSpacing = '3px'; ctx.fillText('USEFUL TECHNOLOGY, BUILT WITH CARE', 332, 202); ctx.letterSpacing = '0px';
    ctx.textAlign = 'center'; ctx.fillStyle = '#66e6f4'; ctx.font = '800 23px Manrope, Arial, sans-serif'; ctx.letterSpacing = '5px'; ctx.fillText('DAVONIUM DEMO STUDIO  /  EXPERIENCE RECORD', 1200, 385); ctx.letterSpacing = '0px';
    ctx.fillStyle = '#f3f8ff'; ctx.font = '800 100px Manrope, Arial, sans-serif'; ctx.fillText('Showcase Certificate', 1200, 525);
    ctx.fillStyle = '#a7bdcb'; ctx.font = '500 30px Manrope, Arial, sans-serif'; ctx.fillText('Prepared as a record of exploration for', 1200, 610);
    const displayName = String(nameInput.value || '').trim().slice(0, 64) || 'A Digital Explorer';
    ctx.fillStyle = '#85eff8'; ctx.font = `800 ${displayName.length > 28 ? 48 : 66}px Manrope, Arial, sans-serif`; ctx.fillText(displayName, 1200, 710, 1850);
    ctx.fillStyle = '#c0d0dc'; ctx.font = '500 27px Manrope, Arial, sans-serif';
    const selectedDescription = selected() === 'all' ? 'explored all five original Davonium Technologies digital experiences.' : `explored the ${allSamples.find(item => item[0] === selected())?.[2] || 'selected'} Davonium digital experience.`;
    ctx.fillText(selectedDescription, 1200, 775, 1900);
    const chosen = selectedItems();
    ctx.textAlign = 'left'; ctx.fillStyle = '#76e3f0'; ctx.font = '800 19px Manrope, Arial, sans-serif'; ctx.letterSpacing = '3px'; ctx.fillText(selected() === 'all' ? 'FIVE CORE EXPERIENCES' : 'SELECTED EXPERIENCE', 215, 865); ctx.letterSpacing = '0px';
    chosen.forEach((item, index) => {
      const col = index % 2; const row = Math.floor(index / 2); const x = 205 + col * 710; const y0 = 905 + row * 112;
      ctx.fillStyle = 'rgba(240,250,255,.07)'; ctx.strokeStyle = 'rgba(134,216,232,.38)'; ctx.lineWidth = 2; roundedRect(ctx, x, y0, 650, 82, 16); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#45d9e9'; roundedRect(ctx, x + 17, y0 + 16, 48, 48, 12); ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = '#06202e'; ctx.font = '800 19px Manrope, Arial, sans-serif'; ctx.fillText(item[1], x + 41, y0 + 46);
      ctx.textAlign = 'left'; ctx.fillStyle = '#f2f8fc'; ctx.font = '800 25px Manrope, Arial, sans-serif'; ctx.fillText(item[2], x + 86, y0 + 35);
      ctx.fillStyle = '#a7bdcc'; ctx.font = '500 17px Manrope, Arial, sans-serif'; ctx.fillText(item[3], x + 86, y0 + 61, 525);
    });
    if (qr) {
      ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.strokeStyle = 'rgba(121,222,237,.54)'; ctx.lineWidth = 2; roundedRect(ctx, 1748, 895, 385, 385, 18); ctx.fill(); ctx.stroke();
      ctx.drawImage(qr, 1773, 920, 335, 335); ctx.textAlign = 'center'; ctx.fillStyle = '#d7f8ff'; ctx.font = '800 17px Manrope, Arial, sans-serif'; ctx.fillText('SCAN TO EXPLORE THE DEMO STUDIO', 1940, 1315);
    }
    ctx.strokeStyle = 'rgba(164,215,229,.32)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(190, 1390); ctx.lineTo(2210, 1390); ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = '#f0f7fc'; ctx.font = '800 23px Manrope, Arial, sans-serif'; ctx.fillText('Davonium Technologies', 205, 1450);
    ctx.fillStyle = '#9bb3c2'; ctx.font = '500 17px Manrope, Arial, sans-serif'; ctx.fillText('Company showcase · Sample digital experiences', 205, 1483);
    ctx.fillStyle = '#e3f5fa'; ctx.font = '700 19px Manrope, Arial, sans-serif'; ctx.fillText(dateLabel.textContent, 1020, 1450);
    ctx.fillStyle = '#9bb3c2'; ctx.font = '500 17px Manrope, Arial, sans-serif'; ctx.fillText('Date prepared in this browser', 1020, 1483);
    ctx.textAlign = 'right'; ctx.fillStyle = '#9feef5'; ctx.font = '800 19px monospace'; ctx.fillText(serial, 2195, 1450);
    ctx.textAlign = 'center'; ctx.fillStyle = '#9db1c0'; ctx.font = '600 15px Manrope, Arial, sans-serif';
    wrapText(ctx, 'NON-OFFICIAL SHOWCASE RECORD. NOT AN ACCREDITED CERTIFICATE, ACADEMIC AWARD, PROFESSIONAL QUALIFICATION, OR VERIFICATION OF CUSTOMER WORK.', 1200, 1532, 1970, 20, 2);
    return canvas;
  }
  async function canvasBlob(canvas) { return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The certificate image could not be encoded.')), 'image/png')); }
  function setStatus(message) { if (status) status.textContent = message; }
  async function makeFile() { const canvas = await renderCertificate(); const blob = await canvasBlob(canvas); return new File([blob], 'davonium-demo-studio-showcase.png', { type: 'image/png' }); }
  downloadButton.addEventListener('click', async () => {
    downloadButton.disabled = true; setStatus('Preparing your high-resolution showcase image…');
    try {
      const file = await makeFile(); const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = file.name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 15000);
      setStatus('Certificate image downloaded. You can attach it to WhatsApp, email, or another sharing app.');
    } catch (error) { setStatus(error.message || 'Could not create the image. Try Print / Save as PDF instead.'); }
    finally { downloadButton.disabled = false; }
  });
  shareButton.addEventListener('click', async () => {
    shareButton.disabled = true; setStatus('Preparing your shareable showcase image…');
    try {
      const file = await makeFile();
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Davonium Technologies Demo Studio Showcase', text: 'A personal, non-official showcase record of the DVNM demo experiences.', files: [file] });
        setStatus('The system share sheet has opened. Choose the app or person you want to share with.');
      } else if (navigator.share) {
        await navigator.share({ title: 'Davonium Technologies Demo Studio Showcase', text: 'A personal, non-official showcase record of the DVNM demo experiences.', url: 'https://www.davoniumtech.com/demos/certificate' });
        setStatus('Shared the certificate page link. Download the image to share the personalised certificate itself.');
      } else {
        const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 15000);
        setStatus('This browser has no share sheet, so the image was downloaded. Attach it to the app you want to share through.');
      }
    } catch (error) {
      if (error && error.name === 'AbortError') setStatus('Sharing was cancelled. Your certificate is unchanged.');
      else setStatus(error.message || 'Sharing is unavailable in this browser. Download the image instead.');
    } finally { shareButton.disabled = false; }
  });
  printButton.addEventListener('click', () => window.print());
})();


/* --- bundled from assets/js/dvnm-final-v45.js --- */
;
/* DAVONIUM TECHNOLOGIES V48 — shared DVNM Bot scene, typed storytelling and resilient guide UI. */
(() => {
  'use strict';
  if (window.__davoniumV48 || window.__davoniumV46) return;
  window.__davoniumV48 = true; window.__davoniumV46 = true;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean((navigator.connection && navigator.connection.saveData) || (Number(navigator.deviceMemory) > 0 && Number(navigator.deviceMemory) <= 2));
  const mobile = matchMedia('(max-width: 760px)').matches;
  const root = document.documentElement;
  // Keep the CSS fallback visible if WebGL or the external Three.js module is unavailable.
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
  let threePromise = null;
  const getThree = () => threePromise || (threePromise = import(THREE_URL));
  const sceneRecords = [];
  // Shared read-only registry consumed by the V49 ES-module control deck.
  window.DavoniumSceneRegistry = { getScenes: () => sceneRecords.filter((state) => !state.stopped && state.canvas?.isConnected) };
  const pageKind = () => {
    const path = location.pathname.toLowerCase();
    if (document.body.dataset.page === 'home' || path === '/' || path.endsWith('/index.html') && !/docs|demos/.test(path)) return 'home';
    if (/demos\/(business|biz|marketing)/.test(path) || document.body.classList.contains('demo-biz')) return 'biz';
    if (/demos\/(shop|market)/.test(path) || document.body.classList.contains('demo-market')) return 'market';
    if (/demos\/(portfolio|creative)/.test(path) || document.body.classList.contains('demo-creative')) return 'creative';
    if (/demos\/(learning|skills|community)/.test(path) || document.body.classList.contains('demo-skills')) return 'skills';
    if (/demos\/(technology|digital)/.test(path) || document.body.classList.contains('demo-digital')) return 'digital';
    if (/docs/.test(path)) return 'docs';
    if (/products/.test(path)) return 'market';
    if (/work/.test(path)) return 'creative';
    if (/services|about|contact/.test(path)) return 'biz';
    return 'digital';
  };
  const kind = pageKind();

  // Text is split into accessible words/letters only when motion is allowed; the original full title remains the accessible name.
  function typeHeadline() {
    if (reduced || document.querySelector('main .hero h1')) return; // V59: never animate or split the full homepage headline.
    const headings = $$('main h1').slice(0, 1);
    headings.forEach((heading) => {
      if (heading.dataset.v45Typed === 'yes') return;
      const full = heading.textContent.replace(/\s+/g, ' ').trim();
      if (!full || full.length > 115) return;
      heading.dataset.v45Typed = 'yes';
      heading.setAttribute('aria-label', full);
      let n = 0;
      const wrapText = (node) => {
        const text = node.nodeValue || '';
        const frag = document.createDocumentFragment();
        const pieces = text.split(/(\s+)/);
        pieces.forEach((piece) => {
          if (!piece) return;
          if (/^\s+$/.test(piece)) { frag.appendChild(document.createTextNode(piece)); return; }
          const word = document.createElement('span');
          word.className = 'dvnm-v45-word';
          word.setAttribute('aria-hidden', 'true');
          [...piece].forEach((character) => {
            const letter = document.createElement('span');
            letter.className = 'dvnm-v45-letter';
            letter.textContent = character;
            letter.style.setProperty('--v45-delay', `${Math.min(n * 14, 1450)}ms`);
            word.appendChild(letter); n += 1;
          });
          frag.appendChild(word);
        });
        node.replaceWith(frag);
      };
      const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) wrapText(node);
        else if (node.nodeType === Node.ELEMENT_NODE && !node.matches('script,style,noscript')) [...node.childNodes].forEach(walk);
      };
      [...heading.childNodes].forEach(walk);
      heading.classList.add('dvnm-v45-type-target');
    });
  }
  // V48: site.js owns the single short welcome experience. Avoid stacking a second full-screen intro.
  // The wordmark/title reveal remains active; sound is never initialized merely by a generic page tap.
  typeHeadline();

  // Scene hosts: real WebGL geometry for the home and every page family, with graceful static CSS fallback.
  function getSceneHost() {
    // The DVNM Robot renderer already owns home/work/welcome/assistant stages.
    // Keep documentation, legal, offline and install guides fast and readable without a full WebGL canvas.
    if ($('[data-dvnm-robot-host]:not(.dvnm-v46-welcome-robot)')) return null;
    if (kind === 'docs' || /\/(?:legal|offline|install)(?:\.html|\/|$)/i.test(location.pathname)) return null;
    const demoArt = $('.demo-hero-art');
    if (demoArt) return demoArt;
    const techArt = $('.tech-orbit-card');
    if (techArt) return techArt;
    const pageHero = $('main > .pagehero, main > .page-hero, main > .hero, main > section:first-of-type');
    return pageHero || null;
  }
  function makeSceneMarkup(host) {
    if (!host || $('.dvnm-v45-scene-canvas', host)) return $('.dvnm-v45-scene-canvas', host);
    host.classList.add('dvnm-v45-page-scene-host');
    const canvas = document.createElement('canvas');
    canvas.className = 'dvnm-v45-scene-canvas';
    canvas.setAttribute('aria-hidden', 'true'); canvas.setAttribute('role', 'presentation');
    canvas.dataset.v45Scene = kind;
    host.prepend(canvas);
    return canvas;
  }
  // Real 2D canvas fallback for WebGL construction/CDN failure and Save-Data devices.
  // It remains decorative and pass-through; page text, controls and contact links stay in normal HTML.
  const canvasFallbacks = new WeakMap();
  const activeCanvasFallbacks = new Set();
  function removeCanvasFallback(host) {
    const record = canvasFallbacks.get(host);
    if (record) record.cleanup();
  }
  function installCanvasFallback(host, staticMode = (saveData || reduced)) {
    if (!host) return null;
    const prior = canvasFallbacks.get(host);
    if (prior) return prior.canvas;
    const oldPosition = host.style.position;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const canvas = document.createElement('canvas');
    canvas.className = 'dvnm-v45-canvas-fallback';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Lightweight interactive 2D illustration fallback. The page information and actions remain available as regular text and controls.');
    canvas.dataset.fallbackReason = staticMode ? 'reduced-or-save-data' : 'webgl-unavailable';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0;';
    host.prepend(canvas);
    const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!context) { canvas.remove(); if (!oldPosition) host.style.removeProperty('position'); else host.style.position = oldPosition; return null; }
    const reducedFallbackMotion = Boolean(staticMode);
    const points = Array.from({ length: 13 }, (_, i) => ({
      angle: i * 2.399963229728653,
      radius: 0.18 + ((i * 7) % 11) / 15,
      phase: i * 1.71,
      speed: 0.14 + (i % 5) * 0.025
    }));
    const record = { host, canvas, context, points, raf: 0, observer: null, resizeObserver: null, visible: true, width: 0, height: 0, dpr: 1, pointerX: 0, pointerY: 0, gradient: null, themeObserver: null, cleanup: null };
    const active = () => !reducedFallbackMotion && record.visible && !document.hidden;
    const draw = (now = 0) => {
      const ctx = context, width = record.width, height = record.height;
      if (width < 8 || height < 8) return;
      ctx.clearRect(0, 0, width, height);
      const dark = root.dataset.theme === 'dark';
      const accent = dark ? 'rgba(62,220,243,.78)' : 'rgba(26,155,184,.52)';
      const faint = dark ? 'rgba(101,190,229,.16)' : 'rgba(68,122,175,.13)';
      const cx = width * (0.5 + record.pointerX * 0.025);
      const cy = height * (0.5 + record.pointerY * 0.025);
      const time = reducedFallbackMotion ? 0 : now * 0.00016;
      if (record.gradient) { ctx.fillStyle = record.gradient; ctx.fillRect(0, 0, width, height); }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = faint; ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath(); ctx.ellipse(0, 0, Math.min(width, height) * (0.18 + r * 0.105), Math.min(width, height) * (0.095 + r * 0.054), (r - 1) * 0.24 + time * (r % 2 ? -0.08 : 0.06), 0, Math.PI * 2); ctx.stroke();
      }
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const angle = point.angle + time * point.speed;
        const radius = Math.min(width, height) * point.radius * 0.41;
        const x = Math.cos(angle) * radius, y = Math.sin(angle * 0.83 + point.phase) * radius * 0.64;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.strokeStyle = faint; ctx.stroke();
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const angle = point.angle + time * point.speed;
        const radius = Math.min(width, height) * point.radius * 0.41;
        const x = Math.cos(angle) * radius, y = Math.sin(angle * 0.83 + point.phase) * radius * 0.64;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, y); ctx.strokeStyle = faint; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, i % 4 === 0 ? 2.5 : 1.5, 0, Math.PI * 2); ctx.fillStyle = i % 4 === 0 ? accent : faint; ctx.fill();
      }
      const hub = Math.max(3, Math.min(width, height) * 0.012);
      ctx.beginPath(); ctx.arc(0, 0, hub * 2.3, 0, Math.PI * 2); ctx.strokeStyle = accent; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, hub, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill();
      ctx.restore();
      if (active()) record.raf = requestAnimationFrame(draw);
      else record.raf = 0;
    };
    const resize = () => {
      const rect = host.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;
      record.width = rect.width; record.height = rect.height;
      record.dpr = Math.min(window.devicePixelRatio || 1, saveData || reduced ? 1 : (matchMedia('(max-width: 760px)').matches ? 1.15 : 1.4));
      canvas.width = Math.max(1, Math.round(rect.width * record.dpr));
      canvas.height = Math.max(1, Math.round(rect.height * record.dpr));
      context.setTransform(record.dpr, 0, 0, record.dpr, 0, 0);
      const dark = root.dataset.theme === 'dark';
      record.gradient = context.createRadialGradient(rect.width * .5, rect.height * .48, 2, rect.width * .5, rect.height * .5, Math.max(rect.width, rect.height) * .58);
      record.gradient.addColorStop(0, dark ? 'rgba(35,104,139,.12)' : 'rgba(73,174,202,.10)');
      record.gradient.addColorStop(1, 'rgba(0,0,0,0)');
      if (record.raf) cancelAnimationFrame(record.raf);
      record.raf = 0; draw(0);
    };
    const pointer = event => {
      if (event.pointerType === 'touch' || reducedFallbackMotion) return;
      const rect = host.getBoundingClientRect();
      record.pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / Math.max(1, rect.width) - .5) * 2));
      record.pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / Math.max(1, rect.height) - .5) * 2));
    };
    const onVisibility = () => { if (document.hidden) { if (record.raf) cancelAnimationFrame(record.raf); record.raf = 0; } else if (active() && !record.raf) record.raf = requestAnimationFrame(draw); };
    host.addEventListener('pointermove', pointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    if ('ResizeObserver' in window) { record.resizeObserver = new ResizeObserver(resize); record.resizeObserver.observe(host); }
    else window.addEventListener('resize', resize, { passive: true });
    if ('IntersectionObserver' in window) {
      record.observer = new IntersectionObserver(entries => {
        record.visible = entries.some(entry => entry.isIntersecting);
        if (record.visible && active() && !record.raf) record.raf = requestAnimationFrame(draw);
        else if (!record.visible && record.raf) { cancelAnimationFrame(record.raf); record.raf = 0; }
      }, { rootMargin: '100px' });
      record.observer.observe(host);
    }
    record.themeObserver = new MutationObserver(resize);
    record.themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    record.cleanup = () => {
      if (record.raf) cancelAnimationFrame(record.raf);
      host.removeEventListener('pointermove', pointer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
      record.resizeObserver?.disconnect(); record.observer?.disconnect(); record.themeObserver?.disconnect();
      canvas.remove();
      canvasFallbacks.delete(host); activeCanvasFallbacks.delete(record);
      if (!oldPosition) host.style.removeProperty('position'); else host.style.position = oldPosition;
    };
    canvasFallbacks.set(host, record); activeCanvasFallbacks.add(record);
    resize();
    return canvas;
  }
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    for (const record of [...activeCanvasFallbacks]) record.cleanup();
  });
  const sceneHost = getSceneHost();
  const sceneCanvas = makeSceneMarkup(sceneHost);
  // V48 controls can be used before or after the async Three.js import finishes.
  // Translate each demo's visible mode into a real scene-controller mode, not just CSS ornament.
  const sceneModeMap = {
    strategy: 'orbit', delivery: 'focus', launch: 'prism',
    catalogue: 'orbit', product: 'focus', compare: 'prism',
    web: 'orbit', brand: 'prism', explore: 'orbit', learn: 'orbit', practice: 'focus', progress: 'path',
    websites: 'orbit', apps: 'focus', systems: 'path'
  };
  if (sceneHost) {
    sceneHost.addEventListener('dvnm:scene-mode', (event) => {
      const requested = String(event.detail?.mode || 'default');
      const actual = sceneModeMap[requested] || requested;
      sceneHost.dataset.v45Motion = actual;
      const record = sceneRecords.find((item) => item.host === sceneHost);
      if (record) record.mode = actual;
    });
  }
  function palette() {
    const dark = root.dataset.theme === 'dark';
    const themes = {
      home: { light: [0x4d61de, 0x109db6, 0xf0a25e, 0x9b87ee], dark: [0x48dcec, 0x9487ff, 0xf0b27a, 0x53cbb8], ringL: 0x98a8dd, ringD: 0x285c73 },
      biz: { light: [0x277c71, 0x35b6a0, 0xf2b86f, 0x76aab6], dark: [0x62dfc5, 0x319b91, 0xf0ba83, 0x8dded0], ringL: 0x76b9ad, ringD: 0x23695f },
      market: { light: [0xca633e, 0xf1a461, 0x5b70d8, 0xd887a5], dark: [0xffac78, 0xf1c078, 0xc09cff, 0xef8da5], ringL: 0xd5a084, ringD: 0x87503e },
      creative: { light: [0x6950d9, 0xb36ce4, 0xe48ab1, 0x6db6e8], dark: [0xb6a4ff, 0x7a67e7, 0xf0a6d4, 0x7cd6ff], ringL: 0xa99de2, ringD: 0x57468b },
      skills: { light: [0x317dc9, 0x21a7c2, 0x6db8e4, 0x72c9b6], dark: [0x7ed4ff, 0x45c7dc, 0x78a9ff, 0x63ddc4], ringL: 0x81b6df, ringD: 0x235d87 },
      digital: { light: [0x4056dc, 0x159fbb, 0x896de8, 0xe6a36b], dark: [0x45deee, 0x8d84ff, 0x53c9cc, 0xf0b18a], ringL: 0x9ca9e4, ringD: 0x286982 },
      docs: { light: [0x376fbd, 0x31a7bb, 0xc0a0eb, 0xf0ad74], dark: [0x70d5eb, 0x7f92ff, 0xbba1eb, 0xefa974], ringL: 0x9fb5d3, ringD: 0x2b6179 }
    };
    const item = themes[kind] || themes.digital;
    return { colors: dark ? item.dark : item.light, low: dark ? 0x0a1521 : 0xf3f6ff, ring: dark ? item.ringD : item.ringL, light: dark ? 0x8dbbff : 0xffd1a1 };
  }
  function initScene(THREE, canvas, host) {
    const low = mobile || saveData || Number(navigator.hardwareConcurrency || 8) <= 4;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !low, powerPreference: 'low-power', failIfMajorPerformanceCaveat: false });
    } catch (_) { host.dataset.v45SceneFallback = 'true'; canvas.remove(); return null; }
    const maxPixelRatio = low ? 1.25 : 1.75;
    const initialPixelRatio = Math.min(window.devicePixelRatio || 1, low ? 1 : 1.45);
    renderer.setPixelRatio(initialPixelRatio);
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 80); camera.position.set(0, 0, 7.4);
    const ambient = new THREE.AmbientLight(0xffffff, root.dataset.theme === 'dark' ? 1.25 : 1.45); scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, root.dataset.theme === 'dark' ? 2.1 : 1.6); key.position.set(3, 4, 6); scene.add(key);
    const rim = new THREE.PointLight(0x64dded, 13, 18); rim.position.set(-3, 2, 2); scene.add(rim);
    const world = new THREE.Group(); scene.add(world);
    const p = palette();
    const rings = [];
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.78, .009, 6, 90), new THREE.MeshStandardMaterial({ color: p.ring, metalness: .34, roughness: .48, transparent: true, opacity: .60 }));
    ringA.scale.set(1.15, .84, .78); ringA.rotation.set(.44, -.28, .2); world.add(ringA); rings.push(ringA);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.34, .006, 6, 72), new THREE.MeshStandardMaterial({ color: p.colors[1], metalness: .4, roughness: .36, transparent: true, opacity: .60 }));
    ringB.scale.set(.72, 1.24, .8); ringB.rotation.set(-.28, .64, -.45); world.add(ringB); rings.push(ringB);
    const matList = p.colors.map((color, i) => new THREE.MeshStandardMaterial({ color, metalness: i === 2 ? .18 : .42, roughness: i === 2 ? .48 : .29, emissive: color, emissiveIntensity: root.dataset.theme === 'dark' ? .18 : .06, transparent: true, opacity: .94 }));
    const objects = [];
    const count = low ? 7 : 12;
    const geoFor = (i) => {
      const k = (i + kind.length) % 5;
      if (k === 0) return new THREE.IcosahedronGeometry(.18 + (i % 3) * .035, 0);
      if (k === 1) return new THREE.BoxGeometry(.21, .21, .21);
      if (k === 2) return new THREE.OctahedronGeometry(.19, 0);
      if (k === 3) return new THREE.TorusGeometry(.14, .012, 5, 24);
      return new THREE.DodecahedronGeometry(.17, 0);
    };
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geoFor(i), matList[i % matList.length]);
      const a = i * 2.399963; const radius = 1.8 + (i % 3) * .22;
      mesh.position.set(Math.cos(a) * radius, Math.sin(a * .87) * 1.55, -1.2 + Math.sin(a) * .7);
      mesh.rotation.set(a * .7, a * .43, a * .26);
      const scale = .78 + (i % 4) * .14; mesh.scale.setScalar(scale);
      world.add(mesh); objects.push({ mesh, a, radius, index: i, baseX: mesh.position.x, baseY: mesh.position.y, baseZ: mesh.position.z });
    }
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = low ? 18 : 42; const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) { const a = i * 2.399963; positions[i * 3] = Math.cos(a) * (1.5 + (i % 5) * .25); positions[i * 3 + 1] = Math.sin(a * .77) * 1.9; positions[i * 3 + 2] = -.8 + Math.sin(a) * .8; }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particlesGeo, new THREE.PointsMaterial({ color: p.colors[0], size: low ? .025 : .032, transparent: true, opacity: .62, depthWrite: false })); scene.add(particles);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshBasicMaterial({ color: p.colors[1], transparent: true, opacity: .07, depthWrite: false })); ground.scale.set(1.1, .62, 1); ground.position.set(0, -1.48, -1.1); scene.add(ground);
    const state = { THREE, canvas, host, kind, renderer, scene, camera, world, rings, objects, particles, materials: matList, ambient, key, rim, ground, low, pX: 0, pY: 0, scroll: 0, started: performance.now(), raf: 0, visible: true, stopped: false, mode: host.dataset.v45Motion || ({ strategy: 'orbit', delivery: 'focus', launch: 'prism', catalogue: 'orbit', product: 'focus', compare: 'prism', web: 'orbit', brand: 'prism', explore: 'orbit', learn: 'orbit', practice: 'focus', progress: 'path', websites: 'orbit', apps: 'focus', systems: 'path' }[host.dataset.sceneMode] || 'default'), quality: 'auto', pixelRatio: initialPixelRatio, maxPixelRatio, reducedEffects: false, frameTimes: new Float32Array(60), frameIndex: 0, frameSamples: 0, frameCount: 0, lastFrameAt: 0, fps: 0, cameraPreset: 'orbit', cameraTarget: new THREE.Vector3(0, 0, 7.4), cameraAim: new THREE.Vector3(0, 0, 0), raycaster: new THREE.Raycaster(), rayPointer: new THREE.Vector2(2, 2), pickTargets: objects.map((item) => item.mesh), hoveredObject: null, needsRaycast: false };
    state.applyPixelRatio = (ratio) => {
      const next = Math.max(.85, Math.min(state.maxPixelRatio, ratio));
      if (Math.abs(next - state.pixelRatio) < .035) return;
      state.pixelRatio = next; renderer.setPixelRatio(next); state.resize();
    };
    state.setQuality = (profile = 'auto') => {
      state.quality = ['auto', 'high', 'battery'].includes(profile) ? profile : 'auto';
      if (state.quality === 'battery') state.applyPixelRatio(Math.min(1, window.devicePixelRatio || 1));
      else if (state.quality === 'high') state.applyPixelRatio(Math.min(window.devicePixelRatio || 1, state.maxPixelRatio));
      else state.applyPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.4));
      state.updateParticleQuality?.(state.quality);
    };
    state.setReducedEffects = (enabled) => { state.reducedEffects = Boolean(enabled); if (state.reducedEffects) { state.pX *= .25; state.pY *= .25; } state.updateParticleEffects?.(state.reducedEffects); };
    state.setCameraPreset = (preset = 'orbit') => {
      state.cameraPreset = ['orbit', 'cinematic', 'reset'].includes(preset) ? preset : 'orbit';
      if (state.cameraPreset === 'cinematic') { state.cameraTarget.set(.55, .28, 6.4); state.cameraAim.set(.08, 0, 0); }
      else { state.cameraTarget.set(0, 0, 7.4); state.cameraAim.set(0, 0, 0); }
      if (reduced || state.reducedEffects) { camera.position.copy(state.cameraTarget); camera.lookAt(state.cameraAim); }
    };
    state.getStats = () => {
      const info = renderer.info || {};
      const memory = info.memory || {};
      const draw = info.render || {};
      // Browser APIs do not reveal physical VRAM use; this is a conservative canvas/resource estimate only.
      const bytes = (canvas.width * canvas.height * 8) + (Number(memory.geometries || 0) * 65536) + (Number(memory.textures || 0) * 262144);
      return { fps: state.fps, estimatedVramMB: bytes / 1048576, geometries: Number(memory.geometries || 0), textures: Number(memory.textures || 0), drawCalls: Number(draw.calls || 0), quality: state.quality, pixelRatio: state.pixelRatio };
    };
    const resize = () => {
      if (state.stopped) return;
      const rect = canvas.getBoundingClientRect(); if (rect.width < 4 || rect.height < 4) return;
      renderer.setSize(Math.round(rect.width), Math.round(rect.height), false); camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix();
      if (reduced && state.start) state.start();
    };
    state.resize = resize;
    state.theme = () => {
      const next = palette(); state.p = next;
      matList.forEach((mat, i) => { const color = next.colors[i % next.colors.length]; mat.color.setHex(color); mat.emissive.setHex(color); mat.emissiveIntensity = root.dataset.theme === 'dark' ? .23 : .055; });
      rings[0].material.color.setHex(next.ring); rings[1].material.color.setHex(next.colors[1]); particles.material.color.setHex(next.colors[0]); ground.material.color.setHex(next.colors[1]);
      ambient.intensity = root.dataset.theme === 'dark' ? 1.25 : 1.45; key.intensity = root.dataset.theme === 'dark' ? 2.1 : 1.6; rim.color.setHex(next.colors[0]);
      host.dataset.v45Theme = root.dataset.theme || 'light';
      state.updateParticleTheme?.(next.colors[0]);
      if (reduced && state.start) state.start();
    };
    const pointer = (event) => {
      const rect = host.getBoundingClientRect();
      state.pX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
      state.pY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
      state.rayPointer.set(state.pX, -state.pY); state.needsRaycast = true;
    };
    const leavePointer = () => { state.pX *= .25; state.pY *= .25; state.rayPointer.set(2, 2); state.needsRaycast = true; };
    host.addEventListener('pointermove', pointer, { passive: true });
    host.addEventListener('pointerleave', leavePointer, { passive: true });
    const onScroll = () => { const rect = host.getBoundingClientRect(); state.scroll = Math.max(-1, Math.min(1, (window.innerHeight * .6 - rect.top) / Math.max(1, window.innerHeight + rect.height))); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const onVisibilityChange = () => { if (document.hidden) state.pause(); else if (state.visible) state.start(); };
    document.addEventListener('visibilitychange', onVisibilityChange);
    state.cleanup = () => { host.removeEventListener('pointermove', pointer); host.removeEventListener('pointerleave', leavePointer); window.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVisibilityChange); if (!('ResizeObserver' in window)) window.removeEventListener('resize', resize); };
    canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); host.classList.remove('has-v45-webgl'); state.pause(); installCanvasFallback(host); }, false);
    canvas.addEventListener('webglcontextrestored', () => { removeCanvasFallback(host); state.resize(); state.theme(); state.start(); }, false);
    state.theme(); resize();
    if ('ResizeObserver' in window) { state.observer = new ResizeObserver(resize); state.observer.observe(host); } else window.addEventListener('resize', resize, { passive: true });
    state.draw = (now) => {
      if (state.stopped) return;
      state.raf = 0;
      const t = (now - state.started) / 1000;
      state.frameCount += 1;
      if (state.lastFrameAt > 0) {
        const delta = now - state.lastFrameAt;
        if (delta > 0 && delta < 200) {
          state.frameTimes[state.frameIndex] = delta;
          state.frameIndex = (state.frameIndex + 1) % state.frameTimes.length;
          state.frameSamples = Math.min(state.frameSamples + 1, state.frameTimes.length);
          if (state.frameSamples >= 12 && state.frameCount % 12 === 0) {
            let totalFrameTime = 0;
            for (let frameIndex = 0; frameIndex < state.frameSamples; frameIndex++) totalFrameTime += state.frameTimes[frameIndex];
            state.fps = 1000 / Math.max(1, totalFrameTime / state.frameSamples);
          }
          if (state.quality === 'auto' && state.frameSamples === 60 && state.frameCount % 60 === 0) {
            if (state.fps < 48) state.applyPixelRatio(state.pixelRatio - .10);
            else if (state.fps > 58) state.applyPixelRatio(state.pixelRatio + .05);
          }
        }
      }
      state.lastFrameAt = now;
      const activeMotion = !reduced && !state.reducedEffects;
      camera.position.lerp(state.cameraTarget, reduced || state.reducedEffects ? .18 : .035);
      camera.lookAt(state.cameraAim);
      if (state.needsRaycast) {
        state.raycaster.setFromCamera(state.rayPointer, camera);
        const hit = state.raycaster.intersectObjects(state.pickTargets, false)[0]?.object || null;
        if (hit !== state.hoveredObject) { state.hoveredObject = hit; window.dispatchEvent(new CustomEvent('davonium:scene-hover', { detail: { kind: state.kind, active: Boolean(hit) } })); }
        state.needsRaycast = false;
      }
      const focus = state.mode === 'focus';
      const orbit = state.mode === 'orbit' || state.mode === 'default';
      const darkMode = root.dataset.theme === 'dark';
      world.rotation.y = state.pX * .18 + (activeMotion ? Math.sin(t * (darkMode ? .29 : .18)) * (darkMode ? .085 : .045) : 0);
      world.rotation.x = state.pY * -.09 + (activeMotion ? Math.sin(t * (darkMode ? .23 : .13)) * (darkMode ? .035 : .018) : 0);
      world.position.y = state.scroll * .1 + (activeMotion ? Math.sin(t * (darkMode ? .75 : .43)) * (darkMode ? .045 : .026) : 0);
      rings[0].rotation.z = .2 + (activeMotion ? t * (darkMode ? .062 : -.028) : 0); rings[1].rotation.y = .64 + (activeMotion ? t * (darkMode ? -.052 : .031) : 0);
      objects.forEach(({ mesh, a, radius, index, baseX, baseY, baseZ }) => {
        const slow = state.low ? .5 : 1;
        if (activeMotion && !focus) { mesh.rotation.x += .0016 * slow; mesh.rotation.y += .0022 * slow; }
        mesh.position.x = focus ? baseX * .32 : state.mode === 'path' ? Math.cos(a + (activeMotion ? t * (darkMode ? -.095 : .055) : 0)) * radius : baseX;
        mesh.position.y = (focus ? baseY * .35 : baseY) + (activeMotion && !focus ? Math.sin(t * (darkMode ? .78 : .49) + a) * (darkMode ? .12 : .075) : 0);
        mesh.position.z = focus ? baseZ * .25 : baseZ;
        const hoverScale = mesh === state.hoveredObject && activeMotion ? 1.14 : 1;
        if (state.mode === 'prism') mesh.scale.setScalar((.76 + (index % 4) * .14) * (1 + (activeMotion ? .06 * Math.sin(t + index) : 0)) * hoverScale);
        else mesh.scale.setScalar((.78 + (index % 4) * .14) * hoverScale);
      });
      particles.rotation.y = activeMotion ? t * (darkMode ? .027 : -.014) : 0; particles.rotation.z = state.pX * .025;
      state.updateParticleField?.(activeMotion ? t : 0, state.pX, state.pY, activeMotion);
      renderer.render(scene, camera);
      if (state.visible && !document.hidden && !reduced) state.raf = requestAnimationFrame(state.draw);
    };
    state.start = () => { if (state.stopped || state.raf) return; state.raf = requestAnimationFrame(state.draw); };
    state.pause = () => { if (state.raf) cancelAnimationFrame(state.raf); state.raf = 0; };
    state.dispose = () => { if (state.stopped) return; state.stopped = true; state.pause(); state.cleanup(); state.cleanupTheme?.(); state.observer?.disconnect(); state.observerVisibility?.disconnect(); state.disposeParticleField?.(); renderer.renderLists?.dispose?.(); renderer.dispose(); scene.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(mat => mat.dispose()); }); window.dispatchEvent(new CustomEvent('davonium:scene-disposed', { detail: { source: 'page-scene' } })); };
    return state;
  }
  if (sceneCanvas && sceneHost) {
    sceneHost.dataset.v45Scene = kind;
    // Save-data and reduced-motion visitors retain the CSS scene; normal visitors receive actual WebGL geometry.
    if (!saveData) {
      getThree().then(THREE => {
        if (!sceneCanvas.isConnected || !sceneHost.isConnected) return;
        const state = initScene(THREE, sceneCanvas, sceneHost);
        if (!state) { installCanvasFallback(sceneHost); return; }
        sceneHost.classList.add('has-v45-webgl');
        sceneRecords.push(state);
        window.dispatchEvent(new CustomEvent('davonium:scene-ready', { detail: { source: 'page-scene', kind: state.kind } }));
        const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => { state.visible = entry.isIntersecting; if (state.visible) state.start(); else state.pause(); }), { rootMargin: '120px' }) : null;
        if (io) { io.observe(sceneHost); state.observerVisibility = io; } else state.start();
        const themeObserver = new MutationObserver(() => state.theme()); themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        state.cleanupTheme = () => themeObserver.disconnect();
        state.start();
      }).catch(() => { if (sceneHost) sceneHost.dataset.v45SceneFallback = 'true'; if (sceneCanvas) sceneCanvas.remove(); installCanvasFallback(sceneHost); });
    } else {
      sceneHost.dataset.v45SceneFallback = 'true'; sceneCanvas.remove(); installCanvasFallback(sceneHost, true);
    }
  }

  // Interactive scene modes on Creative and Skills; keyboard and touch controls are intentionally simple.
  function installSceneControls() {
    if (!(kind === 'creative' || kind === 'skills')) return;
    const art = $('.demo-hero-art'); if (!art || $('.dvnm-v45-scene-tools', art)) return;
    const bar = document.createElement('div'); bar.className = 'dvnm-v45-scene-tools'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', kind === 'creative' ? 'Creative scene controls' : 'Learning scene controls');
    const controls = kind === 'creative' ? [['orbit', 'Orbit'], ['focus', 'Focus'], ['prism', 'Prism']] : [['explore', 'Explore'], ['focus', 'Focus'], ['path', 'Learning path']];
    controls.forEach(([mode, label], i) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.setAttribute('aria-pressed', String(i === 0));
      button.addEventListener('click', () => {
        bar.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
        sceneRecords.forEach(state => { if (state.kind === kind) state.mode = mode; });
        if (kind === 'skills') {
          const accordions = $$('.demo-accordion');
          accordions.forEach((item, index) => { if (mode === 'focus') item.open = index === 0; else if (mode === 'path') item.open = index < 2; else item.open = false; });
        }
        art.dataset.v45Motion = mode;
      });
      bar.appendChild(button);
    });
    art.appendChild(bar);
  }
  // V48 provides one unified scene-control bar across all five demos; the legacy V45 bar is intentionally not injected.

  // High-quality but restrained scroll reveals; no section is hidden unless an observer can reveal it.
  if (!reduced && 'IntersectionObserver' in window) {
    const targets = $$('main > section, .demo-section, .doc-group, .dvnm-certificate-banner').filter((el, i) => i > 0 && !el.classList.contains('dvnm-certificate-v45'));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('dvnm-v45-pending'); entry.target.classList.add('dvnm-v45-revealed'); observer.unobserve(entry.target); }
    }), { threshold: .06, rootMargin: '0px 0px -26px 0px' });
    targets.forEach((el, i) => { el.classList.add('dvnm-v45-reveal'); el.style.setProperty('--v45-reveal-delay', `${(i % 3) * 65}ms`); if (el.getBoundingClientRect().top > window.innerHeight * 1.1) el.classList.add('dvnm-v45-pending'); observer.observe(el); });
  }

  // Slight perspective on desktop cards only, disabled for touch and reduced-motion users.
  if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.dvnm-demo-card, .demo-card, .doc-card').slice(0, 80).forEach(card => {
      card.classList.add('dvnm-v45-depth-card');
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width - .5; const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.8).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Documentation quick filters are additive to the existing local search and remain useful without a network.
  function setupDocsFilters() {
    const search = $('#docs-search'); const results = $('#docs-results'); const clear = $('#docs-clear'); const count = $('#docs-result-count');
    if (!search || !results) return;
    const cards = $$('.doc-card', results); const groups = $$('.doc-group', results);
    const filterBox = document.createElement('div'); filterBox.className = 'docs-category-filters'; filterBox.setAttribute('role', 'group'); filterBox.setAttribute('aria-label', 'Filter documentation by topic');
    const names = ['All topics', ...groups.map(g => g.dataset.category || '').filter(Boolean)];
    let chosen = 'All topics';
    names.forEach((name, i) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = name; button.setAttribute('aria-pressed', String(i === 0));
      button.addEventListener('click', () => { chosen = name; filterBox.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button))); apply(); }); filterBox.appendChild(button);
    });
    const searchRow = $('.searchrow'); if (searchRow && !$('.docs-category-filters')) searchRow.insertAdjacentElement('afterend', filterBox);
    function apply() {
      const query = search.value.trim().toLowerCase(); let matches = 0;
      cards.forEach(card => {
        const group = card.closest('.doc-group'); const category = group?.dataset.category || '';
        const content = `${card.dataset.search || ''} ${card.textContent || ''}`.toLowerCase();
        const show = (!query || content.includes(query)) && (chosen === 'All topics' || category === chosen);
        card.classList.toggle('hidden', !show); if (show) matches++;
      });
      groups.forEach(group => group.classList.toggle('hidden', !$('.doc-card:not(.hidden)', group)));
      if (count) count.textContent = query || chosen !== 'All topics' ? `${matches} ${matches === 1 ? 'guide' : 'guides'} shown${query ? ` for “${search.value.trim()}”` : ''}${chosen !== 'All topics' ? ` in ${chosen}` : ''}.` : `Browse all ${cards.length} published guides.`;
    }
    search.addEventListener('input', apply);
    if (clear) clear.addEventListener('click', () => { chosen = 'All topics'; search.value = ''; filterBox.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === 0))); apply(); });
    apply();
  }
  setupDocsFilters();

  // One assistant launcher only. Legacy third-party/older floating widgets are suppressed if left in cached HTML.
  function removeLegacyFloaters() {
    const selectors = ['.dvnm-v29-mobile-launcher:not(#dvnm-bot-launcher)', '.dvnm-assistant-launcher', '.dvnm-bot-widget', '.dvnm-floating-bot', '.dvnm-floating-assistant', '#dvnm-assistant', '#dvnm-bot-widget', '[data-dvnm-assistant]'];
    selectors.forEach(selector => $$(selector).forEach(el => {
      if (el.closest('#dvnm-bot-dock') || el.classList.contains('wa-float') || el.matches('#dvnm-bot-launcher')) return;
      const rect = el.getBoundingClientRect(); const style = getComputedStyle(el);
      const floating = style.position === 'fixed' || rect.right > innerWidth - 150 && rect.bottom > innerHeight - 260;
      if (floating && rect.width <= 480 && rect.height <= 240) { el.classList.add('dvnm-v45-legacy-hidden'); }
    }));
  }
  removeLegacyFloaters();
  const floatObserver = new MutationObserver(() => removeLegacyFloaters());
  floatObserver.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => floatObserver.disconnect(), 6000);

  // Keep scene theme sync and clear up renderers if the page is discarded.
  window.addEventListener('pagehide', event => sceneRecords.forEach(s => { s.pause(); if (s.cleanupTheme) s.cleanupTheme(); if (!event.persisted) s.dispose?.(); }), { once: true });
})();


/* --- bundled from assets/js/davonium-v48-experience.js --- */
;
/* Davonium V49 experience controller. Enhancements only; core content remains usable without WebGL. */
(() => {
  'use strict';
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const root = document.documentElement;
  root.dataset.davoniumRelease = 'V51';
  document.body.classList.add('dvnm-v48-experience');

  // Remove any stale intro veil injected by a cached older release. V48 uses the single DVNM welcome.
  $$('.dvnm-v45-prelude').forEach((node) => node.remove());

  // Make all new decorative scene canvases strictly non-interactive and behind semantic content.
  $$('.dvnm-v45-scene-canvas').forEach((canvas) => {
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.pointerEvents = 'none';
  });

  const demoScenes = {
    'demo-biz': { label: 'Business journey', modes: [['strategy', 'Strategy'], ['delivery', 'Build'], ['launch', 'Launch']], note: 'Explore how a business journey moves from strategy to delivery.' },
    'demo-market': { label: 'Commerce journey', modes: [['catalogue', 'Catalogue'], ['product', 'Featured product'], ['compare', 'Compare']], note: 'Switch the scene focus to browse, inspect or compare a product.' },
    'demo-creative': { label: 'Creative portfolio', modes: [['web', 'Web'], ['brand', 'Brand'], ['product', 'Product']], note: 'Choose a portfolio discipline to change the visual focus.' },
    'demo-skills': { label: 'Learning journey', modes: [['learn', 'Learn'], ['practice', 'Practice'], ['progress', 'Progress']], note: 'Move between learning, practice and progress perspectives.' },
    'demo-digital': { label: 'Digital product universe', modes: [['websites', 'Websites'], ['apps', 'Apps'], ['systems', 'Systems']], note: 'Select a technology domain to shift the scene emphasis.' }
  };
  const activeDemoClass = Object.keys(demoScenes).find((name) => document.body.classList.contains(name));
  if (activeDemoClass) {
    const config = demoScenes[activeDemoClass];
    const stage = $('.demo-hero-art');
    if (stage && !$('.dvnm-v48-scene-controls', stage)) {
      stage.dataset.sceneMode = config.modes[0][0];
      const controls = document.createElement('div');
      controls.className = 'dvnm-v48-scene-controls';
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', `${config.label} scene controls`);
      const buttons = config.modes.map(([mode, label], index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dvnm-v48-scene-control';
        button.dataset.sceneMode = mode;
        button.textContent = label;
        button.setAttribute('aria-pressed', String(index === 0));
        button.addEventListener('click', () => {
          stage.dataset.sceneMode = mode;
          buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
          const status = $('.dvnm-v48-scene-status', stage);
          if (status) status.textContent = `${label} view selected. ${config.note}`;
          // The Skills control also guides the real sample curriculum's open sections.
          if (activeDemoClass === 'demo-skills') {
            const accordions = $$('.demo-accordion');
            const count = mode === 'learn' ? 1 : mode === 'practice' ? 2 : 3;
            accordions.forEach((item, itemIndex) => { item.open = itemIndex < count; });
          }
          stage.dispatchEvent(new CustomEvent('dvnm:scene-mode', { bubbles: true, detail: { mode, demo: activeDemoClass } }));
        });
        return button;
      });
      buttons.forEach((button) => controls.appendChild(button));
      const status = document.createElement('p');
      status.className = 'dvnm-v48-scene-status';
      status.setAttribute('aria-live', 'polite');
      status.textContent = `${config.modes[0][1]} view selected. ${config.note}`;
      controls.appendChild(status);
      stage.appendChild(controls);
    }
  }

  // Match the floating launcher to the current page and eliminate any legacy duplicate assistant controls.
  const dock = $('#dvnm-bot-dock');
  if (dock) {
    const launchers = $$('.dvnm-launcher, #dvnm-bot-launcher', document.body).filter((element) => element.closest('#dvnm-bot-dock'));
    launchers.slice(1).forEach((element) => element.remove());
    const panel = $('#dvnm-bot-panel', dock);
    const speak = $('#dvnm-bot-speak', dock);
    if (speak) {
      speak.textContent = speak.dataset.speaking === 'yes' ? '■ Stop speaking' : '▶ Hear this answer';
      speak.setAttribute('aria-pressed', String(speak.dataset.speaking === 'yes'));
    }
    if (panel) {
      panel.addEventListener('transitionend', () => {
        if (!panel.hidden) panel.scrollTop = Math.min(panel.scrollTop, Math.max(0, panel.scrollHeight - panel.clientHeight));
      });
    }
  }

  // Focus the welcome dialog's heading, not its text input, so mobile keyboards do not pop up unexpectedly.
  const focusWelcome = () => {
    const welcome = $('#dvnm-welcome-overlay');
    if (!welcome || welcome.hidden) return;
    const heading = $('#dvnm-welcome-title', welcome);
    if (heading && !heading.dataset.v48FocusReady) {
      heading.dataset.v48FocusReady = 'yes';
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      try { heading.focus({ preventScroll: true }); } catch (_) { heading.focus(); }
    }
  };
  const welcome = $('#dvnm-welcome-overlay');
  if (welcome && 'MutationObserver' in window) {
    const observer = new MutationObserver(() => { if (!welcome.hidden) focusWelcome(); });
    observer.observe(welcome, { attributes: true, attributeFilter: ['hidden', 'class'] });
    const bodyObserver = new MutationObserver(() => { if (document.body.classList.contains('dvnm-welcome-visible')) focusWelcome(); });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('pagehide', () => { observer.disconnect(); bodyObserver.disconnect(); }, { once: true });
  }

  // Keep the 3D bot loader available for canvas hosts inserted after site.js has run.
  // It loads only when an actual robot canvas exists and remains optional if the CDN is unavailable.
  const baseMeta = $('meta[name="site-base"]');
  const basePath = baseMeta ? baseMeta.content : '.';
  const baseUrl = new URL(`${String(basePath).replace(/\/$/, '')}/`, location.href);
  const ensureRobotRuntime = () => {
    if (!$('[data-dvnm-robot]')) return;
    if (!$('link[href*="dvnm-robot-3d.css"]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.dataset.dvnmV48RobotCss = 'true';
      css.href = new URL('assets/css/dvnm-robot-3d.css?v=51', baseUrl).href;
      document.head.appendChild(css);
    }
    if (!$('script[data-dvnm3d-loader]')) {
      const script = document.createElement('script');
      script.async = true; script.dataset.dvnm3dLoader = 'true';
      script.src = new URL('assets/js/dvnm-robot-3d.js?v=51', baseUrl).href;
      script.onerror = () => { document.body.classList.add('dvnm-v48-robot-fallback'); };
      document.head.appendChild(script);
    }
  };
  ensureRobotRuntime();

  // Theme changes recolor only decoration; textual content and document structure remain untouched.
  const themeObserver = new MutationObserver(() => {
    const theme = root.dataset.theme === 'dark' ? 'dark' : 'light';
    root.dataset.sceneEnvironment = theme;
    $$('.dvnm-v48-scene-control').forEach((control) => control.dataset.themeEnvironment = theme);
  });
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  root.dataset.sceneEnvironment = root.dataset.theme === 'dark' ? 'dark' : 'light';

  // Avoid animation hiding content if IntersectionObserver fails or JavaScript is interrupted.
  if (!('IntersectionObserver' in window)) {
    $$('.dvnm-v45-pending').forEach((element) => { element.classList.remove('dvnm-v45-pending'); element.classList.add('dvnm-v45-revealed'); });
  }
})();


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
