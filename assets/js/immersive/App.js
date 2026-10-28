import { eventBus } from './EventDispatcher.js';
import { assetLoader } from './AssetLoader.js';
import { sceneManager } from './SceneManager.js';
import { renderEngine } from './RenderEngine.js';
import { inputController } from './InputController.js';
import { audioManager } from './AudioManager.js';
import { particleEngine } from './ParticleEngine.js';
import { coreEngine } from './CoreEngine.js';

const $ = (selector, root = document) => root.querySelector(selector);
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let root, panel, launcher, status, fpsReadout, gpuReadout, qualitySelect, audioButton, spatialButton;
let refreshHandle = 0;
let expanded = false;
let effectsReduced = prefersReducedMotion;
let lastSceneCount = 0;
const hostListeners = new WeakSet();

function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function actionButton(label, className, callback) {
  const button = make('button', className, label);
  button.type = 'button';
  button.addEventListener('click', async () => {
    try { await callback(button); audioManager.playCue('click'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'That control is unavailable.'); audioManager.playCue('error'); }
  });
  return button;
}

function setStatus(message) {
  if (status) status.textContent = message;
}

function updateAudioControls() {
  if (audioButton) {
    audioButton.textContent = audioManager.enabled ? 'Sound: on · turn off' : 'Enable ambient audio';
    audioButton.setAttribute('aria-pressed', String(audioManager.enabled));
  }
  if (spatialButton) {
    spatialButton.disabled = !audioManager.supported || !audioManager.panner;
    spatialButton.textContent = audioManager.spatial ? 'Spatial audio: on' : 'Spatial audio: off';
    spatialButton.setAttribute('aria-pressed', String(audioManager.spatial));
  }
}

function buildDeck() {
  if ($('#dvnm-immersive-deck')) return $('#dvnm-immersive-deck');
  root = make('aside', 'dvnm-immersive-deck');
  root.id = 'dvnm-immersive-deck';
  root.setAttribute('aria-label', 'Three-dimensional scene controls');
  root.setAttribute('data-dvnm-immersive-deck', 'true');

  launcher = make('button', 'dvnm-immersive-launcher', '◈ 3D controls');
  launcher.type = 'button'; launcher.setAttribute('aria-expanded', 'false'); launcher.setAttribute('aria-controls', 'dvnm-immersive-panel');
  launcher.addEventListener('click', () => {
    expanded = !expanded; panel.hidden = !expanded;
    launcher.setAttribute('aria-expanded', String(expanded));
    launcher.setAttribute('aria-label', expanded ? 'Close 3D scene controls' : 'Open 3D scene controls');
    if (expanded) { audioManager.playCue('open'); qualitySelect.focus({ preventScroll: true }); }
    else launcher.focus({ preventScroll: true });
  });

  panel = make('section', 'dvnm-immersive-panel');
  panel.id = 'dvnm-immersive-panel'; panel.hidden = true;
  panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', 'dvnm-immersive-title');
  const headingRow = make('div', 'dvnm-immersive-heading');
  const heading = make('div', 'dvnm-immersive-heading-copy');
  const eyebrow = make('span', 'dvnm-immersive-eyebrow', 'LIVE SCENE DECK');
  const title = make('h2', '', 'Experience controls'); title.id = 'dvnm-immersive-title';
  heading.append(eyebrow, title);
  const close = actionButton('×', 'dvnm-immersive-close', () => { expanded = false; panel.hidden = true; launcher.setAttribute('aria-expanded', 'false'); launcher.focus({ preventScroll: true }); });
  close.setAttribute('aria-label', 'Close 3D controls');
  headingRow.append(heading, close);

  status = make('p', 'dvnm-immersive-status', 'Waiting for the scene renderer…'); status.setAttribute('aria-live', 'polite');
  const metrics = make('div', 'dvnm-immersive-metrics');
  const fpsCard = make('div', 'dvnm-immersive-metric');
  fpsCard.append(make('span', 'dvnm-immersive-metric-label', 'Frame rate'), fpsReadout = make('strong', '', '— FPS'));
  const gpuCard = make('div', 'dvnm-immersive-metric');
  gpuCard.append(make('span', 'dvnm-immersive-metric-label', 'GPU memory'), gpuReadout = make('strong', '', 'Est. — MB'));
  metrics.append(fpsCard, gpuCard);

  const qualityLabel = make('label', 'dvnm-immersive-field');
  qualityLabel.append(make('span', '', 'Render quality'));
  qualitySelect = make('select', 'dvnm-immersive-select');
  for (const [value, label] of [['auto', 'Adaptive (recommended)'], ['high', 'High performance'], ['battery', 'Battery saver']]) {
    const option = make('option', '', label); option.value = value; qualitySelect.appendChild(option);
  }
  qualitySelect.value = 'auto';
  qualitySelect.addEventListener('change', () => { renderEngine.setQuality(qualitySelect.value); setStatus(`Render quality set to ${qualitySelect.options[qualitySelect.selectedIndex].text}.`); audioManager.playCue('click'); });
  qualityLabel.appendChild(qualitySelect);

  const cameraGroup = make('div', 'dvnm-immersive-field');
  cameraGroup.appendChild(make('span', '', 'Camera view'));
  const cameraButtons = make('div', 'dvnm-immersive-button-row');
  for (const [preset, label] of [['orbit', 'Orbit'], ['cinematic', 'Cinematic'], ['reset', 'Reset']]) {
    const button = actionButton(label, 'dvnm-immersive-secondary', () => { renderEngine.setCameraPreset(preset); setStatus(`${label} camera view selected.`); });
    button.dataset.cameraPreset = preset;
    cameraButtons.appendChild(button);
  }
  cameraGroup.appendChild(cameraButtons);

  const toggles = make('div', 'dvnm-immersive-toggle-stack');
  audioButton = actionButton('Enable ambient audio', 'dvnm-immersive-secondary', async () => {
    await audioManager.setEnabled(!audioManager.enabled); updateAudioControls();
    setStatus(audioManager.enabled ? 'Procedural ambient audio is enabled. Use the sound control to stop it.' : 'Audio is off. No sound will play.');
  });
  audioButton.setAttribute('aria-pressed', 'false');
  spatialButton = actionButton('Spatial audio: off', 'dvnm-immersive-secondary', () => {
    audioManager.setSpatial(!audioManager.spatial); updateAudioControls();
    setStatus(audioManager.spatial ? 'Subtle pointer-position spatialisation is enabled.' : 'Spatial audio is off.');
  });
  spatialButton.setAttribute('aria-pressed', 'false');
  const reduceButton = actionButton('Reduce scene effects', 'dvnm-immersive-secondary', () => {
    effectsReduced = !effectsReduced; renderEngine.setReducedEffects(effectsReduced);
    reduceButton.setAttribute('aria-pressed', String(effectsReduced));
    reduceButton.textContent = effectsReduced ? 'Scene effects: reduced' : 'Reduce scene effects';
    setStatus(effectsReduced ? 'Decorative scene motion is reduced.' : 'Scene motion is restored.');
  });
  reduceButton.setAttribute('aria-pressed', String(effectsReduced));
  reduceButton.textContent = effectsReduced ? 'Scene effects: reduced' : 'Reduce scene effects';
  toggles.append(audioButton, spatialButton, reduceButton);

  const footer = make('div', 'dvnm-immersive-footer');
  const themeButton = actionButton('Switch theme', 'dvnm-immersive-secondary', () => {
    const themeToggle = $('#theme-toggle');
    if (!themeToggle) throw new Error('The site theme control is not available on this page.');
    themeToggle.click();
    const theme = document.documentElement.dataset.theme || 'system';
    setStatus(`Site theme requested. Current scene environment: ${theme}.`);
  });
  const captureButton = actionButton('Capture scene PNG', 'dvnm-immersive-primary', async () => {
    await renderEngine.captureScreenshot(); setStatus('Scene screenshot prepared as a PNG download.');
  });
  footer.append(themeButton, captureButton);

  const note = make('p', 'dvnm-immersive-note', 'GPU memory is an estimate from canvas buffers and renderer resource counts; browsers do not expose exact VRAM usage. Audio is optional and starts only after you enable it.');
  panel.append(headingRow, status, metrics, qualityLabel, cameraGroup, toggles, footer, note);
  // Keep the launcher at the viewport edge; the panel opens upward above it.
  // This avoids covering the site's bottom-corner WhatsApp action when expanded.
  root.append(panel, launcher);
  document.body.appendChild(root);
  updateAudioControls();
  return root;
}

function updateMetrics() {
  const stats = renderEngine.getStats();
  const scenes = sceneManager.getScenes();
  if (!stats || scenes.length === 0) return;
  const fps = Number(stats.fps);
  fpsReadout.textContent = Number.isFinite(fps) && fps > 0 ? `${Math.round(fps)} FPS` : 'Sampling…';
  const memory = Number(stats.estimatedVramMB);
  gpuReadout.textContent = Number.isFinite(memory) && memory >= 0 ? `Est. ${memory.toFixed(1)} MB` : 'Est. unavailable';
  setStatus(`${stats.label || '3D scene'} ready · ${qualitySelect.options[qualitySelect.selectedIndex].text}.`);
}

function attachAudioPointerTracking() {
  for (const scene of sceneManager.getScenes()) {
    const host = scene.host;
    if (!host || hostListeners.has(host)) continue;
    hostListeners.add(host);
    host.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = host.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / Math.max(1, rect.width) - .5) * 2));
      const depth = Math.max(0, Math.min(1, 1 - (event.clientY - rect.top) / Math.max(1, rect.height)));
      audioManager.updatePointer(x, depth);
    }, { passive: true });
  }
}

function handleSceneChange({ scenes, ready }) {
  if (!root) return;
  if (ready) {
    root.hidden = false;
    if (scenes.length !== lastSceneCount) {
      for (const scene of scenes) {
        scene.setQuality?.(renderEngine.quality);
        scene.setReducedEffects?.(effectsReduced);
      }
      lastSceneCount = scenes.length;
    }
    attachAudioPointerTracking();
    if (!refreshHandle) refreshHandle = window.setInterval(updateMetrics, 900);
    updateMetrics();
  } else {
    root.hidden = true;
    if (refreshHandle) { window.clearInterval(refreshHandle); refreshHandle = 0; }
  }
}

function boot() {
  if (!sceneManager.hasSceneCandidate()) return;
  coreEngine.register('events', eventBus);
  coreEngine.register('assets', assetLoader);
  coreEngine.register('scenes', sceneManager);
  coreEngine.register('renderer', renderEngine);
  coreEngine.register('input', inputController);
  coreEngine.register('audio', audioManager);
  coreEngine.register('particles', particleEngine);
  coreEngine.start();
  buildDeck();
  inputController.start();
  sceneManager.onChange(handleSceneChange);
  sceneManager.start();
  eventBus.on('input:escape', () => {
    if (panel && !panel.hidden) { expanded = false; panel.hidden = true; launcher.setAttribute('aria-expanded', 'false'); launcher.focus({ preventScroll: true }); }
  });
  eventBus.on('audio:state', updateAudioControls);
  eventBus.on('render:quality', ({ profile }) => { if (qualitySelect && qualitySelect.value !== profile) qualitySelect.value = profile; });
  eventBus.on('input:pointer', ({ x, y }) => {
    if (!expanded || !panel) return;
    panel.style.setProperty('--pointer-x', `${x}px`); panel.style.setProperty('--pointer-y', `${y}px`);
  });
  window.addEventListener('pagehide', event => {
    if (event.persisted) return; // Keep controls alive if the browser restores this page from its back-forward cache.
    if (refreshHandle) window.clearInterval(refreshHandle);
    audioManager.dispose(); inputController.stop(); sceneManager.stop(); particleEngine.dispose(); coreEngine.stop('pagehide');
  }, { once: true });
  // assetLoader is available to real model/texture requests; no artificial loading percentage is displayed.
  window.DavoniumImmersive = Object.freeze({ core: coreEngine, events: eventBus, loader: assetLoader, scenes: sceneManager, renderer: renderEngine, audio: audioManager, particles: particleEngine });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
