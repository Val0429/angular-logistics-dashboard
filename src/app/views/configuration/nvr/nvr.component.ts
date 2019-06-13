import { Component, OnInit } from '@angular/core';
import { Configuration } from 'app/domain';
import { I18nService } from 'app/service/i18n.service';
import { NvrService } from 'app/service/nvr.service';
import { ParseService } from 'app/service/parse.service';
import { ConfigurationKeyType, INvrServerConfig } from 'isap-logistics-solution-lib';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-nvr',
  templateUrl: './nvr.component.html',
  styleUrls: ['./nvr.component.css']
})
export class NvrComponent implements OnInit {

  isSaving = false;

  nvr: INvrServerConfig = {};

  configuration: Configuration;

  constructor(
    private parseService: ParseService,
    private nvrService: NvrService,
    private i18nService: I18nService
  ) { }

  ngOnInit() {
    this.getNvrConfig()
      .subscribe();
  }

  getNvrConfig() {
    const get$ = Observable.fromPromise(
      this.parseService.fetchData(Configuration, query => query.equalTo('key', ConfigurationKeyType.NVR))
    )
      .map(configs => {
        if (!Array.isArray(configs) || configs.length < 1) {
          this.configuration = new Configuration({ key: ConfigurationKeyType.NVR });
          return;
        }
        this.configuration = configs[0];
      })
      .map(() => this.nvr = this.configuration.value || {})
      .map(() => this.updateNvrService());
    return get$;
  }

  save() {
    this.configuration.value = this.nvr;
    this.isSaving = true;
    this.configuration.save()
      .then(() => alert(this.i18nService.transform('ALERT_SUCCESSFULLY_SAVED')))
      .then(() => this.isSaving = false)
      .then(() => this.updateNvrService());
  }

  updateNvrService() {
    this.nvrService.host = this.nvr.serverIp;
    this.nvrService.port = this.nvr.serverPort;
    this.nvrService.username = this.nvr.serverAccount;
    this.nvrService.password = this.nvr.serverPassword;
    this.nvrService.isHttps = this.nvr.isHttps;
  }

}
