# Internal Tools design QA

## Comparison setup

- Reference: `public/blog/release-commitment-gantt-polished.png` (`1672×941`).
- Implementation: `public/img/gantt-use-cases/internal-tools.webp` (`1200×675`).
- Video: `public/video/gantt-use-cases/internal-tools.mp4` (`1200×676`, 30 fps, 11 seconds).
- Reference normalized to `1200×675` with Lanczos scaling; reference and implementation reviewed side by side in one `2400×675` image plus a paired `430×390` table crop.
- Recorder crop: `x=24`, `y=178`, `width=1154`, `height=648` from the production TS build.

## Fidelity review

- Composition and crop: passed. The task-table split, five-column order, month-quarter viewport, visible row count, and chart-only framing match.
- Columns and rows: passed. Effective task pane is aligned through a `69.6%` timeline panel; column sizing and the 34px row contract preserve the reference density.
- Typography and spacing: passed. Compact uppercase headers, stronger 10px task copy, 8px owner metadata, badge spacing, hierarchy indentation, and readiness alignment match at the normalized viewport.
- Palette and surfaces: passed. White canvas, subtle gray dividers, lavender owner/source/approval metadata, purple readiness tracks, rose risk states, and rounded grid frame match.
- Gantt semantics: passed. Real summary/task/milestone bars retain the reference purple/plum/pink hierarchy, with selected yellow outlines, gray dependencies, baseline dashes, risk range, and deployment/GA commitment lines visible.
- Progress cells: passed. `100%` values remain legible while long blocked labels retain reference-style ellipsis; tracks stay centered and do not escape their cells.
- Video: passed. A representative mid-video frame retains the same columns, crop, bars, dependencies, typography, and palette after interaction.
- Functional integrity: passed. Recorder confirmed 22 tasks, 22 projected rows, 11 resources, 22 dependencies, the `internal-release-48-readiness-2026` project, and a live `GanttPlugin`.

## Severity audit

- P0: none.
- P1: none.
- P2: none.

final result: passed
