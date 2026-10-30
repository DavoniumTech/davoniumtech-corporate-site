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
  // Shared read-only registry consumed by the V49 ES-module control deck.
  window.DavoniumSceneRegistry = { getScenes: () => sceneRecords.filter((state) => !state.stopped && state.canvas?.isConnected) };
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
    if (reduced || document.querySelector('main .hero h1')) return; // V59: never animate or split the full homepage headline.
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
  // Real 2D canvas fallback for WebGL construction/CDN failure and Save-Data devices.
  // It remains decorative and pass-through; page text, controls and contact links stay in normal HTML.
  const canvasFallbacks = new WeakMap();
  const activeCanvasFallbacks = new Set();
  function removeCanvasFallback(host) {
    const record = canvasFallbacks.get(host);
    if (record) record.cleanup();
  }
  function installCanvasFallback(host, staticMode = (saveData || reduced)) {
    if (!host) return null;
    const prior = canvasFallbacks.get(host);
    if (prior) return prior.canvas;
    const oldPosition = host.style.position;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const canvas = document.createElement('canvas');
    canvas.className = 'dvnm-v45-canvas-fallback';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Lightweight interactive 2D illustration fallback. The page information and actions remain available as regular text and controls.');
    canvas.dataset.fallbackReason = staticMode ? 'reduced-or-save-data' : 'webgl-unavailable';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0;';
    host.prepend(canvas);
    const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!context) { canvas.remove(); if (!oldPosition) host.style.removeProperty('position'); else host.style.position = oldPosition; return null; }
    const reducedFallbackMotion = Boolean(staticMode);
    const points = Array.from({ length: 13 }, (_, i) => ({
      angle: i * 2.399963229728653,
      radius: 0.18 + ((i * 7) % 11) / 15,
      phase: i * 1.71,
      speed: 0.14 + (i % 5) * 0.025
    }));
    const record = { host, canvas, context, points, raf: 0, observer: null, resizeObserver: null, visible: true, width: 0, height: 0, dpr: 1, pointerX: 0, pointerY: 0, gradient: null, themeObserver: null, cleanup: null };
    const active = () => !reducedFallbackMotion && record.visible && !document.hidden;
    const draw = (now = 0) => {
      const ctx = context, width = record.width, height = record.height;
      if (width < 8 || height < 8) return;
      ctx.clearRect(0, 0, width, height);
      const dark = root.dataset.theme === 'dark';
      const accent = dark ? 'rgba(62,220,243,.78)' : 'rgba(26,155,184,.52)';
      const faint = dark ? 'rgba(101,190,229,.16)' : 'rgba(68,122,175,.13)';
      const cx = width * (0.5 + record.pointerX * 0.025);
      const cy = height * (0.5 + record.pointerY * 0.025);
      const time = reducedFallbackMotion ? 0 : now * 0.00016;
      if (record.gradient) { ctx.fillStyle = record.gradient; ctx.fillRect(0, 0, width, height); }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = faint; ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath(); ctx.ellipse(0, 0, Math.min(width, height) * (0.18 + r * 0.105), Math.min(width, height) * (0.095 + r * 0.054), (r - 1) * 0.24 + time * (r % 2 ? -0.08 : 0.06), 0, Math.PI * 2); ctx.stroke();
      }
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const angle = point.angle + time * point.speed;
        const radius = Math.min(width, height) * point.radius * 0.41;
        const x = Math.cos(angle) * radius, y = Math.sin(angle * 0.83 + point.phase) * radius * 0.64;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.strokeStyle = faint; ctx.stroke();
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const angle = point.angle + time * point.speed;
        const radius = Math.min(width, height) * point.radius * 0.41;
        const x = Math.cos(angle) * radius, y = Math.sin(angle * 0.83 + point.phase) * radius * 0.64;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, y); ctx.strokeStyle = faint; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, i % 4 === 0 ? 2.5 : 1.5, 0, Math.PI * 2); ctx.fillStyle = i % 4 === 0 ? accent : faint; ctx.fill();
      }
      const hub = Math.max(3, Math.min(width, height) * 0.012);
      ctx.beginPath(); ctx.arc(0, 0, hub * 2.3, 0, Math.PI * 2); ctx.strokeStyle = accent; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, hub, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill();
      ctx.restore();
      if (active()) record.raf = requestAnimationFrame(draw);
      else record.raf = 0;
    };
    const resize = () => {
      const rect = host.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;
      record.width = rect.width; record.height = rect.height;
      record.dpr = Math.min(window.devicePixelRatio || 1, saveData || reduced ? 1 : (matchMedia('(max-width: 760px)').matches ? 1.15 : 1.4));
      canvas.width = Math.max(1, Math.round(rect.width * record.dpr));
      canvas.height = Math.max(1, Math.round(rect.height * record.dpr));
      context.setTransform(record.dpr, 0, 0, record.dpr, 0, 0);
      const dark = root.dataset.theme === 'dark';
      record.gradient = context.createRadialGradient(rect.width * .5, rect.height * .48, 2, rect.width * .5, rect.height * .5, Math.max(rect.width, rect.height) * .58);
      record.gradient.addColorStop(0, dark ? 'rgba(35,104,139,.12)' : 'rgba(73,174,202,.10)');
      record.gradient.addColorStop(1, 'rgba(0,0,0,0)');
      if (record.raf) cancelAnimationFrame(record.raf);
      record.raf = 0; draw(0);
    };
    const pointer = event => {
      if (event.pointerType === 'touch' || reducedFallbackMotion) return;
      const rect = host.getBoundingClientRect();
      record.pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / Math.max(1, rect.width) - .5) * 2));
      record.pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / Math.max(1, rect.height) - .5) * 2));
    };
    const onVisibility = () => { if (document.hidden) { if (record.raf) cancelAnimationFrame(record.raf); record.raf = 0; } else if (active() && !record.raf) record.raf = requestAnimationFrame(draw); };
    host.addEventListener('pointermove', pointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    if ('ResizeObserver' in window) { record.resizeObserver = new ResizeObserver(resize); record.resizeObserver.observe(host); }
    else window.addEventListener('resize', resize, { passive: true });
    if ('IntersectionObserver' in window) {
      record.observer = new IntersectionObserver(entries => {
        record.visible = entries.some(entry => entry.isIntersecting);
        if (record.visible && active() && !record.raf) record.raf = requestAnimationFrame(draw);
        else if (!record.visible && record.raf) { cancelAnimationFrame(record.raf); record.raf = 0; }
      }, { rootMargin: '100px' });
      record.observer.observe(host);
    }
    record.themeObserver = new MutationObserver(resize);
    record.themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    record.cleanup = () => {
      if (record.raf) cancelAnimationFrame(record.raf);
      host.removeEventListener('pointermove', pointer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
      record.resizeObserver?.disconnect(); record.observer?.disconnect(); record.themeObserver?.disconnect();
      canvas.remove();
      canvasFallbacks.delete(host); activeCanvasFallbacks.delete(record);
      if (!oldPosition) host.style.removeProperty('position'); else host.style.position = oldPosition;
    };
    canvasFallbacks.set(host, record); activeCanvasFallbacks.add(record);
    resize();
    return canvas;
  }
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    for (const record of [...activeCanvasFallbacks]) record.cleanup();
  });
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
    const maxPixelRatio = low ? 1.25 : 1.75;
    const initialPixelRatio = Math.min(window.devicePixelRatio || 1, low ? 1 : 1.45);
    renderer.setPixelRatio(initialPixelRatio);
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
    const state = { THREE, canvas, host, kind, renderer, scene, camera, world, rings, objects, particles, materials: matList, ambient, key, rim, ground, low, pX: 0, pY: 0, scroll: 0, started: performance.now(), raf: 0, visible: true, stopped: false, mode: host.dataset.v45Motion || ({ strategy: 'orbit', delivery: 'focus', launch: 'prism', catalogue: 'orbit', product: 'focus', compare: 'prism', web: 'orbit', brand: 'prism', explore: 'orbit', learn: 'orbit', practice: 'focus', progress: 'path', websites: 'orbit', apps: 'focus', systems: 'path' }[host.dataset.sceneMode] || 'default'), quality: 'auto', pixelRatio: initialPixelRatio, maxPixelRatio, reducedEffects: false, frameTimes: new Float32Array(60), frameIndex: 0, frameSamples: 0, frameCount: 0, lastFrameAt: 0, fps: 0, cameraPreset: 'orbit', cameraTarget: new THREE.Vector3(0, 0, 7.4), cameraAim: new THREE.Vector3(0, 0, 0), raycaster: new THREE.Raycaster(), rayPointer: new THREE.Vector2(2, 2), pickTargets: objects.map((item) => item.mesh), hoveredObject: null, needsRaycast: false };
    state.applyPixelRatio = (ratio) => {
      const next = Math.max(.85, Math.min(state.maxPixelRatio, ratio));
      if (Math.abs(next - state.pixelRatio) < .035) return;
      state.pixelRatio = next; renderer.setPixelRatio(next); state.resize();
    };
    state.setQuality = (profile = 'auto') => {
      state.quality = ['auto', 'high', 'battery'].includes(profile) ? profile : 'auto';
      if (state.quality === 'battery') state.applyPixelRatio(Math.min(1, window.devicePixelRatio || 1));
      else if (state.quality === 'high') state.applyPixelRatio(Math.min(window.devicePixelRatio || 1, state.maxPixelRatio));
      else state.applyPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.4));
      state.updateParticleQuality?.(state.quality);
    };
    state.setReducedEffects = (enabled) => { state.reducedEffects = Boolean(enabled); if (state.reducedEffects) { state.pX *= .25; state.pY *= .25; } state.updateParticleEffects?.(state.reducedEffects); };
    state.setCameraPreset = (preset = 'orbit') => {
      state.cameraPreset = ['orbit', 'cinematic', 'reset'].includes(preset) ? preset : 'orbit';
      if (state.cameraPreset === 'cinematic') { state.cameraTarget.set(.55, .28, 6.4); state.cameraAim.set(.08, 0, 0); }
      else { state.cameraTarget.set(0, 0, 7.4); state.cameraAim.set(0, 0, 0); }
      if (reduced || state.reducedEffects) { camera.position.copy(state.cameraTarget); camera.lookAt(state.cameraAim); }
    };
    state.getStats = () => {
      const info = renderer.info || {};
      const memory = info.memory || {};
      const draw = info.render || {};
      // Browser APIs do not reveal physical VRAM use; this is a conservative canvas/resource estimate only.
      const bytes = (canvas.width * canvas.height * 8) + (Number(memory.geometries || 0) * 65536) + (Number(memory.textures || 0) * 262144);
      return { fps: state.fps, estimatedVramMB: bytes / 1048576, geometries: Number(memory.geometries || 0), textures: Number(memory.textures || 0), drawCalls: Number(draw.calls || 0), quality: state.quality, pixelRatio: state.pixelRatio };
    };
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
      state.updateParticleTheme?.(next.colors[0]);
      if (reduced && state.start) state.start();
    };
    const pointer = (event) => {
      const rect = host.getBoundingClientRect();
      state.pX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
      state.pY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
      state.rayPointer.set(state.pX, -state.pY); state.needsRaycast = true;
    };
    const leavePointer = () => { state.pX *= .25; state.pY *= .25; state.rayPointer.set(2, 2); state.needsRaycast = true; };
    host.addEventListener('pointermove', pointer, { passive: true });
    host.addEventListener('pointerleave', leavePointer, { passive: true });
    const onScroll = () => { const rect = host.getBoundingClientRect(); state.scroll = Math.max(-1, Math.min(1, (window.innerHeight * .6 - rect.top) / Math.max(1, window.innerHeight + rect.height))); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const onVisibilityChange = () => { if (document.hidden) state.pause(); else if (state.visible) state.start(); };
    document.addEventListener('visibilitychange', onVisibilityChange);
    state.cleanup = () => { host.removeEventListener('pointermove', pointer); host.removeEventListener('pointerleave', leavePointer); window.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVisibilityChange); if (!('ResizeObserver' in window)) window.removeEventListener('resize', resize); };
    canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); host.classList.remove('has-v45-webgl'); state.pause(); installCanvasFallback(host); }, false);
    canvas.addEventListener('webglcontextrestored', () => { removeCanvasFallback(host); state.resize(); state.theme(); state.start(); }, false);
    state.theme(); resize();
    if ('ResizeObserver' in window) { state.observer = new ResizeObserver(resize); state.observer.observe(host); } else window.addEventListener('resize', resize, { passive: true });
    state.draw = (now) => {
      if (state.stopped) return;
      state.raf = 0;
      const t = (now - state.started) / 1000;
      state.frameCount += 1;
      if (state.lastFrameAt > 0) {
        const delta = now - state.lastFrameAt;
        if (delta > 0 && delta < 200) {
          state.frameTimes[state.frameIndex] = delta;
          state.frameIndex = (state.frameIndex + 1) % state.frameTimes.length;
          state.frameSamples = Math.min(state.frameSamples + 1, state.frameTimes.length);
          if (state.frameSamples >= 12 && state.frameCount % 12 === 0) {
            let totalFrameTime = 0;
            for (let frameIndex = 0; frameIndex < state.frameSamples; frameIndex++) totalFrameTime += state.frameTimes[frameIndex];
            state.fps = 1000 / Math.max(1, totalFrameTime / state.frameSamples);
          }
          if (state.quality === 'auto' && state.frameSamples === 60 && state.frameCount % 60 === 0) {
            if (state.fps < 48) state.applyPixelRatio(state.pixelRatio - .10);
            else if (state.fps > 58) state.applyPixelRatio(state.pixelRatio + .05);
          }
        }
      }
      state.lastFrameAt = now;
      const activeMotion = !reduced && !state.reducedEffects;
      camera.position.lerp(state.cameraTarget, reduced || state.reducedEffects ? .18 : .035);
      camera.lookAt(state.cameraAim);
      if (state.needsRaycast) {
        state.raycaster.setFromCamera(state.rayPointer, camera);
        const hit = state.raycaster.intersectObjects(state.pickTargets, false)[0]?.object || null;
        if (hit !== state.hoveredObject) { state.hoveredObject = hit; window.dispatchEvent(new CustomEvent('davonium:scene-hover', { detail: { kind: state.kind, active: Boolean(hit) } })); }
        state.needsRaycast = false;
      }
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
        const hoverScale = mesh === state.hoveredObject && activeMotion ? 1.14 : 1;
        if (state.mode === 'prism') mesh.scale.setScalar((.76 + (index % 4) * .14) * (1 + (activeMotion ? .06 * Math.sin(t + index) : 0)) * hoverScale);
        else mesh.scale.setScalar((.78 + (index % 4) * .14) * hoverScale);
      });
      particles.rotation.y = activeMotion ? t * (darkMode ? .027 : -.014) : 0; particles.rotation.z = state.pX * .025;
      state.updateParticleField?.(activeMotion ? t : 0, state.pX, state.pY, activeMotion);
      renderer.render(scene, camera);
      if (state.visible && !document.hidden && !reduced) state.raf = requestAnimationFrame(state.draw);
    };
    state.start = () => { if (state.stopped || state.raf) return; state.raf = requestAnimationFrame(state.draw); };
    state.pause = () => { if (state.raf) cancelAnimationFrame(state.raf); state.raf = 0; };
    state.dispose = () => { if (state.stopped) return; state.stopped = true; state.pause(); state.cleanup(); state.cleanupTheme?.(); state.observer?.disconnect(); state.observerVisibility?.disconnect(); state.disposeParticleField?.(); renderer.renderLists?.dispose?.(); renderer.dispose(); scene.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(mat => mat.dispose()); }); window.dispatchEvent(new CustomEvent('davonium:scene-disposed', { detail: { source: 'page-scene' } })); };
    return state;
  }
  if (sceneCanvas && sceneHost) {
    sceneHost.dataset.v45Scene = kind;
    // Save-data and reduced-motion visitors retain the CSS scene; normal visitors receive actual WebGL geometry.
    if (!saveData) {
      getThree().then(THREE => {
        if (!sceneCanvas.isConnected || !sceneHost.isConnected) return;
        const state = initScene(THREE, sceneCanvas, sceneHost);
        if (!state) { installCanvasFallback(sceneHost); return; }
        sceneHost.classList.add('has-v45-webgl');
        sceneRecords.push(state);
        window.dispatchEvent(new CustomEvent('davonium:scene-ready', { detail: { source: 'page-scene', kind: state.kind } }));
        const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => { state.visible = entry.isIntersecting; if (state.visible) state.start(); else state.pause(); }), { rootMargin: '120px' }) : null;
        if (io) { io.observe(sceneHost); state.observerVisibility = io; } else state.start();
        const themeObserver = new MutationObserver(() => state.theme()); themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        state.cleanupTheme = () => themeObserver.disconnect();
        state.start();
      }).catch(() => { if (sceneHost) sceneHost.dataset.v45SceneFallback = 'true'; if (sceneCanvas) sceneCanvas.remove(); installCanvasFallback(sceneHost); });
    } else {
      sceneHost.dataset.v45SceneFallback = 'true'; sceneCanvas.remove(); installCanvasFallback(sceneHost, true);
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
  window.addEventListener('pagehide', event => sceneRecords.forEach(s => { s.pause(); if (s.cleanupTheme) s.cleanupTheme(); if (!event.persisted) s.dispose?.(); }), { once: true });
})();
