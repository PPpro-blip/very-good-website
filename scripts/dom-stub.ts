/** Minimal DOM/canvas stubs so game engines can be simulated in Node. */
const noop = () => {};

export class FakeCtx {
  canvas = { width: 960, height: 540 };
  setTransform = noop; clearRect = noop; fillRect = noop; strokeRect = noop;
  beginPath = noop; closePath = noop; moveTo = noop; lineTo = noop; arc = noop;
  ellipse = noop; quadraticCurveTo = noop; rect = noop; fill = noop; stroke = noop;
  save = noop; restore = noop; translate = noop; rotate = noop; scale = noop;
  createLinearGradient = () => ({ addColorStop: noop });
  createRadialGradient = () => ({ addColorStop: noop });
  roundRect = noop;
  fillText = noop;
  set fillStyle(v: unknown) {}
  set strokeStyle(v: unknown) {}
  set lineWidth(v: unknown) {}
  set globalAlpha(v: unknown) {}
  set shadowBlur(v: unknown) {}
  set shadowColor(v: unknown) {}
  set globalCompositeOperation(v: unknown) {}
  set lineCap(v: unknown) {}
  set font(v: unknown) {}
  set textAlign(v: unknown) {}
}

export function makeCanvas(width = 960, height = 540) {
  return {
    width,
    height,
    style: {},
    parentElement: null,
    getBoundingClientRect: () => ({ width, height, top: 0, left: 0 }),
    getContext: () => new FakeCtx(),
    addEventListener: noop,
    removeEventListener: noop,
  };
}

export function installDomStubs() {
  (globalThis as any).window = {
    localStorage: {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return (this.store as Record<string, string>)[key] ?? null;
      },
      setItem(key: string, value: string) {
        (this.store as Record<string, string>)[key] = value;
      },
      removeItem(key: string) {
        delete (this.store as Record<string, string>)[key];
      },
    },
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
    addEventListener: noop,
    removeEventListener: noop,
    devicePixelRatio: 1,
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: noop,
    setTimeout,
    clearTimeout,
  };
  (globalThis as any).document = { addEventListener: noop, removeEventListener: noop, hidden: false };
  (globalThis as any).requestAnimationFrame = () => 1;
  (globalThis as any).cancelAnimationFrame = noop;
  (globalThis as any).ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
}
