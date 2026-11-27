import '@revolist/ui/styles.css';
// src/examples/showcase/gantt.angular.ts
import {
  Component,
  ElementRef,
  NO_ERRORS_SCHEMA,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import type { AfterViewInit, OnDestroy } from '@angular/core';
import { mountShowcase } from './gantt-showcase-mount';

@Component({
  selector: 'gantt-showcase-grid',
  standalone: true,
  host: {
    class: 'gantt-showcase-angular-host',
  },
  // Allows Angular demos to bind RevoGrid plugin props that are not wrapper inputs.
  schemas: [NO_ERRORS_SCHEMA],
  imports: [],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./gantt.scss'],
  template: `<div #host class="gantt-showcase-host grow h-full"></div>`,
})
export class GanttShowcaseGridComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { read: ElementRef }) private hostElement?: ElementRef<HTMLElement>;
  private disposeShowcase?: () => void;

  ngAfterViewInit(): void {
    if (this.hostElement)
      this.disposeShowcase = mountShowcase(this.hostElement.nativeElement);
  }

  ngOnDestroy(): void {
    this.disposeShowcase?.();
  }
}
