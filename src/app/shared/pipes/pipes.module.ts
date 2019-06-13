import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationsFilterPipe } from './locations-filter.pipe';
import { I18nPipe } from './i18n.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    LocationsFilterPipe,
    I18nPipe
  ],
  declarations: [LocationsFilterPipe, I18nPipe]
})
export class PipesModule { }
