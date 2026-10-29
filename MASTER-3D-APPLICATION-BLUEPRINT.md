# MASTER PROMPT BLUEPRINT — ENTERPRISE-GRADE INTERACTIVE 3D WEB APPLICATION

## Stack and role
Principal creative technologist / lead WebGL-WebGPU graphics engineer / senior frontend architect. Build in pure Vanilla JavaScript ES6+, Three.js, GLSL and GSAP, integrating existing Davonium Technologies assets. No React, Vue, or other UI framework.

## 1. Vanilla JavaScript architecture
- Native ES modules separating Core Engine, Scene Manager, Input Handler, Audio Engine, UI Layer and Shader Pipeline.
- Decoupled Pub/Sub `EventDispatcher`; singleton managers such as `RenderEngine`, `AssetLoader`, `AudioManager`, and `InputController`.
- Object pooling for reusable vectors, matrices, quaternions and particle resources to reduce render-loop garbage. Do not claim an app-wide zero-allocation guarantee unless measured.
- Native Web Components or vanilla UI modules; BEM/tokens; glass surfaces and restrained glow; `pointer-events: none` for decorative overlays and enabled pointer events for controls.

## 2. Core Three.js engine
- WebGL 2 renderer and graceful fallback; only describe WebGL 1 fallback if actually supported by the selected Three.js version.
- Dynamic resolution scaling from a rolling 60-frame sample window, with measured device pixel ratio caps and adaptive / high / battery profiles. No guarantee of 60/120 FPS without evidence.
- Explicit disposal of geometries, materials, textures, shaders, render targets and observers on scene transitions.
- Key/fill/rim lighting, CSM where supported, PMREM/HDR environment where assets and cost justify it, PBR materials/textures for albedo, normals, roughness, metalness, occlusion, transmission and SSS where supported. Smooth theme-driven lighting transitions.
- Custom GLSL wave displacement, audio-reactive liquid/holographic fields and chromatic dispersion where deliberately designed.
- EffectComposer post-processing stack when measured and supported: bloom, depth of field, SSAO/GTAO, chromatic/lens distortion, and FXAA/SMAA.
- GPU-instanced interactive particles with capacity up to 100,000+ where device capability supports it; real physics integration such as Rapier.js or Cannon-es only when implemented/tested.

## 3. Motion, camera and interaction
- Perspective camera rig with damped motion driven by pointer/scroll, and cinematic GSAP ScrollTrigger sequences that never trap or hijack native scrolling.
- Raycast/hover with magnetic cursor, restrained easing, outline/light focus; DOM labels map projected 3D positions to accessible annotations.
- Native smooth scroll or lightweight Lenis/GSAP Observer only if proven necessary; preserve touch and standard browser scrolling.

## 4. Native Web Audio
- User-activated `AudioContext`, 3D `PannerNode`, `GainNode`, depth-modulated filter, and spatial emitters associated with meaningful 3D nodes.
- Original procedural UI cues; no surprise autoplay. Include visible audio/mute/stop controls and graceful Web Audio fallback.

## 5. Floating system control deck
- Quality: High / Battery Saver; frame-rate and clearly labelled estimated GPU-memory metrics; optional audio/spatial toggle; camera Orbit/Cinematic/Reset; whole-scene theme; canvas screenshot capture. Every control must work or explain its unavailable state.

## 6. Loader, fallback and integration
- Real progress only from bytes/loader callbacks; never fake percentages or use infinite loading. Keep core content usable while 3D loads.
- WebGL/CDN failure must leave a readable 2D fallback and accessible navigation/content.
- Inspect source archive, assets, routes, CSS, JS, PWA and deployment config before refactoring. Build a modular ES-module graph centered on an App entry point, with restrained premium typography, clear hierarchy and an integrated Davonium-specific design system.

## Acceptance note
The user’s full 24-section Davonium redesign brief is preserved separately at `LOCAL-DELIVERABLES/DAVONIUM-MASTER-REDESIGN-BRIEF-SOURCE.md`; `MASTER-PROMPT-COVERAGE.md` maps both prompts to implemented, partial, and remaining requirements.
