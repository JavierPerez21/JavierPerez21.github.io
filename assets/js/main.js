/**
 * Entry point. Each chapter is an independent scene; one failing must not
 * take the rest of the page down with it.
 */
import * as content from './content.js';
import { fourierName } from './scenes/fourier.js';
import { lifePaths } from './scenes/paths.js';
import { insideModel } from './scenes/model.js';
import { nextTokenSampler } from './scenes/sampler.js';
import { createDrawer } from './ui/drawer.js';
import { renderModelCard } from './ui/modelcard.js';
import { initNav } from './ui/nav.js';
import { initReveal } from './ui/reveal.js';
import { el } from './lib/util.js';

const $ = (s, root = document) => root.querySelector(s);
const safely = (name, fn) => {
  try { return fn(); } catch (err) { console.error(`[${name}]`, err); }
};

safely('nav', () => initNav(content.profile));
safely('reveal', () => initReveal());

/* 01 · Fourier name */
const hero = $('#series');
fetch(new URL('../data/name-glyphs.json', import.meta.url))
  .then((r) => r.json())
  .then((glyphs) => {
    fourierName({
      canvas: $('.hero-canvas', hero),
      glyphs,
      readout: { k: $('[data-k]', hero), terms: $('[data-terms]', hero), err: $('[data-err]', hero) },
      slider: $('[data-harmonics]', hero),
      replay: $('[data-replay]', hero),
      onConverged: () => hero.classList.add('is-converged'),
    });
    hero.classList.add('has-canvas');
  })
  .catch((err) => {
    hero.classList.add('no-canvas');
    console.error('[fourier]', err);
  });

/* 02 · Monte Carlo paths */
safely('paths', () => {
  const s = $('#paths');
  lifePaths({
    section: s,
    canvas: $('canvas', s),
    cardsRoot: $('.paths-cards', s),
    hud: { sample: $('[data-hud-sample]', s), t: $('[data-hud-t]', s) },
    milestones: content.milestones,
    now: content.NOW,
  });
});

/* 03 · Inside the model */
const drawer = safely('drawer', () => createDrawer($('#drawer')));
safely('model', () => {
  const s = $('#model');
  const rail = $('.model-rail', s);
  const railItems = content.layers.map((l, i) => el('li', {}, el('span', {}, `L${i}`), l.op));
  rail.append(...railItems);
  insideModel({
    section: s,
    canvas: $('canvas', s),
    labelsRoot: $('.model-labels', s),
    hud: {
      box: $('.model-hud', s),
      op: $('.model-op', s),
      title: $('.model-title', s),
      span: $('.model-span', s),
      blurb: $('.model-blurb', s),
      rail: railItems,
    },
    layers: content.layers,
    tokens: content.tokens,
    skillGroups: content.skillGroups,
    onOpen: (payload) => drawer?.open(payload),
  });
});

/* 04 · Model card */
safely('model-card', () => renderModelCard($('[data-modelcard]'), content));

/* 05 · Next token */
safely('sampler', () => nextTokenSampler({ root: $('[data-sampler]'), tokens: content.nextTokens }));
