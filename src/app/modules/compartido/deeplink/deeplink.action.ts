import {Action} from '@ngrx/store';

export const GET_VALIDA_PRODUCTS = '[Validate] Get Validate products';
export const SET_VALIDA_PRODUCTS = '[Validate] Set Validate products';

export class GetValidarProductsAction implements Action {
    readonly type = GET_VALIDA_PRODUCTS;
    
    
    constructor(
        public token: string, 
        public producto_id: string, 
        public tienda_id: number) {
        }
}

export class SetValidarProductsAction implements Action {
    readonly type = SET_VALIDA_PRODUCTS;

    constructor(public product: any) {
    }
}
