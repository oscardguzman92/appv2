export interface ICompany {
    vista_portafolio: boolean;
    nom_dist: string;
    id: any;
    nombre: string;
    order: number;
    hora_cron_envio_pedidos: any;
    dia: string;
    tiempo_entrega: number;
    pedido_express: any;
    distribuidor_id: number;
    valor_minimo_compra: any;
    compania_x_distribuidor_id: number;
    puntos: {
        puntaje_asignar: number,
        valor_compra: any
    };
    portafolio: any;
    image:string;
    totalOrder: number;
}
