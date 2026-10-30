/* Davonium V56 — Signal Architecture hero scene.
   A restrained 3D portal/architecture layer behind the approved DVNM Bot cutout.
   It is optional, desktop-first, silent, visibility-aware and has a CSS fallback. */
(() => {
  'use strict';
  if (window.__davoniumV56HeroScene) return;
  window.__davoniumV56HeroScene = true;

  const host = document.querySelector('[data-v56-hero-scene]');
  if (!host) return;
  const canvas = host.querySelector('canvas');
  if (!canvas) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const saveData = Boolean(navigator.connection?.saveData);
  const lowPower = Number(navigator.hardwareConcurrency || 8) <= 4 || /Android|iPhone|iPad/i.test(navigator.userAgent) || saveData;
  if (reduced || lowPower || !window.WebGLRenderingContext) return;

  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
  let renderer, scene, camera, frame = 0, running = false, visible = true, lastTime = 0;
  let portal, linePortal, floorRing, modules = [], resizeObserver;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  const roundedRect = (THREE, width, height, radius) => {
    const w = width / 2, h = height / 2, r = Math.min(radius, w, h);
    const s = new THREE.Shape();
    s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r);
    s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h); s.lineTo(-w + r, h);
    s.quadraticCurveTo(-w, h, -w, h - r); s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
    return s;
  };

  function schedule() {
    if (!running && visible && document.visibilityState !== 'hidden') {
      running = true;
      frame = requestAnimationFrame(render);
    }
  }
  function pause() {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }
  function resize() {
    if (!renderer || !camera) return;
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  function render(now) {
    frame = 0;
    if (!running || !visible || document.visibilityState === 'hidden') { pause(); return; }
    const t = now * .001;
    const dt = Math.min(.04, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    pointer.x += (pointer.tx - pointer.x) * .035;
    pointer.y += (pointer.ty - pointer.y) * .035;
    portal.rotation.y = Math.sin(t * .22) * .035 + pointer.x * .035;
    portal.rotation.x = Math.sin(t * .18) * .012 - pointer.y * .02;
    linePortal.rotation.y = portal.rotation.y * -1.2;
    floorRing.rotation.z += dt * .035;
    modules.forEach((item, index) => {
      item.group.position.y = item.baseY + Math.sin(t * .42 + index * 1.4) * .045;
      item.group.rotation.y = Math.sin(t * .26 + index) * .05;
    });
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  }

  async function init() {
    try {
      const THREE = await import(THREE_URL);
      if (!host.isConnected || !canvas.isConnected) return;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(38, 1, .1, 40);
      camera.position.set(0, .05, 8.8);
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power', depth: true, stencil: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.04;

      const ambient = new THREE.HemisphereLight(0xeafaff, 0x142432, 1.7); scene.add(ambient);
      const key = new THREE.DirectionalLight(0xf2fbff, 2.3); key.position.set(-3, 5, 5); scene.add(key);
      const cyan = new THREE.PointLight(0x10e0e8, 5.2, 12, 2); cyan.position.set(2.6, 1.8, 1.4); scene.add(cyan);
      const violet = new THREE.PointLight(0x7774ef, 2.1, 10, 2); violet.position.set(-3, -.2, -1.2); scene.add(violet);

      const darkMode = document.documentElement.dataset.theme !== 'light';
      const frameMaterial = new THREE.MeshPhysicalMaterial({ color: darkMode ? 0x152838 : 0xd4e0e6, metalness: .72, roughness: .24, clearcoat: .7, clearcoatRoughness: .22, emissive: 0x05242c, emissiveIntensity: darkMode ? .18 : .07 });
      const edgeMaterial = new THREE.MeshBasicMaterial({ color: darkMode ? 0x25d9e4 : 0x008d9f, transparent: true, opacity: darkMode ? .92 : .72 });
      const darkGlass = new THREE.MeshPhysicalMaterial({ color: darkMode ? 0x07131f : 0xeef7f8, metalness: .35, roughness: .3, transparent: true, opacity: darkMode ? .44 : .3, side: THREE.DoubleSide });

      // Monumental portal frame: custom extruded rounded-rectangle architecture, not random floating shapes.
      const outer = roundedRect(THREE, 3.9, 5.0, .72);
      const hole = roundedRect(THREE, 3.28, 4.37, .52);
      hole.getPoints().reverse();
      outer.holes.push(new THREE.Path(hole.getPoints()));
      const geometry = new THREE.ExtrudeGeometry(outer, { depth: .28, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: .08, bevelThickness: .07, curveSegments: 14 });
      portal = new THREE.Group();
      const body = new THREE.Mesh(geometry, frameMaterial); portal.add(body);
      const inset = new THREE.Mesh(new THREE.PlaneGeometry(3.18, 4.1), darkGlass); inset.position.z = -.18; portal.add(inset);
      portal.position.set(.12, .04, -.62); scene.add(portal);

      const edgeShape = roundedRect(THREE, 3.46, 4.56, .56);
      const edge = new THREE.Mesh(new THREE.ShapeGeometry(edgeShape), new THREE.MeshBasicMaterial({ color: darkMode ? 0x33edf0 : 0x18aab7, transparent: true, opacity: .15, side: THREE.DoubleSide }));
      edge.position.set(.12, .04, -.18); scene.add(edge);

      const lineOuter = roundedRect(THREE, 3.48, 4.57, .58);
      linePortal = new THREE.Group();
      const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(lineOuter.getPoints(100).map(p => new THREE.Vector3(p.x, p.y, 0))), edgeMaterial);
      linePortal.add(line); linePortal.position.set(.12, .04, -.22); scene.add(linePortal);

      // Structural side fins and a low circular landing ring establish scale and depth.
      for (const side of [-1, 1]) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(.11, 3.0, .16), frameMaterial);
        fin.position.set(side * 2.2, -.1, -.45); fin.rotation.z = side * -.025; scene.add(fin);
        const signal = new THREE.Mesh(new THREE.BoxGeometry(.022, 1.9, .018), edgeMaterial);
        signal.position.set(side * 2.12, .18, -.34); scene.add(signal);
      }
      const ringGeo = new THREE.TorusGeometry(1.55, .013, 8, 96);
      floorRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: darkMode ? 0x35dfe8 : 0x149cab, transparent: true, opacity: .55 }));
      floorRing.rotation.x = Math.PI / 2; floorRing.position.set(.08, -2.05, .15); floorRing.scale.set(1.12, .68, 1); scene.add(floorRing);

      // Three quiet data modules, arranged as a coherent system rather than a particle field.
      const moduleMaterial = new THREE.MeshPhysicalMaterial({ color: darkMode ? 0x263c4b : 0xdce9ee, metalness: .65, roughness: .3, clearcoat: .45 });
      const moduleEdge = new THREE.MeshBasicMaterial({ color: darkMode ? 0x31dce4 : 0x159eac, transparent: true, opacity: .8 });
      [[-2.05,1.15,.35,.36], [2.12,.72,-.08,.31], [1.93,-1.05,-.2,.25]].forEach(([x,y,z,size], index) => {
        const group = new THREE.Group();
        const cube = new THREE.Mesh(new THREE.BoxGeometry(size,size,size), moduleMaterial); group.add(cube);
        const accent = new THREE.Mesh(new THREE.BoxGeometry(size*.72,.018,.018), moduleEdge); accent.position.set(0,-size*.22,size*.51); group.add(accent);
        group.position.set(x,y,z); scene.add(group); modules.push({group,baseY:y});
      });

      const observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        if (visible) { lastTime = performance.now(); schedule(); } else pause();
      }, { threshold: .08 });
      observer.observe(host);
      resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
      const onPointer = event => {
        if (event.pointerType === 'touch') return;
        const rect = host.getBoundingClientRect();
        pointer.tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / Math.max(1, rect.width) - .5) * 2));
        pointer.ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / Math.max(1, rect.height) - .5) * 2));
      };
      host.addEventListener('pointermove', onPointer, {passive:true});
      host.addEventListener('pointerleave', () => { pointer.tx=0; pointer.ty=0; }, {passive:true});
      const themeObserver = new MutationObserver(() => {
        const light = document.documentElement.dataset.theme === 'light';
        frameMaterial.color.setHex(light ? 0xd4e0e6 : 0x152838);
        darkGlass.color.setHex(light ? 0xeef7f8 : 0x07131f);
        darkGlass.opacity = light ? .3 : .44;
        edgeMaterial.color.setHex(light ? 0x008d9f : 0x25d9e4);
        moduleMaterial.color.setHex(light ? 0xdce9ee : 0x263c4b);
      });
      themeObserver.observe(document.documentElement, {attributes:true,attributeFilter:['data-theme']});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') pause();
        else { lastTime = performance.now(); if (visible) schedule(); }
      });
      resize();
      host.classList.add('v56-3d-ready');
      lastTime = performance.now();
      schedule();
      window.addEventListener('pagehide', () => { pause(); observer.disconnect(); resizeObserver?.disconnect(); renderer?.dispose(); }, {once:true});
    } catch (error) {
      // CSS portal and approved robot artwork remain the complete fallback.
      host.dataset.sceneFallback = 'true';
      try { renderer?.dispose(); } catch (_) {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
