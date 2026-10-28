import { eventBus } from './EventDispatcher.js';

/** Native-input adapter: preserves browser scrolling and native keyboard focus behaviour. */
class InputController {
  constructor() {
    this._onKey = event => this._handleKey(event);
    this._onPointer = event => eventBus.emit('input:pointer', { x: event.clientX, y: event.clientY, pointerType: event.pointerType });
    this._started = false;
  }
  start() {
    if (this._started) return;
    this._started = true;
    document.addEventListener('keydown', this._onKey);
    if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.addEventListener('pointermove', this._onPointer, { passive: true });
    }
  }
  _handleKey(event) {
    if (event.key === 'Escape') eventBus.emit('input:escape', { target: event.target });
  }
  stop() { document.removeEventListener('keydown', this._onKey); document.removeEventListener('pointermove', this._onPointer); this._started = false; }
}

export const inputController = new InputController();
export { InputController };
