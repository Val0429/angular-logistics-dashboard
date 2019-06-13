import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaybackSidebarComponent } from './playback-sidebar/playback-sidebar.component';
import { PlaybackComponent } from './playback.component';
import { PlaybackControlsComponent } from './playback-controls/playback-controls.component';

const routes: Routes = [
  {
    path: '',
    component: PlaybackComponent
  },
  {
    path: '',
    component: PlaybackControlsComponent,
    outlet: 'mask-layout'
  },
  {
    path: '',
    component: PlaybackSidebarComponent,
    outlet: 'sidebar'
  },
  {
    path: ':id',
    component: PlaybackComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlaybackRoutingModule { }
