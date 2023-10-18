import {Component, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {IMessage} from '../../../../../../../interfaces/IMessages';
import {IProduct} from '../../../../../../../interfaces/IProduct';
import {GetStatusProductByShopAction, SetStatusProductByShopAction, SET_STATUS_PRODUCT_BY_SHOP, GetOrderAction, FilterProductsAction} from '../../../../../pedidos/store/orders.actions';
import {Storage} from '@ionic/storage';
import {jumpAnimation} from '../../../../../../../animations/jump.animation';
import {filter, map} from 'rxjs/operators';
import {ActionsSubject, Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {ModalController} from '@ionic/angular';
import {IUser} from '../../../../../../../interfaces/IUser';
import { UtilitiesHelper } from 'src/app/helpers/utilities/utilities.helper';
import { LoadingOn, LoadingOff } from 'src/app/modules/compartido/general/store/actions/loading.actions';
import { AppState } from 'src/app/store/app.reducer';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';
import { routes } from 'src/app/app-routing.module';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';

@Component({
    selector: 'app-mis-mensajes-mensaje',
    templateUrl: './mis-mensajes-mensaje.component.html',
    styleUrls: ['./mis-mensajes-mensaje.component.scss'],
    animations: [jumpAnimation]
})
export class MisMensajesMensajeComponent implements OnInit {
    @ViewChildren('containerCards') container = new QueryList();

    @Input() message: IMessage;
    @Input() user: IUser;
    producto: IProduct;
    public showProduct;
    public disabledProduct = false;
    public thingState: string;
    public nProducts = 0;
    public orderValue: any;
    private actionsCountProductsOrder = new Subscription();
    private statusProductSubscribe = new Subscription();
    pageRedirecAction: () => void;

    constructor(
        private actionsSubj: ActionsSubject,
        private store: Store<AppState>,
        private modalController: ModalController,
        private utilities: UtilitiesHelper,
        private analyticsService: AnalyticsService,
        private navigation: NavigationHelper,
        private storage: Storage,
        public shopSingletonService: ShopSingletonService,
    ) {
    }

    ngOnInit() {
        let shop = this.shopSingletonService.getSelectedShop();
        if (this.message.datos && this.message.datos.producto) {
            if (typeof this.message.datos.producto === 'string') this.message.datos.producto = JSON.parse(this.message.datos.producto);
            this.producto = this.message.datos.producto;
        }
        this.logicRedirect();
        this.analyticsService.sendEvent('notificacion_abierta_' + this.user.role, { 'event_category': 'seccion_notificacion_' + this.message.id, 'event_label': '' });
        if (this.producto && this.producto.producto_distribuidor_id) {
            this.store.dispatch(new LoadingOn());
            console.log(this.producto)
            this.store.dispatch(new GetStatusProductByShopAction(this.user.token, shop.id, this.producto.producto_distribuidor_id));
    
            this.statusProductSubscribe = this.actionsSubj
                .pipe(filter((res: SetStatusProductByShopAction) => res.type === SET_STATUS_PRODUCT_BY_SHOP))
                .subscribe((res) => {
                    this.store.dispatch(new LoadingOff());
                    this.disabledProduct = !res.status;
                })
        }
    }

    ionViewDidEnter() {
        this.showProduct = true;
    }

    ionViewDidLeave() {
        this.actionsCountProductsOrder.unsubscribe();
        this.statusProductSubscribe.unsubscribe();
    }

    goToShop(tiendaId) {
        const clientData = this.user.tiendas
                    .filter(data => data.id == tiendaId);
        this.utilities.goToCompanySeller(clientData[0], this.user.token);
        this.modalController.dismiss();
    }

    //const pedido_id = paramsNoti.pedido_id;

    private async logicRedirect() { 
        if (!this.message.datos || this.producto) return;
        let paramsNoti = this.message.datos;
        let  dataUserTemp = Object.assign(this.user);
        // When 'pedido_id' received, goes to delivery detail
        const pedido_id = paramsNoti.pedido_id;
        if (pedido_id !== undefined && parseInt(pedido_id) !== 0) {
            const tienda_id = paramsNoti.tienda_id;
            if (tienda_id === undefined || parseInt(tienda_id) === 0) {
                return;
            }

            if (dataUserTemp.tipo_usuario !== 'vendedor') {
                if (dataUserTemp.tiendas !== undefined && Array.isArray(dataUserTemp.tiendas) && dataUserTemp.tiendas.length > 1) {
                    const store = dataUserTemp.tiendas
                        .filter(data => data.id == paramsNoti.tienda_id);

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
                shop.productos_seleccionados = {};
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
                        this.pageRedirecAction = () => {
                            this.analyticsService.sendEvent('click', {'event_category': 'notificaciones', 'event_label': 'dirige_pedidos'});
                            this.navigation.goTo('inicio-tendero');
                        }
                    }
                }, dataUserTemp.codigo_cliente));

            } else {
                const clientData = dataUserTemp.tiendas
                    .filter(data => data.id == paramsNoti.tienda_id);
                if (clientData !== undefined && clientData.length > 0) {
                    if (localStorage.withoutConnection !== undefined && localStorage.withoutConnection) {
                        // Route to Offline Products
                        this.pageRedirecAction = () => {
                            this.analyticsService.sendEvent('click', {
                                'event_category': 'notificaciones', 'event_label': 'dirige_productos_offline'
                            });
                            this.navigation.goTo('lista-productos-offline', clientData);
                        }
                    } else {
                        this.pageRedirecAction = () => {
                            // Route to category list
                            this.analyticsService.sendEvent('click', {
                                'event_category': 'notificaciones', 'event_label': 'dirige_compania_vendedor'
                            });
                            this.utilities.goToCompanySeller(clientData[0], dataUserTemp.token);
                        }
                    }
                } else {
                    this.pageRedirecAction = () => {
                        // Route to list of clients
                        this.analyticsService.sendEvent('click', {
                            'event_category': 'notificaciones', 'event_label': 'dirige_lista_clientes'
                        });
                        this.navigation.goTo('lista-clientes');
                    }
                }
            }
        } else {
            // When 'compania_nombre' received, goes to search by compania
            if (paramsNoti.compania_nombre !== undefined) {
                if (dataUserTemp.tipo_usuario === 'vendedor') {
                    // Just to be sure, this kind of notification must not be sent to salesman
                    return;
                }
                this.pageRedirecAction = () => {
                    this.analyticsService.sendEvent('click', {'event_category': 'notificaciones', 'event_label': 'dirige_compania_cliente'});
                    this.utilities.goToPedidos(dataUserTemp.tiendas[0], dataUserTemp.token, {
                        search: paramsNoti.compania_nombre.toString()
                    });
                }
            } else {
                // When 'compania_id' received, goes to compania home
                if (paramsNoti.compania_id !== undefined) {
                    if (dataUserTemp.tipo_usuario === 'vendedor') {
                        return;
                    }
                    // Just to be sure, this kind of notification must not be sent to salesman
                    sessionStorage.notifiedCompany = JSON.parse(paramsNoti.compania_id);
                    const tiendas = dataUserTemp.tiendas;
                    if (tiendas !== undefined && Array.isArray(dataUserTemp.tiendas) && dataUserTemp.tiendas.length > 1) {
                        this.pageRedirecAction = () => {
                            // Show user store selection
                            this.analyticsService.sendEvent('click', {
                                'event_category': 'notificaciones', 'event_label': 'dirige_inicio_tendero'
                            });
                            this.navigation.goTo('inicio-tendero');
                        }
                    } else {
                        this.pageRedirecAction = () => {
                            dataUserTemp.compania = {id: paramsNoti.compania_id};
                            this.storage.set('user', JSON.stringify(dataUserTemp))
                                .then(() => {
                                    this.analyticsService.sendEvent('click', {
                                        'event_category': 'notificaciones',
                                        'event_label': 'dirige_compania_tendero'
                                    });
                                    this.navigation.goToBack('compania');
                                });
                        }
                    }
                } else {
                    const seccion = paramsNoti.seccion;
                    let params = {};
                    // When 'seccion' received, goes to that section right away
                    if (seccion !== undefined && parseInt(seccion) != null) {
                        try {
                            const sectionGoTo = paramsNoti.seccion.toString();
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
                            this.pageRedirecAction = () => {
                                this.analyticsService.sendEvent('click', {
                                    'event_category': 'notificaciones',
                                    'event_label': 'dirige_seccion_' + goToSection
                                });
                                this.navigation.goToBack(goToSection, params);
                            }
                        } catch (err) {
                        }
                    } else {
                        // When 'producto' received, goes to that producto right away
                        if (paramsNoti.producto !== undefined) {
                            if (dataUserTemp.tipo_usuario === 'vendedor') {
                                return;
                            }
                            // Just to be sure, this kind of notification must not be sent to salesman
                            sessionStorage.notifiedProduct = paramsNoti.producto;
                            const product = JSON.parse(paramsNoti.producto);
                            const tiendas = dataUserTemp.tiendas;
                            if (tiendas !== undefined && Array.isArray(dataUserTemp.tiendas) && dataUserTemp.tiendas.length > 1) {
                                this.pageRedirecAction = () => {
                                    // Show user store selection
                                    this.analyticsService.sendEvent('click', {
                                        'event_category': 'notificaciones',
                                        'event_label': 'dirige_inicio_tendero2'
                                    });
                                    this.navigation.goTo('inicio-tendero');
                                }
                            } else {
                                this.pageRedirecAction = () => {
                                    this.analyticsService.sendEvent('click', {
                                        'event_category': 'notificaciones',
                                        'event_label': 'dirige_mis-mensajes'
                                    });
                                    this.navigation.goToBack('mis-mensajes', {
                                        openLastMessage: true,
                                        product: product
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    goToActionRedirect() {
        this.pageRedirecAction();
        this.modalController.dismiss();
    }

    goToWhatsapp(telefono_distribuidor: string) {
        window.open('https://api.whatsapp.com/send?text=Hola storeapp&phone=+57' + telefono_distribuidor, '_blank');
    }
}
