import {Component, Input, OnInit} from '@angular/core';
import {IUser} from '../../../../../../../interfaces/IUser';
import {ModalController, AlertController} from '@ionic/angular';
import {AppState} from '../../../../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {LoadingOff, LoadingOn} from '../../../../../../compartido/general/store/actions/loading.actions';
import {Storage} from '@ionic/storage';
import {NavigationHelper} from '../../../../../../../helpers/navigation/navigation.helper';
import {UserBuilder} from '../../../../../../../builders/user.builder';
import {AfterLoginMenu} from '../../../../../../compartido/general/store/actions/menu.actions';
import { SetShopAction, SetUserAction } from '../../../../store/registro.actions';
import {IntercomService} from '../../../../../../../services/intercom/intercom.service';

@Component({
    selector: 'app-registro-resumen-captura-datos',
    templateUrl: './registro-resumen-captura-datos.component.html',
    styleUrls: ['./registro-resumen-captura-datos.component.scss'],
})
export class RegistroResumenCapturaDatosComponent implements OnInit {
    @Input() user: IUser;
    @Input() departament: string;
    @Input() city: string;
    @Input() typesShops: any[];

    public editable: number;
    getTipologiaName: any;

    constructor(
        private modalController: ModalController,
        private store: Store<AppState>,
        private storage: Storage,
        private alertController: AlertController,
        private navigation: NavigationHelper,
        private intercomService: IntercomService) {
        this.editable = -1;
    }

    ngOnInit() {
        this.store.dispatch(new LoadingOff());
        this.changeTypeShop();
    }

    goToEditableItem(item: number) {
        this.editable = item;
    }

    goToMap() {
        this.store.dispatch(new LoadingOn());
        this.modalController.dismiss({
            map: true,
            step: undefined
        });
    }


    finallyRegister() {
        this.storage.remove('from-register')
            .then(() => {
                //console.log("entro a verificar si fue nuvo registro exitoso");
                this.storage.get("isNewRegistration").then(re => {
                    //console.log("leyendo storarge para ver si hay o no nuevo registor");
                    if(re != null){
                        //console.log("hay nuevo registro en storage")
                        this.getPointsByRegistration(re);
                    }
                });
            })
            .then(() => {
                return this.storage.set('user', JSON.stringify(new UserBuilder(this.user).getUser()));
            })
            .then(() => {
                return this.storage.remove('auth-register');
            })
            .then(() => {
                return this.storage.remove('auth-step');
            })
            .then(() => {
                return this.storage.remove('auth-user-update');
            })
            .then(() => {
                this.intercomService.registerUser(this.user);
                this.store.dispatch(new SetUserAction(this.user, true));
            })
            .then(() => {
                this.store.dispatch(new LoadingOn());
                this.store.dispatch(new SetShopAction(this.user.token, this.user.tiendas[0]));
            })
            .then(() => {
                this.store.dispatch(new AfterLoginMenu());
                this.navigation.goTo('inicio-tendero');

                this.modalController.dismiss({
                    'finishProcess': true
                });
            });
    }

    changeTypeShop(){
        const tipologia = this.typesShops.filter((typeShop) => {
            return typeShop.id === Number(this.user.tiendas[0].tienda_tipologia_id);
        });
        if (tipologia.length > 0) {
            this.getTipologiaName = tipologia[0].nombre;
        }
    }

    get validateFinish() {
        return this.user.nombre_contacto &&
            this.user.tiendas[0].nombre &&
            this.user.membresia &&
            this.user.telefono_contacto &&
            this.user.tiendas[0].estrato &&
            this.user.tiendas[0].tienda_tipologia_id;
    }

    getPointsByRegistration(re){

        //console.log("disparar servicio");
        //console.log("usaario que se va a usar para el servicio ");
            this.alertPointsResgitration(re);
        this.storage.remove('isNewRegistration');
        return true;
    }

    private async alertPointsResgitration(re) {
        const alert = await this.alertController.create({
            //header: 'Ganar es muy fácil',
            // message: '¡Acumula puntos por cada pedido que realices! <br><br>Tendrás la oportunidad de ganar muchos más puntos aprovechando las dinámicas de tus proveedores. <br><br>¡Revisa siempre las comunicaciones y aprovecha las actividades que te dan puntos y promociones!',
            header: '¡Bienvendido a storeapp!',
            message: 'La aplicación que lleva a tu negocio a otro nivel, GANASTE '+re+' PUNTOS.',
            buttons: ['Aceptar'],
            cssClass: 'info-alert',
        });
        return await alert.present();
    }

}
