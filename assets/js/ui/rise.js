/**
 * The résumé card rises out of the page as you scroll into it: `--rise` goes from
 * 0 (just entering) to 1 (settled) and the CSS turns it into a slide, a scale and
 * a fade. Scroll-linked, so it needs no animation clock; it runs even when the
 * system asks for reduced motion because it only moves with the user's own scroll.
 */
import { clamp } from '../lib/util.js';

export function initRise(selector = '[data-rise]') {
  const nodes = [...document.querySelectorAll(selector)];
  if (!nodes.length) return;
  let queued = false;
  const update = () => {
    queued = false;
    const vh = window.innerHeight;
    for (const n of nodes) {
      const top = n.getBoundingClientRect().top;
      // 0 when the card's top is at the bottom of the screen, 1 once it is 38% from the top.
      const t = clamp((vh - top) / (vh * 0.62));
      const e = t * t * (3 - 2 * t);
      n.style.setProperty('--rise', e.toFixed(3));
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
}
