/* DAVONIUM TECHNOLOGIES V46 — typed storytelling, shared DVNM Bot scene and resilient guide UI. */
(() => {
  'use strict';
  if (window.__davoniumV46) return;
  window.__davoniumV46 = true;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean((navigator.connection && navigator.connection.saveData) || (Number(navigator.deviceMemory) > 0 && Number(navigator.deviceMemory) <= 2));
  const mobile = matchMedia('(max-width: 760px)').matches;
  const root = document.documentElement;
  const safeSession = {
    get(key) { try { return sessionStorage.getItem(key); } catch (_) { return null; } },
    set(key, val) { try { sessionStorage.setItem(key, val); } catch (_) {} }
  };

  // Keep a useful CSS fallback visible if WebGL or the external Three.js module is unavailable.
  const sceneColors = () => root.dataset.theme === 'dark'
    ? [0x49ddeb, 0x8b83ff, 0xf0b58c, 0x4ac3b2]
    : [0x4960dc, 0x159eb8, 0xf1a461, 0x9e87ef];
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
  // First-visit brand reveal: short, skippable and never blocks content if sessionStorage is unavailable.
  let soundOn = true;
  let audioContext = null;
  let soundReady = false;
  function cue() {
    if (!soundOn || !audioContext || audioContext.state !== 'running') return;
    [[523, 0], [659, .075]].forEach(([freq, delay]) => {
      try {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const t = audioContext.currentTime + delay;
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(.008, t + .012); gain.gain.exponentialRampToValueAtTime(.0001, t + .10);
        osc.connect(gain); gain.connect(audioContext.destination); osc.start(t); osc.stop(t + .12);
      } catch (_) {}
    });
  }
  function activateSound() {
    if (soundReady) return;
    soundReady = true;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) { audioContext = new Ctx(); audioContext.resume().then(cue).catch(() => {}); }
    } catch (_) {}
  }
  let entryShown = false;
  function entryReveal() {
    if (kind !== 'home' || reduced || safeSession.get('dvnm-v46-entry') || !document.body) return;
    entryShown = true;
    safeSession.set('dvnm-v46-entry', '1');
    const veil = document.createElement('div');
    veil.className = 'dvnm-v45-prelude';
    veil.setAttribute('role', 'presentation');
    veil.innerHTML = '<div class="dvnm-v45-prelude-mark" aria-label="Davonium Technologies"><span class="dvnm-v45-mark-first"></span><span class="dvnm-v45-mark-second">TECHNOLOGIES</span></div><p>Useful technology, built with care.</p><div class="dvnm-v45-prelude-progress"><i></i></div><button type="button" class="dvnm-v45-skip">Skip intro</button>';
    const first = $('.dvnm-v45-mark-first', veil);
    const brand = 'DAVONIUM';
    [...brand].forEach((char, i) => {
      const span = document.createElement('span'); span.textContent = char; span.style.setProperty('--v45-delay', `${i * 42}ms`); span.setAttribute('aria-hidden', 'true'); first.appendChild(span);
    });
    document.body.appendChild(veil);
    const remove = () => { if (!veil.isConnected) return; veil.classList.add('is-leaving'); setTimeout(() => veil.remove(), 260); };
    $('.dvnm-v45-skip', veil).addEventListener('click', () => { activateSound(); remove(); });
    veil.addEventListener('pointerdown', (event) => { if (!event.target.closest('button')) { activateSound(); remove(); } });
    window.setTimeout(remove, 2050);
  }
  entryReveal();
  if (entryShown) window.setTimeout(typeHeadline, 2180); else typeHeadline();
  document.addEventListener('pointerdown', activateSound, { once: true, passive: true });
  document.addEventListener('keydown', activateSound, { once: true });

  // A browser-native, opt-in spoken introduction for the rendered human presenter. Never autoplays.
  const presenterStage = $('[data-dvnm-presenter-stage]');
  const introText = 'Hello, welcome to Davonium Technologies. We build useful websites, applications, software systems, and digital products. You can explore our five demo experiences, read our documentation, or start a project with our team. Let us show you what is possible.';
  const introButton = $('[data-dvnm-presenter-speak]');
  const introStatus = $('[data-dvnm-presenter-status]');
  function chooseVoice(voices) {
    const allowed = voices.filter(v => !/^en-IN(?:-|$)/i.test(v.lang || '') && !/^hi(?:-|$)/i.test(v.lang || '') && !/\b(indian|hindi)\b/i.test(v.name || ''));
    const rank = (v) => /^en-NG/i.test(v.lang || '') ? 0 : /^en-GB/i.test(v.lang || '') ? 1 : /^en-US/i.test(v.lang || '') ? 2 : /^en/i.test(v.lang || '') ? 3 : 4;
    return allowed.sort((a, b) => rank(a) - rank(b) || Number(b.localService) - Number(a.localService))[0] || null;
  }
  if (introButton) introButton.addEventListener('click', () => {
    const speech = window.speechSynthesis;
    if (!speech || typeof SpeechSynthesisUtterance === 'undefined') {
      if (introStatus) introStatus.textContent = 'Speech is not available in this browser. The written introduction remains available.';
      return;
    }
    if (introButton.dataset.v45Stop === 'yes') {
      speech.cancel();
      if (presenterStage) presenterStage.classList.remove('is-speaking');
      if (introStatus) introStatus.textContent = 'Introduction stopped. The written introduction remains available.';
      introButton.textContent = '▶ Hear introduction';
      introButton.setAttribute('aria-pressed', 'false');
      introButton.dataset.v45Stop = 'no';
      return;
    }
    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(introText);
    const voices = speech.getVoices ? speech.getVoices() : [];
    const voice = chooseVoice(voices);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'en-GB'; utterance.rate = .91; utterance.pitch = 1.0; utterance.volume = .9;
    if (presenterStage) presenterStage.classList.add('is-speaking');
    if (introStatus) introStatus.textContent = 'Your guide is speaking. Use Stop to interrupt or continue exploring below.';
    introButton.textContent = '■ Stop introduction';
    let ended = false;
    introButton.dataset.v45Stop = 'yes';
    introButton.setAttribute('aria-pressed', 'true');
    const finish = () => { if (ended) return; ended = true; if (presenterStage) presenterStage.classList.remove('is-speaking'); introButton.textContent = '▶ Hear introduction'; introButton.dataset.v45Stop = 'no'; introButton.setAttribute('aria-pressed', 'false'); };
    utterance.onend = finish; utterance.onerror = finish;
    try { speech.speak(utterance); } catch (_) { finish(); if (introStatus) introStatus.textContent = 'Speech could not start; the written introduction remains available.'; }
  });

  // Scene hosts: real WebGL geometry for the home and every page family, with graceful static CSS fallback.
  function getSceneHost() {
    if ($('[data-dvnm-robot-host]') && kind === 'home') return null;
    if (presenterStage) return presenterStage;
    const demoArt = $('.demo-hero-art');
    if (demoArt) return demoArt;
    const techArt = $('.tech-orbit-card');
    if (techArt) return techArt;
    const pageHero = $('main > .pagehero, main > .page-hero, main > .hero, main > section:first-of-type');
    return pageHero || null;
  }
  function makeSceneMarkup(host) {
    if (!host || $('.dvnm-v45-scene-canvas', host)) return $('.dvnm-v45-scene-canvas', host);
    host.classList.add(presenterStage && host === presenterStage ? 'dvnm-v45-presenter-host' : 'dvnm-v45-page-scene-host');
    const canvas = document.createElement('canvas');
    canvas.className = 'dvnm-v45-scene-canvas';
    canvas.setAttribute('aria-hidden', 'true'); canvas.setAttribute('role', 'presentation');
    canvas.dataset.v45Scene = kind;
    host.prepend(canvas);
    return canvas;
  }
  const sceneHost = getSceneHost();
  const sceneCanvas = makeSceneMarkup(sceneHost);
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
  function makeHumanPresenter(THREE) {
    const group = new THREE.Group();
    group.scale.setScalar(1.12);
    group.position.set(0, -.035, .42);
    const skin = new THREE.MeshStandardMaterial({ color: 0xb97854, roughness: .72, metalness: 0.0 });
    const skinLight = new THREE.MeshStandardMaterial({ color: 0xc98a65, roughness: .68, metalness: 0.0 });
    const hair = new THREE.MeshStandardMaterial({ color: 0x211b1a, roughness: .84, metalness: 0.0 });
    const jacket = new THREE.MeshStandardMaterial({ color: 0x334b60, roughness: .57, metalness: .15 });
    const jacketLight = new THREE.MeshStandardMaterial({ color: 0x637d91, roughness: .55, metalness: .18 });
    const trousers = new THREE.MeshStandardMaterial({ color: 0x263342, roughness: .67, metalness: .08 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0xf2f6f8, roughness: .6, metalness: .02 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x101d2b, roughness: .55, metalness: .12 });
    const cyan = new THREE.MeshStandardMaterial({ color: 0x43d9e8, emissive: 0x168ba6, emissiveIntensity: .28, roughness: .3, metalness: .22 });
    const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xfff8ed, roughness: .35 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x281e1a, roughness: .3 });
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x542a25, roughness: .75 });
    const teethMat = new THREE.MeshStandardMaterial({ color: 0xfff4e4, roughness: .32 });
    const addMesh = (parent, geometry, material, position, scale) => {
      const object = new THREE.Mesh(geometry, material);
      object.position.set(position[0], position[1], position[2]);
      if (scale) object.scale.set(scale[0], scale[1], scale[2]);
      parent.add(object);
      return object;
    };
    const limb = (parent, start, end, radiusStart, radiusEnd, material) => {
      const a = new THREE.Vector3(start[0], start[1], start[2]);
      const b = new THREE.Vector3(end[0], end[1], end[2]);
      const direction = new THREE.Vector3().subVectors(b, a);
      const length = direction.length();
      const object = new THREE.Mesh(new THREE.CylinderGeometry(radiusEnd, radiusStart, length, 12, 1), material);
      object.position.copy(a).add(b).multiplyScalar(.5);
      object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      parent.add(object);
      return object;
    };

    // Shoes and tapered trouser legs.
    [-1, 1].forEach(side => {
      addMesh(group, new THREE.CapsuleGeometry(.125, .58, 5, 10), trousers, [side * .17, -.79, 0], [1, 1, 1]);
      const shoe = addMesh(group, new THREE.CapsuleGeometry(.095, .22, 4, 8), shoeMat, [side * .17, -1.36, .10], [.94, .76, 1.32]);
      shoe.rotation.z = Math.PI / 2;
      addMesh(group, new THREE.BoxGeometry(.19, .025, .21), jacketLight, [side * .17, -1.23, .09], [1, .42, 1]);
    });

    // Jacket torso, shirt front and lapels.
    const torso = addMesh(group, new THREE.CapsuleGeometry(.315, .64, 7, 14), jacket, [0, .38, 0], [1.16, 1.0, .82]);
    const shoulders = addMesh(group, new THREE.SphereGeometry(.35, 16, 12), jacket, [0, .78, 0], [1.16, .57, .82]);
    addMesh(group, new THREE.CapsuleGeometry(.118, .60, 5, 10), shirt, [0, .41, .236], [.94, 1.0, .34]);
    const leftLapelShape = new THREE.Shape();
    leftLapelShape.moveTo(-.22, .79); leftLapelShape.lineTo(-.035, .70); leftLapelShape.lineTo(-.115, .29); leftLapelShape.lineTo(-.285, .62); leftLapelShape.closePath();
    const rightLapelShape = new THREE.Shape();
    rightLapelShape.moveTo(.22, .79); rightLapelShape.lineTo(.035, .70); rightLapelShape.lineTo(.115, .29); rightLapelShape.lineTo(.285, .62); rightLapelShape.closePath();
    addMesh(group, new THREE.ShapeGeometry(leftLapelShape), jacketLight, [0, 0, .278]);
    addMesh(group, new THREE.ShapeGeometry(rightLapelShape), jacketLight, [0, 0, .278]);
    addMesh(group, new THREE.BoxGeometry(.045, .35, .018), cyan, [0, .46, .286], [1, 1, 1]);
    addMesh(group, new THREE.SphereGeometry(.028, 8, 8), cyan, [.09, .43, .285], [1, 1, .5]);
    addMesh(group, new THREE.SphereGeometry(.022, 8, 8), jacketLight, [.12, .28, .274], [1, 1, .5]);

    // Neck and an oval, tapered head with individually modelled eyes, brows, nose, ears and jaw.
    addMesh(group, new THREE.CylinderGeometry(.082, .10, .23, 14), skin, [0, 1.0, .015]);
    const head = new THREE.Group(); head.position.set(0, 1.075, .02); group.add(head);
    const headPoints = [
      new THREE.Vector2(0, 0), new THREE.Vector2(.13, .008), new THREE.Vector2(.19, .035),
      new THREE.Vector2(.235, .105), new THREE.Vector2(.255, .19), new THREE.Vector2(.258, .275),
      new THREE.Vector2(.236, .355), new THREE.Vector2(.185, .425), new THREE.Vector2(.09, .465), new THREE.Vector2(0, .47)
    ];
    addMesh(head, new THREE.LatheGeometry(headPoints, 28), skin, [0, 0, 0]);
    [-1, 1].forEach(side => {
      addMesh(head, new THREE.SphereGeometry(.065, 12, 10), skinLight, [side * .25, .21, -.008], [.66, .84, .5]);
      addMesh(head, new THREE.SphereGeometry(.052, 12, 10), eyeWhite, [side * .091, .255, .216], [1, .82, .56]);
      addMesh(head, new THREE.SphereGeometry(.027, 12, 10), pupilMat, [side * .087, .255, .242], [.86, .88, .7]);
      addMesh(head, new THREE.SphereGeometry(.009, 8, 8), eyeWhite, [side * .087 - .006, .264, .258], [1, 1, .6]);
      const brow = addMesh(head, new THREE.CapsuleGeometry(.014, .078, 3, 6), hair, [side * .092, .315, .218], [1.0, .88, .6]);
      brow.rotation.z = side * -.11;
      const sideHair = addMesh(head, new THREE.SphereGeometry(.075, 10, 8), hair, [side * .22, .335, .018], [.65, 1.0, .75]);
    });
    addMesh(head, new THREE.SphereGeometry(.049, 12, 10), skinLight, [0, .18, .254], [.66, 1.12, .62]);
    const mouth = addMesh(head, new THREE.SphereGeometry(.052, 12, 10), mouthMat, [0, .105, .239], [.98, .18, .38]);
    const teeth = addMesh(head, new THREE.SphereGeometry(.029, 10, 8), teethMat, [0, .112, .252], [.70, .25, .35]);
    teeth.visible = false;
    const hairCap = addMesh(head, new THREE.SphereGeometry(.27, 18, 12), hair, [0, .425, -.015], [1.0, .39, .88]);
    addMesh(head, new THREE.SphereGeometry(.13, 12, 8), hair, [-.12, .39, .17], [1.0, .55, .7]);
    addMesh(head, new THREE.SphereGeometry(.09, 12, 8), hair, [.09, .405, .17], [1.05, .38, .62]);

    // Arms are separate articulated groups; the hands are open in a welcoming, explanatory pose.
    const armLeft = new THREE.Group(); armLeft.position.set(-.32, .77, .015); group.add(armLeft);
    limb(armLeft, [0, 0, 0], [-.31, -.20, .02], .12, .095, jacket);
    addMesh(armLeft, new THREE.SphereGeometry(.105, 10, 10), jacket, [-.31, -.20, .02], [1, 1, 1]);
    limb(armLeft, [-.31, -.20, .02], [-.48, .025, .09], .088, .066, jacketLight);
    addMesh(armLeft, new THREE.SphereGeometry(.075, 12, 10), skin, [-.50, .055, .105], [1.0, 1.15, .75]);
    [-1, 0, 1].forEach((i) => {
      const finger = addMesh(armLeft, new THREE.CapsuleGeometry(.022, .075, 3, 6), skin, [-.535 + i * .035, .125 + (i === 0 ? .01 : 0), .11], [.9, 1.0, .8]);
      finger.rotation.z = -.20 + i * .14;
    });
    const armRight = new THREE.Group(); armRight.position.set(.32, .77, .015); group.add(armRight);
    limb(armRight, [0, 0, 0], [.30, -.23, .02], .12, .095, jacket);
    addMesh(armRight, new THREE.SphereGeometry(.105, 10, 10), jacket, [.30, -.23, .02], [1, 1, 1]);
    limb(armRight, [.30, -.23, .02], [.49, .02, .10], .088, .065, jacketLight);
    addMesh(armRight, new THREE.SphereGeometry(.076, 12, 10), skin, [.51, .055, .11], [1.0, 1.08, .78]);
    [-1, 0, 1].forEach((i) => {
      const finger = addMesh(armRight, new THREE.CapsuleGeometry(.022, .085, 3, 6), skin, [.54 + i * .037, .128 + (i === 0 ? .015 : 0), .115], [.9, 1, .8]);
      finger.rotation.z = .18 - i * .12;
    });
    // Small illuminated floor disc anchors the character instead of making him float like a balloon.
    const platform = new THREE.Group(); platform.position.set(0, -1.47, .12); group.add(platform);
    addMesh(platform, new THREE.CylinderGeometry(.70, .76, .065, 40), new THREE.MeshStandardMaterial({ color: 0x243a50, metalness: .45, roughness: .38 }), [0, 0, 0]);
    addMesh(platform, new THREE.TorusGeometry(.66, .012, 6, 54), cyan, [0, .04, 0]);
    addMesh(platform, new THREE.CylinderGeometry(.55, .58, .014, 40), new THREE.MeshStandardMaterial({ color: 0x82c6d6, roughness: .6, transparent: true, opacity: .24 }), [0, .039, 0]);
    return { group, head, torso, shoulders, armLeft, armRight, mouth, teeth, platform };
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
    const human = kind === 'home' && host.matches('[data-dvnm-presenter-stage]') ? makeHumanPresenter(THREE) : null;
    if (human) scene.add(human.group);
    const state = { THREE, canvas, host, kind, renderer, scene, camera, world, rings, objects, particles, materials: matList, ambient, key, rim, ground, human, low, pX: 0, pY: 0, scroll: 0, started: performance.now(), raf: 0, visible: true, stopped: false, mode: host.dataset.v45Motion || 'default' };
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
    canvas.addEventListener('webglcontextrestored', () => { if (human) host.classList.add('has-v45-webgl'); state.resize(); state.theme(); state.start(); }, false);
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
      objects.forEach(({ mesh, a, radius, index, baseY }) => {
        const slow = state.low ? .5 : 1;
        if (activeMotion && !focus) { mesh.rotation.x += .0016 * slow; mesh.rotation.y += .0022 * slow; }
        mesh.position.x = focus ? baseX * .32 : state.mode === 'path' ? Math.cos(a + (activeMotion ? t * (darkMode ? -.095 : .055) : 0)) * radius : baseX;
        mesh.position.y = (focus ? baseY * .35 : baseY) + (activeMotion && !focus ? Math.sin(t * (darkMode ? .78 : .49) + a) * (darkMode ? .12 : .075) : 0);
        mesh.position.z = focus ? baseZ * .25 : baseZ;
        if (state.mode === 'prism') mesh.scale.setScalar((.76 + (index % 4) * .14) * (1 + (activeMotion ? .06 * Math.sin(t + index) : 0)));
        else mesh.scale.setScalar(.78 + (index % 4) * .14);
      });
      particles.rotation.y = activeMotion ? t * (darkMode ? .027 : -.014) : 0; particles.rotation.z = state.pX * .025;
      if (state.human) {
        const speaking = state.host.classList.contains('is-speaking');
        const breath = activeMotion ? Math.sin(t * .72) : 0;
        state.human.group.position.y = -.035 + breath * .018;
        state.human.head.rotation.y = state.pX * .14 + (activeMotion ? Math.sin(t * .38) * .035 : 0);
        state.human.head.rotation.x = state.pY * .07 + (activeMotion ? Math.sin(t * .31) * .012 : 0);
        state.human.torso.scale.set(1.16, 1 + breath * .006, .82);
        state.human.armLeft.rotation.z = .035 + (activeMotion ? Math.sin(t * (speaking ? 3.8 : .68)) * (speaking ? .10 : .02) : 0);
        state.human.armRight.rotation.z = -.045 + (activeMotion ? Math.sin(t * (speaking ? 4.5 : .82)) * (speaking ? .13 : .028) : 0);
        state.human.mouth.scale.y = speaking ? (.22 + Math.abs(Math.sin(t * 10.8)) * .48) : .18;
        state.human.teeth.visible = speaking && Math.sin(t * 10.8) > .15;
      }
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
        if (state.human && presenterStage) presenterStage.setAttribute('data-v45-human-model', 'ready');
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
  installSceneControls();

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
