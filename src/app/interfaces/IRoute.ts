import {IOrder} from '../services/orders/orders.service';

export interface IRoute {
    pedidos: {
        orden: number;
        pedido: IOrder;
        id: number;
        entregado?: boolean;
        firstActive?: boolean;
    }[];
    nombre: string;
    close: boolean;
    id: number;
    dia: number;
    transportador_id: number;
}


