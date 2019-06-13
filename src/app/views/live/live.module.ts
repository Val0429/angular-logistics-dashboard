import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { LiveRoutingModule } from './live-routing.module';
import { LiveComponent } from './live.component';
import { LiveSidebarComponent } from './live-sidebar/live-sidebar.component';


@NgModule({
  imports: [
    SharedModule,
    LiveRoutingModule
  ],
  declarations: [
    LiveComponent,
     LiveSidebarComponent]
})
export class LiveModule { }
