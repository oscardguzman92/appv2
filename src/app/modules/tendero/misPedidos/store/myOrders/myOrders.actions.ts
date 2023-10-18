import {Action} from '@ngrx/store';
import {Order} from '../../../../../models/Order';
import {Shop} from '../../../../../models/Shop';

export const GET_MY_ORDERS = '[My orders] Get my orders';
export const SET_MY_ORDERS = '[My orders] set my orders';

export class GetMyOrdersAction implements Action {
    readonly type = GET_MY_ORDERS;

    constructor(public token: string, public shop: Shop, public page: number, public validar_productos?: boolean) {}
}

export class SetMyOrdersAction implements Action {
    readonly type = SET_MY_ORDERS;

    constructor(public orders: Order[], public pagination: {pages: number}) {}
}

export type myOrdersActions = SetMyOrdersAction | GetMyOrdersAction;
