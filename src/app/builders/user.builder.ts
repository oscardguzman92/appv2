import {IUser} from '../interfaces/IUser';
import {Roles} from '../enums/roles.enum';
import {Seller} from '../models/Seller';
import {Shopkeeper} from '../models/Shopkeeper';
import {Menu} from '../models/Menu';
import { Mercaderista } from '../models/Mercaderista';
import { SuperSeller } from '../models/SuperSeller';
import {Transportador} from '../models/Transportador';

export class UserBuilder {
    private user: IUser;

    constructor(userByService: any) {
        this.user = this.buildByRole(userByService.tipo_usuario, userByService);
    }

    getUser() {
        return this.user;
    }

    private buildByRole(role: string, userByService: any): IUser {
        switch (role) {
            case <string>Roles.seller:
                const seller = new Seller(userByService);
                seller.menuComponent = Menu.menuVendedor();
                return seller;

            case <string>Roles.shopkeeper:
                const shopKeeper = new Shopkeeper(userByService);
                shopKeeper.menuComponent = Menu.menuTendero();
                return shopKeeper;
            case <string>Roles.mercaderista:
                const mercaderista = new Mercaderista(userByService);
                mercaderista.menuComponent = Menu.menuMercaderista();
                return mercaderista;
            case <string>Roles.transportador:
                const transportador = new Transportador(userByService);
                transportador.menuComponent = Menu.menuTransportador();
                return transportador;
            case <string>Roles.superSeller:
                const superSeller = new SuperSeller(userByService);
                superSeller.menuComponent = Menu.menuSuperVendedor();
                return superSeller;

            default:
                return null;
        }
    }
}
