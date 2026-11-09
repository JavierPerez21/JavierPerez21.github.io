/**
 * §01 → §02 · From series to samples.
 *
 * Past a point in the hero the epicycle chain lets go of the name: the circles
 * collapse into the pen, and the pen, a single dot, rides an arc from where it
 * left the name to t₀ of the Monte Carlo plot, tied to the scroll. Arriving
 * there cues the ensemble. Scrolling back up runs it all in reverse.
 */
import { clamp, cssVar, hidpi, invLerp, lerp, smooth } from '../lib/util.js';

const DETACH_AT = 0.22; // fraction of the hero scrolled before the chain lets go
const BEND = 0.22; // how far the arc bows away from the straight line, as a fraction of its length

export function seriesToSamples({ hero, heroCanvas, fourier, pathsSection, plotCanvas, paths }) {
  const ink = cssVar('--ink') || '#121212';
  const accent = cssVar('--accent') || '#ff4d1f';
  const mono = cssVar('--mono') || 'monospace';

  const canvas = document.createElement('canvas');
  canvas.className = 'bridge-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const view = hidpi(canvas, () => {});
  const sticky = plotCanvas.closest('.paths-sticky');
  paths.takeControl();

  let start = null, painted = false, clock = 0;

  function clear() {
    if (!painted) return;
    view.ctx.clearRect(0, 0, view.w, view.h);
    painted = false;
  }

  function frame(now) {
    requestAnimationFrame(frame);
    clock = now;

    const s = window.scrollY, vw = window.innerWidth, vh = window.innerHeight;
    const sA = hero.getBoundingClientRect().top + s + hero.offsetHeight * DETACH_AT;
    const sLand = pathsSection.getBoundingClientRect().top + s;
    const attached = 1 - smooth(invLerp(sA, sA + vh * 0.18, s));
    const e = clamp((s - sA) / Math.max(1, sLand - sA));

    fourier.setDetached(attached < 1);
    if (attached >= 1 || e >= 1) {
      start = null;
      clear();
      if (e >= 1) paths.cue(true);
      return;
    }

    const chain = fourier.chain();
    const origin = paths.origin();
    if (!chain || !origin) return;

    const hr = heroCanvas.getBoundingClientRect();
    const n = chain.pts.length / 2;
    const homeX = (i) => hr.left + chain.pts[i * 2];
    const homeY = (i) => hr.top + chain.pts[i * 2 + 1];

    // Take-off: the tip as it sat when the scroll crossed sA. Landing: t₀ of
    // the plot, at the spot it occupies once the plot is pinned.
    if (!start) start = [homeX(n - 1), homeY(n - 1) + (s - sA)];
    const pr = plotCanvas.getBoundingClientRect();
    const end = [pr.left + origin[0], pr.top - sticky.getBoundingClientRect().top + origin[1]];

    // The pen rides a quadratic arc from take-off to t₀, one-to-one with scroll.
    const settle = 1 - smooth(invLerp(0.68, 0.97, e));
    const u = smooth(e);
    const dx = end[0] - start[0], dy = end[1] - start[1];
    const ctrl = [(start[0] + end[0]) / 2 + dy * BEND, (start[1] + end[1]) / 2 - dx * BEND];
    const at = (k) => (1 - u) ** 2 * k[0] + 2 * (1 - u) * u * k[1] + u * u * k[2];
    const free = [at([start[0], ctrl[0], end[0]]), at([start[1], ctrl[1], end[1]])];
    const pen = [lerp(free[0], homeX(n - 1), attached), lerp(free[1], homeY(n - 1), attached)];

    draw(chain, n, homeX, homeY, pen, attached, settle);
  }

  function draw(chain, n, homeX, homeY, pen, attached, settle) {
    const { ctx, w, h } = view;
    ctx.clearRect(0, 0, w, h);
    painted = true;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // The chain folds into the pen as it lets go of the name.
    if (attached > 0.002) {
      const k = smooth(attached);
      const strength = fourier.strength() * k;
      const jx = (i) => lerp(pen[0], homeX(i), k);
      const jy = (i) => lerp(pen[1], homeY(i), k);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < n - 2; i++) {
        const r = chain.radii[i] * k;
        if (r < 0.5) continue;
        ctx.moveTo(jx(i) + r, jy(i));
        ctx.arc(jx(i), jy(i), r, 0, Math.PI * 2);
      }
      ctx.globalAlpha = 0.2 * strength;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(jx(0), jy(0));
      for (let i = 1; i < n; i++) ctx.lineTo(jx(i), jy(i));
      ctx.globalAlpha = 0.6 * strength;
      ctx.stroke();
    }

    const nowMs = clock;
    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(pen[0], pen[1], 3.6, 0, Math.PI * 2);
    ctx.fill();

    // Settled on the start of time.
    const here = 1 - smooth(invLerp(0, 0.35, settle));
    if (here > 0) {
      ctx.globalAlpha = here * 0.8;
      ctx.fillStyle = ink;
      ctx.font = `11px ${mono}`;
      ctx.textBaseline = 'middle';
      ctx.fillText('t₀', pen[0] + 10, pen[1] - 1);
      const pulse = ((nowMs / 1000) * 0.8) % 1;
      ctx.strokeStyle = accent;
      ctx.globalAlpha = here * (1 - pulse) * 0.8;
      ctx.beginPath();
      ctx.arc(pen[0], pen[1], 5 + pulse * 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  requestAnimationFrame(frame);
}
