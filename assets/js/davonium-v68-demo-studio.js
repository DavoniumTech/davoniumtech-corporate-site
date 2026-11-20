/* Demo Studio filters — client-side only; preserves all original demo destinations. */
(function () {
  'use strict';
  var bar = document.querySelector('.v68-studio-filterbar');
  if (!bar) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-v68-studio-category]'));
  var status = document.querySelector('.v68-studio-filter-status');
  function apply(filter) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = filter === 'all' || card.getAttribute('data-v68-studio-category') === filter;
      card.hidden = !match;
      if (match) shown += 1;
    });
    bar.querySelectorAll('button[data-studio-filter]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-studio-filter') === filter));
    });
    if (status) status.textContent = filter === 'all' ? 'Showing all eight independent experiences.' : 'Showing ' + shown + ' experience' + (shown === 1 ? '' : 's') + ' in this category.';
  }
  bar.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-studio-filter]');
    if (button) apply(button.getAttribute('data-studio-filter'));
  });
  apply('all');
}());
