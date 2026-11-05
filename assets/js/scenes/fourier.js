/**
 * §01 · Analysis: the name as a Fourier series.
 *
 * The outline of every glyph is stitched into one closed curve f(θ) in the
 * complex plane, sampled at N points and transformed with an FFT. We then
 * draw the partial sums S_K(θ) = Σ_{|n|≤K} c_n e^{inθ} for growing K,
 * plus the chain of epicycles whose tip traces f, until the series
 * converges on the name.
 */
import { fft, freqOf } from '../lib/fft.js';
import { clamp, cssVar, hidpi, invLerp, reducedMotion, smooth, visibleLoop } from '../lib/util.js';

const N = 4096;
const KMAX = N / 2;
const LOG_KMAX = Math.log2(KMAX);
const JUMP_PTS = 6; // samples spent "lifting the pen" between contours
const INTRO = 4.2; // seconds for the series to converge
const TRACE_PERIOD = 18; // seconds for the pen to travel the whole name
const CIRCLES = 90; // epicycles actually drawn (the rest are sub-pixel)

export function fourierName({ canvas, glyphs, readout, slider, replay, onConverged }) {
  const ink = cssVar('--ink') || '#121212';
  const accent = cssVar('--accent') || '#ff4d1f';
  const still = reducedMotion();

  const spec = { re: new Float64Array(N), im: new Float64Array(N) };
  const work = { re: new Float64Array(N), im: new Float64Array(N) };
  const jump = new Uint8Array(N);
  const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => {
    const fa = freqOf(a, N), fb = freqOf(b, N);
    return Math.abs(fa) - Math.abs(fb) || fb - fa;
  });
  const cumEnergy = new Float64Array(KMAX + 1);

  let glyphPath = null;
  let curvePath = null, jumpPath = null, curveK = -1;
  let K = 1, mode = still ? 'rest' : 'intro', t0 = null, phase = 0, converged = false;

  const view = hidpi(canvas, build);

  /* ---------- geometry ---------- */

  function build(state) {
    const { w, h } = state;
    if (!w || !h) return;
    const pad = clamp(w * 0.04, 20, 56);
    const wide = w >= 760 && w / h > 0.95;
    const lines = wide ? [glyphs.words] : [[glyphs.words[0]], glyphs.words.slice(1)];
    const lineWidth = (ws) => ws.reduce((s, wd) => s + wd.width, 0) + glyphs.space * (ws.length - 1);
    const maxEm = Math.max(...lines.map(lineWidth));
    const rail = w > 980 ? 40 : 0; // room for the progress rail on the right
    const size = Math.min((w - pad * 2 - rail) / maxEm, h * (wide ? 0.3 : 0.17));
    const gap = size * 0.98;
    const blockH = glyphs.capHeight * size + gap * (lines.length - 1);
    let baseline = h * (wide ? 0.43 : 0.36) - blockH / 2 + glyphs.capHeight * size;

    const contours = [];
    for (const ws of lines) {
      let x = pad;
      for (const wd of ws) {
        for (const c of wd.contours) {
          const pts = new Float64Array(c.length);
          for (let i = 0; i < c.length; i += 2) {
            pts[i] = x + c[i] * size;
            pts[i + 1] = baseline + c[i + 1] * size;
          }
          contours.push(pts);
        }
        x += (wd.width + glyphs.space) * size;
      }
      baseline += gap;
    }

    glyphPath = new Path2D();
    for (const c of contours) {
      glyphPath.moveTo(c[0], c[1]);
      for (let i = 2; i < c.length; i += 2) glyphPath.lineTo(c[i], c[i + 1]);
      glyphPath.closePath();
    }

    sample(contours);
    fft(spec.re, spec.im);

    cumEnergy.fill(0);
    for (let i = 1; i < N; i++) {
      const f = Math.abs(freqOf(i, N));
      cumEnergy[f] += spec.re[i] ** 2 + spec.im[i] ** 2;
    }
    for (let k = 1; k <= KMAX; k++) cumEnergy[k] += cumEnergy[k - 1];
    curveK = -1;
  }

  /** Resample all contours (plus pen-up connectors) into exactly N points. */
  function sample(contours) {
    // Rotate each contour to start near where the previous one ended.
    let px = -Infinity, py = 0;
    const loops = contours.map((c) => {
      const n = c.length / 2;
      let best = 0, bd = Infinity;
      for (let i = 0; i < n; i++) {
        const d = px === -Infinity ? c[i * 2] : (c[i * 2] - px) ** 2 + (c[i * 2 + 1] - py) ** 2;
        if (d < bd) { bd = d; best = i; }
      }
      const r = new Float64Array(c.length);
      for (let i = 0; i < n; i++) {
        r[i * 2] = c[((i + best) % n) * 2];
        r[i * 2 + 1] = c[((i + best) % n) * 2 + 1];
      }
      px = r[0]; py = r[1];
      const seg = new Float64Array(n + 1);
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        seg[i + 1] = seg[i] + Math.hypot(r[j * 2] - r[i * 2], r[j * 2 + 1] - r[i * 2 + 1]);
      }
      return { r, n, seg, len: seg[n] };
    });

    const budget = N - JUMP_PTS * loops.length;
    const total = loops.reduce((s, l) => s + l.len, 0);
    const exact = loops.map((l) => (budget * l.len) / total);
    const counts = exact.map(Math.floor);
    let left = budget - counts.reduce((a, b) => a + b, 0);
    exact.map((e, i) => [e - counts[i], i]).sort((a, b) => b[0] - a[0]).slice(0, left).forEach(([, i]) => counts[i]++);

    let k = 0;
    loops.forEach((l, li) => {
      const m = counts[li];
      let s = 0;
      for (let q = 0; q < m; q++) {
        const target = (q / m) * l.len;
        while (s < l.n - 1 && l.seg[s + 1] < target) s++;
        const a = s, b = (s + 1) % l.n;
        const u = (target - l.seg[s]) / (l.seg[s + 1] - l.seg[s] || 1);
        spec.re[k] = l.r[a * 2] + (l.r[b * 2] - l.r[a * 2]) * u;
        spec.im[k] = l.r[a * 2 + 1] + (l.r[b * 2 + 1] - l.r[a * 2 + 1]) * u;
        jump[k++] = 0;
      }
      const next = loops[(li + 1) % loops.length];
      for (let j = 0; j < JUMP_PTS; j++) {
        const u = smooth(j / JUMP_PTS);
        spec.re[k] = l.r[0] + (next.r[0] - l.r[0]) * u;
        spec.im[k] = l.r[1] + (next.r[1] - l.r[1]) * u;
        jump[k++] = 1;
      }
    });
  }

  /* ---------- series ---------- */

  function partialSum(k) {
    if (k === curveK) return;
    for (let i = 0; i < N; i++) {
      const keep = Math.abs(freqOf(i, N)) <= k;
      work.re[i] = keep ? spec.re[i] : 0;
      work.im[i] = keep ? spec.im[i] : 0;
    }
    fft(work.re, work.im, true);
    curvePath = new Path2D();
    jumpPath = new Path2D();
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      const p = jump[i] ? jumpPath : curvePath;
      p.moveTo(work.re[i], work.im[i]);
      p.lineTo(work.re[j], work.im[j]);
    }
    curveK = k;
  }

  const relError = (k) => {
    const tot = cumEnergy[KMAX] || 1;
    return Math.sqrt(Math.max(0, tot - cumEnergy[Math.min(k, KMAX)]) / tot);
  };

  let shownK = -1;
  function setReadout(k) {
    if (!readout || k === shownK) return;
    shownK = k;
    readout.k.textContent = k >= KMAX ? `${KMAX}` : String(k);
    readout.terms.textContent = String(Math.min(N, 2 * k + 1));
    readout.err.textContent = relError(k).toFixed(4);
    if (slider && mode !== 'user') slider.value = String(Math.log2(Math.max(1, k)));
  }

  /* ---------- drawing ---------- */

  function draw(dt, elapsed) {
    const { ctx, w, h } = view;
    ctx.clearRect(0, 0, w, h);
    if (!glyphPath) return;

    if (mode === 'intro') {
      const u = clamp(elapsed / INTRO);
      K = Math.max(1, Math.round(2 ** (LOG_KMAX * (u * u * (3 - 2 * u)))));
      if (u >= 1) { mode = 'rest'; }
    } else if (mode === 'rest') {
      K = KMAX;
    }
    if (K >= KMAX && !converged) { converged = true; onConverged?.(); }

    partialSum(K);
    setReadout(K);

    const lk = Math.log2(Math.max(1, K)) / LOG_KMAX;
    const fill = smooth(invLerp(0.86, 1, lk));

    // Partial-sum curve, with pen-up jumps fading as the series converges.
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.85 * (1 - fill * 0.85);
    ctx.lineWidth = 1.1;
    ctx.stroke(curvePath);
    ctx.globalAlpha = 0.35 * (1 - lk) ** 1.5;
    ctx.stroke(jumpPath);

    // Solid name once converged.
    if (fill > 0) {
      ctx.globalAlpha = fill;
      ctx.fillStyle = ink;
      ctx.fill(glyphPath);
    }

    if (still) { ctx.globalAlpha = 1; return; }

    phase = (phase + (dt * N) / TRACE_PERIOD) % N;
    drawTrail(ctx);
    drawEpicycles(ctx, fill);
    ctx.globalAlpha = 1;
  }

  function drawTrail(ctx) {
    const L = 420, chunks = 14, step = L / chunks;
    const head = Math.floor(phase);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let c = 0; c < chunks; c++) {
      ctx.globalAlpha = ((c + 1) / chunks) ** 2;
      ctx.beginPath();
      for (let s = 0; s <= step; s++) {
        const i = (head - L + c * step + s + N * 2) % N;
        const prev = (i - 1 + N) % N;
        if (s === 0 || jump[prev]) ctx.moveTo(work.re[i], work.im[i]);
        else ctx.lineTo(work.re[i], work.im[i]);
      }
      ctx.stroke();
    }
  }

  function drawEpicycles(ctx, fill) {
    const terms = Math.min(N, 2 * K + 1);
    const theta = (2 * Math.PI * phase) / N;
    let x = spec.re[0] / N, y = spec.im[0] / N;
    const fade = 1 - fill * 0.55;

    ctx.lineWidth = 1;
    ctx.strokeStyle = ink;
    ctx.beginPath();
    const arms = [x, y];
    for (let o = 1; o < terms; o++) {
      const i = order[o];
      const f = freqOf(i, N);
      const a = f * theta;
      const cr = spec.re[i] / N, ci = spec.im[i] / N;
      const nx = x + cr * Math.cos(a) - ci * Math.sin(a);
      const ny = y + cr * Math.sin(a) + ci * Math.cos(a);
      if (o <= CIRCLES) {
        const r = Math.hypot(cr, ci);
        if (r > 0.6) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
        arms.push(nx, ny);
      }
      x = nx; y = ny;
    }
    ctx.globalAlpha = 0.09 * fade;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(arms[0], arms[1]);
    for (let i = 2; i < arms.length; i += 2) ctx.lineTo(arms[i], arms[i + 1]);
    ctx.lineTo(x, y);
    ctx.globalAlpha = 0.4 * fade;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ---------- controls ---------- */

  slider?.addEventListener('input', () => {
    mode = 'user';
    K = Math.max(1, Math.round(2 ** Number(slider.value)));
  });
  replay?.addEventListener('click', () => {
    mode = still ? 'rest' : 'intro';
    t0 = null;
  });

  visibleLoop(canvas, (now, dt) => {
    if (t0 === null) t0 = now;
    draw(dt, now - t0);
  });
}
