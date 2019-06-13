import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, NgZone } from '@angular/core';

@Component({
  selector: 'app-nestable',
  templateUrl: './nestable.component.html',
  styleUrls: ['./nestable.component.css']
})
export class NestableComponent implements AfterViewInit {

  @ViewChild('nestable') nestable: ElementRef;

  baseOptions = new NestableOptions();

  @Input() nestableDatas: INestableData[];

  @Input() nestableOptions = new NestableOptions();

  @Output() nestableChange: EventEmitter<any> = new EventEmitter();

  @Output() nestableItemBtnClick: EventEmitter<any> = new EventEmitter();

  constructor(
    private ngZone: NgZone
  ) { }

  ngAfterViewInit() {
    this.initNestable();
  }

  initNestable() {
    if (!this.nestable.nativeElement) {
      return;
    }

    Object.assign(this.baseOptions, this.nestableOptions);
    const $dom = $(this.nestable.nativeElement);
    $dom.nestable(this.baseOptions);
    $dom.on('change', () => this.nestableChange.emit($dom.nestable('serialize')));
  }

  appendDataAttr(el: any, nestableData: INestableData) {
    this.ngZone.runOutsideAngular(() => {
      Object.keys(nestableData)
        .filter(key => key !== 'children')
        .forEach(key => $(el).data(key, nestableData[key]));
    });
    return '';
  }

}

export class NestableOptions {

  maxDepth?= 5;
  group?= 0;
  listNodeName?= 'ol';
  itemNodeName?= 'li';
  rootClass?= 'dd';
  listClass?= 'dd-list';
  itemClass?= 'dd-item';
  dragClass?= 'dd-dragel';
  handleClass?= 'dd-handle';
  collapsedClass?= 'dd-collapsed';
  placeClass?= 'dd-placeholder';
  emptyClass?= 'dd-empty';
  expandBtnHTML?= '<button data-action="expand">Expand></button>';
  collapseBtnHTML?= '<button data-action="collapse">Collapse</button>';

  constructor(value?: Partial<NestableOptions>) {
    Object.assign(this, value);
  }
}

export interface INestableData {
  [key: string]: any;
  children?: INestableData[];
}
