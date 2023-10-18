import {Shop} from './Shop';
import { IProduct } from '../interfaces/IProduct';

export class Order {
    // properties by service​​​
    public bloqueado: boolean;
    public califica: boolean;
    public calificacion: any;
    public cedula: string;
    public club_storeapp: boolean;
    public cod_pedido: string;
    public codigo_cliente: string;
    public codigo_auxiliar: string;
    public codigo_pedido_externo: string;
    public compania_id: number;
    public created_at: string;
    public devoluciones: any;
    public devuelto: boolean;
    public direccion: string;
    public distribuidor: string;
    public distribuidor_id: number;
    public email: string;
    public enviado: boolean;
    public estado: string;
    public estado_factura: string;
    public estado_pedido: any;
    public estado_pedido_id: number;
    public estado_slug: string;
    public express: boolean;
    public extra_ruta: boolean;
    public fecha_bloqueado: string;
    public fecha_entrega: string;
    public fecha_envio: string;
    public id: number;
    public id_pedido_externo: number;
    public log_pedido_externo_id: number;
    public nombre_contacto: string;
    public nombre_tienda: string;
    public observacion: any;
    public tienda_id: number;
    public updated_at: string;
    public valor: any;
    public valor_pedido: any;
    public valor_pedido_original: null;
    public vendedor: string;
    public vendedor_id: number;
    public tiendas: Shop[];
    public productos: IProduct[];
    public productos_devueltos?: IProduct[];
    public motivo?: string;

    constructor(orderByService: any) {
        Object.assign(this, orderByService);
    }
}
