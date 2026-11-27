import '@revolist/ui/styles.css';
import './gantt.scss';
import { mountShowcase } from './gantt-showcase-mount';

export { mountShowcase } from './gantt-showcase-mount';

export function load(parentSelector: string): (() => void) | undefined {
  const parent = document.querySelector(parentSelector);
  if (!(parent instanceof HTMLElement)) return;
  return mountShowcase(parent);
}
