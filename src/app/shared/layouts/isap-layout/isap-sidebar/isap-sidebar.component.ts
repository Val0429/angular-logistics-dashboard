import { OnInit, Component, Input, ElementRef } from '@angular/core';
import { IsapSidebarService } from 'app/service/layouts/isap-layout/isap-sidebar.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-isap-sidebar',
  templateUrl: './isap-sidebar.component.html',
  styleUrls: ['./isap-sidebar.component.css']
})
export class ISapSidebarComponent implements OnInit {

  @Input() isStaticSidebar = true;

  @Input() isMouseInSidebar = false;

  /** 如果 是 Static 模式 且 滑鼠沒有移入 Sidebar 時，應收合選單 */
  get isInStaticAndMouseIn() {
    return this.isStaticSidebar ? false : !this.isMouseInSidebar;
  }

  constructor(
    protected isapSidebarService: IsapSidebarService
  ) { }

  ngOnInit() {
  }

  toggleIconClassName(result: boolean) {
    const config = {
      'fa-angle-left': !result,
      'fa-angle-down': !!result
    };
    return config;
  }
}
