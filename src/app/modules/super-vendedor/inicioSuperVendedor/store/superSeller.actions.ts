import {Action} from '@ngrx/store';
import { Seller } from 'src/app/models/Seller';
import { IUser } from 'src/app/interfaces/IUser';

export const GET_SELLERS = '[sellers] Get sellers';
export const SET_SELLERS = '[sellers] Set sellers';

export const GET_SHOPKEEPER_BY_SELLER = '[sellers] Get Shopkeepers by sellers';
export const SET_SHOPKEEPER_BY_SELLER = '[sellers] Set Shopkeepers by sellers';


export class GetSellersAction implements Action {
    readonly type = GET_SELLERS;

    constructor(public token: string, public callback?: any) {}
}

export class SetSellersAction implements Action {
    readonly type = SET_SELLERS;

    constructor(public sellers: Seller[]) {}
}

export class GetShopkeeperBySellerAction implements Action {
    readonly type = GET_SHOPKEEPER_BY_SELLER;

    constructor(public token: string, public cedula:string, public callback?: any) {}
}

export class SetShopkeeperBySellerAction implements Action {
    readonly type = SET_SHOPKEEPER_BY_SELLER;

    constructor(public user: IUser) {}
}

export type sellersActions = SetSellersAction | GetSellersAction;
