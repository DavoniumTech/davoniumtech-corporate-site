/* Davonium V68 workspace preview engine. Local sample data only; no backend calls. */
(function () {
  'use strict';
  var mount = document.getElementById('workspace-app');
  if (!mount) return;
  var key = mount.getAttribute('data-workspace');
  var all = window.DVNM_V67_WORKSPACES || {};
  var config = all[key];
  if (!config) return;

  var original = JSON.parse(JSON.stringify(config.modules || {}));
  var state = JSON.parse(JSON.stringify(original));
  var active = 'Overview';
  var toast = '';
  var query = '';
  var sortAsc = true;
  var collapsed = false;
  var activity = [
    ['✦', 'Workspace preview opened', 'Just now'],
    ['↻', 'Sample content reviewed', 'Earlier today'],
    ['✓', 'Mobile layout available', 'Preview feature']
  ];

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function totalItems() {
    return Object.keys(state).reduce(function (sum, name) { return sum + (state[name] || []).length; }, 0);
  }
  function setToast(message) {
    toast = message;
    var status = mount.querySelector('.workspace-toast');
    if (status) status.textContent = message;
  }
  function moduleButtons() {
    return Object.keys(state).map(function (name, i) {
      var glyphs = ['▦', '◈', '▤', '✦', '◉', '↗', '⌘', '⚙'];
      return '<button type="button" data-module="' + esc(name) + '" ' + (name === active ? 'aria-current="page"' : '') + '><span aria-hidden="true">' + glyphs[i % glyphs.length] + '</span><span>' + esc(name) + '</span><small>' + (state[name] || []).length + '</small></button>';
    }).join('');
  }
  function renderShell() {
    mount.style.setProperty('--wk-accent', config.accent || '#7652de');
    mount.style.setProperty('--wk-accent-2', config.accent2 || '#ab77f1');
    mount.innerHTML =
      '<div class="workspace-app' + (collapsed ? ' is-sidebar-collapsed' : '') + '">' +
        '<aside class="workspace-sidebar" aria-label="Workspace navigation">' +
          '<div class="workspace-brand"><span class="workspace-mark" aria-hidden="true">' + esc(config.mark || 'D') + '</span><div><strong>' + esc(config.name) + '</strong><small>DAVONIUM · SAMPLE SPACE</small></div></div>' +
          '<div class="wk-sidebar-label">WORKSPACE</div>' +
          '<nav class="workspace-nav" aria-label="Workspace modules">' +
            '<button type="button" data-module="Overview" ' + (active === 'Overview' ? 'aria-current="page"' : '') + '><span aria-hidden="true">⌂</span><span>Overview</span></button>' + moduleButtons() +
          '</nav>' +
          '<div class="workspace-side-note"><strong>Preview environment</strong><br>Sample records are held in this page session. Nothing is published to a customer website or production database.</div>' +
          '<a class="wk-sidebar-link" href="' + esc(config.demo) + '">Open public website <span aria-hidden="true">↗</span></a>' +
        '</aside>' +
        '<div class="workspace-main">' +
          '<div class="wk-toolbar"><div class="wk-crumb"><span>Workspaces</span><b>/</b><strong>' + esc(config.demoName) + '</strong><b>/</b><span>' + esc(active) + '</span></div>' +
            '<div class="wk-toolbar-actions"><label class="wk-search-wrap"><span class="sr-only">Search the current workspace module</span><input class="wk-search" type="search" placeholder="Search this workspace…" aria-label="Search this workspace" value="' + esc(query) + '"></label><button class="wk-toolbar-button" type="button" data-action="notifications" aria-label="Show sample notifications">♧ <span class="wk-notification-dot"></span></button><button class="wk-toolbar-button wk-collapse-button" type="button" data-action="collapse" aria-pressed="' + collapsed + '" aria-label="Toggle sidebar">☷</button></div>' +
          '</div>' +
          '<header class="workspace-header"><div><span class="wk-eyebrow">' + esc(config.tagline || 'Management workspace') + '</span><h1>' + esc(config.name) + '</h1><p>' + esc(config.summary) + '</p></div><div class="workspace-live">INTERACTIVE PREVIEW</div></header>' +
          '<section class="workspace-stats" aria-label="Sample workspace summary">' + (config.stats || []).map(function (x) {
            return '<article class="workspace-stat"><small>' + esc(x[0]) + '</small><strong>' + esc(x[1]) + '</strong><span>' + esc(x[2]) + '</span></article>';
          }).join('') + '</section>' +
          '<section class="workspace-panel" id="workspace-view" aria-live="polite"></section>' +
        '</div>' +
      '</div>';
    renderView();
  }
  function renderOverview() {
    var modules = Object.keys(state);
    var activityMarkup = activity.map(function (item) {
      return '<div class="wk-activity-item"><span class="wk-activity-mark" aria-hidden="true">' + esc(item[0]) + '</span><div><strong>' + esc(item[1]) + '</strong><small>' + esc(item[2]) + '</small></div></div>';
    }).join('');
    var shortcuts = modules.slice(0, 4).map(function (name) {
      return '<button class="workspace-button" type="button" data-module="' + esc(name) + '">' + esc(name) + ' <span aria-hidden="true">↗</span></button>';
    }).join('');
    return '<div class="workspace-panel-head"><div><span class="wk-eyebrow">OVERVIEW</span><h2>Good to see you.</h2><p>A snapshot of the sample content inside ' + esc(config.demoName) + '.</p></div><span class="wk-pill">' + totalItems() + ' sample records</span></div>' +
      '<div class="wk-overview-grid"><section class="wk-panel"><h3>Workspace activity</h3><p>Illustrative activity volume across this sample space.</p><div class="wk-bars" role="img" aria-label="Illustrative weekly activity chart"><span style="--bar-height:43%"></span><span style="--bar-height:61%"></span><span style="--bar-height:52%"></span><span style="--bar-height:78%"></span><span style="--bar-height:66%"></span><span style="--bar-height:92%"></span><span style="--bar-height:73%"></span></div><div class="wk-legend"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div><div class="wk-quick-actions">' + shortcuts + '</div></section>' +
      '<section class="wk-panel"><h3>Recent activity</h3><p>Example updates in the demonstration environment.</p><div class="wk-activity">' + activityMarkup + '</div></section></div>' +
      '<div class="workspace-overview-grid"><div class="workspace-note"><strong>About this preview</strong><p>This is an interactive front-end demonstration. You can create, edit, search and remove sample content. Changes stay in this page session and are reset when the page is refreshed.</p><div class="workspace-reset-row"><button class="workspace-button" type="button" data-action="go-first">Open content manager</button><button class="workspace-button" type="button" data-action="reset">Reset demonstration</button></div></div><div class="workspace-note"><strong>Related website</strong><p>Explore the visitor-facing ' + esc(config.demoName) + ' experience to see how the managed content could appear to customers.</p><div class="workspace-reset-row"><a href="' + esc(config.demo) + '">Open public demo ↗</a></div></div></div><p class="workspace-toast" role="status">' + esc(toast) + '</p>';
  }
  function renderModule() {
    var items = (state[active] || []).slice();
    if (sortAsc) items.sort(function (a, b) { return a.localeCompare(b); });
    if (query) items = items.filter(function (item) { return item.toLowerCase().includes(query.toLowerCase()); });
    var itemMarkup = items.map(function (item) {
      var originalIndex = state[active].indexOf(item);
      return '<form class="workspace-item" data-edit-form data-index="' + originalIndex + '"><span class="wk-row-index">' + String(originalIndex + 1).padStart(2, '0') + '</span><input name="value" aria-label="Edit sample item ' + (originalIndex + 1) + '" value="' + esc(item) + '" maxlength="90" required><span class="wk-row-tag">SAMPLE</span><button type="submit">Save</button><button type="button" data-action="remove" data-index="' + originalIndex + '">Remove</button></form>';
    }).join('');
    return '<div class="workspace-panel-head"><div><span class="wk-eyebrow">CONTENT MANAGER</span><h2>' + esc(active) + '</h2><p>Manage the example entries for this module. Updates are local to this preview.</p></div><span class="wk-pill">' + (state[active] || []).length + ' records</span></div>' +
      '<div class="wk-module-toolbar"><span class="wk-module-label">' + esc(config.demoName) + ' / ' + esc(active) + '</span><div><button type="button" class="workspace-button" data-action="sort">' + (sortAsc ? 'Sort A–Z' : 'Default order') + '</button><button type="button" class="workspace-button" data-action="preview">Preview changes</button></div></div>' +
      (items.length ? '<div class="workspace-items" role="list">' + itemMarkup + '</div>' : '<div class="workspace-empty">' + (query ? 'No sample entries match your search.' : 'This module has no sample records yet. Add an example below to explore it.') + '</div>') +
      '<form class="workspace-add" data-add-form><label class="sr-only" for="wk-new-item">New sample entry</label><input id="wk-new-item" name="value" maxlength="90" placeholder="Add a sample ' + esc(active.toLowerCase()) + ' entry" required><button class="workspace-button" type="submit">＋ Add sample item</button></form>' +
      '<div class="workspace-reset-row"><button class="workspace-button" type="button" data-action="reset">Reset demonstration</button><span class="wk-local-note">Local sample data · Not connected to a backend</span></div><p class="workspace-toast" role="status">' + esc(toast) + '</p>';
  }
  function renderView() {
    var view = document.getElementById('workspace-view');
    if (!view) return;
    view.innerHTML = active === 'Overview' ? renderOverview() : renderModule();
    mount.querySelectorAll('[data-module]').forEach(function (button) {
      if (button.dataset.module === active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    var crumb = mount.querySelector('.wk-crumb span:last-child');
    if (crumb) crumb.textContent = active;
  }
  mount.addEventListener('click', function (event) {
    var button = event.target.closest('[data-module],[data-action]');
    if (!button) return;
    if (button.hasAttribute('data-module')) {
      active = button.dataset.module;
      toast = '';
      renderView();
      return;
    }
    var action = button.dataset.action;
    if (action === 'remove') {
      var index = Number(button.dataset.index);
      if (Number.isInteger(index) && state[active]) {
        state[active].splice(index, 1);
        toast = 'Sample entry removed.';
        renderView();
      }
    } else if (action === 'reset') {
      state = JSON.parse(JSON.stringify(original)); active = 'Overview'; query = '';
      var search = mount.querySelector('.wk-search'); if (search) search.value = '';
      activity.unshift(['↺', 'Sample data restored to its starting state', 'Just now']);
      toast = 'The original sample content has been restored.';
      renderView();
    } else if (action === 'go-first') {
      active = Object.keys(state)[0] || 'Overview'; toast = ''; renderView();
    } else if (action === 'preview') {
      toast = 'Preview updated using the current sample entries.'; renderView();
    } else if (action === 'sort') {
      sortAsc = !sortAsc; toast = sortAsc ? 'Sample entries sorted A–Z.' : 'Default sample order restored.'; renderView();
    } else if (action === 'collapse') {
      collapsed = !collapsed;
      var app = mount.querySelector('.workspace-app');
      if (app) app.classList.toggle('is-sidebar-collapsed', collapsed);
      button.setAttribute('aria-pressed', String(collapsed));
    } else if (action === 'notifications') {
      toast = 'You are viewing a sample workspace. There are no live notifications.';
      var status = mount.querySelector('.workspace-toast'); if (status) status.textContent = toast;
    }
  });
  mount.addEventListener('input', function (event) {
    if (!event.target.matches('.wk-search')) return;
    query = event.target.value.trim();
    if (active !== 'Overview') renderView();
  });
  mount.addEventListener('submit', function (event) {
    var form = event.target;
    if (form.matches('[data-edit-form]')) {
      event.preventDefault();
      var index = Number(form.dataset.index);
      var value = form.elements.value.value.trim();
      if (value && state[active] && Number.isInteger(index)) {
        state[active][index] = value;
        toast = 'Sample entry updated.';
        renderView();
      }
    } else if (form.matches('[data-add-form]')) {
      event.preventDefault();
      var added = form.elements.value.value.trim();
      if (added && state[active]) {
        state[active].push(added);
        activity.unshift(['＋', 'A sample ' + active.toLowerCase() + ' entry was added', 'Just now']);
        toast = 'Sample entry added.';
        renderView();
      }
    }
  });
  renderShell();
}());
