import { eventBus } from './EventDispatcher.js';
import { ObjectPool } from './ObjectPool.js';
import { shaderPipeline } from './ShaderPipeline.js';

/** Lazy GPU-instanced background field. High quality supports up to 100k instances on capable desktop devices. */
class ParticleEngine {
  constructor() {
    this.records = new Map();
    this.quality = 'auto';
    this._off = [
      eventBus.on('scene:change', detail => this._sync(detail?.scenes || [])),
      eventBus.on('render:quality', detail => this.setQuality(detail?.profile || 'auto')),
      eventBus.on('render:reduced-effects', detail => this.setReducedEffects(Boolean(detail?.enabled)))
    ];
  }

  _sync(scenes) {
    const live = new Set(scenes);
    for (const [state] of this.records) {
      if (!live.has(state)) {
        state.disposeParticleField?.();
        state.updateParticleField = null;
        state.updateParticleQuality = null;
        state.updateParticleEffects = null;
        state.updateParticleTheme = null;
        state.disposeParticleField = null;
      }
    }
    for (const state of scenes) {
      if (!state || this.records.has(state) || !state.scene || !state.renderer || !state.THREE || !state.canvas?.isConnected) continue;
      if (typeof state.setQuality !== 'function' || !state.kind) continue;
      try { this._attach(state); }
      catch (error) { console.warn('Davonium particle field skipped; the base 3D scene remains active.', error); }
    }
  }

  _attach(state) {
    const THREE = state.THREE;
    if (!THREE.InstancedMesh || !THREE.OctahedronGeometry || !THREE.MeshBasicMaterial) return;
    const lowPower = Boolean(state.low || globalThis.navigator?.connection?.saveData);
    const capacity = lowPower ? 12000 : 100000;
    const geometry = new THREE.OctahedronGeometry(1, 0);
    const material = shaderPipeline.createHolographicMaterial(THREE, state.p?.colors?.[0] || 0x43ddec);
    const mesh = new THREE.InstancedMesh(geometry, material, capacity);
    mesh.name = 'Davonium holographic instanced field';
    mesh.frustumCulled = false;
    mesh.renderOrder = -1;
    mesh.count = 0;
    if (mesh.instanceMatrix?.setUsage && THREE.StaticDrawUsage !== undefined) mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const record = {
      state, mesh, geometry, material, capacity, lowPower, reduced: false, builtCount: 0,
      matrixPool: new ObjectPool(() => new THREE.Matrix4(), value => value.identity(), 1)
    };
    this.records.set(state, record);
    state.scene.add(mesh);
    state.updateParticleField = (time, pointerX, pointerY, activeMotion) => {
      shaderPipeline.update(material, time, (Number(pointerX) || 0) * 2.4, -1.8 - (Number(pointerY) || 0) * 1.25, activeMotion && !record.reduced ? 1 : 0);
    };
    state.updateParticleQuality = profile => this._applyQuality(record, profile);
    state.updateParticleEffects = enabled => {
      record.reduced = Boolean(enabled);
      if (record.reduced) shaderPipeline.update(material, 0, 0, -2.4, 0);
    };
    state.updateParticleTheme = color => { if (Number.isFinite(color)) material.color.setHex(color); };
    state.disposeParticleField = () => this._disposeRecord(record);
    state.updateParticleEffects(Boolean(state.reducedEffects));
    // Populate only the active profile on first render; remaining matrices are generated only if High is selected.
    this._applyQuality(record, state.quality || this.quality);
  }

  _populate(record, targetCount) {
    const target = Math.max(0, Math.min(record.capacity, Math.floor(targetCount)));
    if (target <= record.builtCount) return;
    const matrices = record.mesh.instanceMatrix.array;
    const transform = record.matrixPool.acquire();
    const goldenAngle = 2.399963229728653;
    for (let i = record.builtCount; i < target; i++) {
      // Stable, deterministic positions avoid a large random-state array and repeated random allocation.
      const seedA = Math.sin((i + 1) * 12.9898 + 78.233) * 43758.5453;
      const rA = seedA - Math.floor(seedA);
      const seedB = Math.sin((i + 1) * 39.3467 + 11.135) * 24634.6345;
      const rB = seedB - Math.floor(seedB);
      const angle = i * goldenAngle;
      const radius = 1.35 + rA * 3.05;
      const x = Math.cos(angle) * radius;
      const y = (rB - 0.5) * 4.2;
      const z = -1.5 - rA * 3.15;
      const scale = 0.006 + rB * 0.010;
      transform.makeScale(scale, scale, scale);
      transform.setPosition(x, y, z);
      transform.toArray(matrices, i * 16);
    }
    record.matrixPool.release(transform);
    record.builtCount = target;
    record.mesh.instanceMatrix.needsUpdate = true;
  }

  _countFor(record, profile) {
    if (profile === 'high') return record.capacity;
    if (profile === 'battery') return Math.min(record.capacity, record.lowPower ? 900 : 4200);
    return Math.min(record.capacity, record.lowPower ? 2600 : 14000);
  }

  _applyQuality(record, profile = this.quality) {
    if (!record?.mesh) return;
    const count = this._countFor(record, profile);
    this._populate(record, count);
    record.mesh.count = count;
    record.mesh.visible = count > 0;
  }

  setQuality(profile) {
    this.quality = ['auto', 'high', 'battery'].includes(profile) ? profile : 'auto';
    for (const record of this.records.values()) this._applyQuality(record, this.quality);
  }

  setReducedEffects(enabled) {
    for (const record of this.records.values()) {
      record.reduced = Boolean(enabled);
      if (record.reduced) shaderPipeline.update(record.material, 0, 0, -2.4, 0);
    }
  }

  _disposeRecord(record) {
    if (!record) return;
    record.state.scene?.remove(record.mesh);
    record.geometry?.dispose?.();
    record.material?.dispose?.();
    record.matrixPool?.clear?.();
    record.state.updateParticleField = null;
    record.state.updateParticleQuality = null;
    record.state.updateParticleEffects = null;
    record.state.updateParticleTheme = null;
    record.state.disposeParticleField = null;
    this.records.delete(record.state);
  }

  dispose() {
    for (const off of this._off) off();
    for (const record of [...this.records.values()]) this._disposeRecord(record);
    this.records.clear();
  }
}

export const particleEngine = new ParticleEngine();
export { ParticleEngine };
