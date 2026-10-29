/* DAVONIUM V53 — Phase A scroll-driven cinematic scene
   Principles: controlled camera, focal hierarchy, scroll progress, reduced-motion safe.
   Own geometry and palette. Falls back silently if WebGL unavailable.
*/
(() => {
  'use strict';
  if (window.__dvnmV53Cinematic) return;
  window.__dvnmV53Cinematic = true;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || /Android|iPhone|iPad/i.test(navigator.userAgent);

  function init() {
    if (reduced || !window.WebGLRenderingContext) return;
    const host = document.getElementById('v53-scene-host');
    const progressBar = document.querySelector('.v53-scroll-progress > i');
    if (!host) return;

    const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
    import(THREE_URL).then(THREE => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.set(0, 0.4, 8);

      const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.1 : 1.4));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      host.classList.add('is-ready');
      document.body.classList.add('v53-cinematic');

      // Soft ambient + key
      scene.add(new THREE.AmbientLight(0xb8d4e0, 0.45));
      const key = new THREE.DirectionalLight(0xe8fbff, 1.4);
      key.position.set(-3, 4, 5);
      scene.add(key);
      const rim = new THREE.PointLight(0x00e8f5, 4, 20, 2);
      rim.position.set(3, 1, -2);
      scene.add(rim);

      // Focal geometry: modular lattice (Davonium identity, not Lusion particles)
      const group = new THREE.Group();
      scene.add(group);

      const matShell = new THREE.MeshStandardMaterial({
        color: 0xeaf6fa, metalness: 0.35, roughness: 0.28,
        emissive: 0x06212a, emissiveIntensity: 0.08
      });
      const matCyan = new THREE.MeshStandardMaterial({
        color: 0x00e8f5, metalness: 0.2, roughness: 0.22,
        emissive: 0x00c8d4, emissiveIntensity: 0.55
      });
      const matDark = new THREE.MeshStandardMaterial({
        color: 0x0a1a28, metalness: 0.55, roughness: 0.2
      });

      // Central core
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 1), matCyan);
      group.add(core);

      // Orbiting modules
      const modules = [];
      for (let i = 0; i < 7; i++) {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.35, 0.55),
          i % 2 === 0 ? matShell : matDark
        );
        const angle = (i / 7) * Math.PI * 2;
        m.userData = { angle, radius: 2.1 + (i % 3) * 0.25, speed: 0.15 + i * 0.02 };
        m.position.set(Math.cos(angle) * m.userData.radius, Math.sin(angle * 1.3) * 0.4, Math.sin(angle) * m.userData.radius);
        group.add(m);
        modules.push(m);
      }

      // Thin ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.6, 0.018, 8, 96),
        new THREE.MeshBasicMaterial({ color: 0x00e8f5, transparent: true, opacity: 0.35 })
      );
      ring.rotation.x = Math.PI / 2.4;
      group.add(ring);

      let scrollT = 0;
      let targetT = 0;
      let raf = 0;
      let last = 0;

      function onScroll() {
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        targetT = Math.min(1, Math.max(0, scrollY / max));
        if (progressBar) progressBar.style.width = (targetT * 100).toFixed(1) + '%';
      }

      function resize() {
        const w = innerWidth, h = innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }

      function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
        last = now;

        scrollT += (targetT - scrollT) * 0.06;

        // Camera eases with scroll
        camera.position.x = Math.sin(scrollT * Math.PI * 0.7) * 1.8;
        camera.position.y = 0.3 + scrollT * 1.2;
        camera.position.z = 8 - scrollT * 2.5;
        camera.lookAt(0, scrollT * 0.4, 0);

        // Core + modules respond
        core.rotation.y += dt * 0.35;
        core.rotation.x = scrollT * 0.4;
        core.scale.setScalar(1 + scrollT * 0.25);

        modules.forEach((m, i) => {
          const u = m.userData;
          u.angle += dt * u.speed;
          const r = u.radius + scrollT * 0.6;
          m.position.x = Math.cos(u.angle) * r;
          m.position.z = Math.sin(u.angle) * r;
          m.position.y = Math.sin(u.angle * 1.3 + scrollT) * (0.4 + scrollT * 0.5);
          m.rotation.x += dt * 0.4;
          m.rotation.y += dt * 0.25;
        });

        ring.rotation.z = scrollT * Math.PI * 0.5;
        ring.material.opacity = 0.25 + scrollT * 0.25;

        // Theme-aware emissive
        const dark = document.documentElement.getAttribute('data-theme') !== 'light';
        matCyan.emissiveIntensity = dark ? 0.55 + scrollT * 0.3 : 0.25;
        rim.intensity = dark ? 4 + scrollT * 3 : 2;

        renderer.render(scene, camera);
      }

      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', resize, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else { last = performance.now(); raf = requestAnimationFrame(frame); }
      });

      resize();
      onScroll();
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }).catch(() => {
      // Silent fallback — content stays usable
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
