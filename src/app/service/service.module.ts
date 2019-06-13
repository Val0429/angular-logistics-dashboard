import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from './common.service';
import { ConfigService } from './config.service';
import { environment } from 'environments/environment';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { I18nService } from './i18n.service';
import { IsapSidebarService } from './layouts/isap-layout/isap-sidebar.service';
import { LocationService } from './location.service';
import { NvrService } from './nvr.service';
import { ParseService } from './parse.service';
import { RouterModule } from '@angular/router';
import { UserService } from './user.service';
import { VideoService } from './video.service';

export function configServiceInit(config: ConfigService) {
  return () => config.load();
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    RouterModule,
    HttpClientModule
  ],
  providers: [
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configServiceInit,
      deps: [ConfigService],
      multi: true
    },
    ParseService,
    CommonService,
    UserService,
    IsapSidebarService,
    LocationService,
    VideoService,
    NvrService,
    I18nService
  ]
})
export class ServiceModule { }


