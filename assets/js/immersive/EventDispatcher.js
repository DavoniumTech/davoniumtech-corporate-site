/** Small typed-by-convention Pub/Sub bus for the Davonium immersive layer. */
class EventDispatcher {
  constructor() { this._listeners = new Map(); }

  on(type, listener) {
    if (typeof type !== 'string' || typeof listener !== 'function') return () => {};
    const list = this._listeners.get(type) || new Set();
    list.add(listener);
    this._listeners.set(type, list);
    return () => this.off(type, listener);
  }

  once(type, listener) {
    let unsubscribe = () => {};
    unsubscribe = this.on(type, detail => { unsubscribe(); listener(detail); });
    return unsubscribe;
  }

  off(type, listener) {
    const list = this._listeners.get(type);
    if (!list) return;
    list.delete(listener);
    if (list.size === 0) this._listeners.delete(type);
  }

  emit(type, detail = {}) {
    const list = this._listeners.get(type);
    if (!list) return;
    for (const listener of list) {
      try { listener(detail); } catch (error) { console.error(`[Davonium event:${type}]`, error); }
    }
  }

  clear() { this._listeners.clear(); }
}

export const eventBus = new EventDispatcher();
export { EventDispatcher };
