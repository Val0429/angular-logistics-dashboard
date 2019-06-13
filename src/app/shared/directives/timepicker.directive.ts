import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  selector: '[appTimepicker]'
})
export class TimepickerDirective implements AfterViewInit {

  baseOptions = {};

  @Input() timepickerOptions = {};

  @Output() timepickerChange = new EventEmitter();

  constructor(
    private el: ElementRef
  ) { }

  ngAfterViewInit() {
    this.initTimepicker();
  }

  initTimepicker() {
    Object.assign(this.baseOptions, this.timepickerOptions);
    $(this.el.nativeElement).timepicker(this.baseOptions)
      .on('changeTime', (event: any) => {
        const value = event.target.value;
        this.timepickerChange.emit(value);
      });
  }
}
