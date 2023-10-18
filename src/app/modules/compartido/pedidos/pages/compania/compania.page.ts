import {Component, OnDestroy, OnInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import {GeneralCarritoComprasComponent} from '../../../general/components/general-carrito-compras/general-carrito-compras.component';
import {ModalController, IonContent, Platform, AlertController, IonVirtualScroll, LoadingController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {Shop} from 'src/app/models/Shop';
import {ActivatedRoute, Router} from '@angular/router';
import {
    CountProductsOrderAction,
    COUNT_PRODUCTS_ORDER,
    SetCategoriesAction,
    SET_CATEGORIES,
    GetProductsAction,
    GetCategoriesAction,
    SetProductsAction,
    SET_PRODUCTS,
    FilterProductsAction,
    GetSearchProductsAction,
    SetSearchProductsAction,
    SET_SEARCH_PRODUCTS,
    COMPARE_PRODUCTS,
    CompareProducts
} from '../../store/orders.actions';
import {filter} from 'rxjs/operators';
import {ActionsSubject, Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {ICategory} from 'src/app/interfaces/ICategory';
import {AppState} from 'src/app/store/app.reducer';
import {LoadingOn, LoadingOff} from '../../../general/store/actions/loading.actions';
import {jumpAnimation} from '../../../../../animations/jump.animation';
import { GetOffersActions, SetOffersActions, SET_OFFERS, SetOnlyOffersActions, SET_ONLY_OFFERS } from '../../../general/store/actions/offers.actions';
import { Roles } from 'src/app/enums/roles.enum';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';
import { PedidosFiltroComponent } from '../../components/pedidos-filtro/pedidos-filtro.component';
import { ModalOptions } from '@ionic/core';
import {TypeSegments} from '../../../../../enums/typeSegments.enum';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { CashRegisterService } from 'src/app/services/orders/cash-register.service';
import { IBrand } from 'src/app/interfaces/IBrand';
import {SET_OFFLINE_DYNAMIC, SetOfflineDynamicAction} from '../../../../vendedor/compartido/store/offlineDynamic/offlineDynamic.actions';
import {CacheService} from 'ionic-cache';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import { OrdersService } from 'src/app/services/orders/orders.service';
import {PedidosProductosComponent} from '../../components/pedidos-productos/pedidos-productos.component';

export enum ExtendedCategories {
    offer = 991,
    search = 992,
    segmented_offer = 99990,
}


@Component({
    selector: 'app-companias',
    templateUrl: './compania.page.html',
    styleUrls: ['./compania.page.scss'],
    animations: [jumpAnimation]
})

export class CompaniaPage implements OnInit, OnDestroy {

    @ViewChild(IonContent) content: IonContent;
    @ViewChild(PedidosProductosComponent) ordersProducts: PedidosProductosComponent;
    @ViewChild('listPromoElement', {read: ElementRef}) listPromoElement: ElementRef;
    public shopData: Shop;
    public user: any;
    public puntosCompania: any[];
    public hasEdit:boolean = false;
    public finishLoad:boolean = true;
    public nProducts = 0;
    public actionsCountProductsOrder = new Subscription();
    public actionsCategories = new Subscription();
    public actionsCompareProducts = new Subscription();
    public actionsProducts = new Subscription();
    public actionsOffers = new Subscription();
    public actionsOnlyOffers = new Subscription();
    public actionsSearchProducts = new Subscription();
    private subsOfflineDynamic = new Subscription();
    public typeSegmentSelected: TypeSegments = TypeSegments.categories;
    public filters:  {
        typeSegment: TypeSegments
    } = {
        typeSegment: this.typeSegmentSelected
    };

    public showButtonBarcode: boolean;
    public categories: ICategory[] = [];
    public indexCategorySel = 0;
    public scrollTop = 0;
    public heigthScreen = 0;
    public idCategorySel: number;
    public thingState: string;
    public scrollDownStatus = true;
    public dataOnlySearch: {
        isOnlySearch: boolean,
        search: string
        product_id?: string
    } = {
        isOnlySearch: false,
        search: ''
    };
    search: any;
    distributor_id: any;
    compania_id: any;
    activeScroll = true;
    orderValue: any;
    portafolio: any;
    brand: IBrand = {id: null, nombre: ''};
    limitQuery: any;
    dataIn: any = {};

    filter_marca:string|boolean = false;
    portaCompleta: any;
    brandList: Array<IBrand> = [];
    deepLinkData: [] =  [];
    deepLink: boolean =  false;

    constructor(private modal: ModalController,
        private storage: Storage,
        private route: ActivatedRoute,
        private actionsObj: ActionsSubject,
        private store: Store<AppState>,
        private platform: Platform,
        private alertController: AlertController,
        private router: Router,
        private navigation: NavigationHelper,
        private analyticsService: AnalyticsService,
        private cashRegisterServices: CashRegisterService,
        private loadingController: LoadingController,
        private cache: CacheService,
        public shopSingletonService: ShopSingletonService,
        public ordersService: OrdersService,
    ) {
        this.puntosCompania = [];
        this.thingState = 'start';

        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.dataIn = this.router.getCurrentNavigation().extras.state.data;
                this.portaCompleta = this.dataIn.portaCompleto;
                this.puntosCompania = (this.dataIn.puntosCompania) ? this.dataIn.puntosCompania : [];
                 if (this.dataIn.action == 'search') {
                    this.dataOnlySearch.isOnlySearch = true;
                    this.dataOnlySearch.search = this.dataIn.search;
                    this.search = this.dataIn.search;
                } else if (this.dataIn.action == 'deeplink-product') {
                    this.storage.remove('deeplink');
                    this.deepLink = true;
                    this.dataOnlySearch.isOnlySearch = true;
                    this.dataOnlySearch.product_id = this.dataIn.product_id;
                    this.portafolio = this.dataIn.portafolio;
                    this.search = '';
                }else if (this.dataIn.action == 'distributor') {
                    this.distributor_id = this.dataIn.distributor_id;
                    this.portafolio = this.dataIn.portafolio;
                } else if (this.dataIn.action == 'productsByBrands') {
                    this.limitQuery = 9999;
                    this.brand.id = this.dataIn.brand_id;
                    this.brand.nombre = this.dataIn.brand_name;
                    if (this.dataIn.brand_list && this.dataIn.brand_list.length > 0) {
                        this.brandList = Object.assign([], this.dataIn.brand_list);
                    }
                } else if (this.dataIn.action == 'productstByOffer') {
                    this.limitQuery = 9999;
                }

                if (this.dataIn.filtro_marca == true) {
                    this.filters.typeSegment = 2;
                    this.filter_marca = this.dataIn.filtro_marca
                }
            }
        });
        this.ordersService
            .countSelectedProducts()
            .then(count => (this.nProducts = count))
    }

    ngOnInit() {
        //punto rojo carrito
        this.cashRegisterServices.checkAlredyOrder(active => {
            if (active) {
                this.hasEdit = active;
            }
        }); 
        this.cashRegisterServices.getOrderValue((success) => {
            this.orderValue = success;
        });

        this.categories = [];
        this.heigthScreen = (this.platform.height() - 100); // resta el alto del header
        this.store.dispatch(new LoadingOn(true));

        this.user = this.route.snapshot.data['user'];
        if (this.user.role == Roles.shopkeeper) {
            this.limitQuery = 10;
        }
        const puntos = (this.user.compania && this.user.compania.puntos) ? this.user.compania.puntos : 0;
        if (this.puntosCompania.length == 0 && puntos) {
            this.puntosCompania[this.user.compania.id] = puntos;
        }
        this.shopData = this.shopSingletonService.getSelectedShop();
        if (
            this.user.role == Roles.shopkeeper &&
            !this.distributor_id &&
            (!this.dataOnlySearch.isOnlySearch)
        ) {
            this.compania_id = (this.user.compania && this.user.compania.id) ? this.user.compania.id:this.brand.id;
        } else if (this.user.role == Roles.seller && this.user.distribuidor && this.user.distribuidor.id) {
            this.distributor_id = this.user.distribuidor.id;
        }

        // Si sólo se puede realizar búsqueda, no cargamos categorías
        if (this.dataOnlySearch && this.dataOnlySearch.isOnlySearch && !this.deepLink) {
            this.searchProducts(this.dataOnlySearch.search, true);
        } else if (this.deepLink) {
            this.activeScroll = false;
            this.store.dispatch(new GetSearchProductsAction(this.user.token, this.dataOnlySearch.product_id, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, this.dataOnlySearch.product_id, 1));
        }else if (this.brand && this.brand.id) {
            this.createCategoryBrand(this.brand.id, this.brand.nombre);
        } else if (this.dataIn.action == 'productstByOffer') {
            this.createCategoryOffer();
        } else {
           this.store.dispatch(new GetCategoriesAction(this.user.token, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, this.typeSegmentSelected, null));
        }

        this.subsOfflineDynamic = this.actionsObj
            .pipe( filter(res => res.type === SET_OFFLINE_DYNAMIC))
            .subscribe((res: SetOfflineDynamicAction) => {
                this.navigation.goToBack('marcas-clientes', this.shopData);
                this.cache.saveItem('offlineDynamic', true, 'offlineDynamic', 600);
            });

        this.actionsCompareProducts = this.actionsObj.pipe(filter((res: CompareProducts) => res.type === COMPARE_PRODUCTS))
            .subscribe((res) => {
                this.shopData.productos_seleccionados = res.productsCompare;
                this.updateQuantityProducts(this.shopData.productos_seleccionados);
            });

        this.actionsCategories = this.actionsObj.pipe(filter((res: SetCategoriesAction) => res.type === SET_CATEGORIES))
            .subscribe((res) => {
                this.categories = res.categories.filter(function (el) {
                    return el.categoria_padre == '' || !el.categoria_padre;
                });
            if (!this.filter_marca){
                if (this.categories.length == 0) {
                    this.navigation.justBack();
                    this.loadingController.getTop().then(loading => {
                        if (loading) {
                            this.store.dispatch(new LoadingOff());
                        }
                    });
                    this.generalPropuseAlert('No hay categorías disponibles.');
                    this.store.dispatch(new LoadingOff());
                    return false;
                }
                this.store.dispatch(new GetOffersActions(this.user.token, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, 1, this.limitQuery));
        
                this.idCategorySel = (this.categories.length >= this.indexCategorySel) ? this.categories[this.indexCategorySel].id : this.categories[0].id;

            }else{
                this.filters.typeSegment = 2;
                this.filter_marca = this.dataIn.brand_name;
                this.setFilter();
                setTimeout(() => {
                    this.searchBranch(this.filter_marca);
                }, 1000);
            }
        });

        this.actionsProducts = this.actionsObj.pipe(filter((res: SetProductsAction) => res.type === SET_PRODUCTS))
            .subscribe(async (res) => {
                this.finishLoad = true;
                if (res.error) {
                    this.scrollDownStatus = true;
                    return;
                }

                if (this.brand && this.brand.id && (!res.products || res.products.length == 0)) {
                    this.navigation.justBack();
                    this.loadingController.getTop().then(loading => {
                        if (loading) {
                            this.store.dispatch(new LoadingOff());
                        }
                    });
                    this.generalPropuseAlert('Esta marca no cuenta con productos disponibles.');
                    return false;
                }
                setTimeout(() => this.scrollDownStatus = true, 1000);
                if (res.category_id) {
                    const indexCategorySel = this.categories.findIndex((el) => el.id == res.category_id);
                    this.categories[indexCategorySel].paginateProducts = res.paginate;
                    /* Si la categoría no tiene productos, agrega los productos */
                    if (!this.categories[indexCategorySel].products || this.categories[indexCategorySel].products.length == 0) {
                        this.categories[indexCategorySel].products = res.products;
                    } else if (this.categories[indexCategorySel].products && this.categories[indexCategorySel].products.length > 0 && res.products && res.products.length > 0 ) {
                        this.categories[indexCategorySel].products = [...this.categories[indexCategorySel].products, ...res.products];
                    }
                }
                this.store.dispatch(new LoadingOff());
                /* Compara con productos selecionados */
                this.updateQuantityProducts(res.productsSel);
            });

        this.actionsCountProductsOrder = this.actionsObj.pipe(filter((res: CountProductsOrderAction) => res.type === COUNT_PRODUCTS_ORDER))
            .subscribe((res) => {
                this.animateThing();
                let lastnProducts = this.nProducts;
                this.nProducts = res.nProducts;
                this.cashRegisterServices.getOrderValue((success) => {
                    this.orderValue = success;
                });
                
                //poner punto rojo en la burbuja 
                this.cashRegisterServices.setRedPointBaloon(active =>{
                    if (lastnProducts !=0 && lastnProducts != this.nProducts){
                        this.hasEdit = active;
                    }
                });
            });

        this.actionsOnlyOffers = this.actionsObj.pipe(filter((res: SetOnlyOffersActions) => res.type === SET_ONLY_OFFERS))
            .subscribe((res) => {
                this.store.dispatch(new LoadingOff());
                if (res.offers.length > 0) {
                    this.categories[this.indexCategorySel].paginateProducts = res.paginate;
                    this.categories[this.indexCategorySel].products = res.offers;
                    this.updateQuantityProducts(this.shopData.productos_seleccionados);
                } else {
                    this.navigation.justBack();
                    this.loadingController.getTop().then(loading => {
                        if (loading) {
                            this.store.dispatch(new LoadingOff());
                        }
                    });
                    this.generalPropuseAlert('No hay ofertas disponibles.');
                    return false;
                }
            });

        this.actionsOffers = this.actionsObj.pipe(filter((res: SetOffersActions) => res.type === SET_OFFERS))
            .subscribe((res) => {
                this.finishLoad = true;

                if (res.error) {
                    this.scrollDownStatus = true;
                    return;
                }

                setTimeout(() => {
                    this.scrollDownStatus = true;
                    this.store.dispatch(new LoadingOff());
                }, 1000);
                const indexCategorySel = this.categories.findIndex((el) => el.id == ExtendedCategories.offer);
                if (res.offers.length > 0) {
                    if (indexCategorySel === -1) {
                        const categoryOffert: ICategory = {
                            paginateProducts: res.paginate,
                            categoria_padre: '',
                            descripcion: '',
                            id: ExtendedCategories.offer,
                            imagen: '',
                            nombre: 'OFERTAS',
                            oferta: 0,
                            products: res.offers,
                            scrollTop: 0,
                        };
                        let indexSegmentedOffer =  this.categories.findIndex(el => el.id == ExtendedCategories.segmented_offer);
                        if (indexSegmentedOffer !== -1) { // Si existe la categoría "Solo para ti (Oferta segmentada)" 
                            this.categories.splice((indexSegmentedOffer+1), 0, categoryOffert);
                            this.indexCategorySel = 0;
                            this.store.dispatch(new GetProductsAction(this.user.token, this.shopData.id, ExtendedCategories.segmented_offer, this.compania_id, this.distributor_id, this.portafolio, this.typeSegmentSelected, 1, this.limitQuery, this.shopData.productos_seleccionados, this.user.role));
                        }else{
                            this.categories.unshift(categoryOffert);
                            this.store.dispatch(new FilterProductsAction(this.shopData.productos_seleccionados));
                            this.updateQuantityProducts(this.shopData.productos_seleccionados);
                            this.indexCategorySel = 0;
                            if (res.offers.length <= 2) {
                                const idCategorySelNext = this.categories[this.indexCategorySel + 1].id;
                                this.store.dispatch(new GetProductsAction(this.user.token, this.shopData.id, idCategorySelNext, this.compania_id, this.distributor_id, this.portafolio, this.typeSegmentSelected, 1, this.limitQuery, this.shopData.productos_seleccionados, this.user.role));
                            }
                        }
                    } else {
                        this.categories[indexCategorySel].paginateProducts = res.paginate;
                        this.indexCategorySel = indexCategorySel;
                        if (this.categories[this.indexCategorySel].products && this.categories[this.indexCategorySel].products.length > 0 && res.offers && res.offers.length > 0 ) {
                            this.categories[this.indexCategorySel].products = [...this.categories[this.indexCategorySel].products, ...res.offers];
                            this.store.dispatch(new FilterProductsAction(this.shopData.productos_seleccionados));
                            this.updateQuantityProducts(this.shopData.productos_seleccionados);
                        }
                    }
                    this.idCategorySel = this.categories[this.indexCategorySel].id;
                } else {
                    this.store.dispatch(new GetProductsAction(this.user.token, this.shopData.id, this.idCategorySel, this.compania_id, this.distributor_id, this.portafolio, this.typeSegmentSelected, 1, this.limitQuery, this.shopData.productos_seleccionados, this.user.role));
                }
            });

        this.actionsSearchProducts = this.actionsObj.pipe(filter((res: SetSearchProductsAction) => res.type === SET_SEARCH_PRODUCTS))
            .subscribe((res) => {
                if (res.error) {
                    this.finishLoad = true;
                    this.activeScroll = true;
                    this.scrollDownStatus = true;
                    this.store.dispatch(new LoadingOff());
                    return;
                }
                this.finishLoad = true;
                setTimeout(() => {
                    this.activeScroll = true;
                    this.scrollDownStatus = true;
                    this.store.dispatch(new LoadingOff());
                }, 1000);
                const indexCategorySel = this.categories.findIndex((el) => el.id == ExtendedCategories.search);

                if (res.products.length > 0) {
                    if (indexCategorySel === -1) {
                        let nameSearch = 'BÚSQUEDA';
                        const categorySearch = {
                            categoria_padre: '',
                            descripcion: '',
                            id: ExtendedCategories.search,
                            imagen: '',
                            nombre: nameSearch,
                            oferta: 0,
                            products: [],
                            paginateProducts: res.paginate,
                            scrollTop: 0,
                        };
                        if (this.user.role == Roles.seller && this.brandList.length > 0) {
                            if (this.brandList.findIndex(b => b.id == ExtendedCategories.search) === -1) {
                                this.brandList.unshift(
                                    {
                                        id: ExtendedCategories.search,
                                        nombre: nameSearch,
                                    }
                                )
                            }
                            this.categories[0].id = ExtendedCategories.search;
                            this.categories[0].nombre = nameSearch;
                            this.categories[0].products = [];
                        } else {
                            this.categories.unshift(categorySearch);
                        }
                        this.indexCategorySel = 0;
                    } else {
                        this.categories[indexCategorySel].paginateProducts = res.paginate;
                        this.indexCategorySel = indexCategorySel;
                    }
                    this.idCategorySel = this.categories[this.indexCategorySel].id;

                    // Si es solo busqueda, se da un tiempo para agregar los productos y seleccionar la categoría
                    const timeAddProds = (this.dataOnlySearch && this.dataOnlySearch.isOnlySearch) ? 500 : 0;
                    setTimeout(() => {
                        if (!this.categories[this.indexCategorySel].products || this.categories[this.indexCategorySel].products.length == 0 || res.paginate.current_page == 1) {
                            this.categories[this.indexCategorySel].products = res.products;
                            if (!this.dataOnlySearch || !this.dataOnlySearch.isOnlySearch) {
                                this.selectCategory(ExtendedCategories.search);
                            }
                        } else if (this.categories[this.indexCategorySel].products && this.categories[this.indexCategorySel].products.length > 0 && res.products && res.products.length > 0 ) {
                            this.categories[this.indexCategorySel].products = [...this.categories[this.indexCategorySel].products, ...res.products];
                        }
                        this.store.dispatch(new FilterProductsAction(this.shopData.productos_seleccionados));
                        this.updateQuantityProducts(this.shopData.productos_seleccionados);
                        if (this.deepLink && this.search == '') {
                            this.categories[this.indexCategorySel].products.forEach(p => p.deeplink = true);
                        }
                        // this.categories[this.indexCategorySel].products = res.products;
                        // this.store.dispatch(new FilterProductsAction(this.shopData.productos_seleccionados, true, ExtendedCategories.search));

                    }, timeAddProds);
                } else {
                    if (indexCategorySel >= 0) {
                        this.categories.splice(indexCategorySel, 1);
                        if (indexCategorySel == this.indexCategorySel && this.categories.length > 0) { this.idCategorySel = this.categories[0].id; }
                    }
                    this.generalPropuseAlert('Término no encontrado, intenta una nueva palabra');
                    if (this.dataOnlySearch && this.dataOnlySearch.isOnlySearch || this.categories.length == 0) {
                        setTimeout(()=>{
                            this.navigation.justBack();
                        },500);
                    }
                }
            });

/*
        */
    
    }

    //seteo de marca automatico
    searchBranch(branch_name){
        let branch = this.categories.filter(item => branch_name.toLowerCase().indexOf(item.nombre.toLowerCase()) !== -1 );
        let brandId = (branch.length > 0) ? branch[0].id : false;
        if(!brandId){
            let company = this.portaCompleta.filter(item => { //item.nombre.toLowerCase() == branch_name.toLowerCase()
                if (branch_name.toLowerCase().indexOf(item.nombre.toLowerCase()) !== -1 ){
                    return item;
                }
            });
            let br: any = this.categories; 
            let bran = br.filter((item) => {
                if (item.compania_id==company[0].id){
                    return item;
                }
             });
            let random = Math.floor(Math.random() * (bran.length-1 - 0 + 1) + 0);
            brandId = bran[random].id;
        }
        //buscar la categoria para
        this.selectCategory(brandId);
    }
    
    createCategoryOffer() {
        const categoryOffert: ICategory = {
            paginateProducts: null,
            categoria_padre: '',
            descripcion: '',
            id: ExtendedCategories.offer,
            imagen: '',
            nombre: 'OFERTAS',
            oferta: 0,
            products: [],
            scrollTop: 0,
        };
        this.categories.unshift(categoryOffert);
        this.typeSegmentSelected = 1;
        this.idCategorySel = ExtendedCategories.offer;
        this.store.dispatch(new FilterProductsAction(this.shopData.productos_seleccionados));
        this.store.dispatch(new GetOffersActions(this.user.token, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, 1, this.limitQuery, true));
    }

    createCategoryBrand(brand_id, brand_nombre) {
        const categoryOffert: ICategory = {
            paginateProducts: null,
            categoria_padre: '',
            descripcion: '',
            id: brand_id,
            imagen: '',
            nombre: brand_nombre,
            oferta: 0,
            products: [],
            scrollTop: 0,
        };
        this.categories.unshift(categoryOffert);
        this.selectBranchBySeller(brand_id, brand_nombre);
    }

    selectBranchBySeller(brand_id, brand_nombre) {
        let indexSearch = this.brandList.findIndex(b => b.id == ExtendedCategories.search);
        if (brand_id == ExtendedCategories.search && indexSearch >= 0) return;
        if (brand_id != ExtendedCategories.search && indexSearch >= 0) {
            this.brandList.splice(indexSearch, 1);
        }
        this.categories[0].id = brand_id;
        this.categories[0].nombre = brand_nombre;
        this.categories[0].products = [];
        setTimeout(() => {
            this.typeSegmentSelected = 2;
            this.idCategorySel = brand_id;
            this.store.dispatch(new FilterProductsAction(this.shopData.productos_seleccionados));
            this.store.dispatch(new GetProductsAction(this.user.token, this.shopData.id, this.idCategorySel, this.compania_id, this.distributor_id, this.portafolio, this.typeSegmentSelected, 1, this.limitQuery, this.shopData.productos_seleccionados, this.user.role));
            this.moveScrollSegments();
        }, 800);
    }

    searchProducts(search, first = false) {
        this.search = search;
        if (search != '') {
            if (!first) {
                this.store.dispatch(new LoadingOn());
            }

            this.activeScroll = false;
            this.store.dispatch(new GetSearchProductsAction(this.user.token, this.search, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, null, 1));
            if (this.ordersProducts && this.ordersProducts.virtual) {
                this.ordersProducts.virtual.scrollToIndex(0);
            }
        } else {
            const indexCategorySel = this.categories.findIndex((el) => el.id == ExtendedCategories.search);
            if (indexCategorySel !== -1) {
                this.categories.splice(indexCategorySel, 1);
                if (indexCategorySel == this.indexCategorySel) { this.idCategorySel = this.categories[0].id; }
            }
        }
        let rol = this.user.role;
        this.analyticsService.sendEvent('busqueda_' + rol, { 'event_category': 'busqueda', 'event_label': 'busqueda_' + search });
    }

    updateQuantityProducts(productsSel) {
        productsSel = (!productsSel) ? [] : Object.values(productsSel);
        let productWithQuantityPending = true;
        /* Compara productos con los seleccionados y actuailza cantidad */
        this.categories.forEach(category => {
            productWithQuantityPending = true;
            if (category.products && category.products.length > 0) {
                category.products.forEach(product => {
                    productWithQuantityPending = true;
                    productsSel.forEach(productSel => {
                        if (product.id == productSel.id) {
                            productWithQuantityPending = false;
                            product.cantidad = productSel.cantidad;
                            if (!product.portafolio) { product.portafolio = productSel.portafolio; }
                        }
                    });
                    if (productWithQuantityPending) {
                        product.cantidad = 0;
                    }
                });
            }
        });

    }

    eventScroll(event, type) {
        if (this.user.role != type){
            return;
        }

        this.scroll(event);
    }

    scroll(event) {
        const halfHeigth75 = ((this.heigthScreen / 4) * 1);
        const halfHeigth50 = (this.heigthScreen / 2);
        let scrollTopTemp = 0;
        if (!event.detail) {
            scrollTopTemp = event.target.scrollTop;
        } else {
            scrollTopTemp = event.detail.scrollTop;
        }
        if (this.activeScroll && scrollTopTemp > this.scrollTop) {
            // Scroll hacia abajo
            if (this.scrollDownStatus) {
                let catCurrentHeigth = document.getElementById('list-cat-prod-' + this.indexCategorySel).offsetHeight;
                const moreProductsClass = document.querySelector('#list-cat-prod-' + this.indexCategorySel + ' .more-products');
                if (moreProductsClass) {
                    catCurrentHeigth = catCurrentHeigth - 200;
                }
                if (this.categories[this.indexCategorySel + 1]) {
                    const catScrollTopAft = document.getElementById('list-cat-prod-' + (this.indexCategorySel + 1));
                    if (catScrollTopAft && Number(scrollTopTemp + halfHeigth50) > Number(catScrollTopAft.offsetTop - 200)) {
                        if (this.categories[this.indexCategorySel].paginateProducts && this.categories[this.indexCategorySel].paginateProducts.next_page_url) {
                            this.scrollDownStatus = false;
                            this.finishLoad = false;
                            const nextPage = (this.categories[this.indexCategorySel].paginateProducts.current_page + 1);
                            if (this.categories[this.indexCategorySel].id == ExtendedCategories.search) {
                                this.store.dispatch(new GetSearchProductsAction(this.user.token, this.search, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, null, nextPage));
                            } else if (this.categories[this.indexCategorySel].id == ExtendedCategories.offer) {
                                if (this.user.role == 'cliente') {
                                    this.store.dispatch(new LoadingOn())
                                }
                                this.store.dispatch(new GetOffersActions(this.user.token, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, nextPage, this.limitQuery));
                            } else {
                                this.store.dispatch(new GetProductsAction(this.user.token, this.shopData.id, this.idCategorySel, this.compania_id, this.distributor_id, this.portafolio, this.typeSegmentSelected, nextPage, this.limitQuery, this.shopData.productos_seleccionados, this.user.role));
                            }
                        } else {
                            this.nextCategory();
                            if (!this.categories[this.indexCategorySel].products) {
                                this.scrollDownStatus = false;
                                // sin productos
                                this.addProdsToCategories();
                            }
                        }
                    }
                } else if (
                    Number(scrollTopTemp + this.heigthScreen) > Number(catCurrentHeigth) &&
                    this.categories[this.indexCategorySel].paginateProducts &&
                    this.categories[this.indexCategorySel].paginateProducts.next_page_url
                ) { // Si no hay categorías siguientes pero hay más productos (paginate)
                    this.scrollDownStatus = false;
                    this.finishLoad = false;
                    const nextPage = (this.categories[this.indexCategorySel].paginateProducts.current_page + 1);
                    if (this.categories[this.indexCategorySel].id == ExtendedCategories.search) {
                        this.store.dispatch(new GetSearchProductsAction(this.user.token, this.search, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, null, nextPage));
                    } else if (this.categories[this.indexCategorySel].id == ExtendedCategories.offer) {
                        this.store.dispatch(new GetOffersActions(this.user.token, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, nextPage, this.limitQuery));
                    } else {
                        this.store.dispatch(new GetProductsAction(this.user.token, this.shopData.id, this.idCategorySel, this.compania_id, this.distributor_id, this.portafolio, this.typeSegmentSelected, nextPage, this.limitQuery, this.shopData.productos_seleccionados, this.user.role));
                    }
                }
            }
        } else if (this.activeScroll) {
            // Scroll hacia arriba
            const catScrollTopAft = document.getElementById('list-cat-prod-' + this.indexCategorySel);
            if (catScrollTopAft && this.indexCategorySel > 0 && ((scrollTopTemp + halfHeigth75) < Number(catScrollTopAft.offsetTop) || (this.indexCategorySel == 1  && (scrollTopTemp) < Number(catScrollTopAft.offsetTop)))) {
                this.lastCategory();
                if (!this.categories[this.indexCategorySel].products) {
                    this.scrollDownStatus = false;
                    // sin productos
                    this.addProdsToCategories();
                }
            }
        }
        this.scrollTop = scrollTopTemp;
    }

    refreshData(event?) {
        this.store.dispatch(new GetCategoriesAction(this.user.token, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, this.typeSegmentSelected, event));
    }

    addProdsToCategories() {
        this.shopData = this.shopSingletonService.getSelectedShop();
        this.store.dispatch(new GetProductsAction(this.user.token, this.shopData.id, this.idCategorySel, this.compania_id, this.distributor_id, this.portafolio, this.typeSegmentSelected, 1, this.limitQuery, this.shopData.productos_seleccionados, this.user.role));
    }

    nextCategory() {
        this.indexCategorySel++;
        this.idCategorySel = this.categories[this.indexCategorySel].id;
        this.moveScrollSegments();
    }

    lastCategory() {
        this.indexCategorySel--;
        this.idCategorySel = this.categories[this.indexCategorySel].id;
        this.moveScrollSegments(true);
    }
 
    selectCategory(categoryId) {
        let catNombre = '';
        this.categories.forEach((element , index , object) => {
            if (element.id == categoryId) {
                catNombre = element.nombre;
            }
        });
        this.analyticsService.sendEvent('click', { 'event_category': 'tipo_categoria', 'event_label': catNombre + '_' + this.compania_id });
        this.activeScroll = false;
        this.indexCategorySel = this.categories.findIndex((el) => el.id == categoryId);
        this.idCategorySel = this.categories[this.indexCategorySel].id;
        const catScrollTopAft = document.getElementById('list-cat-prod-' + this.indexCategorySel).offsetTop;
        this.content.scrollToPoint(0, Number(catScrollTopAft), 500)
            .finally(() => {
                this.activeScroll = true;
            });
        if (this.ordersProducts && this.ordersProducts.virtual) {
            this.ordersProducts.virtual.scrollToIndex(0);
        }
        this.moveScrollSegments();
        if (!this.categories[this.indexCategorySel].products) {
            this.scrollDownStatus = false;
            // sin productos
            this.addProdsToCategories();
        }
    }

    moveScrollSegments(reverse = false) {
        const el = document.getElementById('segment-' + this.idCategorySel);
        el.scrollIntoView(true);
        if (reverse) {
            document.getElementById('segments').scrollLeft -= 50;
        } else {
            document.getElementById('segments').scrollLeft += 50;
        }
    }

    async showFilter() {
        const modal = await this.modal.create(<ModalOptions>{
            component: PedidosFiltroComponent,
            cssClass: 'filter-modal',
            componentProps: {
              filter: this.filters
            }
        });

        modal.onDidDismiss().then(res => {
            if (!res.data) {
                return;
            }

            if (res.data.typeSegment == 1){
                this.filter_marca = false;
            }
            this.filters = res.data;
            this.store.dispatch(new LoadingOn());
            this.setFilter();
        });

        return await modal.present();
    }

    setFilter() {
        if (this.filters.typeSegment != this.typeSegmentSelected) {
            let type = (this.typeSegmentSelected == 1)?"marcas":"categorias";
            this.analyticsService.sendEvent('apli_filtro_seg_prod', { 'event_category': 'apli_filtro_seg_prod', 'event_label':'apli_filtro_seg_prod_' + type });
            this.shopData = this.shopSingletonService.getSelectedShop();
            this.categories = [];
            this.typeSegmentSelected = this.filters.typeSegment;
            this.store.dispatch(new GetCategoriesAction(this.user.token, this.shopData.id, this.compania_id, this.distributor_id, this.portafolio, this.typeSegmentSelected,));
        }
    }

    async abrirCarrito() {
        let rol =  (this.user.role =="vendedor")?"vendedor":"tendero";
        this.analyticsService.sendEvent('abre_carro_' + rol, { 'event_category': 'abre_carro_paso_1', 'event_label': 'abre_carro_' + rol});

        const modal = await this.modal.create(<any>{
            component: GeneralCarritoComprasComponent,
            backdropDismiss: false,
            cssClass: 'shopping-cart',
            componentProps: {
                shopData: this.shopData,
                edit: this.hasEdit,
                user: this.user
            },
        });

        return await modal.present();
    }

    ngOnDestroy() {
        this.actionsOnlyOffers.unsubscribe();
        this.actionsOffers.unsubscribe();
        this.subsOfflineDynamic.unsubscribe();
        this.actionsCompareProducts.unsubscribe();
        this.actionsCategories.unsubscribe();
        this.actionsCountProductsOrder.unsubscribe();
        this.actionsProducts.unsubscribe();
        this.actionsSearchProducts.unsubscribe();
    }

    public animateThing(): void {
        this.thingState = 'end';
        setTimeout(() => {
            this.thingState = 'start';
        }, 200);
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

    focusEvent() {
        this.showButtonBarcode = true;
    }

    blurEvent() {
        this.showButtonBarcode = false;
    }
}
