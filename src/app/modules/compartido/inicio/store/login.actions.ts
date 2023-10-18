import {Action} from '@ngrx/store';

export const LOGIN_BY_DOCUMENT = '[login] Login By Document';
export const RESPONSE_LOGIN_BY_DOCUMENT = '[login] Response Login By Document';

export const SEND_SMS = '[login] Send Sms';
export const RESPONSE_SEND_SMS = '[login] Response Send Sms';

export const UPDATE_CELLPHONE = '[login] Update Cellphone';
export const RESPONSE_UPDATE_CELLPHONE = '[login] Response Update Cellphone';

export const VALIDATE_CODE_SMS = '[login] Validate Code Sms';
export const RESPONSE_VALIDATE_CODE_SMS = '[login] Response Validate Code Sms';


export class LoginByDocumentAction implements Action {
    readonly type = LOGIN_BY_DOCUMENT;

    constructor(public document: string, public player_id?: any, public via_wapp?:any) {
    }
}

export class ResponseLoginByDocumentAction implements Action {
    readonly type = RESPONSE_LOGIN_BY_DOCUMENT;

    constructor(public data: any) {
    }
}

export class SendSmsAction implements Action {
    readonly type = SEND_SMS;

    constructor(public cellphone: string, public via_wapp?:any) {
    }
}

export class ResponseSendSmsAction implements Action {
    readonly type = RESPONSE_SEND_SMS;

    constructor(public data: any) {
    }
}

export class UpdateCellphoneAction implements Action {
    readonly type = UPDATE_CELLPHONE;

    constructor(public cellphone: string, public document: string, public soloValidar?: boolean, public idIgnore?: number, public sinValidacionTelefono?:boolean) {
    }
}

export class ResponseUpdateCellphoneAction implements Action {
    readonly type = RESPONSE_UPDATE_CELLPHONE;

    constructor(public data: any) {
    }
}

export class ValidateCodeSmsAction implements Action {
    readonly type = VALIDATE_CODE_SMS;

    constructor(public cellphone: string, public code: string, public login?: string, public password?: string, public player_id?: string) {
    }
}

export class ResponseValidateCodeSmsAction implements Action {
    readonly type = RESPONSE_VALIDATE_CODE_SMS;

    constructor(public data: any) {
    }
}

export type loginActions = LoginByDocumentAction | ResponseLoginByDocumentAction;
