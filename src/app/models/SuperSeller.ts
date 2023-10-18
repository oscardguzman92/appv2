import {IUser} from '../interfaces/IUser';
import {Roles} from '../enums/roles.enum';
import {Shop} from './Shop';
import {ICompany} from '../interfaces/ICompany';

export class SuperSeller implements IUser {
    nombre_contacto: string;
    telefono_contacto: string;
    membresia: string;
    email: string;
    id: number;
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
    tipologias:any;

    constructor(userByService: any) {
        this.rootPage = 'inicio-super-vendedor';
        this.role = Roles.superSeller;
        Object.assign(this, userByService);
    }

}
