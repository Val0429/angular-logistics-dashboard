import { Component, OnInit } from '@angular/core';
import { Location, LocationChannel } from 'app/domain';
import { CommonService } from 'app/service/common.service';
import { I18nService } from 'app/service/i18n.service';
import { NvrService } from 'app/service/nvr.service';
import { ParseService } from 'app/service/parse.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit {

  isSaveing = false;

  relationships: ILCRelationship[] = [];

  pendingRemoveItems: Parse.Object[] = [];

  currentEditChannel: LocationChannel;

  nvrChannels: LocationChannel[] = [];



  constructor(
    private parseService: ParseService,

    private nvrService: NvrService,
    private commonService: CommonService,
    private i18nService: I18nService
  ) { }

  ngOnInit() {
    this.initLocationData()
      .switchMap(() => this.initChannelData())
      .switchMap(() => this.getChannel())
      .map((data: any) => ((data.AllDevices && data.AllDevices.DeviceConnectorConfiguration) || []).map(device => new LocationChannel({
        nvrChannelNo: device && device.DeviceID && device.DeviceID[0],
        location: null
      })))
      .do(channels => {
        if (!Array.isArray(channels) || channels.length < 1) {
          return;
        }

        if (this.relationships.length < 1) {
          this.nvrChannels = channels;
          return;
        }

        const currentUse = this.relationships
          .map(relationship => relationship.channels)
          .reduce((a, b) => a.concat(b))
          .map(relationship => relationship.nvrChannelNo);

        this.nvrChannels = channels
          .filter(channel => !currentUse.includes(channel.nvrChannelNo));
      })
      .subscribe();
  }

  /** 取得nvr設定檔 */
  getChannel() {
    const nvrUrl = `${this.nvrService.isHttps ? 'https' : 'http'}://${this.nvrService.host}:${this.nvrService.port}/cgi-bin/deviceconfig?action=loadalldevice`;
    const authorizationString = `Basic ${btoa(`${this.nvrService.username}:${this.nvrService.password}`)}`;

    const get$ = this.commonService.apiProxy({
      url: nvrUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'text/xml',
        'Authorization': authorizationString
      }
    })
      .switchMap(res => res.text())
      .switchMap(xml => this.commonService.xmlToJson({ xml: xml }));
    return get$;
  }


  initLocationData() {
    const fetch$ = Observable.fromPromise(this.parseService.fetchData(Location, query => {
      query.ascending('sequence');
    }))
      .map(locations => {
        this.relationships = locations
          .map(location => {
            return {
              location: location,
              channels: []
            };
          });
      });
    return fetch$;
  }

  initChannelData() {
    const fetch$ = Observable.fromPromise(this.parseService.fetchData(LocationChannel, query => {
      query.containedIn('location', this.relationships.map(relationship => relationship.location));
      query.ascending('sequence');
    })).map(channels =>
      this.relationships.forEach(relationship =>
        relationship.channels = channels.filter(channel => channel.location.id === relationship.location.id))
    );
    return fetch$;
  }

  createLocation() {
    this.relationships.push({
      location: new Location({ name: '' }),
      channels: []
    });
  }

  removeLocation(relationship: ILCRelationship) {
    if (!confirm(this.i18nService.transform('ALERT_REMOVE_LOCATION_CONFIRM'))) {
      return;
    }

    if (relationship && relationship.location && relationship.location.id) {
      this.pendingRemoveItems.push(relationship.location);
    }

    if (Array.isArray(relationship.channels) && relationship.channels.length > 0) {
      // 被移除的 Location 下的 Channel 會被丟到未配置的 Channel List 中
      this.nvrChannels = this.nvrChannels.concat(relationship.channels);
      // this.pendingRemoveItems = this.pendingRemoveItems.concat(relationship.channels.filter(channel => channel.id));
    }

    const locationIndex = this.relationships.findIndex(_relationship => _relationship === relationship);
    if (locationIndex < 0) {
      return;
    }
    this.relationships.splice(locationIndex, 1);
  }

  createChannel(relationship: ILCRelationship) {
    if (!relationship ||
      !relationship.location ||
      !Array.isArray(relationship.channels)) {
      return;
    }

    relationship.channels.push(new LocationChannel({ location: relationship.location }));
  }

  removeChannel(relationship: ILCRelationship, channel: LocationChannel) {
    if (!relationship ||
      !relationship.location ||
      !Array.isArray(relationship.channels) ||
      !confirm(this.i18nService.transform('ALERT_REMOVE_LOCATION_CONFIRM'))) {
      return;
    }

    if (channel.id) {
      this.pendingRemoveItems.push(channel);
    }

    const channelIndex = relationship.channels.findIndex(_channel => _channel === channel);
    if (channelIndex < 0) {
      return;
    }
    relationship.channels.splice(channelIndex, 1);
  }

  save() {

    this.isSaveing = true;

    const locations = this.relationships
      .map(relationship => relationship.location);
    locations.forEach((location, index) => location.sequence = index);

    let channelIndex = 0;
    const channels = this.relationships
      .map(relationship => {
        relationship.channels.forEach(channel => {
          channel.location = relationship.location;
          channel.sequence = channelIndex;
          channelIndex++;
        });
        return relationship.channels;
      })
      .reduce((a, b) => a.concat(b), []);

    let objects: Parse.Object[] = locations;
    objects = objects.concat(channels);

    // 沒有被設定的 channel 也一併刪除
    this.pendingRemoveItems = this.pendingRemoveItems.concat(this.nvrChannels);
    console.log(this.nvrChannels);
    const saveAll$ = Observable.from(Parse.Object.saveAll(objects));
    const destoryAll$ = Observable.from(Parse.Object.destroyAll(this.pendingRemoveItems));

    const all$ = Observable
      .merge(saveAll$, destoryAll$)
      .toArray()
      .do(() => {
        alert(this.i18nService.transform('ALERT_SUCCESSFULLY_SAVED'));
        this.isSaveing = false;
      });

    all$.subscribe();
  }
}

interface ILCRelationship {
  location?: Location;
  channels?: LocationChannel[];
}
