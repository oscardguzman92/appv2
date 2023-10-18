import {IUser} from '../interfaces/IUser';
import {Roles} from '../enums/roles.enum';
import {Shop} from './Shop';

export class Seller implements IUser {
    tipologias: any;
    rootPage: string;
    cedula: string;
    email: string;
    membresia: string;
    nombre_contacto: string;
    telefono_contacto: string;
    sin_archivos_offline: boolean;
    tipo_usuario: string;
    token: string;

    codigo_cliente_dddedo: boolean;
    user_act: boolean;

    corriente_id: number;
    user_id: number;

    menuComponent: Function | HTMLElement | string | null;
    role: Roles;

    tiendas: Shop[];

    compania: {
        id: number,
        nombre: string,
        email: string,
        nombre_contacto: string,
        fecha: string,
        created_at: string,
        updated_at: string,
        valor_minimo_compra: string,
        califica: boolean,
        pivot: {
            grupo_vendedor_id: number,
            compania_id: number
        }
    };

    distribuidor: any;
    permite_modificar_celular: boolean;
    prueba?: boolean;
    transportador?: boolean;
    zonas?: Array<IZona>;
    constructor(userByService) {
        this.rootPage = 'lista-clientes';
        this.role = Roles.seller;

        Object.assign(this, userByService);
    }
}

export interface IZona {
    id: number,
    nombre: string,
    zona: string
}
