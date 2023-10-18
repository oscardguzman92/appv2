import {Action} from '@ngrx/store';
import {IExchangesProducts} from '../../../../../../interfaces/IExchangesProducts';
import {IPoints} from '../../../../../../interfaces/IPoints';
import {IMovimentsPoints} from '../../../../../../interfaces/IMovimentsPoints';

export const GET_POINTS = '[Points] Get points';
export const GET_ONLY_POINTS = '[Points] Get only points';
export const SET_ONLY_POINTS = '[Points] Set only points';
export const GET_EXCHANGE_PRODUCTS = '[Points] Get exchange products';
export const SET_EXCHANGE_PRODUCTS = '[Points] Set exchange products';
export const CHANGE_PRODUCT = '[Points] change product';
export const AFTER_CHANGE_PRODUCT = '[Points] After change product';
export const GET_RECORD_POINTS = '[Points] Get record points';
export const SET_RECORD_POINTS = '[Points] Set record points';

export class GetPointsAction implements Action {
    readonly type = GET_POINTS;

    constructor(public token: string, public tienda_id: number) {
    }
}

export class GetOnlyPointsAction implements Action {
    readonly type = GET_ONLY_POINTS;

    constructor(public token: string, public tienda_id: number) {
    }
}

export class SetOnlyPointsAction implements Action {
    readonly type = SET_ONLY_POINTS;

    constructor(public points: IPoints) {
    }
}

export class GetExchangeProductsAction implements Action {
    readonly type = GET_EXCHANGE_PRODUCTS;

    constructor(public token: string, public tienda_id: number, public points: IPoints) {
    }
}

export class SetExchangeProductsAction implements Action {
    readonly type = SET_EXCHANGE_PRODUCTS;

    constructor(public exchageProducts: IExchangesProducts[], public points: IPoints) {
    }
}

export class ChangeProductAction implements Action {
    readonly type = CHANGE_PRODUCT;

    constructor(public token: string, public producto_canje_id: number, public tienda_id: number) {
    }
}

export class AfterChangeProductAction implements Action {
    readonly type = AFTER_CHANGE_PRODUCT;

    constructor(public message: string) {
    }
}

export class GetRecordPointsAction implements Action {
    readonly type = GET_RECORD_POINTS;

    constructor(public token: string, public tienda_id: number, public page: number, public tipo?: string) {
    }
}

export class SetRecordPointsAction implements Action {
    readonly type = SET_RECORD_POINTS;

    constructor(public points: IMovimentsPoints, public paginate: {pages: number}) {
    }
}

export type PuntosActions = GetExchangeProductsAction | SetExchangeProductsAction;
