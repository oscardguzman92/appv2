import {Injectable} from '@angular/core';
import {Intercom} from '@ionic-native/intercom/ngx';
import {IUser} from '../../interfaces/IUser';
import {Seller} from '../../models/Seller';
import {Roles} from '../../enums/roles.enum';

@Injectable({
    providedIn: 'root'
})
export class IntercomService {

    constructor(private intercom: Intercom) {
    }

    registerUser(user: IUser) {
        if (user.role == Roles.seller) {
            this.registerSeller(user as Seller);
            return;
        }

        if (user.role == Roles.shopkeeper) {
            this.registerShopkeeper(user);
            return;
        }
    }

    registerUnidentifiedUserApp() {
        try {
            this.intercom.registerUnidentifiedUser({});
        } catch (e) {
            console.log('Error registrando usuario');
        }
    }

    private registerSeller(dataUser: Seller) {
        try {
            this.intercom.registerIdentifiedUser({userId: dataUser.user_id});
            this.intercom.updateUser({
                name: dataUser.nombre_contacto,
                custom_attributes: {
                    'Tipo de Usuario' : 'Vendedor',
                    'Cedula': dataUser.cedula,
                    'Compania': (dataUser.compania) ? dataUser.compania.nombre : '',
                    'Distribuidor': (dataUser.distribuidor) ? dataUser.distribuidor.nombre : ''
                }
            });
        } catch (e) {
            console.log('Error registrando usuario');
        }
    }

    private registerShopkeeper(dataUser: IUser) {
        try {
            this.intercom.registerIdentifiedUser({userId: dataUser.user_id});
            this.intercom.updateUser({
                name: dataUser.nombre_contacto,
                custom_attributes: {
                    'Tipo de usuario' : 'Tendero',
                    'Cedula': dataUser.cedula,
                    'Direccion': (dataUser.tiendas && dataUser.tiendas.length > 0) ? dataUser.tiendas[0].direccion : '',
                    'Telefono de contacto': dataUser.telefono_contacto
                }
            });
        } catch (e) {
            console.log('Error registrando usuario');
        }
    }
}
