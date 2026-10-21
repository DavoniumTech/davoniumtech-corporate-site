(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  $$('[data-demo-scroll]').forEach(button => button.addEventListener('click', () => {
    const target = $(button.dataset.demoScroll); if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }));
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
