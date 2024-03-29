import { NgModule, Optional, SkipSelf } from '@angular/core';
import { DndModule } from 'ng2-dnd';
import { Ng2BootstrapModule } from 'ngx-bootstrap';
import { LoginGuard } from './login.guard';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { PermissionGuard } from './permission.guard';

@NgModule({
  imports: [
    DndModule.forRoot(),
    Ng2BootstrapModule.forRoot()
  ],
  providers: [LoginGuard, PermissionGuard]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
