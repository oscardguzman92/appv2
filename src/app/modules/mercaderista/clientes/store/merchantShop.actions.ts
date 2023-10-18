import { Action } from '@ngrx/store';
import {Shopkeeper} from '../../../../models/Shopkeeper';

export const GET_MERCHANT_SHOP = '[merchantShop] Get merchantShop';
export const SET_MERCHANT_SHOP = '[merchantShop] Set merchantShop';
export const SET_MERCHANT_GEOLOCATION = '[merchantShop] Set merchant geolocation';
export const SET_CLIENT_MERCHANT = '[merchantClient] Set merchant client';
export const AFTER_SET_CLIENT_MERCHANT = '[merchantClient] After set merchant client';


export class GetMerchantShopAction implements Action {
    readonly type = GET_MERCHANT_SHOP;

    constructor(public token: string, public callback?: any) {}
}

export class SetMerchantShopAction implements Action {
    readonly type = SET_MERCHANT_SHOP;

    constructor(public shops: any[]) {}
}

export class SetMerchantGeolocationAction implements Action {
    readonly type = SET_MERCHANT_GEOLOCATION;

    constructor(public token: string, public lat: string, public long: string) {}
}

/*Creación de cliente*/
export class SetClientMerchantAction implements Action {
    readonly type = SET_CLIENT_MERCHANT;

    constructor(public shopkeeper: Shopkeeper, public mercaderista_id: number, public token: string) {}
}

export class AfterSetClientMerchantAction implements Action {
         readonly type = AFTER_SET_CLIENT_MERCHANT;
         constructor(public update?: boolean) {}
       }

export type merchantShopsActions = SetMerchantShopAction | GetMerchantShopAction | SetClientMerchantAction | AfterSetClientMerchantAction;
