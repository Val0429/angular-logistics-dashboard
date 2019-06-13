import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appSelectize]'
})
export class SelectizeDirective implements OnChanges, AfterViewInit {

  baseOptions = {
    delimiter: ',',
    persist: false,
    create: (input) => {
      return {
        value: input,
        text: input
      };
    }
  };

  @Input() selectizeOptions: any;

  @Output() selectizeChange = new EventEmitter();

  constructor(
    private el: ElementRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.initSelectize();
  }

  ngAfterViewInit() {
    this.initSelectize();
    this.initSelectizeEvent();
  }

  initSelectize() {
    Object.assign(this.baseOptions, this.selectizeOptions);
    $(this.el.nativeElement).selectize(this.baseOptions);
  }

  initSelectizeEvent() {
    const $dom = $(this.el.nativeElement);
    $dom.on('change', event => this.selectizeChange.emit(event));
  }
}
