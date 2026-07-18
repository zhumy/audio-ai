# Audio AI Course Blueprint

Last verified: 2026-07-18

This file is the current course-building contract. Update the current statements in place when the user confirms a new direction. Do not use it as a changelog.

## 1. Course identity

`Audio AI for Human and Machine` explains the same sound event across connected physical, signal, perceptual, computational, and evaluative views. The course should answer both:

- How do humans receive, organize, and judge sound?
- How do machines capture, represent, learn from, and evaluate sound?

The course is student-facing and textbook-like. It must remain accurate, continuous, derivation-aware, interactive where useful, and navigable as a connected body of knowledge.

## 2. Course-level narrative

The durable conceptual route is:

`sound source and medium -> acoustic field -> electroacoustic transduction -> digital sampling -> time/space/frequency representations -> human auditory organization -> engineered features and learned representations -> machine listening tasks -> enhancement/generation/interactions -> perceptual and task evaluation -> integrated project`

Use five phases to explain the whole course:

1. **Physical world** — A source vibrates; air parcels oscillate locally; pressure disturbance and energy propagate.
2. **Measurable signal** — A microphone converts local pressure into voltage; an ADC produces sampled and quantized sequences.
3. **Representations** — Time, space, and frequency are linked views of the same field rather than unrelated topics.
4. **Human and machine interpretation** — Auditory organization, features, statistical learning, deep models, and multimodal models assign structure and meaning.
5. **Evidence and use** — Experiments, metrics, listening tests, error analysis, and projects determine whether the system actually works.

Every chapter must declare which input it receives from the preceding phase, what transformation it teaches, and what later chapter consumes the result.

## 3. Teaching paths are configurable

The current syllabus may use a fixed-term schedule, but week count and order are not durable information architecture. Treat them as one configurable teaching path rather than as Chapter identity.

- Keep authoritative Chapter URLs semantic and independent of schedule order.
- Let a Session organize the syllabus topics selected for one learning route; do not make it the owner of those topics.
- Preserve public legacy week URLs with compatibility links when names change, but do not require new Session IDs to contain a week number.
- Update the current path or add an archived path when the syllabus changes. Do not duplicate the whole course tree for a new term.
- Do not freeze unfinished teaching units into final detail. Publish only relationships and destinations that are supported by existing authoritative content.

## 4. Current chapter route

`course-data/paths/current.json` currently defines the published foundation route:

| Chapter | Receives | Core transformation | Provides |
|---|---|---|---|
| 波形与时域 | physical pressure and transduction | continuous change to sampled waveform and time features | calibrated time-domain signal and temporal cues |
| 频域与傅里叶 | waveform and periodicity | time signal to complex-frequency projection, DFT, spectrum, STFT | spectral and time-frequency representations |
| 听觉与滤波器组 | acoustic spectrum | physical frequency to perceptual organization and auditory scales | critical-band, equal-loudness, Mel/filterbank understanding |
| 对数频率与 MIDI | frequency and auditory pitch | Hz to ratios, octaves, semitones, and symbolic pitch | music-oriented pitch representation |
| Project 声音事件分类 | time, spectrum, and auditory features | representations to interpretable prediction | task evaluation, error analysis, and reflection |

Session pages may organize material from several source Chapters. They must link to the unchanged source Chapters and identify where definitions, formulas, derivations, examples, and experiments are owned.

### Session/Chapter boundary and relationship-navigation contract

A Session is the syllabus-driven orchestration and learning-route layer. It explains the macro relationship among selected topics, their prerequisite/successor roles, and the reason for moving from one view or method to another. It does not explain the concrete knowledge owned by a Chapter.

- Identify every canonical Chapter and relevant semantic anchor before editing a Session.
- Keep definitions, formulas, derivations, examples, interactions, and detailed explanations in their authoritative Chapters.
- Do not manually copy, shorten, paraphrase, embed, or build-time compose Chapter knowledge into a Session.
- Use Session prose only to explain grouping, sequence, contrast, dependency, transformation, and later use.
- Link visibly to each complete Chapter and use exact semantic anchors when a relationship refers to a specific definition, formula, derivation, example, or experiment.
- Provide a sticky or floating relationship-navigation layer that makes prerequisite, alternate-view, current, and successor jumps continuously available.
- Use real `<a href>` links. Hover/focus previews may add context, but link meaning must be visible without hover and remain usable by keyboard and touch.
- Make the linked Chapter provide a clear route back to the relevant Session or course overview when the relationship is part of the published path.
- Treat broken relationship links, inaccessible floating navigation, navigation that covers content, and duplicated Chapter knowledge as release blockers.

For the current sound-physics Session, the user-confirmed canonical topic pages are:

- `chapters/time-domain-audio/index.html` — sound physics, transduction, sampling, waveform, and time-domain content;
- `chapters/spatial-acoustic-features/index.html` — spatial field, particle velocity, gradients, differential arrays, and Ambisonics;
- `chapters/frequency-domain-processing/index.html` — convolution, complex sinusoids, Fourier transform, DFT, and STFT.

`session/sound-physics-sampling-spectrum/index.html` must provide the physical starting point, the macro relationship of the complete field `p(r,t)` across time, space, and frequency, and visible contextual jumps to the three canonical pages above. It must not explain or reproduce their concrete knowledge and must not become a shortened replacement for them.

## 5. Required chapter narrative

Each student chapter must make this sequence visible:

1. **先看全貌** — one question, one phenomenon, or one task that motivates the chapter.
2. **研究对象** — define what varies, what is held fixed, variables, units, coordinate/direction conventions, and measurement chain.
3. **基本原理** — start from basic laws or operation definitions.
4. **关键推导** — show a complete reusable derivation, with assumptions and boundary conditions.
5. **表示或方法** — connect the derivation to an audio representation, algorithm, model, or auditory mechanism.
6. **怎么做** — provide an interactive observation, worked example, lab, or implementation route.
7. **怎么判断** — include self-checks, measurable outcomes, failure cases, and validity boundaries.
8. **学习路线** — state prerequisite links, formula reuse links, labs, successor chapters, and project use.

These are narrative roles, not mandatory literal headings. Adapt labels to the chapter topic.

## 6. Mainline navigation contract

Every substantial student HTML page must include a local outline near the top:

```html
<nav class="chapter-outline" aria-label="本章主线" data-course-outline>
  <a href="#overview">先看全貌</a>
  <a href="#object">研究对象</a>
  <a href="#principle">原理</a>
  <a href="#derivation">关键推导</a>
  <a href="#practice">怎么做</a>
  <a href="#evaluation">怎么判断</a>
  <a href="#route">学习路线</a>
</nav>
```

Rules:

- Use 5-8 links selected from actual narrative turning points.
- Use `<a href="#...">`, not JavaScript-only controls.
- Use short labels that retain meaning when read as a row.
- Keep DOM order equal to visual and reading order.
- Prefer one row on desktop; allow horizontal scrolling on mobile.
- Give each target enough scroll margin below sticky headers.
- Keep the outline sticky while the learner scrolls. Define its `position`, `top`, stacking, backdrop, shadow, light/dark colors, link typography, link padding, borders, and interaction treatment in `assets/css/chapter.css`; Chapter-local CSS may only adjust container width, margin, and narrow-screen overflow.
- Treat unreadable outline contrast, a non-sticky outline, a locally overridden protected outline property, or a target heading hidden beneath the outline as a release blocker.
- Mark the active section only as progressive enhancement; navigation must work without JavaScript.
- Keep the course-global header separate.
- On long pages, optionally repeat a compact outline or previous/next route at the bottom.

The reference site `https://eai.devapps.aispeech.com.cn/` demonstrates the desired information behavior: a concise top row maps the whole page through stable anchors such as “先看全貌—是什么—技术演进—原理—关键技术—怎么做—怎么验收—学习路线.” Reuse the behavior, not the subject labels or visual skin.

## 7. Knowledge-link contract

Links must express relationships, not merely destinations.

| Link type | Visible cue | Example purpose |
|---|---|---|
| prerequisite | 前置知识 | return to sampling before DFT |
| canonical definition | 复用定义 | return to the unique SPL or RMS definition |
| canonical derivation | 复用公式 | return to the wave or momentum equation |
| alternate view | 换一个维度 | move among time, space, and frequency views |
| lab | 进入实验 | inspect a waveform, spectrum, or auditory effect |
| successor | 用于后续 | explain how a representation feeds a later model |
| project | 进入项目 | apply several chapters in an integrated task |
| route | 回到全貌 | return to syllabus/session map |

Prefer contextual links beside the explanation. Keep previous/next cards as a secondary convenience.

For Session pages, also keep the topic relationship map available through accessible sticky or floating navigation. The floating layer supplements contextual links; it never replaces visible prose, keyboard navigation, touch access, or exact semantic destinations.

## 8. Time-space-frequency integration

Use the complete field `p(r,t)` as the common object:

- **Time domain:** fix position and observe change over `t`; core operator `partial/partial t`.
- **Space domain:** fix time or use single-frequency steady state and compare position; core operators `grad`, divergence, and Laplacian.
- **Frequency domain:** project time variation onto complex exponential frequency; for a single-frequency component, `partial/partial t` becomes multiplication by `j omega`.

The acoustic wave equation visibly connects time curvature and spatial curvature. The frequency-domain momentum equation visibly connects `j omega` from time differentiation with the pressure gradient from space. Do not teach the three views as independent lists.

## 9. Formula and notation ownership

- Put a notation registry before the first dense derivation.
- Use one symbol for one meaning within an authoritative Chapter and its linked course context.
- Separate total instantaneous pressure, acoustic perturbation, sampled sequence, and complex amplitude.
- Give each core formula a stable `eq-*` anchor.
- Fully render a core formula once; later locations link back and show only the new consequence.
- Preserve complete optional derivations in expandable detail or appendices.
- Keep assumptions and validity boundaries adjacent to the derived result.
- Use native MathML and shared CSS.

## 10. Student/teacher boundary

Student HTML includes connected teaching content, derivations, figures, interaction, examples, boundary cases, and self-checks. It excludes minute schedules, teacher-only prompts, classroom contingencies, and lesson-management notes. Store those in `notes.md` and `script.md`.

## 11. Course visual-system contract

Use `assets/css/theme.css` as the canonical source of shared `--course-*` tokens.

- Chapters and Sessions share the same sans-serif stack, body/small/label/card-title text-size tokens, dark/light background and surface family, ink and muted text, cyan primary, gold secondary, coral alert, and line color.
- Explanatory card paragraphs use `--course-text-body-size`; captions and secondary derivation notes may use `--course-text-small-size`; only controls, metadata, and diagram labels use `--course-text-label-size`.
- Select card title and subtitle tokens by visual role rather than by the literal `h3`/`h4` element name.
- A Session may use a warmer background balance, broader relationship cards, and a distinct route dock to communicate its higher orchestration level, but it must remain recognizably part of the same course.
- Authoritative display MathML uses `--course-math-display-size`; dense or secondary MathML uses `--course-math-compact-size`; inline MathML follows surrounding text.
- Every display-equation wrapper, including page-specific wrappers such as `.fp-equation`, explicitly uses `--course-font-math` and a shared math-size token; never rely on the browser-default `math` font or 16px size.
- Long MathML keeps its intrinsic width with `width/min-width: max-content`, is centered when it fits, aligns to the inline start when it needs mobile scrolling, and scrolls only inside its equation wrapper; clipping glyphs or creating whole-page overflow is a release blocker.
- Cyan represents the primary signal, response, wave, or coordinate. Gold represents phase, polarity contrast, or emphasis. Coral is reserved for warnings, incident rays, or error states. Axes and annotations remain neutral.
- Page-local body font stacks, duplicate global palettes, hardcoded display-equation sizes, and unrelated animation palettes are release blockers.

## 12. Rendered acceptance gate

A student page is not complete when only HTML structure, links, and script syntax pass. Before release, open the actual page in a browser and apply `references/visual-acceptance.md`.

Required acceptance evidence includes:

- rendered inspection at desktop, compact desktop, and mobile widths;
- both light and dark themes;
- representative collapsed and expanded derivations;
- MathML, canvas, navigation, and interactive controls;
- computed checks for page-level horizontal overflow and suspicious element overflow;
- no release-blocking overlap, clipping, unreadable contrast, compressed one-character columns, broken interaction, or severely unbalanced wide-screen layout.

When an independent agent is available, use it for the final review without giving it the author's suspected defects. Resolve all P0 and P1 findings and repeat the failed state before declaring the page complete.

## 13. Maintenance sources and evidence status

Confirmed repository truth:

- The repository root is the static publishing root.
- `course-data/paths/current.json` is the machine-readable current route.
- `syllabus/index.html` and `session/index.html` are human-readable route entry points.
- A particular week count or schedule is one configurable course path rather than durable site architecture.
- Shared CSS/JS should live under `assets/` rather than being duplicated by every chapter.

User-confirmed design decisions:

- The whole course and every chapter need an explicit narrative.
- Each substantial HTML page needs a visible row of anchor links near the top or bottom, with top preferred.
- Course concepts must connect through clickable links.
- Content must be continuous and accurate, with derivations rather than concept-only lists.
- Core formulas and variable definitions must be reusable and consistent rather than repeated.
- Every substantial student page must pass real-browser visual acceptance; structural audit success alone is insufficient.
- Chapter URLs should migrate toward stable semantic topic names independent of teaching order, with compatibility for already-published URLs.
- A Session organizes and processes syllabus relationships at the macro level; it does not teach or reproduce the concrete knowledge owned by Chapters.
- Every Session needs visible contextual jumps and an accessible sticky or floating relationship-navigation layer connecting prerequisite, current, alternate-view, and successor Chapters.

Proposal pending gradual adoption:

- Add automated active-section highlighting only after the static anchor structure is stable.
