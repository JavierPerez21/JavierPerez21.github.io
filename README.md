# javierperez21.github.io

Personal site of **Javier Perez Tobia**, applied AI / ML engineer.

The page walks through the history of AI in five chapters, each one an interactive scene:

| § | Chapter | Era | What happens |
|---|---------|-----|--------------|
| 01 | **Intro** | Fourier, 1807 | The outline of my monogram, JPT, is one closed curve, transformed with an FFT. Partial sums *S<sub>K</sub>* converge on it while a chain of epicycles traces it; the full name is set beneath. |
| 02 | **Career** | Monte Carlo, 1946 | The Fourier pen random-walks down to t₀ and 2,048 Brownian lives spawn from it. Mine, a Brownian bridge pinned through real milestones, then plays itself up to *now*, dropping each milestone into a timeline of cards that open up on click. Scrolling on samples its futures, which flow down the page and land on the skill tokens of the network's input layer, already in focus, as it builds itself. |
| 03 | **Catalogue** | Attention, 2017 | A fly-through of a small transformer. Named neurons are projects and papers; click one to open its details. |
| 04 | **Résumé** | | The CV as a model card. |
| 05 | **Contact** | | Contact links as a next-token softmax, with a temperature dial. |

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
    layout.css          top bar, Explore dock, footer
    sections.css        the five chapters
    drawer.css          neuron detail panel
    explore.css         /explore
  js/
    content.js          ★ ALL COPY LIVES HERE: edit this to update the site
    main.js             entry point, wires scenes to the DOM
    explore.js          /explore field + lightbox
    lib/                fft.js · rng.js (seeded) · util.js
    scenes/             fourier.js · bridge.js (§01→§02 fall) · paths.js · descent.js (§02→§03 futures) · model.js
    ui/                 nav.js · reveal.js · drawer.js · modelcard.js
  data/name-glyphs.json glyph outlines of the monogram (generated)
  img/                  favicon, og.png, work/ (figures), explore/ (photos)
  docs/                 certificates
scripts/                dev tooling (not used at runtime)
```

## Editing

- **Text, experience, papers, milestones, links**: `assets/js/content.js`.
  - `profile.dock` is the floating Explore menu (bottom right): resume (`assets/docs/javier-perez-tobia-resume.pdf`), Google Scholar, images, GitHub.
  - `milestones` drives the Monte Carlo chapter. `z` is how many σ above the ensemble mean the path passes through at that moment.
    Each milestone's `detail` (summary, points, image, links) is what its card shows when clicked open; `org` picks a logo from `orgs` (files in `assets/img/logos/`).
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
# Monogram outlines for the Fourier hero (needs fontTools; font from Google Fonts)
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
