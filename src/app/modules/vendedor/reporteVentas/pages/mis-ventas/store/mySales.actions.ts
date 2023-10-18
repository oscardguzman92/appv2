import {Action} from '@ngrx/store';
import {IMySales} from '../../../../../../interfaces/IMySales';
import {Order} from '../../../../../../models/Order';

export const GET_MY_SALES = '[My sales] Get my sales';
export const SET_MY_SALES = '[My sales] Set my sales';
export const GET_ORDER_BY_SHOP_ID = '[My sales] Get order by shop id';
export const SET_ORDER_BY_SHOP_ID = '[My sales] Set order by shop id';

export class GetMySalesAction implements Action {
    readonly type = GET_MY_SALES;

    constructor(public token: string, public fecha: string) {
    }
}

export class SetMySalesAction implements Action {
    readonly type = SET_MY_SALES;

    constructor(public mySales: IMySales) {
    }

}

export class GetOrderByShopIdAction implements Action {
    readonly type = GET_ORDER_BY_SHOP_ID;

    constructor(public token: string, public pedido_id: number) {
    }
}

export class SetOrderByShopIdAction implements Action {
    readonly type = SET_ORDER_BY_SHOP_ID;

    constructor(public order: Order) {
    }
}

export type MySalesActions = GetMySalesAction | SetMySalesAction;
