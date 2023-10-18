import {Action} from '@ngrx/store';
import {IMotivo} from '../../../../../interfaces/IMotivo';
import {ITransaction} from '../../../../../interfaces/ITransaction';

export const GET_MOTIVOS_NO_PEDIDO = '[Motivos no pedido] Get motivos no pedido';
export const SET_MOTIVOS_NO_PEDIDO = '[Motivos no pedido] Set motivos no pedido';



export class GetMotivosAction implements Action {
    readonly type = GET_MOTIVOS_NO_PEDIDO;

    constructor(public token: string) {
    }
}

export class SetMotivosAction implements Action {
    readonly type = SET_MOTIVOS_NO_PEDIDO;

    constructor(public motivosNoPedido: IMotivo[]) {
    }
}


export type MotivosActions = GetMotivosAction | SetMotivosAction ;
