export interface IProduct {
    id: number;
    nombre: string;
    cod_sap: string;
    codigo_disti: string;
    descripcion: string;
    visible: number;
    variante: string;
    presentacion: string;
    tamanio: string;
    ean: string;
    orden: number;
    valor_sugerido: string;
    valor_unidad_venta: string;
    embalaje_unidad_venta: number;
    descripcion_adicional: string;
    marca_id: number;
    unidad_medida: string;
    marca: string;
    precio: any;
    precio_unitario: number;
    iva: string;
    descuento: string;
    impoconsumo: string;
    producto_distribuidor_id: number;
    producto_id: number;
    compania_id: number;
    distribuidor_id: number;
    inventario: number;
    oferta_distribuidor: number;
    pedido: number;
    pedido_maximo: number;
    pedido_minimo: number;
    pedido_maximo_tienda: number;
    ofertas: any;
    multiplo_pedido: number;
    cantidad_vendida?: number;
    meta_venta_mes?: number;
    imagenes: [
        {
            id: number;
            descripcion: string;
            url: string;
        }
    ],
    prod_categorias: [
        {
            id: number;
            categoria_padre: string;
            nombre: string;
            descripcion: string;
            imagen: string;
        },
        {
            id: number;
            categoria_padre: string;
            nombre: string;
            descripcion: string;
            imagen: string;
        }
    ],
    pedidos: any;
    activo_apps: number;
    compania: string;
    cantidad: number;
    cantidad_pedidos?: number;
    valor: string;
    oferta: number;
    valor_original: string;
    estado: string;
    categoria_id: number;
    devuelto: boolean;
    total: any;
    imagen?: any;
    portafolio: string;
    valida_stock: boolean;
    valor_meta: any;
    valor_meta_actual: any;
    tipo_meta: string;
    tiendas_todas: boolean;
    pedidos_compuestos_sin_stock?: boolean;
    color: string;
    fecha_entrega?: string;
    puntaje_asignar?: string;
    valor_compra?: string;
    type?: string;
    texto?: string;
    valor_ganancia?: any;
    precio_de_venta_sugerido?: any;
    descuento_oferta_especial?: any;
    oferta_especial?: any;
    descuento_suma_productos_especial?: any;
    descuento_suma_productos_lineal?: any;
    oferta_por_producto?: boolean;
    obsequio?: boolean;
    obsequio_cantidad?: boolean;
    obsequio_referencia?: boolean;
    es_ofe_especial?: boolean;
    reglas?: any[];
    reglas_ofe?: any[];
    ofertas_reglas?: any;
    /* peso/unidad */
    factor?:number;
    factor_unidad?:string;
    unidad_seleccionada?:string;
    factor_precio?:number;
    no_factor_precio?:number;
    lista_precio_id_add?:number;
    unidad_empaque?:number;
    p_id?:number;
    regla_apply?:string;
    valor_descuento?: any;
    valor_descuento_total_especial?: any;
    producto?: {
        productos_compuestos: Array<{id: number, inventario: number, producto_distribuidor_id: number, pivot: {cantidad: number}}>
    };
    deeplink?: boolean;
    selected_merge?: boolean;
    valPdSegmentadoPara?: string;
    valCxdisActivo?: number;
    valDActivo?: number;
    valDValidaStock?: number;
    valOFechaFin?: string;
    valPdInventario?: number;
    valPdVisible?: number;
    valTxdActivo?: number;
    valPVisible?: number;
}
