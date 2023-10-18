import {Component, Input, OnInit} from '@angular/core';
import {ModalController, ToastController, AlertController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {ToggleMenu} from '../../../../compartido/general/store/actions/menu.actions';
import {AppState} from '../../../../compartido/general/store/reducers/menu.reducer';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Storage} from '@ionic/storage';
import {IUser} from '../../../../../interfaces/IUser';
import {Shop} from '../../../../../models/Shop';
import {CompartidoSeleccionTiendaComponent} from '../compartido-seleccion-tienda/compartido-seleccion-tienda.component';
import {LoadingOn, LoadingOff} from '../../../../compartido/general/store/actions/loading.actions';
import {ILogin} from '../../../../../interfaces/ILogin';
import {LoginUserAction, RefreshUserAction} from '../../../../../store/auth/auth.actions';
import {CacheService} from 'ionic-cache';
import {Intercom} from '@ionic-native/intercom/ngx';
import {IMessage} from '../../../../../interfaces/IMessages';
import {NoticationService} from '../../../../../services/pushNotification/notication.service';
import {OneSignalService} from '../../../../../services/oneSignal/one-signal.service';
import {CashRegisterService} from 'src/app/services/orders/cash-register.service';
import {AnalyticsService} from '../../../../../services/analytics/analytics.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { GeneralCarritoComprasComponent } from 'src/app/modules/compartido/general/components/general-carrito-compras/general-carrito-compras.component';

@Component({
    selector: 'app-compartido-menu-tendero',
    templateUrl: './compartido-menu-tendero.component.html',
    styleUrls: ['./compartido-menu-tendero.component.scss'],
})
export class CompartidoMenuTenderoComponent implements OnInit {
    @Input() user: IUser;
    @Input() points: string;
    @Input() balance: string;
    @Input() messageInformation: { count: number, message: IMessage };
    public poinstMenu: boolean;
    exitosos: any = [];
    public ionVersionNumber:any;
    public ionVersionCode:any;

    constructor(
        private modal: ModalController,
        private store: Store<AppState>,
        private navigation: NavigationHelper,
        private storage: Storage,
        private modalController: ModalController,
        private cache: CacheService,
        public alertController: AlertController,
        private intercom: Intercom,
        private toastController: ToastController,
        private cashService: CashRegisterService,
        private oneSignal: OneSignalService,
        private appVersion: AppVersion,
        private analyticsService: AnalyticsService) {
    }

    ngOnInit() {
        this.poinstMenu = (this.user.tiendas.length === 1);
        this.appVersion.getVersionNumber().then(res => {
            console.log(res);
            this.ionVersionNumber = res;
        }).catch(error => {
            console.log(error);
        });
        
        this.appVersion.getVersionCode().then(res => {
              console.log(res);
            this.ionVersionCode = res;
          }).catch(error => {
            console.log(error);
        });
    }


    closeModal() {
        this.store.dispatch(new ToggleMenu());
        return this.modal.dismiss();
    }

    goHome() {
        this.closeModal();
        this.navigation.goToBack('inicio-tendero');
    }

    goFrecuentQuestions() {
        this.closeModal().then(() => {
            this.navigation.goToBack('preguntas-frecuentes');
        });
    }

    goMyOrders() {
        this.closeModal();
        if (this.user.tiendas.length > 1) {
            this.openModalShopSelection(this.user.tiendas);
            return;
        }
        this.navigation.goToBack('mis-pedidos', {shop: <Shop>this.user.tiendas[0]});
    }

    goMyMessages() {
        this.closeModal();
        this.navigation.goToBack('mis-mensajes');
    }

    goCashRegister() {
        this.closeModal();
        this.navigation.goTo('caja-registradora');
    }

    goToEditProfile() {
        this.closeModal();
        this.storage.set('auth-user-update', JSON.stringify(this.user)).then(() => {
            this.navigation.goToBack('registro');
        });
        //this.navigation.goToBack('editarPerfil');
    }

    goMyScore() {
        this.closeModal();
        if (this.poinstMenu) {
            this.navigation.goToBack('puntos', {shop: <Shop>this.user.tiendas[0]});
            return;
        }

        this.openModalShopSelectionPoints(this.user.tiendas);
    }

    goRecordTopUps() {
        this.store.dispatch(new LoadingOn());
        this.closeModal().then(() => {
            this.navigation.goToBack('historial-recargas');
        });
    }

    goTermsConditions() {
        this.closeModal();
        window.open('http://www.storeapp.net/files/storeapp_terminos_condiciones.pdf', '_blank');
    }

    goPrivacyPolicies() {
        this.closeModal();
        window.open('http://www.storeapp.net/files/storeapp_politicas_privacidad.pdf', '_blank');
    }

    async logOut() {
        await this.storage.get('order').then(success => {
            let res = JSON.parse(success);
            console.log(res);
            if (!res || res.length == 0 || !res.some(e => e.status_productos_pendientes)) {
                this.oneSignal.deletePlayerId(this.user.token);
                this.intercom.hideMessenger();
                this.storage.clear().then(res => {
                    this.closeModal();
                    this.navigation.goTo('inicio');
                });
            } else {
                this.presentAlertLogOutOnline();
            }
        });
    }

    async presentAlertLogOutOnline() {
        const alert = await this.alertController.create({
            header: '¿Deseas Cerrar sesión?',
            message: 'Al cerrar sesión se perderán los pedidos pendientes por enviar, ¿Deseas envíar los pedidos?' +
                ' Esto puede tomar unos minutos y requiere el envío de una gran' +
                ' cantidad de información',
            cssClass: 'attention-alert',
            buttons: [
                {
                    text: 'Ir al carrito',
                    cssClass: ['secondary', 'three-button-alert'],
                    handler: () => {
                        this.analyticsService.sendEvent('sec_accede_carrito', { 'event_category': 'sec_accede_carrito_ir_carrito', 'event_label': '' });
                        this.closeModal();
                        this.abrirCarrito();
                    }
                },
                /* {
                    text: 'Enviar y salir',
                    cssClass: ['secondary', 'three-button-alert'],
                    handler: () => {
                        this.storage.get('order').then(res => {
                            this.store.dispatch(new LoadingOff);
                            res = JSON.parse(res);
                            res = res.filter(e => e.status_productos_pendientes);
                            this.sendAllAsyncOrder(res, res.length - 1, exitosos => {
                                if (res.length === exitosos) {
                                    // cerrar chat
                                    this.oneSignal.deletePlayerId(this.user.token);
                                    this.intercom.hideMessenger();
                                    this.storage.clear().then(res => {
                                        this.closeModal();
                                        this.navigation.goTo('inicio');
                                    });
                                } else {
                                    this.presentToastWithOptions('Quedaron pedidos pendientes por enviar.');
                                }
                            });
                        });
                    }
                }, */
                {
                    text: 'Salir y descartar',
                    cssClass: ['secondary', 'three-button-alert'],
                    handler: () => {
                        this.oneSignal.deletePlayerId(this.user.token);
                        this.intercom.hideMessenger();
                        this.storage.clear().then(res => {
                            this.closeModal();
                            this.navigation.goTo('inicio');
                        });
                    }
                }, {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: ['secondary', 'three-button-alert'],
                }
            ]
        });

        await alert.present();
    }

    async abrirCarrito() {
        const modal = await this.modalController.create(<any>{
            component: GeneralCarritoComprasComponent,
            backdropDismiss: false,
            cssClass: 'shopping-cart',
            componentProps: {
                shopData: this.user.tiendas[0],
                edit: true,
                user: this.user
            }
        });

        return await modal.present();
    }

    async refreshData() {
        let userData = null;
        const fech = new Date().getDate();
        await this.storage.get('order').then(success => {
            let res = JSON.parse(success);
            if (!res || res.length == 0 || !res.some(e => e.status_productos_pendientes)) {
                this.closeModal();
                this.store.dispatch(new LoadingOn());
                const dataLogin: ILogin = {
                    login: this.user.telefono_contacto,
                    password: this.user.cedula
                };
                if (this.user.prueba === true) {
                    dataLogin.prueba = true;
                }
                this.cache.clearAll()
                    .then(() => {
                        return this.storage.get('user');
                    })
                    .then(user => {
                        userData = user;
                        return this.storage.clear();
                    })
                    .then(() => {
                        return this.storage.set('user', userData);
                    })
                    .then(() => {
                        return this.storage.set('client_list', 'd_' + fech);
                    }).then(() => {
                        this.store.dispatch(new RefreshUserAction(dataLogin));
                    });
            } else {
                this.presentAlertRefresh();
            }
        });
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
                        this.storage.get('order').then(res => {
                            this.store.dispatch(new LoadingOff);
                            res = JSON.parse(res);
                            res = res.filter(e => e.status_productos_pendientes);
                            let userData = null;
                            const fech = new Date().getDate();
                            this.sendAllAsyncOrder(res, res.length - 1, exitosos => {
                                if (res.length == exitosos) {
                                    // cerrar chat
                                    this.closeModal();
                                    this.store.dispatch(new LoadingOn());
                                    const dataLogin: ILogin = {
                                        login: this.user.telefono_contacto,
                                        password: this.user.cedula
                                    };
                                    if (this.user.prueba === true) {
                                        dataLogin.prueba = true;
                                    }
                                    this.cache.clearAll()
                                        .then(() => {
                                            return this.storage.get('user');
                                        })
                                        .then(user => {
                                            userData = user;
                                            return this.storage.clear();
                                        })
                                        .then(() => {
                                            return this.storage.set('user', userData);
                                        })
                                        .then(() => {
                                            return this.storage.set('client_list', 'd_' + fech);
                                        }).then(() => {
                                            this.store.dispatch(new RefreshUserAction(dataLogin));
                                        });
                                } else {
                                    this.presentToastWithOptions('Quedaron pedidos pendientes por enviar.');
                                }
                            });
                        });
                    }
                }, {
                    text: 'Refrescar sin enviar',
                    cssClass: ['secondary', 'three-button-alert'],
                    handler: () => {
                        let userData = null;
                        let orderData = null;
                        const fech = new Date().getDate();
                        this.closeModal();
                        this.store.dispatch(new LoadingOn());
                        const dataLogin: ILogin = {
                            login: this.user.telefono_contacto,
                            password: this.user.cedula
                        };
                        if (this.user.prueba === true) {
                            dataLogin.prueba = true;
                        }
                        this.cache.clearAll()
                            .then(() => {
                                return this.storage.get('user');
                            })
                            .then(user => {
                                userData = user;
                                return this.storage.get('order');
                            })
                            .then(order => {
                                orderData = order;
                                return this.storage.clear();
                            })
                            .then(() => {
                                return this.storage.set('user', userData);
                            })
                            .then(() => {
                                return this.storage.set('order', orderData);
                            })
                            .then(() => {
                                return this.storage.set('client_list', 'd_' + fech);
                            }).then(() => {
                                this.store.dispatch(new RefreshUserAction(dataLogin));
                            });
                    }
                },
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: ['secondary', 'three-button-alert']
                }
            ]
        });

        await alert.present();
    }

    sendAllAsyncOrder(res, i, cb) {
        if (i >= 0) {
            let e = res[i];
            let products;
            if (e.status_productos_pendientes) {
                let shopData = {
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
                products = Object.values(e.productos_seleccionados);
                this.cashService.setOrder(products, shopData).subscribe(success => {
                    if (success.status == 'ok' && success.code == 0) {
                        const message = 'El pedido #' + success.content.pedido_id + ' ha sido realizado. se enviará al sistema '
                            + success.content.fecha_envio;
                        this.exitosos.push(message);
                        this.cashService.clearSelectedOrder(shopData, null, null, () => {
                        });
                        this.sendAllAsyncOrder(res, i - 1, cb);
                    } else {
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

    private async openModalShopSelection(shops: Shop[], url: string = 'mis-pedidos') {
        const modal = await this.modalController.create(<any>{
            component: CompartidoSeleccionTiendaComponent,
            cssClass: 'filter-modal',
            componentProps: {shops: shops}
        });

        modal.onDidDismiss().then(res => {
            if (!res.data) {
                return;
            }
            this.navigation.goToBack(url, {shop: <Shop>res.data.shop});
        });

        return await modal.present();
    }

    private async openModalShopSelectionPoints(shops: Shop[]) {
        const modal = await this.modalController.create(<any>{
            component: CompartidoSeleccionTiendaComponent,
            cssClass: 'filter-modal',
            componentProps: {shops: shops}
        });

        modal.onDidDismiss().then(res => {
            if (!res.data) {
                return;
            }
            this.navigation.goToBack('puntos', {shop: <Shop>res.data.shop});
        });

        return await modal.present();
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

    async goMyQR() {
        this.closeModal();
        if (this.user.tiendas.length > 1) {
            this.openModalShopSelection(this.user.tiendas, 'mi-codigo');
            return;
        }
        this.navigation.goToBack('mi-codigo', {shop: <Shop>this.user.tiendas[0]});
    }

    async goToPayBill() {
        this.closeModal();
        this.analyticsService.sendEvent('sec_pago_facturas', { 'event_category': 'menu_principal', 'event_label': 'sec_pago_facturas' });
        const alert = await this.alertController.create({
            header: 'Lo sentimos',
            message: 'Próximamente encuentra el pago de facturas en storeapp',
            buttons: ['Aceptar'],
            cssClass: 'info-alert',
        });
        return await alert.present();
    }

    goToHelpTree() {
        this.closeModal();
        this.navigation.goToBack('first-step');
    }
}
