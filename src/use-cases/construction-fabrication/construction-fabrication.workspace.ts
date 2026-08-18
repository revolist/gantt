import './construction-fabrication.scss';
import buildingIcon from '@fortawesome/fontawesome-free/svgs/solid/building.svg?raw';
import calendarIcon from '@fortawesome/fontawesome-free/svgs/solid/calendar-days.svg?raw';
import chevronLeftIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-left.svg?raw';
import chevronRightIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-right.svg?raw';
import clockResetIcon from '@fortawesome/fontawesome-free/svgs/solid/clock-rotate-left.svg?raw';
import filterIcon from '@fortawesome/fontawesome-free/svgs/solid/filter.svg?raw';
import folderIcon from '@fortawesome/fontawesome-free/svgs/solid/folder.svg?raw';
import folderOpenIcon from '@fortawesome/fontawesome-free/svgs/solid/folder-open.svg?raw';
import { defineCustomElements } from '@revolist/revogrid/loader';
import { createDefaultTaskTableColumn, GanttPlugin, scrollGanttToToday } from '@revolist/gantt';
import { currentTheme, observeCurrentTheme } from '../../theme';
import {
  applyConstructionTaskPatch,
  CONSTRUCTION_MODEL,
  DEFAULT_LOOK_AHEAD,
  DEFAULT_LOOK_AHEAD_FILTERS,
  dependenciesFor,
  moveLookAheadPeriod,
  projectSource,
  trimmedLookAheadRows,
} from './construction-fabrication.data';
import type {
  ConstructionTask,
  ConstructionView,
  LookAheadFilters,
  LookAheadPeriod,
} from './construction-fabrication.types';

defineCustomElements();

const featuredProject = '2801';

interface ButtonOptions {
  active?: boolean;
  icon?: string;
  kind?: 'default' | 'primary' | 'quiet';
  title?: string;
}

const text = (tag: string, className: string, value: string) => {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = value;
  return element;
};

const icon = (svg: string, className = 'construction-fabrication__icon') => {
  const element = document.createElement('span');
  element.className = className;
  element.setAttribute('aria-hidden', 'true');
  element.innerHTML = svg;
  return element;
};

const button = (label: string, action: () => void, options: ButtonOptions = {}) => {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = `construction-fabrication__button construction-fabrication__button--${options.kind ?? 'default'}`;
  if (options.active !== undefined) element.setAttribute('aria-pressed', String(options.active));
  if (options.title) element.title = options.title;
  if (options.icon) element.append(icon(options.icon));
  element.append(document.createTextNode(label));
  element.addEventListener('click', action);
  return element;
};

const controlGroup = (label: string, items: HTMLElement[], groupIcon?: string) => {
  const group = document.createElement('div');
  group.className = 'construction-fabrication__control-group';
  const groupLabel = text('span', 'construction-fabrication__toolbar-label', label);
  if (groupIcon) groupLabel.prepend(icon(groupIcon, 'construction-fabrication__label-icon'));
  const controls = document.createElement('div');
  controls.className = 'construction-fabrication__control-set';
  controls.append(...items);
  group.append(groupLabel, controls);
  return group;
};

const displayDate = (date: string) => new Intl.DateTimeFormat('en-AU', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${date}T00:00:00Z`));

const statusTone = (status: unknown) => {
  const value = String(status ?? '').toLowerCase();
  if (value.includes('complete')) return 'complete';
  if (value.includes('progress')) return 'progress';
  if (value.includes('remaining')) return 'remaining';
  return 'planned';
};

export function mountConstructionFabricationWorkspace(host: HTMLElement): () => void {
  let view: ConstructionView = 'master';
  let selectedProject = featuredProject;
  let period: LookAheadPeriod = { ...DEFAULT_LOOK_AHEAD };
  let filters: LookAheadFilters = { ...DEFAULT_LOOK_AHEAD_FILTERS };
  let scale: 'day-week' | 'week-month' | 'month-quarter' = 'day-week';
  let tasks: ConstructionTask[] = [...CONSTRUCTION_MODEL.tasks];
  let expandedRowIds = new Set<string>();
  let disconnectTheme = () => {};

  const projectName = () => CONSTRUCTION_MODEL.projects.find((project) => project.projectRef === selectedProject)?.name || 'Project Schedule';
  const openProject = (projectRef: string) => { selectedProject = projectRef; view = 'project'; render(); };
  const sourceForView = () => view === 'master'
    ? CONSTRUCTION_MODEL.projects.flatMap((project) => projectSource(CONSTRUCTION_MODEL, project.projectRef, tasks))
    : projectSource(CONSTRUCTION_MODEL, selectedProject, tasks);

  const nameTemplate = (h: any, { model }: any) => {
    if (!model.id?.startsWith('project:')) return h('span', { class: 'construction-fabrication__activity-name' }, model.name);
    const folderState = expandedRowIds.has(model.id) ? 'open' : 'closed';
    const projectFolderIcon = folderState === 'open' ? folderOpenIcon : folderIcon;
    const content = [
      h('span', { class: 'construction-fabrication__project-icon', 'aria-hidden': 'true', 'data-folder-state': folderState, innerHTML: projectFolderIcon }),
      h('span', { class: 'construction-fabrication__project-name' }, model.name),
    ];
    return view === 'master'
      ? h('button', {
        class: 'construction-fabrication__project-link',
        title: `Open ${model.name} schedule`,
        onClick: (event: Event) => { event.stopPropagation(); openProject(model.projectRef); },
      }, content)
      : h('span', { class: 'construction-fabrication__project-root' }, content);
  };

  const columns = () => {
    const name = {
      ...createDefaultTaskTableColumn('name'),
      name: view === 'master' ? 'Project / schedule' : 'Activity',
      size: view === 'lookahead' ? 280 : 245,
      pin: view === 'lookahead' ? 'colPinStart' : undefined,
      cellTemplate: nameTemplate,
    } as any;
    const status = {
      prop: 'statusLabel', name: 'Status', size: 112, readonly: true,
      cellTemplate: (h: any, { model }: any) => h('span', {
        class: `construction-fabrication__status construction-fabrication__status--${statusTone(model.statusLabel)}`,
      }, model.statusLabel),
    };
    const common = [
      name,
      { prop: 'departmentLabel', name: 'Department', size: 110, readonly: true },
      { prop: 'resourceName', name: 'Resource', size: 135, readonly: true },
      { prop: 'startDate', name: 'Start', size: 105 },
      { prop: 'endDate', name: 'Finish', size: 105 },
      { prop: 'duration', name: 'Duration', size: 85 },
      { prop: 'percentDone', name: 'Progress', size: 88 },
      status,
    ];
    return view === 'lookahead'
      ? [name, { prop: 'departmentLabel', name: 'Department', size: 108, readonly: true }, { prop: 'workArea', name: 'Work area', size: 120, readonly: true }, ...common.slice(2)]
      : common;
  };

  const mountGrid = (shell: HTMLElement) => {
    const source = sourceForView();
    const grid = document.createElement('revo-grid') as any;
    grid.className = 'construction-fabrication__grid skip-style cell-border';
    grid.theme = currentTheme().isDark() ? 'darkCompact' : 'compact';
    grid.hideAttribution = true;
    grid.readonly = false;
    grid.range = true;
    grid.resize = true;
    grid.rowHeaders = true;
    grid.rowSize = 34;
    grid.autoSizeColumn = false;
    grid.plugins = [GanttPlugin];
    grid.columns = columns();
    grid.ganttResources = CONSTRUCTION_MODEL.resources;
    grid.ganttAssignments = CONSTRUCTION_MODEL.assignments;
    grid.ganttCalendars = CONSTRUCTION_MODEL.calendars;
    grid.ganttDependencies = dependenciesFor(source);
    grid.gantt = {
      id: view === 'master' ? 'pebblestone-company-master' : `pebblestone-${selectedProject}`,
      name: view === 'master' ? 'Pebblestone Company Master' : projectName(),
      version: '1', currency: 'AUD', timeZone: 'Australia/Sydney', primaryCalendarId: 'cal-site_mon_fri',
      updatedAt: '2026-08-17T08:00:00Z', zoomPreset: view === 'lookahead' ? 'day-week' : scale,
      visuals: view === 'lookahead' ? {
        timeRanges: [{ id: 'lookahead-window', name: 'Active 2-week period', startDate: period.start, endDate: period.end, color: '#668d99' }],
      } : undefined,
    };
    if (view === 'lookahead') grid.trimmedRows = trimmedLookAheadRows(source, period, filters);
    grid.addEventListener('tree-state-changed', (event: Event) => {
      expandedRowIds = new Set((event as CustomEvent<{ expandedRowIds: Set<string> }>).detail.expandedRowIds);
    });
    grid.addEventListener('gantt-before-task-change', (event: Event) => {
      tasks = applyConstructionTaskPatch(tasks, (event as CustomEvent).detail);
    });
    shell.appendChild(grid);
    grid.source = source;
    queueMicrotask(async () => {
      const plugins = await grid.getPlugins?.();
      const tree = plugins?.find((plugin: any) => typeof plugin.collapseAll === 'function');
      if (tree) {
        if (view === 'master') {
          await tree.collapseAll();
          await tree.toggleRowExpandedById(`project:${featuredProject}`);
        } else await tree.expandAll();
      }
      await grid.scrollToRow?.(0);
      await grid.scrollToColumnIndex?.(0);
      if (view === 'lookahead') await scrollGanttToToday(grid, { date: period.start, align: 0.12 });
    });
    return grid;
  };

  const render = () => {
    host.replaceChildren();
    const shell = document.createElement('section');
    shell.className = `construction-fabrication ${currentTheme().isDark() ? 'construction-fabrication--dark' : ''}`;
    shell.setAttribute('aria-label', 'Construction and Fabrication Operations');

    const nav = document.createElement('nav');
    nav.className = 'construction-fabrication__nav';
    nav.setAttribute('aria-label', 'Schedule views');
    nav.append(button('Company Master', () => { view = 'master'; render(); }, {
      active: view === 'master', icon: buildingIcon, kind: 'quiet', title: 'Open the company project portfolio',
    }));
    if (view !== 'master') nav.append(
      text('span', 'construction-fabrication__crumb', '›'),
      button(projectName(), () => { view = 'project'; render(); }, {
        active: view === 'project', icon: folderOpenIcon, kind: 'quiet', title: `Open ${projectName()} schedule`,
      }),
    );
    if (view === 'lookahead') nav.append(
      text('span', 'construction-fabrication__crumb', '›'),
      text('span', 'construction-fabrication__crumb-current', '2-week Look-Ahead'),
    );

    const toolbar = document.createElement('div');
    toolbar.className = 'construction-fabrication__toolbar';
    if (view === 'project') toolbar.append(
      controlGroup('Timeline scale', [
        button('Days', () => { scale = 'day-week'; render(); }, { active: scale === 'day-week' }),
        button('Weeks', () => { scale = 'week-month'; render(); }, { active: scale === 'week-month' }),
        button('Months', () => { scale = 'month-quarter'; render(); }, { active: scale === 'month-quarter' }),
      ], calendarIcon),
      button('Open 2-week Look-Ahead', () => { view = 'lookahead'; render(); }, {
        icon: calendarIcon, kind: 'primary', title: 'Open the rolling operational window',
      }),
    );
    if (view === 'lookahead') {
      const periodSummary = document.createElement('div');
      periodSummary.className = 'construction-fabrication__period-summary';
      periodSummary.append(
        icon(calendarIcon, 'construction-fabrication__period-icon'),
        text('span', 'construction-fabrication__period-kicker', 'Active window'),
        text('strong', 'construction-fabrication__period', `${displayDate(period.start)} – ${displayDate(period.end)}`),
      );
      const areaSelect = document.createElement('select');
      areaSelect.className = 'construction-fabrication__select';
      areaSelect.setAttribute('aria-label', 'Work area');
      const areas = [...new Set(sourceForView().map((task) => task.workArea).filter(Boolean))] as string[];
      areaSelect.append(new Option('All work areas', 'all'), ...areas.map((area) => new Option(area, area)));
      areaSelect.value = filters.workArea;
      areaSelect.addEventListener('change', () => { filters = { ...filters, workArea: areaSelect.value }; render(); });
      toolbar.append(
        periodSummary,
        controlGroup('Move period', [
          button('Previous', () => { period = moveLookAheadPeriod(period, -1); render(); }, { icon: chevronLeftIcon, title: 'Previous 14 days' }),
          button('Reset', () => { period = { ...DEFAULT_LOOK_AHEAD }; render(); }, { icon: clockResetIcon, title: 'Reset to the featured window' }),
          button('Next', () => { period = moveLookAheadPeriod(period, 1); render(); }, { icon: chevronRightIcon, title: 'Next 14 days' }),
        ]),
        controlGroup('Department', [
          ...(['all', 'fabrication', 'installation'] as const).map((department) => button(
            department === 'all' ? 'All' : department[0].toUpperCase() + department.slice(1),
            () => { filters = { ...filters, department }; render(); },
            { active: filters.department === department },
          )),
          areaSelect,
        ], filterIcon),
      );
    }

    shell.append(nav);
    if (view !== 'master') shell.append(toolbar);
    mountGrid(shell);
    host.appendChild(shell);
  };

  render();
  disconnectTheme = observeCurrentTheme(() => render());
  return () => { disconnectTheme(); host.replaceChildren(); };
}
