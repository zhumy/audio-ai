# Rendered Page Acceptance

Use this gate for every substantial student-facing HTML page. Static structure, valid HTML, and successful script syntax checks are prerequisites, not substitutes for rendered inspection.

## 1. Test matrix

Render the actual locally served page at these CSS viewport sizes when the browser surface supports resizing:

| Class | Viewport | Purpose |
|---|---:|---|
| wide desktop | 1920 × 1080 | detect stretched layouts, weak grouping, and excessive empty space |
| desktop | 1440 × 900 | primary teaching and laptop projection layout |
| compact desktop | 1280 × 800 | detect grids that become too narrow before breakpoints |
| tablet | 768 × 1024 | verify intentional stacking and horizontal navigation |
| mobile | 390 × 844 | verify single-column reading and touch controls |

At minimum inspect 1440 × 900, 1280 × 800, and 390 × 844. Test both light and dark themes. Reload after changing viewport or theme when canvas dimensions or responsive scripts depend on load-time measurements.

## 2. Required states

Inspect:

- page top, every chapter-outline destination, and the final learning route;
- at least one long optional derivation in collapsed and expanded states;
- the widest MathML formula in each major section;
- every canvas, slider, button, or tab in its default state and one changed state;
- sticky global navigation and local chapter navigation while scrolling;
- source links, prerequisite links, and next-route links.

## 3. Release blockers

Fail acceptance when any required state contains:

- text, formula, canvas, or card overlap that changes reading order or obscures content;
- unintended page-level horizontal scrolling;
- required content clipped by fixed height, overflow, sticky navigation, or viewport edge;
- a text column narrowed enough to produce one-character-per-line Chinese or broken formula labels;
- formula foreground too close to its background, missing MathML glyphs, or unreadable subscripts;
- blank canvas, missing coordinates, unexplained axes, or a control that does not update its visualization;
- an anchor hidden beneath sticky navigation or a navigation item that does not reach its section;
- a layout that leaves most of a wide viewport empty while dense content is compressed into a narrow strip;
- a control that cannot be reached or operated at mobile width.

## 4. Quantitative checks

Use browser-computed layout to support visual judgment:

- Assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2` unless the page deliberately documents horizontal scrolling.
- Find visible elements whose `scrollWidth > clientWidth + 2`; allow only intentional local scroll containers such as wide formulas, and verify their scrollbar does not cover content.
- Inspect adjacent visible blocks for intersecting bounding rectangles. Exclude intentional overlays such as badges and plotted annotations.
- Keep normal text contrast at least 4.5:1 and large text or essential diagram strokes at least 3:1 where practical.
- Treat content cards narrower than roughly 180 px with multi-sentence Chinese text as suspicious; redesign the grid rather than allowing character-by-character wrapping.
- Check that canvas backing dimensions and CSS dimensions remain nonzero after resizing and theme switching.

Quantitative checks identify candidates; they do not replace looking at the rendered page.

## 5. Responsive layout rules

- Prefer `minmax(0, 1fr)` for flexible grid tracks and give text-heavy cards a defensible minimum width.
- Reduce column count before content becomes narrow; do not wait for mobile breakpoints after a desktop grid has already collapsed.
- Let formulas use local horizontal scrolling only when a readable multiline reformulation would be worse.
- Keep explanatory prose and its formula visually adjacent without forcing both into undersized columns.
- On wide screens, use available width to improve grouping, not to create long unstructured blank regions.
- Stack complex teaching sequences in semantic reading order; CSS visual order must not contradict DOM order.

## 6. Review report

Report each finding before or alongside fixes with:

`severity | viewport/theme | section/selector | observed failure | acceptance rule | proposed correction`

Use severity:

- `P0`: content is unreadable, inaccessible, or interaction is broken;
- `P1`: overflow, clipping, contrast, or responsive failure materially harms learning;
- `P2`: visual imbalance or weak grouping that remains readable.

Any P0 or P1 blocks release. After fixes, repeat the same viewport, theme, and state and record that it passed. Keep screenshots or browser evidence for material failures and final verification when the environment supports it.
