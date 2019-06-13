import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location, LocationChannel } from 'app/domain';
import { I18nService } from 'app/service/i18n.service';
import { NvrService } from 'app/service/nvr.service';
import { ParseService } from 'app/service/parse.service';
import { IPageViewerOptions, PageViewerComponent } from 'app/shared/components/page-viewer/page-viewer.component';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.css']
})
export class LiveComponent implements OnInit, AfterViewInit {

  @ViewChild(PageViewerComponent) pageViewer: PageViewerComponent;

  serverUrl = '';

  locations: Location[] = [];

  locationChannels: LocationChannel[] = [];

  selectedChannelIndex = 0;

  currentLocation = '';

  time = 0;

  /** 版面配置 1 = 1 × 1, 2 = 2 × 2 ... */
  layoutRange = 3;

  get displaySize() {
    return Math.pow(this.layoutRange, 2);
  }

  pageViewerOptions: IPageViewerOptions;

  get displayBegin() {
    if (!this.pageViewerOptions) {
      return 0;
    }
    return (this.pageViewerOptions.currentPage - 1) * this.displaySize;
  }

  get displayEnd() {
    return this.displayBegin + this.displaySize;
  }

  get totalPage() {
    return Math.ceil(this.locationChannels.length / this.displaySize);
  }


  constructor(
    private parseService: ParseService,
    private activatedRoute: ActivatedRoute,
    private nvrService: NvrService,
    private i18nService: I18nService
  ) { }

  ngOnInit() {
    this.serverUrl = this.parseService.serverUrl;
    this.fetchRouteParams()
      .switchMap(() => this.fetchChannels())
      .subscribe();
  }

  ngAfterViewInit() {
    this.fetchTimer()
      .subscribe();
  }

  fetchTimer() {
    const timer$ = Observable.timer(0, 150)
      .do(time => {
        this.time = time;
      });
    return timer$;
  }

  /** 取得訂單ID */
  fetchRouteParams() {
    const params$ = this.activatedRoute.params
      .map(params => {
        const queryID = params['locationID'] || '';
        if ('all' === queryID) {
          this.currentLocation = '';
          return queryID;
        } else {
          this.currentLocation = queryID;
          return queryID;
        }
      });
    return params$;
  }

  getChannelSnapshot(channelNo: string) {
    return `${this.parseService.serverUrl}/snapshot?channel=${channelNo}&host=${this.nvrService.host}&port=${this.nvrService.port}&usr=${this.nvrService.username}&pwd=${this.nvrService.password}&isHttps=${this.nvrService.isHttps}&v=${this.time}`;
  }

  pageChange(pageNum: number) {
    this.pageViewerOptions.currentPage = pageNum || 1;
  }

  refreshPageViewer() {
    this.pageViewerOptions.itemVisibleSize = this.displaySize;
    this.pageViewer.updatePageInfo(this.pageViewerOptions);
  }

  /** 取得頻道 */
  fetchChannels() {
    const query$ = Observable.fromPromise(this.parseService.fetchData(LocationChannel, query => {
      // 查詢特定 Loaction 時，進行過濾
      const queryLocationId = this.currentLocation;
      if (queryLocationId.length > 0) {
        query.include('location');
        const queryLocation = new Parse.Query(Location);
        queryLocation.equalTo('objectId', queryLocationId);
        query.matchesQuery('location', queryLocation);
      }
      query.ascending('sequence');
    }))
      .map(locationChannels => this.locationChannels = locationChannels)
      .do(() => {
        this.pageViewerOptions = {
          currentPage: 1,
          pageVisibleSize: 10,
          itemVisibleSize: this.displaySize,
          itemCount: this.locationChannels.length
        };
      });
    return query$;
  }


  /** 取得選擇的 channel */
  selectChannel(device: LocationChannel) {
    const selectedChannelIndex = this.getSelectedChannelIndex(device) + 1;
    this.pageViewerOptions.currentPage = selectedChannelIndex;
    this.layoutRange = 1;
    this.refreshPageViewer();
  }

  /** 取得 index */
  getSelectedChannelIndex(device: LocationChannel): number {
    return this.locationChannels.findIndex(channelID => device.nvrChannelNo === channelID.nvrChannelNo);
  }

  /** 影像截圖 */
  downloadSnapshot(device: LocationChannel) {
    const url = this.getChannelSnapshot(device.nvrChannelNo);

    const options: any = {
      keepalive: false,
      timeout: 500,
      method: 'Get'
    };

    const fetch$ = fetch(url, options);
    fetch$.catch(console.log);
    Observable.fromPromise(fetch$)
      .timeout(800)
      .do(res => {
        if (!res.ok) {
          return;
        }
        this.saveFile(device.nvrChannelNo, url);
      })
      .toPromise()
      .catch(() => alert(this.i18nService.transform('ALERT_DATA_NOT_FOUND')));
  }

  saveFile(fileName: string, url: string) {
    const saveImg = document.createElement('a');
    saveImg.href = url;
    saveImg.target = '_blank';
    saveImg.download = `${moment(Date.now()).format('YYYY_MM_DD_HH_mm_ss_SSS')}.jpg`;
    saveImg.click();
    saveImg.remove();
  }
}
