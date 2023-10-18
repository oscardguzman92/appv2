import { ModalPedidoEnConflictoComponent } from './../../../../../compartido/components/modal-pedido-en-conflicto/modal-pedido-en-conflicto.component';
import { ModalOptions } from '@ionic/core';
import { ShopSingletonService } from '../../../../../../../services/shops/shop-singleton.service';
import {Component, OnInit, Output, EventEmitter, Input, OnDestroy, AfterViewChecked} from '@angular/core';
import {NavigationHelper} from '../../../../../../../helpers/navigation/navigation.helper';
import {ActionsSubject, Store} from '@ngrx/store';
import {filter} from 'rxjs/operators';
import {SetShopsAction, SET_SHOPS} from '../../../../store/mis-clientes.actions';
import {IShops} from 'src/app/interfaces/IShops';
import {Shop} from 'src/app/models/Shop';
import {Storage} from '@ionic/storage';
import {AppState} from 'src/app/store/app.reducer';
import {Subscription} from 'rxjs';
import {UtilitiesHelper} from 'src/app/helpers/utilities/utilities.helper';
import {LoadingOff, LoadingOn} from 'src/app/modules/compartido/general/store/actions/loading.actions';
import {ActionSheetController, ToastController, AlertController, ModalController} from '@ionic/angular';
import {CashRegisterService} from 'src/app/services/orders/cash-register.service';
import {GetOrderAction} from 'src/app/modules/compartido/pedidos/store/orders.actions';
import {IUser} from 'src/app/interfaces/IUser';
import { UserSellerService } from 'src/app/services/users/user-seller.service';
import { MsgErrorService } from 'src/app/services/api/msg-error.service';


@Component({
    selector: 'app-mis-clientes-clientes',
    templateUrl: './mis-clientes-clientes.component.html',
    styleUrls: ['./mis-clientes-clientes.component.scss'],
})
export class MisClientesClientesComponent implements OnInit, OnDestroy, AfterViewChecked {

    public shopsAction = new Subscription();
    private days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    private dayName: string;

    @Input() shops: IShops[];
    @Input() user: IUser;
    @Input() percentage: number;
    @Input() isOfflineActive: boolean;
    @Input() offlineDynamic: boolean;
    @Output() refreshClient = new EventEmitter();
    @Output() filterClient = new EventEmitter();
    exitosos: any[] = [];


    constructor(private navigation: NavigationHelper,
                private actionsSubj: ActionsSubject,
                private store: Store<AppState>,
                private storage: Storage,
                private utilities: UtilitiesHelper,
                public actionSheetController: ActionSheetController,
                public cashService: CashRegisterService,
                public alert: AlertController,
                private toastController: ToastController,
                private msgErrorService: MsgErrorService,
                public shopSingletonService: ShopSingletonService,
                public userSellerService: UserSellerService,
                public modalController: ModalController,
            ) {
        const d = new Date();
        this.dayName = this.days[d.getDay()];
    }

    ngOnInit() {
        this.validateIfHasNotPurchase(true);
    }

    ngAfterViewChecked() {
        this.validateIfHasNotPurchase(false);
    }

    ngOnDestroy() {
        this.storage.remove('reasonsNotRequested').then();
        this.shopsAction.unsubscribe();
    }

    async validateIfHasNotPurchase(fromInit: boolean) {
        let reasonsNotRequested: any;
        let order: any;

        if (this.navigation.noPurchase || fromInit) {

            this.navigation.noPurchase = false;
            this.navigation.theLocalStrorageWasAlreadyRead = false;

            // actualizacion de las variables para las banderas con la informacion del local storage
            await this.storage.get('reasonsNotRequested').then(data => {
                reasonsNotRequested = data;
                if (data) {
                    this.shops.forEach(shop => {
                        const shopWhitNoPurchase = data.find(itemInLocalStorage => {
                            return itemInLocalStorage.tienda_id === shop.id && shop.dia === this.dayName;
                        });
                        if (shopWhitNoPurchase) {
                            shop.no_pedido = shopWhitNoPurchase.motivo_id;
                        }
                    });
                }
            });

            await this.storage.get('order').then(data => {
                order = data;
                if (data) {
                    data = JSON.parse(data);
                    this.shops.forEach(shop => {
                        const shopWhitPurchase = data.find(itemInLocalStorage => {
                            return itemInLocalStorage.id === shop.id && shop.dia === this.dayName;
                        });
                        if (shopWhitPurchase) {
                            if (shopWhitPurchase.productos_seleccionados) {
                                if (Object.keys(shopWhitPurchase.productos_seleccionados).length !== 0 &&
                                    shopWhitPurchase.productos_seleccionados && shop.no_pedido !== null) {
                                    shop.no_pedido = null;
                                }
                            }
                        }
                    });
                }
            });

            await this.storage.get('reasonsNotRequested').then(noRequested => {
                if (noRequested) {
                    this.storage.get('order').then(orders => {
                        if (orders) {
                            orders = JSON.parse(orders);
                            const noRequestedFiltered = noRequested
                                .filter(noRequestedItem => {
                                    const result = orders.find(orderLine => {
                                        if (orderLine) {
                                            if (orderLine.productos_seleccionados) {
                                                if (Object.keys(orderLine.productos_seleccionados).length !== 0 &&
                                                    orderLine.productos_seleccionados && orderLine.id === noRequestedItem.tienda_id) {
                                                    return orderLine;
                                                }
                                            }
                                        }
                                    });
                                    if (!result) {
                                        return true;
                                    }
                                });
                            if (noRequestedFiltered.length > 0) {
                                this.storage.set('reasonsNotRequested', noRequestedFiltered).then();
                            } else {
                                this.storage.remove('reasonsNotRequested').then();
                            }
                        }
                    });
                }
            });

            if (!reasonsNotRequested) {
                const arrayForLocalStorge = [];

                this.shops.forEach(shop => {
                    if (shop.no_pedido !== null && shop.dia === this.dayName) {
                        arrayForLocalStorge.push({
                            fecha: new Date().toISOString().split('T')[0],
                            latitud: shop.latitud,
                            longitud: shop.longitud,
                            motivo_id: shop.no_pedido,
                            tienda_id: shop.id,
                            vendedor_id: this.user.v_id
                        });
                    }
                });

                if (arrayForLocalStorge.length > 0) {
                    this.storage.set('reasonsNotRequested', arrayForLocalStorge).then();
                }
            }
        }

        if (!this.navigation.theLocalStrorageWasAlreadyRead) {
            this.storage.get('reasonsNotRequested').then(data => {
                if (data) {
                    const arrayForLocalStorge = [];

                    this.shops.forEach(shop => {
                        if (shop.no_pedido !== null && shop.dia === this.dayName) {
                            arrayForLocalStorge.push({
                                fecha: new Date().toISOString().split('T')[0],
                                latitud: shop.latitud,
                                longitud: shop.longitud,
                                motivo_id: shop.no_pedido,
                                tienda_id: shop.id,
                                vendedor_id: this.user.v_id
                            });
                        }
                    });

                    if (arrayForLocalStorge.length > 0) {
                        this.storage.set('reasonsNotRequested', arrayForLocalStorge).then();
                    }
                }
            });

            this.navigation.theLocalStrorageWasAlreadyRead = true;
        }
    }

    async viewDetail(shopData: Shop, event) {
        shopData = await this.utilities.setProductsStorage(shopData);
        this.shopSingletonService.setSelectedShop(shopData);
        this.shopSingletonService.setStorageSelectedShop(shopData);
        if (event.target.className.indexOf('actionSheet') !== -1) {
            return;
        }

        this.store.dispatch(new LoadingOn);
        if (this.isOfflineActive) {
            shopData.offline = this.isOfflineActive;
            this.shopSingletonService.setSelectedShop(shopData);
            this.shopSingletonService.setStorageSelectedShop(shopData);
            this.navigation.goToBack('detalle-cliente');
            return;
        }

        if (shopData.pedido && (!shopData.productos_seleccionados || Object.keys(shopData.productos_seleccionados).length == 0)) {
            shopData.status_productos_pendientes = false;
        } else if (shopData.pedido && shopData.productos_seleccionados && shopData.status_productos_pendientes) {
            shopData.status_productos_pendientes = true;
        }
        this.shopSingletonService.setSelectedShop(shopData);
        this.shopSingletonService.setStorageSelectedShop(shopData);
        if (this.offlineDynamic) {
            this.navigation.goToBack('detalle-cliente');
            return;
        }

        if (!shopData.status_productos_pendientes || !shopData.productos_seleccionados || Object.keys(shopData.productos_seleccionados).length == 0) {
            this.store.dispatch(new GetOrderAction(this.user.token, shopData.id, (shop, pedido_id) => {
                if (pedido_id) {
                    shopData.pedido = pedido_id;
                }
                this.shopSingletonService.setSelectedShop(shopData);
                this.shopSingletonService.setStorageSelectedShop(shopData);
                this.navigation.goToBack('detalle-cliente');
            }, shopData.codigo_cliente));
        } else {
            this.store.dispatch(new LoadingOff);
            this.navigation.goToBack('detalle-cliente');
        }
    }

    async presentActionSheet(shop) {
        const actionSheet = await this.actionSheetController.create({
            header: 'Pedidos sin enviar',
            backdropDismiss: true,
            buttons: [
                {
                    text: 'Enviar pedido seleccionado',
                    icon: 'send',
                    handler: () => {
                        this.sendCurrent(shop);
                    }
                },
                {
                    text: 'Enviar todos los pendientes',
                    icon: 'send',
                    handler: () => {
                        this.store.dispatch(new LoadingOn);
                        this.sendAll();
                    }
                },
                {
                    text: 'Eliminar pedido seleccionado',
                    role: 'destructive',
                    icon: 'trash',
                    handler: () => {
                        this.deleteCurrent(shop);
                    }
                },
                {
                    text: 'Eliminar todos los pendientes',
                    role: 'destructive',
                    icon: 'trash',
                    handler: () => {
                        this.deleteAll();
                    }
                },
                {
                    text: 'Cancelar',
                    icon: 'close-circle',
                    role: 'cancel',
                    handler: () => {
                    }
                }]
        });
        await actionSheet.present();
    }

    deleteCurrent(shopData: Shop) {
        this.deleteOrder(shopData);
        setTimeout(() => this.filterClient.emit(), 500);
    }

    sendCurrent(shop: Shop) {
        this.store.dispatch(new LoadingOn(true));
        this.cashService.getCoords(cb => {
            if (cb) {
                this.sendOrder(shop);
            } else {
                this.store.dispatch(new LoadingOff());
            }
        });
    }

    async deleteAll() {
        const alert = await this.alert.create({
            header: 'Atención!',
            message: 'Sí pulsa aceptar eliminara todos los pedidos pendientes por enviar.',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: 'Aceptar',
                    handler: () => {
                        this.deleteOrder();
                        setTimeout(() => {
                            this.refreshClient.emit();
                        }, 800);
                    }
                }
            ]
        });

        await alert.present();
    }

    sendAll() {
        this.cashService.getCoords(cb => {
            if (cb) {
                this.sendOrder();
            }
        });
    }


    async deleteOrder(shopData?: Shop) {
        if (!shopData) {
            this.storage.get('order').then(res => {
                const a = JSON.parse(res);
                const message = 'Se descartaron ' + a.length + ' pedidos pendientes por enviar.';
                this.cashService.clearSelectedOrder(null, message, true, () => {
                    this.refreshClient.emit();
                });
            });
        } else {
            const message = 'Se descartó el pedido pendiente por enviar de la tienda: ' + shopData.codigo_cliente + '.';
            this.cashService.clearSelectedOrder(shopData, message, null, () => {
                this.refreshClient.emit();
            });
        }
    }

    async sendOrder(shopData?: Shop) {
        let products;
        await this.storage.get('order').then(res => {
            res = JSON.parse(res);
            if (shopData) {
                res.forEach((e, i, o) => {
                    if ((e.id == shopData.id) && (e.codigo_cliente == shopData.codigo_cliente)) {
                        products = Object.values(e.productos_seleccionados);
                        this.cashService.setOrder(products, shopData).subscribe(async success => {
                            if (success === false) {
                                return;
                            }
                            this.store.dispatch(new LoadingOff);
                            if (success.status == 'ok' && success.code == 0) {
                                const message = 'El pedido #' + success.content.pedido_id + ' ha sido realizado. se enviará al sistema ' + success.content.fecha_envio;
                                this.presentToastWithOptions(message);
                                this.cashService.clearSelectedOrder(shopData, null, null, () => {
                                    this.refreshClient.emit();
                                });
                            } else if (success.content && success.content.error) {
                                this.presentToastWithOptions(success.content.error);
                            } else if (success.content && success.content[0]) {
                                this.presentToastWithOptions(success.content[0]);
                            } else {
                                const msg = await this.msgErrorService.getErrorIntermitencia();
                                this.presentToastWithOptions(msg);
                            }
                        }, async error => {
                            const msg = await this.msgErrorService.getErrorIntermitencia();
                            this.presentToastWithOptions(msg);
                            this.store.dispatch(new LoadingOff);
                        });
                    }
                });
            } else {
                this.exitosos = [];
                this.sendAllAsyncOrder(res, res.length - 1);
            }
        });
    }

    sendAllAsyncOrder(res, i) {
        if (i >= 0) {
            const e = res[i];
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
                products = Object.values(e.productos_seleccionados);
                this.cashService.setOrder(products, shopData).subscribe(async success => {
                    if (success.status == 'ok' && success.code == 0) {
                        const message = 'El pedido #' + success.content.pedido_id + ' ha sido realizado. se enviará al sistema '
                            + success.content.fecha_envio;
                        this.exitosos.push(message);
                        this.cashService.clearSelectedOrder(shopData, null, null, () => {
                            this.refreshClient.emit();
                        });
                        this.sendAllAsyncOrder(res, i - 1);
                    } else {
                        if (success.content && success.content.error) {
                            this.presentToastWithOptions(success.content.error);
                        } else if (success.content && success.content[0]) {
                            this.presentToastWithOptions(success.content[0]);
                        } else {
                            const msg = await this.msgErrorService.getErrorIntermitencia();
                            this.presentToastWithOptions(msg);
                        }
                        this.sendAllAsyncOrder(res, i - 1);
                    }
                    if (i == 0) {
                        this.presentToastWithOptions('Se enviaron ' + this.exitosos.length + ' correctamente.');
                        this.store.dispatch(new LoadingOff);
                    }
                }, error => {
                    if (i == 0) {
                        this.presentToastWithOptions('Se enviaron ' + this.exitosos.length + ' correctamente.');
                        this.store.dispatch(new LoadingOff);
                        this.refreshClient.emit();
                    }
                    this.presentToastWithOptions(JSON.stringify(error));
                    this.sendAllAsyncOrder(res, i - 1);
                });
            } else {
                this.sendAllAsyncOrder(res, i - 1);
            }
        }
    }

    public async openModalConflict(shop) {
        const modal = await this.modalController.create(<ModalOptions>{
            component: ModalPedidoEnConflictoComponent,
            componentProps: {
                user: this.user,
                shop: shop,
                with_send: true,
            }
        });

        modal.onDidDismiss().then((dataIn) => {
            if (dataIn.data && dataIn.data.pedido_id) {
                this.refreshClient.emit();
            }
        });

        return await modal.present();
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

    checkFounds(shop): boolean {
        if (this.checkCarteraActive(shop)) {
            const obj = this.getSaldo(shop.saldo);
            if (obj.saldo > 0) {
                return false;
            }
            return true;
        }
        return false;
    }

    checkPayment(shop) {
        if (this.checkCarteraActive(shop)) {
            const obj = this.getSaldo(shop.saldo);
            if (obj.mora == 0) {
                return false;
            }
            return true;
        }
        return false;
    }

    checkCarteraActive(object) {
        return (object.saldo == null && object.plazo_pago == null && object.cupo_credito == null) ? false : true;
    }

    getSaldo(saldo) {
        const split = (saldo !== null ) ? saldo.split('[') : 0;
        const r = {
            saldo: 0,
            mora: 0
        };
        if (split.length > 1) {
            r.saldo = split[0];
            r.mora = split[1].replace(']', '') ;
        } else {
            r.saldo = split[0];
        }
        return r;
    }
}
