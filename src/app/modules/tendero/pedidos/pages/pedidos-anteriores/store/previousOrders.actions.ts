import {Action} from '@ngrx/store';

export const GET_PREVIOUS_ORDERS = '[Previous orders] Get previous orders';
export const SET_PREVIOUS_ORDERS = '[Previous orders] Set previous orders';

export class GetPreviousOrdersAction implements Action {
    readonly type = GET_PREVIOUS_ORDERS;

    constructor(public token: string, public tienda_id: number) {
    }
}

export class SetPreviousOrdersAction implements Action {
    readonly type = SET_PREVIOUS_ORDERS;

    constructor(public token: string) {
    }
}

export type previousOrdersActions = GetPreviousOrdersAction | SetPreviousOrdersAction;