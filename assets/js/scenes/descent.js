/**
 * §02 → §03 · From samples to neurons.
 *
 * My path in §02 stops at "now". Scrolling on samples its futures: each one
 * starts out as an ordinary continuation of the Brownian motion, in the plot's
 * own scale, then bends down the page and lands on a neuron of the model's
 * input layer as §03 rises into view. A few go first, then a flood, and they
 * keep coming while §03 is pinned and its network builds itself under them.
 * When the camera then flies in, the futures are part of the picture: they
 * scale with the zoom and leave the frame with it. Scroll position drives all
 * of it, so scrolling back up un-samples them.
 */
import { clamp, cssVar, hidpi, invLerp, isCoarse, lerp, smooth } from '../lib/util.js';
import { rng } from '../lib/rng.js';

const START = 0.12; // viewports scrolled into the pinned plot before sampling starts
const M = 160; // points per path
const MODES = 7; // terms of the Brownian-bridge expansion used on the way down (smooth wander)
const EASE = 9; // 1/s: how quickly the drawing catches up with the scroll
const MU = 0.5, SIGMA = 1.0; // the plot's dX = μ dt + σ dW, in its units
const WANDER = 0.07; // lateral wander on the way down, as a fraction of the viewport

export function samplesToNeurons({ paths, pathsSection, plotCanvas, model, modelSection, modelCanvas, holdVh = 1.4 }) {
  const ink = cssVar('--ink') || '#121212';
  const accent = cssVar('--accent') || '#ff4d1f';

  const canvas = document.createElement('canvas');
  canvas.className = 'bridge-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const view = hidpi(canvas, () => {});

  /* ---------- the futures ---------- */
  const n = isCoarse() || window.innerWidth < 700 ? 40 : 64;
  const rand = rng(20261106);
  const futures = Array.from({ length: n }, (_, k) => {
    // W(τ) on [0, 1] (scaled to years later) for the stretch in the plot. On
    // the way down, a Brownian bridge from its Karhunen–Loève expansion
    // B(t) = √2 Σ Z_m sin(mπt) / (mπ), cut at a few modes so it wanders smoothly.
    const w = new Float32Array(M + 1), bx = new Float32Array(M + 1), by = new Float32Array(M + 1);
    for (let j = 1; j <= M; j++) w[j] = w[j - 1] + Math.sqrt(1 / M) * rand.normal();
    for (let m = 1; m <= MODES; m++) {
      const zx = rand.normal() * Math.SQRT2 / (m * Math.PI), zy = rand.normal() * Math.SQRT2 / (m * Math.PI);
      for (let j = 0; j <= M; j++) {
        const sn = Math.sin(m * Math.PI * j / M);
        bx[j] += zx * sn;
        by[j] += zy * sn;
      }
    }
    return {
      w, bx, by,
      // One by one, then a flood: start times are logarithmic in k.
      at: 0.5 * Math.log(1 + k) / Math.log(1 + n),
      dur: lerp(0.34, 0.2, k / n),
      bend: rand.range(0.25, 0.6), // where along the path it gives up on the plot
      target: k < 16 ? k : k * 37, // the first ones land on the skill tokens (listed first), the rest scatter
    };
  });
  const pts = new Float32Array((M + 1) * 2);

  let armed = true, painted = false, eS = 0, prevT = 0;
  function clear() {
    if (!painted) return;
    view.ctx.clearRect(0, 0, view.w, view.h);
    painted = false;
  }

  function frame(time) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (time - (prevT || time)) / 1000);
    prevT = time;
    const s = window.scrollY, vh = window.innerHeight, vw = window.innerWidth;
    const pTop = pathsSection.getBoundingClientRect().top + s;
    const s0 = pTop + vh * START;
    const sPin = modelSection.getBoundingClientRect().top + s; // §03 pinned
    const sHold = sPin + vh * holdVh; // ...and its camera starts flying in
    const eRaw = clamp((s - s0) / Math.max(1, sHold - s0));
    // Ease towards the scroll position, so wheel steps glide instead of jump.
    eS = Math.abs(eRaw - eS) > 0.5 ? eRaw : eS + (eRaw - eS) * (1 - Math.exp(-dt * EASE));
    const e = eS;
    // The network builds itself as the futures arrive.
    model.setBuilt(smooth(invLerp(0.3, 0.75, e)));

    if (e <= 0.0005) { armed = true; clear(); return; }
    // Scrolling on means "skip to now" if the life line is still playing.
    if (armed) { armed = false; paths.finish(); }
    const zoom = model.zoom();
    if (zoom.k > 3 || !paths.done()) { clear(); return; }

    const np = paths.nowPoint(), sc = paths.scale();
    if (!np || !sc) return;
    const pr = plotCanvas.getBoundingClientRect();
    const S = [pr.left + np[0], pr.top + np[1]];
    const H = Math.max(1, (sc.right - np[0]) / sc.year); // years left on the plot
    const mr = modelCanvas.getBoundingClientRect();
    const entry = model.entry();
    const fallback = [mr.left + mr.width / 2, mr.top + mr.height / 2];
    // Fly-in: everything scales about the centre of the input layer.
    const Z = zoom.k, zx = mr.left + zoom.cx, zy = mr.top + zoom.cy;
    const fade = 1 - smooth(invLerp(1.15, 3, Z)); // gone before L0 is in focus (Z ≈ 3.9)
    const thick = Math.sqrt(Math.min(Z, 2.5));

    const { ctx, w, h } = view;
    ctx.clearRect(0, 0, w, h);
    painted = true;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const heads = [];
    for (let k = n - 1; k >= 0; k--) {
      const f = futures[k];
      const u = smooth(clamp((e - f.at) / f.dur));
      if (u <= 0) continue;
      const tg = entry.length ? entry[f.target % entry.length] : null;
      const T = tg ? [mr.left + tg[0], mr.top + tg[1]] : fallback;
      const end = u * M, last = Math.ceil(end); // the head is between samples

      // Control points of the descent: leave "now" heading right, along time;
      // arrive at the neuron from above.
      const c1 = [S[0] + H * sc.year * 0.7, S[1]];
      const c2 = [T[0], T[1] - Math.max(vh * 0.5, (T[1] - S[1]) * 0.45)];
      const amp = WANDER * Math.min(vw, vh);
      for (let j = 0; j <= last; j++) {
        const q = Math.min(j, end) / M;
        // In the plot: another Brownian future, at the plot's own scale.
        const tau = q * H;
        const ax = S[0] + tau * sc.year;
        const ay = S[1] - (MU * tau + SIGMA * Math.sqrt(H) * f.w[j]) * sc.unit;
        // On the way down: a cubic towards the neuron, plus bridge noise.
        const m = 1 - q;
        const bx = m * m * m * S[0] + 3 * m * m * q * c1[0] + 3 * m * q * q * c2[0] + q * q * q * T[0] + amp * f.bx[j];
        const by = m * m * m * S[1] + 3 * m * m * q * c1[1] + 3 * m * q * q * c2[1] + q * q * q * T[1] + amp * f.by[j];
        const g = smooth(invLerp(f.bend * 0.4, f.bend + 0.25, q));
        pts[j * 2] = zx + (lerp(ax, bx, g) - zx) * Z;
        pts[j * 2 + 1] = zy + (lerp(ay, by, g) - zy) * Z;
      }

      // Once landed, a path hands over to its neuron: it thins out, and its
      // head fades into the network's own dot.
      const after = smooth(clamp((e - f.at - f.dur) / 0.14));
      const lead = k < 6;
      ctx.strokeStyle = k === 0 ? accent : ink;
      ctx.globalAlpha = fade * (k === 0 ? 0.95 : lead ? 0.6 : 0.3) * (1 - after * (k === 0 ? 0.3 : 0.55));
      ctx.lineWidth = (k === 0 ? 2 : lead ? 1.1 : 0.75) * thick;
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let j = 1; j < last; j++) {
        const mx = (pts[j * 2] + pts[j * 2 + 2]) / 2, my = (pts[j * 2 + 1] + pts[j * 2 + 3]) / 2;
        ctx.quadraticCurveTo(pts[j * 2], pts[j * 2 + 1], mx, my);
      }
      ctx.lineTo(pts[last * 2], pts[last * 2 + 1]);
      ctx.stroke();
      heads.push([pts[last * 2], pts[last * 2 + 1], k, u >= 1, tg?.[2], after]);
    }

    // Heads in flight; on arrival each one lights its neuron.
    for (const [x, y, k, landed, col, after] of heads) {
      if (x < -20 || y < -20 || x > w + 20 || y > h + 20) continue;
      if (landed) {
        if (after >= 1 && k !== 0) continue; // handed over to the network
        const pulse = (time / 1000 * 0.9 + k * 0.137) % 1;
        ctx.globalAlpha = fade * 0.9 * (1 - after * (k === 0 ? 0.4 : 1));
        ctx.fillStyle = k === 0 ? accent : col || accent;
        ctx.beginPath();
        ctx.arc(x, y, (k === 0 ? 4 : 2.4) * thick, 0, Math.PI * 2);
        ctx.fill();
        if (k < 6) {
          ctx.strokeStyle = accent;
          ctx.lineWidth = 1;
          ctx.globalAlpha = fade * (1 - pulse) * 0.6 * (1 - after);
          ctx.beginPath();
          ctx.arc(x, y, (4 + pulse * 12) * thick, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (k < 6 || k % 5 === 0) {
        ctx.globalAlpha = fade * (k < 6 ? 0.9 : 0.5);
        ctx.fillStyle = k === 0 ? accent : ink;
        ctx.beginPath();
        ctx.arc(x, y, k === 0 ? 3.6 : k < 6 ? 2.2 : 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  requestAnimationFrame(frame);
}
