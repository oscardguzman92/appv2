import {Action} from '@ngrx/store';

export const TOGGLE_OFFLINE = '[OFFLINE] Toggle offline';

export class ToggleOfflineAction implements Action {
    readonly type = TOGGLE_OFFLINE;

    constructor(public toggle: boolean) {}
}

export type offlineActions = ToggleOfflineAction;
