/**
 * Entry point. Each chapter is an independent scene; one failing must not
 * take the rest of the page down with it.
 */
import * as content from './content.js';
import { fourierName } from './scenes/fourier.js';
import { lifePaths } from './scenes/paths.js';
import { seriesToSamples } from './scenes/bridge.js';
import { samplesToNeurons } from './scenes/descent.js';
import { insideModel } from './scenes/model.js';
import { createDrawer } from './ui/drawer.js';
import { renderModelCard } from './ui/modelcard.js';
import { initNav } from './ui/nav.js';
import { initDock } from './ui/dock.js';
import { initReveal } from './ui/reveal.js';
import { initRise } from './ui/rise.js';
import { el } from './lib/util.js';

const $ = (s, root = document) => root.querySelector(s);
const safely = (name, fn) => {
  try { return fn(); } catch (err) { console.error(`[${name}]`, err); }
};

safely('nav', () => initNav(content.profile));
safely('dock', () => initDock($('[data-dock]'), content.profile.dock));
safely('reveal', () => initReveal());
safely('rise', () => initRise());

/* 02 · Monte Carlo paths (set up first: the Fourier pen lands on it) */
const pathsSection = $('#paths');
const paths = safely('paths', () => {
  const s = pathsSection;
  return lifePaths({
    section: s,
    canvas: $('canvas', s),
    timelineRoot: $('.paths-timeline', s),
    hud: { sample: $('[data-hud-sample]', s), t: $('[data-hud-t]', s) },
    replayBtn: $('[data-paths-replay]', s),
    milestones: content.milestones,
    orgs: content.orgs,
    now: content.NOW,
  });
});

/* 01 · Fourier monogram, and the fall from it into §02 */
const hero = $('#series');
// The Fourier pen starts once the loading screen lets go.
Promise.all([fetch(new URL('../data/name-glyphs.json', import.meta.url)).then((r) => r.json()), window.__siteReady])
  .then(([glyphs]) => {
    const heroCanvas = $('.hero-canvas', hero);
    const fourier = fourierName({
      canvas: heroCanvas,
      glyphs,
      slider: $('[data-harmonics]', hero),
      onConverged: () => hero.classList.add('is-converged'),
      onLayout: ({ bottom }) => hero.style.setProperty('--name-top', `${bottom}px`),
    });
    hero.classList.add('has-canvas');
    if (paths) {
      safely('bridge', () => seriesToSamples({
        hero, heroCanvas, fourier, paths, pathsSection, plotCanvas: $('canvas', pathsSection),
      }));
    }
  })
  .catch((err) => {
    hero.classList.add('no-canvas');
    console.error('[fourier]', err);
  });

/* 03 · Inside the model */
const drawer = safely('drawer', () => createDrawer($('#drawer')));
const modelSection = $('#model');
const MODEL_HOLD = 0.7; // viewports §03 stays pinned while §02's futures land and its network builds
const model = safely('model', () => {
  const s = modelSection;
  // The layer menu on the left: every layer, the one in view expanded.
  const items = content.layers.map((l, i) => el('button.model-item', { type: 'button', onclick: () => m?.goTo(i) },
    el('span.model-op', {}, `${String(i + 1).padStart(2, '0')} · ${l.kicker || l.op}`),
    el('span.model-title', {}, l.title),
    el('span.model-span', {}, l.span),
    el('span.model-more', {}, el('span.model-blurb', {}, l.blurb))));
  $('.model-menu', s).append(...items.map((b) => el('li', {}, b)));
  const m = insideModel({
    section: s,
    canvas: $('canvas', s),
    labelsRoot: $('.model-labels', s),
    hud: { items, detail: $('.model-detail', s) },
    layers: content.layers,
    tokens: content.tokens,
    skillGroups: content.skillGroups,
    onOpen: (payload) => drawer?.open(payload),
    holdVh: MODEL_HOLD,
  });
  return m;
});

/* 02 → 03 · the futures flow down into the network */
if (paths && model) {
  safely('descent', () => samplesToNeurons({
    paths, pathsSection, plotCanvas: $('canvas', pathsSection), model, modelSection, modelCanvas: $('canvas', modelSection), holdVh: MODEL_HOLD,
  }));
}

/* 04 · Model card */
safely('model-card', () => renderModelCard($('[data-modelcard]'), content));
