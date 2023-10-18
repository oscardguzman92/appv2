import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import {
    CompartidoSeleccionTiendaComponent
} from '../../../compartido/components/compartido-seleccion-tienda/compartido-seleccion-tienda.component';
import {AlertController, ModalController, LoadingController} from '@ionic/angular';
import {ModalOptions} from '@ionic/core';
import {Subscription} from 'rxjs';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {Shop} from '../../../../../models/Shop';
import {
    COUNT_PRODUCTS_ORDER,
    CountProductsOrderAction, SetOrderShopAction, GetOrderAction,
    GetFavoritesOrders,
    SET_FAVORITES_ORDERS,
    SetFavoritesOrders,
    FilterProductsAction} from '../../../../compartido/pedidos/store/orders.actions';
import {Order} from '../../../../../models/Order';
import {
    RegistroCapturaUbicacionComponent
} from '../../../registro/pages/registro/components/registro-captura-ubicacion/registro-captura-ubicacion.component';
import { IUser } from '../../../../../interfaces/IUser';
import { UtilitiesHelper } from '../../../../../helpers/utilities/utilities.helper';
import { Storage } from '@ionic/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingOff, LoadingOn } from '../../../../compartido/general/store/actions/loading.actions';
import { GetOnlyPointsAction, SET_ONLY_POINTS, SetOnlyPointsAction } from '../../../puntos/pages/puntos/store/puntos.actions';
import { filter } from 'rxjs/operators';
import { GetBalanceAction, SetBalanceAction, SET_BALANCE } from '../../../recargas/store/currentAccount/currentAccount.actions';
import { GetLastMessagesAction, SetLastMessagesAction, SET_LAST_MESSAGES } from '../../../../compartido/misMensajes/store/messages.actions';
import { GeneralOfertasComponent } from '../../../../compartido/general/components/general-ofertas/general-ofertas.component';
import { jumpAnimation } from '../../../../../animations/jump.animation';
import {
    GeneralCarritoComprasComponent
} from '../../../../compartido/general/components/general-carrito-compras/general-carrito-compras.component';
import { UserBuilder } from '../../../../../builders/user.builder';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { CashRegisterService } from 'src/app/services/orders/cash-register.service';
import { OrdersService } from '../../../../../services/orders/orders.service';
import { CashRegisterInSaleState } from '../../../../../modules/tendero/cajaRegistradora/store/cash-register.reducer';
import { CashRegisterInSaleAction } from '../../../../../modules/tendero/cajaRegistradora/store/cash-register.actions';
import { CacheService } from 'ionic-cache';
import { ILogin } from 'src/app/interfaces/ILogin';
import {AFTER_REFRESH_USER, AfterRefreshUserAction, LoginUserAction, RefreshUserAction} from 'src/app/store/auth/auth.actions';
import { LocalNotificationService, LocalNotification } from 'src/app/services/localNotification/local-notification.service';
import { GetMyOrdersAction, SetMyOrdersAction, SET_MY_ORDERS } from '../../../misPedidos/store/myOrders/myOrders.actions';
import { Fail } from 'src/app/modules/compartido/general/store/actions/error.actions';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import { GeneralObsService } from 'src/app/services/observables/general-obs.service';


@Component({
    selector: 'app-inicio-tendero',
    templateUrl: './inicio-tendero.page.html',
    styleUrls: ['./inicio-tendero.page.scss'],
    animations: [jumpAnimation]
})
export class InicioTenderoPage implements OnInit, OnDestroy {
    @ViewChild(GeneralOfertasComponent) offerComponent: GeneralOfertasComponent;
    public shops: Shop[];
    public shopSel: Shop;
    private pointsSubs = new Subscription();
    private actionsCountProductsOrder = new Subscription();
    private refreshObs = new Subscription();
    public  myOrders: Order[] = [];

    public titlebutton: string;
    public user: IUser;
    public thingState: string;
    public nProducts = 0;
    public orderValue: any;

    public favoriteOrders;
    private favoriteOrdersSubs = new Subscription();
    private balanceSubs = new Subscription();
    public hasEdit = false;
    public badge = false;
    public seguroActivo: boolean = false;
    public balance: string = "0";
    private myOrdersSubscribe = new Subscription();
    private deepSubscribe = new Subscription();

    public slideOpts = {
        initialSlide: 1,
        slidesPerView: 2,
        spaceBetween: 10,
        loop: (this.myOrders && this.myOrders.length > 3)
    };

    messageNotificationStatus: boolean = false;
    messageSubs: Subscription;
 
    /* creditos */
    public totalAvalaibleCredits: string;
    public totalAmountCredits: string;
    private accountSubs = new Subscription();
    public loadOffer: boolean = false;
    statusDeep: boolean = false;
    isDeepMultiShops: boolean = false;

    constructor(
        private navigation: NavigationHelper,
        public modalController: ModalController,
        private store: Store<AppState>,
        private storeInSale: Store<CashRegisterInSaleState>,
        private utilities: UtilitiesHelper,
        private storage: Storage,
        private router: Router,
        private route: ActivatedRoute,
        private actionsSubj: ActionsSubject,
        private actionsS: ActionsSubject,
        private alertController: AlertController,
        private analyticsService: AnalyticsService,
        private cache: CacheService,
        private loadingController: LoadingController,
        private cashRegisterServices: CashRegisterService,
        private noti: LocalNotificationService,
        private ordersService: OrdersService,
        public shopSingletonService: ShopSingletonService,
        public generalObsService: GeneralObsService,
    ) {

        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                const dataIn = this.router.getCurrentNavigation().extras.state
                    .data;
            } 
        });        

        this.totalAmountCredits = '0';

        this.favoriteOrdersSubs = this.actionsS
            .pipe(filter(res => res.type === SET_FAVORITES_ORDERS))
            .subscribe((res: SetFavoritesOrders) => {
                this.favoriteOrders = res.orders;
            });

    }

    ionViewWillEnter() {
        this.refreshObs = this.actionsSubj
            .pipe(filter((res: AfterRefreshUserAction) => res.type === AFTER_REFRESH_USER))
            .subscribe((res) => {
                if (res.sessionInactive === true) {
                    this.cache.clearAll()
                        .then(() => {
                            return this.storage.clear();
                        })
                        .then(() => {
                            this.navigation.goTo('inicio');
                        });
                    return;
                }

                if (!res.user) {
                    return;
                }

                this.storage.set('user', JSON.stringify(res.user))
                    .then(() => {
                        this.user = res.user;
                        this.shops = res.user.tiendas;
                        this.storage.set('order', JSON.stringify(this.shops))
                        this.shopSingletonService.setSelectedShop(this.shops[0]);
                        this.shopSel = this.shopSingletonService.getSelectedShop();
                        this.seguroActivo = (res.user.seguroActivo != undefined && res.user.seguroActivo == '1') ? true : false;
                        this.firstEnter();
                        this.init();
                        this.utilities.presentToast('Los datos fueron actualizados correctamente.');
                        this.store.dispatch(new LoadingOff());
                    })
                    .catch(err => {
                        this.store.dispatch(new LoadingOff());
                    });
            });
        this.balanceSubs = this.actionsSubj
            .pipe(filter((action: SetBalanceAction) => action.type === SET_BALANCE))
            .subscribe((res: SetBalanceAction) => {
                this.balance = res.balance;
                this.totalAmountCredits = res.totalAmountCredits;
                this.totalAvalaibleCredits = res.totalAvalaibleCredits;
            });
            
        this.storage.get('order')
            .then((shopsStorage) => {
                this.user = this.route.snapshot.data['user'];
                this.shops = JSON.parse(shopsStorage);
                if (!this.shops) {
                    this.shops = this.user.tiendas;
                    this.storage.set('order', JSON.stringify(this.shops))
                }
                this.shops.forEach((element, i) => this.shops[i] = new Shop(element));
                this.shopSingletonService.setSelectedShop(this.shops[0]);
                this.shopSel = this.shopSingletonService.getSelectedShop();
                this.store.dispatch(new GetMyOrdersAction(this.user.token, this.shopSel, 1, true));
                this.firstEnter();
                this.init();
                this.seguroActivo = (this.user.seguroActivo != undefined && this.user.seguroActivo == '1') ? true : false;

            })
            .catch(err => {
                this.store.dispatch(new LoadingOff());
            });
    }

    ngOnInit() {
        this.deepSubscribe = this.generalObsService.deepObs().subscribe(data => {
            if (this.loadOffer) {
                this.deepLink();
            } else {
                this.statusDeep = true;
            }
        })

        this.myOrdersSubscribe = this.actionsSubj
            .pipe(filter((action: SetMyOrdersAction) => action.type === SET_MY_ORDERS))
            .pipe(filter((res: SetMyOrdersAction) => res && res.orders !== null))
            .pipe(filter((res: SetMyOrdersAction) => res && res.orders !== undefined))
            .subscribe((res: SetMyOrdersAction) => {
                this.myOrders = res.orders;
            });

        this.messageSubs = this.actionsSubj
            .pipe(filter((action: SetLastMessagesAction) => action.type === SET_LAST_MESSAGES))
            .subscribe((res: SetLastMessagesAction) => {
                this.messageNotificationStatus = true;
            });
        this.firstEnter();
        this.configureInSale(); 
    }

    deepLink() {
        this.storage.get('deeplink')
            .then((deeplinkStorage) => {
                let deepLinkData = JSON.parse(deeplinkStorage);
                if (deepLinkData['producto']) {
                    if (this.shops.length > 1) this.isDeepMultiShops = true;
                    this.mostrarModal();
                }
            })
            .catch(err => {
            });
    }

    onOfertas() {
        this.loadOffer = true;
        if (this.statusDeep) {
            this.deepLink();
            this.statusDeep = false;
        }
    }

    configureInSale() {
        this.storage.get('CashRegisterInSale').then(response => {
            if (response === null) {
                const InSale = new CashRegisterInSaleAction(true, false);
                this.storeInSale.dispatch(InSale);
            }
        });
    }
    // para borrar cache de lista de clientes (chulito verde pedidos de 8 días)
    async firstEnter() {
        await this.storage.get('client_list').then(success => {
            let fech = new Date().getDate();
            if (success) {
                if (success != "d_" + fech) {
                    this.refreshHard(fech);
                } else {
                    this.loadingController.getTop().then(loading => {
                        if (loading) {
                            this.store.dispatch(new LoadingOff());
                        }
                    });
                }
            } else {
                this.refreshHard(fech);
            }
        });
    }

    async goMyQR() {
        if (this.user.tiendas.length > 1) {
            this.openModalShopSelection(this.user.tiendas, 'mi-codigo');
            return;
        }
        this.navigation.goToBack('mi-codigo', {shop: <Shop>this.shopSel});
    }

    requestAgain(order) {
        const productos_disponibles = (order.productos_disponibles) ? (order.productos_disponibles) : [];

        if (productos_disponibles.length === 0 || !order.codigo_cliente) {
            this.store.dispatch(new Fail({mensaje: 'Todos los productos de este pedido no se encuentran disponibles'}));
            setTimeout(() => {
                this.store.dispatch(new LoadingOff());
            }, 300);
            return;
        }

        if (productos_disponibles.length < order.productos.length) {
            order.productos = order.productos.filter((product) => {
                return productos_disponibles.indexOf(product.id) > -1;
            });
            this.presentAlertOrder(order);
            return;
        }

        this.assignProducts(order);
    }

    private async presentAlertOrder(order) {
        const alert = await this.alertController.create({
            header: `¡Atención!`,
            message: `Hay productos que no se encuentran disponibles`,
            cssClass: 'attention-alert',
            buttons: [
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.assignProducts(order);
                    }
                }
            ]
        });

        return await alert.present();
    }

    private assignProducts(order) {
        let shop = this.shopSingletonService.getSelectedShop();
        const productsObj = {};
        const orderProducts = order.productos;
        orderProducts.reduce(function (acc, cur, i) {
            productsObj[cur.id] = cur;
            return acc;
        }, {});


        /* if (this.shopSel.codigo_cliente) {
            res = this.utilities.orderStorage(res, this.shopSel, true);
        } else {
            res = this.utilities.orderStorageWithoutCode(res, this.shopSel, true);
        } */
        shop.productos_seleccionados = productsObj;
        this.shopSingletonService.setSelectedShop(shop);
        this.shopSingletonService.setStorageSelectedShop(shop);
        this.store.dispatch(new FilterProductsAction(shop.productos_seleccionados, false));
        this.abrirCarrito();
    }

    refreshHard(fech) {
        let userData = null;

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
            .then((user) => {
                userData = user;
                return this.storage.clear();
            })
            .then(() => {
                return this.storage.set('user', userData);
            })
            .then(() => {
                return this.storage.set('client_list', 'd_' + fech);
            })
            .then(() => {
                this.store.dispatch(new RefreshUserAction(dataLogin));
            });
    }

    ionViewDidEnter() {
        this.isDeepMultiShops = false;
        document.addEventListener('backbutton', function (e) {
            // //console.log('disable back button');
        }, false);
    }

    goToSetOrder() {
        this.store.dispatch(new LoadingOn());
        this.analyticsService.sendEvent('pedidos_ofertas', { event_category: 'funnel_1', event_label: 'pedidos_ofertas' });

        this.navigation.goToBack('pedidos');

    }
    goToInternal() {
        this.navigation.goToBack('wysiwyg-banner');
    }

    goToInsurance() {
        this.analyticsService.sendEvent('seguros', { 'event_category': 'seguros', 'event_label': 'home_seguros' });
        this.navigation.goToBack('seguros-home');
    }

    goToCashRegister() {
        this.navigation.goToBack('caja-registradora');
    }
    goToHelpTree() {
        this.navigation.goToBack('first-step');
    }


    goMobileCharge() {
        this.analyticsService.sendEvent('sec_recargas_moviles_tendero', { 'event_category': 'menu_principal', 'event_label': 'sec_recargas_moviles_tendero' });
        this.navigation.goToBack('recargas');
    }

    goToIndicators() {
        this.analyticsService.sendEvent('sec_res_indicadores', { 'event_category': 'menu_principal', 'event_label': 'sec_res_indicadores' });
        this.navigation.goToBack('indicadores');
    }

    goCommunity() {
        this.analyticsService.sendEvent('sec_comunidad_tendero', { 'event_category': 'menu_principal', 'event_label': 'sec_comunidad_tendero' });
        this.navigation.goToBack('comunidad-tenderos');
    }

    goSurveys() {
        this.analyticsService.sendEvent('sec_concursos', {
            'event_category': 'seccion_menu_principal', 'event_label': 'concursos_' + this.user.role});
        this.navigation.goToBack('encuestas', {shop: <Shop>this.shopSel});
    }

    goToHelpCenter() {
        this.analyticsService.sendEvent('sec_cen_ayuda_tendero', { 'event_category': 'menu_principal', 'event_label': 'sec_cen_ayuda_tendero' });
        this.navigation.goToBack('preguntas-frecuentes');
    }

    goMyOrders() {
        if (this.user.tiendas.length > 1) {
            this.openModalShopSelection(this.user.tiendas, 'mis-pedidos');
            return;
        }
        this.navigation.goToBack('mis-pedidos', {shop: <Shop>this.shopSel});
    }

    goToBalance() {
        this.navigation.goToBack('historial-recargas');
    }



    finishUbication() {
        const shop = new Shop(this.shopSel);
        this.store.dispatch(new SetOrderShopAction(new Order({ tienda: shop })));
        this.store.dispatch(new LoadingOn());
        setTimeout(() => {
            this.navigation.goToBack('pedidos');
        }, 300);
    }

    eventPounts() {
        if (this.user.tiendas.length > 1) {
            this.openModalShopSelection(this.user.tiendas);
            return;
        }
        this.navigation.goToBack('puntos', { shop: this.shopSel });
    }

    private init() {
        this.titlebutton = (this.shops.length === 1) ? '' : 'Ver Puntos';
        this.thingState = 'start';

        if (this.offerComponent) {
            this.offerComponent.ngOnInit();
        }

        this.storage.get('order').then(res => {
            if (res) {
                this.ordersService.countSelectedProducts().then(count => this.nProducts = count);
                this.cashRegisterServices.getOrderValue((success) => {
                    this.orderValue = success;
                });
            }
            res = JSON.parse(res);
            let message = 'Recuerde, tiene pedido pendiente en :';
            let send = false;
            if (res && res.length > 1) {
                res.forEach((element, index, object) => {
                    if (element.productos_seleccionados != null && Object.keys(element.productos_seleccionados).length != 0) {
                        message = message + ' ' + element.nombre;
                        send = true;
                    }
                });
            } else if (res && res[0] != null && res[0].productos_seleccionados != null && Object.keys(res[0].productos_seleccionados).length != 0) {
                send = true;
                message = 'Tiene un pedido pendiente por enviar.';
            }

            if (!res || res.length == 0 || !res[0].status_productos_pendientes || !res[0].productos_seleccionados || Object.keys(res[0].productos_seleccionados).length == 0) {
                this.store.dispatch(new GetOrderAction(this.user.token, this.shopSel.id, () => {
                    this.ordersService.countSelectedProducts().then(count => this.nProducts = count);
                    this.cashRegisterServices.getOrderValue((success) => this.orderValue = success);
                }, this.shopSel.codigo_cliente));
            }
        });

        if (this.shops.length === 1) {
            this.store.dispatch(new GetOnlyPointsAction(this.user.token, this.shopSel.id));

            this.pointsSubs = this.actionsSubj
                .pipe(filter((action: SetOnlyPointsAction) => action.type === SET_ONLY_POINTS))
                .subscribe(res => {
                    this.titlebutton = res.points.puntaje_total + '';
                });
        }

        let a = this.store.dispatch(new GetFavoritesOrders(this.shopSel.id, this.user.token,1));
        this.actionsCountProductsOrder = this.actionsSubj
            .pipe(filter((res: CountProductsOrderAction) => res.type === COUNT_PRODUCTS_ORDER))
            .subscribe((res) => {
                let lastnProducts = this.nProducts;
                this.animateThing();
                this.nProducts = res.nProducts;

                this.cashRegisterServices.getOrderValue((success) => {
                    this.orderValue = success;
                });

                //poner punto rojo en la burbuja
                this.cashRegisterServices.setRedPointBaloon(active => {
                    if (lastnProducts != 0 && lastnProducts != this.nProducts) {
                        this.hasEdit = active;
                    }
                });
            });

        this.store.dispatch(new GetBalanceAction(this.user.token));
        //this.store.dispatch(new GetLastMessagesAction(this.user.token));
    }

    private async openModalShopSelection(shops: Shop[], url: string = 'puntos') {
        const modal = await this.modalController.create(<any>{
            component: CompartidoSeleccionTiendaComponent,
            cssClass: 'filter-modal',
            componentProps: { shops: shops }
        });

        modal.onDidDismiss().then(res => {
            if (!res.data) {
                return;
            }
            this.store.dispatch(new LoadingOn());
            this.shopSingletonService.setSelectedShop(res.data.shop);
            this.shopSel = this.shopSingletonService.getSelectedShop();
            this.navigation.goToBack(url, { shop: <Shop>res.data.shop });
        });

        return await modal.present();
    }

    async mostrarModal() {
        this.analyticsService.sendEvent('sec_pedido_ofertas', { 'event_category': 'menu_principal', 'event_label': 'sec_pedido_ofertas' });
        if (this.shops.length === 1) {
            if (!this.shopSel.direccion) {
                this.capturaUbicacion();
                return;
            }

            const shop = new Shop(this.shopSel);
            this.store.dispatch(new SetOrderShopAction(new Order({ tiendas: [shop] })));
            this.saveShopsStorage(shop);
            this.store.dispatch(new LoadingOn());
            this.navigation.goToBack('pedidos');

            return;
        }

        const modal = await this.modalController.create(<ModalOptions>{
            component: CompartidoSeleccionTiendaComponent,
            cssClass: 'filter-modal',
            componentProps: { shops: this.shops }
        });


        modal.onDidDismiss().then(async (res) => {
            if (!res.data) {
                return;
            }

            if (res.data.shop) {
                const shop = new Shop(res.data.shop);

                this.store.dispatch(new GetOrderAction(this.user.token, shop.id, () => {

                    this.ordersService.countSelectedProducts().then(count => {
                       
                        this.nProducts = count});
                    this.cashRegisterServices.getOrderValue((success) => this.orderValue = success);
                }, shop.codigo_cliente));

                this.store.dispatch(new SetOrderShopAction(new Order({ tiendas: [shop] })));
                await this.saveShopsStorage(shop);
                if (!res.data.shop.direccion) {
                    this.capturaUbicacion();
                    return;
                }
                this.store.dispatch(new LoadingOn());
                this.navigation.goToBack('pedidos');
            }
        });

        return await modal.present();
    }

    async capturaUbicacion() {
        this.user.tiendas = this.utilities.organizeShopsBySelected(this.shops);
        if (this.shopSel && (!this.shopSel.tienda_tipologia_id || !this.shopSel.estrato)) {
            this.user.slideRegister = (!this.shopSel.estrato) ? 2 : 3;
            this.storage.set('auth-user-update', JSON.stringify(this.user)).then(() => {
                this.navigation.goToBack('registro');
                this.store.dispatch(new LoadingOff());
            });
            return;
        }

        const modal = await this.modalController.create(<ModalOptions>{
            component: RegistroCapturaUbicacionComponent,
            componentProps: { user: this.user }
        });

        modal.onDidDismiss().then((data) => {
            if (data.data.finishProcess) {
                this.finishUbication();
            }
        });

        return await modal.present();
    }

    ngOnDestroy() {
        this.deepSubscribe.unsubscribe();
        this.unsubs();
        this.user = null;
    }

    ionViewDidLeave() {
        this.unsubs();
        this.user = null;
    }

    openFavoriteOrders() {
        this.analyticsService.sendEvent('sec_ver_ped_sugerido', { 'event_category': 'ver_pedido_sugerido_tendero', 'event_label': 'ver_pedido_sugerido_tendero' });
        this.navigation.goToBack('pedidos-anteriores', {
            shop: this.shopSel,
            favoriteOrders: this.favoriteOrders
        });
    }

    async eventHeader() {
        this.store.dispatch(new LoadingOn());
        this.offerComponent.ngOnDestroy();
        this.offerComponent.clearCompanies();
        this.user = new UserBuilder(JSON.parse(await this.storage.get('user'))).getUser();
        this.init();
    }

    private saveShopsStorage(shop: Shop) {
        return this.storage.get('order').then(async (res) => {
            res = this.utilities.orderStorage(res, shop, true);
            if (!this.isDeepMultiShops) {
                this.shops = this.utilities.organizeShopsBySelected(this.shops, shop);
            } else {
                this.isDeepMultiShops = false;
            }
            this.user.tiendas = this.shops;
            await this.storage.set('user', JSON.stringify(this.user));
            this.shopSingletonService.setSelectedShop(shop);
            this.shopSingletonService.setStorageSelectedShop(shop);
        });
    }

    async presentAlert(message) {
        let alert;
        if (this.shops.length === 1) {
            alert = await this.alertController.create({
                header: 'Atención',
                message: message,
                buttons: [
                    {
                        text: 'Seguir',
                        handler: () => {
                        }
                    },
                    {
                        text: 'Ver Pedido',
                        handler: () => {
                            const shop = new Shop(this.shopSel);
                            this.store.dispatch(new SetOrderShopAction(new Order({ tiendas: [shop] })));
                            this.saveShopsStorage(shop);
                            this.store.dispatch(new LoadingOn());//
                            this.navigation.goToBack('pedidos', { openKart: true });
                        }
                    }
                ],
                cssClass: 'attention-alert',
            });
        } else {
            alert = await this.alertController.create({
                header: 'Atención',
                message: message,
                buttons: ['Aceptar'],
                cssClass: 'attention-alert',
            });
        }
        return await alert.present();
    }

    public animateThing(): void {
        this.thingState = 'end';
        setTimeout(() => {
            this.thingState = 'start';
        }, 200);
    }

    async abrirCarrito() {
        const modal = await this.modalController.create(<any>{
            component: GeneralCarritoComprasComponent,
            backdropDismiss: false,
            cssClass: 'shopping-cart',
            componentProps: {
                shopData: this.shopSel,
                edit: this.hasEdit,
                user: this.user
            }
        });

        modal.onDidDismiss().then((res) => {
            if (!res) {
                return;
            }

            if (!res.data) {
                return;
            }

            if (res.data === true) {
                this.init();
            }
        });

        return await modal.present();
    }

    activeBadge(active: boolean) {
        this.badge = active;
    }

    goCartera(shop?) {
        if(shop != null){
            this.navigation.goToBack('cartera',shop);    
        }else{
            this.navigation.goToBack('cartera',{shops:this.shops, user: this.user.role});    
        }
    }

    async selectShop() {
        //this.analyticsService.sendEvent('sec_pedido_ofertas', { 'event_category': 'menu_principal', 'event_label': 'sec_pedido_ofertas' });
        if (this.shops.length === 1) {
            let shopC: any = this.shops[0];
            let distriShop = shopC.tiendas_distribuidores[0];
            let merge = { ...shopC, ...distriShop };
            const shop = new Shop(merge);
            this.goCartera(shop);
            return;
        }

        const modal = await this.modalController.create(<ModalOptions>{
            component: CompartidoSeleccionTiendaComponent,
            cssClass: 'filter-modal',
            componentProps: { shops: this.shops }
        });


        modal.onDidDismiss().then(async (res) => {
            if (!res.data) {
                return;
            }

            if (res.data.shop) {
                let distriShop = res.data.shop.tiendas_distribuidores[0];
                let merge = { ...res.data.shop, ...distriShop };
                const shop = new Shop(merge);
                this.goCartera(shop);
            }
        });

        return await modal.present();
    }

    checkCartera(){
        let s: any = this.shops;
        let deudor = false;
        s.forEach(element => {
            element.tiendas_distribuidores.forEach(elem => {
                if (elem.saldo !== null && elem.cupo_credito !== null && elem.plazo_pago !== null){
                    deudor = true;
                }
            });
        });
        return deudor;
    }

    getMora(){
        let r: any = {
            saldo: 0,
            mora: 0
        }
        this.shops.forEach((shop:any) =>{
            shop.tiendas_distribuidores.forEach(distris => {
                let split = (distris.saldo !== null) ? distris.saldo.split('[') : [];
                if (split.length > 0) {
                    r.saldo += split[0];
                    r.mora += (split[1]) ? split[1].replace("]", "") : 0;
                }
            });
        });
        return r.mora;
    }
    private unsubs() {
        this.myOrdersSubscribe.unsubscribe();
        this.balanceSubs.unsubscribe();
        this.messageSubs.unsubscribe();
        this.favoriteOrdersSubs.unsubscribe();
        this.pointsSubs.unsubscribe();
        this.offerComponent.ngOnDestroy();
        this.actionsCountProductsOrder.unsubscribe();
        this.refreshObs.unsubscribe();
        this.accountSubs.unsubscribe();
    }

    goCreditsList() {
        this.navigation.goToBack("lista-creditos");
    }
}
