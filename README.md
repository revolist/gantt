<div align="center">

# RevoGantt

**Editable project timelines, dependencies, resources, and schedule intelligence.**

[![Frameworks](https://img.shields.io/badge/TypeScript%20%7C%20React%20%7C%20Vue%20%7C%20Angular-4f46e5)](#framework-examples)
[![License: MIT](https://img.shields.io/badge/Example%20license-MIT-16a34a.svg)](./LICENSE)

[View live demo](https://gantt.rv-grid.com/) · [Request trial](https://pro.rv-grid.com/guides/installation-npm-trial/) · [Get Pro Advanced](https://rv-grid.com/pricing/)

[![RevoGantt walkthrough](./assets/gantt-walkthrough.gif)](./assets/gantt-walkthrough.mp4)

</div>

This repository hosts multiple Gantt examples implemented in Vanilla TypeScript,
React, Vue, and Angular. The example is selected with the `example` URL query;
the framework is selected by the existing Vite mode.

## Examples

| Example | URL | Purpose |
| --- | --- | --- |
| Project planning showcase | `/?example=showcase` | Resources, assignments, baselines, critical path, rich task bars, and editing controls. |
| 10,000-task performance | `/?example=big-data` | 10,000 editable tasks and 19,796 dependencies over three months with bounded virtual rendering. |
| Twenty-year timeline performance | `/?example=horizontal-big-data` | 100 editable tasks and 194 dependencies across twenty years with responsive horizontal navigation and zooming. |
| Reproducible browser benchmark | `/?example=benchmark` | Full 100/1K/5K/10K task matrix across sparse, normal, and highly connected projects with raw JSON/CSV results. |

Missing or unknown example ids fall back to the project planning showcase.

## What it features

- Hierarchical project tasks with editable task-table columns
- Dependency links, resources, assignments, calendars, and baselines
- Critical-path and baseline visibility controls
- Summary and milestone tasks with completion state
- Custom task-bar content, colors, assignee badges, and task icons
- Configurable hidden columns and row status presentation
- Range selection, column resizing, and Excel export support

## Pro features

`GanttPlugin` owns the synchronized task table and project timeline.

| Gantt capability | Benefit demonstrated here |
| --- | --- |
| Hierarchical tasks, summaries, milestones, and an add-task row | Represents a real work-breakdown structure and lets users extend the plan in place. |
| Dependency links and scheduling rules | Makes task order explicit and supports schedule-aware planning instead of disconnected date fields. |
| Working calendars and holiday-aware duration | Keeps task duration aligned with actual working time. |
| Resources, assignments, capacity, and cost data | Connects schedule dates to the people and cost required to deliver the work. |
| Baseline snapshots and status date | Lets planners compare the current plan with its approved reference point. |
| Critical-path highlighting | Shows which linked tasks directly control the project finish date. |
| Today line, non-working-time shading, and milestone lines | Adds timeline context and makes important dates visible at a glance. |
| Critical-path and baseline visibility controls | Lets users reduce visual noise or focus on schedule risk as needed. |
| Task-bar content and color hooks | Adds assignee badges, completion colors, task icons, and cleaner summary bars while retaining native Gantt behavior. |
| `createDefaultTaskTableColumn` | Reuses Gantt-aware WBS, task, assignee, cost, date, duration, predecessor, successor, and status column behavior. |
| `isGanttAddTaskRow` | Keeps the completion control readonly on the synthetic add-task row, preventing an invalid status edit. |

### Included plugin stack

`GanttPlugin` installs and reuses its dependency plugins internally. They should not be duplicated in the demo's `plugins` array.

| Plugin | Benefit inside Gantt |
| --- | --- |
| `OverlayPlugin` | Hosts Gantt overlays and editor surfaces above the virtualized grid. |
| `EventManagerPlugin` | Coordinates task-table edits through one event lifecycle. |
| `HistoryPlugin` | Captures task and dependency mutations for undo and redo integration. |
| `TooltipPlugin` | Provides task and dependency details on hover. |
| `ContextMenuPlugin` | Powers task and timeline actions in contextual menus. |
| `RowOrderPlugin` | Supports drag-based task reordering while Gantt keeps hierarchy and schedule state synchronized. |
| `TreeDataPlugin` | Projects parent-child task hierarchy with expand and collapse behavior. |
| `ColumnHidePlugin` | Applies the demo's default hidden task-table columns without rebuilding column definitions. |
| `ColumnDialogPlugin` | Provides Gantt-aware column visibility management. |
| `GanttPanelResizePlugin` | Manages the resizable split between the task table and timeline. |
| `GanttTaskEditorDialogPlugin` | Supplies the full task-editing dialog used by Gantt actions. |
| `GanttAddTaskRowPlugin` | Renders and manages the pinned row for creating a new task. |
| `GanttTimelineHeaderPlugin` | Renders the day/week timeline scale for the active zoom preset. |
| `GanttTaskBarsPlugin` | Renders and interacts with task bars, including the demo's content and color hooks. |
| `GanttDependencyOverlayPlugin` | Draws and updates dependency connectors over the timeline. |

`GanttPlugin` can also auto-install `AdvanceFilterPlugin` when task-table filtering is enabled. This demo does not set the grid `filter` property, so that optional dependency is not part of its runtime stack.

The demo registers two additional plugins alongside `GanttPlugin`:

| Plugin | How this demo uses it and why it helps |
| --- | --- |
| `ExportExcelPlugin` | Makes the task-table data available for XLSX export, giving teams an offline or shareable project snapshot through the plugin API. |
| `RowStatusPlugin` | Turns the `done` field into a source-backed completion checkbox and applies completed-row presentation without maintaining parallel UI state. |

Range selection and column resizing shown by the demo are base-grid capabilities rather than additional plugins.

## Recipes

| Recipe | What it demonstrates |
| --- | --- |
| [`dependencies-calendars.ts`](./recipes/dependencies-calendars.ts) | Linked task scheduling against working calendars. |
| [`resources-baselines.ts`](./recipes/resources-baselines.ts) | Assignments, costs, capacity, and baseline comparison. |
| [`critical-path-editing.ts`](./recipes/critical-path-editing.ts) | Task creation/editing and critical-path visibility. |

## Framework examples

| Framework | Entry point | Command |
| --- | --- | --- |
| Vanilla TypeScript | [`src/examples/showcase/gantt.ts`](./src/examples/showcase/gantt.ts) | `pnpm dev` |
| React | [`src/examples/showcase/gantt.react.tsx`](./src/examples/showcase/gantt.react.tsx) | `pnpm dev:react` |
| Vue 3 | [`src/examples/showcase/gantt.vue`](./src/examples/showcase/gantt.vue) | `pnpm dev:vue` |
| Angular | [`src/examples/showcase/gantt.angular.ts`](./src/examples/showcase/gantt.angular.ts) | `pnpm dev:angular` |

Each command can open any registered example. For example,
`http://localhost:5173/?example=big-data` runs the performance example in the
selected framework mode, while `?example=horizontal-big-data` runs the twenty-year
timeline example. New examples live in an isolated
`src/examples/<example-id>/` directory and are registered in
[`src/examples.ts`](./src/examples.ts).

## Run it

```bash
pnpm install --no-lockfile
pnpm dev          # Vanilla TypeScript
pnpm dev:react
pnpm dev:vue
pnpm dev:angular
```

Build variants use the matching `build:ts`, `build:react`, `build:vue`, and `build:angular` scripts. Run `pnpm test` for the Gantt data/configuration tests.

Trial users must authenticate with the registry described in the [official
trial installation guide](https://pro.rv-grid.com/guides/installation-npm-trial/).
No registry token belongs in this repository. Licensed users can replace the two
trial aliases in `package.json` with the matching licensed RevoGrid packages;
source imports remain unchanged. `package.json` is authoritative for these
direct versions, and installs intentionally do not rely on `pnpm-lock.yaml`.

## License

The examples, recipes, tests, documentation, and media tooling are MIT licensed.
Commercial RevoGrid packages are not covered by this repository's MIT license.

## Main files

- `src/examples/showcase/` — the four framework variants for the full project-planning showcase
- `src/examples/big-data/` — the four framework variants and dataset for the 10,000-task performance example
- `src/examples/horizontal-big-data/` — the four framework variants and dataset for the twenty-year horizontal performance example
- `src/examples.ts` — typed example selection and lazy framework loaders
- `src/examples/showcase/data/gantt-project-data.ts` — showcase fixture/configuration barrel used by the companion recipes
- `src/examples/showcase/data/gantt-showcase-data.ts` — showcase tasks, dependencies, resources, assignments, and baselines
- `src/examples/showcase/data/gantt-showcase-columns.ts` — showcase task-table columns and task-bar renderers
- `src/theme.ts` — the framework-neutral theme observer shared by all examples
`http://localhost:5173/?example=benchmark` opens the interactive browser
benchmark. Run `pnpm benchmark:smoke` for a quick correctness sample or
`pnpm benchmark:run` for the one-warmup plus five-run reference matrix. The
runner writes raw samples, medians, screenshots, and video under
`benchmarks/results/`; benchmark values are machine-specific evidence rather
than a cross-vendor “fastest” claim.
