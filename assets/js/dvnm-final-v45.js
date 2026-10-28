/* DAVONIUM TECHNOLOGIES V48 — shared DVNM Bot scene, typed storytelling and resilient guide UI. */
(() => {
  'use strict';
  if (window.__davoniumV48 || window.__davoniumV46) return;
  window.__davoniumV48 = true; window.__davoniumV46 = true;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean((navigator.connection && navigator.connection.saveData) || (Number(navigator.deviceMemory) > 0 && Number(navigator.deviceMemory) <= 2));
  const mobile = matchMedia('(max-width: 760px)').matches;
  const root = document.documentElement;
  // Keep the CSS fallback visible if WebGL or the external Three.js module is unavailable.
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
  let threePromise = null;
  const getThree = () => threePromise || (threePromise = import(THREE_URL));
  const sceneRecords = [];
  const pageKind = () => {
    const path = location.pathname.toLowerCase();
    if (document.body.dataset.page === 'home' || path === '/' || path.endsWith('/index.html') && !/docs|demos/.test(path)) return 'home';
    if (/demos\/(business|biz|marketing)/.test(path) || document.body.classList.contains('demo-biz')) return 'biz';
    if (/demos\/(shop|market)/.test(path) || document.body.classList.contains('demo-market')) return 'market';
    if (/demos\/(portfolio|creative)/.test(path) || document.body.classList.contains('demo-creative')) return 'creative';
    if (/demos\/(learning|skills|community)/.test(path) || document.body.classList.contains('demo-skills')) return 'skills';
    if (/demos\/(technology|digital)/.test(path) || document.body.classList.contains('demo-digital')) return 'digital';
    if (/docs/.test(path)) return 'docs';
    if (/products/.test(path)) return 'market';
    if (/work/.test(path)) return 'creative';
    if (/services|about|contact/.test(path)) return 'biz';
    return 'digital';
  };
  const kind = pageKind();

  // Text is split into accessible words/letters only when motion is allowed; the original full title remains the accessible name.
  function typeHeadline() {
    if (reduced) return;
    const headings = $$('main h1').slice(0, 1);
    headings.forEach((heading) => {
      if (heading.dataset.v45Typed === 'yes') return;
      const full = heading.textContent.replace(/\s+/g, ' ').trim();
      if (!full || full.length > 115) return;
      heading.dataset.v45Typed = 'yes';
      heading.setAttribute('aria-label', full);
      let n = 0;
      const wrapText = (node) => {
        const text = node.nodeValue || '';
        const frag = document.createDocumentFragment();
        const pieces = text.split(/(\s+)/);
        pieces.forEach((piece) => {
          if (!piece) return;
          if (/^\s+$/.test(piece)) { frag.appendChild(document.createTextNode(piece)); return; }
          const word = document.createElement('span');
          word.className = 'dvnm-v45-word';
          word.setAttribute('aria-hidden', 'true');
          [...piece].forEach((character) => {
            const letter = document.createElement('span');
            letter.className = 'dvnm-v45-letter';
            letter.textContent = character;
            letter.style.setProperty('--v45-delay', `${Math.min(n * 14, 1450)}ms`);
            word.appendChild(letter); n += 1;
          });
          frag.appendChild(word);
        });
        node.replaceWith(frag);
      };
      const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) wrapText(node);
        else if (node.nodeType === Node.ELEMENT_NODE && !node.matches('script,style,noscript')) [...node.childNodes].forEach(walk);
      };
      [...heading.childNodes].forEach(walk);
      heading.classList.add('dvnm-v45-type-target');
    });
  }
  // V48: site.js owns the single short welcome experience. Avoid stacking a second full-screen intro.
  // The wordmark/title reveal remains active; sound is never initialized merely by a generic page tap.
  typeHeadline();

  // Scene hosts: real WebGL geometry for the home and every page family, with graceful static CSS fallback.
  function getSceneHost() {
    // The DVNM Robot renderer already owns home/work/welcome/assistant stages.
    // Keep documentation, legal, offline and install guides fast and readable without a full WebGL canvas.
    if ($('[data-dvnm-robot-host]:not(.dvnm-v46-welcome-robot)')) return null;
    if (kind === 'docs' || /\/(?:legal|offline|install)(?:\.html|\/|$)/i.test(location.pathname)) return null;
    const demoArt = $('.demo-hero-art');
    if (demoArt) return demoArt;
    const techArt = $('.tech-orbit-card');
    if (techArt) return techArt;
    const pageHero = $('main > .pagehero, main > .page-hero, main > .hero, main > section:first-of-type');
    return pageHero || null;
  }
  function makeSceneMarkup(host) {
    if (!host || $('.dvnm-v45-scene-canvas', host)) return $('.dvnm-v45-scene-canvas', host);
    host.classList.add('dvnm-v45-page-scene-host');
    const canvas = document.createElement('canvas');
    canvas.className = 'dvnm-v45-scene-canvas';
    canvas.setAttribute('aria-hidden', 'true'); canvas.setAttribute('role', 'presentation');
    canvas.dataset.v45Scene = kind;
    host.prepend(canvas);
    return canvas;
  }
  const sceneHost = getSceneHost();
  const sceneCanvas = makeSceneMarkup(sceneHost);
  // V48 controls can be used before or after the async Three.js import finishes.
  // Translate each demo's visible mode into a real scene-controller mode, not just CSS ornament.
  const sceneModeMap = {
    strategy: 'orbit', delivery: 'focus', launch: 'prism',
    catalogue: 'orbit', product: 'focus', compare: 'prism',
    web: 'orbit', brand: 'prism', explore: 'orbit', learn: 'orbit', practice: 'focus', progress: 'path',
    websites: 'orbit', apps: 'focus', systems: 'path'
  };
  if (sceneHost) {
    sceneHost.addEventListener('dvnm:scene-mode', (event) => {
      const requested = String(event.detail?.mode || 'default');
      const actual = sceneModeMap[requested] || requested;
      sceneHost.dataset.v45Motion = actual;
      const record = sceneRecords.find((item) => item.host === sceneHost);
      if (record) record.mode = actual;
    });
  }
  function palette() {
    const dark = root.dataset.theme === 'dark';
    const themes = {
      home: { light: [0x4d61de, 0x109db6, 0xf0a25e, 0x9b87ee], dark: [0x48dcec, 0x9487ff, 0xf0b27a, 0x53cbb8], ringL: 0x98a8dd, ringD: 0x285c73 },
      biz: { light: [0x277c71, 0x35b6a0, 0xf2b86f, 0x76aab6], dark: [0x62dfc5, 0x319b91, 0xf0ba83, 0x8dded0], ringL: 0x76b9ad, ringD: 0x23695f },
      market: { light: [0xca633e, 0xf1a461, 0x5b70d8, 0xd887a5], dark: [0xffac78, 0xf1c078, 0xc09cff, 0xef8da5], ringL: 0xd5a084, ringD: 0x87503e },
      creative: { light: [0x6950d9, 0xb36ce4, 0xe48ab1, 0x6db6e8], dark: [0xb6a4ff, 0x7a67e7, 0xf0a6d4, 0x7cd6ff], ringL: 0xa99de2, ringD: 0x57468b },
      skills: { light: [0x317dc9, 0x21a7c2, 0x6db8e4, 0x72c9b6], dark: [0x7ed4ff, 0x45c7dc, 0x78a9ff, 0x63ddc4], ringL: 0x81b6df, ringD: 0x235d87 },
      digital: { light: [0x4056dc, 0x159fbb, 0x896de8, 0xe6a36b], dark: [0x45deee, 0x8d84ff, 0x53c9cc, 0xf0b18a], ringL: 0x9ca9e4, ringD: 0x286982 },
      docs: { light: [0x376fbd, 0x31a7bb, 0xc0a0eb, 0xf0ad74], dark: [0x70d5eb, 0x7f92ff, 0xbba1eb, 0xefa974], ringL: 0x9fb5d3, ringD: 0x2b6179 }
    };
    const item = themes[kind] || themes.digital;
    return { colors: dark ? item.dark : item.light, low: dark ? 0x0a1521 : 0xf3f6ff, ring: dark ? item.ringD : item.ringL, light: dark ? 0x8dbbff : 0xffd1a1 };
  }
  function initScene(THREE, canvas, host) {
    const low = mobile || saveData || Number(navigator.hardwareConcurrency || 8) <= 4;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !low, powerPreference: 'low-power', failIfMajorPerformanceCaveat: false });
    } catch (_) { host.dataset.v45SceneFallback = 'true'; canvas.remove(); return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 80); camera.position.set(0, 0, 7.4);
    const ambient = new THREE.AmbientLight(0xffffff, root.dataset.theme === 'dark' ? 1.25 : 1.45); scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, root.dataset.theme === 'dark' ? 2.1 : 1.6); key.position.set(3, 4, 6); scene.add(key);
    const rim = new THREE.PointLight(0x64dded, 13, 18); rim.position.set(-3, 2, 2); scene.add(rim);
    const world = new THREE.Group(); scene.add(world);
    const p = palette();
    const rings = [];
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.78, .009, 6, 90), new THREE.MeshStandardMaterial({ color: p.ring, metalness: .34, roughness: .48, transparent: true, opacity: .60 }));
    ringA.scale.set(1.15, .84, .78); ringA.rotation.set(.44, -.28, .2); world.add(ringA); rings.push(ringA);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.34, .006, 6, 72), new THREE.MeshStandardMaterial({ color: p.colors[1], metalness: .4, roughness: .36, transparent: true, opacity: .60 }));
    ringB.scale.set(.72, 1.24, .8); ringB.rotation.set(-.28, .64, -.45); world.add(ringB); rings.push(ringB);
    const matList = p.colors.map((color, i) => new THREE.MeshStandardMaterial({ color, metalness: i === 2 ? .18 : .42, roughness: i === 2 ? .48 : .29, emissive: color, emissiveIntensity: root.dataset.theme === 'dark' ? .18 : .06, transparent: true, opacity: .94 }));
    const objects = [];
    const count = low ? 7 : 12;
    const geoFor = (i) => {
      const k = (i + kind.length) % 5;
      if (k === 0) return new THREE.IcosahedronGeometry(.18 + (i % 3) * .035, 0);
      if (k === 1) return new THREE.BoxGeometry(.21, .21, .21);
      if (k === 2) return new THREE.OctahedronGeometry(.19, 0);
      if (k === 3) return new THREE.TorusGeometry(.14, .012, 5, 24);
      return new THREE.DodecahedronGeometry(.17, 0);
    };
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geoFor(i), matList[i % matList.length]);
      const a = i * 2.399963; const radius = 1.8 + (i % 3) * .22;
      mesh.position.set(Math.cos(a) * radius, Math.sin(a * .87) * 1.55, -1.2 + Math.sin(a) * .7);
      mesh.rotation.set(a * .7, a * .43, a * .26);
      const scale = .78 + (i % 4) * .14; mesh.scale.setScalar(scale);
      world.add(mesh); objects.push({ mesh, a, radius, index: i, baseX: mesh.position.x, baseY: mesh.position.y, baseZ: mesh.position.z });
    }
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = low ? 18 : 42; const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) { const a = i * 2.399963; positions[i * 3] = Math.cos(a) * (1.5 + (i % 5) * .25); positions[i * 3 + 1] = Math.sin(a * .77) * 1.9; positions[i * 3 + 2] = -.8 + Math.sin(a) * .8; }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particlesGeo, new THREE.PointsMaterial({ color: p.colors[0], size: low ? .025 : .032, transparent: true, opacity: .62, depthWrite: false })); scene.add(particles);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshBasicMaterial({ color: p.colors[1], transparent: true, opacity: .07, depthWrite: false })); ground.scale.set(1.1, .62, 1); ground.position.set(0, -1.48, -1.1); scene.add(ground);
    const state = { THREE, canvas, host, kind, renderer, scene, camera, world, rings, objects, particles, materials: matList, ambient, key, rim, ground, low, pX: 0, pY: 0, scroll: 0, started: performance.now(), raf: 0, visible: true, stopped: false, mode: host.dataset.v45Motion || ({ strategy: 'orbit', delivery: 'focus', launch: 'prism', catalogue: 'orbit', product: 'focus', compare: 'prism', web: 'orbit', brand: 'prism', explore: 'orbit', learn: 'orbit', practice: 'focus', progress: 'path', websites: 'orbit', apps: 'focus', systems: 'path' }[host.dataset.sceneMode] || 'default') };
    const resize = () => {
      if (state.stopped) return;
      const rect = canvas.getBoundingClientRect(); if (rect.width < 4 || rect.height < 4) return;
      renderer.setSize(Math.round(rect.width), Math.round(rect.height), false); camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix();
      if (reduced && state.start) state.start();
    };
    state.resize = resize;
    state.theme = () => {
      const next = palette(); state.p = next;
      matList.forEach((mat, i) => { const color = next.colors[i % next.colors.length]; mat.color.setHex(color); mat.emissive.setHex(color); mat.emissiveIntensity = root.dataset.theme === 'dark' ? .23 : .055; });
      rings[0].material.color.setHex(next.ring); rings[1].material.color.setHex(next.colors[1]); particles.material.color.setHex(next.colors[0]); ground.material.color.setHex(next.colors[1]);
      ambient.intensity = root.dataset.theme === 'dark' ? 1.25 : 1.45; key.intensity = root.dataset.theme === 'dark' ? 2.1 : 1.6; rim.color.setHex(next.colors[0]);
      host.dataset.v45Theme = root.dataset.theme || 'light';
      if (reduced && state.start) state.start();
    };
    const pointer = (event) => { const rect = host.getBoundingClientRect(); state.pX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2)); state.pY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2)); };
    host.addEventListener('pointermove', pointer, { passive: true });
    host.addEventListener('pointerleave', () => { state.pX *= .25; state.pY *= .25; }, { passive: true });
    const onScroll = () => { const rect = host.getBoundingClientRect(); state.scroll = Math.max(-1, Math.min(1, (window.innerHeight * .6 - rect.top) / Math.max(1, window.innerHeight + rect.height))); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    state.cleanup = () => { host.removeEventListener('pointermove', pointer); window.removeEventListener('scroll', onScroll); };
    canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); host.classList.remove('has-v45-webgl'); state.pause(); }, false);
    canvas.addEventListener('webglcontextrestored', () => { state.resize(); state.theme(); state.start(); }, false);
    state.theme(); resize();
    if ('ResizeObserver' in window) { state.observer = new ResizeObserver(resize); state.observer.observe(host); } else window.addEventListener('resize', resize, { passive: true });
    state.draw = (now) => {
      if (state.stopped) return;
      state.raf = 0;
      const t = (now - state.started) / 1000;
      const activeMotion = !reduced;
      const focus = state.mode === 'focus';
      const orbit = state.mode === 'orbit' || state.mode === 'default';
      const darkMode = root.dataset.theme === 'dark';
      world.rotation.y = state.pX * .18 + (activeMotion ? Math.sin(t * (darkMode ? .29 : .18)) * (darkMode ? .085 : .045) : 0);
      world.rotation.x = state.pY * -.09 + (activeMotion ? Math.sin(t * (darkMode ? .23 : .13)) * (darkMode ? .035 : .018) : 0);
      world.position.y = state.scroll * .1 + (activeMotion ? Math.sin(t * (darkMode ? .75 : .43)) * (darkMode ? .045 : .026) : 0);
      rings[0].rotation.z = .2 + (activeMotion ? t * (darkMode ? .062 : -.028) : 0); rings[1].rotation.y = .64 + (activeMotion ? t * (darkMode ? -.052 : .031) : 0);
      objects.forEach(({ mesh, a, radius, index, baseX, baseY, baseZ }) => {
        const slow = state.low ? .5 : 1;
        if (activeMotion && !focus) { mesh.rotation.x += .0016 * slow; mesh.rotation.y += .0022 * slow; }
        mesh.position.x = focus ? baseX * .32 : state.mode === 'path' ? Math.cos(a + (activeMotion ? t * (darkMode ? -.095 : .055) : 0)) * radius : baseX;
        mesh.position.y = (focus ? baseY * .35 : baseY) + (activeMotion && !focus ? Math.sin(t * (darkMode ? .78 : .49) + a) * (darkMode ? .12 : .075) : 0);
        mesh.position.z = focus ? baseZ * .25 : baseZ;
        if (state.mode === 'prism') mesh.scale.setScalar((.76 + (index % 4) * .14) * (1 + (activeMotion ? .06 * Math.sin(t + index) : 0)));
        else mesh.scale.setScalar(.78 + (index % 4) * .14);
      });
      particles.rotation.y = activeMotion ? t * (darkMode ? .027 : -.014) : 0; particles.rotation.z = state.pX * .025;
      renderer.render(scene, camera);
      if (state.visible && !document.hidden && !reduced) state.raf = requestAnimationFrame(state.draw);
    };
    state.start = () => { if (state.stopped || state.raf) return; state.raf = requestAnimationFrame(state.draw); };
    state.pause = () => { if (state.raf) cancelAnimationFrame(state.raf); state.raf = 0; };
    state.dispose = () => { state.stopped = true; state.pause(); state.cleanup(); if (state.observer) state.observer.disconnect(); renderer.dispose(); scene.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(mat => mat.dispose()); }); };
    return state;
  }
  if (sceneCanvas && sceneHost) {
    sceneHost.dataset.v45Scene = kind;
    // Save-data and reduced-motion visitors retain the CSS scene; normal visitors receive actual WebGL geometry.
    if (!saveData) {
      getThree().then(THREE => {
        if (!sceneCanvas.isConnected || !sceneHost.isConnected) return;
        const state = initScene(THREE, sceneCanvas, sceneHost);
        if (!state) return;
        sceneHost.classList.add('has-v45-webgl');
        sceneRecords.push(state);
        const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => { state.visible = entry.isIntersecting; if (state.visible) state.start(); else state.pause(); }), { rootMargin: '120px' }) : null;
        if (io) { io.observe(sceneHost); state.observerVisibility = io; } else state.start();
        const themeObserver = new MutationObserver(() => state.theme()); themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        state.cleanupTheme = () => themeObserver.disconnect();
        document.addEventListener('visibilitychange', () => { if (document.hidden) state.pause(); else if (state.visible) state.start(); });
        state.start();
      }).catch(() => { if (sceneHost) sceneHost.dataset.v45SceneFallback = 'true'; if (sceneCanvas) sceneCanvas.remove(); });
    } else {
      sceneHost.dataset.v45SceneFallback = 'true'; sceneCanvas.remove();
    }
  }

  // Interactive scene modes on Creative and Skills; keyboard and touch controls are intentionally simple.
  function installSceneControls() {
    if (!(kind === 'creative' || kind === 'skills')) return;
    const art = $('.demo-hero-art'); if (!art || $('.dvnm-v45-scene-tools', art)) return;
    const bar = document.createElement('div'); bar.className = 'dvnm-v45-scene-tools'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', kind === 'creative' ? 'Creative scene controls' : 'Learning scene controls');
    const controls = kind === 'creative' ? [['orbit', 'Orbit'], ['focus', 'Focus'], ['prism', 'Prism']] : [['explore', 'Explore'], ['focus', 'Focus'], ['path', 'Learning path']];
    controls.forEach(([mode, label], i) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.setAttribute('aria-pressed', String(i === 0));
      button.addEventListener('click', () => {
        bar.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
        sceneRecords.forEach(state => { if (state.kind === kind) state.mode = mode; });
        if (kind === 'skills') {
          const accordions = $$('.demo-accordion');
          accordions.forEach((item, index) => { if (mode === 'focus') item.open = index === 0; else if (mode === 'path') item.open = index < 2; else item.open = false; });
        }
        art.dataset.v45Motion = mode;
      });
      bar.appendChild(button);
    });
    art.appendChild(bar);
  }
  // V48 provides one unified scene-control bar across all five demos; the legacy V45 bar is intentionally not injected.

  // High-quality but restrained scroll reveals; no section is hidden unless an observer can reveal it.
  if (!reduced && 'IntersectionObserver' in window) {
    const targets = $$('main > section, .demo-section, .doc-group, .dvnm-certificate-banner').filter((el, i) => i > 0 && !el.classList.contains('dvnm-certificate-v45'));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('dvnm-v45-pending'); entry.target.classList.add('dvnm-v45-revealed'); observer.unobserve(entry.target); }
    }), { threshold: .06, rootMargin: '0px 0px -26px 0px' });
    targets.forEach((el, i) => { el.classList.add('dvnm-v45-reveal'); el.style.setProperty('--v45-reveal-delay', `${(i % 3) * 65}ms`); if (el.getBoundingClientRect().top > window.innerHeight * 1.1) el.classList.add('dvnm-v45-pending'); observer.observe(el); });
  }

  // Slight perspective on desktop cards only, disabled for touch and reduced-motion users.
  if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.dvnm-demo-card, .demo-card, .doc-card').slice(0, 80).forEach(card => {
      card.classList.add('dvnm-v45-depth-card');
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width - .5; const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.8).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Documentation quick filters are additive to the existing local search and remain useful without a network.
  function setupDocsFilters() {
    const search = $('#docs-search'); const results = $('#docs-results'); const clear = $('#docs-clear'); const count = $('#docs-result-count');
    if (!search || !results) return;
    const cards = $$('.doc-card', results); const groups = $$('.doc-group', results);
    const filterBox = document.createElement('div'); filterBox.className = 'docs-category-filters'; filterBox.setAttribute('role', 'group'); filterBox.setAttribute('aria-label', 'Filter documentation by topic');
    const names = ['All topics', ...groups.map(g => g.dataset.category || '').filter(Boolean)];
    let chosen = 'All topics';
    names.forEach((name, i) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = name; button.setAttribute('aria-pressed', String(i === 0));
      button.addEventListener('click', () => { chosen = name; filterBox.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button))); apply(); }); filterBox.appendChild(button);
    });
    const searchRow = $('.searchrow'); if (searchRow && !$('.docs-category-filters')) searchRow.insertAdjacentElement('afterend', filterBox);
    function apply() {
      const query = search.value.trim().toLowerCase(); let matches = 0;
      cards.forEach(card => {
        const group = card.closest('.doc-group'); const category = group?.dataset.category || '';
        const content = `${card.dataset.search || ''} ${card.textContent || ''}`.toLowerCase();
        const show = (!query || content.includes(query)) && (chosen === 'All topics' || category === chosen);
        card.classList.toggle('hidden', !show); if (show) matches++;
      });
      groups.forEach(group => group.classList.toggle('hidden', !$('.doc-card:not(.hidden)', group)));
      if (count) count.textContent = query || chosen !== 'All topics' ? `${matches} ${matches === 1 ? 'guide' : 'guides'} shown${query ? ` for “${search.value.trim()}”` : ''}${chosen !== 'All topics' ? ` in ${chosen}` : ''}.` : `Browse all ${cards.length} published guides.`;
    }
    search.addEventListener('input', apply);
    if (clear) clear.addEventListener('click', () => { chosen = 'All topics'; search.value = ''; filterBox.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === 0))); apply(); });
    apply();
  }
  setupDocsFilters();

  // One assistant launcher only. Legacy third-party/older floating widgets are suppressed if left in cached HTML.
  function removeLegacyFloaters() {
    const selectors = ['.dvnm-v29-mobile-launcher:not(#dvnm-bot-launcher)', '.dvnm-assistant-launcher', '.dvnm-bot-widget', '.dvnm-floating-bot', '.dvnm-floating-assistant', '#dvnm-assistant', '#dvnm-bot-widget', '[data-dvnm-assistant]'];
    selectors.forEach(selector => $$(selector).forEach(el => {
      if (el.closest('#dvnm-bot-dock') || el.classList.contains('wa-float') || el.matches('#dvnm-bot-launcher')) return;
      const rect = el.getBoundingClientRect(); const style = getComputedStyle(el);
      const floating = style.position === 'fixed' || rect.right > innerWidth - 150 && rect.bottom > innerHeight - 260;
      if (floating && rect.width <= 480 && rect.height <= 240) { el.classList.add('dvnm-v45-legacy-hidden'); }
    }));
  }
  removeLegacyFloaters();
  const floatObserver = new MutationObserver(() => removeLegacyFloaters());
  floatObserver.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => floatObserver.disconnect(), 6000);

  // Keep scene theme sync and clear up renderers if the page is discarded.
  window.addEventListener('pagehide', () => sceneRecords.forEach(s => { s.pause(); if (s.cleanupTheme) s.cleanupTheme(); }), { once: true });
})();
