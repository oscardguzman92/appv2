import {Injectable} from '@angular/core';
import {Shop} from '../../models/Shop';
import {GetOrderAction, SetOrderShopAction} from '../../modules/compartido/pedidos/store/orders.actions';
import {Order} from '../../models/Order';
import {
    CompartidoSeleccionTiendaComponent
} from '../../modules/tendero/compartido/components/compartido-seleccion-tienda/compartido-seleccion-tienda.component';
import {AppState} from '../../store/app.reducer';
import {Store} from '@ngrx/store';
import {AlertController, ModalController} from '@ionic/angular';
import {ModalOptions} from '@ionic/core';
import {NavigationHelper} from '../navigation/navigation.helper';
import {Storage} from '@ionic/storage';
import {IUser} from '../../interfaces/IUser';
import {
    RegistroCapturaUbicacionComponent
} from '../../modules/tendero/registro/pages/registro/components/registro-captura-ubicacion/registro-captura-ubicacion.component';
import {IProduct} from 'src/app/interfaces/IProduct';
import {Device} from '@ionic-native/device/ngx';
import {OpenNativeSettings} from '@ionic-native/open-native-settings/ngx';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';

@Injectable({
    providedIn: 'root'
})
export class GeolocationHelper {

    constructor(
        private device: Device,
        private nativeSettings: OpenNativeSettings,
        private diagnostic: Diagnostic,
        public alertController: AlertController,
        private modalController: ModalController) {}

    public async showErrorLocation(error, dismissModal?: boolean) {
        console.log(error);
        let statusError = false;
        if (this.device.platform === 'Android' || this.device.platform === 'IOs') {
            await this.diagnostic.isLocationEnabled().then((res) => {
                if (res === false) {
                    this.presentError('Tienes que activar la ubicación de tu celular. Err. ' + error.code, () => {
                        if (dismissModal) {
                            this.modalController.dismiss({
                                'finishProcess': false
                            });
                        }
                        this.nativeSettings.open('location');
                    });
                    statusError = true;
                }
            }).catch((e) => {
                this.presentError(
                    'Error obteniendo la ubicación, verifica que tengas activa la ubicación de tu celular. Err. ' + error.code,
                    () => {
                        if (dismissModal) {
                            this.modalController.dismiss({
                                'finishProcess': false
                            });
                        }
                        statusError = true;
                        this.nativeSettings.open('location');
                    }
                );
            });
        }
        if (!statusError) {
            const message = (error.code === 3) ?
                'Error obteniendo la ubicación, verifica que tengas activa la ubicación de tu celular. Err.' :
                'Tienes que permitir la ubicación a storeapp. Err. ';

            this.presentError(message + error.code, () => {
                if (dismissModal) {
                    this.modalController.dismiss({
                        'finishProcess': false
                    });
                }
                this.nativeSettings.open('location');
            });
        }
        return;
    }

    private async presentError(err, handle) {
        const alert = await this.alertController.create({
            header: 'Atención',
            message: err,
            buttons: [{
                text: 'Aceptar',
                handler: handle
            }],
            cssClass: 'attention-alert',
        });

        await alert.present();
    }
}
