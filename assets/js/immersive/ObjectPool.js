/** Small bounded pool for reusable math/scratch objects. Never acquire from this pool inside a hot loop unless needed. */
export class ObjectPool {
  constructor(factory, reset = () => {}, maxSize = 32, destroy = () => {}) {
    if (typeof factory !== 'function') throw new TypeError('ObjectPool requires a factory function.');
    this.factory = factory;
    this.resetItem = typeof reset === 'function' ? reset : () => {};
    this.destroyItem = typeof destroy === 'function' ? destroy : () => {};
    this.maxSize = Math.max(0, Math.floor(Number(maxSize) || 0));
    this.available = [];
    this.leased = new Set();
  }
  acquire() {
    const item = this.available.pop() || this.factory();
    this.leased.add(item);
    return item;
  }
  release(item) {
    if (!this.leased.delete(item)) return false;
    try { this.resetItem(item); } catch (error) { this.destroyItem(item); return false; }
    if (this.available.length < this.maxSize) this.available.push(item);
    else this.destroyItem(item);
    return true;
  }
  withItem(callback) {
    const item = this.acquire();
    try { return callback(item); } finally { this.release(item); }
  }
  clear() {
    for (const item of this.available) this.destroyItem(item);
    this.available.length = 0;
  }
  get size() { return this.available.length; }
  get leasedCount() { return this.leased.size; }
}

export function createThreeMathPools(THREE, capacity = 16) {
  if (!THREE) throw new TypeError('Three.js is required to create math pools.');
  return Object.freeze({
    vectors2: new ObjectPool(() => new THREE.Vector2(), value => value.set(0, 0), capacity),
    vectors3: new ObjectPool(() => new THREE.Vector3(), value => value.set(0, 0, 0), capacity),
    matrices4: new ObjectPool(() => new THREE.Matrix4(), value => value.identity(), capacity),
    quaternions: new ObjectPool(() => new THREE.Quaternion(), value => value.identity(), capacity)
  });
}
