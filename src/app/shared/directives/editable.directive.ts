import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appEditable]'
})
export class EditableDirective {

  @Input() editableActiveStyle: any;

  constructor(private el: ElementRef) {
    this.setReadOnly(true);
  }

  @HostListener('dblclick') onDoubleClicks() {
    this.setReadOnly(false);
  }

  @HostListener('keydown', ['$event']) onKeydown(event: any) {
    const value = event.keyCode || event.charCode || event.which;
    if (value !== 13) {
      return;
    }

    const isReadonly = $(this.el.nativeElement).prop('readonly');

    this.setReadOnly(!isReadonly);
  }

  @HostListener('focusout') onFocusout() {
    this.setReadOnly(true);
  }

  @HostListener('focusin') onFocusin() {
    const $dom = $(this.el.nativeElement);
    $dom.css({ 'border': '2px dashed #bdbdbd' });
  }

  setReadOnly(result: boolean) {
    const $dom = $(this.el.nativeElement);
    $dom.prop('readonly', result);

    if (result) {
      $dom.removeAttr('style');
    } else {

      if (this.editableActiveStyle) {
        $dom.css(this.editableActiveStyle);
      }

      const value = $dom.val() as string;
      $dom.prop('selectionStart', 0);
      $dom.prop('selectionEnd', value.length);
    }
  }

}
