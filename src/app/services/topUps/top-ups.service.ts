import {Injectable} from '@angular/core';
import {IUser} from '../../interfaces/IUser';
import {
    RecargasCrearContrasenaComponent
} from '../../modules/tendero/recargas/pages/recargas/components/recargas-crear-contrasena/recargas-crear-contrasena.component';
import {ModalController} from '@ionic/angular';
import {ModalOptions} from '@ionic/core';
import {CacheService} from 'ionic-cache';
import {RecargasValidarContrasenaComponent} from '../../modules/tendero/recargas/pages/recargas/components/recargas-validar-contrasena/recargas-validar-contrasena.component';
import {IProductService} from '../../interfaces/IProductService';

@Injectable({
    providedIn: 'root'
})
export class TopUpsService {

    constructor(private modalController: ModalController, private cache: CacheService) {
    }

    async validatePass (user: IUser, packages: IProductService[], packageselected: IProductService) {
        if (!user.user_act) {
            return this.createPassword(user, packages, packageselected);
            return false;
        }

        await this.cache.clearExpired();
        return this.cache.getItem('pass_act')
            .then((pass) => {
                if (!pass) {
                    this.mostrarModal(user, packages, packageselected);
                    return false;
                }

                return true;
            })
            .catch(err => {
                this.cache.saveItem('pass_act', '', 'pass_act', 1800);
                this.mostrarModal(user, packages, packageselected);
                return false;
            });
    }

    private async createPassword(user: IUser, packages, packageselected) {
        const modal = await this.modalController.create(<ModalOptions>{
            component: RecargasCrearContrasenaComponent,
            componentProps: {
                user: user,
                packages: packages,
                packageselected: packageselected
            }
        });

        return await modal.present();
    }

    async mostrarModal(user, packages, packageselected) {
        const modal = await this.modalController.create(<ModalOptions>{
            component: RecargasValidarContrasenaComponent,
            componentProps: {
                user: user,
                packages: packages,
                packageselected: packageselected
            }
        });

        return await modal.present();
    }

}
