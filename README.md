# javierperez21.github.io

Personal site of **Javier Perez Tobia**, applied AI / ML engineer.

The page walks through the history of AI in five chapters, each one an interactive scene:

| § | Chapter | Era | What happens |
|---|---------|-----|--------------|
| 01 | **Series** | Fourier, 1807 | The outline of my name is one closed curve, transformed with an FFT. Partial sums *S<sub>K</sub>* converge on the name while a chain of epicycles traces it. |
| 02 | **Paths** | Monte Carlo, 1946 | 2,048 simulated Brownian lives. Mine is a Brownian bridge pinned through real milestones; scrolling runs the clock and fans out into the future. |
| 03 | **Layers** | Attention, 2017 | A fly-through of a small transformer. Named neurons are projects and papers; click one to open its details. |
| 04 | **Card** | | The CV as a model card. |
| 05 | **Next** | | Contact links as a next-token softmax, with a temperature dial. |

Plus [`/explore`](explore/), an endless draggable field of photographs.

No framework and no build step: plain HTML, CSS and ES modules, served directly by GitHub Pages.

## Structure

```
index.html              the page (semantic HTML; scenes render on top)
explore/index.html      photo field
404.html                "out of distribution"
llms.txt                plain-text summary for AI agents
assets/
  css/
    tokens.css          colours, fonts, spacing (canvases read these too)
    base.css            reset, type, buttons, reveal animations
    layout.css          top bar, progress rail, footer
    sections.css        the five chapters
    drawer.css          neuron detail panel
    explore.css         /explore
  js/
    content.js          ★ ALL COPY LIVES HERE: edit this to update the site
    main.js             entry point, wires scenes to the DOM
    explore.js          /explore field + lightbox
    lib/                fft.js · rng.js (seeded) · util.js
    scenes/             fourier.js · bridge.js (§01→§02 fall) · paths.js · model.js · sampler.js
    ui/                 nav.js · reveal.js · drawer.js · modelcard.js
  data/name-glyphs.json glyph outlines of the name (generated)
  img/                  favicon, og.png, work/ (figures), explore/ (photos)
  docs/                 certificates
scripts/                dev tooling (not used at runtime)
```

## Editing

- **Text, experience, papers, milestones, links**: `assets/js/content.js`.
  - `milestones` drives the Monte Carlo chapter. `z` is how many σ above the ensemble mean the path passes through at that moment.
  - `layers[].items` are the named neurons. `tags` link an item to embedding tokens (shown as "input tokens" and as attention lines on hover).
  - `NOW` sets where "you are here" sits on the timeline.
- **Colours and fonts**: `assets/css/tokens.css`.

## Running locally

```bash
python scripts/serve.py        # http://localhost:8080
```

Any static server works. `serve.py` only exists because Python's default server can serve `.js` with the wrong MIME type on Windows. Append `?motion` to the URL to force animations on when your OS has *reduce motion* enabled.

## Regenerating assets

```bash
# Name outlines for the Fourier hero (needs fontTools; font from Google Fonts)
python scripts/build_name_glyphs.py InstrumentSerif-Regular.ttf

# Photos for /explore (then list them in content.js → photos)
python scripts/optimize_images.py photos path/to/originals

# Project figures for the detail panel
python scripts/optimize_images.py figures figure1.png figure2.jpg

# Social preview card
python scripts/make_og_image.py InstrumentSerif-Regular.ttf InstrumentSerif-Italic.ttf GeistMono.ttf
```

## Accessibility

All content is real DOM (neuron labels are focusable buttons; the canvases are decorative). Scenes respect `prefers-reduced-motion` and render their final state instead of animating.
