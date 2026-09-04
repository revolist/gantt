import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const industries = [
  'erp',
  'professional-services',
  'construction',
  'manufacturing',
  'resource-planning',
  'internal-tools',
] as const;

const useCasesRoot = resolve(process.cwd(), 'src/use-cases');
const sharedSource = readFileSync(resolve(useCasesRoot, 'shared/industry-use-case.scss'), 'utf8');

describe('industry showcase presentation contract', () => {
  it('loads only the common shell and local presentation from each industry entry', () => {
    expect(sharedSource).not.toContain('.presentation');

    const sources = industries.map((industry) => {
      const relativePath = `./${industry}/${industry}.presentation.scss`;
      const source = readFileSync(resolve(useCasesRoot, relativePath), 'utf8');
      const entries = [
        `${industry}.ts`,
        `${industry}.react.tsx`,
        `${industry}.vue`,
        `${industry}.angular.ts`,
      ].map((file) => readFileSync(resolve(useCasesRoot, industry, file), 'utf8'));

      for (const entry of entries) {
        expect(entry).toContain('industry-use-case.scss');
        expect(entry).toContain(`${industry}.presentation.scss`);
        expect(entry.match(/\.presentation\.scss/g)).toHaveLength(1);
      }
      expect(source.length).toBeGreaterThan(2_000);
      expect(source).toContain(`.industry-gantt-shell--${industry}`);
      expect(source).toContain('.industry-gantt-header');
      expect(source).toContain('.industry-gantt-metrics');
      expect(source).toContain('.industry-gantt-toolbar');
      return source;
    });

    expect(new Set(sources).size).toBe(industries.length);
  });

  it('customizes the working grid in addition to the shared header shell', () => {
    const gridSpecificPresentations = industries.filter((industry) => {
      const source = readFileSync(resolve(useCasesRoot, industry, `${industry}.presentation.scss`), 'utf8');
      return source.includes('.industry-gantt-grid') || source.includes('revo-grid');
    });

    expect(gridSpecificPresentations.length).toBeGreaterThanOrEqual(5);
  });

  it('keeps the internal-tools readiness label and progress track aligned to the cell', () => {
    const source = readFileSync(resolve(useCasesRoot, 'internal-tools/internal-tools.presentation.scss'), 'utf8');

    expect(source).toContain('grid-template-rows: 1fr 3px');
    expect(source).toContain('padding: 5px 3px');
    expect(source).toContain('text-align: center');
    expect(source).toContain('text-overflow: clip');
    expect(source).toContain('--revo-grid-font-size: 10px');
    expect(source).toContain('--revo-grid-header-font-size: 8.5px');
    expect(source).toContain('--gantt-task-bg: #8b5cf6');
    expect(source).toContain('--gantt-summary-bg: #5f2d79');
  });

  it('vertically aligns professional-services grid copy across all three columns', () => {
    const source = readFileSync(resolve(useCasesRoot, 'professional-services/professional-services.presentation.scss'), 'utf8');

    expect(source).toContain('.rgCell.psa-grid-cell {');
    expect(source).toContain('align-items: center');
    expect(source).toContain('.psa-client-cell { display: flex; width: 100%; height: 100%');
    expect(source).toContain('.psa-consultant { display: flex; width: 100%; height: 100%');
  });

  it('keeps construction task bars compact within its denser rows', () => {
    const source = readFileSync(resolve(useCasesRoot, 'construction/construction.presentation.scss'), 'utf8');

    expect(source).toContain('--gantt-task-height: 18px');
    expect(source).toContain('--gantt-summary-height: 14px');
    expect(source).toContain('.industry-gantt-grid .tree-toggle {');
    expect(source).toContain('display: none');
  });

  it('matches the manufacturing valve-plan grid contract', () => {
    const source = readFileSync(resolve(useCasesRoot, 'manufacturing/manufacturing.presentation.scss'), 'utf8');

    expect(source).toContain("--revo-grid-font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
    expect(source).toContain('--revo-grid-font-size: 11.5px');
    expect(source).toContain('--revo-grid-header-height: 32px');
    expect(source).toContain('--gantt-task-height: 22px');
    expect(source).toContain('--gantt-summary-height: 8px');
    expect(source).toContain('--gantt-dependency-stroke: #747b84');
    expect(source).toContain('--gantt-summary-bg: #0b4c75');
  });

  it('uses compact inline capacity values instead of oversized resource badges', () => {
    const source = readFileSync(resolve(useCasesRoot, 'resource-planning/resource-planning.presentation.scss'), 'utf8');

    expect(source).toContain('.capacity-resource-capacity {');
    expect(source).toContain('.capacity-resource-load {');
    expect(source).toContain('background: transparent');
    expect(source).toContain('text-align: center');
  });

  it('keeps resource avatars circular and all resource cells vertically aligned', () => {
    const source = readFileSync(resolve(useCasesRoot, 'resource-planning/resource-planning.presentation.scss'), 'utf8');

    expect(source).toContain('--avatar-cell-size: 26px !important');
    expect(source).toContain('aspect-ratio: 1');
    expect(source).toContain('.rgCell.capacity-grid-cell {');
    expect(source).toContain('align-items: center');
  });

  it('matches the approved resource-capacity sheet density and typography', () => {
    const source = readFileSync(resolve(useCasesRoot, 'resource-planning/resource-planning.presentation.scss'), 'utf8');

    expect(source).toContain('--revo-grid-font-size: 11px');
    expect(source).toContain('--revo-grid-header-font-size: 10px');
    expect(source).toContain('--revo-grid-header-height: 42px');
    expect(source).toContain('.gantt-resource-capacity-line {');
    expect(source).toContain('border-top: 2px dashed rgba(0, 115, 234, .58)');
    expect(source).toContain('height: 29px !important');
    expect(source).toContain('bottom: 5px');
    expect(source).toContain('.gantt-resource-load--overallocated {');
    expect(source).toContain('background: #e2445c');
  });

  it('keeps ERP work orders readable and state pills vertically aligned', () => {
    const source = readFileSync(resolve(useCasesRoot, 'erp/erp.presentation.scss'), 'utf8');

    expect(source).toContain('.rgCell.erp-grid-cell {');
    expect(source).toContain('.erp-work-order {');
    expect(source).toContain('.erp-state {');
    expect(source).toContain('border-radius: 999px');
    expect(source).toContain('align-items: center');
  });
});
