import {IUser} from '../interfaces/IUser';
import {Roles} from '../enums/roles.enum';
import {Shop} from './Shop';
import {ICompany} from '../interfaces/ICompany';

export class Shopkeeper implements IUser {
    id: number;
    rootPage: string;
    email: string;
    membresia: string;
    nombre_contacto: string;
    telefono_contacto: string;
    tipo_usuario: string;
    token: string;
    cedula: string;

    imgDocumento?: string;
    imgDocumento2?: string;
    imgSignature?: string;

    menuComponent: Function | HTMLElement | string | null;
    role: Roles;

    codigo_cliente_dddedo: boolean;
    user_act: boolean;

    corriente_id: number;
    user_id: number;

    tiendas: Shop[];

    compania: ICompany;
    permite_modificar_celular: boolean;
    prueba?: boolean;

    tipologias: any;

    constructor(userByService: any) {
        this.rootPage = 'inicio-tendero';
        this.role = Roles.shopkeeper;
        Object.assign(this, userByService);

        if (userByService) {
            this.tiendas = this.assignShops(userByService);
        }
    }

    private assignShops(userByService): Shop[] {
        const shopsReturn = [];

        if (userByService.tiendas) {
            for (const shop of userByService.tiendas) {
               shopsReturn.push(new Shop(shop));
            }
        }

        return shopsReturn;
    }
}
