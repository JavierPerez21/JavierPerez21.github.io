/**
 * §01 · Analysis: the name as a Fourier series.
 *
 * The outline of every glyph is stitched into one closed curve f(θ) in the
 * complex plane, sampled at N points and transformed with an FFT. On load we
 * step through K = 0, 10, 100, 1000, 10000: at each stage a chain of
 * epicycles (one circle per term, largest first) draws the partial sum
 * S_K(θ) = Σ_{|n|≤K} c_n e^{inθ}, until the series converges on the name.
 */
import { fft, freqOf } from '../lib/fft.js';
import { clamp, cssVar, hidpi, invLerp, smooth, visibleLoop } from '../lib/util.js';

const N = 32768;
const KMAX = N / 2;
const LOG_KMAX = Math.log2(KMAX);
const JUMP_PTS = 24; // samples spent "lifting the pen" between contours
const STAGES = [
  { k: 0, dur: 0.8 },
  { k: 10, dur: 1.8 },
  { k: 100, dur: 1.8 },
  { k: 1000, dur: 2 },
  { k: 10000, dur: 2.2 },
];
const PLAY_END = STAGES.reduce((s, x) => s + x.dur, 0);
const FINAL_K = STAGES[STAGES.length - 1].k;
const FILL_IN = 0.9; // seconds for the solid name to fade in after the last stage
const TRACE_PERIOD = 12; // seconds per lap of the pen once at rest
const CIRCLES = 160; // epicycles drawn; the remaining terms are sub-pixel

const fillFor = (k) => smooth(invLerp(9, 13, Math.log2(k + 1)));

export function fourierName({ canvas, glyphs, readout, slider, replay, onConverged }) {
  const ink = cssVar('--ink') || '#121212';
  const accent = cssVar('--accent') || '#ff4d1f';

  const spec = { re: new Float64Array(N), im: new Float64Array(N) };
  const work = { re: new Float64Array(N), im: new Float64Array(N) };
  const jump = new Uint8Array(N);
  const cumEnergy = new Float64Array(KMAX + 1);

  let glyphPath = null;
  let curvePath = null, jumpPath = null, curveK = -1, chain = [];
  let K = FINAL_K, mode = 'rest', t0 = null, phase = 0, restAt = -Infinity;

  const view = hidpi(canvas, build);
  if (slider) slider.max = String(LOG_KMAX);
  onConverged?.();

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
    const kept = [];
    for (let i = 0; i < N; i++) {
      const keep = Math.abs(freqOf(i, N)) <= k;
      work.re[i] = keep ? spec.re[i] : 0;
      work.im[i] = keep ? spec.im[i] : 0;
      if (keep && i > 0) kept.push(i);
    }
    const mag = (i) => spec.re[i] ** 2 + spec.im[i] ** 2;
    chain = kept.sort((a, b) => mag(b) - mag(a)).slice(0, CIRCLES);

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
    readout.k.textContent = String(k);
    readout.terms.textContent = String(Math.min(N, 2 * k + 1));
    readout.err.textContent = relError(k).toFixed(4);
    if (slider && mode !== 'user') slider.value = String(Math.log2(k + 1));
  }

  /* ---------- drawing ---------- */

  function draw(dt, elapsed) {
    const { ctx, w, h } = view;
    ctx.clearRect(0, 0, w, h);
    if (!glyphPath) return;

    let tracing = false, fill = 0;
    if (mode === 'play') {
      if (elapsed >= PLAY_END) {
        mode = 'rest';
        restAt = elapsed;
        phase = 0;
      } else {
        let t = elapsed, s = 0;
        while (s < STAGES.length - 1 && t >= STAGES[s].dur) t -= STAGES[s].dur, s++;
        K = STAGES[s].k;
        const u = clamp(t / (STAGES[s].dur * 0.85));
        phase = u * u * (3 - 2 * u) * (N - 1);
        tracing = true;
      }
    }
    if (mode === 'rest') {
      K = FINAL_K;
      fill = smooth(clamp((elapsed - restAt) / FILL_IN)) * fillFor(K);
    } else if (mode === 'user') {
      fill = fillFor(K);
    }
    if (!tracing) phase = (phase + (dt * N) / TRACE_PERIOD) % N;

    partialSum(K);
    setReadout(K);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = ink;

    if (tracing) {
      ctx.lineWidth = 1.3;
      ctx.globalAlpha = 0.9;
      traceTo(ctx, phase, 0);
      ctx.globalAlpha = 0.2;
      traceTo(ctx, phase, 1);
      drawEpicycles(ctx, 1);
    } else {
      ctx.lineWidth = 1.1;
      ctx.globalAlpha = 0.85 * (1 - fill * 0.85);
      ctx.stroke(curvePath);
      ctx.globalAlpha = 0.25 * (1 - fill);
      ctx.stroke(jumpPath);
      if (fill > 0) {
        ctx.globalAlpha = fill;
        ctx.fillStyle = ink;
        ctx.fill(glyphPath);
      }
      drawTrail(ctx);
      drawEpicycles(ctx, 1 - fill * 0.6);
    }
    ctx.globalAlpha = 1;
  }

  /** Stroke S_K from θ = 0 up to sample `upto`; `kind` 0 = ink, 1 = pen-up jumps. */
  function traceTo(ctx, upto, kind) {
    const end = Math.min(N - 1, Math.floor(upto));
    ctx.beginPath();
    ctx.moveTo(work.re[0], work.im[0]);
    for (let i = 0; i < end; i++) {
      if (jump[i] === kind) ctx.lineTo(work.re[i + 1], work.im[i + 1]);
      else ctx.moveTo(work.re[i + 1], work.im[i + 1]);
    }
    ctx.stroke();
  }

  function tip() {
    const i0 = Math.floor(phase) % N, i1 = (i0 + 1) % N, f = phase - Math.floor(phase);
    return [work.re[i0] + (work.re[i1] - work.re[i0]) * f, work.im[i0] + (work.im[i1] - work.im[i0]) * f];
  }

  function drawTrail(ctx) {
    const L = Math.round(N * 0.1), chunks = 14, step = Math.ceil(L / chunks);
    const head = Math.floor(phase);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
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
    ctx.strokeStyle = ink;
  }

  function drawEpicycles(ctx, strength) {
    const theta = (2 * Math.PI * phase) / N;
    let x = spec.re[0] / N, y = spec.im[0] / N;
    const arms = [x, y];

    ctx.lineWidth = 1;
    ctx.strokeStyle = ink;
    ctx.beginPath();
    for (const i of chain) {
      const a = freqOf(i, N) * theta;
      const cr = spec.re[i] / N, ci = spec.im[i] / N;
      const r = Math.hypot(cr, ci);
      if (r > 0.5) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
      x += cr * Math.cos(a) - ci * Math.sin(a);
      y += cr * Math.sin(a) + ci * Math.cos(a);
      arms.push(x, y);
    }
    ctx.globalAlpha = 0.2 * strength;
    ctx.stroke();

    const [tx, ty] = tip();
    ctx.beginPath();
    ctx.moveTo(arms[0], arms[1]);
    for (let i = 2; i < arms.length; i += 2) ctx.lineTo(arms[i], arms[i + 1]);
    ctx.lineTo(tx, ty);
    ctx.globalAlpha = 0.6 * strength;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(tx, ty, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ---------- controls ---------- */

  slider?.addEventListener('input', () => {
    mode = 'user';
    K = Math.min(KMAX - 1, Math.round(2 ** Number(slider.value)) - 1);
  });
  replay?.addEventListener('click', () => {
    mode = 'play';
    t0 = null;
  });

  visibleLoop(canvas, (now, dt) => {
    if (t0 === null) t0 = now;
    draw(dt, now - t0);
  });
}
