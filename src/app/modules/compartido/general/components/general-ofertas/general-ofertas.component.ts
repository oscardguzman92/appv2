import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {IonSlides, ModalController} from '@ionic/angular';
import {AppState} from '../../store/reducers/offers.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {
    GetProductsFeaturedAction,
    SET_PRODUCTS_FEATURED,
    SetProductsFeaturedAction
} from '../../store/actions/offers.actions';
import {filter, map} from 'rxjs/operators';
import {IProduct} from '../../../../../interfaces/IProduct';
import {Storage} from '@ionic/storage';
import {ICompany} from '../../../../../interfaces/ICompany';
import {Seller} from '../../../../../models/Seller';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {OrdersService} from '../../../../../services/orders/orders.service';
import {Subscription} from 'rxjs';
import {GetCompaniesAction, SET_COMPANIES, SetCompaniesAction} from '../../../../tendero/pedidos/pages/pedidos/store/companies.actions';
import {IPortfolio} from '../../../../../interfaces/IPortfolio';
import {CountProductsOrderAction, FilterProductsAction, COUNT_PRODUCTS_ORDER} from '../../../pedidos/store/orders.actions';
import {Shop} from '../../../../../models/Shop';
import {CompartidoSeleccionTiendaComponent} from '../../../../tendero/compartido/components/compartido-seleccion-tienda/compartido-seleccion-tienda.component';
import {LoadingOn} from '../../store/actions/loading.actions';
import {AnalyticsService} from 'src/app/services/analytics/analytics.service';
import {UtilitiesHelper} from 'src/app/helpers/utilities/utilities.helper';
// imports agregar y quitar producto

import {VibrateService} from 'src/app/services/vibrate/vibrate.service';
import {AlertController} from '@ionic/angular';
import {CompaniesPortfolioShopkeeperService} from 'src/app/services/orders/companies-portfolio-shopkeeper.service';
import {isArray} from "util";
import {IModal} from '../../../../../interfaces/IModal';
import {GeneralModalInformativaComponent} from '../general-modal-informativa/general-modal-informativa/general-modal-informativa.component';
import {SetReadModalAction} from '../../../misMensajes/store/messages.actions';
import {IBanner} from '../../../../../interfaces/IBanner';
import {RedirectService} from '../../../../../services/redirect/redirect.service';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import {CashRegisterService} from '../../../../../services/orders/cash-register.service';

@Component({
    selector: 'app-general-ofertas',
    templateUrl: './general-ofertas.component.html',
    styleUrls: ['./general-ofertas.component.scss'],
})
export class GeneralOfertasComponent implements OnInit, OnDestroy {
    @ViewChild('slides') slides: IonSlides;
    @Input() user: Seller | Shopkeeper;
    @Input() companies: ICompany[];
    @Input() consultaModals?: boolean;
    @Input() offers?: IProduct[];
    @Input() statusInsurence: boolean = false;
    @Output() concursos = new EventEmitter();
    @Output() onOfertas = new EventEmitter();

    private productsFeaturedSubs = new Subscription();
    private companiesSubs = new Subscription();

    public slideOpts = {
        effect: 'flip',
        slidesPerView: 'auto',
        spaceBetween: 5,
        zoom: false,
        speed: 800,
        autoplay: {
            delay: 8000
            },
        loop: true,
    };

    public statusInputCountProd = false;
    private isOfflineActive: boolean;
    public offlineSubs = new Subscription();
    public countProdTemp = 0;
    public role: string = '';
    public productsBinding: any = {};
    public res: any;
    private actionsCountProductsOrder = new Subscription();
    private destacadoSelected: any;

    constructor(
        private store: Store<AppState>,
        private storage: Storage,
        private navigation: NavigationHelper,
        private actionS: ActionsSubject,
        private orderS: OrdersService,
        private modalController: ModalController,
        private analyticsService: AnalyticsService,
        private vibrateService: VibrateService,
        private alertController: AlertController,
        private cashRegisterService: CashRegisterService,
        private util: UtilitiesHelper,
        private companiesPortfolioShopkeeperService: CompaniesPortfolioShopkeeperService,
        private redirect: RedirectService,
        public shopSingletonService: ShopSingletonService,
    ) {
        this.redirect.setTypeObject('banner');
    }

    ngOnInit() {
        this.offlineSubs = this.store.select('offline').subscribe(success => {
            this.isOfflineActive = success.active;
        }, error => {
        });

        this.storage.get('user').then(usu => {
            usu = JSON.parse(usu);
            this.role = usu.role;
        });

        if (!this.offers) {
            this.store.dispatch(new GetProductsFeaturedAction(this.user.token, this.user.tiendas[0].id));
            this.productsFeaturedSubs = this.actionS
                .pipe(filter(action => action.type === SET_PRODUCTS_FEATURED))
                .subscribe((res: SetProductsFeaturedAction) => {
                    this.offers = res.productsFeatured;

                    let productsBinding = {};
                    res.productsFeatured.forEach((element, index, object) => {
                        if (this.offers[index].ofertas  && isArray(this.offers[index].ofertas) && this.offers[index].ofertas.length > 0 ){
                            this.offers[index].precio = this.offers[index].ofertas[0].precio;
                            this.offers[index].precio_unitario = this.offers[index].ofertas[0].precio_unitario;
                        }

                        productsBinding[element.id] = false;
                        setTimeout(() => {
                            this.updateProductQty(element);
                        }, 300);
                    });
                }, err => {
                }, () => {
                });
            if (!this.companies) {
                this.store.dispatch(new GetCompaniesAction(this.user.token, this.user.tiendas[0].id, this.consultaModals, () => {
                    this.onOfertas.emit();
                }));

                this.companiesSubs = this.actionS
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
                        if (res.concursos_nuevos > 0 && this.concursos) {
                            this.concursos.emit(true);
                        }

                        if (res.concursos_nuevos === 0 && this.concursos) {
                            this.concursos.emit(false);
                        }

                        if (res.modales && res.modales.length > 0) {
                            for (const modal of res.modales) {
                                this.openModalCustom(modal);
                            }
                        }

                        this.companiesPortfolioShopkeeperService.setCompaniesPortfolios(res);
                        this.companies = res.companias;
                    });
            }
        }

        // crea order de cero seleccionando tienda 0 de primeras
        this.res = this.shopSingletonService.getSelectedShop();

        // subscriptor de cambio de num product para actualizar
        this.actionsCountProductsOrder = this.actionS
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

    ngOnDestroy(): void {
        this.productsFeaturedSubs.unsubscribe();
        this.companiesSubs.unsubscribe();
        this.offers = null;
    }

    clearCompanies() {
        this.companies = null;
    }

    openFeaturedProducts() {
        //this.analyticsService.sendEvent('sec_ver_destacados_' , { 'event_category': 'menu_principal', 'event_label': 'sec_ver_destacados_' + this.role });
        this.analyticsService.sendEvent('banner_producto' , { 'event_category': this.destacadoSelected.id  } );
        this.navigation.goToBack('productos-destacados', {
            productsFeatured: this.offers,
            companies: this.companies
        });
    }

    goCommunity() {
        const role = (this.user && this.user.role == "cliente")?"tendero":"vendedor";
        this.analyticsService.sendEvent('sec_comunidad2_'+role, { 'event_category': 'menu_principal', 'event_label': 'sec_comunidad2_'+role });
        this.navigation.goToBack('comunidad-tenderos');
    }

    goInsurence() {
        this.navigation.goToBack('seguros-home');
    }
    
    goPoints() {
        this.analyticsService.sendEvent('sec_puntos_mp', { 'event_category': 'menu_principal', 'event_label': 'sec_puntos_mp' });
        if (this.user.tiendas.length > 1) {
            this.openModalShopSelection(this.user.tiendas);
            return;
        }
        this.navigation.goToBack('puntos', {shop: this.user.tiendas[0]});
    }

    private async openModalShopSelection(shops: Shop[]) {
        const modal = await this.modalController.create(<any>{
            component: CompartidoSeleccionTiendaComponent,
            cssClass: 'filter-modal',
            componentProps: {shops: shops}
        });

        modal.onDidDismiss().then(res => {
            if (!res.data) {
                return;
            }
            this.store.dispatch(new LoadingOn());
            this.navigation.goToBack('puntos', {shop: <Shop>res.data.shop});
        });

        return await modal.present();
    }


    onBlur() {
        this.statusInputCountProd = false;
    }

    onFocus() {
        this.statusInputCountProd = true;
    }

    rmToCart(product) {
        const prevData = product.cantidad;
        this.statusInputCountProd = false;
        let multiplier = (!isNaN(product.multiplo_pedido) && product.multiplo_pedido != 0) ? product.multiplo_pedido : 1;
        if (product.pedido_minimo != 0) {
            if (product.cantidad - multiplier >= product.pedido_minimo) {
                product.cantidad = product.cantidad - multiplier;
                this.analyticsService.sendEvent("prod_agr_destacado_rem_"+this.user.role, { 'event_category': 'prod_agr_destacado_rem_'+product.id, 'event_label': 'prod_agr_destacado_rem_' + product.cod_sap });
                this.saveProduct(product);
            } else {
                product.cantidad = 0;
                this.analyticsService.sendEvent("prod_agr_destacado_rem_"+this.user.role, { 'event_category': 'prod_agr_destacado_rem_'+product.id, 'event_label': 'prod_agr_destacado_rem_' + product.cod_sap });
                this.saveProduct(product);
            }

            if (!this.cashRegisterService.compuestos(prevData, product, this.user)) {
                this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
                this.saveProduct(product);
                return;
            }

            return false;
        }

        if (product.pedido_minimo != 0) {
            if (multiplier != 1) {
                if (product.cantidad - multiplier >= product.pedido_minimo) {

                    product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad - multiplier;
                this.analyticsService.sendEvent("prod_agr_destacado_rem_"+this.user.role, { 'event_category': 'prod_agr_destacado_rem_'+product.id, 'event_label': 'prod_agr_destacado_rem_' + product.cod_sap });
                    this.saveProduct(product);
                } else {
                    product.cantidad = 0;
                this.analyticsService.sendEvent("prod_agr_destacado_rem_"+this.user.role, { 'event_category': 'prod_agr_destacado_rem_'+product.id, 'event_label': 'prod_agr_destacado_rem_' + product.cod_sap });
                    this.saveProduct(product);
                }

            } else {

                if (product.pedido_minimo < product.cantidad) {
                    product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad - multiplier;
                this.analyticsService.sendEvent("prod_agr_destacado_rem_"+this.user.role, { 'event_category': 'prod_agr_destacado_rem_'+product.id, 'event_label': 'prod_agr_destacado_rem_' + product.cod_sap });
                    this.saveProduct(product);
                } else {
                    product.cantidad = 0;
                this.analyticsService.sendEvent("prod_agr_destacado_rem_"+this.user.role, { 'event_category': 'prod_agr_destacado_rem_'+product.id, 'event_label': 'prod_agr_destacado_rem_' + product.cod_sap });
                    this.saveProduct(product);
                }
            }
        } else {

            if (product.cantidad - multiplier >= 0) {
                product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad - multiplier;
            } else if (product.cantidad - multiplier < 0) {
                product.cantidad = 0;
            }
                this.analyticsService.sendEvent("prod_agr_destacado_rem_"+this.user.role, { 'event_category': 'prod_agr_destacado_rem_'+product.id, 'event_label': 'prod_agr_destacado_rem_' + product.cod_sap });
            this.saveProduct(product);
        }
    }

    saveProductStockValid(product , m?: string) {
        //console.log(product);
        if (this.util.correctStock(product)) {
            this.saveProduct(product);
            if (product.cantidad == 1) { //compania_id
                this.analyticsService.sendEvent("prod_agr_destacado_"+this.role, { 'event_category': 'prod_agr_destacado_' + product.id, 'event_label': 'prod_add_destacado_' + product.cod_sap });
            }else{
                this.analyticsService.sendEvent("prod_agr_destacado_add_"+this.user.role, { 'event_category': 'prod_agr_destacado_add_'+product.id, 'event_label': 'prod_agr_destacado_add_' + product.cod_sap });
            }
            if (m && m != "") {
                this.generalPropuseAlert(m);
            }
        } else {
            product.cantidad = (product.inventario > 0) ? product.inventario : 0;
            this.saveProduct(product);
            let a = (product.inventario > 0) ? product.inventario : 0;
            this.generalPropuseAlert("Este producto cuenta con " + a + " unidades de inventario.");
        }
    }

    //
    addToCart(product) {
        const prevData = product.cantidad;
        if (product.imagenPrincipal) {
            product.imagenes = [{url: product.imagenPrincipal}];
        }
        let multiplier = (product.multiplo_pedido && product.multiplo_pedido != 0) ? product.multiplo_pedido : 1;

        if (product.pedido_minimo != 0 && !product.cantidad) {
            if (multiplier != 1) {
                if (product.pedido_minimo < multiplier) {
                    product.cantidad = multiplier;
                    this.saveProductStockValid(product);
                } else {
                    if (product.pedido_minimo % multiplier != 0) {
                        let a = Math.ceil(product.pedido_minimo / multiplier);
                        product.cantidad = a * multiplier;
                    } else {
                        product.cantidad = product.pedido_minimo;
                    }
                    this.saveProductStockValid(product);
                }

            } else {
                product.cantidad = (!product.cantidad) ? product.pedido_minimo : +product.cantidad + multiplier;
                this.saveProductStockValid(product);
            }

        }

        // valida pedido maximo
        if (product.pedido_maximo != 0) {
            if (multiplier != 1) {
                if (multiplier + product.cantidad <= product.pedido_maximo) {
                    product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad + multiplier;
                    this.saveProductStockValid(product);
                } else {
                    product.cantidad = product.pedido_maximo;
                    this.saveProductStockValid(product, 'No es posible agregar más unidades de este producto.');
                }
            } else {
                if (product.pedido_maximo > product.cantidad) {
                    product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad + multiplier;
                    this.saveProductStockValid(product);
                } else {
                    product.cantidad = product.pedido_maximo;
                    this.saveProductStockValid(product, 'No es posible agregar más unidades de este producto.');
                }
            }
        } else {
            product.cantidad = (!product.cantidad) ? multiplier : +product.cantidad + multiplier;
            this.saveProductStockValid(product);
        }

        if (product.cantidad == multiplier && this.role == 'cliente') {
            this.vibrateService.playAndVibrate();
        }

        if (!this.cashRegisterService.compuestos(prevData, product, this.user)) {
            this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
            this.saveProduct(product);
            return;
        }

        return false;

    }

    changeCountProd(e, product, statusInputCountProd = false) {
        this.statusInputCountProd = true;
        let tempCount: any = Number(e.target.value).toString();
        if (!tempCount || !tempCount.match(/^\d+$/)) {
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

    saveProduct(product) {
        let shop = this.shopSingletonService.getSelectedShop();
        if (product.cantidad == 0) {
            delete shop.productos_seleccionados[product.id];
        } else {
            if (!shop.productos_seleccionados) {
                shop.productos_seleccionados = {};
            }
            if (shop.productos_seleccionados[product.id]) {
                product.pedido = shop.productos_seleccionados[product.id].pedido;
                shop.productos_seleccionados[product.id] = product;
            } else {
                shop.productos_seleccionados[product.id] = product;
            }
        }
        this.shopSingletonService.setSelectedShop(shop);
        this.shopSingletonService.setStorageSelectedShop(shop);
        this.store.dispatch(new FilterProductsAction(shop.productos_seleccionados, false));
    }

    async generalPropuseAlert(message: string) {
        let buttons = [
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

    async updateProductQty(product: any, force?: boolean) {
        let shop = this.shopSingletonService.getSelectedShop();
        if (shop.productos_seleccionados != undefined && Object.keys(shop.productos_seleccionados).length > 0) {
            let p = Object.values(shop.productos_seleccionados);
            let find = false;
            p.forEach((element: any, index, object) => {
                if (element.id == product.id) {
                    product.cantidad = element.cantidad;
                    this.setQty(product.id, element.cantidad);
                    find = true;
                }
            });

            // si no esta es por que lo quitaron
            if (!find) {
                this.setQty(product.id, 0);
            }
        } else {
            this.setQty(product.id, 0);
        }
    }

    setQty(idProduct, cantidad) {
        if (this.offers) {
            this.offers.forEach((element, index, object) => {
                if (element.id == idProduct) {
                    object[index].cantidad = cantidad;
                }
            });
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

    public isArray(array) {
        return Array.isArray(array);
    }

    private async openModalCustom(modalData: IModal) {
        const modal = await this.modalController.create({
            component: GeneralModalInformativaComponent,
            cssClass: ['modal-info'],
            componentProps: {
                data: modalData,
                user: this.user
            },
            backdropDismiss: false
        });

        modal.onDidDismiss().then(res => {
            if (res.data && res.data.withOutEvent) {
                this.analyticsService.sendEvent('os_notification_dismiss', {
                    'notification_id': modalData.id,
                    'campaign': 'modal',
                    'source': this.user.role,
                });
            }

            if (modalData.persistente && (res.data && !res.data.addProduct)) {
                return;
            }

            this.store.dispatch(new SetReadModalAction(this.user.token, modalData.id));
        });

        return modal.present();
    }

    goToRedirect(destacadoSelected: any): any {
        this.destacadoSelected = destacadoSelected;
        if (destacadoSelected.type == 'banner') {
            const destacado = <IBanner> destacadoSelected;

            if (destacado.datos) {
                const redireccion = JSON.parse(destacado.datos);
                this.redirect.redirect(redireccion, this.user, destacado);
            }
            return true;
        } 
        this.openFeaturedProducts();

    }

}
