import { IConfiguration, ILocation, ILocationChannel, IScanEvent, IScanEventVideo } from 'isap-logistics-solution-lib';

// #region Parse Object
export class ScanEvent extends Parse.Object implements IScanEvent {
    get user(): Parse.User { return super.get('user'); }
    set user(value: Parse.User) { super.set('user', value); }
    get type(): string { return super.get('type'); }
    set type(value: string) { super.set('type', value); }
    get parent(): ScanEvent { return super.get('parent'); }
    set parent(value: ScanEvent) { super.set('parent', value); }
    get location(): Location { return super.get('location'); }
    set location(value: Location) { super.set('location', value); }
    get scanAt(): Date { return super.get('scanAt'); }
    set scanAt(value: Date) { super.set('scanAt', value); }
    get status(): string { return super.get('status'); }
    set status(value: string) { super.set('status', value); }
    get scanData(): string { return super.get('scanData'); }
    set scanData(value: string) { super.set('scanData', value); }
    constructor(value?: Partial<IScanEvent>) {
        super('ScanEvent');
        Object.assign(this, value);
    }
}

export class ScanEventVideo extends Parse.Object implements IScanEventVideo {

    get event(): ScanEvent { return super.get('event'); }
    set event(value: ScanEvent) { super.set('event', value); }
    get channel(): LocationChannel { return super.get('channel'); }
    set channel(value: LocationChannel) { super.set('channel', value); }
    get url(): string { return super.get('url'); }
    set url(value: string) { super.set('url', value); }

    constructor(value?: Partial<IScanEventVideo>) {
        super('ScanEventVideo');
        Object.assign(this, value);
    }
}

export class Location extends Parse.Object implements ILocation {
    get name(): string { return super.get('name'); }
    set name(value: string) { super.set('name', value); }
    get sequence(): number { return super.get('sequence'); }
    set sequence(value: number) { super.set('sequence', value); }
    constructor(value?: Partial<ILocation>) {
        super('Location');
        Object.assign(this, value);
    }
}

export class LocationChannel extends Parse.Object implements ILocationChannel {

    get nvrChannelNo(): string { return super.get('nvrChannelNo'); }
    set nvrChannelNo(value: string) { super.set('nvrChannelNo', value); }
    get streamNo(): string { return super.get('streamNo'); }
    set streamNo(value: string) { super.set('streamNo', value); }
    get location(): Location { return super.get('location'); }
    set location(value: Location) { super.set('location', value); }
    get sequence(): number { return super.get('sequence'); }
    set sequence(value: number) { super.set('sequence', value); }
    constructor(value?: Partial<ILocationChannel>) {
        super('LocationChannel');
        Object.assign(this, value);
    }
}

export class Configuration extends Parse.Object implements IConfiguration {
    get key(): string { return super.get('key'); }
    set key(value: string) { super.set('key', value); }
    get value(): any { return super.get('value'); }
    set value(value: any) { super.set('value', value); }
    constructor(value?: Partial<IConfiguration>) {
        super('Configuration');
        Object.assign(this, value);
    }
}
// #endregion

