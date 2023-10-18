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

@Injectable({
    providedIn: 'root'
})
export class OfflineHelper {

    constructor(private alertController: AlertController, private storage: Storage) {
    }

    public async alertOffline(cancelCallback, aceptedCallback, title, activeCb?) {
        const offlineFileDownloaded = await this.storage.get('offlineFileDownloaded').then(res => res).catch(() => false);
        if (offlineFileDownloaded === true) {
            if (activeCb) {
                activeCb();
            }
            return;
        }
        const alert = await this.alertController.create({
            header: title,
            message: '<p class="ion-margin-bottom" no-margin>' +
                'No has realizado una descarga previa, necesitas información actualizada para acceder al ' +
                '<b>MODO SIN CONEXIÓN</b>.</p><p> <b>Se recomienda estar conectado a una red WiFi<b>.</p>',
            cssClass: 'attention-alert',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        cancelCallback();
                    }
                }, {
                    text: 'Activar',
                    handler: () => {
                        aceptedCallback();
                    }
                }
            ]
        });

        await alert.present();
    }

    public async alertOfflineDynamic(cancelCallback, aceptedCallback, title) {
        const alert = await this.alertController.create({
            header: title,
            message: '<p class="ion-margin-bottom" no-margin>' +
                'Esto permitirá que pueda ser más rápida el APP</p>',
            cssClass: 'attention-alert',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        cancelCallback();
                    }
                }, {
                    text: 'Iniciar día',
                    handler: () => {
                        aceptedCallback();
                    }
                }
            ]
        });

        await alert.present();
    }

    public async alertSinConexion(title) {
        const alert = await this.alertController.create({
            header: title,
            message: '<p class="ion-margin-bottom" no-margin>' +
                'El cambio no está disponible ya que no cuentas con señal de datos ni red WIFI, inténtalo de nuevo cuando recuperes la señal. Recuerda que puedes seguir haciendo uso de la aplicación en modo sin conexión.',
            buttons: [
                {
                    text: 'Aceptar',
                }
            ]
        });
        await alert.present();
    }
}
