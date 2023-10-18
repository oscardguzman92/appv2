import {IProduct} from '../interfaces/IProduct';

export class Shop {
    public selected: boolean;


    // Properties by service
    public id: number;
    public nombre: string;
    public direccion: string;
    public longitud: string;
    public latitud: string;
    public cliente_id: number;
    public barrio: string;
    public ciudad_id: number;
    public ciudad_nombre: number;
    public created_at: string;
    public updated_at: string;
    public verificado: boolean;
    public verificado_por: any;
    public fecha_verificado: string;
    public temporal: boolean;
    public tienda_tipologia_id: number;
    public tipologia: string;
    public estrato: number;
    public localidad: string;
    public basura: boolean;
    public ciudad: string;
    public codigo_cliente: string;
    public codigo_auxiliar: string;
    public distribuidor_id: number;
    public nombre_tienda: string;
    public cedula_distribuidor: string;
    public nombre_contacto: string;
    public dia: string;
    public dia_semana: string;
    public telefono_contacto: string;
    public orden: number;
    public preferencia_orden: number;
    public no_pedido: string;
    public activo: boolean;
    public inactive: boolean;
    public pedido_activo?: boolean;
    public pedido: string;
    public productos_seleccionados: IProduct[] | any;
    public status_productos_pendientes: boolean;
    public status_en_conflicto: boolean;
    public viewAll: boolean;
    public checkedAsignClient: boolean;
    public total: number = 0;
    public descripcion_direccion: any;
    public imgRut?: string;    
    public offline?: boolean;
    public ciu_nombre: string;
    public tipoPrueba?: string;
    /* cartera */
    public saldo?: string;
    public plazo_pago?: string;
    public cupo_credito?: string;
    public fecha_ultima_factura?: string;
    public valor_ultima_factura?: string;
    public fecha_ultimo_pago?: string;
    public valor_ultimo_pago?: string;
    public nuevaSucursal?: boolean;
    public tiendas_distribuidores?: any;
    public zona?: number;

    constructor(shopByService: any) {
        Object.assign(this, shopByService);

        if (!shopByService) {
            this.selected = false;
        }
    }

    public selectedShop() {
        this.selected = true;
    }
}
