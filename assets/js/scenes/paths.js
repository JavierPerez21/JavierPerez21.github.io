/**
 * §02 · Probability: Monte Carlo paths of a life.
 *
 * An ensemble of arithmetic Brownian motions dX = μ dt + σ dW all start at
 * the same point. Once cued, they appear one by one and then in a flood. The
 * realised path is a Brownian bridge pinned through the milestones in
 * content.js (each sitting z σ above the ensemble mean); scroll drives its
 * clock, and each milestone it reaches pops out of the line and drops into a
 * timeline under the plot. Past "now" the path fans out into the future.
 */
import { rng } from '../lib/rng.js';
import { clamp, cssVar, el, hidpi, invLerp, isCoarse, lerp, scrollProgress, smooth, visibleLoop } from '../lib/util.js';

const T0 = 2015.75;
const T1 = 2031.5;
const DT = 1 / 12;
const MU = 0.5;
const SIGMA = 1.0;
const ME = 1729; // the path label (Hardy–Ramanujan, naturally)
const GEN_TAU = 0.34; // path k appears at GEN_TAU·ln(k + 2) s: one by one, then a flood
const TRACE0 = 0.6; // seconds the first path takes to draw itself; later ones are quicker
const LIFE_RATE = 3; // how fast the life line chases the scroll position (1/s)
const SVG = 'http://www.w3.org/2000/svg';

export function lifePaths({ section, canvas, timelineRoot, hud, milestones, now }) {
  const ink = cssVar('--ink') || '#121212';
  const accent = cssVar('--accent') || '#ff4d1f';
  const paper = cssVar('--paper') || '#f3f1eb';
  const mono = cssVar('--mono') || 'monospace';
  const setText = (node, txt) => { if (node.textContent !== txt) node.textContent = txt; };
  const nPaths = isCoarse() || window.innerWidth < 700 ? 900 : 2048;
  const steps = Math.round((T1 - T0) / DT);
  const iNow = Math.round((now - T0) / DT);
  const tAt = (i) => T0 + i * DT;
  const iOf = (t) => Math.round((t - T0) / DT);

  /* ---------- simulate ---------- */
  const rand = rng(20160421);
  const ensemble = [];
  for (let p = 0; p < nPaths; p++) {
    const a = new Float32Array(iNow + 1);
    for (let i = 1; i <= iNow; i++) a[i] = a[i - 1] + MU * DT + SIGMA * Math.sqrt(DT) * rand.normal();
    ensemble.push(a);
  }

  const pins = [{ i: 0, y: 0 }, ...milestones.map((m) => ({
    i: iOf(m.t),
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

  /* ---------- generation schedule ---------- */
  const appearAt = (k) => GEN_TAU * Math.log(k + 2);
  const traceFor = (k) => TRACE0 * Math.exp(-k / 5);
  const highlight = (k) => k < 6 || k % Math.floor(nPaths / 24) === 0;

  /* ---------- timeline of milestones ---------- */
  const INTRO = `${nPaths.toLocaleString('en')} trajectories, simulated from the same starting point. One of them is mine.`;
  const OUTRO = 'The probability of this exact path was zero. And yet, here we are; the rest is still being sampled.';
  const caption = el('p.ms-caption', {}, INTRO);
  const leaders = document.createElementNS(SVG, 'svg');
  leaders.setAttribute('class', 'ms-leaders');
  leaders.setAttribute('aria-hidden', 'true');
  const lines = milestones.map(() => leaders.appendChild(document.createElementNS(SVG, 'line')));
  const cards = milestones.map((m, k) =>
    el('li.ms-card', { style: { zIndex: k + 1 } },
      el('span.ms-when', {}, m.when),
      el('span.ms-title', {}, m.title)));
  const band = el('div.ms-band', {}, leaders, el('ol.ms-cards', { 'aria-label': 'Milestones' }, cards));
  timelineRoot.append(caption, band);

  let hot = -1;
  cards.forEach((c, k) => {
    c.addEventListener('pointerenter', () => { hot = k; });
    c.addEventListener('pointerleave', () => { if (hot === k) hot = -1; });
  });

  const slots = milestones.map(() => ({ x: 0, y: 0 }));
  const shown = milestones.map(() => false);
  const flights = milestones.map(() => null);
  const slotT = (k) => `translate(${slots[k].x}px, ${slots[k].y}px)`;

  /** Rows of cards, each card as close to its own year as the row allows; a
   *  row that cannot fit them all fans its cards out like a deck. */
  function layoutTimeline() {
    const W = band.clientWidth;
    if (!W || !box) return;
    const narrow = W < 640;
    const rows = narrow ? 3 : W > 1300 ? 2 : 3;
    const cw = narrow ? 118 : 162;
    const ch = cards[0].offsetHeight || 58;
    const top = 16, gap = 8;
    band.style.height = `${top + rows * (ch + gap)}px`;
    for (let r = 0; r < rows; r++) {
      const ks = milestones.map((_, k) => k).filter((k) => k % rows === r);
      const want = ks.map((k) => clamp(X(milestones[k].t) - 12, 0, W - cw));
      let step = cw + gap;
      const span = W - cw - want[0];
      if (ks.length > 1 && (ks.length - 1) * step > span) step = Math.max(24, span / (ks.length - 1));
      let x = -Infinity;
      ks.forEach((k, j) => {
        x = Math.max(want[j], x + step);
        x = Math.min(x, W - cw - (ks.length - 1 - j) * step);
        slots[k] = { x: Math.max(0, x), y: top + r * (ch + gap) };
      });
    }
    cards.forEach((c, k) => {
      c.style.width = `${cw}px`;
      if (!flights[k]) {
        c.style.transform = shown[k] ? slotT(k) : dotT(k, 0.15);
        c.style.opacity = shown[k] ? '1' : '0';
      }
      const L = lines[k];
      L.setAttribute('x1', X(milestones[k].t));
      L.setAttribute('y1', 0);
      L.setAttribute('x2', slots[k].x + 12);
      L.setAttribute('y2', slots[k].y);
    });
  }

  /** Transform that puts card k on its milestone dot in the plot (`lift` px above it). */
  function dotT(k, scale, lift = 0) {
    const pr = canvas.getBoundingClientRect(), br = band.getBoundingClientRect();
    const m = milestones[k];
    const x = X(m.t) + pr.left - br.left - 12;
    const y = Y(me[iOf(m.t)]) + pr.top - br.top - lift;
    return `translate(${x}px, ${y}px) scale(${scale})`;
  }

  function fly(k, show) {
    shown[k] = show;
    const c = cards[k];
    const from = getComputedStyle(c).transform;
    const fromO = getComputedStyle(c).opacity;
    flights[k]?.cancel();
    const frames = show
      ? [
        { transform: dotT(k, 0.15), opacity: 0 },
        { transform: dotT(k, 0.7, 22), opacity: 1, offset: 0.22 },
        { transform: slotT(k), opacity: 1 },
      ]
      : [{ transform: from === 'none' ? slotT(k) : from, opacity: fromO }, { transform: dotT(k, 0.15), opacity: 0 }];
    const anim = c.animate(frames, {
      duration: show ? 1000 : 480,
      easing: show ? 'cubic-bezier(.3, .7, .15, 1)' : 'cubic-bezier(.5, 0, .75, 0)',
      fill: 'forwards',
    });
    flights[k] = anim;
    lines[k].classList.toggle('on', show);
    anim.onfinish = () => {
      c.style.transform = show ? slotT(k) : dotT(k, 0.15);
      c.style.opacity = show ? '1' : '0';
      anim.cancel();
      if (flights[k] === anim) flights[k] = null;
    };
  }

  /* ---------- geometry & offscreen layers ---------- */
  let box = null, baked = 0;
  const cloud = document.createElement('canvas');
  const future = document.createElement('canvas');
  const X = (t) => box.l + ((t - T0) / (T1 - T0)) * (box.r - box.l);
  const Y = (y) => box.b - ((y - yLo) / (yHi - yLo)) * (box.b - box.t);
  let cloudCtx = null, stride = 1;
  const view = hidpi(canvas, (s) => {
    const narrow = s.w < 640;
    box = { l: narrow ? 6 : 12, r: s.w - (narrow ? 10 : 24), t: 18, b: s.h - 30 };
    stride = narrow ? 2 : 1;
    paintOffscreen(s);
    layoutTimeline();
  });
  new ResizeObserver(() => layoutTimeline()).observe(band);
  document.fonts?.ready.then(layoutTimeline);

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

  function bake(k) {
    const g = cloudCtx, a = ensemble[k];
    g.globalAlpha = highlight(k) ? 0.32 : nPaths > 1000 ? 0.05 : 0.08;
    g.lineWidth = highlight(k) ? 0.8 : 0.75;
    g.beginPath();
    g.moveTo(X(T0), Y(a[0]));
    for (let i = stride; i <= iNow; i += stride) g.lineTo(X(tAt(i)), Y(a[i]));
    g.stroke();
  }

  function paintOffscreen(s) {
    if (!s.w) return;
    cloudCtx = prep(cloud, s);
    cloudCtx.strokeStyle = ink;
    cloudCtx.lineJoin = 'round';
    for (let k = 0; k < baked; k++) bake(k);

    const f = prep(future, s);
    f.fillStyle = accent;
    const fill = (lo, hi, alpha) => {
      f.globalAlpha = alpha;
      f.beginPath();
      for (let i = 0; i < lo.length; i++) f.lineTo(X(tAt(iNow + i)), Y(hi[i]));
      for (let i = lo.length - 1; i >= 0; i--) f.lineTo(X(tAt(iNow + i)), Y(lo[i]));
      f.closePath();
      f.fill();
    };
    fill(bands[0], bands[4], 0.07);
    fill(bands[1], bands[3], 0.09);
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
  // Generation starts when cued: by the Fourier pen landing on t₀, or by
  // scroll position when nothing external has taken control.
  let cursor = T0, external = false, cued = false, genStart = null, readyAt = null;

  function frame(time, dt) {
    const { ctx, w, h } = view;
    if (!box) return;

    if (!external && !cued && section.getBoundingClientRect().top < window.innerHeight * 0.3) cued = true;
    if (cued && genStart === null) genStart = time;
    const gt = genStart === null ? -1 : time - genStart;
    const count = gt < 0 ? 0 : clamp(Math.floor(Math.exp(gt / GEN_TAU) - 1), 0, nPaths);
    while (baked < count && gt >= appearAt(baked) + traceFor(baked)) bake(baked++);
    const ready = baked >= nPaths;
    if (ready && readyAt === null) readyAt = time;
    const settled = ready ? smooth(clamp((time - readyAt) / 0.9)) : 0;

    const p = scrollProgress(section);
    const target = !ready || p < 0.08 ? T0 : p < 0.86 ? lerp(T0, now, invLerp(0.08, 0.86, p)) : lerp(now, T1, invLerp(0.86, 0.97, p));
    cursor += (target - cursor) * (1 - Math.exp(-dt * LIFE_RATE));
    if (Math.abs(target - cursor) < 1e-4) cursor = target;

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

    // Ensemble: everything generated so far; once my path starts, bright
    // behind the cursor and ghosted ahead of it.
    const lit = lerp(xn + 1, xc, settled);
    ctx.globalAlpha = 1;
    clipX(ctx, 0, lit, () => ctx.drawImage(cloud, 0, 0, w, h));
    ctx.globalAlpha = 0.2;
    clipX(ctx, lit, xn + 1, () => ctx.drawImage(cloud, 0, 0, w, h));

    // Paths still drawing themselves.
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    for (let k = baked; k < count; k++) {
      const u = clamp((gt - appearAt(k)) / traceFor(k));
      const end = Math.round(u * iNow);
      ctx.globalAlpha = k < 6 ? 0.85 : 0.45;
      ctx.lineWidth = k < 6 ? 1.2 : 0.8;
      polyline(ctx, ensemble[k], 0, end);
      if (k < 6) {
        ctx.beginPath();
        ctx.arc(X(tAt(end)), Y(ensemble[k][end]), 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // t₀, where every path starts.
    if (!ready) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(X(T0), Y(0), 3.6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (gt < 0) setText(hud.sample, 'awaiting t₀');
    else if (!ready) setText(hud.sample, `sampling ${count.toLocaleString('en')} / ${nPaths.toLocaleString('en')}`);
    else setText(hud.sample, cursor > now + 0.05 ? `path #${ME} → ${nFan} futures` : `path #${ME} of ${nPaths.toLocaleString('en')}`);

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

    const ic = Math.min(iNow, Math.max(0, Math.round((cursor - T0) / DT)));
    if (ready) {
      // Where every other life is at the same moment.
      if (cursor < now - 0.02 && cursor > T0 + 0.02) {
        ctx.globalAlpha = 0.35 * settled;
        ctx.fillStyle = ink;
        for (let k = 0; k < nPaths; k += 2) ctx.fillRect(xc - 0.75, Y(ensemble[k][ic]) - 0.75, 1.5, 1.5);
      }
      // My path, drawn only as far as the clock has run.
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2.2;
      polyline(ctx, me, 0, ic);
    }

    // Milestones: a clear dot on the line for each one reached; each pops a
    // card into the timeline below.
    let active = -1;
    milestones.forEach((m, k) => {
      const on = ready && m.t <= cursor + 0.01;
      if (on) active = k;
      if (on !== shown[k]) fly(k, on);
    });
    cards.forEach((c, k) => c.classList.toggle('is-active', k === active));
    milestones.forEach((m, k) => {
      if (!shown[k]) return;
      const x = X(m.t), y = Y(me[iOf(m.t)]);
      const big = k === active || k === hot;
      ctx.globalAlpha = 1;
      ctx.fillStyle = paper;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, big ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (big) {
        const pulse = (time * 0.8) % 1;
        ctx.globalAlpha = 1 - pulse;
        ctx.beginPath();
        ctx.arc(x, y, 5 + pulse * 14, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    if (cursor > now + 0.6) setText(caption, OUTRO);
    else if (active >= 0) {
      const m = milestones[active];
      setText(caption, [m.when, m.where, m.note].filter(Boolean).join('  ·  '));
    } else setText(caption, INTRO);

    // Head of my path (it stops at "now"; the fan carries on without it).
    if (ready) {
      const xh = Math.min(xc, xn), yh = Y(me[ic]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(xh, yh, 3.6, 0, Math.PI * 2);
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

  return {
    /** t₀ origin of every path, in canvas px. */
    origin: () => (box ? [X(T0), Y(0)] : null),
    /** Hand the start of the simulation to an external cue. */
    takeControl: () => { external = true; },
    /** Start generating (once started, the ensemble stays). */
    cue: (on) => { if (on) cued = true; },
  };
}
