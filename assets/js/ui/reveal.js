/**
 * Scroll reveals.
 *   [data-reveal]   fades/slides in once it enters the viewport
 *   [data-scramble] text "decodes" from random symbols, like tokens resolving
 */
import { reducedMotion } from '../lib/util.js';

const GLYPHS = '∑∫∂∇πλμσθΔΩ01<>/#%*+';

export function initReveal() {
  const still = reducedMotion();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      e.target.classList.add('is-in');
      if (e.target.hasAttribute('data-scramble') && !still) scramble(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-reveal], [data-scramble]').forEach((n) => io.observe(n));
}

export function scramble(node, duration = 700) {
  const text = node.dataset.text ?? node.textContent;
  node.dataset.text = text;
  node.setAttribute('aria-label', text);
  const t0 = performance.now();
  const step = (now) => {
    const u = Math.min(1, (now - t0) / duration);
    const shown = Math.floor(u * text.length);
    let s = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      s += i < shown || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    node.textContent = s;
    if (u < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
