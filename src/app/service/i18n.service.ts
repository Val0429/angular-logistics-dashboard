import { ConfigService, IWebConfig } from './config.service';
import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';

@Injectable()
export class I18nService {

  get dictionary() {
    return this.configService.langs[this.configService.currentLang];
  }

  constructor(
    private configService: ConfigService
  ) {

  }

  transform(key: string, args?: any[]) {
    if (!this.dictionary || !this.dictionary[key]) {
      return key;
    }
    // return this.dictionary[key].format_array(args[0]);
    return this.dictionary[key];
  }

}
