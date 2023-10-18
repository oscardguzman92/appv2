export interface IMySales {
    cantidad_pedidos_dia: number;
    cantidad_pedidos_mes: number;
    companias: {
        ventas: ISales[],
        pedidos: IOrders[],
        tiendas: IShop[]
    };
    cuota_vendedor: any;
    marcas: {
        ventas: ISales[],
        pedidos: IOrders[],
        tiendas: IShop[]
    };
    pedido_promedio_mes: any;
    porcentaje_cumplimiento_sin_iva: any;
    porcentaje_proyeccion: any;
    productos_promedio_pedido_mes: number;
    proyeccion_cierre_sin_iva: any;
    resumen_completos_mes: {
        completos_cantidad: number,
        otros_cantidad: number,
        completo_porcentaje: any
    };
    resumen_pedidos_diarios: IDailyOrders[];
    tiendas_activas_x_vendedor_del_dia: number;
    tiendas_activas_x_vendedor_del_mes: number;
    tiendas_del_vendedor_del_dia: number;
    tiendas_del_vendedor_del_mes: number;
    tiendas_storeapp_rutero: number;
    variacion_pedidos_promedio_sin_iva: any;
    variacion_productos_promedio: any;
    venta_dia: any;
    venta_mes_sin_iva: any;
    ventas_dia_visita: any;
    ventas_dia_no_visita: any;
    ventas_dia_total: any;
    pedidos_dia_visita: any;
    pedidos_dia_no_visita: any;
    ventas_dia_visita_mes: any;
    ventas_dia_no_visita_mes: any;
    pedidos_dia_no_visita_mes: any;
    pedidos_dia_visita_mes: any;
}

interface IOrders {
    cantidad_pedidos_dia: number;
    cantidad_pedidos_mes: number;
    id: number;
    nombre: string;
}

interface ISales {
    id: number;
    nombre: string;
    venta_dia: any;
    venta_mes_sin_iva: any;
}

interface IShop {
    id: number;
    nombre: string;
    tiendas_activas_x_dia: number;
    tiendas_activas_x_mes: number;
}

interface IDailyOrders {
    codigo_cliente: any;
    creado_hoy: boolean;
    dia_visita: string;
    fecha_envio: string;
    id: number;
    nombre: string;
    nombre_contacto: string;
    tienda_id: number;
    updated_at: string;
    created_at: string;
    valor_pedido: any;
    valor_devolucion: any;
    classState: string;
}
