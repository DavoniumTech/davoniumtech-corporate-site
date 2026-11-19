/* Davonium V67 Pricing: package descriptions + unapproved price guard. */
(function () {
  'use strict';
  var config = window.DVNM_V67_PRICING;
  var cards = document.getElementById('pricing-cards');
  var status = document.getElementById('currency-status');
  if (!config || !cards) return;
  var currency = config.defaultCurrency || 'NGN';
  function esc(value) { return String(value).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); }); }
  function render() {
    cards.innerHTML = config.packages.map(function (p, index) {
      var features = p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('');
      return '<article class="v67-price-card ' + (index === 2 ? 'featured' : '') + '">' +
        '<span class="v67-label">' + esc(p.number) + ' · ' + esc(p.demo) + '</span>' +
        '<h3>' + esc(p.name) + '</h3><p>' + esc(p.audience) + '</p>' +
        '<div class="v67-quote-state">' + (p.priceNGN == null && p.priceUSD == null ? 'Request a scoped quote' : esc((currency === 'USD' ? '$' : '₦') + (currency === 'USD' ? p.priceUSD : p.priceNGN))) + '</div>' +
        '<p><strong>Typical scope:</strong> ' + esc(p.scope) + '</p><ul>' + features + '</ul>' +
        '<div class="v67-card-actions"><a class="btn alt" href="' + esc(p.demoUrl) + '">Explore demo</a><a class="btn" href="project-builder?type=' + encodeURIComponent(({"quick-launch":"landing","business-essential":"business","business-growth":"growth","dvnm-commerce":"commerce","custom-solutions":"technology"})[p.id] || 'business') + '&package=' + encodeURIComponent(p.id) + '">Choose package</a></div>' +
        '</article>';
    }).join('');
    if (status) status.textContent = 'Preferred quotation currency: ' + currency + '. Published package prices are pending approval.';
    document.querySelectorAll('[data-currency]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.currency === currency)); });
  }
  document.querySelectorAll('[data-currency]').forEach(function (button) {
    button.addEventListener('click', function () { currency = button.dataset.currency === 'USD' ? 'USD' : 'NGN'; render(); });
  });
  render();
})();
