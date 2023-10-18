import {IUser} from '../interfaces/IUser';
import {Roles} from '../enums/roles.enum';
import {Shop} from './Shop';
import {ICompany} from '../interfaces/ICompany';
import {IOrder} from '../services/orders/orders.service';
import {IRoute} from '../interfaces/IRoute';

export class Transportador implements IUser {
    nombre_contacto: string;
    telefono_contacto: string;
    membresia: string;
    email: string;
    id: number;
    transportador_id: number;
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
    rutas: IRoute[];

    constructor(userByService: any) {
        this.rootPage = 'lista-clientes-transportador';
        this.role = Roles.transportador;
        Object.assign(this, userByService);
    }

}
