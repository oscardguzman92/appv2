import {Injectable} from '@angular/core';
import {OneSignal, OSNotificationOpenedResult} from '@ionic-native/onesignal/ngx';
import {AlertController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {NavigationHelper} from '../../helpers/navigation/navigation.helper';
import {Device} from '@ionic-native/device/ngx';
import {ApiService} from '../api/api.service';
import {UtilitiesHelper} from '../../helpers/utilities/utilities.helper';
import {json} from '@angular-devkit/core';
import {AnalyticsService} from 'src/app/services/analytics/analytics.service';
import {GetOrderAction, FilterProductsAction} from '../../modules/compartido/pedidos/store/orders.actions';

import { ActionsSubject, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { GetLastMessagesAction } from 'src/app/modules/compartido/misMensajes/store/messages.actions';
import { IUser } from 'src/app/interfaces/IUser';
import { routes } from 'src/app/app-routing.module';
import { LoadingOn, LoadingOff } from 'src/app/modules/compartido/general/store/actions/loading.actions';
import { ShopSingletonService } from '../shops/shop-singleton.service';


@Injectable({
    providedIn: 'root'
})
export class NoticationService {
    private alreadyRedirected = false;
    user: IUser;
    mensajes: any[] = [
        {
            title: '',
            body: '',
            date: new Date()
        }
    ];

    constructor(private oneSignal: OneSignal,
                private alertCtrl: AlertController,
                private storage: Storage,
                private navigation: NavigationHelper,
                private device: Device,
                private api: ApiService,
                private store: Store<AppState>,
                private analyticsService: AnalyticsService,
                private utilities: UtilitiesHelper,
                public shopSingletonService: ShopSingletonService,
        ) {
    }

    async initConfig() {
        //if (this.device.platform === 'iOS') return false;
        // first params onesignal app id , second one android
        this.oneSignal.startInit('370a027e-cc91-4579-b0f5-e2fbb98b5df6', '752498946722');
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);

        // Notifcation was received in general
        this.oneSignal.handleNotificationReceived().subscribe(data => {
            const msg = data.payload.body;
            const title = data.payload.title;
            const jsonData = {notification: data};
            const doRouting = (document.URL.indexOf('compania') < 0);
            this.showAlert(title, msg, jsonData, doRouting);
            this.analyticsService.sendEvent('click', {'event_category': 'notificaciones_'+data.payload.additionalData.notification_id, 'event_label': 'notificacion_recibida'});
            this.getLastNotification();
        });
        // Notification was really clicked/opened
        this.oneSignal.handleNotificationOpened().subscribe((jsonData: OSNotificationOpenedResult) => {
            this.storageNotification(jsonData);
            this.analyticsService.sendEvent('click', {'event_category': 'notificaciones_'+jsonData.notification.payload.additionalData.notification_id, 'event_label': 'notificacion_abierta'});
            this.getLastNotification();
        });
        this.oneSignal.endInit();
    }

    async showAlert(title, msg, jsonData, routing?: boolean) {
        let alertOrder = false;
        let whatsappAlert = false;

        if (jsonData.notification.payload.additionalData) {
            const pedido_id = jsonData.notification.payload.additionalData.pedido_id;
            if (pedido_id !== undefined && parseInt(pedido_id) !== 0) {
                const tienda_id = jsonData.notification.payload.additionalData.tienda_id;

                if (tienda_id !== undefined || parseInt(tienda_id) !== 0) {
                    alertOrder = true;
                }
            }

            const tel = jsonData.notification.payload.additionalData.telefono_distribuidor;
            const action = jsonData.notification.payload.additionalData.action;

            if (action === 'whatsapp' && tel !== undefined) {
                whatsappAlert = true;
            }
        }

        let buttons = null;
        if (whatsappAlert) {
            buttons = [{ text: `Continuar`,
                handler: () => {
                    if (!this.alreadyRedirected) {
                        this.storageNotification(jsonData);
                    }
                }
            }, {text: 'Ir a Whatsapp', handler: () => {
                    if (!this.alreadyRedirected) {
                        this.storageNotification(jsonData, false, jsonData.notification.payload.additionalData.telefono_distribuidor);
                    }
                }
            }];
        } else {
            buttons = ((routing) || !alertOrder) ? [{
                text: `Aceptar`,
                handler: () => {
                    if (!this.alreadyRedirected) {
                        this.storageNotification(jsonData);
                    }
                }
            }] : [{ text: `Continuar`,
                handler: () => {
                    if (!this.alreadyRedirected) {
                        this.storageNotification(jsonData);
                    }
                }
            }, {text: 'Ver pedido', handler: () => {
                    if (!this.alreadyRedirected) {
                        this.storageNotification(jsonData, true);
                    }
                }
            }];
        }

        const alert = await this.alertCtrl.create({
            header: title,
            subHeader: msg,
            buttons: buttons
        });

        alert.onDidDismiss().then(() => {
            this.alreadyRedirected = false;
        });
        alert.present();
    }

    private getLastNotification(){
        this.storage.get('user').then(usu => {
            this.user = JSON.parse(usu);
            this.store.dispatch(new GetLastMessagesAction(this.user.token));
        });
    }

    private async logicNotificationOld(doRouting, jsonData, dataUserTemp) { // DEPRECATED
        //let params = jsonData.notification.payload.additionalData
        this.store.dispatch(new LoadingOn());
        setTimeout(() => {
            this.store.dispatch(new LoadingOff());
            this.navigation.goToBack('mis-mensajes', { openLastMessage:  true });
        }, 1500);
    }

    private async logicNotification(doRouting, jsonData, dataUserTemp) {
        if (!doRouting) {
            return;
        }
        if (jsonData.notification.payload.additionalData === undefined || jsonData.notification.payload.additionalData === '') {
            return;
        }

        this.alreadyRedirected = true;
        // When 'pedido_id' received, goes to delivery detail
        const pedido_id = jsonData.notification.payload.additionalData.pedido_id;
        if (pedido_id !== undefined && parseInt(pedido_id) !== 0) {
            const tienda_id = jsonData.notification.payload.additionalData.tienda_id;
            if (tienda_id === undefined || parseInt(tienda_id) === 0) {
                return;
            }

            if (dataUserTemp.tipo_usuario !== 'vendedor') {
                if (dataUserTemp.tiendas !== undefined && Array.isArray(dataUserTemp.tiendas) && dataUserTemp.tiendas.length > 1) {
                    const store = dataUserTemp.tiendas
                        .filter(data => data.id == jsonData.notification.payload.additionalData.tienda_id);

                    const storeIndex = dataUserTemp.tiendas.indexOf(store[0]);
                    if (storeIndex > 0) {
                        // Remove it from array
                        dataUserTemp.tiendas.splice(storeIndex, 1);
                        // Put it back in first place
                        dataUserTemp.tiendas.unshift(store);
                        // alert($state)
                        // Delete associated companies
                        delete sessionStorage.companiesAssociated;
                        // Save it for later, in storage where it belongs to
                        delete localStorage.userData;
                        localStorage.userData = JSON.parse(dataUserTemp);
                    }
                }

                let shop = this.shopSingletonService.getSelectedShop();
                shop.productos_seleccionados={};
                this.shopSingletonService.setSelectedShop(shop);
                this.shopSingletonService.setStorageSelectedShop(shop);
                //set data in cart 
                this.store.dispatch(new GetOrderAction(dataUserTemp.token, dataUserTemp.tiendas[0].id, (shop, pedido_id) => {
                    this.store.dispatch(new FilterProductsAction(shop.productos_seleccionados, false));
                    //let ms = "token " + dataUserTemp.token + " id " + dataUserTemp.id + " cod " + dataUserTemp.codigo_cliente;
                    //this.showAlert("prueba de notifi",ms,"");
                    // Check if geolocation not set
                    if (dataUserTemp.tiendas[0].latitud === '-1' || dataUserTemp.tiendas[0].latitud === '') {
                        // Session just to know user was here after setting up address to get it back to shopping process
                        sessionStorage.settingAddress = true;
                        this.analyticsService.sendEvent('click', {'event_category': 'notificaciones', 'event_label': 'captura_ubicacion'});
                        this.utilities.capturaUbicacion(dataUserTemp, dataUserTemp.tiendas, '', true);
                    } else {
                        // Ready to go shopping :p
                        this.analyticsService.sendEvent('click', {'event_category': 'notificaciones', 'event_label': 'dirige_pedidos'});
                        this.navigation.goTo('inicio-tendero');
                    }
                }, dataUserTemp.codigo_cliente));

            } else {
                const clientData = dataUserTemp.tiendas
                    .filter(data => data.id == jsonData.notification.payload.additionalData.tienda_id);
                if (clientData !== undefined && clientData.length > 0) {
                    if (localStorage.withoutConnection !== undefined && localStorage.withoutConnection) {
                        // Route to Offline Products
                        this.analyticsService.sendEvent('click', {
                            'event_category': 'notificaciones', 'event_label': 'dirige_productos_offline'
                        });

                        this.navigation.goTo('lista-productos-offline', clientData);
                    } else {
                        // Route to category list
                        this.analyticsService.sendEvent('click', {
                            'event_category': 'notificaciones', 'event_label': 'dirige_compania_vendedor'
                        });

                        this.utilities.goToCompanySeller(clientData[0], dataUserTemp.token);
                    }
                } else {
                    // Route to list of clients
                    this.analyticsService.sendEvent('click', {
                        'event_category': 'notificaciones', 'event_label': 'dirige_lista_clientes'
                    });
                    this.navigation.goTo('lista-clientes');
                }
            }
        } else {
            // When 'compania_nombre' received, goes to search by compania
            if (jsonData.notification.payload.additionalData.compania_nombre !== undefined) {
                if (dataUserTemp.tipo_usuario === 'vendedor') {
                    // Just to be sure, this kind of notification must not be sent to salesman
                    return;
                }
                this.analyticsService.sendEvent('click', {'event_category': 'notificaciones', 'event_label': 'dirige_compania_cliente'});
                this.utilities.goToPedidos(dataUserTemp.tiendas[0], dataUserTemp.token, {
                    search: jsonData.notification.payload.additionalData.compania_nombre.toString()
                });
            } else {
                // When 'compania_id' received, goes to compania home
                if (jsonData.notification.payload.additionalData.compania_id !== undefined) {
                    if (dataUserTemp.tipo_usuario === 'vendedor') {
                        return;
                    }
                    // Just to be sure, this kind of notification must not be sent to salesman
                    sessionStorage.notifiedCompany = JSON.parse(jsonData.notification.payload.additionalData.compania_id);
                    const tiendas = dataUserTemp.tiendas;
                    if (tiendas !== undefined && Array.isArray(dataUserTemp.tiendas) && dataUserTemp.tiendas.length > 1) {
                        // Show user store selection
                        this.analyticsService.sendEvent('click', {
                            'event_category': 'notificaciones', 'event_label': 'dirige_inicio_tendero'
                        });
                        this.navigation.goTo('inicio-tendero');
                    } else {
                        dataUserTemp.compania = {id: jsonData.notification.payload.additionalData.compania_id};
                        this.storage.set('user', JSON.stringify(dataUserTemp))
                            .then(() => {
                                this.analyticsService.sendEvent('click', {
                                    'event_category': 'notificaciones',
                                    'event_label': 'dirige_compania_tendero'
                                });
                                this.navigation.goToBack('compania');
                            });
                    }
                } else {
                    const seccion = jsonData.notification.payload.additionalData.seccion;
                    let params = {};
                    // When 'seccion' received, goes to that section right away
                    if (seccion !== undefined && parseInt(seccion) != null) {
                        try {
                            const sectionGoTo = jsonData.notification.payload.additionalData.seccion.toString();
                            let iRoutes = routes.findIndex(r => r.path == sectionGoTo);
                            if (iRoutes === -1) return false;
                            let goToSection = '';
                            switch (sectionGoTo) {
                                case 'puntos':
                                    params = {shop: dataUserTemp.tiendas[0]};
                                    goToSection = 'puntos';
                                    break;
                                default:
                                    goToSection = sectionGoTo;
                                    break;
                            }
                            this.analyticsService.sendEvent('click', {
                                'event_category': 'notificaciones',
                                'event_label': 'dirige_seccion_' + goToSection
                            });
                            setTimeout(() => {
                                this.navigation.goToBack(goToSection, params);
                            }, 1500);
                        } catch (err) {
                        }
                    } else {
                        // When 'producto' received, goes to that producto right away
                        if (jsonData.notification.payload.additionalData.producto !== undefined) {
                            if (dataUserTemp.tipo_usuario === 'vendedor') {
                                return;
                            }
                            // Just to be sure, this kind of notification must not be sent to salesman
                            sessionStorage.notifiedProduct = jsonData.notification.payload.additionalData.producto;
                            const product = JSON.parse(jsonData.notification.payload.additionalData.producto);
                            const tiendas = dataUserTemp.tiendas;
                            if (tiendas !== undefined && Array.isArray(dataUserTemp.tiendas) && dataUserTemp.tiendas.length > 1) {
                                // Show user store selection
                                this.analyticsService.sendEvent('click', {
                                    'event_category': 'notificaciones',
                                    'event_label': 'dirige_inicio_tendero2'
                                });
                                this.navigation.goTo('inicio-tendero');
                            } else {
                                this.analyticsService.sendEvent('click', {
                                    'event_category': 'notificaciones',
                                    'event_label': 'dirige_mis-mensajes'
                                });
                                setTimeout(() => {
                                    this.navigation.goToBack('mis-mensajes', {
                                        openLastMessage: true,
                                        product: product
                                    });
                                }, 1500);
                            }
                        }
                    }
                }
            }
        }
    }

    private async storageNotification(jsonData, viewOrder?: boolean, whatsapp?: string) {

        if (whatsapp) {
            window.open('https://api.whatsapp.com/send?text=Hola storeapp&phone=+57' + whatsapp, '_blank');
            return;
        }

        // Just a note that the data is a different place here!
        let doRouting = false;
        let dataUserTemp = null;
        await this.storage.get('user').then(res => {
            res = JSON.parse(res);
            if (res != null && res.user_id != null) {
                dataUserTemp = res;
                const isCliente = dataUserTemp.tipo_usuario === 'cliente';
                if ((isCliente) && (dataUserTemp.tiendas[0].latitud === undefined || dataUserTemp.tiendas[0].latitud === '')) {
                    console.log('paila la notificación');
                } else {
                    doRouting = (document.URL.indexOf('compania') < 0);
                }
            }
        });

        if (viewOrder) {
            doRouting =  true;
        }

        this.logicNotification(doRouting, jsonData, dataUserTemp);
    }
}
