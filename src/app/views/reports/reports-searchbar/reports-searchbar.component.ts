import { Component, OnInit } from '@angular/core';
import { Location, ScanEvent } from 'app/domain';
import { ParseService } from 'app/service/parse.service';
import { ScanEventExceptionType } from 'isap-logistics-solution-lib';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-reports-searchbar',
  templateUrl: './reports-searchbar.component.html',
  styleUrls: ['./reports-searchbar.component.css']
})
export class ReportsSearchbarComponent implements OnInit {

  locations: Location[] = [];

  /** 查詢地點名稱 */
  locationId = '';
  /** 查詢起始日期  */
  beginDate: string = moment().format('YYYY-MM-DD');
  /** 查詢起始時間  */
  beginTime = '00:00 AM';

  /** 查詢結束日期 */
  endDate = '';

  exceptionStatusNames = Object.values(ScanEventExceptionType);
  /** 查詢結束時間 */
  endTime = '';

  /** 列外查詢 */
  exceptionName = '';

  scanEvents: ScanEvent[];

  get getBeginDateTime() {
    const dateTime = +moment(this.beginDate + this.beginTime, 'YYYY-MM-DD hh:mm A');
    if (Number.isFinite(dateTime)) {
      return dateTime;
    }
    return 0;
  }

  get getEndDateTime() {
    const dateTime = +moment(this.endDate + this.endTime, 'YYYY-MM-DD hh:mm A');
    if (Number.isFinite(dateTime)) {
      return dateTime;
    }
    return 0;
  }

  constructor(
    private parseService: ParseService
  ) { }

  ngOnInit() {
  }

  clickSearch() {
    this.fetchScanEvents().subscribe();
  }

  /** 取得地點資料 */
  fetchLocations() {
    const query$ = Observable.fromPromise(this.parseService.fetchData(Location))
      .map(location => {
        this.locations = location;
        console.log(this.locations);
      });
    return query$;
  }

  fetchScanEvents() {
    const query$ = Observable.fromPromise(this.parseService.fetchData(ScanEvent,
      query => {

        query.equalTo('type', 'Order');

        if (this.locationId) {
          query.include('location');
          console.log(this.locationId);
          const queryOrder = new Parse.Query(Location);
          queryOrder.equalTo('objectId', this.locationId);
          query.matchesQuery('location', queryOrder);
        }

        if (this.getBeginDateTime > 0) {
          console.log(this.getBeginDateTime);
          query.greaterThan('scanAt', new Date(this.getBeginDateTime));
        }

        if (this.getEndDateTime > 0) {
          query.lessThan('scanAt', new Date(this.getEndDateTime));
        }

        if (this.exceptionName) {
          query.equalTo('status', this.exceptionName);
        }

      })).map(event => this.scanEvents = event);
    return query$;
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

}
