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
    const revealTargets = $$(selector).slice(0, 90);
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
  if (contactTopic && requestedTopic && requestedTopic.toLowerCase() === 'nexus') {
    contactTopic.value = 'Product question';
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
    contact.innerHTML = '<span class="wa-glyph" aria-hidden="true">↗</span><span class="wa-copy"><strong>Talk to our team</strong><small>WhatsApp · quick contact</small></span>';
    document.body.appendChild(contact);
  }

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const baseMeta = $('meta[name="site-base"]');
    const basePath = baseMeta ? baseMeta.content : '.';
    const swUrl = new URL(`${basePath}/sw.js`, location.href);
    const swScope = new URL(`${basePath}/`, location.href).pathname;
    window.addEventListener('load', () => navigator.serviceWorker.register(swUrl.href, { scope: swScope }).catch(() => {}));
  }
})();
