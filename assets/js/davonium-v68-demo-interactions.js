/* Small front-end-only interactions for V68 independent demo pages. */
(function () {
  'use strict';
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-v68-filter]');
    if (!button) return;
    var group = button.getAttribute('data-v68-group');
    var filter = button.getAttribute('data-v68-filter');
    if (!group || !filter) return;
    var scope = button.closest('section') || document;
    scope.querySelectorAll('[data-v68-filter][data-v68-group="' + group + '"]').forEach(function (item) {
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    var visible = 0;
    scope.querySelectorAll('[data-v68-item][data-v68-group="' + group + '"]').forEach(function (item) {
      var match = filter === 'all' || item.getAttribute('data-v68-category') === filter;
      item.hidden = !match;
      if (match) visible += 1;
    });
    var status = scope.querySelector('[data-v68-filter-status]');
    if (status) status.textContent = visible + (visible === 1 ? ' sample item shown.' : ' sample items shown.');
  });
}());
