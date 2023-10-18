import {Action} from '@ngrx/store';
import {IProductService} from '../../../../../interfaces/IProductService';
import {ITransaction} from '../../../../../interfaces/ITransaction';

export const GET_TOP_UPS = '[Top ups] Get top ups';
export const SET_TOP_UPS = '[Top ups] Set top ups';
export const SET_TOP_UPS_SELECTED = '[Top ups] Set top ups selected';
export const SET_TOP_UPS_SERVICE = '[Top ups] Set top ups service';
export const SEND_DDDEDO = '[Top ups] Send Dddedo';
export const GET_HISTORY_TOP_UPS = '[Top ups] Get history top ups';
export const SET_HISTORY_TOP_UPS = '[Top ups] Set history top ups';

export class GetTopUpsAction implements Action {
    readonly type = GET_TOP_UPS;

    constructor(public token: string) {
    }
}

export class SetTopUpsAction implements Action {
    readonly type = SET_TOP_UPS;

    constructor(public topUps: IProductService[]) {
    }
}

export class SetTopUpsSelectedAction implements Action {
    readonly type = SET_TOP_UPS_SELECTED;

    constructor(public topUps: IProductService[], public topUpsSelected: IProductService) {
    }
}

export class SetTopUpsServiceAction implements Action {
    readonly type = SET_TOP_UPS_SERVICE;

    constructor(public topUpsSelected: IProductService,
                public token: string,
                public value: any,
                public cellphone: any,
                public pass_act: string) {
    }
}

export class SendDddedoAction implements Action {
    readonly type = SEND_DDDEDO;

    constructor(public token: string,
                public value: any) {
    }
}

export class GetHistoryTopUps implements Action {
    readonly type = GET_HISTORY_TOP_UPS;

    constructor(public token: string, public page: number) {
    }
}

export class SetHistoryTopUps implements Action {
    readonly type = SET_HISTORY_TOP_UPS;

    constructor(public transactions: ITransaction[], public paginate: any) {
    }
}

export type TopUpsActions = GetTopUpsAction | SetTopUpsAction | SetTopUpsSelectedAction | SetTopUpsServiceAction | SendDddedoAction;
