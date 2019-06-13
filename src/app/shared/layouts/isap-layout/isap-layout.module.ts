import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Ng2BootstrapModule } from 'ngx-bootstrap';
import { ISapHeaderComponent } from './isap-header/isap-header.component';
import { ISapLayoutComponent } from './isap-layout.component';
import { ISapSidebarComponent } from './isap-sidebar/isap-sidebar.component';



@NgModule({
  imports: [
    CommonModule,
    PipesModule,
    RouterModule,
    Ng2BootstrapModule
  ],
  exports: [
    ISapLayoutComponent,
    ISapHeaderComponent,
    ISapSidebarComponent
  ],
  declarations: [
    ISapLayoutComponent,
    ISapHeaderComponent,
    ISapSidebarComponent
  ]
})
export class ISapLayoutModule { }
