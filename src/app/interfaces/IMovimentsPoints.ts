export interface IMovimentsPoints {
    movimientos: MovimentPoints[];
    pedidos: {
        id: number;
        cod_pedido: string;
        total: number;
    };
    ptosProductos: {
        cod_sap: string;
        compania_id: number;
        compania: string;
        total: number;
        puntos: number;
        puntaje: number;
        v_compra: number;
    };
}

export interface MovimentPoints {
    operacion: string;
    puntos: number;
    detalle: string;
    fecha: any;
    entregado: boolean;
    fecha_expiracion: any;
    puntaje_actual: number;
}
