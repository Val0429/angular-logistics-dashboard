import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { ReportsSidebarComponent } from './reports-sidebar/reports-sidebar.component';
import { ReportsExceptionComponent } from './reports-exception/reports-exception.component';
import { ReportsAdvancedComponent } from './reports-advanced/reports-advanced.component';
import { ReportsCalendarComponent } from './reports-calendar/reports-calendar.component';
import { ReportsSearchbarComponent } from './reports-searchbar/reports-searchbar.component';


@NgModule({
  imports: [
    SharedModule,
    ReportsRoutingModule
  ],
  declarations: [ReportsComponent, ReportsSidebarComponent, ReportsExceptionComponent, ReportsAdvancedComponent, ReportsCalendarComponent,  ReportsSearchbarComponent]
})
export class ReportsModule { }
