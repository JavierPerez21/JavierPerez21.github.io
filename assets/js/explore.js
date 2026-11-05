/**
 * /explore: an endless, draggable field of photographs.
 * Columns repeat forever in both directions; only visible tiles exist in
 * the DOM. Drag (with inertia), scroll, or use the arrow keys to wander.
 */
import { photos } from './content.js';
import { clamp, el, reducedMotion } from './lib/util.js';

const field = document.querySelector('.field');
const layer = document.querySelector('.field-layer');
const count = document.querySelector('[data-count]');
const still = reducedMotion();
const n = photos.length;
const src = (p, size) => `../assets/img/explore/${p.id}-${size}.webp`;

/* ---------- geometry ---------- */
let colW = 260, gap = 16, vw = 0, vh = 0;
const prefixCache = new Map();

function measure() {
  vw = field.clientWidth;
  vh = field.clientHeight;
  colW = vw < 640 ? Math.round(vw * 0.44) : clamp(Math.round(vw * 0.2), 220, 320);
  gap = vw < 640 ? 10 : 18;
  prefixCache.clear();
}

const photoAt = (c, j) => (((5 * j + 11 * c) % n) + n) % n;
const tileH = (p) => Math.round(colW / clamp(p.ar, 0.62, 1.45));

/** Cumulative tile tops for one cycle of column c (cycle = all n photos). */
function column(c) {
  const key = ((c % n) + n) % n;
  if (!prefixCache.has(key)) {
    const tops = [0];
    for (let j = 0; j < n; j++) tops.push(tops[j] + tileH(photos[photoAt(key, j)]) + gap);
    prefixCache.set(key, tops);
  }
  const tops = prefixCache.get(key);
  const H = tops[n];
  const offset = ((((c * 263) % H) + H) % H) - H; // stagger columns
  return { tops, H, offset, key };
}

/* ---------- view state ---------- */
const pos = { x: 0, y: 0 };
const vel = { x: 0, y: 0 };
let dragging = false, moved = 0, last = null, scale = 1;
const tiles = new Map();

function render() {
  const step = colW + gap;
  const c0 = Math.floor(-pos.x / step) - 1;
  const c1 = Math.ceil((vw - pos.x) / step) + 1;
  const y0 = -pos.y - 200, y1 = -pos.y + vh + 200;
  const seen = new Set();

  for (let c = c0; c <= c1; c++) {
    const { tops, H, offset, key } = column(c);
    const k0 = Math.floor((y0 - offset) / H);
    for (let k = k0; offset + k * H < y1; k++) {
      for (let j = 0; j < n; j++) {
        const top = offset + k * H + tops[j];
        const h = tops[j + 1] - tops[j] - gap;
        if (top + h < y0 || top > y1) continue;
        const id = `${c}:${k}:${j}`;
        seen.add(id);
        if (!tiles.has(id)) tiles.set(id, makeTile(photoAt(key, j), c * step, top, h));
      }
    }
  }
  for (const [id, node] of tiles) if (!seen.has(id)) { node.remove(); tiles.delete(id); }

  const cx = vw / 2, cy = vh / 2;
  layer.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(${scale.toFixed(4)}) translate3d(${(pos.x - cx).toFixed(1)}px, ${(pos.y - cy).toFixed(1)}px, 0)`;
}

function makeTile(i, x, y, h) {
  const p = photos[i];
  const img = el('img', { src: src(p, 'sm'), alt: p.alt, draggable: 'false', decoding: 'async' });
  img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  const node = el('figure.tile', {
    style: { width: `${colW}px`, height: `${h}px`, transform: `translate3d(${x}px, ${y}px, 0)` },
    'data-index': String(i),
  }, img, el('figcaption', {}, el('span', {}, `№ ${String(i + 1).padStart(2, '0')}`), p.alt));
  layer.append(node);
  return node;
}

/* ---------- input ---------- */
field.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  dragging = true;
  moved = 0;
  last = { x: e.clientX, y: e.clientY, t: performance.now() };
  vel.x = vel.y = 0;
  field.setPointerCapture(e.pointerId);
  field.classList.add('is-dragging');
});
field.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const now = performance.now();
  const dx = e.clientX - last.x, dy = e.clientY - last.y;
  const dt = Math.max(1, now - last.t);
  pos.x += dx;
  pos.y += dy;
  moved += Math.abs(dx) + Math.abs(dy);
  vel.x = 0.8 * (dx / dt) * 16 + 0.2 * vel.x;
  vel.y = 0.8 * (dy / dt) * 16 + 0.2 * vel.y;
  last = { x: e.clientX, y: e.clientY, t: now };
});
const release = (e) => {
  if (!dragging) return;
  dragging = false;
  field.classList.remove('is-dragging');
  if (moved < 6) {
    const tile = document.elementFromPoint(e.clientX, e.clientY)?.closest('.tile');
    if (tile) openLightbox(Number(tile.dataset.index));
  }
};
field.addEventListener('pointerup', release);
field.addEventListener('pointercancel', release);
field.addEventListener('wheel', (e) => {
  e.preventDefault();
  pos.x -= e.shiftKey ? e.deltaY : e.deltaX;
  pos.y -= e.shiftKey ? 0 : e.deltaY;
}, { passive: false });
window.addEventListener('keydown', (e) => {
  if (lightbox.open) return;
  const k = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
  if (!k) return;
  e.preventDefault();
  vel.x += k[0] * 14;
  vel.y += k[1] * 14;
});

/* ---------- loop ---------- */
function tick() {
  if (!dragging) {
    pos.x += vel.x;
    pos.y += vel.y;
    vel.x *= 0.93;
    vel.y *= 0.93;
    if (Math.abs(vel.x) < 0.01) vel.x = 0;
    if (Math.abs(vel.y) < 0.01) vel.y = 0;
  }
  const speed = Math.hypot(vel.x, vel.y);
  const target = still ? 1 : 1 - Math.min(speed / 900, 0.06);
  scale += (target - scale) * 0.12;
  render();
  requestAnimationFrame(tick);
}

/* ---------- lightbox ---------- */
const lightbox = document.querySelector('.lightbox');
const lbImg = lightbox.querySelector('img');
const lbCap = lightbox.querySelector('.lightbox-cap');
let current = 0;

function openLightbox(i) {
  current = (i + n) % n;
  const p = photos[current];
  lbImg.classList.remove('is-loaded');
  lbImg.src = src(p, 'lg');
  lbImg.alt = p.alt;
  lbCap.textContent = `№ ${String(current + 1).padStart(2, '0')} / ${n} · ${p.alt}`;
  if (!lightbox.open) lightbox.showModal();
}
lbImg.addEventListener('load', () => lbImg.classList.add('is-loaded'));
lightbox.addEventListener('click', (e) => {
  const act = e.target.closest('[data-lb]')?.dataset.lb;
  if (act === 'prev') openLightbox(current - 1);
  else if (act === 'next') openLightbox(current + 1);
  else if (act === 'close' || e.target === lightbox) lightbox.close();
});
lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') openLightbox(current - 1);
  if (e.key === 'ArrowRight') openLightbox(current + 1);
});

/* ---------- go ---------- */
if (count) count.textContent = String(n);
measure();
pos.x = -colW * 0.3;
pos.y = -vh * 0.2;
new ResizeObserver(() => {
  measure();
  for (const node of tiles.values()) node.remove();
  tiles.clear();
}).observe(field);
requestAnimationFrame(tick);
