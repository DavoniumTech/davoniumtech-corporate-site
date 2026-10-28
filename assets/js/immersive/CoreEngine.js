import { eventBus } from './EventDispatcher.js';

/** Singleton composition/lifecycle root for the native ES-module experience. */
class CoreEngine {
  constructor() { this.services = new Map(); this.state = 'idle'; this.startedAt = 0; }
  register(name, service) {
    if (typeof name !== 'string' || !name.trim() || !service) throw new TypeError('A named service is required.');
    const key = name.trim();
    if (this.services.has(key) && this.services.get(key) !== service) throw new Error(`A different service is already registered for ${key}.`);
    this.services.set(key, service);
    return service;
  }
  get(name) { return this.services.get(name) || null; }
  start() {
    if (this.state === 'running') return false;
    this.state = 'running';
    this.startedAt = performance.now();
    eventBus.emit('core:state', { state: this.state, startedAt: this.startedAt });
    return true;
  }
  stop(reason = 'shutdown') {
    if (this.state !== 'running') return false;
    this.state = 'stopped';
    eventBus.emit('core:state', { state: this.state, reason });
    return true;
  }
  snapshot() { return Object.freeze({ state: this.state, serviceNames: [...this.services.keys()], startedAt: this.startedAt }); }
}

export const coreEngine = new CoreEngine();
export { CoreEngine };
