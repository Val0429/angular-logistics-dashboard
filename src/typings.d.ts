/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

interface JQuery {
  datepicker: (options: any) => JQuery<HTMLElement>;
  timepicker: (options: any) => JQuery<HTMLElement>;
  nestable: (options: any) => JQuery<HTMLElement>;
  selectize: (options: any) => JQuery<HTMLElement>;
}

declare var videojs: any;