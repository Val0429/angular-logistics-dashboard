import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-playback-channels',
  templateUrl: './playback-channels.component.html',
  styleUrls: ['./playback-channels.component.css']
})
export class PlaybackChannelsComponent implements OnInit {


  @Input() channels: string[];

  @Output() channelChange = new EventEmitter<string>();

  @Input() selectedChannel: string;

  constructor() { }

  ngOnInit() {
  }

  setChannel(channel: string) {
    this.selectedChannel = channel;
    this.channelChange.emit(channel);
  }

}


