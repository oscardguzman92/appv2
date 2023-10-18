import {IUser} from '../../interfaces/IUser';
import {Action} from '@ngrx/store';
import {ILogin} from '../../interfaces/ILogin';

export const LOGIN_USER = '[Auth] Login User';
export const AFTER_LOGIN_USER = '[Auth] After Login User';
export const SET_USER = '[Auth] Set User';
export const UNSET_USER = '[Auth] Unset User';

export const REFRESH_USER = '[Auth] Refresh User';
export const AFTER_REFRESH_USER = '[Auth] After Refresh User';

export const SET_PERCENTAGE = '[Download] Set Percentage';

export class LoginUserAction implements Action {
    readonly type = LOGIN_USER;

    constructor(public login: ILogin) {
    }
}

export class AfterLoginUserAction implements Action {
    readonly type = AFTER_LOGIN_USER;

    constructor(public user: IUser) {
    }
}

export class SetUserAction implements Action {
    readonly type = SET_USER;

    constructor(public user: IUser) {
    }
}

export class UnsetUserAction implements Action {
    readonly type = UNSET_USER;
}

export class RefreshUserAction implements Action {
    readonly type = REFRESH_USER;

    constructor(public login: ILogin, public notRemoveOrder?: boolean) {
    }
}

export class AfterRefreshUserAction implements Action {
    readonly type = AFTER_REFRESH_USER;

    constructor(public user?: IUser, public sessionInactive?: boolean, public notRemoveOrder?: boolean) {
    }
}

export class SetPercentageAction implements Action {
    readonly type = SET_PERCENTAGE;

    constructor(public percentage: number) {
    }
}


export type authActions =
    SetUserAction
    | UnsetUserAction
    | LoginUserAction
    | AfterLoginUserAction
    | RefreshUserAction
    | AfterRefreshUserAction
    | SetPercentageAction;
