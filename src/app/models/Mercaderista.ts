import {IUser} from '../interfaces/IUser';
import {Roles} from '../enums/roles.enum';
import {Shop} from './Shop';
import {ICompany} from '../interfaces/ICompany';

export class Mercaderista implements IUser {
    nombre_contacto: string;
    telefono_contacto: string;
    membresia: string;
    email: string;
    id: number;
    distribuidor_id: number;
    mercaderista_id: number;
    rootPage: string;
    nombre: string;
    cedula: string;
    tipo_usuario: string;
    token: string;

    menuComponent: Function | HTMLElement | string | null;
    role: Roles;

    codigo_cliente_dddedo: boolean;
    user_act: boolean;

    corriente_id: number;
    user_id: number;

    tiendas: Shop[];

    compania: ICompany;
    permite_modificar_celular: boolean;
    tipologias: any;
    clientes_total_hoy: number;
    clientes_atendidos_hoy: number;

    constructor(userByService: any) {
        this.rootPage = 'clientes-mercaderista';
        this.role = Roles.mercaderista;
        this.clientes_atendidos_hoy = 0;
        this.clientes_total_hoy = 0;
        Object.assign(this, userByService);
    }

}
