import {Action} from '@ngrx/store';
import {IProduct} from '../../../../../interfaces/IProduct';
import { IPaginate } from 'src/app/interfaces/IPaginate';
import { IBotonAdicional } from '../../../../../interfaces/IBotonAdicional';

export const GET_OFFERS = '[Offers] Get offers';
export const SET_OFFERS = '[Offers] Set offers';
export const SET_ONLY_OFFERS = '[Offers] Set Only offers';

export const GET_PRODUCTS_FEATURED = '[Offers] Get products featured';
export const SET_PRODUCTS_FEATURED = '[Offers] Set products featured';

export const GET_BUTTONS_FEATURED = '[Offers] Get buttons featured';
export const SET_BUTTONS_FEATURED = '[Offers] Set buttons featured';

export class GetOffersActions implements Action {
    readonly type = GET_OFFERS;

    constructor(
        public token: string,
        public tienda_id: number = null,
        public compania_id: number = null,
        public distribuidor_id: number = null,
        public portafolio: string = null,
        public page: number = null,
        public limit: number = null,
        public only: boolean = false) {
    }
}

export class SetOffersActions implements Action {
    readonly type = SET_OFFERS;

    constructor(public offers: IProduct[], public paginate?:IPaginate, public error?: boolean) {
    }
}

export class SetOnlyOffersActions implements Action {
    readonly type = SET_ONLY_OFFERS;

    constructor(public offers: IProduct[], public paginate?:IPaginate) {
    }
}

export class GetProductsFeaturedAction implements Action {
    readonly type = GET_PRODUCTS_FEATURED;

    constructor(public token: string, public tienda_id: number) {
    }
}

export class SetProductsFeaturedAction implements Action {
    readonly type = SET_PRODUCTS_FEATURED;

    constructor(public productsFeatured: IProduct[]) {
    }
}

export class GetAdditionalButtonAction implements Action {
    readonly type = GET_BUTTONS_FEATURED;

    constructor(public token: string, public tienda_id: number) {
    }
}

export class SetAdditionalButtonAction implements Action {
    readonly type = SET_BUTTONS_FEATURED;

    constructor(public buttonsFatured: IBotonAdicional[]) {
    }
}

export type OffersActions = GetOffersActions | SetOffersActions;
