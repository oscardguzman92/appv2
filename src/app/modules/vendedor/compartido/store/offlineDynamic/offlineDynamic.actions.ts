import {Action} from '@ngrx/store';

export const SET_OFFLINE_DYNAMIC = '[OFFLINE DYNAMIC] Set on offline dynamic';

export class SetOfflineDynamicAction implements Action {
    readonly type = SET_OFFLINE_DYNAMIC;

    constructor(public on: boolean) {
    }
}

export type offlineActions = SetOfflineDynamicAction;

