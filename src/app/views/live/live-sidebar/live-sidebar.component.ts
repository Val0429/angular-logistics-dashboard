import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Location, LocationChannel } from 'app/domain';
import { ParseService } from 'app/service/parse.service';
import { IPageViewerOptions, PageViewerComponent } from 'app/shared/components/page-viewer/page-viewer.component';
import { Observable } from 'rxjs/Observable';
import { retry } from 'rxjs/operator/retry';

@Component({
  selector: 'app-live-sidebar',
  templateUrl: './live-sidebar.component.html',
  styleUrls: ['./live-sidebar.component.css']
})
export class LiveSidebarComponent implements OnInit {

  locationName = '';

  locations: Location[] = [];

  constructor(private parseService: ParseService) { }

  ngOnInit() {
    this.fetchLocation()
      .subscribe();
  }

  /** 取得地點 */
  fetchLocation() {
    const query$ = Observable.fromPromise(this.parseService.fetchData(Location, query => {
      query.ascending('sequence');
    }))
      .map(location => this.locations = location);
    return query$;
  }
}
