# Media layout guidelines

Use images, diagrams, embedded viewers, and generated visuals according to what the learner needs to inspect. Do not default to one row of equal-size cropped thumbnails.

## Choose the layout by teaching role

| Role | Use | Class or attribute |
|---|---|---|
| One primary figure that deserves reading time | large anatomy diagram, spectrum screenshot, workflow figure | `<div class="cw-media-grid" data-layout="single">` |
| Two things the learner should compare | normal vs impaired audiogram, original vs processed signal | `<div class="cw-media-grid" data-layout="compare">` |
| A process with several steps | outer ear -> middle ear -> cochlea, pipeline stages | `<div class="cw-media-grid" data-layout="sequence">` |
| One dominant figure plus supporting details | complete ear anatomy plus detail photos | `<div class="cw-media-grid" data-layout="feature">` and put the dominant figure first |
| A full-width figure inside a mixed grid | wide chart, timeline, panoramic room response | `<figure class="cw-figure is-wide">` |
| External interactive viewer | Sketchfab, embedded simulator, trusted external model | `<figure class="cw-embed">` |

## Choose the image fit by material type

| Material | Use | Class or attribute |
|---|---|---|
| Photo where cropping is acceptable | classroom, device, environment | `class="cw-figure is-photo"` or `data-fit="cover"` |
| Diagram, chart, anatomy label, screenshot with text | anything where labels must not be cropped | `class="cw-figure is-diagram"` or `data-fit="contain"` |
| Image should keep its own aspect ratio | tall audiogram, scanned figure, unusual dimensions | `data-ratio="natural"` |
| Stable visual ratio is useful | square icon-like figure, portrait photo, wide chart | `data-ratio="square"`, `portrait`, `wide`, or `panorama` |

## Examples

Single diagram:

```html
<div class="cw-media-grid" data-layout="single">
  <figure class="cw-figure is-diagram" data-ratio="natural">
    <img src="media/cochlea-frequency.jpg" alt="..." />
    <figcaption>...</figcaption>
  </figure>
</div>
```

Comparison:

```html
<div class="cw-media-grid" data-layout="compare">
  <figure class="cw-figure is-diagram" data-fit="contain">
    <img src="media/audiogram-normal.png" alt="..." />
    <figcaption>正常听阈。</figcaption>
  </figure>
  <figure class="cw-figure is-diagram" data-fit="contain">
    <img src="media/audiogram-loss.png" alt="..." />
    <figcaption>高频听损。</figcaption>
  </figure>
</div>
```

Sequence:

```html
<div class="cw-media-grid" data-layout="sequence">
  <figure class="cw-figure is-photo">...</figure>
  <figure class="cw-figure is-diagram" data-fit="contain">...</figure>
  <figure class="cw-figure is-diagram" data-fit="contain">...</figure>
</div>
```

External 3D model:

```html
<figure class="cw-embed">
  <iframe title="..." src="https://sketchfab.com/models/.../embed" loading="lazy" allowfullscreen></iframe>
  <figcaption>Model name, author, source link, license or embed note.</figcaption>
</figure>
```

## Required checks

- Never crop labels, axes, legends, anatomy names, or UI text.
- Prefer `is-diagram` or `data-fit="contain"` for instructional diagrams.
- Use `is-photo` only when cropping does not remove required evidence.
- Keep captions specific: say what the student should observe, not just the image title.
- Record source, author, license, and whether the file is embedded or copied into the repository.
- Check mobile width: no page-level horizontal scrolling, no one-character columns, and the caption remains readable.
