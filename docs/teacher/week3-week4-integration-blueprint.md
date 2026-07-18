# WEEK3/WEEK4 integration blueprint

Source courseware:

- `C:\Users\chunyang.xu\Documents\2026 苏州大学\03 课程\01 人与机器听觉\html_courseware\week03-auditory-psychoacoustics\index.html`
- `C:\Users\chunyang.xu\Documents\2026 苏州大学\03 课程\01 人与机器听觉\html_courseware\week04-spatial-auditory-scene-features\index.html`

This is a planning document for bringing the current WEEK3 and WEEK4 draft courseware into the student-facing course site. It is not itself a published route and should not be linked from `course-data/paths/current.json`.

## Integration principle

The source files are week-shaped teaching pages. The target repository is a connected course site where:

- `chapters/` owns definitions, formulas, derivations, worked examples, interactive observations, validity boundaries, and self-checks.
- `session/` owns syllabus-driven macro organization, prerequisite/current/successor relationships, contextual jumps, and teaching-route flow.
- Week numbers are teaching-path metadata, not canonical URLs.

Therefore, do not import the source pages as `week03/` and `week04/` canonical directories. Split them into semantic Chapters, then build Session pages that point to exact Chapter anchors.

## Proposed content map

| Source | Target content ID | Type | Proposed URL | Status at first import | Role |
|---|---|---|---|---|---|
| WEEK3 | `auditory-system-psychoacoustics` | chapter | `chapters/auditory-system-psychoacoustics/` | `draft` | Human auditory pathway, cochlear frequency mapping, thresholds, loudness, critical bands, masking, hearing-health boundaries |
| WEEK3 | `pitch-timbre-symbolic-audio` | chapter | `chapters/pitch-timbre-symbolic-audio/` | `draft` | Pitch, timbre, harmonic structure, missing fundamental, log-frequency ratios, semitone/MIDI bridge |
| WEEK3 | `auditory-perception-route` | session | `session/auditory-perception-route/` | `draft` | Route from spectrum to perception, then to perceptual features and evaluation |
| WEEK4 | `spatial-hearing-scene-analysis` | chapter | `chapters/spatial-hearing-scene-analysis/` | `draft` | Binaural cues, HRTF, IACC, precedence effect, auditory scene analysis, complex sound lateralization |
| WEEK4 | `audio-feature-representations` | chapter | `chapters/audio-feature-representations/` | `draft` | STFT/Mel/filterbank feature choices, time-frequency tradeoff, spatial/scene cues for machine listening |
| WEEK4 | `spatial-scene-feature-route` | session | `session/spatial-scene-feature-route/` | `draft` | Route from physical sound field and perception to scene organization and machine features |

Keep all new IDs semantic. If the syllabus later needs "WEEK3" or "WEEK4" links, create compatibility/teaching-path entries that redirect or link to these semantic pages.

## Course-level narratives

### Auditory perception route

Previous knowledge -> current transformation -> next use:
`time-domain waveform and frequency-domain spectrum -> human auditory system transforms physical pressure, frequency, and spectrum into perceptual organization -> machine features, perceptual coding, hearing evaluation, and task metrics reuse these perceptual constraints`.

Chapter-level narrative:
`hearing is not a passive microphone -> sound pressure, frequency, spectrum, and auditory organs become the objects -> outer/middle/inner ear and cochlear mechanics create selective frequency response -> thresholds, loudness, critical bands, and masking become perceptual representations -> interactive listening/plots show audibility and masking -> boundaries include hearing loss, device compensation, and simplified psychoacoustic models`.

### Pitch/timbre symbolic audio

Previous knowledge -> current transformation -> next use:
`spectrum, harmonics, and auditory pitch sensitivity -> frequency relations become perceived pitch, timbre, and symbolic musical units -> music/audio AI, MIDI, pitch tracking, synthesis, and sound-event features reuse the mapping`.

Chapter-level narrative:
`two sounds can share frequency content or pitch yet sound different -> fundamental frequency, harmonic amplitudes, envelope, and semitone distance are the objects -> ratios and harmonic organization explain pitch and timbre -> log-frequency, note names, and MIDI provide a representation -> synthesis widgets demonstrate pitch/timbre changes -> boundaries include missing fundamental, inharmonicity, and non-musical sounds`.

### Spatial hearing and scene analysis

Previous knowledge -> current transformation -> next use:
`sound field p(r,t), spatial gradients, and spectrum -> human listeners infer direction, width, externalization, distance, and objects from binaural and spectral cues -> spatial audio rendering, scene analysis, source separation, and event detection use those cues`.

Chapter-level narrative:
`the same waveform can be heard as coming from a place and belonging to an object -> source direction, ear signals, delay, level, correlation, and reflections are the objects -> ITD/ILD, HRTF, IACC, precedence, and grouping principles explain organization -> spatial and scene features become representations -> interactive diagrams demonstrate localization and grouping -> boundaries include individual HRTF mismatch, reverberation, visual bias, and simplified cue models`.

### Audio feature representations

Previous knowledge -> current transformation -> next use:
`waveform, spectrum, auditory bands, and scene cues -> engineering chooses frame, frequency scale, channel, and spatial descriptors as model inputs -> sound-event classification and later machine-listening tasks reuse these representations`.

Chapter-level narrative:
`a model cannot consume "sound" directly without a representation choice -> frames, spectra, Mel bands, channels, spatial cues, and labels are the objects -> windowing, filterbanks, and feature design expose tradeoffs -> waveform/STFT/Mel/spatial-feature views become methods -> feature widgets compare time/frequency/task behavior -> boundaries include task mismatch, lost phase/spatial detail, and evaluation leakage`.

## Target chapter outlines and anchors

### `chapters/auditory-system-psychoacoustics/`

Proposed outline:

| Anchor | Label | Source material | Ownership notes |
|---|---|---|---|
| `#overview` | 先看全貌 | WEEK3 hero and learning path | State why physical sound is transformed by the ear before machines imitate or exploit perception |
| `#auditory-chain` | 听觉通路 | `#ear`, `#outer-ear`, `#middle-ear`, `#inner-ear` | Own the ear-pathway explanation and stable anatomy anchors |
| `#cochlear-map` | 耳蜗频率图 | cochlea interactive SVG and image | Own tonotopy, Mel bridge, and cochlear map interaction |
| `#thresholds` | 听阈与健康 | `#threshold`, `#hearing-health` | Own audibility boundaries, audiogram, hearing-loss/device context |
| `#loudness` | 响度 | `#loudness` | Own equal-loudness explanation and interactive curve |
| `#critical-bands` | 临界频带 | `#band` | Own ERB/critical-band explanation and bandwidth interaction |
| `#masking` | 掩蔽 | `#masking`, `#mp3` | Own masking model and link MP3 as application, not as whole coding chapter unless later expanded |
| `#route` | 学习路线 | closing route | Link back to frequency-domain processing and forward to pitch/timbre and feature representations |

Important relationship links:

- 前置知识: `chapters/frequency-domain-processing/#stft`
- 前置知识: `chapters/time-domain-audio/#auditory-time`
- 复用定义: SPL should link to the authoritative sound-pressure/SPL anchor once it exists in `time-domain-audio`
- 用于后续: `chapters/pitch-timbre-symbolic-audio/`
- 用于后续: `chapters/audio-feature-representations/`

### `chapters/pitch-timbre-symbolic-audio/`

Proposed outline:

| Anchor | Label | Source material | Ownership notes |
|---|---|---|---|
| `#overview` | 先看全貌 | WEEK3 `#pitch`, `#timbre` questions | Explain why frequency is related to, but not equal to, pitch |
| `#object` | 研究对象 | pitch frequency, harmonics, envelope controls | Define `f0`, harmonic index, amplitude, envelope, semitone distance |
| `#log-frequency` | 对数频率 | semitone/MIDI controls | Own octave, semitone, equal temperament, note/MIDI mapping |
| `#pitch-perception` | 音高机制 | missing fundamental widget | Explain harmonic grouping and missing fundamental |
| `#timbre` | 音色 | harmonic/envelope widget | Own timbre as spectral-envelope/time-envelope interaction |
| `#synthesis-lab` | 合成观察 | pitch/timbre audio buttons and canvases | Student-facing interactive synthesis |
| `#limits` | 边界 | source caveats | Inharmonic, noisy, speech, and culturally variable pitch systems |
| `#route` | 学习路线 | closing tasks | Link to psychoacoustics, audio features, synthesis/generation later |

Important relationship links:

- 前置知识: `chapters/frequency-domain-processing/#fourier`
- 复用定义: `chapters/auditory-system-psychoacoustics/#cochlear-map`
- 用于后续: `chapters/audio-feature-representations/`
- 用于后续: future music/synthesis/generation chapter

### `chapters/spatial-hearing-scene-analysis/`

Proposed outline:

| Anchor | Label | Source material | Ownership notes |
|---|---|---|---|
| `#overview` | 先看全貌 | WEEK4 opening | Connect one waveform to location/object perception |
| `#binaural-cues` | ITD / ILD | `#binaural` | Own definitions, assumptions, and the binaural cue widget |
| `#hrtf` | HRTF | `#hrtf`, `#datasets` | Own HRTF mechanism and SOFA/dataset engineering note |
| `#iacc` | IACC | `#iacc` | Own correlation/width explanation and interaction |
| `#precedence` | 优先效应 | `#precedence` | Own direct/reflected sound organization and delay boundaries |
| `#scene-analysis` | 场景组织 | `#asa`, `#complex` | Own auditory scene grouping principles, distance, visual influence |
| `#practice` | 互动观察 | SVG/canvas widgets | Keep widgets accessible and visually verified |
| `#route` | 学习路线 | closing | Link to physical spatial field and feature representations |

Important relationship links:

- 前置知识: `chapters/spatial-acoustic-features/#field`
- 换一个维度: `chapters/spatial-acoustic-features/#differential`
- 换一个维度: `chapters/spatial-acoustic-features/#vector-foa`
- 前置知识: `chapters/auditory-system-psychoacoustics/#cochlear-map`
- 用于后续: `chapters/audio-feature-representations/`
- 用于后续: `projects/sound-event-classification/`

### `chapters/audio-feature-representations/`

Proposed outline:

| Anchor | Label | Source material | Ownership notes |
|---|---|---|---|
| `#overview` | 先看全貌 | WEEK4 `#features` | Explain representation choice as the bridge to machine listening |
| `#frames` | 分帧与窗长 | feature widget controls | Reuse STFT anchor instead of re-deriving STFT |
| `#spectral-features` | 频谱特征 | WEEK4 feature panel | Link to frequency-domain processing |
| `#auditory-features` | 听觉频带 | Mel bands, psychoacoustic links | Link to critical bands/Mel; do not duplicate psychoacoustic definitions |
| `#spatial-features` | 空间特征 | spatial/scene cue links | Link to ITD/ILD/HRTF/IACC anchors |
| `#task-fit` | 任务匹配 | classification/detection hints | Connect representation choices to tasks |
| `#feature-lab` | 特征实验 | feature canvas | Student-facing interactive feature comparison |
| `#route` | 学习路线 | route cards | Link to project and later ML chapters |

Important relationship links:

- 前置知识: `chapters/frequency-domain-processing/#stft`
- 复用定义: `chapters/auditory-system-psychoacoustics/#critical-bands`
- 复用定义: `chapters/spatial-hearing-scene-analysis/#binaural-cues`
- 进入项目: `projects/sound-event-classification/`

## Target session outlines

### `session/auditory-perception-route/`

Purpose: organize the teaching route from physical/digital representations into human perception without teaching the concrete psychoacoustic content.

Suggested relationship navigation:

- 前置知识: `chapters/time-domain-audio/#auditory-time`
- 前置知识: `chapters/frequency-domain-processing/#stft`
- 当前主题: `chapters/auditory-system-psychoacoustics/#auditory-chain`
- 当前主题: `chapters/auditory-system-psychoacoustics/#loudness`
- 当前主题: `chapters/auditory-system-psychoacoustics/#critical-bands`
- 换一个表示: `chapters/pitch-timbre-symbolic-audio/`
- 用于后续: `chapters/audio-feature-representations/`

Session prose should explain:

- why spectrum alone is not enough to predict what people hear;
- why auditory constraints matter for compression, feature design, and evaluation;
- how pitch/timbre continues from psychoacoustics into symbolic and generative audio.

Session prose must not include:

- equal-loudness formulas or plotted data as a substitute for the Chapter;
- full ERB/Mel definitions;
- masking threshold derivations or MP3 coding details.

### `session/spatial-scene-feature-route/`

Purpose: organize the teaching route from physical spatial field to human localization/scene organization and then to machine features.

Suggested relationship navigation:

- 前置知识: `chapters/spatial-acoustic-features/#field`
- 前置知识: `chapters/frequency-domain-processing/#stft`
- 当前主题: `chapters/spatial-hearing-scene-analysis/#binaural-cues`
- 当前主题: `chapters/spatial-hearing-scene-analysis/#hrtf`
- 当前主题: `chapters/spatial-hearing-scene-analysis/#scene-analysis`
- 换一个维度: `chapters/spatial-acoustic-features/#vector-foa`
- 用于后续: `chapters/audio-feature-representations/#spatial-features`
- 进入项目: `projects/sound-event-classification/`

Session prose should explain:

- why pressure field and microphone arrays are not the same layer as perceived source direction;
- why scene organization bridges human hearing and machine event detection;
- how feature representations decide what information survives into the model.

Session prose must not include:

- ITD/ILD equations or cue definitions as standalone teaching content;
- HRTF/SOFA dataset explanations beyond relationship-level context;
- ASA examples that replace the Chapter's own examples.

## Source asset migration

### WEEK3 assets

| Source asset | Proposed target | Notes |
|---|---|---|
| `assets/ear-structure/outer-middle-inner-ear.png` | `chapters/auditory-system-psychoacoustics/media/outer-middle-inner-ear.png` | Keep alt text and verify license/source before publication |
| `assets/ear-structure/pinna.jpg` | `chapters/auditory-system-psychoacoustics/media/pinna.jpg` | Use only if it materially supports outer-ear filtering |
| `assets/ear-structure/middle-ear.png` | `chapters/auditory-system-psychoacoustics/media/middle-ear.png` | Large file; optimize before publish |
| `assets/ear-structure/cochlea-frequency.jpg` | `chapters/auditory-system-psychoacoustics/media/cochlea-frequency.jpg` | Pair with interactive tonotopy widget |
| `assets/threshold/hearing-threshold-curve.png` | `chapters/auditory-system-psychoacoustics/media/hearing-threshold-curve.png` | Prefer source attribution or replace with generated/derived chart |
| `assets/hearing-health/audiogram.jpg` | `chapters/auditory-system-psychoacoustics/media/audiogram.jpg` | Teaching support, not shared definition |
| `assets/hearing-health/hearing-test-room.webp` | `chapters/auditory-system-psychoacoustics/media/hearing-test-room.webp` | Consider notes-only if too clinical for main flow |
| `assets/hearing-health/hearing-aid-types.avif` | `chapters/auditory-system-psychoacoustics/media/hearing-aid-types.avif` | Put detailed device taxonomy in `notes.md` unless central |
| `assets/hearing-health/cochlear-implant.jpg` | `chapters/auditory-system-psychoacoustics/media/cochlear-implant.jpg` | Use as boundary/application, not the main psychoacoustics path |

WEEK3 inline interactions to extract:

- cochlear tonotopic SVG: move to `assets/js/auditory-psychoacoustics.js` or a chapter-local `chapter.js` only if no reuse is expected.
- audiogram/WDRC SVG: consider a hearing-health subsection and keep device details in `notes.md`.
- equal-loudness SVG: make the data/model assumptions explicit.
- ERB/critical-band SVG: share the ERB helper if feature pages need it.
- pitch canvas and timbre canvas: move to `pitch-timbre-symbolic-audio`.
- masking SVG/audio: move to `auditory-system-psychoacoustics`; link MP3 as application.

### WEEK4 assets

WEEK4 has no separate source asset folder in the inspected directory. It contains inline SVG/canvas interactions and two preview PNG files:

- `week04-preview.png`
- `week04-mobile-preview.png`

Do not import preview PNGs as student content. Use them only as visual reference while rebuilding the page with shared course CSS.

WEEK4 inline interactions to extract:

- binaural cue SVG: `spatial-hearing-scene-analysis/#binaural-cues`
- HRTF spectrum SVG and SOFA dataset panel: `spatial-hearing-scene-analysis/#hrtf`
- IACC canvas: `spatial-hearing-scene-analysis/#iacc`
- precedence timeline SVG: `spatial-hearing-scene-analysis/#precedence`
- ASA grouping SVG: `spatial-hearing-scene-analysis/#scene-analysis`
- feature representation canvas: `audio-feature-representations/#feature-lab`

## Shared data and notation updates

Before publishing, update shared registries in one reviewed change:

| Registry | Candidate additions |
|---|---|
| `course-data/glossary.json` | sound pressure level, audiogram, hearing threshold, loudness, phon, sone, Mel scale, critical band, ERB, masking, pitch, timbre, fundamental frequency, missing fundamental, ITD, ILD, HRTF, IACC, precedence effect, auditory scene analysis, MIDI |
| `course-data/notation.json` | `L_p`, `p_0`, `f_0`, `n_midi`, `tau`, `Delta L`, `h_L(t,theta,phi)`, `h_R(t,theta,phi)`, `rho_LR(tau)`, `IACC` |
| `course-data/units.json` | `dB SPL`, `phon`, `sone`, `mel`, `Bark`, `ERB`, `degree`, `ms` |

Do not silently resolve definition conflicts. If any old courseware definition differs from a current Chapter or registry entry, report the passages and classify the difference before editing the shared registry.

## Student/teacher split

Move to student Chapter HTML:

- conceptual explanations needed for self-study;
- stable definitions and formula anchors;
- interactive observations that clarify a reusable concept;
- self-checks and validity boundaries.

Move to `notes.md`:

- minute-by-minute class timing;
- teacher prompts;
- classroom discussion variants;
- source/image attribution notes;
- implementation caveats and pending review items.

Move to `script.md`:

- spoken transitions;
- live-demo instructions;
- recommended questions before revealing answers;
- contingency paths if audio devices or browser autoplay fail.

## Suggested implementation sequence

Each step should end with a local git commit.

1. `plan: add week3 week4 integration blueprint`
   - Add this planning document only.
2. `data: register week3 week4 draft content`
   - Add draft catalog entries.
   - Do not add to `course-data/paths/current.json` yet.
3. `chapter: scaffold auditory psychoacoustics`
   - Create semantic anchors, `notes.md`, and `script.md`.
   - Migrate only core auditory pathway, cochlear map, thresholds, loudness, critical bands, and masking.
4. `chapter: scaffold pitch timbre symbolic audio`
   - Move pitch/timbre/MIDI material out of the psychoacoustics source.
5. `chapter: scaffold spatial hearing scene analysis`
   - Build ITD/ILD, HRTF, IACC, precedence, and ASA as one perception chapter.
6. `chapter: scaffold audio feature representations`
   - Move the machine feature part out of WEEK4 and connect it to STFT/Mel/spatial cues.
7. `session: add auditory and spatial scene routes`
   - Add Session pages with relationship navigation only.
8. `route: publish reviewed week3 week4 path`
   - Update `syllabus/index.html`, `session/index.html`, `catalog.json`, and `current.json` only after structural audit and browser acceptance pass.

## Validation gate before publication

For every new or edited student-facing page:

- run `python .agents/skills/build-audio-ai-course/scripts/audit_course_pages.py . --strict`;
- verify all local links and exact anchors;
- inspect desktop, compact desktop, tablet, and mobile viewports;
- inspect light and dark themes;
- interact with every slider, button, canvas, and SVG state;
- confirm no page-level horizontal overflow;
- confirm sticky `chapter-outline` and Session relationship navigation do not cover content;
- verify formulas use MathML and shared course math tokens;
- keep draft content out of `course-data/paths/current.json` until it passes.

For this planning document only, structural audit is sufficient because no student-facing HTML or route has changed.
