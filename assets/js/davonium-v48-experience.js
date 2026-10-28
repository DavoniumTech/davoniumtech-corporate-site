/* Davonium V49 experience controller. Enhancements only; core content remains usable without WebGL. */
(() => {
  'use strict';
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const root = document.documentElement;
  root.dataset.davoniumRelease = 'V49';
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
      css.href = new URL('assets/css/dvnm-robot-3d.css?v=49', baseUrl).href;
      document.head.appendChild(css);
    }
    if (!$('script[data-dvnm3d-loader]')) {
      const script = document.createElement('script');
      script.async = true; script.dataset.dvnm3dLoader = 'true';
      script.src = new URL('assets/js/dvnm-robot-3d.js?v=49', baseUrl).href;
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
