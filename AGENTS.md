# Agent instructions for Audio AI

## Scope

Maintain this repository as a connected, student-facing course about how humans and machines receive, represent, understand, generate, and evaluate sound. The teaching schedule is configurable; do not treat a particular week count or order as durable architecture.

Before changing course pages, read `.agents/skills/build-audio-ai-course/SKILL.md` and its required references.

## Information ownership

- `chapters/` owns concrete knowledge: definitions, notation, formulas, derivations, examples, interactions and validity boundaries.
- `session/` owns syllabus-driven macro organization: grouping, prerequisite/current/successor relations, contrasts, transformations and contextual jumps.
- `course-data/catalog.json` registers content IDs, status, URLs and maintainers.
- `course-data/paths/` selects a teaching route without renaming or copying Chapters.
- `labs/` and `projects/` own reusable activities and integrated work.

Never copy, shorten, paraphrase, embed or build-time compose Chapter knowledge into a Session. Session prose may explain why topics connect, but must link to the authoritative Chapter or exact semantic anchor for concrete knowledge.

## Stable URLs and links

Use semantic public paths such as:

- `chapters/time-domain-audio/`
- `chapters/spatial-acoustic-features/`
- `chapters/frequency-domain-processing/`
- `session/sound-physics-sampling-spectrum/`

Do not introduce sequence-numbered or week-numbered canonical directories. Every substantial Chapter needs stable semantic anchors. Every Session needs a visible sticky or floating relationship-navigation layer using real `<a href>` links.

Hover/focus previews may add context, but link meaning must remain visible without hover and work with keyboard and touch. Floating navigation must not cover required content.

## Shared definitions and notation

Treat `course-data/glossary.json`, `notation.json`, and `units.json` as course-level contracts. Chapter maintainers may choose teaching examples and prose, but they may not silently redefine a shared concept or symbol.

When definitions conflict:

1. Report the exact passages and concept IDs.
2. Classify the difference as contradiction, scope difference, notation difference, or teaching-level difference.
3. Do not choose a winner automatically.
4. Request review from the Chapter maintainer, domain steward and course lead.
5. Update the shared registry and affected Chapters in one reviewed change.

## Editing workflow

1. Inspect `README.md`, `course-data/catalog.json`, `course-data/paths/current.json`, and the target pages.
2. State `previous knowledge -> current transformation -> next use` before changing navigation.
3. Preserve complete user-confirmed content and stable anchors.
4. Keep shared CSS/JS under `assets/`; do not fork page-local copies without a specific need.
5. Update `catalog.json`, ownership documentation and route configuration when adding or publishing content.
6. Run the structural audit and real-browser visual checks before reporting completion.

## Release blockers

- broken local links or missing anchors;
- Session duplication of Chapter definitions, formulas, derivations or examples;
- missing route back from a Chapter to its relevant Session or overview;
- inaccessible or content-covering floating navigation;
- unreadable MathML, symbol drift or unreviewed shared-definition changes;
- page-level horizontal overflow, clipped required content or unusable interactions;
- exposing `draft` content in the current public route.

Do not commit, push, publish, delete user-authored content, or change remote state unless the user explicitly requests that action.
