import {IReason} from './IReason';

export interface IReasonHistory {
    id: number;
    transportador_id: number;
    pedido_id?: number;
    motivo_id?: number;
    observacion?: string;
    latitud?: string;
    longitud?: string;
    created_at: string;
    updated_at: string;
    motivo?: IReason;
}
