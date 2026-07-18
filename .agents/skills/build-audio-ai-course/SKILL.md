---
name: build-audio-ai-course
description: Build, reorganize, review, visually validate, or extend the Audio AI for Human and Machine course while preserving its course narrative, Session/Chapter boundary, semantic URLs, relationship navigation, derivation continuity, shared notation, responsive layout, readable MathML, and student-facing HTML style. Use when working on course routes, Session pages, Chapter HTML, labs, notes, scripts, shared navigation, formulas, responsive CSS, browser rendering, or relationships among course topics.
---

# Build Audio AI Course

Treat the course as a connected textbook and learning route, not a collection of independent pages. Preserve a visible course narrative, give every chapter its own narrative, and make both routes traversable through stable links.

## Required context

1. Read [references/course-blueprint.md](references/course-blueprint.md) completely before planning or editing course content.
2. Inspect the current repository truth instead of assuming the blueprint is current:
   - `README.md`
   - `course-data/catalog.json` and `course-data/paths/current.json`
   - `syllabus/index.html`
   - `session/index.html` when working on teaching routes
   - the target chapter's `index.html`, `notes.md`, and `script.md` when present
   - prerequisite and successor pages named by the blueprint or the target page
3. Treat the newest explicit user instruction as authoritative. Preserve files the user marks immutable.

## Workflow

### 1. State both narratives before editing

Write one sentence for the course-level role of the target page:

`previous knowledge -> this chapter's transformation -> next use`

Write one sentence for the chapter-level narrative:

`observable phenomenon or task -> basic object and variables -> mechanism or derivation -> representation or method -> experiment/application -> boundary/evaluation`

If either sentence is unclear, reorganize the information architecture before polishing prose or CSS.

### 2. Enforce the Session/Chapter boundary

Treat `session/` as the syllabus-driven orchestration layer and `chapters/` as the authoritative knowledge layer.

- A Session may explain why several topics belong together, how their views or methods relate, what prerequisite it receives, and what later topic uses the result.
- A Session may provide learning questions, a relationship map, a recommended route, and contextual links to exact Chapter pages or anchors.
- A Session must not teach, summarize as a substitute for, copy, embed, or build-time compose the Chapter's definitions, formulas, derivations, examples, or detailed explanations.
- A Chapter owns the concrete knowledge. Give every authoritative definition, formula, derivation, worked example, and validity boundary a stable semantic URL or anchor so a Session can link to it precisely.
- If a Session needs transition prose, keep it at the relationship level: explain why the learner moves between topics, not the detailed content found after the jump.

Every Session must expose a visible relationship-navigation layer:

- Provide a sticky or floating route panel with real `<a href>` links to the related Chapters and, where useful, their exact semantic anchors.
- Label each link by relationship and destination, such as `前置：采样`, `换一个维度：空间域`, `进入完整章节：频域`, or `用于后续：听觉滤波器组`.
- A hover or focus preview may explain why the destination matters, but essential meaning must remain visible without hover. Support keyboard focus and mobile touch.
- Keep previous/current/next relationships explicit. Do not reduce the route to unlabeled arrows or generic “上一章/下一章”.
- Provide a clear route back from a linked Chapter to the relevant Session or course overview when that relationship is part of the published learning path.
- Ensure floating navigation never covers required content and collapses to an accessible compact control on narrow screens.

Reject a Session edit that silently duplicates Chapter content, links only to a Chapter home when an exact anchor is required, or leaves a relationship link broken.

### 3. Build a section map with stable anchors

Choose 5-8 narrative turning points from the actual chapter. Give each a stable, semantic `id`. Avoid numbering-only IDs and avoid renaming an existing public anchor without adding a compatibility target.

Add a visible row of anchor links near the top of each student HTML page:

```html
<nav class="chapter-outline" aria-label="本章主线" data-course-outline>
  <a href="#overview">先看全貌</a>
  <a href="#physical-object">物理对象</a>
  <a href="#principle">原理</a>
  <a href="#derivation">关键推导</a>
  <a href="#practice">怎么做</a>
  <a href="#evaluation">如何检验</a>
  <a href="#route">学习路线</a>
</nav>
```

Use labels that match the chapter's own story; the example labels are not mandatory. Use `<a>` rather than `<button>` for navigation. Prefer one desktop row with horizontal scrolling on narrow screens. Repeat a compact route at the bottom only when the page is long enough to benefit.

Keep global course navigation and local chapter-outline navigation separate:

- Global navigation answers “where am I in the course?”
- Chapter outline answers “where am I in this chapter's reasoning?”

Treat `chapter-outline` as one shared UI contract, not a page-local visual choice:

- Load `assets/css/chapter.css` on every Chapter page.
- Keep the outline sticky while reading, above ordinary content but below dialogs or accessibility overlays.
- Define sticky position, stacking, backdrop, shadow, light/dark colors, link typography, link padding, borders, and hover/focus treatment only in shared CSS. Page-local CSS may adjust container width, margin, and narrow-screen overflow, but must not restyle outline links or override protected container properties.
- Give anchor targets enough `scroll-margin-top` that the sticky outline never hides their headings.
- Verify actual contrast and stickiness in both themes after scrolling; source declarations alone are not evidence.

Treat typography, palette, mathematics, and motion as one course design system:

- Use `assets/css/theme.css` as the canonical source for `--course-*` tokens. Chapter and Session pages must use the shared sans-serif stack, body/card-title text sizes, background/surface/ink roles, primary cyan, secondary gold, alert coral, line color, and display/compact MathML sizes.
- Let a Session differ in hierarchy, card composition, and route-navigation treatment because it is an orchestration layer, but keep its typography and semantic colors visibly related to Chapters through the same tokens.
- Use `--course-math-display-size` for authoritative display equations and `--course-math-compact-size` for dense matrices, secondary derivations, and mobile-sensitive formula groups. Do not hardcode a Chapter-specific display formula size.
- Apply both `--course-font-math` and the appropriate shared math-size token to every display-equation wrapper, including page-specific wrappers such as `.fp-equation`; inheriting the browser's default `math` font or its default 16px size is a release failure.
- Keep inline MathML at surrounding text size. Give wide display MathML local horizontal scrolling instead of shrinking it until unreadable.
- Use primary cyan for the measured signal, response, wave, or main coordinate; secondary gold for phase, polarity contrast, or a highlighted transformation; use alert coral only for incident rays, warnings, or error states. Keep axes and annotations neutral.
- Do not introduce a page-local body font stack, duplicate the global light/dark palette, or add an animation palette unrelated to the shared semantic roles.

### 4. Make relationships clickable

Link concepts at the point where the relationship matters. Classify each connection in visible text:

- `前置知识` for required earlier material
- `复用定义` or `复用公式` for an authoritative definition or derivation
- `进入实验` for a lab or interactive page
- `用于后续` for a successor chapter or project
- `回到全貌` for the course route

Do not rely only on generic “上一章/下一章” links. A student should understand why the destination matters before clicking.

### 5. Preserve derivation continuity

Use this order for technical content:

`basic law -> physical object -> variable and unit -> assumptions -> intermediate relation -> target formula -> interpretation -> validity boundary`

For acoustics, begin with the physical source and air-parcel motion when relevant. Derive advanced equations from conservation laws, force, geometry, or operation definitions. Do not present a named equation as an unexplained starting point when the chapter promises a derivation.

Keep the shortest complete derivation on the main line. Put long algebra, alternative proofs, complex-number detail, and special cases in expandable `details` blocks or appendices without deleting them.

### 6. Reuse formulas and notation

- Define variables in one chapter-level notation registry before heavy derivations.
- Give each authoritative formula a stable ID such as `eq-wave-equation`.
- Write a core formula fully once in its authoritative Chapter. Other Chapters may link back and add only a new step, special case, or interpretation. Sessions must link to the formula anchor rather than re-render the formula.
- Distinguish instantaneous fields, sampled sequences, and complex amplitudes typographically and symbolically.
- Use native MathML for formulas. Fix rendering in CSS rather than replacing mathematics with plain text.
- Define direction systems before formulas involving radial, baseline, Cartesian, or incidence directions.

### 7. Keep student and teacher layers distinct

Student HTML should read like a textbook: connected explanation, figures, derivations, interactive observations, applications, boundaries, and self-checks. Keep minute-by-minute plans, teacher prompts, and classroom management in `notes.md` or `script.md`.

### 8. Validate the result

Run the structural audit after editing:

```powershell
python .agents/skills/build-audio-ai-course/scripts/audit_course_pages.py . --strict
```

Also verify in proportion to the change:

- unique IDs and valid local anchors
- local file links resolve
- Session relationship links resolve to the intended Chapter or semantic anchor
- Session floating navigation works with mouse, keyboard, and mobile touch without covering content
- Chapter outlines remain sticky after scrolling, use the shared light/dark palette, retain readable link contrast, and do not hide anchor targets
- Chapter pages do not locally override protected `chapter-outline` behavior or color properties
- Chapter and Session pages resolve typography and semantic colors through shared `--course-*` tokens
- display and compact equations use the shared MathML size tokens without page-local hardcoded drift
- representative animations use cyan/gold/coral according to their semantic roles in both themes
- Sessions contain macro-level relationships and route guidance, not duplicated Chapter definitions, formulas, derivations, or examples
- chapter-outline labels match section order
- course route and chapter route are both visible
- MathML remains intact
- formulas are not duplicated accidentally
- variables do not drift across sections
- source files declared immutable are byte-identical
- JavaScript syntax and relevant interactions still work

Then perform the mandatory rendered-page acceptance in [references/visual-acceptance.md](references/visual-acceptance.md). Structural audit success is not page acceptance. Open the actual page in a browser, inspect all required viewports and both themes, expand representative derivations, and check computed layout rather than source CSS alone.

Treat any unreadable overlap, unintended page-level horizontal scrolling, clipped required content, invisible formula, broken navigation, or unusable interaction as a release blocker. Fix the page and repeat the rendered inspection. Do not claim completion or visual verification unless the browser render was actually inspected after the final edit.

When multiple agents are available, use an independent review pass after implementation. Give the reviewer the page and acceptance standard, not the suspected defects or intended fixes. The author remains responsible for fixing findings and obtaining a clean recheck.

## Maintain the living blueprint

Update `references/course-blueprint.md` when a user decision changes any of these:

- the course-level narrative or phase boundaries
- chapter order, chapter role, or prerequisite/successor routing
- required chapter-outline navigation pattern
- formula/notation ownership
- student/teacher content boundary
- validation rules

Edit the current rule in place and update the `Last verified` date. Do not append a chronological changelog. Keep repository evidence and user-confirmed decisions separate from proposals.

After changing the repository copy of this Skill, run the Skill validator, rebuild the downloadable package, and synchronize the installed copy only when the user wants the current Codex environment updated.
