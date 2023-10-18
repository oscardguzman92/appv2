import {Action} from '@ngrx/store';

export const LOADING_ON = '[LOADING] Loading on';

export const LOADING_OFF = '[LOADING] Loading off';

export class LoadingOn implements Action {
    readonly type = LOADING_ON;

    constructor(public withoutDuration?: boolean, public loadingOffer?: boolean) {}
}

export class LoadingOff implements Action {
    readonly type = LOADING_OFF;
}

export type LoadingActions = LoadingOn | LoadingOff;
