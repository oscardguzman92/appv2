import {Injectable} from '@angular/core';
import {GetProductosOfflineService} from './get-productos-offline.service';
import {File} from '@ionic-native/file/ngx';
import {Config} from '../../enums/config.enum';
import {LoadingOff} from '../../modules/compartido/general/store/actions/loading.actions';
import {Fail} from '../../modules/compartido/general/store/actions/error.actions';
import {OfflineService} from './offline.service';
import {AppState} from '../../store/app.reducer';
import {Store} from '@ngrx/store';
import {CacheService} from 'ionic-cache';
import {Storage} from '@ionic/storage';
import {AlertController, ToastController} from '@ionic/angular';
import {HttpEventType, HttpResponse} from '@angular/common/http';
import {SetPercentageAction} from '../../store/auth/auth.actions';
import {UtilitiesHelper} from '../../helpers/utilities/utilities.helper';
import {Intercom} from '@ionic-native/intercom/ngx';

@Injectable({
    providedIn: 'root'
})
export class CreateFileOfflineService {
    private intentos = 0;

    constructor(
        private getProductosOffline: GetProductosOfflineService,
        private file: File,
        private offlineService: OfflineService,
        private store: Store<AppState>,
        private cache: CacheService,
        private storage: Storage,
        private toastController: ToastController,
        private intercom: Intercom,
        private alertController: AlertController) {}

    async invoke(token) {
        this.store.dispatch(new SetPercentageAction(0));
        this.intentos++;
        //this.offlineService.getOfflineData(token)
        const v_id = await this.get_vid();
        this.offlineService.getOfflineDataFromCouchDB(v_id,new Date().getDay())
            .then(event => {
                if (event.type === HttpEventType.DownloadProgress) {
                    const percentDone = Math.round(100 * event.loaded / event.total);
                    this.store.dispatch(new SetPercentageAction(percentDone));
                    return;
                }

                if (event.type === HttpEventType.ResponseHeader || event.type === HttpEventType.Sent) {
                    return;
                }

                //const success = event.body;
                const success = event;
                this.store.dispatch(new SetPercentageAction(100));
                /* let dataEncuestas: any = {
                    encuestas: success.encuestas,
                    departamentos: success.departamentos,
                    ciudades: success.ciudades,
                }
                delete success.encuestas;
                delete success.departamentos;
                delete success.ciudades;
                this.storage.set(Config.nombre_archivo_encuestas_offline, dataEncuestas) */
                if (success) {
                    if (success.code === 1) {
                        //this.cache.saveItem('getDatosSinConexion', success, 'getDatosSinConexion', 3600);
                        this.storage.set('offlineFileDownloaded', true);
                        this.showToast('No hay datos para sincronizar');
                        this.store.dispatch(new SetPercentageAction(-1));
                        this.intentos = 0;
                        
                        return;
                    }
                    if (!success.tiendas || (success.tiendas && Object.keys(success.tiendas).length == 0)) {
                        this.alertOfflineTry(
                            'No se han descargado correctamente los datos',
                            () => {
                                this.invoke(token);
                            },
                            this.intentos
                        );

                        this.store.dispatch(new SetPercentageAction(-1));

                        return;
                    }
                    //this.storage.set(Config.nombre_archivo_offline, JSON.stringify(success)).then(() => {
                    this.storage.set("offlinelisto", true).then(() => {
                        return this.storage.set('offlineFileDownloaded', true);
                    }).then(() => {
                        const today = new Date();
                        const time = today.getHours() + ':' + (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();

                        return this.storage.set('syncTimeOffline', time);
                    }).then(_ => {
                        this.showToast('Se han sincronizado los datos con exito');
                        this.intentos = 0;
                        setTimeout(() => {
                            this.store.dispatch(new SetPercentageAction(-1));
                        }, 400);
                    }).catch((err) => {
                        this.intentos = 0;
                        const today = new Date();
                        const time = today.getHours() + ':' + (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
                        this.storage.set('syncTimeOffline', time);
                        //this.cache.saveItem('getDatosSinConexion', success, 'getDatosSinConexion', 3600);
                        this.storage.set('offlineFileDownloaded', true);
                        this.showToast('Se han sincronizado los datos con exito');
                        this.store.dispatch(new SetPercentageAction(-1));
                    });
                    return;
                } else {
                    this.alertOfflineTry(
                        'No se han descargado correctamente los datos',
                        () => {
                            this.invoke(token);
                        },
                        this.intentos
                    );

                    this.store.dispatch(new SetPercentageAction(-1));

                    return;
                }

            }, error => {
                this.store.dispatch(new Fail({
                    mensaje: 'El modo sin conexión no descargó bien los datos, contacta el centro de servicio. Puedes seguir digitando con conexión mientras se resuelve'
                }));
                this.intentos = 0;
                this.store.dispatch(new SetPercentageAction(-1));
            });
    }

    private async showToast(message) {
        const toast = await this.toastController.create({
            message: message,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            duration: 3000
        });
        toast.present();
    }

    public async alertOfflineTry(message, handle, intentos) {
        const buttonsArray: any[] = [];
        buttonsArray.push({
            text: 'Intentar de nuevo',
            cssClass: ['secondary', 'three-button-alert'],
            handler: handle
        });

        if (intentos > 1) {
            buttonsArray.push({
                text: 'Soporte',
                cssClass: ['secondary', 'three-button-alert'],
                handler: () => {
                    this.intercom.displayMessenger();
                }
            });
        }
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            cssClass: 'attention-alert column-buttons',
            buttons: buttonsArray
        });

        return alert.present();
    }

    get_vid(){
        return this.storage.get("user")
            .then(res => {
                return JSON.parse(res).v_id
            }).catch(err => {
                return this.storage.get('getDatosSinConexion');
            });
    }

}
