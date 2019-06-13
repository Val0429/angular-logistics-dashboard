import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'locationsFilter'
})
export class LocationsFilterPipe implements PipeTransform {

  /** 地點名稱搜尋 */
  transform(values: any[], name: string): any {

    if (!name) {
      return values;
    }
    return values.filter(value => value.name.toUpperCase().includes(name.toUpperCase()));
  }
}
