import { query } from '@angular/animations/src/animation_metadata';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Http, HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Configuration, Location, LocationChannel, ScanEvent, ScanEventVideo } from 'app/domain';
import { IsapSidebarService } from 'app/service/layouts/isap-layout/isap-sidebar.service';
import { LiveQueryEventType, ParseService } from 'app/service/parse.service';
import { ITimelineStamp, TimelineComponent } from 'app/shared/components/timeline/timeline.component';
import { environment } from 'environments/environment';
import { IConfiguration, INvrServerConfig, ScanEventType } from 'isap-logistics-solution-lib';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx';
import * as url from 'url';

@Component({
  selector: 'app-playback',
  templateUrl: './playback.component.html',
  styleUrls: ['./playback.component.css']
})
export class PlaybackComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(TimelineComponent) timeline: TimelineComponent;

  currentVideoUrl = '';

  scanEvenVideos: ScanEventVideo[] = [];

  /** ScanEvent 列表 */
  events: ScanEvent[] = [];

  /** 頻道列表 */
  channels: string[] = [];

  /** 當前選擇的 Channel */
  currentChannel = '';

  currentSnapshotUrl = '';

  currentLocationID = '';


  /** 目前TimeLine上的 Mark物件 */
  timelineStamps: ITimelineStamp[] = [];

  /** 是否播放 */
  playing = false;

  /** 播放速率 */
  speed = 1;

  /** 時間軸起始時間 */
  timelineBeginTime = 0;

  eventId = '';

  HostUrl = this.parseService.serverUrl;

  playbackVideo: any;

  nvrServerCongif: IConfiguration;

  timeStampColor = {
    'Order': '#f2872f',
    'Goods': '',
    'Complete': '#abdb47',
    'Cancel': '#ff6666'
  };

  get videoUrl() {
    return `${this.HostUrl}${this.currentVideoUrl || ''}`;
  }

  constructor(
    public isapSidebarService: IsapSidebarService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private parseService: ParseService
  ) { }

  ngOnInit() {
    this.setPlaybackData();
    this.initUrlWatcher();
    this.fetchNVRConfig();
  }

  ngAfterViewInit() {

  }


  ngOnDestroy() {
    if (!this.playbackVideo) {
      return;
    }
    this.playbackVideo.dispose();
  }

  initUrlWatcher() {
    this.parseService.createLiveQueryWatcher({
      type: ScanEventVideo,
      action: LiveQueryEventType.UPDATE
    }).map(result => {
      const scanEventVideo = result.data as ScanEventVideo;
      if (!this.playbackVideo || scanEventVideo.get('event').id !== this.eventId || scanEventVideo.get('channel').nvrChannelNo !== this.currentChannel) {
        return;
      }

      this.currentVideoUrl = scanEventVideo.get('url');
      this.playbackVideo.src(this.videoUrl);
      this.playbackVideo.load();

      // const currentScanEventVideo = this.scanEvenVideos.find(_scanEvenVideo => _scanEvenVideo.id === scanEventVideo.id);
      // if (!currentScanEventVideo) {
      //   currentScanEventVideo.url = this.currentVideoUrl;
      // }
    }).subscribe();
  }

  /** 初始化 Video */
  initVideo() {
    this.playbackVideo = videojs('playBackVideo', {
      children: {
        controlBar: false
      }
    });
    this.playbackVideo.on('timeupdate', () => {
      this.timeline.currentTime = this.timeline.beginTime + (this.playbackVideo.currentTime() * 1000);
      this.timeline.updateTimeline();
    });
    this.playbackVideo.on('ended', () => {
      this.playing = false;
    });
  }



  setPlaybackData() {
    this.fetchRouteParams()
      .do(() => {
        this.playing = false;
        this.currentVideoUrl = '';
      })
      .switchMap(() => {
        if (!this.eventId) {
          return Observable.of(null);
        }
        return this.fetchScanEvents();
      })
      .do(() => this.setFirstOrderStamp())
      .switchMap(() => this.fectchChannel())
      .switchMap(() => this.fetchScanEvenVideo())
      .do(() => {
        const scanEvenVideo = this.scanEvenVideos.find(video => video.channel.nvrChannelNo === this.currentChannel);
        if (!scanEvenVideo) {
          return;
        }
        this.currentVideoUrl = scanEvenVideo.url || '';
      })
      .do(() => {
        if (this.events.length < 1) {
          return;
        }

        this.initVideo();
        this.currentTimeChange(this.timelineBeginTime);
        if (!this.playbackVideo) {
          return;
        }
        this.playbackVideo.src(this.videoUrl);
        this.playbackVideo.load();
      })
      .subscribe();
  }

  /** 取得該訂單第一筆時間戳記 並指定給 timeline */
  setFirstOrderStamp() {
    if (this.timelineStamps.length < 1) {
      return;
    }
    const queryOrder = this.timelineStamps.find(stamp => stamp.description === ScanEventType.ORDER);
    this.timelineBeginTime = queryOrder.timestamp;
  }

  fetchNVRConfig() {
    const fetchEvents$ = Observable.fromPromise(this.parseService.fetchData(Configuration, query => {
      query.equalTo('key', 'NVR');
    })).map(config => {
      if (config) {
        this.nvrServerCongif = config[0];
      }
    }).subscribe();

  }

  /** 取得訂單ID */
  fetchRouteParams() {
    const params$ = this.activatedRoute.params
      .map(params => this.eventId = params['id'] || '');
    return params$;
  }

  /** 取得選擇的 Order 下 ScanEvent 列表 接著顯示於時間軸 */
  fetchScanEvents() {
    const fetchEvents$ = Observable.fromPromise(this.parseService.fetchData(ScanEvent, query => {
      query.include('parent');
      query.include('user');
      query.include('location');
      const queryOrder = new Parse.Query(ScanEvent);
      queryOrder.equalTo('objectId', this.eventId);
      query.matchesQuery('parent', queryOrder);
      query.ascending('scanAt');
    }))
      .map(events => this.events = events)
      .map(events => {
        if (!Array.isArray(events) || events.length < 1) {
          return;
        }
        this.currentLocationID = events[0].location.id;
        this.timelineStamps = [events[0].parent].concat(events).map(event => {
          const item: ITimelineStamp = {
            timestamp: +event.scanAt,
            description: event.type,
            backgroundColor: this.timeStampColor[event.type] || ''
          };
          return item;
        });
      });
    return fetchEvents$;
  }

  /** 依照 ScanEvent 取得下面的 ScanEventVideo */
  fetchScanEvenVideo() {
    const queryVideo$ = Observable.fromPromise(this.parseService.fetchData(ScanEventVideo, query => {
      query.include('channel');
      query.include('event');
      const queryEvent = new Parse.Query(ScanEvent);
      queryEvent.equalTo('objectId', this.eventId);
      query.matchesQuery('event', queryEvent);
      query.ascending('sequence');
    }))
      .map(videos => this.scanEvenVideos = videos);

    return queryVideo$;
  }

  /** 取得頻道列表 */
  fectchChannel() {
    const queryChannel$ = Observable.fromPromise(this.parseService.fetchData(LocationChannel, query => {
      const queryLocation = new Parse.Query(Location);
      queryLocation.equalTo('objectId', this.currentLocationID);
      query.include('location');
      query.matchesQuery('location', queryLocation);
      query.ascending('sequence');
    })).map(channels => {
      this.channels = channels.map(channel => channel.nvrChannelNo);
      if (this.channels.length < 1) {
        return;
      }
      this.currentChannel = this.channels[0];
    });
    return queryChannel$;
  }

  currentTimeChange(time: number) {
    const channelNo = this.currentChannel;
    const channelTime = (time - this.timeline.beginTime) / 1000;
    if (!this.playbackVideo) {
      return;
    }
    this.playbackVideo.currentTime(channelTime);
  }

  /** channel 切換 */
  channelChange(channel: string) {

    this.currentChannel = channel;
    const selectedVideo = this.scanEvenVideos.filter(video => video.attributes.channel.nvrChannelNo === this.currentChannel);
    if (Array.isArray(selectedVideo) && selectedVideo.length > 0) {
      this.currentVideoUrl = selectedVideo[0].attributes.url;
      if (!this.playbackVideo) {
        return;
      }
      this.playbackVideo.src(this.videoUrl);
      this.playbackVideo.load();

      if (this.playing) {
        this.playbackVideo.play();
      }
      const channelTime = (this.timeline.currentTime - this.timeline.beginTime) / 1000;
      this.playbackVideo.currentTime(channelTime);
    } else {
      this.currentVideoUrl = '';
    }
  }

  /** 播放倍速  */
  setPlayingRate(rate: number) {
    this.speed = rate;
  }

  currentRate(rate: number) {
    return this.speed === rate ? 'active' : '';
  }

  isPlaying() {
    return this.playing ? 'playing' : 'pause';
  }

  /** Video Control */
  playVideo() {

    if (!this.currentVideoUrl) {
      return;
    }

    this.playing = !this.playing;

    this.playing ? this.playbackVideo.play() : this.playbackVideo.pause();
  }

  playVideoRate(rate: number) {
    this.speed = rate;
    this.playbackVideo.playbackRate(rate);
  }

  convertVideo() {

    this.currentVideoUrl = '';
    this.playbackVideo.pause();

    $('#btn-convertVideo i').addClass('fa-spin');
    const url = this.HostUrl + '/export-video';
    const endTime = +this.events[this.events.length - 1].scanAt;
    const config: INvrServerConfig = this.nvrServerCongif.value;

    const postData = {
      scanEventId: this.eventId,
      channel: this.currentChannel,
      ip: config.serverIp,
      port: config.serverPort,
      user: config.serverAccount,
      password: config.serverPassword,
      isHttp: config.isHttps,
      beginTime: this.timelineBeginTime,
      endTime: endTime
    };
    const options: RequestInit = {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'Post',
      body: JSON.stringify(postData)
    };

    const fetch$ = fetch(url, options)
      .then(() => $('#btn-convertVideo i').removeClass('fa-spin'));
  }

  /** 快照 */
  snapShot() {
    if (!this.currentVideoUrl) {
      return;
    }
    const $video = $('#playBackVideo video').get(0);
    this.downloadVideo($video);
  }

  downloadVideo(video: any) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')
      .drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = document.createElement('img');
    img.src = canvas.toDataURL();

    const saveImg = document.createElement('a');
    saveImg.href = img.src.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
    saveImg.target = '_blank';
    saveImg.download = `${moment(this.timeline.currentTime).format('YYYY_MM_DD_HH_mm_ss_SSS')}.jpg`;
    saveImg.click();
    saveImg.remove();

  }
}
