import {Action} from '@ngrx/store';
import {IUser} from '../../../../interfaces/IUser';
import { IDepartament } from 'src/app/interfaces/IDepartament';
import { ICity } from 'src/app/interfaces/ICity';
import { IShops } from 'src/app/interfaces/IShops';
import { Shop } from 'src/app/models/Shop';
import {Shopkeeper} from '../../../../models/Shopkeeper';

export const SET_USER = '[Register] Set user';

export const SET_SHOP = '[Register] Set shop';

export const RESPONSE_SET_SHOP = '[Register] Response Set shop';

export const AFTER_SET_USER = '[Register] After set user';

export const GET_DEPARTAMENTS = '[Register] Get Departaments ';

export const SET_DEPARTAMENTS = '[Register] Set Departaments ';

export const GET_CITIES = '[Register] Get Cities ';

export const SET_CITIES = '[Register] Set Cities ';

export const UPDATE_USER_BEFORE_FINISH_REGISTER = '[Register] Update user before finish register';

export const SET_FINISH_USER_REGISTER = '[Register] Set finish data user register';

export const BACK_BUTTON_ACTION = '[Register] Back button';

export const SET_CLIENT_SHOP = '[Register] Set client shop';

export const AFTER_SET_CLIENT_SHOP = '[Register] After set client shop';

export const SET_ADDRESS_SHOP = '[Register] Set address shop';

export const AFTER_SET_ADDRESS_SHOP = '[Register] After set address shop';


export class SetUserAction implements Action {
    readonly type = SET_USER;

    constructor(public user: IUser, public finishPrecess?: boolean) {}
}

export class SetShopAction implements Action {
    readonly type = SET_SHOP;

    constructor(public token: string, public shop: Shop) {}
}

export class ResponseSetShopAction implements Action {
    readonly type = RESPONSE_SET_SHOP;

    constructor(public res: any) {}
}


export class AfterSetUserAction implements Action {
    readonly type = AFTER_SET_USER;

    constructor(public user: IUser) {}
}

export class GetDepartamentsAction implements Action {
    readonly type = GET_DEPARTAMENTS;

    constructor(public token: string) {}
}

export class SetDepartamentsAction implements Action {
    readonly type = SET_DEPARTAMENTS;

    constructor(public departaments: IDepartament[]) {}
}

export class GetCitiesAction implements Action {
    readonly type = GET_CITIES;

    constructor(public token: string, public idDepto: string) {}
}

export class SetCitiesAction implements Action {
    readonly type = SET_CITIES;

    constructor(public cities: ICity[]) {}
}

export class UpdateUserBeforeRegisterFinishAction implements Action {
    readonly type = UPDATE_USER_BEFORE_FINISH_REGISTER;

    constructor(public user: IUser, public departament: string, public city: string) {}
}

export class SetFinishUserRegisterAction implements Action {
    readonly type = SET_FINISH_USER_REGISTER;

    constructor(public user: IUser) {}
}

export class BackButtonAction implements Action {
    readonly type = BACK_BUTTON_ACTION;
}

export class SetClientShopAction implements Action {
    readonly type = SET_CLIENT_SHOP;

    constructor(public shopkeeper: Shopkeeper, public distribuidor_id: number, public token: string) {}
}

export class AfterSetClientShopAction implements Action {
    readonly type = AFTER_SET_CLIENT_SHOP;
    constructor(public update?:boolean){}
}

export class SetAddressShopAction implements Action {
    readonly type = SET_ADDRESS_SHOP;

    constructor(public shop: Shop, public token: string) {}
}

export class AfterSetAddressShopAction implements Action {
    readonly type = AFTER_SET_ADDRESS_SHOP;
}

export type registerActions = SetUserAction |
        AfterSetUserAction |
        GetDepartamentsAction |
        SetDepartamentsAction |
        GetCitiesAction |
        SetCitiesAction |
        UpdateUserBeforeRegisterFinishAction |
        SetShopAction |
        SetFinishUserRegisterAction;
