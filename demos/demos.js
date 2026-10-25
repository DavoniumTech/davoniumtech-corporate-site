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
  // Demo shop cart keeps quantities in memory only; there is no checkout or payment connection.
  let cartCount = 0, cartTotal = 0;
  $$('[data-add-demo]').forEach(button => button.addEventListener('click', () => {
    cartCount += 1; cartTotal += Number(button.dataset.price || 0);
    const count = $('#demo-cart-count'), total = $('#demo-cart-total'), message = $('#demo-cart-message');
    if (count) count.textContent = String(cartCount);
    if (total) total.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cartTotal);
    if (message) message.textContent = `${button.dataset.product || 'Sample item'} added to this temporary demo bag.`;
  }));

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
