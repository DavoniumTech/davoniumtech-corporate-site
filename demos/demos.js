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
