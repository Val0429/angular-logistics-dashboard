import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from 'app/service/i18n.service';

@Pipe({
  name: 'i18n'
})
export class I18nPipe implements PipeTransform {

  constructor(
    private i18nService: I18nService
  ) {
  }

  transform(key: string, ...args): any {
    return this.i18nService.transform(key, args);
  }
}
