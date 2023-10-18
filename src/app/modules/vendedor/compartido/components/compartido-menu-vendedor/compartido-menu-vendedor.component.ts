import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalController, ToastController} from '@ionic/angular';
import {ActionsSubject, Store} from '@ngrx/store';
import {ToggleMenu} from '../../../../compartido/general/store/actions/menu.actions';
import {AppState} from '../../../../compartido/general/store/reducers/menu.reducer';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';

import * as formOfflineActions from '../../../compartido/components/compartido-menu-vendedor/store/actions/offline.actions';
import {OfflineState} from '../../../compartido/components/compartido-menu-vendedor/store/reducers/offline.reducer';
import {OfflineService} from '../../../../../services/offline/offline.service';

import {LoadingController} from '@ionic/angular';
import {EMPTY, Subscription} from 'rxjs';
import {Storage} from '@ionic/storage';

import {AlertController} from '@ionic/angular';
import {CacheService} from 'ionic-cache';
import {ILogin} from '../../../../../interfaces/ILogin';
import {LoadingOn, LoadingOff} from '../../../../compartido/general/store/actions/loading.actions';
import {LoginUserAction, RefreshUserAction} from '../../../../../store/auth/auth.actions';
import {Intercom} from '@ionic-native/intercom/ngx';
import {Seller} from '../../../../../models/Seller';
import {IMessage} from '../../../../../interfaces/IMessages';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {CashRegisterService} from '../../../../../services/orders/cash-register.service';
import { IonContent } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import {Config} from '../../../../../enums/config.enum';
import {OfflineHelper} from '../../../../../helpers/offline/offline.helper';
import {CreateFileOfflineService} from '../../../../../services/offline/create-file-offline.service';
import {Shop} from '../../../../../models/Shop';
import {AnalyticsService} from '../../../../../services/analytics/analytics.service';
import { log } from 'console';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { OrdersService } from '../../../../../services/orders/orders.service';

@Component({
    selector: 'app-compartido-menu-vendedor',
    templateUrl: './compartido-menu-vendedor.component.html',
    styleUrls: ['./compartido-menu-vendedor.component.scss'],
})
export class CompartidoMenuVendedorComponent implements OnInit, OnDestroy {
    @Input() user: Seller;
    @Input() messageInformation: { count: number, message: IMessage };
    @ViewChild(IonContent) content: IonContent;
    token: string;
    pepperoni: boolean;
    offlineModal: boolean;
    connected: boolean;
    public storeSubs = new Subscription();
    public refreshObs = new Subscription();
    offData: any;
    showmodal = true;
    exitosos: any[] = [];
    public syncTimeOffline: string;
    public ionVersionNumber:any;
    public ionVersionCode:any;

    constructor(
        private modal: ModalController,
        private store: Store<AppState>,
        private navigation: NavigationHelper,
        private storage: Store<OfflineState>,
        private offlineService: OfflineService,
        public loadingController: LoadingController,
        private storages: Storage,
        public alertController: AlertController,
        private cache: CacheService,
        private intercom: Intercom,
        private toastController: ToastController,
        private cashService: CashRegisterService,
        private file: File,
        private offlineHelper: OfflineHelper,
        private createFile: CreateFileOfflineService,
        private actionS: ActionsSubject,
        private shopSingletonService:  ShopSingletonService,
        private appVersion: AppVersion,
        private analyticsService: AnalyticsService,
        private orderService: OrdersService,
        ) {
        this.pepperoni = false;
        this.offlineModal = false    
    }
    
    ngOnInit() {
        this.token = this.user.token;
        this.storeSubs = this.store.select('offline').subscribe(state => {
            this.pepperoni = state.active;
        });
        this.storages.get('syncTimeOffline')
            .then(time => {
                this.syncTimeOffline = time;
            });
        this.appVersion.getVersionNumber().then(res => {
            console.log(res);
            this.ionVersionNumber = res;
        }).catch(error => {
            console.log("error de la version");
            console.log(error);
        });
        
        this.appVersion.getVersionCode().then(res => {
              console.log(res);
            this.ionVersionCode = res;
          }).catch(error => {
            console.log(error);
        });
    }

    ScrollToBottom() {
        this.content.scrollToBottom(1500);
    }

    ngOnDestroy() {
        this.storeSubs.unsubscribe();
        this.refreshObs.unsubscribe();
    }

    closeModal() {
        // this.ScrollToBottom();
        this.modal.dismiss();
        this.store.dispatch(new ToggleMenu());
    }

    goHome() {
        this.closeModal();
        this.navigation.goToBack('lista-clientes');
    }

    goHistoryAssignments() {
        this.closeModal();
        this.navigation.goToBack('historial-asiginaciones');
    }

    goSalesReport() {
        this.closeModal();
        this.navigation.goToBack('mis-ventas');
    }

    goFrecuentQuestions() {
        this.closeModal();
        this.navigation.goToBack('preguntas-frecuentes');
    }

    goMyOrders() {
        this.closeModal();
        this.navigation.goToBack('comunidad-tenderos');
    }

    goMyMessages() {
        this.closeModal();
        this.navigation.goToBack('mis-mensajes');
    }

    goMobileCharge() {
        this.closeModal();
        this.navigation.goToBack('recargas');
    }

    goCreateClient() {
        this.closeModal();
        this.navigation.goToBack('crear-cliente');
    }

    goTermsConditions() {
        this.closeModal();
        window.open('http://www.storeapp.net/files/storeapp_terminos_condiciones.pdf', '_blank');
    }

    goPrivacyPolicies() {
        this.closeModal();
        window.open('http://www.storeapp.net/files/storeapp_politicas_privacidad.pdf', '_blank');
    }

    goSurveyFanny() {
        this.closeModal();
        this.navigation.goToBack('encuestas', {
            notValidateResponse: true,
            encuestaFanny: true,
        });
    }

    async refreshData() {
        await this.saveReasonsNotRequestedInDB(true);
    }

    private clearDataRefresh(dataLogin, dataOffline?: any) {
        this.cache.clearAll()
            .then(() => {
                if (dataOffline) {
                    this.cache.saveItem('getDatosSinConexion', dataOffline, 'getDatosSinConexion', 3600);
                }
                this.store.dispatch(new RefreshUserAction(dataLogin));
            }).catch(err => {
                this.store.dispatch(new RefreshUserAction(dataLogin));
            });
    }

    async existOfflineData(cb) {
        let a = false;
        await this.storages.get('order').then(success => {
            a = success;
            return cb(a);
        });
    }

    async existReasonsNotRequestedOffLine() {
        return await this.storages.get('reasonsNotRequested');
    }

    async existOffLineMode() {
        return await this.storages.get('offlineDynamic');
    }

    switchOfflineMode() {
        if (!this.pepperoni) {
            if (this.showmodal) {
                this.presentAlertConfirm();
                this.offlineModal = true;                
            } else {
                this.aceptedOfflineMode();
                this.showmodal = true;
            }
        } else {
            this.connected  =  navigator.onLine;
            if (this.connected) {
                this.saveReasonsNotRequestedInDB(false).then();
                this.existOfflineData(cb => {
                    this.offData = cb;
                    if (cb) {
                        cb = JSON.parse(cb);
                        let m = '';
                        cb.forEach(element => {
                            if (typeof (element.productos_seleccionados) !== 'object') {
                                element.productos_seleccionados = {};
                            }
                            const p = Object.keys(element.productos_seleccionados).length;
                            m = (p > 0) ? m + element.nombre_tienda + ' <br>' : m;
                        });
    
                        if (m !== '') {
                            m = 'Tiene pedidos pendientes que se enviarán ahora. Esto puede tomar unos instantes.';
                            this.presentAlertExitOfflineMode(m);
                        } else {
                            this.pepperoni = false;
                            this.setLocalStorageOfflineState(null);
                            const action = new formOfflineActions.ToggleOfflineAction(false);
                            this.storage.dispatch(action);
                        }
                    } else {
                        this.shopSingletonService.publishShopsRefresh({});
                        this.pepperoni = false;
                        // disparar accion toggle ofline para modificar paginas
                        this.setLocalStorageOfflineState(null);
                        const action = new formOfflineActions.ToggleOfflineAction(false);
                        this.storage.dispatch(action);
                    }
                });
            }else{
                this.pepperoni = false;
                this.sinDatosAlertConfirm();                
            }
        }
    }

    async saveReasonsNotRequestedInDB(isRefresData) {
        await this.existOffLineMode().then(async isOffLine => {
            await this.existReasonsNotRequestedOffLine().then(async storageData => {
                if (storageData && navigator.onLine) {
                    const params: any = {
                        storageData: {data: storageData},
                        token: this.token
                    };

                    this.orderService.setMotivoNoPedidoConArray(params).subscribe(
                        () => {
                            if (isRefresData) {
                                this.refreshDataOld();
                            }
                        },
                        error => {
                            console.log(error);
                        }
                    );
                } else {
                    if (isRefresData) {
                        this.refreshDataOld();
                    }
                }
            });
        });
    }

    refreshDataOld() {
        this.storages.get('order').then(success => {
            let res = JSON.parse(success);
            if (!res || res.length == 0 || !res.some(e => e.status_productos_pendientes)) {
                this.store.dispatch(new LoadingOn());
                this.closeModal();
                const dataLogin: ILogin = {
                    login: this.user.cedula,
                    password: this.user.cedula
                };

                this.storages.get('offlineFileDownloaded')
                    .then(offline => {
                        if (offline !== true) {
                            this.clearDataRefresh(dataLogin);
                            return false;
                        }
                        this.navigation.noPurchase = true;
                        return this.cache.getItem('getDatosSinConexion');
                    }).then((data) => {
                    if (data) {
                        return this.clearDataRefresh(dataLogin, data);
                    }

                    if (data === false) {
                        return;
                    }

                    return this.clearDataRefresh(dataLogin);
                }).catch(err => {
                    return this.clearDataRefresh(dataLogin);
                });

            } else {
                this.presentAlertRefresh();
            }
        });
    }

    syncUp() {
        //this.store.dispatch(new LoadingOn(true));
        this.closeModal();
        this.createFile.invoke(this.user.token);
    }

    // "modal" buttoan action
    async aceptedOfflineMode() {
        this.store.dispatch(new LoadingOn(true));
        this.offlineModal = false;
        this.pepperoni = true;
        //this.offlineService.getOfflineData(this.token)
        const v_id = await this.get_vid();
        this.offlineService.getOfflineDataFromCouchDB(v_id, new Date().getDay(), true)
            .then(success => {
                if (success) {
                    this.offlineService.clearData();
                    //this.storages.set(Config.nombre_archivo_offline, JSON.stringify(success))
                    this.storages.set('jlistoeloffline', "1")
                        .then(_ => {
                            this.activeOffline();
                            this.store.dispatch(new LoadingOff);
                        })
                        .catch(err => {
                            this.cache.saveItem('getDatosSinConexion', success, 'getDatosSinConexion', 3600);
                            this.activeOffline();
                            this.store.dispatch(new LoadingOff);
                        });
                } else {
                    this.offlineModal = true;
                    this.pepperoni = false;
                    this.store.dispatch(new Fail({mensaje: 'El modo sin conexión no descargó bien los datos, contacta el centro de servicio. Puedes seguir digitando con conexión mientras se resuelve'}));
                    this.store.dispatch(new LoadingOff);
                }
            }, error => {
                this.offlineModal = true;
                this.pepperoni = false;
                this.store.dispatch(new Fail({mensaje: 'El modo sin conexión no descargó bien los datos, contacta el centro de servicio. Puedes seguir digitando con conexión mientras se resuelve'}));
                this.store.dispatch(new LoadingOff);
            });
    }

    private async activeOffline() {
        const today = new Date();
        const time = today.getHours() + ':' + (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
        this.storages.remove('offlineDynamic');
        const offlineFileDownloaded = await this.storages.get('offlineFileDownloaded').then(res => res).catch(() => false);
        if (offlineFileDownloaded !== true) {
            this.storages.set('syncTimeOffline', time);
        }
        await this.setLocalStorageOfflineState(true);
        const action = new formOfflineActions.ToggleOfflineAction(true);
        this.storage.dispatch(action);
        //this.closeModal();
        //this.navigation.goToBack('lista-clientes');
    }

    // "modal" buttoan action
    cancelOfflineMode() {
        this.offlineModal = false;
        this.pepperoni = false;
        // disparar accion toggle ofline para modificar paginas
        this.setLocalStorageOfflineState(null);
        const action = new formOfflineActions.ToggleOfflineAction(false);
        this.storage.dispatch(action);
    }

    async presentLoading(message: string) {
        const loading = await this.loadingController.create({
            message: message,
        });
        await loading.present();
        return loading;
    }

    async logOut() {
        if (this.pepperoni) {
            this.existOfflineData(cb => {
                this.offData = cb;
                if (cb) {
                    cb = JSON.parse(cb);
                    let m = '';
                    cb.forEach(element => {
                        if (typeof (element.productos_seleccionados) !== 'object') {
                            element.productos_seleccionados = {};
                        }
                        const p = Object.keys(element.productos_seleccionados).length;
                        m = (p > 0) ? m + element.nombre_tienda + ' <br>' : m;
                    });

                    if (m !== '') {
                        m = 'Al cerrar sesión el se perderán los pedidos pendientes por enviar, ¿Deseas envíar los pedidos?' +
                            ' Esto puede tomar unos minutos y requiere el envío de una gran' +
                            ' cantidad de información';
                        this.presentAlertLogout(m);
                    } else {
                        const action = new formOfflineActions.ToggleOfflineAction(false);
                        this.storage.dispatch(action);
                        this.intercom.hideMessenger();
                        this.storages.clear().then(res => {
                            this.closeModal();
                            this.navigation.goTo('inicio');
                        });
                    }
                } else {
                    const action = new formOfflineActions.ToggleOfflineAction(false);
                    this.storage.dispatch(action);
                    this.intercom.hideMessenger();
                    this.storages.clear().then(async (res: any) => {
                        this.closeModal();
                        this.navigation.goTo('inicio');
                    });
                }
            });

            return;
        }

        await this.storages.get('order').then(async success => {
            let res = JSON.parse(success);
            if (!res || res.length == 0 || !res.some(e => e.status_productos_pendientes)) {
                this.intercom.hideMessenger();
                this.storages.clear().then(res => {
                    this.closeModal();
                    this.navigation.goTo('inicio');
                });
            } else {
                this.presentAlertLogOutOnline();
            }
        });
    }

    async presentAlertConfirm() {
        this.offlineHelper.alertOffline(() => {
            this.cancelOfflineMode();
        }, () => {
            this.aceptedOfflineMode();
        }, 'Activar modo sin conexión', () => {
            this.activeOffline();
        });
    }

    async sinDatosAlertConfirm() {
        this.offlineHelper.alertSinConexion('Cambio a modo con conexión no disponible');
    }

    async presentAlertExitOfflineMode(m) {
        const alert = await this.alertController.create({
            header: '¿Desea salir del modo sin conexíon?',
            message: m,
            cssClass: 'attention-alert exit-offline',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                        this.showmodal = false;
                        this.pepperoni = true;
                    }
                }, {
                    text: 'Enviar pedidos y salir de sin conexión',
                    handler: () => {
                        this.cashService.sendAllOrders(false, () => {
                            setTimeout(() => {
                                this.storages.get('order').then(res => {
                                    res = JSON.parse(res);
                                    let index_prod_pendientes = res.findIndex(item => item.status_productos_pendientes);
                                    if (index_prod_pendientes ===  -1 || res.length ===  0) {
                                        this.pepperoni = false;
                                        this.setLocalStorageOfflineState(null).then(() => {
                                            const action = new formOfflineActions.ToggleOfflineAction(false);
                                            this.storage.dispatch(action);
                                            return this.storages.remove('order');
                                        }).then(() => {
                                            this.shopSingletonService.publishShopsRefresh({});
                                            this.closeModal();
                                        });
                                    } else {
                                        this.shopSingletonService.publishShopsRefresh({});
                                        this.showmodal = false;
                                        this.pepperoni = true;
                                        this.store.dispatch(new LoadingOff);
                                        this.closeModal();
                                    }
                                });
                                this.store.dispatch(new LoadingOff());
                            }, 100);
                        }, this.user.token);
                    }
                }
            ]
        });

        await alert.present();
    }

    //nueva
    async presentAlertLogOutOnline() {
        const alert = await this.alertController.create({
            header: '¿Deseas Cerrar sesión?',
            message: 'Al cerrar sesión se perderán los pedidos pendientes por enviar, ¿Deseas envíar los pedidos?' +
                ' Esto puede tomar unos minutos y requiere el envío de una gran' +
                ' cantidad de información',
            cssClass: 'attention-alert',
            buttons: [
                {
                    text: 'Enviar y salir',
                    cssClass: ['secondary', 'three-button-alert'],
                    handler: () => {
                        this.cashService.getCoords(cb => {
                            if (cb) {
                                this.storages.get('order').then(res => {
                                    this.store.dispatch(new LoadingOff);
                                    res = JSON.parse(res);
                                    res = res.filter(e => e.status_productos_pendientes);
                                    this.sendAllAsyncOrder(res, res.length - 1, exitosos => {
                                        if (res.length === exitosos) {
                                            // cerrar chat
                                            this.intercom.hideMessenger();
                                            this.storages.clear().then(res => {
                                                this.closeModal();
                                                this.navigation.goTo('inicio');
                                            });
                                        } else {
                                            this.shopSingletonService.publishShopsRefresh({});
                                            this.presentToastWithOptions('Quedaron pedidos pendientes por enviar.');
                                            this.closeModal();
                                        }
                                    });
                                });
                            }
                        });
                    }
                }, {
                    text: 'Salir y descartar',
                    cssClass: ['secondary', 'three-button-alert'],
                    handler: () => {
                        this.intercom.hideMessenger();
                        this.storages.clear().then(async res => {
                            this.closeModal();
                            this.navigation.goTo('inicio');
                        });
                    }
                }, {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: ['secondary', 'three-button-alert'],
                    handler: (blah) => {
                        console.log('cierra alert');
                    }
                }
            ]
        });

        await alert.present();
    }

    async presentAlertRefresh() {
        const alert = await this.alertController.create({
            header: '¿Deseas refrescar información?',
            message: 'Antes de salir debes enviar tus pedidos para no perderlos, ¿Deseas envíar los pedidos?' +
            'Recomendamos hacerlo en una red wifi para mayor velocidad',
            cssClass: 'attention-alert',
            buttons: [
                {
                    text: 'Enviar y refrescar',
                    cssClass: ['secondary', 'three-button-alert'],
                    handler: () => {
                        this.cashService.getCoords(cb => {
                            if (cb) {
                                this.storages.get('order').then(res => {
                                    this.store.dispatch(new LoadingOn());
                                    res = JSON.parse(res);
                                    res = res.filter(e => e.status_productos_pendientes);
                                    this.sendAllAsyncOrder(res, res.length - 1, exitosos => {
                                        this.store.dispatch(new LoadingOff());
                                        if (res.length == exitosos) {
                                            // cerrar chat
                                            this.closeModal();
                                            this.store.dispatch(new LoadingOn());
                                            const dataLogin: ILogin = {
                                                login: this.user.cedula,
                                                password: this.user.cedula
                                            };
                                            if (this.user.prueba === true) {
                                                dataLogin.prueba = true;
                                            }
                                            this.cache.clearAll()
                                                .then(() => {
                                                    this.store.dispatch(new RefreshUserAction(dataLogin));
                                                });

                                        } else {
                                            this.presentToastWithOptions('Quedaron pedidos pendientes por enviar.');
                                            this.shopSingletonService.publishShopsRefresh({});
                                            this.closeModal();
                                        }
                                    });
                                });
                            }
                        });
                    }
                }, {
                    text: 'Refrescar sin enviar',
                    cssClass: ['secondary', 'three-button-alert'],
                    handler: () => {
                        this.closeModal();
                        this.store.dispatch(new LoadingOn());
                        const dataLogin: ILogin = {
                            login: this.user.cedula,
                            password: this.user.cedula
                        };
                        if (this.user.prueba === true) {
                            dataLogin.prueba = true;
                        }
                        this.cache.clearAll()
                            .then(() => {
                                this.store.dispatch(new RefreshUserAction(dataLogin, true));
                            });
                    }
                },
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: ['secondary', 'three-button-alert'],
                }
            ]
        });

        await alert.present();
    }


    async sendAllAsyncOrder(res, i, cb) {
        if (i >= 0) {
            let e = res[i];
            let products;
            if (e.status_productos_pendientes) {
                const shopData = {
                    activo: e.activo,
                    barrio: e.barrio,
                    cedula_distribuidor: e.cedula_distribuidor,
                    ciudad_id: e.ciudad_id,
                    codigo_cliente: e.codigo_cliente,
                    dia: e.dia,
                    direccion: e.direccion,
                    distribuidor_id: e.distribuidor_id,
                    id: e.id,
                    latitud: e.latitud,
                    longitud: e.longitud,
                    no_pedido: e.no_pedido,
                    nombre_contacto: e.nombre_contacto,
                    nombre_tienda: e.nombre_tienda,
                    orden: e.orden,
                    pedido: e.pedido,
                    status_productos_pendientes: e.status_productos_pendientes,
                    telefono_contacto: e.telefono_contacto,
                };

                let offline = false;
                if (e.offline === true) {
                    await this.cache.getItem('offlineDynamic')
                        .then((res) => {
                            offline = true;
                        }).catch(() => {
                            offline = false;
                        });
                }

                products = Object.values(e.productos_seleccionados);
                this.cashService.setOrder(products, shopData, false, offline, this.user.token).subscribe(success => {
                    if (success.status == 'ok' && success.code == 0) {
                        const message = 'El pedido #' + success.content.pedido_id + ' ha sido realizado. se enviará al sistema '
                            + success.content.fecha_envio;
                        this.exitosos.push(message);
                        this.cashService.clearSelectedOrder(shopData, null, null, () => {
                        });
                        this.sendAllAsyncOrder(res, i - 1, cb);
                    } else if (success.code === 30) { // En conflicto
                        this.cashService.setConflicto(shopData);
                        this.sendAllAsyncOrder(res, i - 1, cb);
                    } else {
                        if (!success.content) {
                            return;
                        }
                        this.presentToastWithOptions(success.content.error);
                        this.sendAllAsyncOrder(res, i - 1, cb);
                    }
                    if (i == 0) {
                        this.presentToastWithOptions('Se enviaron ' + this.exitosos.length + ' correctamente.');
                        this.store.dispatch(new LoadingOff);
                        if (cb) {
                            return cb(this.exitosos.length);
                        }
                    }
                }, error => {
                    if (i == 0) {
                        this.presentToastWithOptions('Se enviaron ' + this.exitosos.length + ' correctamente.');
                        this.store.dispatch(new LoadingOff);
                    }
                    this.presentToastWithOptions(JSON.stringify(error));
                    this.sendAllAsyncOrder(res, i - 1, cb);
                });
            } else {
                this.sendAllAsyncOrder(res, i - 1, cb);
            }
        }
    }

    async presentToastWithOptions(message: string) {
        const toast = await this.toastController.create({
            message: message,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            duration: 3000
        });
        toast.present();
    }

    openChat() {
        this.intercom.displayMessenger();
        this.closeModal();
    }

    handleSwipe(ev) {
        this.closeModal();
    }

    openMessage(message) {
        this.closeModal();
        this.navigation.goToBack('mis-mensajes', {message: message});
    }

    goSurveys() {
        this.analyticsService.sendEvent('sec_concursos', {
            'event_category': 'seccion_menu_lateral', 'event_label': 'concursos_' + this.user.role
        });
        this.navigation.goToBack('encuestas');
        this.closeModal();
    }

    setLocalStorageOfflineState(state) {
        return this.storages.get('offlineFileDownloaded')
            .then(res => {
                if (state) {
                    return this.storages.set('withoutConnection', state);
                } else {
                    return this.storages.remove('withoutConnection')
                        .then(() => {
                            if (res === true) {
                                return;
                            }
                            return this.storages.remove('getDatosSinConexion');
                        });
                }
            });

    }

    async presentAlertLogout(m) {
        const alert = await this.alertController.create({
            header: '¿Desea cerrar sesión?',
            message: m,
            cssClass: 'attention-alert',
            buttons: [
                {
                    text: 'Salir',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        const action = new formOfflineActions.ToggleOfflineAction(false);
                        this.storage.dispatch(action);
                        this.intercom.hideMessenger();
                        this.storages.clear().then(res => {
                            this.closeModal();
                            this.navigation.goTo('inicio');
                        });
                    }
                }, {
                    text: 'Envíar pedidos',
                    handler: () => {
                        this.cashService.sendAllOrders(false, () => {
                            this.storages.get('order').then(res => {
                                this.store.dispatch(new LoadingOff);
                                res = JSON.parse(res);
                                if (res.length === 0) {
                                    this.pepperoni = false;
                                    this.setLocalStorageOfflineState(null).then(() => {
                                        const action = new formOfflineActions.ToggleOfflineAction(false);
                                        this.storage.dispatch(action);
                                        return this.storages.remove('order');
                                    }).then(() => {
                                        this.intercom.hideMessenger();
                                        this.storages.clear().then(() => {
                                            this.closeModal();
                                            this.navigation.goTo('inicio');
                                        });
                                    });
                                }
                            });
                        }, this.user.token);
                    }
                }
            ]
        });

        await alert.present();
    }

    goToHelpTree() {
        this.closeModal();
        this.navigation.goToBack('first-step');
    }

    get_vid(){
        return this.storages.get("user")
            .then(res => {
                return JSON.parse(res).v_id
            }).catch(err => {
                return this.storages.get('getDatosSinConexion');
            });
    }
}
