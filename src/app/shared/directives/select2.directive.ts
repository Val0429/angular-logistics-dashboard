import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appSelect2]'
})
export class Select2Directive implements OnChanges, AfterViewInit {

  baseOptions = {};

  @Input() select2Options: Select2Options;

  @Output() select2EventEmitter: EventEmitter<{ type: string, event: any }> = new EventEmitter();

  constructor(
    private el: ElementRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.initSelect2();
  }

  ngAfterViewInit() {
    this.initSelect2();
    this.initSelect2Event();
  }

  initSelect2() {
    Object.assign(this.baseOptions, this.select2Options);
    $(this.el.nativeElement).select2(this.baseOptions);
  }

  initSelect2Event() {
    const $dom = $(this.el.nativeElement);
    $dom.on('change', event => this.select2EventEmitter.emit({ type: Select2EventType.CHANGE, event: event }));
    $dom.on('change:select2', event => this.select2EventEmitter.emit({ type: Select2EventType.CHANGE_SELECT2, event: event }));
    $dom.on('select2:closing', event => this.select2EventEmitter.emit({ type: Select2EventType.SELECT2_CLOSING, event: event }));
    $dom.on('select2:close', event => this.select2EventEmitter.emit({ type: Select2EventType.SELECT2_CLOSE, event: event }));
    $dom.on('select2:opening', event => this.select2EventEmitter.emit({ type: Select2EventType.SELECT2_OPENING, event: event }));
    $dom.on('select2:open', event => this.select2EventEmitter.emit({ type: Select2EventType.SELECT2_OPEN, event: event }));
    $dom.on('select2:selecting', event => this.select2EventEmitter.emit({ type: Select2EventType.SELECT2_SELECTING, event: event }));
    $dom.on('select2:select', event => this.select2EventEmitter.emit({ type: Select2EventType.SELECT2_SELECT, event: event }));
    $dom.on('select2:unselecting', event => this.select2EventEmitter.emit({ type: Select2EventType.SELECT2_UNSELECTING, event: event }));
    $dom.on('select2:unselect', event => this.select2EventEmitter.emit({ type: Select2EventType.SELECT2_UNSELECT, event: event }));
  }
}

export class Select2EventType {
  static CHANGE = 'change';
  static CHANGE_SELECT2 = 'change.select2';
  static SELECT2_CLOSING = 'select2:closing';
  static SELECT2_CLOSE = 'select2:close';
  static SELECT2_OPENING = 'select2:opening';
  static SELECT2_OPEN = 'select2:open';
  static SELECT2_SELECTING = 'select2:selecting';
  static SELECT2_SELECT = 'select2:select';
  static SELECT2_UNSELECTING = 'select2:unselecting';
  static SELECT2_UNSELECT = 'select2:unselect';
}
