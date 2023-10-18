import {Action} from '@ngrx/store';
import {Order} from '../../../../models/Order';
import {ICategory} from 'src/app/interfaces/ICategory';
import {IBrand} from 'src/app/interfaces/IBrand';
import {IProduct} from 'src/app/interfaces/IProduct';
import {IPaginate} from 'src/app/interfaces/IPaginate';


export const SET_ORDER_SHOP = '[Orders] Set order shop';

export const GET_CATEGORIES = '[Orders] Get categories';

export const SET_CATEGORIES = '[Orders] Set categories';

export const GET_BRANDS = '[Orders] Get brands';

export const SET_BRANDS = '[Orders] Set brands';

export const GET_SEARCH_PRODUCTS = '[Orders] Get Search products';

export const SET_SEARCH_PRODUCTS = '[Orders] Set Search products';

export const GET_PRODUCTS = '[Orders] Get products';

export const SET_PRODUCTS = '[Orders] Set products';

export const FILTER_PRODUCTS = '[Orders] Filter products';

export const COMPARE_PRODUCTS = '[Orders] Compare products';

export const GET_ORDER = '[Orders] Get order';

export const GET_ORDER_DETAIL = '[Orders] Get Order Detail';

export const COUNT_PRODUCTS_ORDER = '[Orders] Count Products Order';

export const OPEN_CAR = '[Orders] Open car';

export const GET_FAVORITES_ORDERS = '[Orders] Get favorites orders';

export const SET_FAVORITES_ORDERS = '[Orders] Set favorites orders';

export const GET_STATUS_PRODUCT_BY_SHOP = '[Orders] Get status product by shop';

export const SET_STATUS_PRODUCT_BY_SHOP = '[Orders] Set status product by shop';




export interface IResponseProduct {
    "total": number,
    "per_page": number,
    "current_page": number,
    "last_page": number,
    "next_page_url": string,
    "prev_page_url": string,
    "data": IProduct[],
    "from": number,
    "to": number,
}

export class SetOrderShopAction implements Action {
    readonly type = SET_ORDER_SHOP;

    constructor(public order: Order) {
    }
}

export class GetCategoriesAction implements Action {
    readonly type = GET_CATEGORIES;

    constructor(public token: string, public tienda_id: number, public compania_id: number, public distribuidor_id: number, public portafolio: number, public tipo_id: number, public callbackEvent?: any) {
    }
}

export class SetCategoriesAction implements Action {
    readonly type = SET_CATEGORIES;

    constructor(public categories: ICategory[]) {
    }
}

export class GetBrandsAction implements Action {
    readonly type = GET_BRANDS;

    constructor(public token: string, public tienda_id: number, public distribuidor_id: number) {
    }
}

export class SetBrandsAction implements Action {
    readonly type = SET_BRANDS;

    constructor(public brands: IBrand[], public featuredProducts?) {
    }
}

export class GetSearchProductsAction implements Action {
    readonly type = GET_SEARCH_PRODUCTS;

    constructor(
        public token: string, 
        public search: string, 
        public tienda_id: number,
        public compania_id: number, 
        public distribuidor_id: number,
        public portafolio: string,
        public product_id: string,
        public page: number) {}
}


export class SetSearchProductsAction implements Action {
    readonly type = SET_SEARCH_PRODUCTS;

    constructor(public products: IProduct[], public paginate?:IPaginate, public error?: boolean) {}
}

export class GetProductsAction implements Action {
    readonly type = GET_PRODUCTS;

    constructor(
        public token: string,
        public tienda_id: number,
        public category_id: number,
        public compania_id: number, 
        public distribuidor_id: number,
        public portafolio: string,
        public tipo_id: number,
        public page: number,
        public limit: number,
        public productos_selecionados: IProduct[],
        public role: string = 'cliente') {
    }
}

export class SetProductsAction implements Action {
    readonly type = SET_PRODUCTS;

    constructor(public products: IProduct[], public productsSel: IProduct[], public category_id?: number, public paginate?:IPaginate, public error?: boolean) {
    }
}

export class FilterProductsAction implements Action {
    readonly type = FILTER_PRODUCTS;

    constructor(public productsCompare: IProduct[], public statusSetProduct: boolean = true, public category_id?: number) {
    }
}

export class CompareProducts implements Action {
    readonly type = COMPARE_PRODUCTS;

    constructor(public productsCompare: IProduct[]) {
    }
}

export class GetOrderAction implements Action {
    readonly type = GET_ORDER;

    constructor(public token: string, public tienda_id: number, public callback?: any, public codigo_cliente?: string) {
    }
}

export class GetOrderDetailAction implements Action {
    readonly type = GET_ORDER_DETAIL;

    constructor(public token: string, public tienda_id: number, public en_conflicto: boolean = false, public callback?: any) {
    }
}

export class CountProductsOrderAction implements Action {
    readonly type = COUNT_PRODUCTS_ORDER;

    constructor(public nProducts: number) {
    }
}

export class OpenCarAction implements Action {
    readonly type = OPEN_CAR;
}

export class GetFavoritesOrders implements Action {
    readonly type = GET_FAVORITES_ORDERS;

    constructor(public tienda_id: number, public token: string, public compania_id?: number) {}
}

export class SetFavoritesOrders implements Action {
    readonly type = SET_FAVORITES_ORDERS;

    constructor(public orders: Order[]) {}
}

export class GetStatusProductByShopAction implements Action {
    readonly type = GET_STATUS_PRODUCT_BY_SHOP;

    constructor(public token: string, public tienda_id: number, public producto_distribuidor_id: number) {}
}

export class SetStatusProductByShopAction implements Action {
    readonly type = SET_STATUS_PRODUCT_BY_SHOP;

    constructor(public status: boolean) {}
}







export type OrdersActions =
    SetOrderShopAction
    | GetCategoriesAction
    | SetCategoriesAction
    | GetProductsAction
    | SetProductsAction
    | GetOrderAction
    | FilterProductsAction
    | CountProductsOrderAction;
