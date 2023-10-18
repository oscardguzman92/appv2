import {Action} from '@ngrx/store';
import {IMotivoCalificacion} from '../../../../../interfaces/IMotivoCalificacion';
import {ITransaction} from '../../../../../interfaces/ITransaction';

export const GET_MOTIVOS_CALIFICACION = '[Motivos calificacion] Get motivos calificacion';
export const SET_MOTIVOS_CALIFICACION = '[Motivos calificacion] Set motivos calificacion';



export class GetMotivosAction implements Action {
    readonly type = GET_MOTIVOS_CALIFICACION;

    constructor(public token: string) {
    }
}

export class SetMotivosAction implements Action {
    readonly type = SET_MOTIVOS_CALIFICACION;

    constructor(public motivosCalificacion: IMotivoCalificacion[]) {
    }
}


export type MotivosActions = GetMotivosAction | SetMotivosAction ;
