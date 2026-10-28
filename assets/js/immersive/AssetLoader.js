import { eventBus } from './EventDispatcher.js';

/** Tracks real resource work. Unknown content lengths stay indeterminate; no synthetic percentages. */
class AssetLoader {
  constructor() { this._tasks = new Map(); this._sequence = 0; }

  snapshot() {
    const tasks = [...this._tasks.values()];
    const total = tasks.reduce((sum, task) => sum + (Number.isFinite(task.total) ? task.total : 0), 0);
    const loaded = tasks.reduce((sum, task) => sum + task.loaded, 0);
    const complete = tasks.filter(task => task.state === 'complete').length;
    const failed = tasks.filter(task => task.state === 'failed').length;
    const determinate = tasks.every(task => Number.isFinite(task.total) && task.total > 0);
    return { totalTasks: tasks.length, complete, failed, loadedBytes: loaded, totalBytes: total,
      percent: determinate && total > 0 ? Math.min(100, Math.round(loaded / total * 100)) : null };
  }

  async track(name, work, options = {}) {
    const id = ++this._sequence;
    const task = { id, name: String(name || `asset-${id}`), state: 'loading', loaded: 0,
      total: Number.isFinite(options.totalBytes) ? options.totalBytes : null };
    this._tasks.set(id, task);
    this._publish(task);
    try {
      const result = await (typeof work === 'function' ? work(progress => {
        if (Number.isFinite(progress?.loaded)) task.loaded = Math.max(0, progress.loaded);
        if (Number.isFinite(progress?.total) && progress.total > 0) task.total = progress.total;
        this._publish(task);
      }) : work);
      task.state = 'complete';
      if (Number.isFinite(task.total) && task.total > 0) task.loaded = task.total;
      this._publish(task);
      return result;
    } catch (error) {
      task.state = 'failed';
      this._publish(task, { message: error instanceof Error ? error.message : 'Asset load failed' });
      throw error;
    }
  }

  loadWith(loader, url, options = {}) {
    if (!loader || typeof loader.load !== 'function') return Promise.reject(new TypeError('A Three.js-style loader with load() is required.'));
    return this.track(options.name || String(url), report => new Promise((resolve, reject) => {
      let request = null;
      let settled = false;
      const fail = error => { if (settled) return; settled = true; reject(error instanceof Error ? error : new Error('Asset load failed.')); };
      if (options.signal?.aborted) { fail(new DOMException('Asset load was aborted.', 'AbortError')); return; }
      const abort = () => {
        try { request?.abort?.(); } catch (_) {}
        fail(new DOMException('Asset load was aborted.', 'AbortError'));
      };
      options.signal?.addEventListener('abort', abort, { once: true });
      try {
        request = loader.load(
          url,
          value => { if (settled) return; settled = true; options.signal?.removeEventListener('abort', abort); resolve(typeof options.transform === 'function' ? options.transform(value) : value); },
          event => report({ loaded: Number(event?.loaded) || 0, total: Number(event?.total) > 0 ? Number(event.total) : undefined }),
          error => { options.signal?.removeEventListener('abort', abort); fail(error || new Error('Asset load failed.')); }
        );
      } catch (error) { options.signal?.removeEventListener('abort', abort); fail(error); }
    }), { totalBytes: options.totalBytes });
  }

  async fetchArrayBuffer(url, options = {}) {
    return this.track(options.name || url, async report => {
      const response = await fetch(url, { signal: options.signal, cache: options.cache || 'default' });
      if (!response.ok) throw new Error(`Asset request failed (${response.status})`);
      const lengthHeader = response.headers.get('content-length');
      const total = lengthHeader ? Number(lengthHeader) : NaN;
      if (!response.body?.getReader) {
        const buffer = await response.arrayBuffer();
        report({ loaded: buffer.byteLength, total: Number.isFinite(total) ? total : undefined });
        return buffer;
      }
      const reader = response.body.getReader();
      const chunks = [];
      let loaded = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); loaded += value.byteLength;
        report({ loaded, total: Number.isFinite(total) && total > 0 ? total : undefined });
      }
      const result = new Uint8Array(loaded);
      let offset = 0;
      for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
      return result.buffer;
    });
  }

  _publish(task, extra = {}) {
    eventBus.emit('asset:progress', { task: { ...task }, snapshot: this.snapshot(), ...extra });
  }
}

export const assetLoader = new AssetLoader();
export { AssetLoader };
