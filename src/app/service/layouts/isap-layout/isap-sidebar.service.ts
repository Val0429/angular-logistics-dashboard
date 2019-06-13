import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class IsapSidebarService {

    isStaticSidebar = true;

    isMouseInSidebar = false;

    maskLayoutActive = false;

    /** 如果 是 Static 模式 且 滑鼠沒有移入 Sidebar 時，應收合選單 */
    get isInStaticAndMouseIn() {
        return this.isStaticSidebar ? false : !this.isMouseInSidebar;
    }
    constructor(
        private router: Router
    ) { }

    toggleIconClassName(result: boolean) {
        const config = {
            'fa-angle-left': !!result,
            'fa-angle-down': !result
        };
        return config;
    }

    toggleMaskLayoutActive() {
        this.maskLayoutActive = !this.maskLayoutActive;
    }


}
