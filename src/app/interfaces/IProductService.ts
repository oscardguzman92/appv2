export interface IProductService {
    id: number;
    nombre: string;
    codigo_producto_proveedor: string;
    monto_minimo: any;
    monto_maximo: any;
    observacion: string;
    created_at: any;
    update_at: any;
    servicio_tipo_producto_id: number;
    servicio_operador_id: number;
    activo: boolean;
    orden: any;
    tipo_producto: any;
    tipo_recarga?: any;
    empresa: any;
    operador: any;
    image?: string;
}
