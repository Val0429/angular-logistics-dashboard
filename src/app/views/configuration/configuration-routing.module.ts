import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationSidebarComponent } from './configuration-sidebar/configuration-sidebar.component';
import { GeneralComponent } from './general/general.component';
import { LocationComponent } from './location/location.component';
import { NvrComponent } from './nvr/nvr.component';
import { UserComponent } from './user/user.component';
import { AboutComponent } from 'app/views/configuration/about/about.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'user',
    pathMatch: 'full'
  },
  {
    path: 'user',
    component: UserComponent
  },
  {
    path: 'nvr',
    component: NvrComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  // {
  //   path: 'general',
  //   component: GeneralComponent
  // },
  {
    path: 'location',
    component: LocationComponent
  },
  {
    path: '',
    component: ConfigurationSidebarComponent,
    outlet: 'sidebar'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
