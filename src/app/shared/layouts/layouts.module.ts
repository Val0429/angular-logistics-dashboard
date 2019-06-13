import { NgModule } from '@angular/core';
import { ISapLayoutModule } from './isap-layout/isap-layout.module';
import {} from '../pipes/pipes.module';

@NgModule({
  exports: [
    ISapLayoutModule
  ]
})
export class LayoutsModule { }
