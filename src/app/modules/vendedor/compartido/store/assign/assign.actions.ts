import {Action} from '@ngrx/store';
import {ICurrentAccount} from '../../../../../interfaces/ICurrentAccount';
import {IMovimentAssign} from '../../../../../interfaces/IMovimentAssign';

export const GET_ACCOUNT_ASSIGN = '[ACCOUNT ASSIGN] Get account assign';
export const SET_ACCOUNT_ASSIGN = '[ACCOUNT ASSIGN] set account assign';
export const ASSIGN_BALANCE = '[ACCOUNT ASSIGN] assign balance';
export const GET_ASSIGN_MOVIMENTS = '[ACCOUNT ASSIGN] Get assign moviments';

export class GetAccountAssignAction implements Action {
    readonly type = GET_ACCOUNT_ASSIGN;

    constructor(public token: string, public assignMoviments: IMovimentAssign[]) {
    }
}

export class GetAssignMovimentsAction implements Action {
    readonly type = GET_ASSIGN_MOVIMENTS;

    constructor(public token: string) {
    }
}

export class AssignBalanceAction implements Action {
    readonly type = ASSIGN_BALANCE;

    constructor(public token: string, public value: string, public tienda_id: number) {
    }
}

export class SetAccountAssignAction implements Action {
    readonly type = SET_ACCOUNT_ASSIGN;

    constructor(public currentAccount: ICurrentAccount, public assignMoviments: IMovimentAssign[]) {
    }
}

export type assignActions =
    GetAccountAssignAction
    | SetAccountAssignAction
    | AssignBalanceAction
    | GetAssignMovimentsAction;

