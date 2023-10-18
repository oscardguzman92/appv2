import {Action} from '@ngrx/store';
import {IShops} from '../../../../interfaces/IShops';
import {Shop} from '../../../../models/Shop';

export const GET_SHOPS = '[Shops] Get shops';
export const GET_SHOPS_ORDERS = '[Shops] Get Shops Orders';
export const FILTER_SHOPS = '[Shops] Filter shops';
export const SET_SHOPS = '[Shops] Set shops';
export const SET_LIST_SHOPS = '[Shops] Set list shops';
export const SHOPS_PENDING_PRODUCTS = '[Shops] Shops Pending Products';
export const CHANGE_DAYS_WEEKLY = '[Shops] Change Days Weekly';
export const GET_DROP_SIZE = '[Shops] Get drop size';
export const SET_DROP_SIZE = '[Shops] Set drop size';
export const GET_CLIENT_BY_DOCUMENT = '[Shops] Get client by document';
export const SET_CLIENT_BY_DOCUMENT = '[Shops] Set client by document';
export const UPDATE_ASSOCIATION = '[Shops] Update association';
export const FINISH_UPDATE_ASSOCIATION = '[Shops] Finish Update association';



export class GetShopsAction implements Action {
    readonly type = GET_SHOPS;

    constructor(public token: string, public filter: IShops, public callbackEvent?: any) {
    }
}

export class GetShopsOrdersAction implements Action {
    readonly type = GET_SHOPS_ORDERS;

    constructor(public token: string) {
    }
}

export class FilterShopsAction implements Action {
    readonly type = FILTER_SHOPS;

    constructor(public shops: IShops[], public filter: IShops, public showOrdersPending: boolean = false, public zoneId: number = null) {
    }
}

export class SetShopsAction implements Action {
    readonly type = SET_SHOPS;

    constructor(public shops: IShops[]) {
    }
}

export class SetListShopsAction implements Action {
    readonly type = SET_LIST_SHOPS;

    constructor(public shops: IShops[]) {
    }
}

export class ShopsPendingProductsAction implements Action {
    readonly type = SHOPS_PENDING_PRODUCTS;

    constructor(public codes: string) {
    }
}

export class ChangeDaysWeeklyAction implements Action {
    readonly type = CHANGE_DAYS_WEEKLY;

    constructor(public week: any) {
    }
}

export class GetDropSizeAction implements Action {
    readonly type = GET_DROP_SIZE;

    constructor(public token: string, public shop: Shop) {}
}

export class SetDropSizeAction implements Action {
    readonly type = SET_DROP_SIZE;

    constructor(public dropSize: {
        pedido_promedio: any,
        cumplimiento_pedido_promedio: any,
        frecuencia_pedido: any,
        cumplimiento_frecuencia_pedido: any,
        referencia_promedio: any,
        cumplimiento_referencia_promedio: any,
        tipo_prueba_ab?: string,
        concursos_nuevos?: number,
        puntos?: number

    }) {
    }
}

export class GetClientByDocument implements Action {
    readonly type = GET_CLIENT_BY_DOCUMENT;

    constructor(public document: string, public validacion_x_distribuidor?: boolean, public distribuidor_id?: number) {
    }
}

export class SetClientByDocument implements Action {
    readonly type = SET_CLIENT_BY_DOCUMENT;

    constructor(public data: any) {
    }
}

export class UpdateAssociation implements Action {
    readonly type = UPDATE_ASSOCIATION;

    constructor(public cliente_id: number,
                public tienda_id: number,
                public distribuidor_id: number,
                public nueva_tienda_id: number,
                public token: string) {
    }
}

export class FinishUpdateAssociation implements Action {
    readonly type = FINISH_UPDATE_ASSOCIATION;

    constructor(public data: any) {
    }
}

export type ShopActions = GetShopsAction | FilterShopsAction | SetShopsAction;
