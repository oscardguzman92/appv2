import {Action} from '@ngrx/store';
import {IUser} from '../../../../interfaces/IUser';

export const UPDATE_USER = '[EDIT] Update user';
export const AFTER_UPDATE_USER = '[EDIT] After update user';

export class UpdateUserAction implements Action {
    readonly type = UPDATE_USER;

    constructor(public user: IUser) {}
}

export class AfterUpdateUserAction implements Action {
    readonly type = AFTER_UPDATE_USER;

    constructor(public user: IUser) {}
}

export type EditActions = UpdateUserAction | AfterUpdateUserAction;
