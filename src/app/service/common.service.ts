import { ParseService } from './parse.service';
import { Injectable } from '@angular/core';
import * as xml2js from 'xml2js';
import { Observable } from 'rxjs/Observable';
import { NvrService } from 'app/service/nvr.service';

@Injectable()
export class CommonService {

  authorization = `Basic ${new Buffer('Admin:123456', 'ascii').toString('base64')}`;

  constructor(
    private parseService: ParseService,
    private nvrService: NvrService
  ) { }

  xmlToJson(args: {
    xml: string,
    options?: xml2js.Options
  }) {
    const convert$ = Observable.fromPromise(
      new Promise((resolve, reject) =>
        xml2js.parseString(args.xml, args.options || {}, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        })
      )
    );
    return convert$;
  }

    apiProxy(params: {
    url: string,
    method?: string,
    headers?: { [key: string]: string },
    body?: any
  }) {
    const requestInit: any = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(params)
    };
    const proxy$ = Observable.fromPromise(fetch(this.parseService.serverUrl + '/api-proxy', requestInit));
    return proxy$;
  }
}
