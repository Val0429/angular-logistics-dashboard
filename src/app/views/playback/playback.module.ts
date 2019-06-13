import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { PlaybackRoutingModule } from './playback-routing.module';
import { PlaybackComponent } from './playback.component';
import { PlaybackSidebarComponent } from './playback-sidebar/playback-sidebar.component';
import { PlaybackControlsComponent } from './playback-controls/playback-controls.component';
import { PlaybackChannelsComponent } from './playback-channels/playback-channels.component';



@NgModule({
  imports: [
    SharedModule,
    PlaybackRoutingModule
  ],
  declarations: [PlaybackComponent, PlaybackSidebarComponent, PlaybackControlsComponent,  PlaybackChannelsComponent]
})
export class PlaybackModule { }
