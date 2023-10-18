import {Action} from '@ngrx/store';

export const TOGGLE_MENU = '[GENERAL MENU] Toggle menu';
export const AFTER_LOGIN_MENU = '[GENERAL MENU] After login menu';

export class ToggleMenu implements Action {
    readonly type = TOGGLE_MENU;
}

export class AfterLoginMenu implements Action {
    readonly type = AFTER_LOGIN_MENU;
}

export type menuActions = ToggleMenu;
