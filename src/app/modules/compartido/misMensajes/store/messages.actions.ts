import {Action} from '@ngrx/store';
import {IMessage, IMessages} from '../../../../interfaces/IMessages';
import {IModal} from '../../../../interfaces/IModal';


export const GET_MESSAGES = '[Messages] Get messages';
export const SET_MESSAGES = '[Messages] Set messages';
export const GET_LAST_MESSAGES = '[Messages] Get last messages';
export const SET_LAST_MESSAGES = '[Messages] Set last messages';
export const SET_READ_MESSAGE = '[Messages] Set read message';
export const SET_READ_MODAL = '[Messages] Set read modal';
export const GET_MODALS = '[Messages] Get modals';
export const SET_MODALS = '[Messages] Set modals';

export class GetMessagesAction implements Action {
    readonly type = GET_MESSAGES;

    constructor(public token: string, public page: number) {}
}

export class SetMessagesAction implements Action {
    readonly type = SET_MESSAGES;

    constructor(public messages: IMessages) {}
}

export class GetLastMessagesAction implements Action {
    readonly type = GET_LAST_MESSAGES;

    constructor(public token: string) {}
}

export class SetLastMessagesAction implements Action {
    readonly type = SET_LAST_MESSAGES;

    constructor(public message: IMessage, public countMessage: number) {}
}

export class SetReadMessageAction implements Action {
    readonly type = SET_READ_MESSAGE;

    constructor(public token: string, public message: IMessage, public messages: IMessages) {}
}

export class GetModalsAction implements Action {
    readonly type = GET_MODALS;

    constructor(public token: string) {}
}

export class SetModalsAction implements Action {
    readonly type = SET_MODALS;

    constructor(public modals: IModal[]) {}
}

export class SetReadModalAction implements Action {
    readonly type = SET_READ_MODAL;

    constructor(public token: string, public modal_id: string) {}
}


export type MessagesActions = GetMessagesAction | SetMessagesAction | SetReadMessageAction | SetReadModalAction | GetModalsAction;
