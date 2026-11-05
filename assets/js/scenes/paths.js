/**
 * §02 · Probability: Monte Carlo paths of a life.
 *
 * An ensemble of arithmetic Brownian motions dX = μ dt + σ dW all start at
 * the same point. The realised path is a Brownian bridge pinned through the
 * milestones in content.js (each sitting z σ above the ensemble mean). Scroll
 * drives the simulation clock; past "now" the path fans out into the future.
 */
import { rng } from '../lib/rng.js';
import { clamp, cssVar, el, hidpi, invLerp, isCoarse, lerp, reducedMotion, scrollProgress, visibleLoop } from '../lib/util.js';

const T0 = 2015.75;
const T1 = 2031.5;
const DT = 1 / 12;
const MU = 0.5;
const SIGMA = 1.0;
const ME = 1729; // the path label (Hardy–Ramanujan, naturally)

export function lifePaths({ section, canvas, cardsRoot, hud, milestones, now }) {
  const ink = cssVar('--ink') || '#121212';
  const accent = cssVar('--accent') || '#ff4d1f';
  const paper = cssVar('--paper') || '#f3f1eb';
  const mono = cssVar('--mono') || 'monospace';
  const setText = (node, txt) => { if (node.textContent !== txt) node.textContent = txt; };
  const still = reducedMotion();
  const nPaths = isCoarse() || window.innerWidth < 700 ? 900 : 2048;
  const steps = Math.round((T1 - T0) / DT);
  const iNow = Math.round((now - T0) / DT);
  const tAt = (i) => T0 + i * DT;

  /* ---------- simulate ---------- */
  const rand = rng(20160421);
  const ensemble = [];
  for (let p = 0; p < nPaths; p++) {
    const a = new Float32Array(iNow + 1);
    for (let i = 1; i <= iNow; i++) a[i] = a[i - 1] + MU * DT + SIGMA * Math.sqrt(DT) * rand.normal();
    ensemble.push(a);
  }

  const pins = [{ i: 0, y: 0 }, ...milestones.map((m) => ({
    i: Math.round((m.t - T0) / DT),
    y: MU * (m.t - T0) + m.z * SIGMA * Math.sqrt(m.t - T0),
  }))];
  const me = new Float32Array(iNow + 1);
  for (let k = 0; k < pins.length - 1; k++) {
    const a = pins[k], b = pins[k + 1];
    const n = b.i - a.i;
    if (n <= 0) continue;
    const w = new Float32Array(n + 1);
    for (let j = 1; j <= n; j++) w[j] = w[j - 1] + SIGMA * 0.85 * Math.sqrt(DT) * rand.normal();
    for (let j = 0; j <= n; j++) {
      const u = j / n;
      me[a.i + j] = a.y + (b.y - a.y) * u + (w[j] - u * w[n]);
    }
  }

  const nFan = 260;
  const fan = [];
  for (let p = 0; p < nFan; p++) {
    const a = new Float32Array(steps - iNow + 1);
    a[0] = me[iNow];
    for (let i = 1; i < a.length; i++) a[i] = a[i - 1] + MU * DT + SIGMA * Math.sqrt(DT) * rand.normal();
    fan.push(a);
  }
  const bands = [0.05, 0.25, 0.5, 0.75, 0.95].map(() => new Float32Array(steps - iNow + 1));
  const col = new Float32Array(nFan);
  for (let i = 0; i <= steps - iNow; i++) {
    for (let p = 0; p < nFan; p++) col[p] = fan[p][i];
    col.sort();
    [0.05, 0.25, 0.5, 0.75, 0.95].forEach((q, b) => { bands[b][i] = col[Math.floor(q * (nFan - 1))]; });
  }

  const last = Float32Array.from(ensemble, (a) => a[iNow]).sort();
  const yLo = Math.min(last[Math.floor(nPaths * 0.004)], -1) - 0.6;
  const yHi = Math.max(bands[4][bands[4].length - 1], me[iNow]) + 1.2;

  /* ---------- cards ---------- */
  const cards = [
    { id: 'intro', when: 't₀', title: 'Every line is a life that could have happened.', note: `${nPaths.toLocaleString('en')} trajectories, simulated from the same starting point. One of them is mine.` },
    ...milestones,
    { id: 'outro', when: 'p ≈ 0', title: 'The probability of this exact path was zero.', note: 'And yet, here we are. The rest is still being sampled.' },
  ];
  const nodes = cards.map((c, i) =>
    el('li.mcard', { 'data-state': i === 0 ? 'active' : 'after' },
      el('span.mcard-when', {}, c.when),
      el('h3.mcard-title', {}, c.title),
      c.where ? el('p.mcard-where', {}, c.where) : null,
      c.note ? el('p.mcard-note', {}, c.note) : null,
    ));
  const counter = el('p.mcard-count', {}, '');
  const ticks = el('div.mcard-ticks', {}, milestones.map(() => el('i')));
  cardsRoot.append(el('ol.mcards', {}, nodes), el('div.mcard-foot', {}, counter, ticks));
  let activeCard = 0;
  const setCard = (idx) => {
    if (idx === activeCard) return;
    activeCard = idx;
    nodes.forEach((n, i) => (n.dataset.state = i < idx ? 'before' : i === idx ? 'active' : 'after'));
    const m = clamp(idx, 0, milestones.length);
    counter.textContent = idx === 0 ? '' : `${String(m).padStart(2, '0')} / ${milestones.length}`;
    [...ticks.children].forEach((t, i) => t.classList.toggle('on', i < idx));
  };

  /* ---------- geometry & offscreen layers ---------- */
  let box = null;
  const cloud = document.createElement('canvas');
  const future = document.createElement('canvas');
  const X = (t) => box.l + ((t - T0) / (T1 - T0)) * (box.r - box.l);
  const Y = (y) => box.b - ((y - yLo) / (yHi - yLo)) * (box.b - box.t);
  const view = hidpi(canvas, (s) => {
    const narrow = s.w < 640;
    box = { l: narrow ? 6 : 12, r: s.w - (narrow ? 10 : 24), t: 18, b: s.h - 30 };
    paintOffscreen(s);
  });

  function prep(c, s) {
    c.width = canvas.width; c.height = canvas.height;
    const g = c.getContext('2d');
    g.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    g.clearRect(0, 0, s.w, s.h);
    g.beginPath();
    g.rect(0, box.t - 6, s.w, box.b - box.t + 6);
    g.clip();
    return g;
  }

  function paintOffscreen(s) {
    if (!s.w) return;
    const g = prep(cloud, s);
    g.strokeStyle = ink;
    g.lineJoin = 'round';
    const stride = s.w < 640 ? 2 : 1;
    const trace = (a, alpha, width) => {
      g.globalAlpha = alpha;
      g.lineWidth = width;
      g.beginPath();
      g.moveTo(X(T0), Y(a[0]));
      for (let i = stride; i <= iNow; i += stride) g.lineTo(X(tAt(i)), Y(a[i]));
      g.stroke();
    };
    for (const a of ensemble) trace(a, nPaths > 1000 ? 0.05 : 0.08, 0.75);
    // A handful of individual samples, so the cloud reads as paths, not fog.
    for (let k = 0; k < ensemble.length; k += Math.floor(ensemble.length / 28)) trace(ensemble[k], 0.32, 0.8);
    const f = prep(future, s);
    f.fillStyle = accent;
    const band = (lo, hi, alpha) => {
      f.globalAlpha = alpha;
      f.beginPath();
      for (let i = 0; i < lo.length; i++) f.lineTo(X(tAt(iNow + i)), Y(hi[i]));
      for (let i = lo.length - 1; i >= 0; i--) f.lineTo(X(tAt(iNow + i)), Y(lo[i]));
      f.closePath();
      f.fill();
    };
    band(bands[0], bands[4], 0.07);
    band(bands[1], bands[3], 0.09);
    f.strokeStyle = ink;
    f.lineWidth = 0.7;
    f.globalAlpha = 0.09;
    for (const a of fan) {
      f.beginPath();
      for (let i = 0; i < a.length; i++) f.lineTo(X(tAt(iNow + i)), Y(a[i]));
      f.stroke();
    }
    f.globalAlpha = 0.9;
    f.strokeStyle = accent;
    f.setLineDash([3, 5]);
    f.lineWidth = 1.2;
    f.beginPath();
    for (let i = 0; i < bands[2].length; i++) f.lineTo(X(tAt(iNow + i)), Y(bands[2][i]));
    f.stroke();
  }

  /* ---------- frame ---------- */
  let cursor = T0, scanStart = null, scanDone = still;
  const scanOrder = Array.from({ length: 14 }, () => rand.int(nPaths));

  function frame(time, dt) {
    const p = scrollProgress(section);
    const target = p < 0.08 ? T0 : p < 0.86 ? lerp(T0, now, invLerp(0.08, 0.86, p)) : lerp(now, T1, invLerp(0.86, 0.97, p));
    cursor = still ? target : cursor + (target - cursor) * (1 - Math.exp(-dt * 7));
    if (Math.abs(target - cursor) < 1e-4) cursor = target;

    if (scanStart === null && !scanDone && section.getBoundingClientRect().top < window.innerHeight * 0.3) scanStart = time;
    const scanT = scanDone || scanStart === null ? (scanDone ? 99 : -1) : time - scanStart;
    if (scanT > 2.6 || p > 0.08) scanDone = true;

    const { ctx, w, h } = view;
    if (!box) return;
    ctx.clearRect(0, 0, w, h);
    const xc = X(cursor), xn = X(now);

    // Year grid.
    ctx.font = `10.5px ${mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const every = w < 640 ? 3 : 1;
    for (let yr = Math.ceil(T0); yr <= Math.floor(T1); yr++) {
      const x = X(yr);
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = ink;
      ctx.fillRect(x, box.t, 1, box.b - box.t);
      if ((yr - 2016) % every === 0) {
        ctx.globalAlpha = yr <= cursor ? 0.6 : 0.3;
        ctx.fillText(`’${String(yr).slice(2)}`, x, box.b + 10);
      }
    }

    // Ensemble: bright behind the cursor, ghosted ahead of it.
    const lit = scanDone && cursor > T0 + 0.02 ? xc : xn;
    ctx.globalAlpha = 1;
    clipX(ctx, 0, lit, () => ctx.drawImage(cloud, 0, 0, w, h));
    ctx.globalAlpha = 0.2;
    clipX(ctx, lit, xn + 1, () => ctx.drawImage(cloud, 0, 0, w, h));

    // "Which one am I?" scan.
    if (!scanDone && scanT >= 0) {
      const idx = Math.floor(scanT / 0.11);
      const locked = idx >= scanOrder.length;
      const a = locked ? me : ensemble[scanOrder[idx]];
      ctx.globalAlpha = locked ? 0.95 : 0.8;
      ctx.strokeStyle = locked ? accent : ink;
      ctx.lineWidth = locked ? 2 : 1.2;
      polyline(ctx, a, 0, iNow);
      setText(hud.sample, locked ? `found: path #${ME}` : `sampling path #${String(scanOrder[idx]).padStart(4, '0')}`);
    } else if (scanDone) {
      setText(hud.sample, cursor > now + 0.05 ? `path #${ME} → ${nFan} futures` : `path #${ME} of ${nPaths.toLocaleString('en')}`);
    }

    // Now line.
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = ink;
    for (let y = box.t; y < box.b; y += 6) ctx.fillRect(xn, y, 1, 3);
    ctx.globalAlpha = 0.7;
    ctx.textAlign = 'left';
    ctx.fillText('now', xn + 6, box.t);

    // Future fan.
    if (cursor > now) {
      ctx.globalAlpha = 1;
      clipX(ctx, xn, xc, () => ctx.drawImage(future, 0, 0, w, h));
      if (cursor > now + 1.5) {
        ctx.globalAlpha = invLerp(now + 1.5, now + 3, cursor) * 0.7;
        ctx.fillStyle = ink;
        const yb = Y(bands[4][bands[4].length - 1]);
        ctx.textAlign = 'right';
        ctx.fillText('p95', box.r - 4, yb - 14);
        ctx.fillText('p5', box.r - 4, Y(bands[0][bands[0].length - 1]) + 4);
      }
    }

    // Heads of every path at the cursor.
    const ic = Math.min(iNow, Math.max(0, Math.round((cursor - T0) / DT)));
    if (scanDone && cursor < now - 0.02 && cursor > T0 + 0.02) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = ink;
      for (let k = 0; k < nPaths; k += 2) ctx.fillRect(xc - 0.75, Y(ensemble[k][ic]) - 0.75, 1.5, 1.5);
    }

    // The realised path.
    if (scanDone) {
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 1.2;
      polyline(ctx, me, ic, iNow);
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2.2;
      polyline(ctx, me, 0, ic);
    }

    // Milestones.
    let active = 0;
    milestones.forEach((m, k) => {
      if (m.t > cursor + 0.01) return;
      active = k + 1;
    });
    if (cursor > now + 0.6) active = cards.length - 1;
    setCard(active);
    milestones.forEach((m, k) => {
      if (m.t > cursor + 0.01 || !scanDone) return;
      const x = X(m.t), y = Y(me[Math.round((m.t - T0) / DT)]);
      const on = k + 1 === active;
      ctx.globalAlpha = 1;
      ctx.fillStyle = paper;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, on ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (on && !still) {
        const pulse = (time * 0.8) % 1;
        ctx.globalAlpha = 1 - pulse;
        ctx.beginPath();
        ctx.arc(x, y, 5 + pulse * 14, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Head of my path (it stops at "now"; the fan carries on without it).
    if (scanDone) {
      const xh = Math.min(xc, xn), yh = Y(me[ic]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(xh, yh, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('me', xh - 9, yh - 10);
      ctx.textBaseline = 'top';
    }
    ctx.globalAlpha = 1;

    setText(hud.t, `t = ${cursor.toFixed(2)}`);
  }

  function polyline(ctx, a, i0, i1) {
    if (i1 <= i0) return;
    ctx.beginPath();
    ctx.moveTo(X(tAt(i0)), Y(a[i0]));
    for (let i = i0 + 1; i <= i1; i++) ctx.lineTo(X(tAt(i)), Y(a[i]));
    ctx.stroke();
  }

  function clipX(ctx, x0, x1, draw) {
    if (x1 <= x0) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, 0, x1 - x0, view.h);
    ctx.clip();
    draw();
    ctx.restore();
  }

  visibleLoop(section, frame, { margin: '0px' });
}
