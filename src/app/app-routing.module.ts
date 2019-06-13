import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from './core/login.guard';
import { ISapLayoutComponent } from './shared/layouts/isap-layout/isap-layout.component';
import { LoginComponent } from './views/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: ISapLayoutComponent,
    canActivate: [LoginGuard],
    children: [
      {
        path: '',
        redirectTo: 'live',
        pathMatch: 'full'
      },
      {
        path: 'live',
        loadChildren: 'app/views/live/live.module#LiveModule'
      },
      {
        path: 'playback',
        loadChildren: 'app/views/playback/playback.module#PlaybackModule'
      },
      {
        path: 'reports',
        loadChildren: 'app/views/reports/reports.module#ReportsModule'
      },
      {
        path: 'configuration',
        loadChildren: 'app/views/configuration/configuration.module#ConfigurationModule'
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    // 萬用路由，此條務必置於路由配置集合的最後一個，因為路由讀取有順序性
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // 需要觀察路由變化的話，再改成 True
    enableTracing: false
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
