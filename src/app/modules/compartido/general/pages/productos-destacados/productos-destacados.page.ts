import {Component, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ActionsSubject, Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {IProduct} from '../../../../../interfaces/IProduct';
import {jumpAnimation} from '../../../../../animations/jump.animation';
import {GeneralCarritoComprasComponent} from '../../components/general-carrito-compras/general-carrito-compras.component';
import {
    COUNT_PRODUCTS_ORDER, CountProductsOrderAction, FilterProductsAction, COMPARE_PRODUCTS,
    CompareProducts
} from '../../../pedidos/store/orders.actions';
import {ICompany} from '../../../../../interfaces/ICompany';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {Storage} from '@ionic/storage';
import {OrdersService} from '../../../../../services/orders/orders.service';
import {AppState} from '../../store/reducers/offers.reducer';
import {filter, map} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {VibrateService} from 'src/app/services/vibrate/vibrate.service';
import {AlertController} from '@ionic/angular';
import {CashRegisterService} from '../../../../../services/orders/cash-register.service';
import {AnalyticsService} from 'src/app/services/analytics/analytics.service';
import {Shop} from 'src/app/models/Shop';

import {
    GetOffersActions,
    SetOffersActions,
    SET_OFFERS,
    SetOnlyOffersActions,
    SET_ONLY_OFFERS,
    GetProductsFeaturedAction,
    SetProductsFeaturedAction,
    SET_PRODUCTS_FEATURED
} from '../../../general/store/actions/offers.actions';
import {ICategory} from 'src/app/interfaces/ICategory';
import {LoadingOn, LoadingOff} from '../../../general/store/actions/loading.actions';
import {IBanner} from '../../../../../interfaces/IBanner';
import {RedirectService} from '../../../../../services/redirect/redirect.service';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import { IModal } from 'src/app/interfaces/IModal';
import { IPortfolio } from 'src/app/interfaces/IPortfolio';
import { GetCompaniesAction, SetCompaniesAction, SET_COMPANIES } from 'src/app/modules/tendero/pedidos/pages/pedidos/store/companies.actions';
import { isArray } from 'util';
import { CompaniesPortfolioShopkeeperService } from 'src/app/services/orders/companies-portfolio-shopkeeper.service';

@Component({
    selector: 'app-productos-destacados',
    templateUrl: './productos-destacados.page.html',
    styleUrls: ['./productos-destacados.page.scss'],
    animations: [jumpAnimation]
})
export class ProductosDestacadosPage implements OnInit, OnDestroy {
    public user: Shopkeeper;
    public productsFeatured: IProduct[];
    public products: IProduct[];
    public companies: ICompany[];
    public thingState: string;
    public nProducts = 0;
    public productsBinding: any = {};
    public isOfflineActive: boolean;
    public role: string;
    private actionsCountProductsOrder = new Subscription();
    public actionsCompareProducts = new Subscription();
    public statusInputCountProd = false;
    public offlineSubs = new Subscription();
    public countProdTemp = 0;
    public orderValue = 0;
    public categories: ICategory[] = [];
    public actionsOffers = new Subscription();
    public indexCategorySel = 0;
    public productIdDeepLink = null;
    public shopData: Shop;
    public res: any;
    private companiesSubs = new Subscription();
    private productsFeaturedSubs = new Subscription();

    @ViewChildren('containerCards') containerMain: QueryList<any>;

    constructor(
        private actionsObj: ActionsSubject,
        private navigation: NavigationHelper,
        private route: ActivatedRoute,
        private router: Router,
        private modalController: ModalController,
        private storage: Storage,
        private orderS: OrdersService,
        private store: Store<AppState>,
        private actionsSubj: ActionsSubject,
        private vibrateService: VibrateService,
        private alertController: AlertController,
        private companiesPortfolioShopkeeperService: CompaniesPortfolioShopkeeperService,
        private analyticsService: AnalyticsService,
        private cashRegisterServices: CashRegisterService,
        private redirect: RedirectService,
        public shopSingletonService: ShopSingletonService,
    ) {
        this.user = this.route.snapshot.data['user'];
        this.thingState = 'start';
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.productsFeatured = this.router.getCurrentNavigation().extras.state.data.productsFeatured;
                this.companies = this.router.getCurrentNavigation().extras.state.data.companies;  
                this.productIdDeepLink = this.router.getCurrentNavigation().extras.state.data.productId;   
                console.log(this.productIdDeepLink,'this.productIdDeepLink');         
            }
        });
    }


    ngOnInit() {
        this.offlineSubs = this.store.select('offline').subscribe(success => {
            this.isOfflineActive = success.active;
        }, error => {
        });

        // crea order de cero seleccionando tienda 0 de primeras
        this.res = this.shopSingletonService.getSelectedShop();

        this.role = this.user.role;
        this.categories = [];
        this.products = [];
        this.actionsCountProductsOrder = this.actionsSubj
            .pipe(filter((res: CountProductsOrderAction) => res.type === COUNT_PRODUCTS_ORDER))
            .subscribe((res) => {
                this.animateThing();
                this.nProducts = res.nProducts;

                this.cashRegisterServices.getOrderValue((success) => {
                    this.orderValue = success;
                });

                if (this.productsFeatured) {
                    this.productsFeatured.forEach((element, index, object) => {
                        setTimeout(() => {
                            this.updateProductQty(element, this.productsFeatured, true);
                        }, 300);
                    });
                }


                if (this.products) {
                    this.products.forEach((element, index, object) => {
                        setTimeout(() => {
                            this.updateProductQty(element, this.products, true);
                        }, 300);
                    });
                }

            });


        if (!this.productsFeatured) {
            this.store.dispatch(new GetProductsFeaturedAction(this.user.token, this.user.tiendas[0].id));
            this.productsFeaturedSubs = this.actionsSubj
                .pipe(filter(action => action.type === SET_PRODUCTS_FEATURED))
                .subscribe((res: SetProductsFeaturedAction) => {
                    this.productsFeatured = res.productsFeatured;
        
                                 
                    let productsBinding = {};
                    res.productsFeatured.forEach((element, index, object) => {
                        if (this.productsFeatured[index].ofertas  && isArray(this.productsFeatured[index].ofertas) && this.productsFeatured[index].ofertas.length > 0 ){
                            this.productsFeatured[index].precio = this.productsFeatured[index].ofertas[0].precio;
                            this.productsFeatured[index].precio_unitario = this.productsFeatured[index].ofertas[0].precio_unitario;
                        }

                        productsBinding[element.id] = false;
                        setTimeout(() => {
                            this.updateProductQty(element, true);
                        }, 300);
                    });
                }, err => {
                }, () => {
                });
            if (!this.companies) {
                this.store.dispatch(new GetCompaniesAction(this.user.token, this.user.tiendas[0].id, false));

                this.companiesSubs = this.actionsSubj
                    .pipe(filter((action: SetCompaniesAction) => action.type === SET_COMPANIES))
                    .pipe(map((res: SetCompaniesAction) => {
                        return {
                            companias: res.companies,
                            portafolios: res.portfolio,
                            productos_destacados: res.featuredProducts,
                            concursos_nuevos: (res.concursos_nuevos) ? res.concursos_nuevos : 0,
                            modales: res.modales
                        };
                    }))
                    .subscribe((res: {
                        companias: ICompany[], portafolios: IPortfolio[], productos_destacados: any[],
                        concursos_nuevos: number, modales: IModal[]
                    }) => {
                        this.companiesPortfolioShopkeeperService.setCompaniesPortfolios(res);
                        this.companies = res.companias;
                    });
            }
        }


        // subscriptor de cambio de num product para actualizar
        this.actionsCountProductsOrder = this.actionsSubj
            .pipe(filter((res: CountProductsOrderAction) => res.type === COUNT_PRODUCTS_ORDER))
            .subscribe((res) => {
                this.storage.get('getProductosDestacados?' + this.user.tiendas[0].id).then(success => {
                    if (success) {
                        if (success.value != null && success.value != null) {
                            let offers = JSON.parse(success.value);
                            offers = offers.content.productos_destacados;
                            offers.forEach((element, index, object) => {
                                setTimeout(() => {
                                    this.updateProductQty(element, true);
                                }, 300);
                            });
                        }
                    }
                });
            });
        this.configureOffers();
    }

    justBack() {
        this.navigation.justBack();
    }
    

    async addProduct(product) {
        const company = this.searchCompany(product.compania_id);
        if (company !== null) {
            this.user.compania = company;
            await this.storage.set('user', JSON.stringify(this.user));
            this.orderS.addCarFeaturedProduct(product, this.user.tiendas[0])
                .then((res) => {
                    this.store.dispatch(new CountProductsOrderAction(res));
                });
        }
    }

    private searchCompany(compania_id) {
        const result = this.companies.filter((company) => {
            return company.id === compania_id;
        });
        if (result.length > 0) {
            return result[0] as ICompany;
        }

        return null;
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
                shopData: this.user.tiendas[0],
                user: this.user
            }
        });

        return await modal.present();
    }

    getFullProductName(product) {
        product.completeName = '';
        product.completeName += (product.nombre != null) ? (product.nombre + ' ') : '';
        product.completeName += (product.marca != null) ? (product.marca + ' ') : '';
        product.completeName += (product.variante != null) ? (product.variante + ' ') : '';
        product.completeName += (product.presentacion != null) ? (product.presentacion + ' ') : '';
        product.completeName += (product.tamanio != null) ? (product.tamanio + ' ') : '';
        product.completeName += (product.unidad_medida != null) ? (product.unidad_medida + ' ') : '';
        product.completeName += (product.descripcion != null) ? (product.descripcion + ' ') : '';
        return product.completeName;
    }

    addToCart(product) {
        if (product.imagenPrincipal) {
            product.imagenes = [{url: product.imagenPrincipal}];
        }
        const multiplier = (product.multiplo_pedido && product.multiplo_pedido !== 0) ? product.multiplo_pedido : 1;

        if (product.pedido_minimo !== 0 && !product.cantidad) {
            if (multiplier !== 1) {
                if (product.pedido_minimo < multiplier) {
                    product.cantidad = multiplier;
                    this.addProductAnalyticsEvent(product);
                    this.saveProduct(product);
                } else {
                    if (product.pedido_minimo % multiplier !== 0) {
                        const a = Math.ceil(product.pedido_minimo / multiplier);
                        product.cantidad = a * multiplier;
                    } else {
                        product.cantidad = product.pedido_minimo;
                    }
                    this.addProductAnalyticsEvent(product);
                    this.saveProduct(product);
                }

            } else {
                product.cantidad = (!product.cantidad) ? product.pedido_minimo : +product.cantidad + multiplier;
                this.addProductAnalyticsEvent(product);
                this.saveProduct(product);
            }

        }

        if (product.pedido_maximo !== 0) {
            if (multiplier !== 1) {
                if (multiplier + product.cantidad <= product.pedido_maximo) {
                    product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad + multiplier;
                    this.addProductAnalyticsEvent(product);
                    this.saveProduct(product);
                } else {
                    product.cantidad = product.pedido_maximo;
                    this.addProductAnalyticsEvent(product);
                    this.saveProduct(product);
                    this.generalPropuseAlert('No es posible agregar más unidades de este producto.');
                }
            } else {
                if (product.pedido_maximo > product.cantidad) {
                    product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad + multiplier;
                    this.addProductAnalyticsEvent(product);
                    this.saveProduct(product);
                } else {
                    product.cantidad = product.pedido_maximo;
                    this.addProductAnalyticsEvent(product);
                    this.saveProduct(product);
                    this.generalPropuseAlert('No es posible agregar más unidades de este producto.');
                }
            }
        } else {
            product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad + multiplier;
            this.addProductAnalyticsEvent(product);
            this.saveProduct(product);
        }

        if (product.cantidad === multiplier && this.role === 'cliente') {
            this.vibrateService.playAndVibrate();
        }
        return false;
    }

    saveProduct(product) {
        let shop = this.shopSingletonService.getSelectedShop();
        if (product.cantidad === 0) {
            delete shop.productos_seleccionados[product.id];
        } else {
            if (!shop.productos_seleccionados) {
                shop.productos_seleccionados = {};
            }
            shop.productos_seleccionados[product.id] = product;
        }
        shop.status_productos_pendientes = (JSON.stringify(shop.productos_seleccionados) == '{}') ? false : true;
        this.shopSingletonService.setSelectedShop(shop);
        this.shopSingletonService.setStorageSelectedShop(shop);
        this.store.dispatch(new FilterProductsAction(shop.productos_seleccionados, false));
    }

    addProductAnalyticsEvent(product) {
        if (product.cantidad == 1) {
            this.analyticsService.sendEvent('prod_agr_destacado_' + this.user.role, {
                'event_category': 'prod_agr_destacado_' + product.id,
                'event_label': 'producto_add_destacado_$' + product.cod_sap
            });
        } else {
            this.analyticsService.sendEvent('prod_agr_destacado_add', {
                'event_category': 'prod_agr_destacado_add_'+product.id,
                'event_label': 'prod_agr_destacado_add/' + product.cod_sap
            });
        }
    }

    removeProductAnalyticsEvent(product) {
        this.analyticsService.sendEvent('prod_agr_destacado_add', {
            'event_category': 'prod_agr_destacado_rem'+product.id,
            'event_label': 'prod_agr_destacado_rem/' + product.cod_sap
        });
    }

    async generalPropuseAlert(message: string) {
        const buttons = [
            {
                text: 'Aceptar',
                cssClass: '',
                role: 'cancel',
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

    rmToCart(product) {
        this.statusInputCountProd = false;
        const multiplier = (!isNaN(product.multiplo_pedido) && product.multiplo_pedido !== 0) ? product.multiplo_pedido : 1;
        if (product.pedido_minimo !== 0) {
            if (product.cantidad - multiplier >= product.pedido_minimo) {
                product.cantidad = product.cantidad - multiplier;
                this.removeProductAnalyticsEvent(product);
                this.saveProduct(product);
            } else {
                product.cantidad = 0;
                this.removeProductAnalyticsEvent(product);
                this.saveProduct(product);
            }
            return false;
        }

        if (product.pedido_minimo !== 0) {
            if (multiplier !== 1) {
                if (product.cantidad - multiplier >= product.pedido_minimo) {

                    product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad - multiplier;
                    this.removeProductAnalyticsEvent(product);
                    this.saveProduct(product);
                } else {
                    product.cantidad = 0;
                    this.removeProductAnalyticsEvent(product);
                    this.saveProduct(product);
                }

            } else {

                if (product.pedido_minimo < product.cantidad) {
                    product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad - multiplier;
                    this.removeProductAnalyticsEvent(product);
                    this.saveProduct(product);
                } else {
                    product.cantidad = 0;
                    this.removeProductAnalyticsEvent(product);
                    this.saveProduct(product);
                }
            }
        } else {

            if (product.cantidad - multiplier >= 0) {
                product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad - multiplier;
            } else if (product.cantidad - multiplier < 0) {
                product.cantidad = 0;
            }
            this.removeProductAnalyticsEvent(product);
            this.saveProduct(product);
        }
    }

    changeCountProd(e, product, statusInputCountProd = false) {
        this.statusInputCountProd = true;
        const tempCount: any = Number(e.target.value).toString();
        if (!tempCount.match(/^\d+$/)) {
            product.cantidad = 0;
        } else {
            if (tempCount.length > 3) {
                product.cantidad = (this.countProdTemp - 1);
            } else {
                this.countProdTemp = tempCount;
                product.cantidad = (tempCount - 1);
            }
            this.addToCart(product);
        }
        if (tempCount == '0') {
            this.statusInputCountProd = false;
        } else {
            this.statusInputCountProd = statusInputCountProd;
        }
    }

    onFocus() {
        this.statusInputCountProd = true;
    }

    configureOffers() {
        this.shopData = this.shopSingletonService.getSelectedShop();
        this.store.dispatch(new GetOffersActions(
            this.user.token,
            this.shopData.id,
            null,
            null,
            null,
            1,
            9999,
            true)
        );

        this.actionsOffers = this.actionsObj
            .pipe(filter((res: SetOnlyOffersActions) => res.type === SET_ONLY_OFFERS))
            .subscribe((res) => {
                this.store.dispatch(new LoadingOff());
                if (res.offers) {
                    this.products = res.offers;
                    this.products.forEach((element, index, object) => {
                        setTimeout(() => {
                            this.updateProductQty(element, this.products, true);
                        }, 300);
                    });

                    if(this.productIdDeepLink !== null){
                        let index = this.products.findIndex(o => o.id == +this.productIdDeepLink);
                        this.products[index].deeplink = true;
                    }                    
                }
            });
    }

    ngOnDestroy(): void {
        this.actionsOffers.unsubscribe();
        this.productsFeaturedSubs.unsubscribe();
        this.companiesSubs.unsubscribe();
    }

    async updateProductQty(product: any, products, force?: boolean) {
        let shop = this.shopSingletonService.getSelectedShop();
        if (shop.productos_seleccionados != undefined && Object.keys(shop.productos_seleccionados).length > 0) {
            let p = Object.values(shop.productos_seleccionados);
            let find = false;
            p.forEach((element: any, index, object) => {
                if (element.id == product.id) {
                    product.cantidad = element.cantidad;
                    this.setQty(product.id, element.cantidad, products);
                    find = true;
                }
            });

            // si no esta es por que lo quitaron
            if (!find) {
                this.setQty(product.id, 0, products);
            }
        } else {
            this.setQty(product.id, 0, products);
        }
    }

    private IsValidJSONString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    setQty(idProduct, cantidad, products) {
        if (!products) {
            return;
        }

        products.forEach((element, index, object) => {
            if (element.id == idProduct) {
                object[index].cantidad = cantidad;
            }
        });
    }

    goToRedirect(destacadoSelected: any): void {
        const destacado = <IBanner> destacadoSelected;

        if (destacado.datos) {
            const redireccion = JSON.parse(destacado.datos);
            this.redirect.redirect(redireccion, this.user, destacado);
        }
    }
}
