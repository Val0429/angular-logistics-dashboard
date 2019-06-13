import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveSidebarComponent } from './live-sidebar/live-sidebar.component';
import { LiveComponent } from './live.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'all',
    pathMatch: 'full'
  },
  {
    path: 'all',
    component: LiveComponent
  },
  {
    path: ':locationID',
    component: LiveComponent,
  },
  {
    path: '',
    component: LiveSidebarComponent,
    outlet: 'sidebar'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LiveRoutingModule { }
