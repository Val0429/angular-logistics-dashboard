import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Configuration, Location, LocationChannel, ScanEvent, ScanEventVideo } from 'app/domain';
import { NvrService } from 'app/service/nvr.service';
import { environment } from 'environments/environment';
import { ConfigurationKeyType, IConfiguration, INvrServerConfig, IScanEvent } from 'isap-logistics-solution-lib';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx';
import { ConfigService, IParseConfig } from './config.service';

@Injectable()
export class ParseService {

  host = '172.16.10.182';

  port = 1337;

  isHttps = false;

  get httpType() {
    return this.isHttps ? 'https' : 'http';
  }

  get serverUrl() {
    return `${this.httpType}://${this.host}:${this.port}`;
  }

  get parseServerUrl() {
    return `${this.httpType}://${this.host}:${this.port}/parse`;
  }

  get parseConfig(): IParseConfig {
    return this.configService.configs['parse'];
  }

  constructor(
    private nvrService: NvrService,
    private configService: ConfigService
  ) {
  }

  createLiveQueryWatcher<T extends Parse.Object>(args: {
    type: new (options?: any) => T,
    action: LiveQueryEventType,
    filter?: (query: Parse.Query<T>) => void
  }): Subject<ILiveQueryData<T>> {
    const subject: Subject<ILiveQueryData<T>> = new Subject();
    const query = new Parse.Query(args.type);
    if (args.filter) {
      args.filter(query);
    }

    const sub$ = (query as any).subscribe();
    Object.values(LiveQueryEventType)
      .filter(key => typeof (key) === 'string')
      .forEach(key => {
        if (!(args.action & (LiveQueryEventType[key] as any))) {
          return;
        }
        const action = key.toLocaleLowerCase();
        sub$.on(action, event => subject.next({
          action: action,
          data: event
        }));
      });

    return subject;
  }

  /** 初始化 Parse Server */
  initParseServer() {

    if (!this.parseConfig || Object.keys(this.parseConfig).length < 1) {
      return Observable.of(null);
    }

    this.isHttps = this.parseConfig.IS_HTTPS || false;

    Parse.initialize(this.parseConfig.APPLICATION_ID, this.parseConfig.JAVASCRIPT_KEY);
    Parse.masterKey = this.parseConfig.MASTER_KEY;
    Parse.serverURL = this.parseServerUrl;

    Parse.Object.registerSubclass('Location', Location);
    Parse.Object.registerSubclass('LocationChannel', LocationChannel);
    Parse.Object.registerSubclass('ScanEvent', ScanEvent);
    Parse.Object.registerSubclass('ScanEventVideo', ScanEventVideo);
    Parse.Object.registerSubclass('Configuration', Configuration);

    return this.getNvrConfig();
  }

  getNvrConfig() {
    const get$ = Observable.fromPromise(
      this.fetchData(Configuration, query => query.equalTo('key', ConfigurationKeyType.NVR))
    ).map(configs => {
      let configuration: Configuration = new Configuration({ key: ConfigurationKeyType.NVR });
      if (configs.length > 0) {
        configuration = configs[0];
      }
      return configuration.value;
    }).map((config: INvrServerConfig) => {
      if (!config) {
        return;
      }
      this.nvrService.host = config.serverIp;
      this.nvrService.port = config.serverPort;
      this.nvrService.username = config.serverAccount;
      this.nvrService.password = config.serverPassword;
      this.nvrService.isHttps = config.isHttps;

      return config;
    });
    return get$;
  }

  fetchData<T extends Parse.Object>(
    type: new (options?: any) => T,
    filter?: (query: Parse.Query<T>) => void
  ): Parse.Promise<T[]> {
    const query = new Parse.Query(type);
    if (filter) {
      filter(query);
    }
    return query.find();
  }
  fetchPaging<T extends Parse.Object>(
    type: new (options?: any) => T,
    args: {
      currentPage: number,
      itemVisibleSize: number,
      filter?: (query: Parse.Query<T>) => void
    }): Parse.Promise<T[]> {
    const locations = this.fetchData<T>(type, query => {
      query.limit(args.itemVisibleSize);
      query.skip((args.currentPage - 1) * args.itemVisibleSize);
      if (args && args.filter) {
        args.filter(query);
      }
    });
    return locations;
  }
  countFetch<T extends Parse.Object>(
    type: new (options?: any) => T,
    filter?: (query: Parse.Query<T>) => void): Parse.Promise<number> {
    const query = new Parse.Query(type);
    if (filter) {
      filter(query);
    }
    return query.count();
  }
}

export interface ILiveQueryData<T> {
  action: string;
  data: T;
}

export enum LiveQueryEventType {
  CREATE = 1,
  ENTER = 2,
  UPDATE = 4,
  LEAVE = 8,
  DELETE = 16
}
