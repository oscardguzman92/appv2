import {Component, OnDestroy, OnInit} from '@angular/core';
import {CashRegisterService} from 'src/app/services/orders/cash-register.service';
import {Router, ActivatedRoute} from '@angular/router';
import {Shop} from 'src/app/models/Shop';
import {Roles} from 'src/app/enums/roles.enum';
import {Storage} from '@ionic/storage';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {
    GetBrandsAction,
    SetBrandsAction,
    SET_BRANDS,
    CountProductsOrderAction,
    COUNT_PRODUCTS_ORDER
} from 'src/app/modules/compartido/pedidos/store/orders.actions';
import {Store, ActionsSubject} from '@ngrx/store';
import {AppState} from 'src/app/modules/tendero/pedidos/pages/pedidos/store/companies.reducer';
import {filter} from 'rxjs/operators';
import {
    LoadingOn,
    LoadingOff
} from 'src/app/modules/compartido/general/store/actions/loading.actions';
import {Subscription} from 'rxjs';
import {IBrand} from 'src/app/interfaces/IBrand';
import {AlertController, ModalController} from '@ionic/angular';
import {OrdersService} from 'src/app/services/orders/orders.service';
import {jumpAnimation} from 'src/app/animations/jump.animation';
import {GeneralCarritoComprasComponent} from 'src/app/modules/compartido/general/components/general-carrito-compras/general-carrito-compras.component';
import {GetProductosOfflineService} from '../../../../../services/offline/get-productos-offline.service';
import {GetMarcasProductosOfflineService} from '../../../../../services/offline/get-marcas-productos-offline.service';
import {GetProductosXMarcaOfflineService} from '../../../../../services/offline/get-productos-xmarca-offline.service';
import {SET_OFFLINE_DYNAMIC, SetOfflineDynamicAction} from '../../../compartido/store/offlineDynamic/offlineDynamic.actions';
import {CacheService} from 'ionic-cache';
import {GetOfertasOfflineService} from '../../../../../services/offline/get-ofertas-offline.service';
import {IProduct} from '../../../../../interfaces/IProduct';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import {GetInfoProductosOfflineService} from '../../../../../services/offline/get-info-productos-offline.service';

@Component({
    selector: 'app-marcas-clientes',
    templateUrl: './marcas-clientes.page.html',
    styleUrls: ['./marcas-clientes.page.scss'],
    animations: [jumpAnimation]
})
export class MarcasClientesPage implements OnInit, OnDestroy {
    public shop: Shop;
    public user: any;
    public nProducts = 0;
    public thingState: string;
    public offlineDynamic: boolean;
    public orderValue: any;
    public search: any;
    public distributor_id: any;
    public portafolio: any;
    public compania_id: any;
    public actionsBrands = new Subscription();
    public actionsCountProductsOrder = new Subscription();
    public brands: IBrand[] = [];
    public featuredProducts: IProduct[];
    private subsOfflineDynamic = new Subscription();
    public hasEdit: boolean = false;
    public productosOffline = [];
    public productosOfflineTiendas = [];
    public allProductsOffline = [];

    constructor(
        private cashRegisterServices: CashRegisterService,
        private storage: Storage,
        private router: Router,
        private route: ActivatedRoute,
        private navigation: NavigationHelper,
        private store: Store<AppState>,
        private actionsObj: ActionsSubject,
        private alertController: AlertController,
        private ordersService: OrdersService,
        private modalController: ModalController,
        private getProductsOffline: GetProductosOfflineService,
        private getMarcasProductosOffline: GetMarcasProductosOfflineService,
        private getProductosXMarca: GetProductosXMarcaOfflineService,
        private getOfertas: GetOfertasOfflineService,
        private cache: CacheService,
        public shopSingletonService: ShopSingletonService,
        public infoService: GetInfoProductosOfflineService,
    ) {
        this.thingState = 'start';
        this.user = this.route.snapshot.data['user'];
        this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];
        this.shop = this.shopSingletonService.getSelectedShop();
        if (!this.offlineDynamic) {
            this.offlineDynamic = (this.shop.offline === true);
        }
        setTimeout(
            () =>
                this.ordersService
                    .countSelectedProducts()
                    .then(count => (this.nProducts = count)),
            500
        );
    }

    ionViewWillEnter() {
        this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];
        if (!this.offlineDynamic) {
            this.offlineDynamic = (this.shop.offline === true);
        }
        this.cashRegisterServices.checkAlredyOrder(active=>{
            if(active){
                this.hasEdit=active;  
            }
        });
    }

    ngOnInit() {
        this.store.dispatch(new LoadingOn());
        this.distributor_id = this.user.distribuidor.id;
        this.actionsBrands = this.actionsObj
            .pipe(filter((res: SetBrandsAction) => res.type === SET_BRANDS))
            .subscribe(async res => {
                if (!res.brands || res.brands.length === 0) {
                    // Mostrar error de marcas y retornar
                    this.generalPropuseAlert('No hay marcas disponibles.');
                    this.justBack();
                } else {
                    this.brands = res.brands;
                    this.featuredProducts = res.featuredProducts;
                }
                this.store.dispatch(new LoadingOff());
            });

        this.subsOfflineDynamic = this.actionsObj
            .pipe( filter(res => res.type === SET_OFFLINE_DYNAMIC))
            .subscribe((res: SetOfflineDynamicAction) => {
                this.offlineDynamic = res.on;
                this.brandsFile();
                this.cache.saveItem('offlineDynamic', true, 'offlineDynamic', 600);
                this.store.dispatch(new LoadingOff());
            });

        this.cashRegisterServices.getOrderValue(success => {
            this.orderValue = success;
        });

        this.actionsCountProductsOrder = this.actionsObj
            .pipe(
                filter(
                    (res: CountProductsOrderAction) =>
                        res.type === COUNT_PRODUCTS_ORDER
                )
            )
            .subscribe(res => {
                let lastnProducts = this.nProducts;
                this.nProducts = res.nProducts;
                this.cashRegisterServices.getOrderValue(success => {
                    this.orderValue = success;
                });

                //poner punto rojo en la burbuja 
                this.cashRegisterServices.setRedPointBaloon(active => {
                    //if (lastnProducts != 0 && lastnProducts != this.nProducts) {
                        this.hasEdit = active;
                    //}
                });
            });

        if (!this.offlineDynamic) {
            this.getProducts();
        } else {
            this.brandsFile();
        }
    }

    selectBrand(brand: IBrand) {
        if (this.offlineDynamic) {
            this.store.dispatch(new LoadingOn());
            setTimeout(() => {
                this.getProductosXMarca.invoke(this.shop.id, brand.nombre)
                    .then((productos) => {
                        this.navigation.goToBack('lista-productos-offline', {productos: productos});
                    });
            }, 300);
            return;
        }
        this.navigation.goToBack('compania', {
            brand_id: brand.id,
            brand_name: brand.nombre,
            brand_list: this.brands,
            action: 'productsByBrands'
        });
    }

    selectOffert() {
        if (this.offlineDynamic) {
            this.store.dispatch(new LoadingOn());
            setTimeout(() => {
                this.getOfertas.invoke(this.shop.id)
                    .then((productos) => {
                        this.navigation.goToBack('lista-productos-offline', {productos: productos});
                    });
            }, 300);
            return;
        }
        this.navigation.goToBack('compania', {
            action: 'productstByOffer'
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

    justBack() {
        this.navigation.justBack();
    }

    async generalPropuseAlert(message: string) {
        let buttons = [
            {
                text: 'Aceptar',
                cssClass: '',
                role: 'cancel'
            }
        ];
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: buttons
        });
        await alert.present();
    }

    public animateThing(): void {
        this.thingState = 'end';
        setTimeout(() => {
            this.thingState = 'start';
        }, 200);
    }

    ngOnDestroy() {
        this.actionsBrands.unsubscribe();
        this.actionsCountProductsOrder.unsubscribe();
        this.productosOffline = [];
        this.productosOfflineTiendas = [];
        this.allProductsOffline = [];
    }

    getProducts() {
        this.store.dispatch(new GetBrandsAction(this.user.token, this.shop.id, this.distributor_id));
        this.productosOffline = [];
        this.productosOfflineTiendas = [];
        /*this.getProductsOffline.invoke()
            .then(data => {
                if (!data.value) {
                    return;
                }
                try {
                    const lista_precio_tienda = data.value.tiendas[this.shop.id].l_p;
                    const preciosProductos = data.value.precios_productos;
                    const ofertasStorage = data.value.ofertas;
                    this.productosOffline = data.value.productos;
                    this.productosOfflineTiendas = data.value.tiendas[this.shop.id].productos;
                    this.allProductsOffline = this.infoService.invoke(
                        lista_precio_tienda, this.productosOfflineTiendas, this.productosOffline,
                        preciosProductos, ofertasStorage
                    );
                } catch (e) {
                    this.productosOffline = [];
                    this.productosOfflineTiendas = [];
                    this.allProductsOffline = [];
                }
            }).catch(() => {
                this.store.dispatch(new GetBrandsAction(this.user.token, this.shop.id, this.distributor_id));
            });*/
    }

    private brandsFile() {
        this.getProductsOffline.invoke()
            .then(data => {
                if (!data.value) {
                    this.store.dispatch(new LoadingOff());
                    return;
                }
                const brands = this.getMarcasProductosOffline.invoke(data.value.productos);
                this.store.dispatch(new SetBrandsAction(brands));

                try {
                    const lista_precio_tienda = data.value.tiendas[this.shop.id].l_p;
                    const preciosProductos = data.value.precios_productos;
                    const ofertasStorage = data.value.ofertas;
                    this.productosOffline = data.value.productos;
                    this.productosOfflineTiendas = data.value.tiendas[this.shop.id].productos;
                    this.allProductsOffline = this.infoService.invoke(
                        lista_precio_tienda, this.productosOfflineTiendas, this.productosOffline,
                        preciosProductos, ofertasStorage
                    );
                } catch (e) {
                    this.productosOffline = [];
                    this.productosOfflineTiendas = [];
                    this.allProductsOffline = [];
                }

            }).catch(() => {
                this.store.dispatch(new LoadingOff());
            });
    }
}
