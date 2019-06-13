import * as moment from 'moment';
import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appDatepicker]'
})
export class DatepickerDirective implements OnInit, AfterViewInit {

  baseOptions = {
    format: 'yyyy-mm-dd',
    todayBtn: true,
    todayHighlight: true
  };


  @Input() datepickerOptions = {};

  @Output() datepickerChange = new EventEmitter();

  constructor(
    private el: ElementRef
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initDatepicker();
  }



  initDatepicker() {
    Object.assign(this.baseOptions, this.datepickerOptions);
    $(this.el.nativeElement).datepicker(this.baseOptions)
      .on('changeDate', event => this.datepickerChange.emit(moment(event['date']).format('YYYY-MM-DD')));
  }
}
