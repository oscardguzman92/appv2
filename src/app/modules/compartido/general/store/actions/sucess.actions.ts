import {Action} from '@ngrx/store';

export const SUCCESS = '[Success] message';

export class Success implements Action {
    readonly type = SUCCESS;

    constructor(public payload: any ) {}
}

export type SucessActions = Success;
