(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  $$('[data-demo-scroll]').forEach(button => button.addEventListener('click', () => {
    const target = $(button.dataset.demoScroll); if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }));
  // v27 seven-demo explorer: any demo page can jump straight to the other six.
  const demoCatalog = [
    { slug: 'business', title: 'DVNM Biz', kind: 'Business', art: 'dvnm-biz.svg' },
    { slug: 'marketing', title: 'DVNM Growth', kind: 'Marketing', art: 'dvnm-growth.svg' },
    { slug: 'shop', title: 'DVNM Market', kind: 'Commerce', art: 'dvnm-market.svg' },
    { slug: 'portfolio', title: 'DVNM Creative', kind: 'Portfolio', art: 'dvnm-creative.svg' },
    { slug: 'learning', title: 'DVNM Skills', kind: 'Learning', art: 'dvnm-skills.svg' },
    { slug: 'technology', title: 'DVNM Digital', kind: 'Technology', art: 'dvnm-digital.svg' },
    { slug: 'community', title: 'DVNM Connect', kind: 'Community', art: 'dvnm-connect.svg' }
  ];
  const pageSlug = location.pathname.split('/').filter(Boolean).pop()?.replace(/\.html?$/i, '') || '';
  if (demoCatalog.some(item => item.slug === pageSlug)) {
    const explorer = document.createElement('section');
    explorer.className = 'demo-explorer';
    explorer.setAttribute('aria-labelledby', 'demo-explorer-title');
    explorer.innerHTML = `<div class="demo-explorer-heading"><div><span class="demo-eyebrow">Demo Studio navigator</span><h2 id="demo-explorer-title">Explore all seven experiences.</h2><p>Move between sample websites without returning to the directory each time.</p></div><a class="demo-explorer-all" href="./">All seven demos <span aria-hidden="true">↗</span></a></div><div class="demo-explorer-track" aria-label="All seven website demonstrations">${demoCatalog.map(item => `<a class="demo-explorer-card${item.slug === pageSlug ? ' is-current' : ''}" href="${item.slug}" ${item.slug === pageSlug ? 'aria-current="page"' : ''}><img src="../assets/images/demo-art/${item.art}" width="720" height="400" alt="" loading="lazy" decoding="async"><span class="demo-explorer-kind">${item.kind}</span><strong>${item.title}</strong><span class="demo-explorer-open">${item.slug === pageSlug ? 'You are here' : 'Explore sample'} <span aria-hidden="true">→</span></span></a>`).join('')}</div>`;
    const hero = $('main .demo-hero');
    if (hero) hero.insertAdjacentElement('afterend', explorer);
    else $('main')?.insertAdjacentElement('afterbegin', explorer);
  }

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
    if (total) total.textContent = `₦${cartTotal.toLocaleString('en-NG')}`;
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
