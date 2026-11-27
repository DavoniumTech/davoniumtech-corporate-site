/* Davonium Technologies V68 — distinct, local-only workspace experiences.
   No backend, account, payments, or persistence. All sample changes live in memory. */
(function () {
  'use strict';
  var mount = document.getElementById('workspace-app');
  if (!mount) return;
  var key = mount.getAttribute('data-workspace');
  var all = window.DVNM_V67_WORKSPACES || {};
  var config = all[key];
  if (!config) { mount.textContent = 'This workspace preview is not available.'; return; }

  var original = JSON.parse(JSON.stringify(config.modules || {}));
  var state = JSON.parse(JSON.stringify(original));
  var active = 'Overview';
  var query = '';
  var sortAsc = false;
  var collapsed = false;
  var toast = 'Sample workspace ready. Nothing here is connected to a live account.';
  var activity = [
    ['↗', 'Workspace preview opened', 'Just now'],
    ['✦', 'Sample content prepared', 'Earlier today'],
    ['✓', 'Responsive preview available', 'Preview feature']
  ];
  var demoHref = config.demo || '../demos/';
  var accentMap = {biz:['#6746c4','#a58be9','#f0eaff'],market:['#16734d','#64ba8d','#e3f5e9'],creative:['#7549b6','#d08ab8','#f3e9fa'],skills:['#2d61b5','#75a9e6','#e8f1ff'],digital:['#087c8b','#59c5d0','#e2f6f8']};
  var palette = accentMap[key] || accentMap.biz;
  var metricIcons = ['◫','↗','◎','✦'];
  var moduleIcons = ['▦','◈','▤','✦','◉','↗','⌘','⚙'];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function totalItems() {
    return Object.keys(state).reduce(function (sum, name) { return sum + (state[name] || []).length; }, 0);
  }
  function modules() { return Object.keys(state); }
  function firstModule() { return modules()[0] || 'Content'; }
  function setToast(message) {
    toast = message;
    var el = mount.querySelector('[data-wk-toast]');
    if (el) el.textContent = message;
  }
  function safeItems(name) { return (state[name] || []).slice(); }

  // DVNM Forge V71: browser-local persistence, undo/redo, import/export and media library.
  var storageKey = 'dvnm-forge-v1:' + key;
  var undoStack = [];
  var redoStack = [];
  var mediaItems = [];
  var mediaUrls = Object.create(null);
  var mediaDbPromise = null;
  var persistenceAvailable = true;

  function cloneModules(value) { return JSON.parse(JSON.stringify(value || {})); }
  function validModules(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    return Object.keys(value).every(function (name) {
      return Array.isArray(value[name]) && value[name].every(function (item) { return typeof item === 'string'; });
    });
  }
  function loadSavedModules() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && saved.version === 1 && validModules(saved.modules)) state = cloneModules(saved.modules);
    } catch (_) { persistenceAvailable = false; }
  }
  function persistModules() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({version:1,workspace:key,updatedAt:new Date().toISOString(),modules:state}));
      toast = 'Saved on this device.';
      return true;
    } catch (_) {
      persistenceAvailable = false;
      toast = 'Could not save. This browser may be low on storage space.';
      return false;
    }
  }
  function rememberChange() {
    undoStack.push(cloneModules(state));
    if (undoStack.length > 40) undoStack.shift();
    redoStack = [];
  }
  function undoChange() {
    if (!undoStack.length) { setToast('There are no more changes to undo.'); return; }
    redoStack.push(cloneModules(state));
    state = undoStack.pop();
    persistModules();
    toast = 'Change undone. Saved on this device.';
    renderView();
  }
  function redoChange() {
    if (!redoStack.length) { setToast('There are no changes to redo.'); return; }
    undoStack.push(cloneModules(state));
    state = redoStack.pop();
    persistModules();
    toast = 'Change restored. Saved on this device.';
    renderView();
  }
  function openMediaDb() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB is not available in this browser.'));
    if (mediaDbPromise) return mediaDbPromise;
    mediaDbPromise = new Promise(function (resolve, reject) {
      var request = indexedDB.open('davonium-dvnm-forge-media', 1);
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains('media')) db.createObjectStore('media', {keyPath:'id'});
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error('Could not open local media storage.')); };
    });
    return mediaDbPromise;
  }
  function loadMediaItems() {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var request = db.transaction('media','readonly').objectStore('media').getAll();
        request.onsuccess = function () {
          mediaItems = (request.result || []).filter(function (item) { return item.workspace === key; });
          resolve(mediaItems);
        };
        request.onerror = function () { reject(request.error || new Error('Could not read saved media.')); };
      });
    });
  }
  function storeMediaItem(record) {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('media','readwrite');
        tx.objectStore('media').put(record);
        tx.oncomplete = function () { resolve(record); };
        tx.onerror = function () { reject(tx.error || new Error('Could not save media.')); };
      });
    });
  }
  function deleteMediaItem(id) {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('media','readwrite');
        tx.objectStore('media').delete(id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error || new Error('Could not remove media.')); };
      });
    });
  }
  function mediaUrl(item) {
    if (!mediaUrls[item.id]) mediaUrls[item.id] = URL.createObjectURL(item.blob);
    return mediaUrls[item.id];
  }
  function safeFilename(name) {
    return String(name || 'file').replace(/[^a-z0-9._-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,100) || 'file';
  }
  function downloadBlob(filename, blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  function exportWorkspaceJson() {
    var payload = {format:'dvnm-forge-workspace',schemaVersion:1,workspace:key,workspaceName:config.name,exportedAt:new Date().toISOString(),modules:state,media:mediaItems.map(function (m) { return {id:m.id,name:m.name,type:m.type,size:m.size,createdAt:m.createdAt}; })};
    downloadBlob('dvnm-forge-' + key + '-workspace.json', new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    setToast('Workspace JSON exported.');
  }
  function zipCrc32(bytes) {
    var crc = -1;
    for (var i=0;i<bytes.length;i++) {
      crc ^= bytes[i];
      for (var j=0;j<8;j++) crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
    return (crc ^ -1) >>> 0;
  }
  function zipBytes(files) {
    var encoder = new TextEncoder(), local = [], central = [], offset = 0, centralSize = 0;
    function u16(n) { return new Uint8Array([n & 255,(n >>> 8) & 255]); }
    function u32(n) { return new Uint8Array([n & 255,(n >>> 8) & 255,(n >>> 16) & 255,(n >>> 24) & 255]); }
    function join(parts) { return new Blob(parts).arrayBuffer().then(function (ab) { return new Uint8Array(ab); }); }
    var chain = Promise.resolve();
    files.forEach(function (file) {
      chain = chain.then(function () {
        var name = encoder.encode(file.name), dataPromise = file.data instanceof Uint8Array ? Promise.resolve(file.data) : file.data instanceof Blob ? file.data.arrayBuffer().then(function (ab) { return new Uint8Array(ab); }) : Promise.resolve(encoder.encode(String(file.data)));
        return dataPromise.then(function (data) {
          var crc = zipCrc32(data);
          var header = join([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0x21),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name]);
          return header.then(function (localHeader) {
            local.push(localHeader,data);
            var entry = join([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0x21),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]);
            return entry.then(function (centralHeader) { central.push(centralHeader); centralSize += centralHeader.length; offset += localHeader.length + data.length; });
          });
        });
      });
    });
    return chain.then(function () {
      var end = join([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(centralSize),u32(offset),u16(0)]);
      return end.then(function (endHeader) { return new Blob(local.concat(central,[endHeader]),{type:'application/zip'}); });
    });
  }
  function exportWorkspaceZip() {
    var payload = {format:'dvnm-forge-workspace',schemaVersion:1,workspace:key,workspaceName:config.name,exportedAt:new Date().toISOString(),modules:state};
    var files = [{name:'workspace.json',data:JSON.stringify(payload,null,2)},{name:'README.txt',data:'DVNM Forge local workspace export\nWorkspace: '+config.name+'\nBuilt with DVNM Forge by Davonium Technologies.\nAll records are local sample content unless replaced by the workspace owner.\n'}];
    mediaItems.forEach(function (item) { files.push({name:'media/'+safeFilename(item.name),data:item.blob}); });
    zipBytes(files).then(function (blob) {
      downloadBlob('dvnm-forge-' + key + '-workspace.zip',blob);
      setToast('Workspace ZIP exported with ' + mediaItems.length + ' media file(s).');
    }).catch(function () { setToast('The ZIP export could not be created in this browser.'); });
  }
  function importWorkspaceJson(file) {
    if (!file) return;
    file.text().then(function (textValue) {
      var payload = JSON.parse(textValue);
      if (!payload || payload.format !== 'dvnm-forge-workspace' || payload.schemaVersion !== 1 || payload.workspace !== key || !validModules(payload.modules)) throw new Error('This file is not a valid export for this workspace.');
      rememberChange();
      state = cloneModules(payload.modules);
      persistModules();
      active = 'Overview'; query = ''; sortAsc = false;
      toast = 'Workspace imported and saved on this device.';
      renderShell();
    }).catch(function (error) { setToast(error.message || 'Could not import this JSON file.'); });
  }
  function uploadMediaFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    files = files.filter(function (file) {
      return /^image\\/(png|jpeg|webp|gif|svg\\+xml)$/.test(file.type) && file.size <= 10 * 1024 * 1024;
    });
    if (!files.length) { setToast('Choose PNG, JPEG, WebP, GIF or SVG images up to 10 MB each.'); return; }
    Promise.all(files.map(function (file) {
      var id = key + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
      return storeMediaItem({id:id,workspace:key,name:safeFilename(file.name),type:file.type,size:file.size,createdAt:new Date().toISOString(),blob:file});
    })).then(function (saved) {
      mediaItems = mediaItems.concat(saved);
      renderView(); setToast(saved.length + ' media file(s) saved in this browser.');
    }).catch(function (error) { setToast(error.message || 'Media upload failed.'); });
  }
  function renderMediaPanel() {
    var cards = mediaItems.map(function (item) {
      return '<article class="wk-media-item"><img src="' + esc(mediaUrl(item)) + '" alt="' + esc(item.name) + '"><div><strong>' + esc(item.name) + '</strong><small>' + Math.max(1,Math.round(item.size/1024)) + ' KB</small></div><button type="button" class="wk-secondary-button" data-action="remove-media" data-media-id="' + esc(item.id) + '">Remove</button></article>';
    }).join('');
    return '<section class="wk-panel wk-media-panel"><div class="wk-panel-head"><div><h2>Media library</h2><p>Upload images for this local workspace. Files stay in this browser and are included in ZIP exports.</p></div><span class="wk-sample-tag">' + mediaItems.length + ' files</span></div><label class="wk-primary-button wk-media-upload">＋ Upload images<input type="file" data-forge-media multiple accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"></label>' + (cards ? '<div class="wk-media-grid">' + cards + '</div>' : '<p class="wk-empty">No uploaded images yet. Add a few files to build this workspace media library.</p>') + '</section>';
  }
  function mediaPanelToolbar() {
    return '<nav class="wk-forge-toolbar" aria-label="DVNM Forge tools"><span class="wk-forge-brand">DVNM FORGE</span><button type="button" class="wk-secondary-button" data-action="undo" ' + (!undoStack.length?'disabled':'') + '>↶ Undo</button><button type="button" class="wk-secondary-button" data-action="redo" ' + (!redoStack.length?'disabled':'') + '>↷ Redo</button><button type="button" class="wk-secondary-button" data-action="export-json">Export JSON</button><button type="button" class="wk-secondary-button" data-action="export-zip">Export ZIP</button><button type="button" class="wk-secondary-button" data-action="import-json">Import JSON</button><input type="file" data-forge-import accept="application/json,.json" hidden><span class="wk-save-state">' + (persistenceAvailable?'Autosave on':'Local storage unavailable') + '</span></nav>';
  }
  function moduleNav() {
    return '<button type="button" data-module="Overview" ' + (active === 'Overview' ? 'aria-current="page"' : '') + '><span class="wk-nav-icon" aria-hidden="true">⌂</span><span class="wk-nav-name">Overview</span></button>' +
      modules().map(function (name, i) {
        return '<button type="button" data-module="' + esc(name) + '" ' + (active === name ? 'aria-current="page"' : '') + '><span class="wk-nav-icon" aria-hidden="true">' + moduleIcons[i % moduleIcons.length] + '</span><span class="wk-nav-name">' + esc(name) + '</span><small>' + (state[name] || []).length + '</small></button>';
      }).join('');
  }
  function metrics() {
    return '<div class="wk-metrics" aria-label="Sample workspace metrics">' + (config.stats || []).map(function (item, i) {
      return '<article class="wk-metric"><div class="wk-metric-head"><span>' + esc(item[0]) + '</span><span class="wk-metric-icon" aria-hidden="true">' + metricIcons[i % metricIcons.length] + '</span></div><strong>' + esc(item[1]) + '</strong><small>' + esc(item[2] || 'Sample data') + '</small></article>';
    }).join('') + '</div>';
  }
  function activityList() {
    return '<div class="wk-activity-list">' + activity.slice(0, 5).map(function (item) {
      return '<div class="wk-activity-row"><span class="wk-activity-symbol" aria-hidden="true">' + esc(item[0]) + '</span><div><strong>' + esc(item[1]) + '</strong><small>Local preview activity</small></div><time>' + esc(item[2]) + '</time></div>';
    }).join('') + '</div>';
  }
  function chartBars(values) {
    return '<div class="wk-chart" role="img" aria-label="Illustrative weekly activity chart">' + values.map(function (n) { return '<span class="wk-chart-bar" style="--bar:' + n + '%"></span>'; }).join('') + '</div><div class="wk-chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>';
  }
  function panel(title, description, content, tag) {
    return '<section class="wk-panel"><div class="wk-panel-head"><div><h2>' + esc(title) + '</h2><p>' + esc(description) + '</p></div>' + (tag ? '<span class="wk-sample-tag">' + esc(tag) + '</span>' : '') + '</div>' + content + '</section>';
  }
  function inlineRows(rows) {
    return '<div class="wk-inline-list">' + rows.map(function (r) {
      return '<div class="wk-inline-row"><div><strong>' + esc(r[0]) + '</strong><small>' + esc(r[1]) + '</small></div><span class="wk-state">' + esc(r[2]) + '</span></div>';
    }).join('') + '</div>';
  }

  function overviewBiz() {
    var leads = [['New website enquiry','New','Today'],['Service consultation','In review','Yesterday'],['Company profile update','Qualified','2 days ago']];
    var check = ['Homepage copy reviewed','Service descriptions current','Contact details confirmed','Search preview prepared'];
    return '<div class="wk-biz-health"><div><span class="wk-eyebrow">Website operations</span><strong>Content and enquiries at a glance</strong><p>Example management view for a service-led business website.</p></div><span class="wk-state">Preview ready</span></div>' +
      '<div class="wk-dashboard-grid" style="margin-top:14px"><div>' +
      panel('Enquiry pipeline','Illustrative incoming requests and their current stage.','<div class="wk-content-board">' + ['New','In review','Qualified'].map(function (status, i) { return '<div class="wk-board-column"><h3>' + status + '<small>' + (i + 1) + '</small></h3><div class="wk-board-card"><strong>' + leads[i][0] + '</strong><small>' + leads[i][2] + ' · Sample enquiry</small></div></div>'; }).join('') + '</div>','Sample') +
      panel('Website content checklist','A practical content review before a site update.','<div class="wk-biz-checks">' + check.map(function (x) { return '<span>✓ &nbsp;' + x + '</span>'; }).join('') + '</div>','Checklist') +
      '</div><div>' +
      panel('Recent activity','Updates shown in this demonstration. ',activityList(),'Activity') +
      panel('Quick access','Jump into a content area.','<div class="wk-inline-list">' + modules().slice(0,4).map(function (n) { return '<div class="wk-inline-row"><strong>' + esc(n) + '</strong><button class="wk-secondary-button" type="button" data-module="' + esc(n) + '">Open</button></div>'; }).join('') + '</div>','Modules') +
      '</div></div>';
  }
  function overviewMarket() {
    var productRows = [['Field notebook','Desk','42 units'],['Utility pouch','Carry','18 units'],['Everyday bag','Carry','Low stock']];
    return '<div class="wk-dashboard-grid"><div><section class="wk-market-revenue"><span class="wk-eyebrow" style="color:#c6efd7">Store performance · Sample</span><strong>₦1,284,000</strong><small>Illustrative gross sales value · Not real store revenue</small>' + chartBars([36,52,45,68,59,84,72]) + '</section>' +
      panel('Product catalogue','Example products configured for a small online store.','<div class="wk-inline-list">' + productRows.map(function (r) { return '<div class="wk-market-product"><span class="wk-product-thumb">▤</span><div><strong>' + r[0] + '</strong><small>' + r[1] + ' category · Sample product</small></div><span class="wk-state">' + r[2] + '</span></div>'; }).join('') + '</div>','Inventory') +
      '</div><div>' + panel('Order fulfilment','Sample orders; no payment or fulfilment connection.','' + inlineRows([['Order DM-1042','Awaiting review','New'],['Order DM-1041','Preparing package','In progress'],['Order DM-1040','Delivery details checked','Ready']]),'Orders') +
      panel('Store checklist','Core details to confirm before a real launch.','<div class="wk-biz-checks"><span>✓ Catalogue structure</span><span>✓ Delivery information</span><span>○ Payment provider</span><span>○ Tax and policies</span></div>','Setup') + '</div></div>';
  }
  function overviewCreative() {
    var projects = [['Brand direction','Identity','In review'],['Digital storefront','Web design','In progress'],['Editorial series','Photography','Planning'],['Product interface','UI design','Approved']];
    return '<div class="wk-dashboard-grid"><div>' + panel('Studio projects','A visual board for current creative work.','<div class="wk-creative-projects">' + projects.map(function (p,i) { return '<article class="wk-creative-project"><div class="wk-project-art">PROJECT / 0' + (i+1) + '</div><div class="wk-project-copy"><strong>' + p[0] + '</strong><small>' + p[1] + ' · ' + p[2] + '</small></div></article>'; }).join('') + '</div>','Portfolio') +
      panel('Creative output','Illustrative weekly delivery rhythm.','' + chartBars([40,63,55,78,61,88,74]),'Sample') +
      '</div><div>' + panel('Review queue','Items that may need feedback or approval.','' + inlineRows([['Homepage visual system','2 screens to review','Review'],['Campaign art direction','Moodboard draft','Draft'],['Portfolio case study','Copy and image pass','Ready']]),'Reviews') +
      panel('Studio activity','Example project updates. ',activityList(),'Activity') + '</div></div>';
  }
  function overviewSkills() {
    var courses = [['Web foundations',72,'8 of 11 lessons'],['Digital productivity',48,'5 of 10 lessons'],['Online safety',92,'11 of 12 lessons']];
    return '<div class="wk-dashboard-grid"><div>' + panel('Learning programmes','Course progress for an illustrative learning cohort.','' + courses.map(function (c,i) { return '<div class="wk-course-row"><span class="wk-course-mark">' + ['W','P','S'][i] + '</span><div><strong>' + c[0] + '</strong><small>' + c[2] + '</small><div class="wk-progress" style="margin-top:8px"><span style="--progress:' + c[1] + '%"></span></div></div><b style="font-size:.66rem;color:var(--wk-accent)">' + c[1] + '%</b></div>'; }).join(''),'Courses') +
      panel('Learning activity','Illustrative lesson activity across a week.','' + chartBars([26,46,62,48,73,82,91]),'Progress') +
      '</div><div>' + panel('Learner support','Sample activities that may need a facilitator.','' + inlineRows([['Learner cohort 01','New starter group','Active'],['Knowledge check','Feedback pending','Review'],['Portfolio activity','Submission example','Ready']]),'Learners') +
      panel('Teaching notes','Example updates in this learning workspace. ',activityList(),'Updates') + '</div></div>';
  }
  function overviewDigital() {
    var releases = [['Marvel Chat','Communication','In development'],['Ready2Go Learning','Education','In development'],['Davonium Nexus','Operations','In development'],['Corporate website','Web platform','Active']];
    return '<div class="wk-dashboard-grid"><div>' + panel('Product operations','Track product information and documentation in one view.','<div class="wk-release-status"><span>●</span> Operational overview · Sample environment</div><div class="wk-release-grid">' + releases.map(function (r) { return '<article class="wk-release-card"><strong>' + r[0] + '</strong><small>' + r[1] + ' · ' + r[2] + '</small></article>'; }).join('') + '</div>','Portfolio') +
      panel('Release readiness','Illustrative checks for a planned software release.','' + ['Release notes prepared','User journey reviewed','Accessibility pass scheduled','Support documentation updated'].map(function (x,i) { return '<div class="wk-inline-row"><strong>' + x + '</strong><span class="wk-state">' + (i < 2 ? 'Done' : 'Planned') + '</span></div>'; }).join(''),'Checklist') +
      '</div><div>' + panel('System signals','Example status indicators; not live monitoring.','' + inlineRows([['Website','Sample status','Available'],['Documentation','Sample status','Available'],['Product builds','Sample status','In progress']]),'Status') +
      panel('Recent activity','Sample product and documentation updates. ',activityList(),'Activity') + '</div></div>';
  }
  function overview() {
    var heading = key === 'biz' ? 'Your website, clearly organised.' : key === 'market' ? 'Your store, in view.' : key === 'creative' ? 'A studio space for work in progress.' : key === 'skills' ? 'Learning progress, made visible.' : 'Products and releases, in context.';
    var note = key === 'biz' ? 'Review pages, services and incoming enquiries in one place.' : key === 'market' ? 'Explore the sample catalogue, orders and store operations.' : key === 'creative' ? 'Organise projects, reviews and the stories behind the work.' : key === 'skills' ? 'Follow programmes, lessons and learner support activities.' : 'Keep product information, release notes and documentation organised.';
    var inner = key === 'biz' ? overviewBiz() : key === 'market' ? overviewMarket() : key === 'creative' ? overviewCreative() : key === 'skills' ? overviewSkills() : overviewDigital();
    return '<div class="wk-page-heading"><div><span class="wk-eyebrow">DVNM Forge · Local workspace</span><h1>' + esc(heading) + '</h1><p>' + esc(note) + '</p></div><button class="wk-primary-button" type="button" data-action="create">＋ Add sample record</button></div>' + metrics() + inner + renderMediaPanel() + '<p class="wk-toast" role="status" data-wk-toast>' + esc(toast) + '</p>';
  }
  function renderModule() {
    var items = safeItems(active);
    if (query) items = items.filter(function (item) { return item.toLowerCase().includes(query.toLowerCase()); });
    if (sortAsc) items.sort(function (a,b) { return a.localeCompare(b); });
    var rows = items.map(function (item) {
      var originalIndex = state[active].indexOf(item);
      return '<form class="wk-record-form" data-edit-form data-index="' + originalIndex + '"><span class="wk-record-index">' + String(originalIndex+1).padStart(2,'0') + '</span><input name="value" aria-label="Edit sample record ' + (originalIndex+1) + '" value="' + esc(item) + '" maxlength="90" required><button class="wk-secondary-button" type="submit">Save</button><button class="wk-secondary-button" data-action="remove" data-index="' + originalIndex + '" type="button">Remove</button></form>';
    }).join('');
    return '<div class="wk-page-heading"><div><span class="wk-eyebrow">' + esc(config.demoName) + ' / Content manager</span><h1>' + esc(active) + '</h1><p>Manage local workspace content. Changes autosave in this browser and are not sent to a server.</p></div><span class="wk-sample-tag">' + (state[active] || []).length + ' sample records</span></div>' +
      '<section class="wk-panel"><div class="wk-panel-head"><div><h2>' + esc(active) + ' records</h2><p>Rename, add or remove sample entries to explore this module.</p></div><div><button class="wk-secondary-button" type="button" data-action="sort">' + (sortAsc ? 'Default order' : 'Sort A–Z') + '</button></div></div>' +
      (items.length ? '<div class="wk-record-list">' + rows + '</div>' : '<div class="wk-empty">' + (query ? 'No records match your search.' : 'There are no sample records in this module yet. Add one below to try the interaction.') + '</div>') +
      '<form class="wk-add-form" data-add-form><input name="value" maxlength="90" placeholder="Add a sample ' + esc(active.toLowerCase()) + ' record" aria-label="New sample record" required><button class="wk-primary-button" type="submit">＋ Add record</button></form>' +
      '<div class="wk-app-footer"><span>Local-only demonstration · No account or backend connection</span><button class="wk-secondary-button" type="button" data-action="reset">Reset sample data</button></div><p class="wk-toast" role="status" data-wk-toast>' + esc(toast) + '</p></section>';
  }
  function updateNavigation() {
    mount.querySelectorAll('[data-module]').forEach(function (button) {
      if (button.getAttribute('data-module') === active) button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
    var crumb = mount.querySelector('[data-wk-crumb]');
    if (crumb) crumb.textContent = active;
  }
  function renderView() {
    var view = mount.querySelector('[data-wk-view]');
    if (!view) return;
    view.innerHTML = active === 'Overview' ? overview() : renderModule();
    updateNavigation();
  }
  function renderShell() {
    mount.className = 'wk-premium-root wk-' + key;
    mount.style.setProperty('--wk-brand', palette[0]);
    mount.style.setProperty('--wk-accent', palette[0]);
    mount.style.setProperty('--wk-accent-2', palette[1]);
    mount.style.setProperty('--wk-accent-soft', palette[2]);
    mount.innerHTML = '<div class="wk-premium-shell wk-app' + (collapsed ? ' is-collapsed' : '') + '">' +
      '<aside class="wk-sidebar"><a class="wk-product-brand" href="' + esc(demoHref) + '"><span class="wk-product-mark">' + esc(config.mark || 'D') + '</span><span><strong>' + esc(config.demoName) + '</strong><small>DVNM Forge workspace</small></span></a>' +
      '<p class="wk-sidebar-label">Workspace</p><nav class="wk-sidebar-nav" aria-label="Workspace navigation">' + moduleNav() + '</nav><div class="wk-sidebar-spacer"></div><div class="wk-sidebar-note"><strong>Sample environment</strong><p>Local workspace data is saved on this device only. No account, cloud sync or backend is connected.</p></div><div class="wk-sidebar-foot"><span class="wk-sidebar-avatar">D</span><span>Davonium Technologies · Demo</span></div></aside>' +
      '<div class="wk-main"><header class="wk-topbar"><div class="wk-crumb"><span>Workspace</span><b>/</b><strong>' + esc(config.demoName) + '</strong><b>/</b><span data-wk-crumb>' + esc(active) + '</span></div><div class="wk-top-actions"><label class="wk-search-wrap"><span class="sr-only">Search current sample module</span><input class="wk-search" type="search" placeholder="Search records…" aria-label="Search records" value="' + esc(query) + '"></label><button class="wk-icon-button" type="button" data-action="notifications" aria-label="Show sample notifications">♧</button><button class="wk-icon-button" type="button" data-action="collapse" aria-pressed="' + collapsed + '" aria-label="Collapse workspace sidebar">☷</button><a class="wk-top-link" href="' + esc(demoHref) + '">Public demo ↗</a></div></header><div class="wk-content"><div data-wk-view aria-live="polite"></div><div class="wk-app-footer"><span>Built with DVNM Forge by Davonium Technologies · Local data only</span><a href="../contact?topic=workspace">Explore DVNM Forge capabilities ↗</a></div></div></div></div>';
    renderView();
    var toolbar = mount.querySelector('.wk-main');
    if (toolbar) toolbar.insertAdjacentHTML('afterbegin',mediaPanelToolbar());
  }

  mount.addEventListener('click', function (event) {
    var button = event.target.closest('[data-module],[data-action]');
    if (!button) return;
    if (button.hasAttribute('data-module')) {
      active = button.getAttribute('data-module'); query = ''; toast = 'Viewing ' + active + ' sample data.';
      var search = mount.querySelector('.wk-search'); if (search) search.value = '';
      renderView(); return;
    }
    var action = button.getAttribute('data-action');
    if (action === 'undo') { undoChange(); return; }
    if (action === 'redo') { redoChange(); return; }
    if (action === 'export-json') { exportWorkspaceJson(); return; }
    if (action === 'export-zip') { exportWorkspaceZip(); return; }
    if (action === 'import-json') { var importPicker = mount.querySelector('[data-forge-import]'); if (importPicker) importPicker.click(); return; }
    if (action === 'remove-media') {
      var mediaId = button.getAttribute('data-media-id');
      deleteMediaItem(mediaId).then(function () {
        if (mediaUrls[mediaId]) { URL.revokeObjectURL(mediaUrls[mediaId]); delete mediaUrls[mediaId]; }
        mediaItems = mediaItems.filter(function (item) { return item.id !== mediaId; }); renderView(); setToast('Media removed from this device.');
      }).catch(function () { setToast('Could not remove this media file.'); });
      return;
    }
    if (action === 'remove') {
      var index = Number(button.getAttribute('data-index'));
      if (Number.isInteger(index) && state[active] && index >= 0 && index < state[active].length) {
        rememberChange(); state[active].splice(index,1); persistModules(); toast = 'Sample record removed and saved.'; renderView();
      }
    } else if (action === 'reset') {
      rememberChange(); state = cloneModules(original); persistModules(); active = 'Overview';query = '';sortAsc = false;
      activity.unshift(['↺','Sample content restored to its starting state','Just now']);toast = 'All sample data has been reset.';renderShell();
    } else if (action === 'create') {
      active = firstModule();query = '';toast = 'Add a sample record below. It will remain local to this preview.';renderView();
      var field = mount.querySelector('[data-add-form] input');if(field)field.focus();
    } else if (action === 'sort') {
      sortAsc = !sortAsc;toast = sortAsc ? 'Records sorted alphabetically.' : 'Default record order restored.';renderView();
    } else if (action === 'collapse') {
      collapsed = !collapsed;var app = mount.querySelector('.wk-app');if(app)app.classList.toggle('is-collapsed',collapsed);
      button.setAttribute('aria-pressed',String(collapsed));button.setAttribute('aria-label',collapsed ? 'Expand workspace sidebar' : 'Collapse workspace sidebar');
    } else if (action === 'notifications') {
      setToast('No live notifications are connected. This is a sample workspace.');
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
      event.preventDefault();var index = Number(form.getAttribute('data-index'));var value = form.elements.value.value.trim();
      if (value && Number.isInteger(index) && state[active] && index >= 0 && index < state[active].length) {
        rememberChange(); state[active][index] = value;persistModules();activity.unshift(['✎',active + ' sample record updated','Just now']);toast = 'Sample record updated and saved.';renderView();
      }
    } else if (form.matches('[data-add-form]')) {
      event.preventDefault();var added = form.elements.value.value.trim();
      if (added && state[active]) { rememberChange(); state[active].push(added);persistModules();activity.unshift(['＋','Sample record added to ' + active,'Just now']);toast = 'Sample record added and saved.';renderView(); }
    }
  });
  loadSavedModules();
  loadMediaItems().catch(function () { toast = 'Media storage is unavailable; content autosave still works.'; }).then(function () { renderShell(); });
  mount.addEventListener('change', function (event) {
    if (event.target.matches('[data-forge-media]')) { uploadMediaFiles(event.target.files); event.target.value = ''; }
    if (event.target.matches('[data-forge-import]')) { importWorkspaceJson(event.target.files && event.target.files[0]); event.target.value = ''; }
  });
  window.addEventListener('beforeunload', persistModules);
}());
