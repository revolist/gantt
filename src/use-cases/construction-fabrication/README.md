# Construction + Fabrication Operations

This separate `industry-construction-fabrication` use case maps Pebblestone's supplied `tasks`, `resources`, `dependencies`, and `lookahead` CSV files into a single canonical Gantt task collection. Project records remain separate `ProjectEntity` data and are projected as clickable company-master summary rows.

Task IDs are namespaced as `task:<project_ref>:<source id>`, so similarly named work in different projects cannot overwrite each other. The 26 dependency rows retain their endpoints and FS/SS semantics. Resources retain headcount, capacity and cost-basis metadata, with a zero hourly cost because no rates are supplied. The parser joins surplus CSV fields into `notes`, covering the hired-EWP note comma.

Linked Look-Ahead records become execution children under their master task. Known unlinked records live under a visible **Constraints & logistics** summary. Project `2776` has no source project metadata and is retained only in adapter diagnostics. `push_to_master` is displayed only as legacy source metadata and is never treated as workflow state. Generated **Remaining scheduled scope** children are explicitly marked; they preserve a master task's original time range when a partial Look-Ahead would otherwise shorten a native Gantt summary roll-up.

The Look-Ahead keeps the selected project's complete source in the scheduler. `trimmedRows` hides irrelevant rows while preserving ancestors and the Gantt plugin's summary calculations. The date window is inclusive, moves exactly 14 days at a time, and scrolls to its active period. Drag, resize, date, duration, and progress changes arrive through `gantt-before-task-change` and update the canonical collection before navigation.

The Company Master uses Font Awesome folder SVGs tied to the tree state: expanded projects show an open folder and collapsed projects show a closed folder. The Look-Ahead pins Activity as operational context while dates and status columns scroll independently.

The example uses RevoGrid's Gantt hierarchy, native summary roll-ups, dependencies, calendars, assignments, inline editing, timeline zoom, scrolling, pinned columns, and tree expansion APIs. No RevoGrid or Gantt public APIs are changed.
