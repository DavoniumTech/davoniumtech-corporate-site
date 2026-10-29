/* Davonium V55 — lightweight cinematic Three.js DVNM Bot with speech-aware face and SVG fallback. */
(() => {
  'use strict';
  if (window.__dvnmThreeRobotLoaderV55) return;
  window.__dvnmThreeRobotLoaderV55 = true;

  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const lowPower = Number(navigator.hardwareConcurrency || 4) <= 4 || /Android|iPhone|iPad/i.test(navigator.userAgent) || navigator.connection?.saveData;
  const states = new Map();
  let THREE = null, importPromise = null, raf = 0;
  const registry = window.DavoniumRobotRegistry = {
    getScenes: () => [...states.values()].filter(s => !s.disposed && s.canvas?.isConnected),
    setSpeaking: active => {
      const speaking = Boolean(active);
      states.forEach(s => { s.speaking = speaking; s.host?.classList.toggle('is-speaking', speaking); if (speaking) activate(s); });
      // Keep the approved fallback responsive to speech even when WebGL cannot initialize.
      document.querySelectorAll('[data-dvnm-robot-host]').forEach(host => host.classList.toggle('is-speaking', speaking));
    },
    disposeAll: () => states.forEach(dispose)
  };

  function setFallback(host, reason = 'fallback') {
    if (!host) return;
    host.dataset.threeFailed = 'true';
    host.dataset.botState = 'fallback';
    host.dataset.botFallbackReason = reason;
    host.querySelector('.dvnm-three-loading')?.remove();
    host.querySelector('.dvnm-robot-fallback')?.setAttribute('aria-hidden', 'false');
  }
  function loadThree() {
    if (!importPromise) importPromise = import(THREE_URL).then(module => (THREE = module));
    return importPromise;
  }
  function simpleMaterial(color, options = {}) {
    return new THREE.MeshPhysicalMaterial({ color, roughness: .27, metalness: .18, clearcoat: .45, clearcoatRoughness: .22, ...options });
  }
  function makeLabelTexture() {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '800 76px Manrope, Inter, Arial, sans-serif';
    ctx.shadowColor = '#37f5f0'; ctx.shadowBlur = 22; ctx.fillStyle = '#8ffff8'; ctx.fillText('DVNM', 256, 64);
    ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(210,255,255,.85)'; ctx.lineWidth = 1.5; ctx.strokeText('DVNM', 256, 64);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true;
    return texture;
  }
  function createScene(canvas, host) {
    if (!canvas || !canvas.isConnected || states.has(canvas)) return null;
    if (navigator.connection?.saveData || !window.WebGLRenderingContext) { setFallback(host, 'webgl-unavailable-or-save-data'); return null; }
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !lowPower, powerPreference: 'low-power', depth: true, stencil: false, premultipliedAlpha: true });
    } catch (_) { setFallback(host, 'webgl-initialization-failed'); return null; }

    const mini = canvas.dataset.robotSize === 'mini';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(mini ? 34 : 30, 1, .1, 40);
    const aim = new THREE.Vector3(0, .88, 0);
    const cameraHome = new THREE.Vector3(0, .92, mini ? 4.1 : 4.65);
    camera.position.copy(cameraHome); camera.lookAt(aim);
    const maxPixelRatio = lowPower ? 1.15 : 1.65;
    const rendererPixelRatio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.05 : 1.3);
    renderer.setPixelRatio(rendererPixelRatio); renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;

    scene.add(new THREE.HemisphereLight(0xe4fbff, 0x1a3043, 2.1));
    const key = new THREE.DirectionalLight(0xf6fcff, 3.0); key.position.set(-3, 4.5, 4); scene.add(key);
    const rim = new THREE.PointLight(0x24ecf0, 8, 7, 2); rim.position.set(2.1, 2.2, -1.4); scene.add(rim);
    const fill = new THREE.PointLight(0x8178ff, 3.2, 7, 2); fill.position.set(-2.8, .9, 1.8); scene.add(fill);

    const shell = simpleMaterial(0xeaf6fa, { metalness: .2, roughness: .23, emissive: 0x06212a, emissiveIntensity: .05 });
    const seam = simpleMaterial(0x9fb9c8, { metalness: .48, roughness: .27 });
    const dark = simpleMaterial(0x071d2a, { metalness: .5, roughness: .18, clearcoat: .8 });
    const cyan = simpleMaterial(0x61fff5, { color: 0x61fff5, roughness: .2, metalness: .08, emissive: 0x16e4eb, emissiveIntensity: 1.5 });
    const cyanDeep = simpleMaterial(0x087a91, { emissive: 0x087a91, emissiveIntensity: .7 });
    const robot = new THREE.Group(); scene.add(robot);
    const sphere = (parent, material, position, scale, segments = 22) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.max(12, segments - 6)), material);
      mesh.position.set(...position); mesh.scale.set(...scale); mesh.castShadow = false; mesh.receiveShadow = false; parent.add(mesh); return mesh;
    };
    const capsule = (parent, material, position, radius, length, segments = 10) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 4, segments), material);
      mesh.position.set(...position); parent.add(mesh); return mesh;
    };
    const roundedBox = (parent, material, position, size, bevel = .04) => {
      // Slightly rounded silhouette constructed from a small scaled sphere gives the bot its friendly shape.
      const geometry = new THREE.BoxGeometry(...size);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position); mesh.scale.set(1, 1, 1); mesh.castShadow = false; parent.add(mesh);
      mesh.geometry.computeVertexNormals();
      return mesh;
    };

    // One quiet orbital halo; no floor plane, footing, or cast shadow.
    const haloMaterial = new THREE.MeshBasicMaterial({ color: 0x49e9ed, transparent: true, opacity: .43, depthWrite: false });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(.86, .009, 6, 96), haloMaterial);
    halo.position.set(0, .92, -.28); halo.rotation.set(.25, -.22, .48); halo.scale.set(1, .78, 1); scene.add(halo);

    // Small body with simple shoulder joints and a single glowing DVNM chest window.
    const body = new THREE.Group(); robot.add(body);
    sphere(body, shell, [0, .48, 0], [.34, .42, .25], 28);
    sphere(body, seam, [0, .48, .194], [.255, .26, .078], 24);
    const chest = sphere(body, dark, [0, .49, .24], [.235, .205, .052], 24);
    const chestGlow = new THREE.Mesh(new THREE.TorusGeometry(.188, .008, 6, 48), cyan); chestGlow.position.set(0, .49, .292); chestGlow.scale.set(1.12, .75, 1); body.add(chestGlow);
    const labelTexture = makeLabelTexture();
    if (labelTexture) {
      const label = new THREE.Mesh(new THREE.PlaneGeometry(.33, .083), new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false, toneMapped: false }));
      label.position.set(0, .49, .299); body.add(label);
    }
    const heart = sphere(body, cyan, [0, .25, .276], [.04, .04, .018], 18);

    const headPivot = new THREE.Group(); headPivot.position.set(0, 1.05, .015); robot.add(headPivot);
    sphere(headPivot, shell, [0, 0, 0], [.405, .34, .32], 30);
    sphere(headPivot, seam, [0, -.015, .207], [.357, .255, .14], 26);
    sphere(headPivot, dark, [0, -.008, .258], [.318, .205, .095], 28);
    const eyeLeft = sphere(headPivot, cyan, [-.125, .026, .33], [.059, .071, .027], 18);
    const eyeRight = sphere(headPivot, cyan, [.125, .026, .33], [.059, .071, .027], 18);
    // Distinct deep-black pupils and tiny reflective catchlights make the eye display read clearly.
    const pupilMaterial = simpleMaterial(0x020a16, { metalness: .12, roughness: .12, clearcoat: 1, emissive: 0x020812, emissiveIntensity: .02 });
    sphere(headPivot, pupilMaterial, [-.125, .027, .357], [.023, .032, .014], 18);
    sphere(headPivot, pupilMaterial, [.125, .027, .357], [.023, .032, .014], 18);
    const glintMaterial = new THREE.MeshBasicMaterial({ color: 0xf4ffff });
    sphere(headPivot, glintMaterial, [-.133, .039, .369], [.006, .009, .004], 10);
    sphere(headPivot, glintMaterial, [.117, .039, .369], [.006, .009, .004], 10);
    // A dark mouth cavity expands vertically while browser speech synthesis is active.
    sphere(headPivot, cyan, [0, -.105, .336], [.080, .024, .016], 16);
    const mouth = sphere(headPivot, dark, [0, -.105, .353], [.059, .010, .015], 16);
    // Compact antenna, intentionally understated.
    capsule(headPivot, seam, [0, .352, -.025], .018, .075, 8);
    const antenna = sphere(headPivot, cyan, [0, .405, -.025], [.038, .038, .038], 16);
    const earLeft = sphere(headPivot, cyanDeep, [-.39, -.008, .025], [.045, .08, .07], 16);
    const earRight = sphere(headPivot, cyanDeep, [.39, -.008, .025], [.045, .08, .07], 16);
    // Arms/feet are deliberately short and smooth; speaking is expressed by a small presentation gesture.
    const armLeft = new THREE.Group(); armLeft.position.set(-.32, .68, 0); robot.add(armLeft);
    capsule(armLeft, seam, [0, -.13, .02], .075, .20, 10).rotation.z = -.2;
    sphere(armLeft, shell, [0, -.27, .05], [.075, .06, .07], 14);
    const armRight = new THREE.Group(); armRight.position.set(.32, .68, 0); robot.add(armRight);
    capsule(armRight, seam, [0, -.13, .02], .075, .20, 10).rotation.z = .2;
    sphere(armRight, shell, [0, -.27, .05], [.075, .06, .07], 14);
    capsule(robot, seam, [-.135, .08, .015], .072, .11, 9);
    capsule(robot, seam, [.135, .08, .015], .072, .11, 9);
    sphere(robot, dark, [-.135, .018, .075], [.108, .045, .12], 16);
    sphere(robot, dark, [.135, .018, .075], [.108, .045, .12], 16);

    const hostBox = host.getBoundingClientRect();
    const state = {
      canvas, host, renderer, scene, camera, robot, body, headPivot, mouth, eyeLeft, eyeRight, antenna, chest, chestGlow, heart, halo,
      armLeft, armRight, key, rim, fill, shell, cyan, dark, disposed:false, active:false, speaking:false,
      started:performance.now(), lastFrameAt:0, frameCount:0, frameSamples:0, frameIndex:0, frameTimes:new Float32Array(60), fps:0,
      quality:'auto', pixelRatio:rendererPixelRatio, maxPixelRatio, reducedEffects:reducedMotion, cameraPreset:'orbit',
      cameraHome, cameraTarget:cameraHome.clone(), cameraAim:aim, size:{w:Math.max(1,hostBox.width),h:Math.max(1,hostBox.height)}, sizeInitialized:false,
      pulseUntil:0, theme:document.documentElement.dataset.theme || 'light'
    };
    states.set(canvas, state);
    state.resize = () => {
      if (state.disposed || !canvas.isConnected) return;
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width)); const height = Math.max(1, Math.round(rect.height));
      if (width === state.size.w && height === state.size.h && state.sizeInitialized) return;
      state.size.w = width; state.size.h = height;
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); state.sizeInitialized = true;
    };
    state.applyPixelRatio = ratio => {
      const next = Math.max(.8, Math.min(state.maxPixelRatio, ratio));
      if (Math.abs(next - state.pixelRatio) < .035) return;
      state.pixelRatio = next; renderer.setPixelRatio(next); state.sizeInitialized = false; state.resize();
    };
    state.setQuality = profile => {
      state.quality = ['auto','high','battery'].includes(profile) ? profile : 'auto';
      if (state.quality === 'battery') state.applyPixelRatio(Math.min(1, window.devicePixelRatio || 1));
      else if (state.quality === 'high') state.applyPixelRatio(Math.min(window.devicePixelRatio || 1, state.maxPixelRatio));
      else state.applyPixelRatio(Math.min(window.devicePixelRatio || 1, state.maxPixelRatio, lowPower ? 1.05 : 1.3));
    };
    state.setReducedEffects = enabled => { state.reducedEffects = Boolean(enabled); };
    state.setCameraPreset = preset => {
      state.cameraPreset = ['orbit','cinematic','reset'].includes(preset) ? preset : 'orbit';
      if (state.cameraPreset === 'cinematic') { state.cameraTarget.set(.18, 1.04, mini ? 3.9 : 4.18); state.cameraAim.set(0, .82, 0); }
      else if (state.cameraPreset === 'reset') { state.cameraTarget.copy(state.cameraHome); state.cameraAim.set(0, .88, 0); }
      else { state.cameraTarget.copy(state.cameraHome); state.cameraAim.set(0, .88, 0); }
      activate(state);
    };
    state.updateTheme = () => {
      const darkTheme = document.documentElement.dataset.theme === 'dark'; state.theme = darkTheme ? 'dark' : 'light';
      if (darkTheme) { key.intensity = 3.2; rim.intensity = 8; fill.intensity = 3.5; shell.color.setHex(0xeaf6fa); }
      else { key.intensity = 3.6; rim.intensity = 6.5; fill.intensity = 2.7; shell.color.setHex(0xf6ffff); }
    };
    state.getStats = () => {
      const info = renderer.info || {};
      const bytes = ((info.memory?.geometries || 0) * 22000) + ((info.memory?.textures || 0) * 512 * 512 * 4);
      return { fps:state.fps, estimatedVramMB:bytes/1048576, geometries:Number(info.memory?.geometries||0), textures:Number(info.memory?.textures||0), drawCalls:Number(info.render?.calls||0), quality:state.quality, pixelRatio:state.pixelRatio };
    };
    state.pause = () => { state.active = false; };
    state.start = () => activate(state);
    state.dispose = () => dispose(state);
    state.updateTheme(); state.resize();
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); setFallback(host, 'webgl-context-lost'); state.pause(); }, { passive:false });
    const observer = 'ResizeObserver' in window ? new ResizeObserver(state.resize) : null;
    observer?.observe(host); state.observer = observer;
    host.dataset.threeReady = 'true'; host.dataset.botState = 'ready'; host.dataset.theme = state.theme;
    host.querySelector('.dvnm-three-loading')?.remove();
    const fallback = host.querySelector('.dvnm-robot-fallback'); if (fallback) fallback.setAttribute('aria-hidden', 'true');
    return state;
  }

  function animate(state, now) {
    if (state.disposed || !state.active) return;
    if (state.lastFrameAt) {
      const delta = now - state.lastFrameAt;
      if (delta > 0 && delta < 200) {
        state.frameTimes[state.frameIndex] = delta; state.frameIndex = (state.frameIndex + 1) % state.frameTimes.length;
        state.frameSamples = Math.min(60, state.frameSamples + 1);
        if (state.frameSamples >= 12 && state.frameCount % 12 === 0) {
          let sum = 0; for (let i = 0; i < state.frameSamples; i++) sum += state.frameTimes[i]; state.fps = 1000 / Math.max(1, sum / state.frameSamples);
        }
        if (state.quality === 'auto' && state.frameSamples === 60 && state.frameCount % 60 === 0) {
          if (state.fps < 48) state.applyPixelRatio(state.pixelRatio - .1);
          else if (state.fps > 58) state.applyPixelRatio(state.pixelRatio + .045);
        }
      }
    }
    state.lastFrameAt = now; state.frameCount++;
    const t = now * .001;
    const speaking = state.speaking || state.host.classList.contains('is-speaking');
    const pulse = speaking ? .5 + .5 * Math.sin(t * 13) : (now < state.pulseUntil ? .5 + .5 * Math.sin(t * 18) : 0);
    if (!state.reducedEffects) {
      state.robot.position.y = .025 + Math.sin(t * 1.05) * .028;
      state.robot.rotation.y = Math.sin(t * .38) * .08;
      state.headPivot.rotation.y = Math.sin(t * .74) * .045;
      state.headPivot.rotation.z = speaking ? Math.sin(t * 5) * .024 : Math.sin(t * .7) * .012;
      state.halo.rotation.z += .0008;
    }
    // Keep both arms relaxed at the sides. Speech motion is carried by the mouth, eyes and chest only.
    state.armLeft.rotation.z = -.035 + Math.sin(t * .72) * .009;
    state.armRight.rotation.z = .035 + Math.sin(t * .69) * .009;
    state.mouth.scale.y = speaking ? .010 + pulse * .055 : .008 + pulse * .004;
    const glow = speaking ? 1.25 + pulse * 1.6 : .45;
    state.cyan.emissiveIntensity = speaking ? 1.25 + pulse * 1.6 : 1.05;
    state.shell.emissiveIntensity = speaking ? .09 + pulse * .08 : .04;
    state.chestGlow.material.emissiveIntensity = glow;
    state.heart.material.emissiveIntensity = glow + .3;
    state.antenna.material.emissiveIntensity = speaking ? 1.7 + pulse : 1.1;
    state.eyeLeft.material.emissiveIntensity = speaking ? 1.7 + pulse : 1.2;
    state.eyeRight.material.emissiveIntensity = speaking ? 1.7 + pulse : 1.2;
    state.camera.position.lerp(state.cameraTarget, state.reducedEffects ? .12 : .045); state.camera.lookAt(state.cameraAim);
    state.resize(); state.renderer.render(state.scene, state.camera);
  }
  function frame(now) {
    raf = 0; let needsNext = false;
    for (const state of states.values()) {
      if (!state.active || state.disposed || !state.canvas.isConnected || document.visibilityState === 'hidden') continue;
      needsNext = true;
      try { animate(state, now); }
      catch (_) { setFallback(state.host, 'render-error'); state.active = false; }
    }
    if (needsNext) raf = requestAnimationFrame(frame);
  }
  function ensureFrame() { if (!raf && document.visibilityState !== 'hidden') raf = requestAnimationFrame(frame); }
  function activate(state) { if (!state || state.disposed) return; state.active = true; state.resize(); ensureFrame(); }
  function deactivate(state) { if (state) state.active = false; }
  function dispose(state) {
    if (!state || state.disposed) return;
    state.disposed = true; state.active = false; state.observer?.disconnect();
    const geometries = new Set(), materials = new Set(), textures = new Set();
    state.scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        materials.add(material); Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
      }
    });
    textures.forEach(texture => texture.dispose()); geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
    state.renderer.renderLists?.dispose?.(); state.renderer.dispose(); states.delete(state.canvas);
  }
  async function upgrade(canvas) {
    if (!canvas || canvas.dataset.threeRequested || states.has(canvas) || !canvas.isConnected) return;
    const host = canvas.closest('[data-dvnm-robot-host]'); if (!host || host.closest('[hidden]')) return;
    if (navigator.connection?.saveData) { setFallback(host, 'save-data'); return; }
    canvas.dataset.threeRequested = 'true';
    try {
      await loadThree();
      if (!canvas.isConnected || host.closest('[hidden]')) { delete canvas.dataset.threeRequested; return; }
      const state = createScene(canvas, host); if (state) activate(state);
    } catch (_) { delete canvas.dataset.threeRequested; setFallback(host, 'three-module-load-failed'); }
  }
  const visibilityObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => {
    const state = states.get(entry.target);
    if (entry.isIntersecting) { if (state) activate(state); else upgrade(entry.target); }
    else deactivate(state);
  }), { rootMargin:'120px 0px', threshold:.01 }) : null;
  const observe = (root = document) => {
    root.querySelectorAll?.('[data-dvnm-robot]').forEach(canvas => {
      if (canvas.dataset.threeObserved) {
        if (!states.has(canvas) && !canvas.dataset.threeRequested && !canvas.closest('[hidden]')) upgrade(canvas);
        return;
      }
      canvas.dataset.threeObserved='true';
      if (visibilityObserver) visibilityObserver.observe(canvas); else upgrade(canvas);
    });
  };
  observe();
  const mutations = new MutationObserver(records => records.forEach(record => {
    record.addedNodes.forEach(node => { if (node.nodeType !== 1) return; if (node.matches?.('[data-dvnm-robot]')) observe(node.parentNode || document); else if (node.querySelector?.('[data-dvnm-robot]')) observe(node); });
    if (record.type === 'attributes') {
      if (record.target.matches?.('[data-dvnm-robot]')) {
        const state = states.get(record.target);
        if (state && !record.target.closest('[hidden]')) activate(state);
        else if (!state && !record.target.closest('[hidden]')) upgrade(record.target);
      } else if (!record.target.closest?.('[hidden]')) observe(record.target);
    }
  }));
  mutations.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['hidden'] });
  window.addEventListener('dvnm:robot-speaking', event => registry.setSpeaking(Boolean(event.detail?.active)));
  window.addEventListener('dvnm:robot-mouth-pulse', event => states.forEach(state => { state.pulseUntil = performance.now() + Math.max(70, Math.min(240, Number(event.detail?.duration) || 140)); activate(state); }));
  const themeObserver = new MutationObserver(() => states.forEach(state => state.updateTheme()));
  themeObserver.observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') states.forEach(deactivate);
    else states.forEach(state => { const rect = state.host.getBoundingClientRect(); if (rect.bottom > 0 && rect.top < innerHeight) activate(state); });
  });
  const cleanupRemoved = node => {
    const canvases = [];
    if (node?.nodeType === 1 && node.matches?.('[data-dvnm-robot]')) canvases.push(node);
    node?.querySelectorAll?.('[data-dvnm-robot]').forEach(canvas => canvases.push(canvas));
    canvases.forEach(canvas => { const state = states.get(canvas); if (state && !canvas.isConnected) dispose(state); });
  };
  const cleanupObserver = new MutationObserver(records => records.forEach(record => record.removedNodes.forEach(cleanupRemoved)));
  cleanupObserver.observe(document.documentElement, { childList:true, subtree:true });
  window.addEventListener('pagehide', () => { states.forEach(deactivate); if (raf) cancelAnimationFrame(raf); raf = 0; }, { once:true });
})();
