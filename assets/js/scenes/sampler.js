/**
 * §05 · Output: sample the next token.
 * Contact links as a softmax distribution, with a temperature dial.
 */
import { el, reducedMotion } from '../lib/util.js';

export function nextTokenSampler({ root, tokens }) {
  const still = reducedMotion();
  let T = 1;
  let busy = false;

  const out = el('span.sampler-out', { 'aria-live': 'polite' });
  const caret = el('span.sampler-caret', { 'aria-hidden': 'true' });
  const prompt = el('p.sampler-prompt', {},
    el('span.sampler-gt', { 'aria-hidden': 'true' }, '›'),
    ' You’ve reached the end of the forward pass. Press sample, or pick one yourself. Next token:',
    out, caret);

  const rows = tokens.map((t) => {
    const p = el('span.tok-p', {}, '0.00');
    const bar = el('i');
    const row = el('li.tok', {},
      el('a.tok-link', { href: t.href, target: t.href.startsWith('http') ? '_blank' : null, rel: t.href.startsWith('http') ? 'noopener' : null },
        el('span.tok-text', {}, `"${t.token.trim()}"`),
        el('span.tok-bar', { 'aria-hidden': 'true' }, bar),
        p,
        el('span.tok-hint', {}, t.hint),
        el('span.tok-go', { 'aria-hidden': 'true' }, '↗')));
    return { t, row, p, bar };
  });
  const list = el('ol.sampler-dist', {}, rows.map((r) => r.row));

  const tOut = el('output.sampler-t', {}, 'T = 1.00');
  const slider = el('input', { type: 'range', min: '0.05', max: '2.5', step: '0.01', value: '1', 'aria-label': 'Sampling temperature' });
  const btn = el('button.btn.btn--accent', { type: 'button' }, 'Sample next token');
  const controls = el('div.sampler-controls', {},
    el('label.sampler-temp', {}, el('span.label', {}, 'temperature'), slider, tOut),
    btn);

  root.append(prompt, list, controls);

  function probs() {
    const z = tokens.map((t) => t.logit / Math.max(T, 1e-3));
    const m = Math.max(...z);
    const e = z.map((v) => Math.exp(v - m));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / s);
  }

  function render() {
    const ps = probs();
    rows.forEach((r, i) => {
      r.p.textContent = ps[i].toFixed(2);
      r.bar.style.transform = `scaleX(${Math.max(0.004, ps[i])})`;
    });
    tOut.textContent = `T = ${T.toFixed(2)}`;
  }

  slider.addEventListener('input', () => { T = Number(slider.value); render(); });

  btn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    const ps = probs();
    let r = Math.random(), pick = 0;
    for (; pick < ps.length - 1; pick++) { r -= ps[pick]; if (r <= 0) break; }
    rows.forEach((x) => x.row.classList.remove('is-picked', 'is-scan'));
    out.textContent = '';
    if (!still) {
      // Decelerating scan over the candidates before landing on the sample.
      const hops = 10 + pick + rows.length;
      for (let h = 0; h <= hops; h++) {
        const i = (h + pick + rows.length * 3 - hops) % rows.length;
        rows.forEach((x, j) => x.row.classList.toggle('is-scan', j === i));
        await wait(40 + h * h * 1.6);
      }
    }
    rows.forEach((x) => x.row.classList.remove('is-scan'));
    rows[pick].row.classList.add('is-picked');
    const word = tokens[pick].token;
    for (let c = 1; c <= word.length; c++) {
      out.textContent = word.slice(0, c);
      if (!still) await wait(45);
    }
    busy = false;
  });

  render();
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
