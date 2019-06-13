import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ConfigurationRoutingModule } from './configuration-routing.module';
import { GeneralComponent } from './general/general.component';
import { LicenseManagementComponent } from './license-management/license-management.component';
import { LocationComponent } from './location/location.component';
import { NvrComponent } from './nvr/nvr.component';
import { UserComponent } from './user/user.component';
import { ConfigurationSidebarComponent } from './configuration-sidebar/configuration-sidebar.component';
import { AboutComponent } from './about/about.component';


@NgModule({
  imports: [
    SharedModule,
    ConfigurationRoutingModule
  ],
  declarations: [
    NvrComponent,
    LocationComponent,
    UserComponent,
    GeneralComponent,
    LicenseManagementComponent,
    ConfigurationSidebarComponent,
    AboutComponent
  ]
})
export class ConfigurationModule { }
