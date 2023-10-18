import {Action} from '@ngrx/store';
import {ICredit} from '../../../../../interfaces/ICredit';
import {Shop} from '../../../../../models/Shop';
import {IPurchases} from '../../../../../interfaces/IPurchases';

export const GET_MY_CREDITS = '[My credits] Get my credits';
export const SET_MY_CREDITS = '[My credits] Set my credits';

export const GET_MY_CREDITS_ENTITY = '[My credits] Get my credits entity';
export const SET_MY_CREDITS_ENTITY = '[My credits] Set my credits entity';

export const GET_MY_BALANCE = '[My credits] Get my balance';
export const SET_MY_BALANCE = '[My credits] Set my balance';

export const GET_DESCRIPTION_CREDIT = '[My credits] Get description credit';
export const SET_DESCRIPTION_CREDIT = '[My credits] Set description credit';

export const GET_METHODS_PAY_CREDIT = '[My credits] Get method pay credit';
export const SET_METHODS_PAY_CREDIT = '[My credits] Set method pay credit';


export const SET_PURCHASE_CREDIT = '[My credits] Set purchase credit';

export class GetMyCreditsAction implements Action {
    readonly type = GET_MY_CREDITS;

    constructor(public token: string, public shop: Shop) {}
}

export class GetMyCreditsEntityAction implements Action {
    readonly type = GET_MY_CREDITS_ENTITY;

    constructor(public token: string, public shop, public entity, public user_id?: string) {}
}

export class SetMyCreditsEntityAction implements Action {
    readonly type = SET_MY_CREDITS_ENTITY;

    constructor(public credits: ICredit[], public saldo?: number) {}
}

export class GetMyBalanceAction implements Action {
    readonly type = GET_MY_BALANCE;

    constructor(public token: string, public shop) {}
}

export class SetMyBalanceAction implements Action {
    readonly type = SET_MY_BALANCE;

    constructor(public data) {}
}


export class SetMyCreditsAction implements Action {
    readonly type = SET_MY_CREDITS;

    constructor(public credits: ICredit[]) {}
}

export class GetDescriptionCreditAction implements Action {
    readonly type = GET_DESCRIPTION_CREDIT;

    constructor(public token: string, public idCredit: string) {}
}

export class SetDescriptionCreditAction implements Action {
    readonly type = SET_DESCRIPTION_CREDIT;

    constructor(public credit: ICredit, public purchases: IPurchases[]) {}
}

export class GetMethodsyPayAction implements Action {
    readonly type = GET_METHODS_PAY_CREDIT;

    constructor(public token: string, public idOrder: number) {}
}

export class SetMethodsyPayAction implements Action {
    readonly type = SET_METHODS_PAY_CREDIT;

    constructor(public idOrder: number, public methods: []) {}
}

export class SetPurcahseCreditAction implements Action {
    readonly type = SET_PURCHASE_CREDIT;

    // tslint:disable-next-line: max-line-length
    constructor(
                public purchase: IPurchases,
                public cash: string,
                public storeappCredit: string,
                public total: number,
                public user: number,
                public idOrder: number,
                public description: string
    ) {

    }
}


// tslint:disable-next-line: max-line-length
export type myCreditsActions =
    SetMyCreditsEntityAction | GetMyCreditsEntityAction |
    SetMyCreditsAction | GetMyCreditsAction |
    GetDescriptionCreditAction | SetDescriptionCreditAction |
    SetPurcahseCreditAction |
    GetMethodsyPayAction | SetMethodsyPayAction;
