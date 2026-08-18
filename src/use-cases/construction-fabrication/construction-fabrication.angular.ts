import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { mountConstructionFabricationWorkspace } from './construction-fabrication.workspace';
@Component({ selector: 'construction-fabrication-gantt', standalone: true, encapsulation: ViewEncapsulation.None, styleUrls: ['./construction-fabrication.scss'], template: '<div #host></div>' })
export class ConstructionFabricationGanttComponent implements AfterViewInit, OnDestroy { @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>; private dispose?: () => void; ngAfterViewInit(){ this.dispose = mountConstructionFabricationWorkspace(this.host.nativeElement); } ngOnDestroy(){ this.dispose?.(); } }
