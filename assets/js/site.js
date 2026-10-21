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

  // Theme follows the device by default. Only a deliberate choice is saved.
  // The old davonium-theme key was also written on first load, so ignore it during migration.
  const theme = $('#theme-toggle');
  const themeMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const systemTheme = () => themeMedia && themeMedia.matches ? 'dark' : 'light';
  let themePreference = safeStore.get('davonium-theme-choice');
  if (!['light', 'dark'].includes(themePreference)) themePreference = 'system';
  const resolvedTheme = () => themePreference === 'system' ? systemTheme() : themePreference;
  const renderTheme = () => {
    const value = resolvedTheme();
    const systemValue = systemTheme();
    document.documentElement.dataset.theme = value;
    const themeColor = $('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', value === 'dark' ? '#090b14' : '#6847e8');
    if (theme) {
      const other = value === 'dark' ? 'light' : 'dark';
      theme.textContent = value === 'dark' ? '☀' : '☾';
      let label;
      let title;
      if (themePreference === 'system') {
        label = `Switch to ${other} theme; currently following system appearance`;
        title = `Following system appearance (${value}). Click to use ${other} theme.`;
      } else if (themePreference === systemValue) {
        label = `Use system appearance; currently showing ${value}`;
        title = `Manual ${value} theme. Click to return to system appearance.`;
      } else {
        label = `Switch to ${systemValue} theme; manual preference is ${value}`;
        title = `Manual ${value} theme. Click to switch to ${systemValue}; click again to follow the system.`;
      }
      theme.setAttribute('aria-label', label);
      theme.setAttribute('title', title);
    }
  };
  renderTheme();
  // Click cycles from system to the opposite mode, then the system's current mode, then back to system.
  if (theme) theme.addEventListener('click', () => {
    const current = resolvedTheme();
    const systemValue = systemTheme();
    if (themePreference === 'system') {
      themePreference = current === 'dark' ? 'light' : 'dark';
    } else if (themePreference !== systemValue) {
      themePreference = systemValue;
    } else {
      themePreference = 'system';
    }
    safeStore.set('davonium-theme-choice', themePreference);
    renderTheme();
  });
  if (themeMedia) {
    const onSystemThemeChange = () => { if (themePreference === 'system') renderTheme(); };
    if (typeof themeMedia.addEventListener === 'function') themeMedia.addEventListener('change', onSystemThemeChange);
    else if (typeof themeMedia.addListener === 'function') themeMedia.addListener(onSystemThemeChange);
  }

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
  const invitePage = page === 'home' || page === 'products';
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
    contact.href = 'https://wa.me/2348032076924';
    contact.target = '_blank';
    contact.rel = 'noopener noreferrer';
    contact.setAttribute('aria-label', 'Talk to Davonium Technologies on WhatsApp at +234 803 207 6924');
    contact.title = 'Chat on WhatsApp'; contact.dataset.label = 'Chat on WhatsApp'; contact.innerHTML = '<svg class="wa-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.04 3C8.83 3 3 8.78 3 15.91c0 2.29.61 4.52 1.74 6.49L3.1 29l6.79-1.78a13.1 13.1 0 0 0 6.12 1.55h.01c7.19 0 13.03-5.78 13.03-12.91 0-3.46-1.36-6.71-3.83-9.15A13.02 13.02 0 0 0 16.04 3Zm.01 23.6h-.01a10.9 10.9 0 0 1-5.55-1.5l-.4-.24-4.03 1.06 1.08-3.9-.26-.4a10.65 10.65 0 0 1-1.64-5.7c0-5.9 4.85-10.7 10.81-10.7 2.89 0 5.61 1.11 7.65 3.13a10.57 10.57 0 0 1 3.17 7.57c0 5.9-4.85 10.7-10.82 10.7Zm5.94-8.02c-.32-.16-1.9-.93-2.2-1.04-.29-.1-.51-.16-.73.16-.21.32-.84 1.04-1.03 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.58-1.59-.95-.84-1.59-1.88-1.78-2.2-.19-.32-.02-.49.14-.65.14-.14.32-.38.49-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.74-1-2.39-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66s1.14 3.09 1.3 3.3c.16.21 2.24 3.39 5.43 4.76.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.9-.77 2.17-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.62-.38Z"/></svg><span class="wa-sr">Chat with Davonium Technologies on WhatsApp</span>';
    document.body.appendChild(contact);
  }


  // DVNM Bot: browser-native speech, explicit user activation, and simple site navigation.
  // No audio starts automatically and no visitor content is sent to an external service.
  const botBaseMeta = $('meta[name="site-base"]');
  const botBase = botBaseMeta ? botBaseMeta.content : '.';
  const botRoot = new URL(`${botBase.replace(/\/$/, '')}/`, location.href);
  const botUrl = (path) => new URL(path, botRoot).href;
  const robotMarkup = (extra = '') => `<div class="dvnm-character ${extra}" aria-hidden="true"><span class="dvnm-antenna"></span><span class="dvnm-ear left"></span><span class="dvnm-ear right"></span><div class="dvnm-head"><div class="dvnm-face"><i class="dvnm-eye left"></i><i class="dvnm-eye right"></i><i class="dvnm-cheek left"></i><i class="dvnm-cheek right"></i><i class="dvnm-mouth"></i></div></div><span class="dvnm-neck"></span><div class="dvnm-body"><span class="dvnm-chest">D</span></div><span class="dvnm-arm left"><i class="dvnm-hand"></i></span><span class="dvnm-arm right"><i class="dvnm-hand"></i></span><span class="dvnm-leg left"><i class="dvnm-foot"></i></span><span class="dvnm-leg right"><i class="dvnm-foot"></i></span></div>`;
  const botCssHref = botUrl('assets/css/dvnm-bot.css');
  if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === botCssHref)) {
    const botStylesheet = document.createElement('link'); botStylesheet.rel = 'stylesheet'; botStylesheet.href = botCssHref; document.head.appendChild(botStylesheet);
  }
  if (document.body && !$('#dvnm-bot-dock')) {
    const dock = document.createElement('div');
    dock.className = 'dvnm-bot-dock'; dock.id = 'dvnm-bot-dock';
    dock.innerHTML = `<button class="dvnm-launcher" id="dvnm-bot-launcher" type="button" aria-expanded="false" aria-controls="dvnm-bot-panel" aria-label="Open DVNM Bot, the Davonium website guide"><span class="dvnm-mini" aria-hidden="true"></span><span>Ask DVNM Bot</span><span class="dvnm-launch-star" aria-hidden="true">✦</span></button><section class="dvnm-panel" id="dvnm-bot-panel" role="dialog" aria-modal="false" aria-label="DVNM Bot website guide" hidden><header class="dvnm-panel-head"><div><strong>DVNM Bot</strong><small>Your Davonium Technologies guide</small></div><button class="dvnm-panel-close" type="button" id="dvnm-bot-close" aria-label="Close DVNM Bot">×</button></header><div class="dvnm-panel-intro"><div class="dvnm-robot-mini-frame">${robotMarkup()}</div><p id="dvnm-bot-greeting">Hi there! I’m DVNM Bot. Pick a topic and I’ll point you to the right place.</p></div><div class="dvnm-panel-label">Choose a quick question</div><div class="dvnm-questions" role="group" aria-label="Questions for DVNM Bot"><button class="dvnm-question" type="button" data-dvnm-topic="company" aria-pressed="true">What is Davonium?</button><button class="dvnm-question" type="button" data-dvnm-topic="products" aria-pressed="false">Our products</button><button class="dvnm-question" type="button" data-dvnm-topic="services" aria-pressed="false">Website services</button><button class="dvnm-question" type="button" data-dvnm-topic="demos" aria-pressed="false">See website demos</button><button class="dvnm-question" type="button" data-dvnm-topic="docs" aria-pressed="false">Read documentation</button><button class="dvnm-question" type="button" data-dvnm-topic="contact" aria-pressed="false">Contact the team</button></div><div class="dvnm-answerbox"><p id="dvnm-bot-answer" aria-live="polite">Davonium Technologies builds digital products and practical websites, with a focus on clear journeys, thoughtful engineering, and useful documentation.</p><a class="dvnm-answer-link" id="dvnm-bot-link" href="${botUrl('about')}">Learn about the company →</a></div><div class="dvnm-panel-actions"><button class="btn" id="dvnm-bot-speak" type="button">▶ Hear this answer</button><button class="btn alt" id="dvnm-bot-stop" type="button">■ Stop voice</button></div><p class="dvnm-voice-status" id="dvnm-bot-status" aria-live="polite">Voice starts only when you press “Hear this answer”. The available voice depends on your browser and device.</p></section>`;
    document.body.appendChild(dock);
    const panel = $('#dvnm-bot-panel', dock), launcher = $('#dvnm-bot-launcher', dock), closeBot = $('#dvnm-bot-close', dock);
    const answer = $('#dvnm-bot-answer', dock), answerLink = $('#dvnm-bot-link', dock), statusText = $('#dvnm-bot-status', dock);
    const speakBtn = $('#dvnm-bot-speak', dock), stopBtn = $('#dvnm-bot-stop', dock);
    const topics = {
      company: { text: 'Davonium Technologies builds digital products and practical websites, with a focus on clear journeys, thoughtful engineering, and useful documentation.', link: 'about', label: 'Learn about the company →' },
      products: { text: 'Explore the product family: Marvel Chat is in active development, Davonium Nexus is being developed for client project handoffs, and Ready2Go Learning remains under development with no public launch link on this website.', link: 'products', label: 'Explore product status →' },
      services: { text: 'We work on responsive websites, landing pages, progressive web app experiences, technical SEO foundations, documentation, interface refinement, and launch support.', link: 'services', label: 'Explore our services →' },
      demos: { text: 'The Demo Studio contains five fictional website concepts: a local business site, a marketing landing page, an online shop prototype, a creative portfolio, and a learning product page.', link: 'demos/', label: 'Open the Demo Studio →' },
      docs: { text: 'Our documentation covers company information, product status, web engineering, accessibility, security basics, performance, SEO, privacy, and support.', link: 'docs/', label: 'Browse documentation →' },
      contact: { text: 'Tell our team about your audience, goals, budget range, and what you need the first release to do. Please do not include passwords or private keys.', link: 'contact', label: 'Contact Davonium →' }
    };
    let selectedAnswer = topics.company.text;
    let selectedVoice = null;
    const speakingCharacters = () => $$('.dvnm-character', dock);
    const setSpeaking = (active) => document.querySelectorAll('.dvnm-character').forEach(character => character.classList.toggle('is-speaking', active));
    const stopVoice = (message = 'Voice stopped.') => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setSpeaking(false); if (statusText) statusText.textContent = message;
      if (speakBtn) speakBtn.disabled = false;
    };
    const showPanel = (open) => {
      panel.hidden = !open; launcher.setAttribute('aria-expanded', String(open));
      if (open) { const firstQuestion = $('.dvnm-question', dock); if (firstQuestion) firstQuestion.focus({ preventScroll: true }); }
      else stopVoice('DVNM Bot closed. Voice stopped.');
    };
    launcher.addEventListener('click', () => showPanel(panel.hidden));
    closeBot.addEventListener('click', () => { showPanel(false); launcher.focus(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { showPanel(false); launcher.focus(); } });
    $$('[data-dvnm-topic]', dock).forEach(button => button.addEventListener('click', () => {
      const topic = topics[button.dataset.dvnmTopic]; if (!topic) return;
      selectedAnswer = topic.text; answer.textContent = topic.text; answerLink.href = botUrl(topic.link); answerLink.textContent = topic.label;
      $$('[data-dvnm-topic]', dock).forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      stopVoice('Answer selected. Press “Hear this answer” to listen.');
    }));
    speakBtn.addEventListener('click', () => {
      if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
        statusText.textContent = 'This browser does not support speech output here. You can still read the answer and open the link.'; return;
      }
      stopVoice('Preparing voice…');
      const utterance = new SpeechSynthesisUtterance(selectedAnswer);
      utterance.rate = 0.96; utterance.pitch = 1.08; utterance.volume = 1;
      try {
        const voices = window.speechSynthesis.getVoices();
        selectedVoice = voices.find(voice => /^en-NG$/i.test(voice.lang)) || voices.find(voice => /^en-/i.test(voice.lang)) || voices[0] || null;
        if (selectedVoice) utterance.voice = selectedVoice;
      } catch (_) {}
      utterance.onstart = () => { setSpeaking(true); statusText.textContent = `DVNM Bot is speaking${selectedVoice ? ` with ${selectedVoice.name}` : ''}. Mouth animation follows speech activity approximately.`; speakBtn.disabled = true; };
      utterance.onboundary = () => { setSpeaking(false); requestAnimationFrame(() => setSpeaking(true)); };
      utterance.onend = () => { setSpeaking(false); speakBtn.disabled = false; statusText.textContent = 'That’s the answer. Choose another question or follow the link above.'; };
      utterance.onerror = () => { setSpeaking(false); speakBtn.disabled = false; statusText.textContent = 'Speech was interrupted or is unavailable. The written answer and links still work.'; };
      window.speechSynthesis.speak(utterance);
    });
    stopBtn.addEventListener('click', () => stopVoice());
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

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const baseMeta = $('meta[name="site-base"]');
    const basePath = baseMeta ? baseMeta.content : '.';
    const swUrl = new URL(`${basePath}/sw.js`, location.href);
    const swScope = new URL(`${basePath}/`, location.href).pathname;
    window.addEventListener('load', () => navigator.serviceWorker.register(swUrl.href, { scope: swScope }).catch(() => {}));
  }
})();
