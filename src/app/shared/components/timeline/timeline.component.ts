import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ScanEvent } from 'app/domain';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild('timeline') timeline: ElementRef;

  @ViewChild('adapter') adapter: ElementRef;

  @ViewChild('numberBar') numberBar: ElementRef;

  @ViewChild('timelineContainer') timelineContainer: ElementRef;

  @Output() currentTimeChange: EventEmitter<number> = new EventEmitter();

  /** 掃描事件集合 */
  @Input() timelineStamps: ITimelineStamp[] = [];

  stampsDefultColor = '#f2b32f';

  /** 1秒 對應畫面上 5px */
  oneSecFixedPixels = 5;

  /** 是否為 Scroll 模式 */
  onScrollMode = false;

  // @Input() playing = false;

  /** 開始 Scroll 的位置 */
  beginScrollPosition = 0;

  /** 當前時間軸容器的寬度 */
  currentContainerWidth = 0;

  /** 秒數文字顯示 */
  timelabels: string[] = [];

  /** 實際的開始時間 */
  @Input() beginTime = +Date.now();

  /** 當前實際時間 */
  currentTime = 0;


  pauseTime = 0;

  /** 畫布起點，即結束時間，單位：毫秒 */
  @Input() originOffset = 6 * 60 * 60 * 1000;

  /** 邊界開始位置(左邊界)，單位：毫秒 */
  @Input() boundaryBegin = -6 * 60 * 60 * 1000;

  /** 邊界結束位置(右邊界)，單位：毫秒 */
  @Input() boundaryEnd = 6 * 60 * 60 * 1000;


  /** 時間標記集合 */
  tags: {
    begin: number,
    end: number
  }[] = [];

  @Input() speedOffset = 150;
  @Input() speed = 1;
  get speedRate() {
    return this.speedOffset * this.speed;
  }

  /** 畫布邊界 */
  get paniterBoundary() {
    return this.distanceToScreen(this.boundaryEnd - this.boundaryBegin);
  }

  adapterOffset = 0;

  numberBarOffset = 0;

  // /** 容器與時間軸的時間段差，單位：毫秒 */
  // containerTimeOffset = 0;

  // /** Window Resize 時造成的偏移量，單位：px */
  // resizeOffset = 0;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {

    const keys = Object.keys(changes);

    keys.forEach(key => {
      switch (key) {
        case 'timelineStamps':
          this.setTimelineData();
          this.updateAdapterOffset();
          this.updateNumberBarOffset();
          this.updateTimeline();
          break;
      }
    });
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.initTimeline();
    // const sub$ = this.createTimer().subscribe();
  }

  setTimelineData() {
    this.currentTime = this.beginTime;
  }


  /** 時間 轉為 畫面上的距離 */
  timeToScreen(times: number) {
    times -= this.beginTime;
    const rate = 1000 / this.oneSecFixedPixels;
    return (times + this.originOffset) / rate;
  }

  /** 畫面上的距離 轉為 時間 */
  screenToTime(px: number) {
    const rate = 1000 / this.oneSecFixedPixels;
    return (px * rate) - this.originOffset + this.beginTime;
  }

  /** 時間 轉為 畫面上的長度 */
  distanceToScreen(times: number) {
    const rate = 1000 / this.oneSecFixedPixels;
    return times / rate;
  }

  /** 畫面上的長度 轉為 時間 */
  distanceToTime(px: number) {
    const rate = 1000 / this.oneSecFixedPixels;
    return px * rate;
  }

  initTimeline() {

    // #region 綁定視窗事件
    const $window = $(window);
    $window.mousemove(event => this.timelineMove(event));
    $window.mouseup(event => this.setEndScrollPosition(event));
    $window.resize(event => this.windowResize(event));
    // #endregion

    // 設定時間軸真實長度
    $(this.timeline.nativeElement).width(this.paniterBoundary);
    this.currentContainerWidth = $(this.timelineContainer.nativeElement).width();

    this.updateAdapterOffset();
    this.updateNumberBarOffset();
    this.updateTimeline();

    // #region 產生秒數文字顯示
    let beginSecond = 0;
    const countTimeLabel = Math.ceil(Math.ceil(this.paniterBoundary / this.oneSecFixedPixels) / 10);

    for (let index = 0; index <= countTimeLabel; index++) {
      this.timelabels.push(beginSecond.toString().padStart(2, '0'));
      beginSecond += 10;
      if (beginSecond > 50) {
        beginSecond = 0;
      }
    }
    // #endregion
  }

  /** 根據時間軸容器寬度，對時間軸進行校正偏移 */
  updateAdapterOffset() {
    this.adapterOffset = this.currentContainerWidth / 2;
    $(this.adapter.nativeElement).css('left', this.adapterOffset);
  }

  /** 根據 currentTime 的秒數，進行秒數位置的校正 */
  updateNumberBarOffset() {
    this.numberBarOffset = -(5 + moment(this.currentTime).second()) * this.oneSecFixedPixels;
    $(this.numberBar.nativeElement).css('left', this.numberBarOffset);
  }

  /** 根據 currentTime 相對於 beginTime (即原點) 計算於時間軸上的相對距離 */
  updateTimeline() {
    $(this.timeline.nativeElement).css('left', -this.timeToScreen(this.currentTime));
  }

  clickMark(markTime: number) {
    this.currentTimeChange.emit(markTime);
    this.currentTime = markTime;
    this.updateTimeline();
  }

  timelineMove(event: JQuery.Event) {
    if (!this.onScrollMode) {
      return;
    }

    // 先不做防呆，之後再回來補

    this.currentTime -= this.distanceToTime(event.clientX - this.beginScrollPosition);
    this.beginScrollPosition = event.clientX;
    this.updateTimeline();
    this.currentTimeChange.emit(this.currentTime);
  }

  windowResize(event: JQuery.Event) {
    const timelineContainerWidth = $(this.timelineContainer.nativeElement).width();
    this.adapterOffset += (timelineContainerWidth - this.currentContainerWidth) / 2;
    this.currentContainerWidth = timelineContainerWidth;
    $(this.adapter.nativeElement).css('left', this.adapterOffset);
  }

  setBeginScrollPosition(event: JQuery.Event) {
    this.onScrollMode = true;
    this.beginScrollPosition = event.clientX;
  }

  setEndScrollPosition(event: JQuery.Event) {
    this.onScrollMode = false;
  }

  getStampBeginPosition(timelineStamp: ITimelineStamp) {
    return `${this.timeToScreen(timelineStamp.timestamp)}px`;
  }

  getMarkWidth(tag: { begin: number, end: number }) {
    return `${this.distanceToScreen(tag.end - tag.begin)}px`;
  }

  // createTimer() {
  //   const timer$ = Observable.timer(0, this.speedRate).map(times => {
  //     if (!this.playing) {
  //       return;
  //     }
  //     this.currentTime += this.speedRate;
  //     this.currentTimeChange.emit(this.currentTime);
  //     this.updateTimeline();
  //   });
  //   return timer$;
  // }

}

export interface ITimelineStamp {
  timestamp: number;
  description: string;
  backgroundColor?: string;
}


