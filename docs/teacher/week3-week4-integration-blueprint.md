# WEEK3/WEEK4 source-first integration blueprint

This document is based only on the current WEEK3 and WEEK4 draft courseware supplied by the teacher. It does not use the teaching syllabus, current public path order, or any week plan outside the two source pages as content evidence.

Source courseware:

- `C:\Users\chunyang.xu\Documents\2026 苏州大学\03 课程\01 人与机器听觉\html_courseware\week03-auditory-psychoacoustics\index.html`
- `C:\Users\chunyang.xu\Documents\2026 苏州大学\03 课程\01 人与机器听觉\html_courseware\week04-spatial-auditory-scene-features\index.html`

This is a teacher/maintainer planning document. It should not be linked from the public student route until the target pages exist and pass review.

## Boundary

Architecture rule retained:

- Chapter owns concrete knowledge: definitions, formulas, examples, interactions, detailed explanation, and validity boundaries.
- Session owns organization: why these source sections belong together, how to move among them, and what order is recommended.
- Semantic URLs are still preferred. Week numbers may be kept as source labels or archived teaching-path metadata, but not as the long-term identity of student-facing Chapters.

Content-source rule for this revision:

- Use only the WEEK3 and WEEK4 source page titles, section headings, anchors, images, SVGs, canvases, controls, and closing tasks as evidence.
- Do not infer missing topics from the syllabus or from the existing public route.
- Do not create prerequisite/successor claims that are not visible in the two source pages. When a later integration needs to connect to existing site pages, do that in a separate reviewed step.

## Source inventory

### WEEK3 source page

Title: `第3次课 听觉系统与心理声学基础`

Visible source anchors:

| Source anchor | Source label/heading | Main content observed |
|---|---|---|
| `#flow` | 本节课的学习路径 | Time structure for the draft class |
| `#ear` | 外耳、中耳、内耳：声音进入听觉系统的整体路径 | Whole auditory pathway overview |
| `#outer-ear` | 外耳：收集声波与方向相关滤波 | Pinna/outer-ear image and explanation |
| `#middle-ear` | 中耳：鼓膜、听小骨与阻抗匹配 | Middle-ear image and impedance matching explanation |
| `#inner-ear` | 内耳与耳蜗频率感知：人耳中的频率地图 | Cochlea image, tonotopic SVG, frequency/Mel readout |
| `#ear-legacy` | 人耳构造：不是被动麦克风 | Legacy/hidden alternate auditory-chain content |
| `#cochlea-legacy` | 耳蜗频率分析：一条弯曲的频率地图 | Legacy/hidden cochlea interaction |
| `#pathway-legacy` | 听觉通路与经验：信号进入大脑以后才成为“听见” | Neural coding, attention, experience |
| `#threshold` | 听阈曲线：从最小可听到不适与损伤风险 | Hearing-threshold image and audibility boundary |
| `#hearing-health` | 听力健康：测试、听损与辅听设备 | Hearing-test room, audiogram, hearing aid, cochlear implant |
| `#loudness` | 响度：同一声压不等于同一听感 | Equal-loudness SVG with phon/frequency controls |
| `#band` | 临界频带：频谱不是无限精细地被感知 | Critical-band/ERB SVG with center-frequency control |
| `#pitch` | 音高 Pitch：频率相关，但不等于频率 | Equal temperament, piano/MIDI controls, pitch canvas |
| `#timbre` | 音色：同一音高为什么听起来不像同一种声音 | Harmonic/envelope controls and timbre canvas |
| `#masking` | 掩蔽：听不见不代表不存在 | Masking SVG, masker/target controls, audio buttons |
| `#mp3` | 从掩蔽到 MP3：把“听不出来”变成工程能力 | MP3 application and encoding-flow SVG |
| `#closing` | 形成性检查与课后任务 | Quiz, closing takeaways, post-class tasks |

WEEK3 media and interactions:

- Images: outer/middle/inner ear, pinna, middle ear, cochlea frequency map, hearing threshold curve, test room, audiogram, hearing aids, cochlear implant.
- SVG interactions: cochlear map, audiogram/WDRC, equal-loudness curve, critical-band/ERB curve, masking threshold, MP3 encoding flow.
- Canvas/audio interactions: pitch waveform/harmonic spectrum, timbre waveform/envelope/harmonic spectrum, play buttons for pitch/timbre/masking examples.

### WEEK4 source page

Title: `第四周 空间听觉、场景组织与音频特征表示`

Visible source anchors:

| Source anchor | Source label/heading | Main content observed |
|---|---|---|
| `#flow` | 两小时的教学路径 | Time structure for the draft class |
| `#opening` | 同一条波形，为什么能听出空间和对象？ | Opening listening question |
| `#binaural` | Binaural cues：ITD 与 ILD 如何给出左右方向 | Binaural cue quick view and ITD/ILD SVG |
| `#hrtf` | HRTF：耳廓、耳道与个性化空间音频 | Spatial rendering chain and HRTF spectral SVG |
| `#datasets` | 开放 HRTF 数据格式与数据集：以 SOFA 为核心 | SOFA object panel and HRTF dataset choices |
| `#iacc` | IACC：双耳相关性如何影响声像宽度和空间感 | IACC explanation and width canvas |
| `#precedence` | The Precedence Effect：有反射时为什么定位仍然稳定 | Direct/reflected sound timeline SVG |
| `#asa` | Auditory Scene Analysis：混合声如何被组织成对象 | Grouping cue controls and ASA SVG |
| `#complex` | 复杂声音、距离感知与视觉对定位的影响 | Complex lateralization, distance, visual influence |
| `#features` | 从空间与场景回到机器听觉特征表示 | Feature representation choices and feature canvas |
| `#closing` | 收束、小测与课后任务 | Closing takeaways, quiz, post-class tasks |

WEEK4 media and interactions:

- Inline SVG interactions: binaural ITD/ILD position diagram, HRTF spectral-cue chart, precedence timeline, ASA grouping diagram.
- Canvas interactions: IACC waveform/width demonstration, audio feature representation canvas.
- Preview images present in the source folder: `week04-preview.png`, `week04-mobile-preview.png`. Treat them as visual reference only, not student content.

## Source-derived target map

The following targets are derived from the two source pages only. Status should start as `draft` because none of these pages has yet been rebuilt in the shared course style.

| Source evidence | Target content ID | Type | Proposed semantic URL | First status | Why this split follows the source |
|---|---|---|---|---|---|
| WEEK3 anchors `#ear` through `#masking`, plus `#mp3` as application | `auditory-system-psychoacoustics` | chapter | `chapters/auditory-system-psychoacoustics/` | `draft` | The source page has a continuous path from ear anatomy to psychoacoustic boundaries and masking |
| WEEK3 anchors `#pitch` and `#timbre` | `pitch-timbre-symbolic-audio` | chapter | `chapters/pitch-timbre-symbolic-audio/` | `draft` | Pitch/timbre have their own controls, canvases, and symbolic mapping, so they are easier to maintain as a separate Chapter |
| WEEK3 anchor `#flow` and `#closing` | `auditory-psychoacoustics-route` | session | `session/auditory-psychoacoustics-route/` | `draft` | The source page contains a class route and closing tasks that should organize, not duplicate, the Chapter knowledge |
| WEEK4 anchors `#opening` through `#complex` | `spatial-hearing-scene-analysis` | chapter | `chapters/spatial-hearing-scene-analysis/` | `draft` | The source page has one continuous perception story from ITD/ILD to scene organization |
| WEEK4 anchor `#features` | `audio-feature-representations` | chapter | `chapters/audio-feature-representations/` | `draft` | The source explicitly turns from spatial/scene perception to machine feature representation |
| WEEK4 anchors `#flow` and `#closing` | `spatial-scene-feature-route` | session | `session/spatial-scene-feature-route/` | `draft` | The source has a two-hour route and wrap-up that should become a Session-level organizer |

## Source-derived narratives

These narratives are phrased from the internal order of the WEEK3/WEEK4 source pages, not from the syllabus.

### `auditory-system-psychoacoustics`

Source-section flow:
`听觉路径 -> 耳蜗频率地图 -> 听阈/听力健康 -> 响度 -> 临界频带 -> 掩蔽 -> MP3 应用`.

Chapter narrative:
`声音进入耳朵并不是被动记录 -> 外耳、中耳、内耳、频率、声级和频谱成为研究对象 -> 耳蜗位置-频率映射、听阈、响度、临界频带和掩蔽解释可听性 -> 交互图展示频率/声级/频带如何改变听感 -> MP3 和辅听设备作为应用与边界`.

### `pitch-timbre-symbolic-audio`

Source-section flow:
`音高 -> 十二平均律/MIDI -> 缺失基频与谐波 -> 音色 -> 合成听辨`.

Chapter narrative:
`频率相关但不等于音高 -> 基频、谐波、半音距离、MIDI 编号和包络成为研究对象 -> 对数频率和谐波组织解释音高 -> 谐波能量和起音包络解释音色 -> 播放与画布观察让学生比较同音高不同音色`.

### `auditory-psychoacoustics-route`

Session narrative:
`WEEK3 的课堂路径先建立听觉系统如何接收声音，再用听阈、响度、临界频带、音高、音色、掩蔽解释“听见什么”，最后用 MP3 和课堂小测收束应用与检查`.

Session should link to:

- `chapters/auditory-system-psychoacoustics/#auditory-chain`
- `chapters/auditory-system-psychoacoustics/#cochlear-map`
- `chapters/auditory-system-psychoacoustics/#thresholds`
- `chapters/auditory-system-psychoacoustics/#loudness`
- `chapters/auditory-system-psychoacoustics/#critical-bands`
- `chapters/pitch-timbre-symbolic-audio/#pitch`
- `chapters/pitch-timbre-symbolic-audio/#timbre`
- `chapters/auditory-system-psychoacoustics/#masking`

Session must not contain:

- full equal-loudness or critical-band explanations;
- duplicated ear anatomy teaching text;
- duplicated MP3 encoding-flow explanation;
- the pitch/timbre synthesis explanation beyond route-level context.

### `spatial-hearing-scene-analysis`

Source-section flow:
`开场听辨问题 -> ITD/ILD -> HRTF -> SOFA/数据集 -> IACC -> 优先效应 -> ASA -> 复杂声/距离/视觉影响`.

Chapter narrative:
`同一条波形也能被听成来自某个方向和某个对象 -> 方位角、距离、双耳时间差、双耳强度差、HRTF、相关性、反射和分组线索成为研究对象 -> ITD/ILD、HRTF、IACC、优先效应和 ASA 解释定位与场景组织 -> SVG/Canvas 交互展示参数改变后的听觉判断 -> 个体差异、反射、距离和视觉影响给出边界`.

### `audio-feature-representations`

Source-section flow:
`人类机制与机器表示 -> 窗长 -> 帧移 -> Mel 频带数 -> 特征表示切换演示 -> 任务提示`.

Chapter narrative:
`空间和场景听觉之后，机器需要选择输入表示 -> 窗长、帧移、频带数、时间分辨率、频率分辨率和任务目标成为研究对象 -> 特征参数改变会改变可保留的信息 -> Canvas 交互比较表示选择的效果 -> 以分类/检测任务适配作为边界`.

### `spatial-scene-feature-route`

Session narrative:
`WEEK4 的课堂路径先用同一波形引出空间和对象问题，再依次组织 ITD/ILD、HRTF、IACC、优先效应和 ASA，最后回到机器听觉特征表示与课堂检查`.

Session should link to:

- `chapters/spatial-hearing-scene-analysis/#opening`
- `chapters/spatial-hearing-scene-analysis/#binaural-cues`
- `chapters/spatial-hearing-scene-analysis/#hrtf`
- `chapters/spatial-hearing-scene-analysis/#iacc`
- `chapters/spatial-hearing-scene-analysis/#precedence`
- `chapters/spatial-hearing-scene-analysis/#scene-analysis`
- `chapters/audio-feature-representations/#overview`
- `chapters/audio-feature-representations/#feature-lab`

Session must not contain:

- ITD/ILD equations or explanatory examples copied from the Chapter;
- HRTF dataset descriptions beyond why the route jumps there;
- IACC/precedence/ASA interactive explanations;
- feature-parameter teaching that belongs in the feature Chapter.

## Target chapter outlines

### `chapters/auditory-system-psychoacoustics/`

| Target anchor | Student-facing label | Source anchors | Concrete content owned here |
|---|---|---|---|
| `#overview` | 先看全貌 | `#flow`, page hero | Courseware question and route distilled into a Chapter opening |
| `#auditory-chain` | 外中内耳 | `#ear`, `#outer-ear`, `#middle-ear`, `#inner-ear` | Ear pathway, outer-ear filtering, middle-ear impedance matching, inner-ear entry |
| `#cochlear-map` | 耳蜗频率图 | `#inner-ear`, `#cochlea-legacy` | Tonotopic map, frequency-region interaction, Mel readout if retained |
| `#pathway-experience` | 通路与经验 | `#pathway-legacy` | Neural coding, attention, experience as interpretation layer |
| `#thresholds-health` | 听阈与健康 | `#threshold`, `#hearing-health` | Threshold curve, audiogram, hearing loss, aids, cochlear implant as boundary/application |
| `#loudness` | 响度 | `#loudness` | Equal-loudness interaction and same-SPL-not-same-loudness explanation |
| `#critical-bands` | 临界频带 | `#band` | Critical band/ERB interaction and perceptual frequency resolution |
| `#masking-mp3` | 掩蔽与 MP3 | `#masking`, `#mp3` | Masking threshold interaction and MP3 as application |
| `#route` | 学习路线 | `#closing` | Self-check, takeaways, links to the WEEK3 Session and pitch/timbre Chapter |

### `chapters/pitch-timbre-symbolic-audio/`

| Target anchor | Student-facing label | Source anchors | Concrete content owned here |
|---|---|---|---|
| `#overview` | 先看全貌 | `#pitch`, `#timbre` | Why pitch and timbre need a separate treatment inside WEEK3 material |
| `#pitch` | 音高 | `#pitch` | Frequency-pitch distinction, pitch controls, listening examples |
| `#equal-temperament` | 十二平均律 | `#pitch` | Semitone distance, note names, piano keyboard, MIDI number |
| `#missing-fundamental` | 缺失基频 | `#pitch` | Harmonic count and missing-fundamental checkbox/canvas |
| `#timbre` | 音色 | `#timbre` | Harmonic amplitudes, attack speed, timbre canvas |
| `#synthesis-practice` | 合成听辨 | `#pitch`, `#timbre` | Playback controls and comparison tasks |
| `#route` | 学习路线 | `#closing` | Links back to the WEEK3 Session and forward to feature material only after that target exists |

### `chapters/spatial-hearing-scene-analysis/`

| Target anchor | Student-facing label | Source anchors | Concrete content owned here |
|---|---|---|---|
| `#overview` | 先看全貌 | `#opening` | Opening question: same waveform, spatial/object perception |
| `#binaural-cues` | ITD / ILD | `#binaural` | Binaural cue explanation and parameter SVG |
| `#hrtf` | HRTF | `#hrtf` | HRTF rendering chain and spectral-cue SVG |
| `#hrtf-data` | SOFA 与数据集 | `#datasets` | SOFA object panel and dataset selection context |
| `#iacc` | IACC | `#iacc` | Correlation/width explanation and canvas |
| `#precedence` | 优先效应 | `#precedence` | Direct/reflection timeline and fusion/echo states |
| `#scene-analysis` | 场景组织 | `#asa` | ASA grouping cues and object-count interaction |
| `#complex-boundaries` | 复杂声与视觉 | `#complex` | Lateralization of complex sounds, distance, visual influence |
| `#route` | 学习路线 | `#closing` | Self-check, takeaways, links to the WEEK4 Session and feature Chapter |

### `chapters/audio-feature-representations/`

| Target anchor | Student-facing label | Source anchors | Concrete content owned here |
|---|---|---|---|
| `#overview` | 先看全貌 | `#features` | Why the source returns from human mechanisms to machine representations |
| `#human-machine-map` | 人类机制与机器表示 | `#features` | Mapping table/idea from source card |
| `#window-hop` | 窗长与帧移 | `#features` | Window size and hop controls |
| `#mel-bands` | Mel 频带数 | `#features` | Mel-band count control and representation effect |
| `#feature-lab` | 特征切换演示 | `#features` | Feature canvas, time/frequency/task readouts |
| `#task-fit` | 任务匹配 | `#features`, `#closing` | Classification/detection hints and self-check |
| `#route` | 学习路线 | `#closing` | Links back to the WEEK4 Session and spatial hearing Chapter |

## Source asset migration

### WEEK3 assets

Copy these only when building the target Chapter, not in this planning step:

| Source asset | Proposed target | Source use |
|---|---|---|
| `assets/ear-structure/outer-middle-inner-ear.png` | `chapters/auditory-system-psychoacoustics/media/outer-middle-inner-ear.png` | Whole ear pathway |
| `assets/ear-structure/pinna.jpg` | `chapters/auditory-system-psychoacoustics/media/pinna.jpg` | Outer ear |
| `assets/ear-structure/middle-ear.png` | `chapters/auditory-system-psychoacoustics/media/middle-ear.png` | Middle ear |
| `assets/ear-structure/cochlea-frequency.jpg` | `chapters/auditory-system-psychoacoustics/media/cochlea-frequency.jpg` | Cochlear frequency map |
| `assets/threshold/hearing-threshold-curve.png` | `chapters/auditory-system-psychoacoustics/media/hearing-threshold-curve.png` | Hearing threshold |
| `assets/hearing-health/hearing-test-room.webp` | `chapters/auditory-system-psychoacoustics/media/hearing-test-room.webp` | Hearing test environment |
| `assets/hearing-health/audiogram.jpg` | `chapters/auditory-system-psychoacoustics/media/audiogram.jpg` | Audiogram |
| `assets/hearing-health/hearing-aid-types.avif` | `chapters/auditory-system-psychoacoustics/media/hearing-aid-types.avif` | Hearing aid types |
| `assets/hearing-health/cochlear-implant.jpg` | `chapters/auditory-system-psychoacoustics/media/cochlear-implant.jpg` | Cochlear implant |

Before publication, verify source/license/attribution for every imported image. Large images should be optimized after attribution is settled.

### WEEK4 assets

WEEK4 uses inline SVG/canvas for teaching content. It also has preview PNGs:

- `week04-preview.png`
- `week04-mobile-preview.png`

Do not import preview PNGs as Chapter figures. Use them only to compare the rebuilt visual layout with the current draft.

## JavaScript and interaction migration

Move inline scripts out of the source pages during implementation.

Recommended split:

| Interaction family | Target script suggestion | Source widgets |
|---|---|---|
| Auditory/cochlea/threshold/loudness/band/masking | `assets/js/auditory-psychoacoustics.js` | cochlea SVG, audiogram SVG, equal-loudness SVG, band SVG, masking SVG/audio |
| Pitch/timbre synthesis | `assets/js/pitch-timbre-symbolic-audio.js` | pitch canvas, piano controls, missing fundamental, timbre canvas |
| Spatial hearing | `assets/js/spatial-hearing-scene-analysis.js` | binaural SVG, HRTF SVG, IACC canvas, precedence SVG, ASA SVG |
| Audio feature representation | `assets/js/audio-feature-representations.js` | feature canvas and window/hop/Mel controls |

If any helper is shared by more than one target, extract it only after the second actual use appears. Avoid premature shared abstractions.

## Student/teacher split

Move to student Chapter HTML:

- source explanations needed for self-study;
- stable source-derived definitions;
- interaction panels that teach a concept;
- boundary notes visible in the source page;
- quizzes and self-checks that can stand without live classroom context.

Move to `notes.md`:

- "two-hour" or minute-by-minute route information from `#flow`;
- classroom prompts;
- image attribution and review notes;
- hidden legacy sections if they are kept only as teacher backup;
- device/browser caveats for audio demos.

Move to `script.md`:

- spoken transitions between source sections;
- live listening instructions;
- "reveal after observation" prompts;
- contingency instructions if audio playback fails.

## Shared registry candidates from source only

These are candidates because they appear in the WEEK3/WEEK4 source material. Do not add them blindly; confirm exact definitions when building Chapters.

| Registry | Candidate additions |
|---|---|
| `course-data/glossary.json` | outer ear, middle ear, inner ear, cochlea, tonotopic map, hearing threshold, audiogram, hearing loss, hearing aid, cochlear implant, loudness, phon, critical band, ERB, pitch, timbre, harmonic, missing fundamental, masking, MP3, ITD, ILD, HRTF, SOFA, IACC, precedence effect, auditory scene analysis, distance perception, visual influence, Mel bands |
| `course-data/notation.json` | `f`, `f0`, semitone distance, MIDI note number, masker frequency, target frequency, ITD delay, ILD level difference, HRTF left/right response, IACC/correlation value, window length, hop size, number of Mel bands |
| `course-data/units.json` | `Hz`, `dB`, `phon`, `ms`, `degree`, `m`, `mel` |

## Implementation sequence

Each step should end with a local git commit. Commit names may use WEEK3/WEEK4 because git history is allowed to describe the working step; the public content URLs should remain semantic.

1. `plan: revise week3 week4 blueprint from source courseware`
   - Update this planning document only.
2. `data: register source-derived week3 week4 draft pages`
   - Add draft catalog entries for the semantic targets above.
   - Do not publish the pages in the current route yet.
3. `chapter: scaffold week3 auditory psychoacoustics`
   - Create Chapter shell and stable anchors from WEEK3 source sections.
   - Add `notes.md` and `script.md`.
4. `chapter: migrate week3 auditory psychoacoustics interactions`
   - Bring in ear/cochlea/threshold/loudness/band/masking/MP3 content and scripts.
5. `chapter: scaffold week3 pitch timbre symbolic audio`
   - Move pitch/timbre/MIDI material into its own source-derived Chapter.
6. `session: add week3 auditory psychoacoustics route`
   - Build a Session from source `#flow` and `#closing`; link to Chapter anchors.
7. `chapter: scaffold week4 spatial hearing scene analysis`
   - Build ITD/ILD, HRTF, SOFA, IACC, precedence, ASA, complex-boundary sections.
8. `chapter: scaffold week4 audio feature representations`
   - Build the feature representation page from WEEK4 `#features`.
9. `session: add week4 spatial scene feature route`
   - Build a Session from source `#flow` and `#closing`; link to Chapter anchors.
10. `route: publish reviewed source-derived week3 week4 content`
   - Only after structural audit and rendered browser acceptance pass.

## Validation gate before publication

For every new or edited student-facing page:

- run `python .agents/skills/build-audio-ai-course/scripts/audit_course_pages.py . --strict`;
- verify all source-derived anchors exist and all local links resolve;
- inspect desktop, compact desktop, tablet, and mobile viewports;
- inspect light and dark themes;
- interact with every slider, button, SVG, canvas, and audio control migrated from the source pages;
- confirm no page-level horizontal overflow;
- confirm sticky `chapter-outline` and Session relationship navigation do not cover content;
- keep draft content out of the public route until it passes.

For this planning document only, structural audit is sufficient because no student-facing HTML or route has changed.
