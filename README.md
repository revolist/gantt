<div align="center">

# RevoGrid Gantt

[View live demo](https://gantt.rv-grid.com/) · [Get Pro Advanced](https://rv-grid.com/pricing/)

[![RevoGrid Gantt walkthrough](./assets/gantt-walkthrough.gif)](./assets/gantt-walkthrough.mp4)

</div>

RevoGrid Gantt is a JavaScript Gantt chart and project-scheduling component
built on RevoGrid. It combines an editable task table with a synchronized,
virtualized timeline for planning projects, resources, dependencies, cost, and
delivery risk in one interface.

## Key capabilities

- Model hierarchical tasks, summaries, milestones, progress, and constraints
- Create and edit dependency links with schedule-aware recalculation
- Plan resources, assignments, capacity, effort, and project cost
- Use working calendars, holidays, duration settings, and time-zone-aware dates
- Compare the active schedule with baselines and a configurable status date
- Highlight the critical path, non-working time, milestones, and the current day
- Edit tasks from the table, timeline, dialogs, context menus, and creation row
- Customize task bars, task-table columns, zoom levels, labels, and date formats
- Virtualize 10,000 editable tasks with 19,796 dependencies and navigate timelines spanning twenty years

## Installation

### Free trial

The public trial registry requires no token or login. Configure it for this
project and install the trial packages under the production import names:

```bash
pnpm config set @revolist:registry https://trial.rv-grid.com --location=project
pnpm i @revolist/revogrid-pro@npm:@revolist/rv-pro-trial@2.7.12 @revolist/gantt@npm:@revolist/gantt-trial@2.7.12
```

### Pro

Paid users can remove the trial registry override and install the licensed
packages. Source imports stay unchanged.

```bash
pnpm config delete @revolist:registry --location=project
pnpm i @revolist/revogrid-pro@2.7.12 @revolist/gantt@2.7.12
```

## Quick start

```ts
import { defineCustomElements } from '@revolist/revogrid/loader';
import { GanttPlugin, createDefaultTaskTableColumn } from '@revolist/gantt';
import '@revolist/gantt/styles.css';

defineCustomElements();

const grid = document.createElement('revo-grid');
grid.plugins = [GanttPlugin];
grid.columns = [
  createDefaultTaskTableColumn('name'),
  createDefaultTaskTableColumn('startDate'),
  createDefaultTaskTableColumn('duration'),
];
grid.gantt = {
  id: 'launch-plan',
  name: 'Product launch',
  version: '1',
  currency: 'EUR',
  timeZone: 'Europe/Lisbon',
  primaryCalendarId: 'default',
  updatedAt: '2026-08-18T09:00:00.000Z',
  calendars: [
    {
      id: 'default',
      name: 'Standard',
      timeZone: 'Europe/Lisbon',
      workingDays: [1, 2, 3, 4, 5],
      holidays: [],
      hoursPerDay: 8,
    },
  ],
  zoomPreset: 'day-week',
};
document.querySelector('#app')?.appendChild(grid);
grid.source = [
  { id: 'design', name: 'Design', startDate: '2026-08-18', duration: 5 },
  { id: 'build', name: 'Build', startDate: '2026-08-25', duration: 10 },
];
```

## Framework integrations

The component uses the same project model across supported frameworks.

| Framework | Integration source | Start command |
| --- | --- | --- |
| Vanilla TypeScript | [`src/examples/showcase/gantt.ts`](./src/examples/showcase/gantt.ts) | `pnpm dev` |
| React | [`src/examples/showcase/gantt.react.tsx`](./src/examples/showcase/gantt.react.tsx) | `pnpm dev:react` |
| Vue 3 | [`src/examples/showcase/gantt.vue`](./src/examples/showcase/gantt.vue) | `pnpm dev:vue` |
| Angular | [`src/examples/showcase/gantt.angular.ts`](./src/examples/showcase/gantt.angular.ts) | `pnpm dev:angular` |

Build all integrations with `pnpm build:frameworks`.

## Run the examples

Clone the component repository, follow either the **Free trial** or **Pro**
installation above, and start the default project-planning view:

```bash
git clone https://github.com/revolist/gantt.git
cd gantt
pnpm dev
```

Open [http://localhost:5173/](http://localhost:5173/). Add an `example` query
parameter to run another Gantt scenario:

| Example | Live | Local URL | Source |
| --- | --- | --- | --- |
| Project planning | [Open](https://gantt.rv-grid.com/) | [Default view](http://localhost:5173/) | [`src/examples/showcase/gantt.ts`](./src/examples/showcase/gantt.ts) |
| 10,000 tasks | [Open](https://gantt.rv-grid.com/?example=big-data) | [`?example=big-data`](http://localhost:5173/?example=big-data) | [`src/examples/big-data/gantt-big-data.ts`](./src/examples/big-data/gantt-big-data.ts) |
| Twenty-year timeline | [Open](https://gantt.rv-grid.com/?example=horizontal-big-data) | [`?example=horizontal-big-data`](http://localhost:5173/?example=horizontal-big-data) | [`src/examples/horizontal-big-data/gantt-horizontal-big-data.ts`](./src/examples/horizontal-big-data/gantt-horizontal-big-data.ts) |
| Browser benchmark | [Open](https://gantt.rv-grid.com/?example=benchmark) | [`?example=benchmark`](http://localhost:5173/?example=benchmark) | [`src/examples/benchmark/gantt-benchmark.ts`](./src/examples/benchmark/gantt-benchmark.ts) |

The same query parameter works with `pnpm dev:react`, `pnpm dev:vue`, and
`pnpm dev:angular`. The benchmark is TypeScript-only; other framework modes
automatically load its TypeScript implementation.

## Resources

- [Gantt documentation](https://pro.rv-grid.com/guides/gantt/)
- [Gantt API](https://pro.rv-grid.com/api/gantt/)
- [Trial installation guide](https://pro.rv-grid.com/guides/installation-npm-trial/)

## License

The integration source and supporting assets in this repository are MIT
licensed. RevoGrid Pro and RevoGrid Gantt are commercial packages distributed
under the license supplied with your subscription.
