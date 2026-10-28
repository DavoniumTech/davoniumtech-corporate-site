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
    if (themeColor) themeColor.setAttribute('content', value === 'dark' ? '#080c13' : '#f5f7fb');
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
    document.documentElement.classList.add('theme-transition');
    window.setTimeout(() => document.documentElement.classList.remove('theme-transition'), 360);
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
  // DVNM Bot is represented by a clean, angular head-only mark in the assistant UI.
  // The full-body character is intentionally not repeated beside the WhatsApp control.
  const robotMarkup = (extra = '') => `<span class="dvnm-mini dvnm-bot-head-icon ${extra}" aria-hidden="true"><svg viewBox="0 0 96 96" focusable="false"><path d="M28 8h40l14 16 2 29-15 25-13 8H40l-13-8-15-25 2-29z" fill="#f3f8fc" stroke="#7b9ab5" stroke-width="2.8" stroke-linejoin="round"/><path d="M19 26l10-10h38l10 10-1 25-10 10H30L20 51z" fill="#0a1b2d" stroke="#47718c" stroke-width="2.5"/><path d="M29 35h12m14 0h12" stroke="#56eff2" stroke-width="6" stroke-linecap="round"/><path d="M39 47q9 7 18 0" fill="none" stroke="#52e5ed" stroke-width="3.5" stroke-linecap="round"/><path d="M26 61l12 10h20l12-10" fill="none" stroke="#9db4c9" stroke-width="3"/><path d="M36 76h24" stroke="#31bbd7" stroke-width="4" stroke-linecap="round"/><path d="M10 34h8v19h-8m68-19h8v19h-8" fill="#9fb4c9" stroke="#587893" stroke-width="2"/><circle cx="15" cy="42" r="3" fill="#44e8ef"/><circle cx="81" cy="42" r="3" fill="#44e8ef"/></svg></span>`;
  const botCssHref = botUrl('assets/css/dvnm-bot.css?v=49');
  if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === botCssHref)) {
    const botStylesheet = document.createElement('link'); botStylesheet.rel = 'stylesheet'; botStylesheet.href = botCssHref; document.head.appendChild(botStylesheet);
  }
  if (document.body && !$('#dvnm-bot-dock')) {
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
        'Our work brings together website engineering, software, applications, digital products, and clear documentation for people and organisations worldwide.',
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
    welcome.innerHTML = `<div class="dvnm-welcome-card dvnm-v46-welcome-card"><button type="button" class="dvnm-welcome-x" id="dvnm-welcome-x" aria-label="Close welcome">×</button><div class="dvnm-welcome-hero dvnm-v46-welcome-hero"><div class="dvnm-welcome-robot dvnm-v46-welcome-robot" data-dvnm-robot-host><canvas class="dvnm-robot-canvas" data-dvnm-robot data-robot-size="full" aria-hidden="true"></canvas><img class="dvnm-robot-fallback" src="${botUrl('assets/images/dvnm-robot-fallback-v46.svg')}" alt="DVNM Bot, the white and cyan robot guide" width="520" height="640" decoding="async"></div><div class="dvnm-welcome-heading"><span class="dvnm-welcome-eyebrow"><span class="dvnm-live-dot"></span> YOUR DIGITAL GUIDE</span><h2 id="dvnm-welcome-title">Hi, I’m DVNM Bot.</h2><p class="dvnm-welcome-tagline">Useful technology, built with care.</p><p class="dvnm-welcome-subtitle" id="dvnm-welcome-subtitle">Welcome to Davonium Technologies. Let’s find what you came for.</p><label class="dvnm-name-label" for="dvnm-visitor-name">What may I call you? <span>Optional</span></label><input id="dvnm-visitor-name" class="dvnm-visitor-name" type="text" maxlength="40" autocomplete="given-name" placeholder="Your name (optional)"><p class="dvnm-welcome-privacy">Your name is used for this greeting only.</p></div></div><div class="dvnm-welcome-details dvnm-v46-welcome-details"><p class="dvnm-welcome-section-title">I can help you</p><ol class="dvnm-welcome-points"><li>Explore our company, products and digital services.</li><li>Preview five distinct website experiences.</li><li>Find documentation, product status and contact options.</li></ol></div><p class="dvnm-welcome-status" id="dvnm-welcome-status" aria-live="polite">Voice is off until you choose Hear introduction.</p><div class="dvnm-welcome-actions dvnm-v46-welcome-actions"><button type="button" class="btn" id="dvnm-welcome-continue">Meet DVNM Bot <span aria-hidden="true">↗</span></button><button type="button" class="btn alt" id="dvnm-welcome-hear" aria-pressed="false">▶ Hear introduction</button><button type="button" class="dvnm-welcome-skip" id="dvnm-welcome-skip">Skip and explore the website</button></div></div>`;
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
    if (isHomePage && !welcomeAlreadySeen) {
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
    const robotCssUrl = new URL(`${botBase.replace(/\/$/, '')}/assets/css/dvnm-robot-3d.css?v=49`, location.href).href;
    if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === robotCssUrl)) {
      const robotCss = document.createElement('link'); robotCss.rel = 'stylesheet'; robotCss.href = robotCssUrl; document.head.appendChild(robotCss);
    }
    if (!document.querySelector('script[data-dvnm3d-loader]')) {
      const robotScript = document.createElement('script'); robotScript.src = new URL(`${botBase.replace(/\/$/, '')}/assets/js/dvnm-robot-3d.js?v=49`, location.href).href; robotScript.async = true; robotScript.dataset.dvnm3dLoader = 'true'; document.head.appendChild(robotScript);
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
      var info = describe(el);
      /* V32 owns the real DVNM launcher placement; do not retag it as a generic extra floater. */
      if (el.matches('#dvnm-bot-launcher, .dvnm-bot-dock, #dvnm-bot-panel')) return;
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
