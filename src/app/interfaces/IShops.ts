export interface IShops {
    productos_seleccionados: {};
    codigo_cliente: string;
    distribuidor_id: number;
    nombre_tienda: string;
    nombre?: string;
    cedula_distribuidor: string;
    id: number;
    direccion: string;
    longitud: string;
    latitud: string;
    barrio: string;
    ciudad_id: number;
    nombre_contacto: string;
    dia: string;
    telefono_contacto: string;
    orden: number;
    preferencia_orden: number;
    no_pedido: string;
    activo: boolean;
    pedido: string;
    status_productos_pendientes: boolean;
    status_en_conflicto: boolean;
    viewAll: boolean;
    inactive: boolean;
    tienda_tipologia_id: number;
    estrato: number;
    devolucion?: number;
    ciu_nombre?: string;
    indexOrden?: number;
    cliente?: any;
    zona?: number;
}