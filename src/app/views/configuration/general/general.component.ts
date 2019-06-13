import { Component, OnInit } from '@angular/core';
import { Configuration } from 'app/domain';
import { I18nService } from 'app/service/i18n.service';
import { ParseService } from 'app/service/parse.service';
import { ConfigurationKeyType, IGeneralConfig } from 'isap-logistics-solution-lib';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})
export class GeneralComponent implements OnInit {

  isSaving = false;

  general: IGeneralConfig = {};

  configuration: Configuration;

  constructor(
    private parseService: ParseService,
    private i18nService: I18nService
  ) { }

  ngOnInit() {
    this.getGeneralConfig()
      .subscribe();
  }

  getGeneralConfig() {
    const get$ = Observable.fromPromise(
      this.parseService.fetchData(Configuration, query => query.equalTo('key', ConfigurationKeyType.GENERAL))
    ).map(configs => {
      if (!Array.isArray(configs) || configs.length < 1) {
        this.configuration = new Configuration({ key: ConfigurationKeyType.GENERAL });
        return;
      }
      this.configuration = configs[0];
    }).map(() => this.general = this.configuration.value || {});
    return get$;
  }

  save() {
    this.configuration.value = this.general;
    this.isSaving = true;
    this.configuration.save()
      .then(() => alert(this.i18nService.transform('ALERT_SUCCESSFULLY_SAVED')))
      .then(() => this.isSaving = false);
  }

}
