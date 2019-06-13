import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, LocationChannel, ScanEvent } from 'app/domain';
import { IsapSidebarService } from 'app/service/layouts/isap-layout/isap-sidebar.service';
import { ParseService } from 'app/service/parse.service';
import { ScanEventType } from 'isap-logistics-solution-lib';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-playback-sidebar',
  templateUrl: './playback-sidebar.component.html',
  styleUrls: ['./playback-sidebar.component.css']
})
export class PlaybackSidebarComponent implements OnInit {

  constructor(
    public isapSidebarService: IsapSidebarService,
    private parseService: ParseService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {

  }

}
