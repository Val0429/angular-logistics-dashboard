import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NestableComponent } from './nestable/nestable.component';
import { PageViewerComponent } from './page-viewer/page-viewer.component';
import { TimelineComponent } from './timeline/timeline.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    PageViewerComponent,
    NestableComponent,
    TimelineComponent
  ],
  declarations: [
    PageViewerComponent,
    NestableComponent,
    TimelineComponent
  ]
})
export class ComponentsModule { }
