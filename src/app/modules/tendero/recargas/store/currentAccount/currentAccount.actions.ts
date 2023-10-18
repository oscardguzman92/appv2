import {Action} from '@ngrx/store';
import {ICurrentAccount} from '../../../../../interfaces/ICurrentAccount';

export const GET_CURRENT_ACCOUNT = '[Current account] Get current account';
export const SET_CURRENT_ACCOUNT = '[Current account] Set current account';
export const SET_CURRENT_ACCOUNT_PASSWORD = '[Current account] Set current account password';
export const GET_DDDEDO = '[Current account] Get dddedo';
export const SET_DDDEDO = '[Current account] Set dddedo';
export const GET_BALANCE = '[Current account] Get balance';
export const GET_MENSAJE = "[Current account] Get mensaje";
export const SET_BALANCE = '[Current account] Set balance';
export const SET_MENSAJE = "[Current account] Set mensaje";

export class GetCurrentAccountAction implements Action {
    readonly type = GET_CURRENT_ACCOUNT;

    constructor(public token: string, public password: string) {}
}

export class SetCurrentAccountAction implements Action {
    readonly type = SET_CURRENT_ACCOUNT;

    constructor(public currentAccount: ICurrentAccount) {}
}

export class SetCurrentAccountPasswordAction implements Action {
    readonly type = SET_CURRENT_ACCOUNT_PASSWORD;

    constructor(public token: string, public password: string, public repeatPassword) {}
}


export class GetDddedoAction implements Action {
    readonly type = GET_DDDEDO;

    constructor(public token: string) {}
}

export class SetDddedoAction implements Action {
    readonly type = SET_DDDEDO;

    constructor(public cupo: {cupo_disponible: number, minimo: number, saldo_cuenta_transferencia: number, saldo_cuenta_venta: number}) {}
}

export class GetBalanceAction implements Action {
    readonly type = GET_BALANCE;

    constructor(public token: string) {}
}

export class SetBalanceAction implements Action {
    readonly type = SET_BALANCE;

    constructor(public balance: string, public totalAmountCredits: string, public totalAvalaibleCredits: string) {}
}

export class SetMensajeAction implements Action {
    readonly type = SET_MENSAJE;

    constructor(public mensaje: string) {}
}

export class GetMensajeAction implements Action {
  readonly type = GET_MENSAJE;

  constructor(public token: string) {}
}

export type CurrentAccountActions = GetCurrentAccountAction | SetCurrentAccountAction | SetCurrentAccountPasswordAction;
