import {Action} from '@ngrx/store';

export const FAIL = '[Error] fail';

export class Fail implements Action {
    readonly type = FAIL;

    constructor(public payload: any ) {}
}

export type errorActions = Fail;
