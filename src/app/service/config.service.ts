import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ConfigService {

  configs: { [key: string]: any } = {};

  // lang: { [key: string]: string } = {};

  langs: { [key: string]: { [key: string]: string } } = {};

  currentLang: string;

  constructor(
    private http: Http
  ) {
    const lang = localStorage.getItem('lang');
    this.currentLang = lang || 'zh_TW';
  }

  load() {
    // 讀取設定檔
    const configs$ = Observable.from([
      'web',
      'parse'
    ])
      .mergeMap(file => this.loadJsonFile({
        url: `/config/${file}.config`,
        callback: data => this.configs[file] = data || {}
      }))
      .toArray()
      .switchMap(() => Observable.from([
        'en_US',
        'zh_CN',
        'zh_TW'
      ]).mergeMap(fileName => this.loadJsonFile({
        url: `/lang/${fileName}`,
        callback: data => this.langs[fileName] = data || {}
      })))
      .toArray()
      .toPromise();

    return configs$;
  }

  loadJsonFile(args: {
    url: string,
    callback: (data: any) => void
  }) {
    const load$ = this.http.get(`${environment.apiBasePath}${args.url}.json?v=${Date.now()}`)
      .map(res => res.json())
      .do(data => args.callback(data));
    return load$;
  }
}

export interface IWebConfig {
  lang?: string;
}

export interface IParseConfig {
  IS_HTTPS: boolean;
  APPLICATION_ID: string;
  JAVASCRIPT_KEY: string;
  MASTER_KEY: string;
}
