import { eventBus } from './EventDispatcher.js';

/** Adapter over the existing Three.js character and page-scene renderers. */
class SceneManager {
  constructor() {
    this._started = false;
    this._lastSignature = '';
    this._unsubscribers = [];
    this._handleExternalReady = event => this.refresh(event?.detail?.source || 'renderer');
  }

  start() {
    if (this._started) return;
    this._started = true;
    window.addEventListener('davonium:scene-ready', this._handleExternalReady);
    window.addEventListener('davonium:robot-ready', this._handleExternalReady);
    window.addEventListener('davonium:scene-disposed', this._handleExternalReady);
    document.addEventListener('visibilitychange', () => this.refresh('visibility'));
    this.refresh('initial');
  }

  getScenes() {
    const pageScenes = window.DavoniumSceneRegistry?.getScenes?.() || [];
    const robotScenes = window.DavoniumRobotRegistry?.getScenes?.() || [];
    return [...pageScenes, ...robotScenes].filter(scene => scene && !scene.stopped && !scene.disposed && scene.canvas?.isConnected);
  }

  hasSceneCandidate() {
    return Boolean(document.querySelector('[data-dvnm-robot], .demo-hero-art, .tech-orbit-card, .dvnm-v46-bot-stage, .v46-bot-showcase-scene'));
  }

  refresh(source = 'refresh') {
    const scenes = this.getScenes();
    const signature = scenes.map(scene => `${scene.kind || 'robot'}:${scene.canvas?.dataset?.v45Scene || scene.canvas?.dataset?.robotSize || 'scene'}`).join('|');
    if (signature !== this._lastSignature || source === 'initial') {
      this._lastSignature = signature;
      eventBus.emit('scene:change', { scenes, source, ready: scenes.length > 0 });
    }
  }

  onChange(listener) { return eventBus.on('scene:change', listener); }
  stop() {
    window.removeEventListener('davonium:scene-ready', this._handleExternalReady);
    window.removeEventListener('davonium:robot-ready', this._handleExternalReady);
    window.removeEventListener('davonium:scene-disposed', this._handleExternalReady);
    this._started = false;
  }
}

export const sceneManager = new SceneManager();
export { SceneManager };
