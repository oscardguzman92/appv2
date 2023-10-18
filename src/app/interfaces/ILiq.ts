export enum TypesMethod  {
    cash =  1,
    storeapp =  2,
    credit = 3
}

export interface ILiq {
    numberOrders: number;
    ordersPending: number;
    ordersDelivered: number;
    ordersDeliveredWithReturn: number;
    valueOrdersWithoutDelivered: number;
    valueOrdersDeliveredWithReturn: number;
    orders: [
        {
            id: number;
            valor_pedido: number;
            entregado: boolean;
            compra: {
                metodos_pago: [{
                    id_tipo_metodo: TypesMethod,
                    monto: number;
                }]
            }
        }
    ]
}
