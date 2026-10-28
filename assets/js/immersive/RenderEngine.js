import { sceneManager } from './SceneManager.js';
import { eventBus } from './EventDispatcher.js';

/** Quality/camera/capture façade. The renderer backends remain page-owned and lazily loaded. */
class RenderEngine {
  constructor() { this.quality = 'auto'; this.cameraPreset = 'orbit'; this.reducedEffects = false; }

  getScenes() { return sceneManager.getScenes(); }
  getPrimaryScene() {
    const scenes = this.getScenes();
    const active = scenes.find(scene => scene.kind && scene.visible !== false) || scenes.find(scene => scene.canvas?.dataset?.robotSize === 'full' && scene.active !== false) || scenes.find(scene => scene.visible !== false && scene.active !== false);
    return active || scenes[0] || null;
  }

  setQuality(profile) {
    if (!['auto', 'high', 'battery'].includes(profile)) return false;
    this.quality = profile;
    for (const scene of this.getScenes()) scene.setQuality?.(profile);
    eventBus.emit('render:quality', { profile });
    return true;
  }

  setCameraPreset(preset) {
    if (!['orbit', 'cinematic', 'reset'].includes(preset)) return false;
    this.cameraPreset = preset;
    for (const scene of this.getScenes()) scene.setCameraPreset?.(preset);
    eventBus.emit('render:camera', { preset });
    return true;
  }

  setReducedEffects(enabled) {
    this.reducedEffects = Boolean(enabled);
    for (const scene of this.getScenes()) scene.setReducedEffects?.(this.reducedEffects);
    eventBus.emit('render:reduced-effects', { enabled: this.reducedEffects });
  }

  getStats() {
    const scene = this.getPrimaryScene();
    if (!scene) return null;
    const stats = scene.getStats?.() || {};
    return { ...stats, label: scene.kind || (scene.canvas?.dataset?.robotSize === 'mini' ? 'DVNM Bot' : '3D scene') };
  }

  async captureScreenshot() {
    const scene = this.getPrimaryScene();
    const canvas = scene?.canvas;
    if (!canvas?.toBlob) throw new Error('A screenshot is not available until a WebGL scene is ready.');
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('The browser could not create a screenshot.')), 'image/png'));
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `davonium-scene-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }
}

export const renderEngine = new RenderEngine();
export { RenderEngine };
