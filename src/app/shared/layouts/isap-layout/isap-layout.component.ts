import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IsapSidebarService } from 'app/service/layouts/isap-layout/isap-sidebar.service';

@Component({
  selector: 'app-isap-layout',
  templateUrl: './isap-layout.component.html',
  styleUrls: ['./isap-layout.component.css']
})
export class ISapLayoutComponent implements OnInit, AfterViewInit {

  // @ViewChild('sidebar') sidebar: ElementRef;

  // @ViewChild('content') content: ElementRef;

  // isStaticSidebar = true;

  // isMouseInSidebar = false;

  constructor(
    public isapSidebarService: IsapSidebarService
  ) { }

  ngOnInit() {
    this.isapSidebarService.isStaticSidebar = window.innerWidth > 1100;
    $(window).resize(event => this.isapSidebarService.isStaticSidebar = window.innerWidth > 1100);
  }

  ngAfterViewInit() {
  }
}
