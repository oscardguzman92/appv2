import {Roles} from '../enums/roles.enum';
import {Shop} from '../models/Shop';

export interface IUser {
    rootPage: string;
    menuComponent: Function | HTMLElement | null | string;
    role: Roles;
    token: string;
    nombre_contacto: string;
    telefono_contacto: string;
    membresia: string;
    cedula: string;
    email: string;
    tipo_usuario: string;
    codigo_cliente_dddedo: boolean;
    user_act: boolean;
    user_id: number;
    corriente_id: number;
    tiendas: Shop[];
    permite_modificar_celular: boolean;
    prueba?: boolean;
    tipologias: any;
    slideRegister?: number;
    mercaderista_id?: any;
    seguroActivo?: any;
    vendedor_id?: number;
    v_id?: number;
}
