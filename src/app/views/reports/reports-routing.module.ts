import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsSidebarComponent } from './reports-sidebar/reports-sidebar.component';
import { ReportsComponent } from './reports.component';
import { ReportsExceptionComponent } from 'app/views/reports/reports-exception/reports-exception.component';
import { ReportsAdvancedComponent } from 'app/views/reports/reports-advanced/reports-advanced.component';
import { ReportsCalendarComponent } from 'app/views/reports/reports-calendar/reports-calendar.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'exceptions',
    component: ReportsComponent
  },
  {
    path: '',
    component: ReportsSidebarComponent,
    outlet: 'sidebar'
  },
  {
    path: 'exceptions',
    component: ReportsExceptionComponent,
  },
  {
    path: 'advanced',
    component: ReportsAdvancedComponent,
  },
  {
    path: 'calendar',
    component: ReportsCalendarComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
