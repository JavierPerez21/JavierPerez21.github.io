/* Small shared helpers: maths, DOM, canvas and animation loops. */

export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => clamp((v - a) / (b - a));
export const smooth = (t) => t * t * (3 - 2 * t);
export const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/** Respects the OS setting; append ?motion to the URL to force animations on. */
export const reducedMotion = () =>
  !new URLSearchParams(window.location.search).has('motion') &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isCoarse = () => window.matchMedia('(pointer: coarse)').matches;

/** Tiny hyperscript: el('a.btn', { href }, 'text', child) */
export function el(tag, attrs = {}, ...children) {
  const [name, ...classes] = tag.split('.');
  const node = document.createElement(name || 'div');
  if (classes.length) node.className = classes.join(' ');
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'style' && typeof v === 'object') {
      for (const [p, val] of Object.entries(v)) {
        if (p.startsWith('--')) node.style.setProperty(p, val);
        else node.style[p] = val;
      }
    }
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** Keeps a canvas' backing store in sync with its CSS size and DPR. */
export function hidpi(canvas, onResize) {
  const ctx = canvas.getContext('2d');
  const state = { ctx, w: 0, h: 0, dpr: 1 };
  const apply = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (Math.round(r.width) === state.w && Math.round(r.height) === state.h && dpr === state.dpr) return;
    state.w = Math.round(r.width);
    state.h = Math.round(r.height);
    state.dpr = dpr;
    canvas.width = Math.max(1, Math.round(state.w * dpr));
    canvas.height = Math.max(1, Math.round(state.h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize?.(state);
  };
  let t;
  new ResizeObserver(() => { clearTimeout(t); t = setTimeout(apply, 60); }).observe(canvas);
  apply();
  return state;
}

/** requestAnimationFrame loop that only runs while `target` is on screen. */
export function visibleLoop(target, frame, { margin = '100px' } = {}) {
  let raf = 0, running = false, last = 0;
  const tick = (now) => {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    frame(now / 1000, dt);
    if (running) raf = requestAnimationFrame(tick);
  };
  let onScreen = false;
  const start = () => { if (!running) { running = true; last = 0; raf = requestAnimationFrame(tick); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const sync = () => (onScreen && !document.hidden ? start() : stop());
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { rootMargin: margin }).observe(target);
  document.addEventListener('visibilitychange', sync);
  return { start, stop, get running() { return running; } };
}

/** 0 → 1 progress of a tall section scrolling past a sticky viewport. */
export function scrollProgress(section) {
  const r = section.getBoundingClientRect();
  const span = r.height - window.innerHeight;
  return span <= 0 ? 0 : clamp(-r.top / span);
}

/** Read a CSS custom property from :root. */
export const cssVar = (name, node = document.documentElement) =>
  getComputedStyle(node).getPropertyValue(name).trim();
