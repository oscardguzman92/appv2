import {Component, OnInit, ViewChildren, QueryList, ViewChild, OnDestroy} from '@angular/core';
import {GeneralCarritoComprasComponent} from 'src/app/modules/compartido/general/components/general-carrito-compras/general-carrito-compras.component';
import {LoadingController, ModalController, IonInfiniteScroll} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {Shop} from 'src/app/models/Shop';
import {CashRegisterService} from 'src/app/services/orders/cash-register.service';
import {of, Subscription} from 'rxjs';
import {ActionsSubject, Store} from '@ngrx/store';
import {filter} from 'rxjs/operators';
import {
    CountProductsOrderAction,
    COUNT_PRODUCTS_ORDER, FilterProductsAction
} from 'src/app/modules/compartido/pedidos/store/orders.actions';
import {UtilitiesHelper} from 'src/app/helpers/utilities/utilities.helper';
import {jumpAnimation} from 'src/app/animations/jump.animation';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {LoadingOn, LoadingOff} from 'src/app/modules/compartido/general/store/actions/loading.actions';
import {AppState} from 'src/app/store/app.reducer';
import {GetProductosOfflineService} from '../../../../../services/offline/get-productos-offline.service';
import {ActivatedRoute, Router} from '@angular/router';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import {IUser} from '../../../../../interfaces/IUser';

@Component({
    selector: 'app-lista-productos-offline',
    templateUrl: './lista-productos-offline.page.html',
    styleUrls: ['./lista-productos-offline.page.scss'],
    animations: [jumpAnimation]
})
export class ListaProductosOfflinePage implements OnInit, OnDestroy {
    public thingState: string;
    public search: any;
    public nProducts = 0;
    public offlineDynamic: boolean
    public dataOnlySearch: {
        isOnlySearch: boolean;
        search: string;
    } = {
        isOnlySearch: false,
        search: ''
    };
    public shopData: Shop;
    public orderValue: any;
    public actionsCountProductsOrder = new Subscription();
    public showButtonBarcode: boolean;
    public products: Array<any> = [];
    public productsTemp = [];
    @ViewChild('containerCards') container: any;
    serching: boolean;
    public user: IUser;

    constructor(
        private modal: ModalController,
        private storage: Storage,
        private actionsObj: ActionsSubject,
        private helper: UtilitiesHelper,
        private cashRegisterServices: CashRegisterService,
        private navigation: NavigationHelper,
        private store: Store<AppState>,
        private getProductosOffline: GetProductosOfflineService,
        private route: ActivatedRoute,
        private router: Router,
        private loadingController: LoadingController,
        public shopSingletonService: ShopSingletonService,
    ) {
        this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];
        this.user = this.route.snapshot.data['user'];
        this.route.queryParams.subscribe(params => {
            this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];
            if (this.router.getCurrentNavigation().extras.state) {
                const data = this.router.getCurrentNavigation().extras.state.data;
                if (data.action === 'search') {
                    this.dataOnlySearch.isOnlySearch = true;
                    this.dataOnlySearch.search = data.search;
                    this.search = data.search;
                }

                if (data.productos) {
                    this.products = data.productos.map(prod => {
                        return this.parseProduct(prod);
                    });
                    this.productsTemp = this.products;
                    this.loadingController.getTop().then(loading => {
                        if (loading) {
                            this.store.dispatch(new LoadingOff());
                        }
                    });
                }
            }
        });
    }

    ngOnInit() {
        this.cashRegisterServices.getOrderValue(success => {
            this.orderValue = success;
        });

        this.shopData = this.shopSingletonService.getSelectedShop();

        if (this.dataOnlySearch.isOnlySearch) {
            this.searchProducts(this.search);
        }
        if (this.shopData && this.shopData.productos_seleccionados) {
            this.store.dispatch(new FilterProductsAction(this.shopData.productos_seleccionados));
        }

        this.actionsCountProductsOrder = this.actionsObj
            .pipe(
                filter(
                    (res: CountProductsOrderAction) => res.type === COUNT_PRODUCTS_ORDER
                )
            )
            .subscribe(res => {
                this.animateThing();
                this.nProducts = res.nProducts;
                this.cashRegisterServices.getOrderValue(success => {
                    this.orderValue = success;
                });
            });
    }

    ionViewWillEnter() {
        this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];
    }

    justBack() {
        if (this.offlineDynamic) {
            this.navigation.justBack();
            return;
        }

        this.navigation.goToBack('detalle-cliente', this.shopData);
    }

    public animateThing(): void {
        this.thingState = 'end';
        setTimeout(() => {
            this.thingState = 'start';
        }, 200);
    }

    keyup(event) {
        let s = event.toString();
        if (s.length == 0) {
            this.products = this.productsTemp;
            return;
        }

        if (s.length >= 3 && !this.serching) {
            this.searchProducts(s);
        }
    }

    searchProducts(search) {
        if (!this.serching && search.length >= 2) {
            this.serching = true;
            this.searchProductsoffline(search);
        }
    }

    async abrirCarrito() {
        const modal = await this.modal.create(<any>{
            component: GeneralCarritoComprasComponent,
            backdropDismiss: false,
            cssClass: 'shopping-cart',
            componentProps: {
                shopData: this.shopData,
                offlineDynamic: this.offlineDynamic,
                user: this.user
            }
        });

        return await modal.present();
    }

    objToArray(objs) {
        let res = [];
        for (const k in objs) {
            res.push(objs[k]);   
        }
        return res;
    }

    searchProductsoffline(term) {
        this.products = this.productsTemp.filter(producto => {
            const nameP = this.helper.getFullProductName(producto);
            if (nameP.toLowerCase().indexOf(term.toLowerCase()) !== -1 ||
                producto.cod_sap.toString().toLowerCase().indexOf(term.toString().toLowerCase()) !== -1 ||
                producto.cod_auxiliar.toString().toLowerCase().indexOf(term.toString().toLowerCase()) !== -1) {
                return producto;
            }
            return false;
        });
        this.serching = false;
    }

    getProductsOffline(idShop, term: any) {
        this.products = [];
        this.getProductosOffline.invoke().then(data => {
            if (!data.value) {
                this.serching = false;
                return;
            }
            //const r = JSON.parse(data.value);
            const r = data.value;
            const tiendas = r.tiendas;
            const productosStorage = r.productos;
            const ofertasStorage = r.ofertas;
            const preciosProductos = r.precios_productos;
            const ofertasEspeciales = r.ofertas_especiales;
            const lista_precio_tienda = tiendas[idShop].l_p;
            let productosOff = tiendas[idShop].productos;
            if (Array.isArray(productosOff) === false) {
                productosOff = this.objToArray(productosOff);
            }
            const productsFind = productosOff.filter(producto => {
                producto = this.helper.infoProduct(producto, productosStorage);
                const parsep = this.parseProduct(producto);
                const nameP = this.helper.getFullProductName(parsep);
                if (nameP.toLowerCase().indexOf(term.toLowerCase()) !== -1 ||
                    parsep.cod_sap.toString().toLowerCase().indexOf(term.toString().toLowerCase()) !== -1 ||
                    parsep.cod_auxiliar.toString().toLowerCase().indexOf(term.toString().toLowerCase()) !== -1) {
                    return parsep;
                }
                return false;
            });
            this.products = productsFind.map(prod => {
                return this.helper.infoProduct(prod, productosStorage);
            }).map((prod) => {
                if (prod.of && prod.of.length > 0) {
                    prod['of'] = this.helper.inforOffer(prod.of[0], ofertasStorage, lista_precio_tienda);
                    return prod;
                }
                return prod;
            }).map((prod) => {
                prod['p'] = this.helper.inforPrecio(prod, preciosProductos, lista_precio_tienda);
                return prod;
            }).map(prod => {
                return this.parseProduct(prod);
            }).map(prod => {
                if(prod.factor){
                    prod.factor_precio = (prod.precio_unitario)?prod.factor * prod.precio_unitario : prod.factor * prod.precio ;
                }
                prod['ofertas_reglas'] = this.helper.infoOfertasEspeciales(ofertasEspeciales, prod.producto_distribuidor_id, lista_precio_tienda);
                if(prod['ofertas_reglas'] && prod['ofertas_reglas'].length > 0 ){
                    prod['es_ofe_especial'] = 1;
                    prod['obsequio'] = null;
                }
                return prod;
            });
            this.serching = false;
        });
    }

    parseProduct(p) {
        p.c_a = (p.c_a && p.c_a != null) ? p.c_a : 0;
        const product = {
            cantidad: 0,
            cod_sap: p.c_s,
            codigo_disti: p.c_s,
            cod_auxiliar: p.c_a,
            compania_id: p.c_id,
            descripcion: '',
            descripcion_adicional: '',
            descuento: (p.p) ? p.p.d : null,
            distribuidor_id: p.id,
            ean: '',
            embalaje_unidad_venta: 0,
            id: p.id,
            imagenes: [],
            impoconsumo: (p.p) ? p.p.im : null,
            inventario: p.i,
            iva: (p.p) ? p.p.iv : null,
            marca: p.m,
            marca_id: null,
            multiplo_pedido: p.m_p,
            nombre: p.n_c,
            oferta_distribuidor: p.o_d,
            ofertas: p.of,
            ofertas_reglas: [],
            orden: 0,
            pedido_maximo: p.p_m,
            pedido_maximo_tienda: p.p_m_t,
            pedido_minimo: p.p_mi,
            pedidos: [],
            precio: (p.p) ? p.p.p : null,
            precio_unitario: (p.p) ? p.p.p_u : null,
            presentacion: '',
            prod_categorias: [],
            producto_distribuidor_id: p.pd_id,
            tamanio: '',
            total: 0,
            //unidad_medida: p.pd_unidad_medida,
            unidad_medida: p.pd_uni_me,
            valor: 0,
            valor_original: 0,
            valor_sugerido: '0.00',
            valor_unidad_venta: '0.00',
            variante: '',
            visible: 1,
            factor: (p.fac)?p.fac:null,
            factor_unidad: (p.fac_uni)?p.fac_uni:null,
            factor_precio: (p.factor_precio)?p.factor_precio:null,
            p_id: (p.p_id)?p.p_id:null,
        };
        return product;
    }

    focusEvent() {
        this.showButtonBarcode = true;
    }

    blurEvent() {
        this.showButtonBarcode = false;
    }

    ngOnDestroy() {
        this.productsTemp = [];
        this.products = [];
        this.actionsCountProductsOrder.unsubscribe();
    }
}
