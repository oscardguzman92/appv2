import {Action} from '@ngrx/store';
import {IOrderReq} from '../../../../interfaces/IOrderReq';
import {IReason} from '../../../../interfaces/IReason';
import {IReasonReq} from '../../../../interfaces/IReasonReq';
import {IReasonHistory} from '../../../../interfaces/IReasonHistory';
import {ILiq} from '../../../../interfaces/ILiq';
import {IRoute} from '../../../../interfaces/IRoute';

export const SET_ORDER = '[Transporter] set order';
export const FINISH_ORDER = '[Transporter] Finish set order';

export const GET_REASON = '[Transporter] get reasons';
export const SET_REASON = '[Transporter] set reasons';

export const SET_REASON_TRANSPORTER = '[Transporter] Set reasons transporter';
export const FINISH_REASON_TRANSPORTER = '[Transporter] set reasons transporter';

export const GET_REASONS_HISTORY = '[Transporter] Get reasons history';
export const SET_REASONS_HISTORY = '[Transporter] Set reasons history';

export const SET_ORDER_TRANSPORTER = '[Transporter] Set order transporter transporter';
export const FINISH_ORDER_TRANSPORTER = '[Transporter] finish order transporter transporter';

export const GET_LIQ = '[Transporter] Get liq';
export const SET_LIQ = '[Transporter] Set liq';

export const CLOSE_DAY = '[Transporter] Close day';
export const FINISH_CLOSE_DAY = '[Transporter] Finish Close day';

export class SetOrderAction implements Action {
    readonly type = SET_ORDER;

    constructor(public token: string, public data?: IOrderReq) {}
}

export class FinishSetOrderAction implements Action {
    readonly type = FINISH_ORDER;

    constructor(public data: any) {}
}


export class GetReasons implements Action {
    readonly type = GET_REASON;

    constructor(public token: string) {}
}

export class SetReasons implements Action {
    readonly type = SET_REASON;

    constructor(public data: IReason[]) {}
}

export class SetReasonTransporterAction implements Action {
    readonly type = SET_REASON_TRANSPORTER;

    constructor(public token: string, public data?: IReasonReq) {}
}

export class FinishSetReasonTransporterAction implements Action {
    readonly type = FINISH_REASON_TRANSPORTER;

    constructor(public data: IReason) {}
}

export class GetReasonsHistory implements Action {
    readonly type = GET_REASONS_HISTORY;

    constructor(public token: string) {}
}

export class SetReasonsHistory implements Action {
    readonly type = SET_REASONS_HISTORY;

    constructor(public data: IReasonHistory[]) {}
}

export class SetOrderPurchaseTransporter implements Action {
    readonly type = SET_ORDER_TRANSPORTER;

    constructor(public token: string, public params: any) {}
}

export class FinishSetOrderPurchaseTransporter implements Action {
    readonly type = FINISH_ORDER_TRANSPORTER;

    constructor(public rutas: IRoute[]) {}
}

export class GetLiq implements Action {
    readonly type = GET_LIQ;

    constructor(public token: string) {}
}

export class SetLiq implements Action {
    readonly type = SET_LIQ;

    constructor(public data: ILiq) {}
}

export class CloseDay implements Action {
    readonly type = CLOSE_DAY;

    constructor(public token: string, public devolucion: number) {}
}

export class FinishCloseDay implements Action {
    readonly type = FINISH_CLOSE_DAY;

    constructor(public data: boolean) {}
}


export type transporterActions = SetOrderAction | FinishSetOrderAction | SetReasonTransporterAction |
    FinishSetReasonTransporterAction | GetLiq | SetLiq;
