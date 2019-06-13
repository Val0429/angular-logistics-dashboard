import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Location, ScanEvent } from 'app/domain';
import { I18nService } from 'app/service/i18n.service';
import { IsapSidebarService } from 'app/service/layouts/isap-layout/isap-sidebar.service';
import { ParseService } from 'app/service/parse.service';
import { ScanEventExceptionType } from 'isap-logistics-solution-lib';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-playback-controls',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('100ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          style({ opacity: 1 }),
          animate('100ms', style({ opacity: 0 }))
        ])
      ]
    )
  ],
  templateUrl: './playback-controls.component.html',
  styleUrls: ['./playback-controls.component.css']
})
export class PlaybackControlsComponent implements OnInit {

  locations: Location[] = [];

  /** 查詢起始日期  */
  beginDate: string = moment().format('YYYY-MM-DD');
  /** 查詢起始時間  */
  beginTime = '00:00 AM';

  /** 查詢結束日期 */
  endDate = '';

  exceptionStatusNames = Object.values(ScanEventExceptionType);
  /** 查詢結束時間 */
  endTime = '';

  packageNo = ""

  scanEvents: ScanEvent[];


  get getBeginDateTime() {
    const dateTime = +moment(this.beginDate + this.beginTime, 'YYYY-MM-DDhh:mm A');
    if (Number.isFinite(dateTime)) {
      return dateTime;
    }
    return 0;
  }

  get getEndDateTime() {

    const dateTime = +moment(this.endDate + this.getEndTime, 'YYYY-MM-DDhh:mm A');
    if (Number.isFinite(dateTime)) {
      return dateTime;
    }
    return 0;
  }

  get getEndTime() {
    if (this.endTime === '') {
      return '11:59 PM';
    }
    return this.endTime;
  }


  constructor(
    public isapSidebarService: IsapSidebarService,
    private parseService: ParseService,
    private i18nService: I18nService
  ) {
  }

  ngOnInit() {
    this.fetchLocations().do(
      () => this.fetchScanEvents()
    ).subscribe();
  }



  clickSearch() {
    this.fetchScanEvents().subscribe();
  }

  /** 取得地點資料 */
  fetchLocations() {
    const query$ = Observable.fromPromise(this.parseService.fetchData(Location, query => {
      query.ascending('sequence');
    }))
      .map(location => {
        this.locations = location;
      });
    return query$;
  }

  fetchScanEvents() {
    const query$ = Observable.fromPromise(this.parseService.fetchData(ScanEvent,
      query => {

        query.equalTo('type', 'Order');

        const locationId = $('#selectLocationID').val();

        const exceptionName = $('#selectExceptionName').val();
        
        if (locationId) {
          query.include('location');
          const queryOrder = new Parse.Query(Location);
          queryOrder.equalTo('objectId', locationId);
          query.matchesQuery('location', queryOrder);
        }

        this.packageNo = $('#packageNo').val().toString();
       
        // if (this.packagNo.le > 0) {
        //   query.include('location');
        //   const queryOrder = new Parse.Query(Location);
        //   queryOrder.equalTo('objectId', locationId);
        //   query.matchesQuery('location', queryOrder);
        // }
        

        if (this.getBeginDateTime > 0) {
          query.greaterThan('scanAt', new Date(this.getBeginDateTime));
        }

        if (this.getEndDateTime > 0) {
          query.lessThan('scanAt', new Date(this.getEndDateTime));
        }

        if (exceptionName) {
          query.equalTo('status', exceptionName);
        }

        query.descending('scanAt');

      })).map(event => {
        this.scanEvents = event;
        console.log(this.scanEvents)
        if (this.scanEvents.length < 1) {
          alert(this.i18nService.transform('ALERT_DATA_NOT_FOUND'));
        }
      });
    return query$;
  }

  getScanEvent() {
    this.isapSidebarService.toggleMaskLayoutActive();
  }

  beginDateChange(val: string) {
    this.beginDate = val;
  }

  beginTimeChange(val: string) {
    this.beginTime = val;
  }

  endDateChange(val: string) {
    this.endDate = val;
  }

  endTimeChange(val: string) {
    this.endTime = val;
  }

  getPackageNo(scanData:string)
  {
    if (scanData.indexOf("|")>-1)
    {
      return scanData.split("|")[0];
    }else{
      return scanData;
    }

  }

}
