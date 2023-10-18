import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {ActivatedRoute, Router, NavigationExtras} from '@angular/router';
import {Storage} from '@ionic/storage';
import {Shop} from 'src/app/models/Shop';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {GetDropSizeAction, SET_DROP_SIZE, SetDropSizeAction} from '../../store/mis-clientes.actions';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {
    COUNT_PRODUCTS_ORDER,
    CountProductsOrderAction,
    GetFavoritesOrders,
    SET_FAVORITES_ORDERS,
    SetFavoritesOrders
} from '../../../../compartido/pedidos/store/orders.actions';
import {Seller} from '../../../../../models/Seller';
import {Order} from '../../../../../models/Order';
import {ModalController, LoadingController} from '@ionic/angular';
import {jumpAnimation} from '../../../../../animations/jump.animation';
import {
    GeneralCarritoComprasComponent
} from '../../../../compartido/general/components/general-carrito-compras/general-carrito-compras.component';
import { OrdersService } from 'src/app/services/orders/orders.service';
import { CashRegisterService } from 'src/app/services/orders/cash-register.service';

import * as fromOfflineActions from '../../../compartido/components/compartido-menu-vendedor/store/actions/offline.actions';
import { Roles } from 'src/app/enums/roles.enum';
import {SET_OFFLINE_DYNAMIC, SetOfflineDynamicAction} from '../../../compartido/store/offlineDynamic/offlineDynamic.actions';
import {CacheService} from 'ionic-cache';
import {AnalyticsService} from '../../../../../services/analytics/analytics.service';
import { SuperSellerService } from 'src/app/services/users/super-seller.service';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';
import {CrearClienteCapturaUbicacionComponent} from '../../../crear-cliente/components/crear-cliente-captura-ubicacion/crear-cliente-captura-ubicacion.component';
import {MisClientesCapturaUbicacionComponent} from './componentes/mis-clientes-captura-ubicacion/mis-clientes-captura-ubicacion.component';

const meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
const currentDate=new Date();

@Component({
    selector: 'app-detalle-cliente',
    templateUrl: './detalle-cliente.page.html',
    styleUrls: ['./detalle-cliente.page.scss'],
    animations: [jumpAnimation]
})
export class DetalleClientePage implements OnInit, OnDestroy {

    public shop: Shop;
    public dropSize: {
        pedido_promedio: any,
        cumplimiento_pedido_promedio: any,
        frecuencia_pedido: any,
        cumplimiento_frecuencia_pedido: any,
        referencia_promedio: any,
        cumplimiento_referencia_promedio: any,
        puntos?: number
    };
    public favoriteOrders: Order[];
    public nProducts = 0;
    public thingState: string;

    public user: Seller;
    public offlineDynamic: boolean;
    private subsDropSize = new Subscription();
    private subsOfflineDynamic = new Subscription();
    private favoriteOrdersSubs = new Subscription();
    public actionsCountProductsOrder = new Subscription();
    public offlineSubs = new Subscription();

    public hasEdit = false;
    public badge = false;
    public hasAddress = true;

    orderValue: any;
    isOfflineActive: boolean;
    month = meses[currentDate.getMonth()];
    lastMonth = (currentDate.getMonth() == 0) ? meses[11]: meses[currentDate.getMonth()-1];

    constructor(private navigation: NavigationHelper,
                private route: ActivatedRoute,
                private router: Router,
                private storage: Storage,
                private store: Store<AppState>,
                private actionsS: ActionsSubject,
                private modalController: ModalController,
                private ordersService: OrdersService,
                private loadingController: LoadingController,
                private actionsObj: ActionsSubject,
                private cashRegisterServices: CashRegisterService,
                private cache: CacheService,
                private analyticsService: AnalyticsService,
                public shopSingletonService: ShopSingletonService,
                public superSellerService: SuperSellerService,
                private util: UtilitiesHelper) {

        this.thingState = 'start';
        this.user = this.route.snapshot.data['user'];
        this.shop = this.shopSingletonService.getSelectedShop();

        this.loadingController.getTop().then(loading => {
            if (!loading) {
                this.store.dispatch(new LoadingOn());
            }
        });

        this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];

        this.route.queryParams.subscribe(params => {
            this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];
 

            if (this.shop && this.shop.offline === true) {
                this.isOfflineActive = true;
            } 

            if ((this.shop.latitud == '' || this.shop.latitud == '-1') && (this.shop.longitud == '' || this.shop.longitud == '-1')) {
                this.hasAddress = false;
            }

            if (!this.isOfflineActive && !this.offlineDynamic) {
                setTimeout(() => this.ordersService.countSelectedProducts().then(count => this.nProducts = count) , 500);
            }

            if (!this.isOfflineActive && !this.offlineDynamic) {
                this.store.dispatch(new GetDropSizeAction(this.user.token, this.shop));
                if (this.user.compania && this.user.compania.id) {
                    this.store.dispatch(new GetFavoritesOrders(this.shop.id, this.user.token, this.user.compania.id));
                }
            } else {
                this.loadingController.getTop().then(loading => {
                    if (loading) {
                        this.store.dispatch(new LoadingOff());
                    }
                });
            }
        });

        this.subsDropSize = this.actionsS
            .pipe( filter(res => res.type === SET_DROP_SIZE) )
            .subscribe((res: SetDropSizeAction) => {
                this.dropSize = res.dropSize;
                this.badge = (res.dropSize.concursos_nuevos !== undefined && res.dropSize.concursos_nuevos > 0);
                this.loadingController.getTop().then(loading => {
                    if (loading) {
                        this.store.dispatch(new LoadingOff());
                    }
                });
            });

        this.subsOfflineDynamic = this.actionsS
            .pipe( filter(res => res.type === SET_OFFLINE_DYNAMIC))
            .subscribe((res: SetOfflineDynamicAction) => {
                this.offlineDynamic = res.on;
                this.cache.saveItem('offlineDynamic', true, 'offlineDynamic', 600);
                this.loadingController.getTop().then(loading => {
                    if (loading) {
                        this.store.dispatch(new LoadingOff());
                    }
                });
            });

        this.favoriteOrdersSubs = this.actionsS
            .pipe( filter(res => res.type === SET_FAVORITES_ORDERS) )
            .subscribe((res: SetFavoritesOrders) => {
                this.favoriteOrders = res.orders;
                //console.log("acccccaaaaaa");
                if (!this.isOfflineActive && !this.offlineDynamic) {
                    this.store.dispatch(new LoadingOff());
                }
            });

        this.actionsCountProductsOrder = this.actionsObj
            .pipe(filter((res: CountProductsOrderAction) => res.type === COUNT_PRODUCTS_ORDER))
            .subscribe((res) => {
                let lastnProducts = this.nProducts;
                this.nProducts = res.nProducts;
                this.cashRegisterServices.getOrderValue((success) => {
                    this.orderValue = success;
                });
                this.shop = this.shopSingletonService.getSelectedShop();

                //poner punto rojo en la burbuja 
                this.cashRegisterServices.setRedPointBaloon(active => {
                   // if (lastnProducts != 0 && lastnProducts != this.nProducts) {
                        this.hasEdit = active;
                    //}
                });

            });
    }

    ionViewWillEnter() {
        console.log(this.shop,"tienda");
        //punto rojo carrito
        this.cashRegisterServices.checkAlredyOrder(active => {
            if (active) {
                this.hasEdit = active;
            }
        }); 
        this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];
        this.offlineSubs = this.store.select('offline').subscribe(success => {
            this.isOfflineActive = success.active;
        });

        if (this.isOfflineActive == undefined) {
            const action = new fromOfflineActions.ToggleOfflineAction(false);
            this.store.dispatch(action);
        }
    }

    ngOnInit() {
        this.cashRegisterServices.getOrderValue((success) => {
            this.orderValue = success;
        });
    }

    firstProductsSelected() {
        if (!this.shop || (!this.shop.productos_seleccionados && !this.shop.pedido)) {
            return {pedido: undefined};
        }
        let res = [];
        if (this.shop.productos_seleccionados) {
            res = Object.keys(this.shop.productos_seleccionados);
        }

        if (res.length > 0) {
            return this.shop.productos_seleccionados[res[0]];
        } else {
            if (this.shop.pedido) {
                return {pedido: this.shop.pedido};
            } else {
                return {pedido: undefined};
            }
        }
    }

    goAssignClient() {
        this.navigation.goToBack('asignar-cliente', this.shop);
    }

    marcas() {
        this.navigation.goToBack('marcas-clientes', this.shop);
    }

    createOrder() {
        this.navigation.noPurchase = true;

        if (this.isOfflineActive) {
            this.navigation.goToBack('marcas-clientes', this.shop);
            return;
        }

        this.cashRegisterServices.updateShopeName(this.shop.nombre_tienda);
        if (!this.hasAddress && this.user.transportador) {
            this.util.alertOrderOnlyAcceptHandle('Para continuar debes agregar la dirección de la tienda', async () => {
                this.createModal();
            });
            return;
        }

        if (this.user.role == Roles.seller) {
            this.navigation.goToBack('marcas-clientes', this.shop);
        } else {
            this.navigation.goToBack('compania', this.shop);
        }
    }

    goCartera() {
        console.log(this.shop,"lo que se envia");
        this.navigation.goToBack('cartera', this.shop);
    }

    setBalance() {
        this.navigation.goToBack('asignar-saldo', this.shop);
    }

    goNopedido() {
        const shop: any = this.shop;
        shop.token = this.user.token;
        const navigationExtras: NavigationExtras = {
            state: {
                shop: shop
            }
        };
        this.router.navigate(['details'], navigationExtras);
        this.navigation.goToBack('no-pedido', { shop: this.shop});
    }

    goRecord() {
        this.navigation.goToBack('mis-pedidos', {shop: this.shop});
    }

    goReturn() {
        this.navigation.goToBack('devoluciones', {
            shop: this.shop,
            orderValue: this.orderValue,
            pedido_id: this.firstProductsSelected().pedido
        });
    }

    goSurveys() {
        this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];
        this.shop.offline = this.offlineDynamic;
        this.navigation.goToBack('encuestas', {
            shop_id: this.shop.id,
            shop: this.shop,
            detalle_cliente: true,
            codigo_cliente: this.shop.codigo_cliente
        });

        this.analyticsService.sendEvent('sec_ver_consursos', {
            'event_category': 'ver_consursos', 'event_label': 'sec_ver_consursos_' + this.user.distribuidor.id
        });
    }

    justBack() {
        this.navigation.justBack();
    }

    ngOnDestroy() {
        this.subsDropSize.unsubscribe();
        this.favoriteOrdersSubs.unsubscribe();
        this.subsOfflineDynamic.unsubscribe();
        this.offlineSubs.unsubscribe();
    }

    openFavoriteOrders() {
        this.navigation.goToBack('pedidos-anteriores', {
            shop: this.shop,
            favoriteOrders: this.favoriteOrders
        });
    }

    async abrirCarrito() {
        const modal = await this.modalController.create(<any>{
            component: GeneralCarritoComprasComponent,
            backdropDismiss: false,
            cssClass: 'shopping-cart',
            componentProps: {
                shopData: this.shop,
                offlineDynamic: this.offlineDynamic,
                edit: this.hasEdit,
                user: this.user
            }
        });

        return await modal.present();
    }

    public animateThing(): void {
        this.thingState = 'end';
        setTimeout(() => {
            this.thingState = 'start';
        }, 200);
    }

    goUpdateData() {
        this.navigation.goToBack('actualizar-datos', {
            shop: this.shop,
        });
    }

    getMora(){
        let split = (this.shop.saldo !== null) ? this.shop.saldo.split('[') : [];
        let r:any = {
            saldo: 0,
            mora: 0
        }
        r.saldo = split[0];
        if (split.length > 1) {
            r.mora = split[1].replace("]", "");
        }

        return r.saldo;
    }
    async createModal() {
        const modal = await this.modalController.create(<any>{
            component: MisClientesCapturaUbicacionComponent,
            componentProps: {
                seller: this.user,
                shop: this.shop
            }
        });

        modal.onDidDismiss().then(() => {
            this.storage.get('order').then(async (res) => {
                res = JSON.parse(res);
                res[0].direccion = this.shop.direccion;
                res[0].latitud = this.shop.latitud;
                res[0].longitud = this.shop.longitud;
                res[0].descripcion_direccion = this.shop.descripcion_direccion;
                res[0].ciuad_nombre = this.shop.ciudad_nombre;

                this.hasAddress = true;

                await this.storage.set('order', JSON.stringify(res));
            });
        });

        return modal.present();
    }
}
