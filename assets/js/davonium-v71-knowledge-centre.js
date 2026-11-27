/* Davonium Technologies — searchable Knowledge Centre */
(function () {
  'use strict';
  var input = document.getElementById('knowledge-search');
  var count = document.getElementById('knowledge-count');
  if (!input || !count) return;
  var entries = Array.prototype.slice.call(document.querySelectorAll('[data-knowledge-entry]'));
  var categories = Array.prototype.slice.call(document.querySelectorAll('[data-knowledge-category]'));
  function filter() {
    var q = input.value.trim().toLocaleLowerCase();
    var visible = 0;
    categories.forEach(function (section) {
      var sectionVisible = 0;
      section.querySelectorAll('[data-knowledge-entry]').forEach(function (entry) {
        var match = !q || entry.textContent.toLocaleLowerCase().indexOf(q) !== -1;
        entry.hidden = !match;
        if (match) { visible++; sectionVisible++; }
      });
      section.hidden = sectionVisible === 0;
    });
    count.textContent = q ? ('Showing ' + visible + ' matching term' + (visible === 1 ? '' : 's') + '.') : ('Showing ' + entries.length + ' terms across ' + categories.length + ' topic areas.');
  }
  input.addEventListener('input', filter);
  filter();
}());
