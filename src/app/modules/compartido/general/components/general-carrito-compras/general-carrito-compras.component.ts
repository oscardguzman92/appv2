import { ModalOptions } from '@ionic/core';
import {
    Component,
    OnInit,
    Input,
    ViewChild,
    OnDestroy,
    LOCALE_ID,
    ElementRef
} from '@angular/core';
import {ModalController, NavParams, IonContent} from '@ionic/angular';
import {ActionsSubject, Store} from '@ngrx/store';
import {of, Subscription, TimeoutError} from 'rxjs';
import {catchError, filter, map, finalize} from 'rxjs/operators';
import {
    FilterProductsAction,
    CountProductsOrderAction,
    COUNT_PRODUCTS_ORDER,
    CompareProducts,
} from '../../../pedidos/store/orders.actions';
import {Shop} from 'src/app/models/Shop';
import {AppState} from 'src/app/store/app.reducer';
import {LoadingOff, LoadingOn} from '../../store/actions/loading.actions';
import {Storage} from '@ionic/storage';
import {IProduct} from 'src/app/interfaces/IProduct';
import {ToastController} from '@ionic/angular';
import {AlertController} from '@ionic/angular';

import {CurrencyPipe, DatePipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

import {OrdersService} from '../../../../../services/orders/orders.service';
import {Order} from 'src/app/models/Order';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {UtilitiesHelper} from 'src/app/helpers/utilities/utilities.helper';
import {AnalyticsService} from 'src/app/services/analytics/analytics.service';
import {IonSlides, Platform} from '@ionic/angular';

import {Geolocation} from '@ionic-native/geolocation/ngx';
import {CashRegisterService} from 'src/app/services/orders/cash-register.service';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {Device} from '@ionic-native/device/ngx';
import {CompaniesPortfolioShopkeeperService} from 'src/app/services/orders/companies-portfolio-shopkeeper.service';
import {IUser} from 'src/app/interfaces/IUser';
import {TypeKart} from 'src/app/enums/typeKart.enum';
import {OneSignalService} from 'src/app/services/oneSignal/one-signal.service';
import {ValidateLastProductInCarService} from '../../../../../services/orders/validate-last-product-in-car.service';
import {IShops} from 'src/app/interfaces/IShops';
import {SetOfflineDynamicAction} from '../../../../vendedor/compartido/store/offlineDynamic/offlineDynamic.actions';
import {Fail} from '../../store/actions/error.actions';
import {CacheService} from 'ionic-cache';
import {PrinterService} from 'src/app/services/printer/printer.service';

import {
    LocalNotification,
    LocalNotificationService,
} from 'src/app/services/localNotification/local-notification.service';
import {GraphqlService} from '../../../../../services/graphql/graphql.service';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';

declare var google;

import {ICredit} from '../../../../../interfaces/ICredit';
import {
    GetMyCreditsAction,
    SET_MY_CREDITS,
    SetMyCreditsAction,
    GetMethodsyPayAction,
    SET_METHODS_PAY_CREDIT,
    SetMethodsyPayAction,
    SetPurcahseCreditAction,
    GetMyCreditsEntityAction,
    SET_MY_CREDITS_ENTITY,
    SetMyCreditsEntityAction,
} from '../../../../tendero/creditos/pages/store/credits.actions';
import {GetBalanceAction, SET_BALANCE, SetBalanceAction} from '../../../../tendero/recargas/store/currentAccount/currentAccount.actions';
import {IPurchases} from '../../../../../interfaces/IPurchases';
import {GetMyBalanceAction, SetMyBalanceAction, SET_MY_BALANCE} from '../../../../tendero/creditos/pages/store/credits.actions';
import { Roles } from 'src/app/enums/roles.enum';
import { ApiService } from 'src/app/services/api/api.service';
import { MsgErrorService } from 'src/app/services/api/msg-error.service';
import { ModalPedidoEnConflictoComponent } from 'src/app/modules/vendedor/compartido/components/modal-pedido-en-conflicto/modal-pedido-en-conflicto.component';

@Component({
    selector: 'app-general-carrito-compras',
    templateUrl: './general-carrito-compras.component.html',
    styleUrls: ['./general-carrito-compras.component.scss'],
    providers: [DatePipe],
})
export class GeneralCarritoComprasComponent implements OnInit {
    math = Math;
    public typeKart = TypeKart;
    public slideOpts = {
        initialSlide: 0,
        slidesPerView: 1,
        spaceBetween: 0,
        centeredSlides: true,
        allowTouchMove: false,
        zoom: false,
    };

    public liquidador = {
        url: '',
        token: '',
        token_body: '',
    };
    @ViewChild('cashInput') cashInput;
    @ViewChild('creditstoreappInput') creditstoreappInput;
    @ViewChild('creditInput') creditInput;

    @ViewChild('slideWithNav') slides: IonSlides;
    @Input() offlineDynamic: boolean;
    @Input() user: IUser;
    public firstSlideActive = true; // bandera que indica si el slider 1 esta activo
    public secondSlideActive = false; // bandera que indica si el slider 2 esta activo
    public thirdSlideActive = false; // bandera que indica si el slider 3 esta activo
    public fourSlideActive = false; // bandera que indica si el slider 4 esta activo
    public suggestedProducts = [];
    public karts: any[] = [];
    public roles = Roles;

    public nProducts = 0;
    public companiasProducts = [];
    public actionsCountProductsOrder = new Subscription();

    public scroll = ''; // clase que pone icono scroll
    public scrollHorizontal = ''; // clase que pone icono scroll
    public toggle = true; // ruta normal
    public toggle2 = false; // express
    public forceToggle = false; // no esta activo el express forza ruta normal
    public onExpressSucessApplyValue = 0; // si se aplico el peiddo express el valor que debe suma
    public onExpressSucessApplyDay = ''; // si se aplico el peiddo express el nuevo dia de entrega
    public notApplyExpressValue = true; // si se no se ha agregado el valor de express al total

    public cuponUsed = false; // han usado un cupon
    public onCuponSucessApplyValue = 0; // si se aplico el cupon de descuento el valor que debe restar
    public comment = ''; // han usado comentario ?
    public schedule = 'indistinto'; // han usado comentario ?
    public fechaEntrega = ''; // fecha de entrega pedido
    public fechaEntregaTemp = ''; // si existe express se almacena temporalmente la fecha

    public cuponButtonDisabled = false;
    public methodsPay;
    public shopData: Shop;
    public products: IProduct[] = [];
    public countProdTemp = 0;
    storeSubs = new Subscription();
    isOfflineActive: boolean;
    token: string;
    order: Order;
    totalOrder = 0;
    totalOrderIVA = 0;
    total = 0;
    usu: any;
    setOrderSuccess = false; // envio el pedido exitosamente ?
    setOrderSuccessMessage = ''; // Mensaje con fechas de entrega de pedido etc
    setOrderSuccessResponse: any; // obj de respuesta con data de express
    role: string;
    expressOrderActive = false; //
    expressOrderButtonText: string;
    confirmOrderButtonText: string;
    distri: string;
    newSendDate: any;
    calendarIsOpened: boolean;
    days: string[];
    monthNames: string[];
    daysShort = ['D','L','M','M','J','V','S'];
    monthNamesShort = [
            'Ene',
            'Feb',
            'Mar',
            'Abr',
            'May',
            'Jun',
            'Jul',
            'Ago',
            'Sep',
            'Oct',
            'Nov',
            'Dic',
        ];
    now: string;
    public statusInputCountProd = false;
    totalOrderImpo: number;
    totalImpo: number;
    descuentoDistribuidor: number;
    totalOrderDistribuidor: number;
    totalOrderIVADistribuidor: number;
    totalDistribuidor: number;
    descuento: number = 0;
    oldValue: number;

    platformWidth: any;
    coor: {
        lat: number;
        lng: number;
    };
    statusOrderClose: boolean = true;

    public hasEditMesage = false;
    devicesBluetooth: Array<any> = [];
    isEnabled = false;

    public autoVenta = true;
    totalPts: any;
    vendedor: any;
    pedido_id: any;
    distribuidor: any;
    descuento_oferta_especial = 0;
    descuento_productos_especial = 0;
    descuento_productos_lineal = 0;

    /* creditos */
    public credits: ICredit[];
    private creditsSubs = new Subscription();
    private accountSubs = new Subscription();
    private methodsSubs = new Subscription();
    public balance: string;
    public totalAvalaibleCredits: string;
    public totalAmountCredits: string;
    public totalMethods = 0;
    public selectCredits: any;
    public selectedCredit = false;
    public selectedCash = false;
    public selectedstoreappCredit = false;
    public activeMethodPay = false;
    public amountCash = null;
    public amountstoreappCredit = null;
    public purchase: IPurchases = {
        amount: 0,
        payment: 0,
        arrear: false,
        created_at: '',
        credit_id: '',
        description: '',
        interest: 0,
        is_order: false,
        is_recharge: false,
        mysql_item_id: 0,
        name: '',
        number_fee: 0,
        paid_out: false,
        updated_at: '',
        state: '',
    };
    ultima_hora_edicion: any;
    en_conflicto: boolean = false;

    constructor(
        private actionsObj: ActionsSubject,
        private actionsSubj: ActionsSubject,
        private geolocation: Geolocation,
        private modal: ModalController,
        private modalController: ModalController,
        private store: Store<AppState>,
        private storage: Storage,
        private orderService: OrdersService,
        public toastController: ToastController,
        public alertController: AlertController,
        private navigation: NavigationHelper,
        private util: UtilitiesHelper,
        private analyticsService: AnalyticsService,
        private cashRegister: CashRegisterService,
        private platform: Platform,
        private diagnostic: Diagnostic,
        private device: Device,
        private cashRegisterService: CashRegisterService,
        private oneSignal: OneSignalService,
        private companiesPortfolioShopkeeperService: CompaniesPortfolioShopkeeperService,
        private validateLastProductInCarService: ValidateLastProductInCarService,
        private navParams: NavParams,
        private cache: CacheService,
        private localNotification: LocalNotificationService,
        private printer: PrinterService,
        public shopSingletonService: ShopSingletonService,
        private graphql: GraphqlService,
        private datePipe: DatePipe,
        private route: ActivatedRoute,
        private currency: CurrencyPipe,
        private apiService: ApiService,
        private msgErrorService: MsgErrorService,
    ) {
        this.platformWidth = this.platform.width();
        this.user = this.route.snapshot.data['user'];
    }

    ngOnInit() {
        this.hasEditMesage = this.navParams.data.edit
            ? this.navParams.data.edit
            : false;
        this.isEnable();    
        this.getDevicesBluetooth();
        this.slides.slideTo(0);
        this.firstSlideActive = true;
        this.storeSubs = this.store.subscribe((state) => {
            this.isOfflineActive = state.offline.active;
        });

        this.actionsCountProductsOrder = this.actionsObj
            .pipe(
                filter(
                    (res: CountProductsOrderAction) => res.type === COUNT_PRODUCTS_ORDER
                )
            )
            .subscribe((res) => {
                this.nProducts = res.nProducts;
            });

        this.storage.get('user').then((usu) => {
            this.usu = JSON.parse(usu);
            this.token = this.usu.token;
            this.role = this.usu.role;
            if (this.role === 'vendedor') {
                this.distri = this.usu.distribuidor.nombre;
                this.autoVenta = this.usu.auto_venta ? this.usu.auto_venta : false;
            }

            this.shopData = this.shopSingletonService.getSelectedShop();
            const dataCompanies = this.companiesPortfolioShopkeeperService.getCompaniesPortfolios();
            this.products = (!this.shopData.productos_seleccionados) ? [] : Object.values(this.shopData.productos_seleccionados);
            let pedido, descuento_oferta_especial = 0;
            this.descuento = 0;
            let cajas = 0;
            this.products.forEach((prod) => {
                if (prod.unidad_empaque) {
                    prod.unidad_empaque = (prod.unidad_empaque > 0) ? prod.unidad_empaque : 1;
                    cajas += prod.cantidad / prod.unidad_empaque;
                }
            });
            this.products.forEach((element, index, object) => {
                const validateDescuento = this.cashRegister.aplicarReglas(element, cajas);
                if (validateDescuento > 0) {
                    element.valor_descuento_total_especial = validateDescuento;
                    this.descuento += validateDescuento;
                }

                let is_obsequio = this.is_gift(element);
                if(is_obsequio){
                    element.obsequio = true; 
                    element.obsequio_referencia = is_obsequio.codigo; 
                    element.obsequio_cantidad = is_obsequio.cantidad; 
                }
            });
             
            this.products.forEach((element, index, object) => {
                this.descuento += +element.valor_descuento_total_especial || 0;
                if (element.oferta_especial && +element.descuento > 0) {
                    element.precio = (element.precio_unitario + ((+element.precio_unitario *  +element.iva)));
                }
                if (element.pedido) {
                    pedido = element.pedido;
                }
                const carritoCompania: any = {
                    compania: '',
                    companiaId: '',
                    products: [],
                    nProducts: 0,
                    active: false,
                    setOrderSuccess: false,
                    setOrderSuccessMessage: '',
                    setOrderSuccessResponse: {},
                    pedido: null,
                    fecha_entrega: null,
                };
                if (element.descuento_oferta_especial && descuento_oferta_especial <= 0) {
                    descuento_oferta_especial = element.descuento_oferta_especial;
                }
                // si hay compañias busca la compañia del producto actual y lo agrega, sino crea la compañia y agrega el producto
                if (this.karts.length > 0) {
                    let existCompania = false;
                    if (this.role === 'vendedor') {
                        this.karts[0].products.push(element);
                        this.karts[0].companiaId = element.compania_id;
                        this.karts[0].pedido = pedido;
                        this.karts[0].descuento_oferta_especial = descuento_oferta_especial;
                        this.karts[0].descuento_productos_especial = this.descuento_productos_especial;
                        if (element.fecha_entrega) {
                            this.karts[0].fecha_entrega = element.fecha_entrega;
                        }
                        let num = 0;
                        this.karts[0].products.forEach((ele) => {
                            num = num + ele.cantidad;
                        });
                        this.karts[0].nProducts = num;
                    } else {
                        let portfolio;
                        if (element.portafolio) {
                            portfolio = this.companiesPortfolioShopkeeperService.searchByPortfolio(
                                element.portafolio
                            );
                        } else {
                            portfolio = this.companiesPortfolioShopkeeperService.searchInPortfolio(
                                element.compania_id
                            );
                        }
                        for (let i = 0; i < this.karts.length; i++) {
                            if (this.karts[i].compania_id === element.compania_id) {
                                this.karts[i].pedido = element.pedido;
                                this.karts[i].descuento_oferta_especial = descuento_oferta_especial;
                                this.karts[i].descuento_productos_especial = this.descuento_productos_especial;
                            }
                            if (
                                (this.karts[i].tipoCarro == TypeKart.company &&
                                    (this.karts[i].compania == element.compania ||
                                        this.karts[i].companiaId == element.compania_id)) ||
                                (this.karts[i].tipoCarro == TypeKart.portfolio &&
                                    portfolio &&
                                    (this.karts[i].portafolio == element.portafolio ||
                                        this.karts[i].portafolio == portfolio.portafolio) &&
                                    (this.karts[i].distribuidor == portfolio.nom_dist ||
                                        this.karts[i].distribuidorId == portfolio.distribuidor_id))
                            ) {
                                existCompania = true;
                                const existe = this.karts[i].products.find((producto) => {
                                    if (producto.cod_sap == element.cod_sap && producto.producto_distribuidor_id == element.producto_distribuidor_id) {
                                        return true;
                                    }
                                });
                                if (existe == undefined) {
                                    this.karts[i].products.push(element);
                                    this.karts[i].companiaId = element.compania_id;

                                    let num = 0;
                                    this.karts[i].products.forEach((ele) => {
                                        num = num + ele.cantidad;
                                    });
                                    this.karts[i].nProducts = num;
                                }
                            }
                        }

                        if (!existCompania) {
                            if (portfolio && this.role === 'cliente') {
                                // Portafolio y es cliente
                                // sino existe la compañia en el carrito la crea y le agrega el producto
                                carritoCompania.distribuidor =
                                    portfolio &&
                                    portfolio.nom_dist != undefined &&
                                    portfolio.nom_dist != ''
                                        ? portfolio.nom_dist + ' # ' + portfolio.index
                                        : 'Productos';
                                carritoCompania.distribuidorId = portfolio.distribuidor_id;
                                carritoCompania.portafolioIndex = portfolio.index;
                                carritoCompania.portafolioData = portfolio;
                                carritoCompania.portafolio = portfolio.portafolio;
                                carritoCompania.tipoCarro = TypeKart.portfolio;
                                carritoCompania.products.push(element);
                                carritoCompania.nProducts = 1;
                                carritoCompania.pedido = pedido;
                                carritoCompania.descuento_oferta_especial = descuento_oferta_especial;
                                carritoCompania.descuento_productos_especial = this.descuento_productos_especial;
                                this.karts.push(carritoCompania);
                            } else {
                                // Compañía
                                // los productos del vendedor no tienen compañia
                                carritoCompania.compania =
                                    element.compania != undefined && element.compania != ''
                                        ? element.compania
                                        : 'Productos';
                                carritoCompania.companiaId = element.compania_id;
                                carritoCompania.tipoCarro = TypeKart.company;
                                carritoCompania.products.push(element);
                                carritoCompania.nProducts = 1;
                                carritoCompania.pedido = pedido;
                                carritoCompania.descuento_oferta_especial = descuento_oferta_especial;
                                carritoCompania.descuento_productos_especial = this.descuento_productos_especial;
                                this.karts.push(carritoCompania);
                            }
                        }
                    }
                } else {
                    let portfolio;
                    if (element.portafolio) {
                        portfolio = this.companiesPortfolioShopkeeperService.searchByPortfolio(
                            element.portafolio
                        );
                    } else {
                        portfolio = this.companiesPortfolioShopkeeperService.searchInPortfolio(
                            element.compania_id
                        );
                    }
                    if (portfolio && this.role === 'cliente') {
                        // Portafolio
                        // sino existe la compañia en el carrito la crea y le agrega el producto
                        carritoCompania.distribuidor =
                            portfolio.nom_dist != undefined && portfolio.nom_dist != ''
                                ? portfolio.nom_dist + ' # ' + portfolio.index
                                : 'Productos';
                        carritoCompania.distribuidorId = portfolio.distribuidor_id;
                        carritoCompania.portafolioIndex = portfolio.index;
                        carritoCompania.portafolioData = portfolio;
                        carritoCompania.portafolio = portfolio.portafolio;
                        carritoCompania.tipoCarro = TypeKart.portfolio;
                        carritoCompania.products.push(element);
                        carritoCompania.nProducts = 1;
                        carritoCompania.pedido = pedido;
                        carritoCompania.descuento_oferta_especial = descuento_oferta_especial;
                        carritoCompania.descuento_productos_especial = this.descuento_productos_especial;
                        if (element.fecha_entrega) {
                            carritoCompania.fecha_entrega = element.fecha_entrega;
                        }

                        this.karts.push(carritoCompania);
                    } else {
                        // sino existe la compañia en el carrito la crea y le agrega el producto
                        carritoCompania.compania =
                            element.compania != undefined && element.compania != ''
                                ? element.compania
                                : 'Productos';
                        carritoCompania.products.push(element);
                        carritoCompania.tipoCarro = TypeKart.company;
                        carritoCompania.nProducts = 1;
                        carritoCompania.companiaId = element.compania_id;
                        carritoCompania.pedido = pedido;
                        carritoCompania.descuento_oferta_especial = descuento_oferta_especial;
                        carritoCompania.descuento_productos_especial = this.descuento_productos_especial;
                        if (element.fecha_entrega) {
                            carritoCompania.fecha_entrega = element.fecha_entrega;
                        }

                        this.karts.push(carritoCompania);
                    }
                }
            });
            this.karts = this.util.orderKartsByPedido(this.karts);

            this.products = this.karts[0].products;
            
            //descomentar aca 
            // this.descuento_productos_especial = 0;
            // this.products.forEach((element, index, object) => {
            //     if (element.descuento_suma_productos_especial && element.descuento_suma_productos_especial > 0) {
            //         this.descuento_productos_especial += ((+element.cantidad * +element.valor) * element.descuento_suma_productos_especial);
            //     }
            // });

            // this.descuento_productos_lineal = 0;
            // this.products.forEach((element, index, object) => {
            //     if (element.oferta_especial && +element.descuento > 0) {
            //         this.descuento_productos_lineal += ((+element.cantidad * +element.valor) * +element.descuento);
            //     } else if (element.descuento_suma_productos_lineal && element.descuento_suma_productos_lineal > 0) {
            //         this.descuento_productos_lineal += ((+element.cantidad) * +element.descuento_suma_productos_lineal);
            //     }
            // });

            // se activa la primera compañia
            this.karts[0].active = true;
            // se reusa la logica restaurando en la variable products los productos del carro activo
            this.products = this.karts[0].products;

            /* hasta aca va la separacion de productos en varios carritos */
            if (this.products.length > 4) {
                this.scroll = 'with-scroll hydrated';
            }

            if (this.karts.length > 1) {
                this.scrollHorizontal = ' more-than-one-order';
            }            
            this.updateSellData(0);

            //this.analyticsService.sendEvent('openCart', null);

            this.coor = {
                lat: this.cashRegister.lat,
                lng: this.cashRegister.long
            };
        });        
    }

    /* creditos */
    counter(i: number) {
        return new Array(i);
    }

    public selectCash() {
        this.cashInput.setFocus();
        this.selectedCash = !this.selectedCash;

        if ((!this.selectedCredit && !this.selectedstoreappCredit) && !this.selectedCash) {
            this.selectedCash = true;
            this.amountCash = this.total;
            return;
        }
    }

    public selectstoreappCredit() {
        if (this.role === 'vendedor') {
            return;
        }

        this.creditstoreappInput.setFocus();
        this.selectedstoreappCredit = !this.selectedstoreappCredit;
        this.activeCredit(this.selectedstoreappCredit);

        if (this.selectedstoreappCredit) {
            if (this.selectedCash && (Math.round(this.amountCash) > Math.round(this.amountstoreappCredit))) {
                this.amountCash -= this.amountstoreappCredit;
                this.updateDataCash({target: {value: this.amountCash.toString()}});
                return;
            }

            if ((Math.round(this.amountCash) <= Math.round(this.amountstoreappCredit))) {
                this.amountCash = 0;
                this.onlystoreapp();
                this.updateDataCash({target: {value: this.amountCash.toString()}});

                if (this.amountstoreappCredit > this.total) {
                    this.amountstoreappCredit = this.total;
                }

                return;
            }
        }

        if (!this.selectedstoreappCredit) {
            if (this.selectedCash) {
                this.amountCash = this.total;
            }

            if (!this.selectedCash && !this.selectedCredit) {
                this.amountCash = this.total;
                this.selectedCash = true;
                this.amountstoreappCredit = this.balance;
            }

            this.updateDataCash({target: {value: this.amountCash.toString()}});
            return;
        }
    }

    public selectCredit(index: number) {
        this.creditInput.setFocus();
        this.credits[index].selectedPay = !this.credits[index].selectedPay;
        this.activeCredit(this.selectedstoreappCredit);
        this.calcMethodValue();
        if (this.credits[index].selectedPay) {

            if (Math.round(this.totalMethods) > Math.round(this.total)) {
                this.onlyCredit(this.credits[index]);
            }

            if ((Math.round(this.total) > Math.round(this.credits[index].amountPay))) {
                const diff = Math.round(this.total) - Math.round(this.credits[index].amountPay);
                this.amountCash = diff;
                this.selectedCash = true;
                this.updateDataCash({target: {value: this.amountCash.toString()}});
                return;
            }

            if ((Math.round(this.total) < Math.round(this.credits[index].amountPay))) {
                this.onlyCredit(this.credits[index]);
                this.amountCash = 0;
                this.updateDataCash({target: {value: this.amountCash.toString()}});

                if (this.amountstoreappCredit > this.total) {
                    this.amountstoreappCredit = this.total;
                }

                return;
            }
        }

        if (!this.credits[index].selectedPay) {
            if (this.selectedCash) {
                this.amountCash = this.total;
            }
            this.onlyCash();
            this.updateDataCash({target: {value: this.amountCash.toString()}});
            return;
        }
    }

    public activeCredit(init) {
        let activeCredit = init;
        for (let y = 0; y < this.credits.length; y++) {
            const element = this.credits[y];
            if (element.selectedPay) {
                activeCredit = true;
            }
        }
        this.selectedCredit = activeCredit;
    }

    public selectFeeCredit(index: number, value: number) {
        this.credits[index].feePay = value;
    }

    public getMethod(distriId, clientId) {

        this.storage.get('user').then((usu) => {
            this.usu = JSON.parse(usu);
            this.store.dispatch(new GetMyBalanceAction(this.usu.token, clientId));
        });

        this.accountSubs = this.actionsSubj
            .pipe(filter((action: SetMyBalanceAction) => action.type === SET_MY_BALANCE))
            .subscribe((res) => {
                this.balance = res.data.saldo;
                this.balance = '0'; // Quitar cuando se habilite el metodo de pago por saldo storeapp
                if (+this.balance > 0) {
                    this.activeMethodPay = true;
                }
                this.totalAmountCredits = res.data.totalAmountCredits;
                this.totalAvalaibleCredits = res.data.totalAvalaibleCredits;

                if (this.pedido_id != undefined) {

                    this.storage.get('user').then((usu) => {
                        this.usu = JSON.parse(usu);
                        this.store.dispatch(new GetMyCreditsEntityAction(this.usu.token, clientId, distriId));
                    });

                }

            });


        this.creditsSubs = this.actionsObj
            .pipe(
                filter((action: SetMyCreditsEntityAction) => action.type === SET_MY_CREDITS_ENTITY)
            )
            .subscribe((res: SetMyCreditsEntityAction) => {
                this.credits = res.credits;
                this.store.dispatch(new LoadingOff());
                this.activeMethodPay = this.credits.length > 0 ? true : false;
                this.store.dispatch(new GetMethodsyPayAction(this.usu.token, this.pedido_id));
            });

        this.methodsSubs = this.actionsSubj
            .pipe(
                filter(
                    (action: SetMethodsyPayAction) =>
                        action.type === SET_METHODS_PAY_CREDIT
                )
            )
            .subscribe((res: SetMethodsyPayAction) => {
                this.methodsPay = res.methods;
                this.configureMethods();
            });


    }

    public configureMethods() {
        if (this.methodsPay) {
            for (let index = 0; index < this.methodsPay.length; index++) {
                const element = this.methodsPay[index];

                switch (element['id_tipo_metodo']) {
                    case 3:

                        this.credits.forEach((object, count) => {
                            if (object.credit_id === element['id_credito']) {
                                this.credits[count].selectedPay = true;
                                this.credits[count].feePay = element['cuotas'];
                                this.credits[count].amountPay = element['monto'];
                                this.totalMethods += parseInt(element['monto']);
                            }
                        });
                        this.selectedCredit = true;
                        break;

                    case 1:
                        this.selectedCash = true;
                        this.totalMethods += parseInt(element['monto']);
                        this.amountCash = Math.round(element['monto']);
                        break;

                    case 2:
                        this.selectedCredit = true;
                        this.selectedstoreappCredit = true;
                        this.totalMethods += parseInt(element['monto']);
                        this.balance = Math.round(+this.balance + +element['monto']).toString();
                        this.amountstoreappCredit = Math.round(element['monto']);
                        break;
                }
            }
            this.totalMethods = Math.round(this.totalMethods);

            if (!this.selectedCredit && !this.selectedCash && !this.selectedstoreappCredit) {
                this.selectedCash = true;
                this.amountCash = Math.round(this.total);
                this.totalMethods = this.amountCash;
            }

        } else {
            this.selectedCash = true;
            this.amountCash = Math.round(this.total);
            this.totalMethods = this.amountCash;
        }

        if (!this.selectedstoreappCredit && +this.balance > 0) {
            this.amountstoreappCredit = this.balance;
        }

        for (const credit of this.credits) {
            if (credit.selectedPay) {
                continue;
            }

            if (!credit.selectedPay) {
                credit.amountPay = credit.quota - credit.debt;
            }
        }

        if (Math.round(this.totalMethods) !== Math.round(this.total)) {
            this.onlyCash();
            this.amountCash = this.total;
            this.selectedCash = true;
        }
    }

    /* /creditos */

    /* funciono que reemplaza la directiva de carga de imagen ya que rompe el slide */
    getImage(product) {
        if (product.imagenes === undefined || product.imagenes.length === 0) {
            return 'assets/images/product-without-image.jpg';
        }
        return (
            'https://admin.storeapp.net/imagenes/productos/thumb/' +
            product.imagenes[0].url
        );
    }

    /* cambio de slide por código */
    async nextSlide(index) {
        // obtenemos el archivo sin conexion
        this.storage.get('getDatosSinConexionCouch').then(data => {
            // Segun confirmacion con Marcela, este campo no es necesario para los vendedores, solo el monto
            // let minimumOrderControl = 0;
            let minimumPurchaseValue = 0;

            // validamos si retorna algun dato, ya que es posible que no se hayan descagado o que estemos trabajando con un cliente-tendero
            if (data) {
                // minimumOrderControl = data.distribuidor.control_pedido_minimo_estricto;
                minimumPurchaseValue = data.distribuidor.valor_minimo_compra;
            }

            if (this.isOfflineActive) {
                if (Math.floor(this.total) < minimumPurchaseValue) {
                    this.presentToastWithOptions(
                        'El pedido no supera el monto mínimo de $' +
                        minimumPurchaseValue
                    ).then(() => {
                        this.store.dispatch(new LoadingOff());
                    });
                    return;
                }
                this.alertOrderOffline(
                    'El pedido se guardará localmente hasta salir del modo sin conexión',
                    () => {
                        this.closeCar();
                        this.presentToastWithOptions('El pedido fue guardado correctamente');
                        this.navigation.goTo('lista-clientes');
                    }
                );
                return;
            }

            if (this.offlineDynamic) {
                if (Math.floor(this.total) < minimumPurchaseValue) {
                    this.presentToastWithOptions(
                        'El pedido no supera el monto mínimo de $' +
                        minimumPurchaseValue
                    ).then(() => {
                        this.store.dispatch(new LoadingOff());
                    });
                    return;
                }
                let shop = this.shopSingletonService.getSelectedShop();
                shop.offline = true;
                this.shopSingletonService.setSelectedShop(shop);
                this.shopSingletonService.setStorageSelectedShop(shop);

                this.alertOrderOffline(
                    'El pedido se guardará localmente hasta recuperar la conexión',
                    () => {
                        this.closeCar();
                        this.presentToastWithOptions('El pedido fue guardado correctamente');
                        this.navigation.goTo('lista-clientes');
                    }
                );
                return;
            }
            if (index === 0) {
                this.firstSlideActive = true;
                this.secondSlideActive = false;
                this.thirdSlideActive = false;
                this.fourSlideActive = false;
                this.slides.slideTo(0);
            } else if (index === 1) {
                this.suggestedProducts = [];
                this.store.dispatch(new LoadingOn(true));
                this.firstSlideActive = false;
                this.secondSlideActive = true;
                this.thirdSlideActive = false;
                this.fourSlideActive = false;

                const indice = this.getCopaniaActiveKart();
                const compania = this.karts[indice];
                const dependencia_id = !compania.companiaId
                    ? compania.products[0].compania_id
                    : compania.companiaId;
                const params = {
                    token: this.token,
                    dependencia_id: dependencia_id,
                    tienda_id: this.shopData.id,
                };
                this.analyticsService.sendEvent('crear_pedido_' + this.role, {
                    event_category: 'crear_pedido',
                    event_label: 'crear_pedido_' + this.role,
                });
                // this.analyticsService.sendEvent('crear_pedido', { event_category: 'funnel_1', event_label: 'crear_pedido' });
                let distribuidor_validar_liquidador = null;
                if (compania.distribuidorId) {
                    distribuidor_validar_liquidador = compania.distribuidorId;
                }

                if (compania.products.length > 0 && compania.distribuidorId == null) {
                    distribuidor_validar_liquidador = compania.products[0].distribuidor_id;
                }

                if (distribuidor_validar_liquidador) {
                    params[
                        'distribuidor_validar_liquidador'
                        ] = distribuidor_validar_liquidador;
                }

                this.orderService.getProductsSugested(params).subscribe(
                    (success) => {
                        let min = success.content.productos.data.length;
                        if (success.content.productos.data.length < 4) {
                            min = success.content.productos.data.length;
                        }
                        // for para recorrer los productos sugeridos
                        for (let i = 0; i < min; i++) {
                            if (this.suggestedProducts.length < 4) {
                                const pSugeridoId = success.content.productos.data[i].id;
                                let addProduct = true;
                                // for para recorrer los productos en el kart
                                for (let j = 0; j < compania.products.length; j++) {
                                    if (pSugeridoId == compania.products[j].id) {
                                        addProduct = false;
                                    }
                                }
                                if (addProduct) {
                                    this.suggestedProducts.push(success.content.productos.data[i]);
                                }
                            }
                        }

                        if (success.content.liquidador && success.content.liquidador.url) {
                            this.liquidador = success.content.liquidador;
                        }

                        if (this.suggestedProducts.length == 0) {
                            this.nextSlide(2);
                        } else {
                            this.slides.slideTo(1);
                        }
                        this.store.dispatch(new LoadingOff());
                    },
                    (error) => {
                        if (error instanceof TimeoutError) {
                            this.store.dispatch(new SetOfflineDynamicAction(true));
                            this.offlineDynamic = true;
                            this.nextSlide(2);
                        }

                        if (error.statusText === 'Unknown Error') {
                            this.cache.getItem('offlineDynamic').then((res) => {
                                this.store.dispatch(new SetOfflineDynamicAction(true));
                                this.offlineDynamic = true;
                                this.nextSlide(2);
                            });
                        }

                        this.store.dispatch(new LoadingOff());
                    }
                );
            } else if (index == 2) {
                this.fourSlideActive = false;
                this.analyticsService.sendEvent('continuar_pedido_' + this.role, {
                    event_category: 'continuar_pedido',
                    event_label: 'continuar_pedido_' + this.role,
                });
                this.analyticsProducts();
                this.statusOrderClose = true;
                if (this.liquidador.url) {
                    this.store.dispatch(new LoadingOn(true, true));

                    this.graphql
                        .getLiquidacion_pedido(this.liquidador, this.products, this.usu)
                        .then(
                            (resp) => {
                                if (resp === false) {
                                    this.sendOrder();
                                    this.presentToastWithOptions(
                                        'Para este pedido no te aplican descuentos.'
                                    );
                                    return;
                                }
                                this.descuentoDistribuidor = Math.round(
                                    resp.total_descuentos as number
                                );
                                this.presentToastWithOptions(
                                    `Tienes $ ${this.descuentoDistribuidor} pesos de descuento para este pedido.`
                                );
                                this.totalOrderDistribuidor = Math.round(
                                    resp.total_bruto as number
                                );
                                this.totalOrderIVADistribuidor = Math.round(
                                    resp.total_impuestos as number
                                );
                                this.totalDistribuidor = Math.round(resp.total_neto as number);
                                this.sendOrder();
                            },
                            (err) => {
                                this.presentToastWithOptions(
                                    'Para este pedido no te aplican descuentos.'
                                );
                                this.sendOrder();
                            }
                        );
                    return;
                }

                this.store.dispatch(new LoadingOn(true));
                this.sendOrder();


            }
        });
    }

    analyticsProducts() {
        console.log(this.products);
        this.products.forEach((product) => {
            /* this.analyticsService.sendEvent('productos_pedidos_' + this.role, {
                event_category: 'seccion_carro_paso_2_' + product.id,
                event_label: 'productos_pedidos_' + product.cod_sap,
            }); */
            this.analyticsService.sendEvent('begin_checkout', {
                item_id: product.producto_distribuidor_id,
                item_category: this.role,
                quantity: product.cantidad,
                price: product.precio_unitario,
            });
        });
    }

    async rmToCart(i) {        
        const prevData = this.products[i].cantidad;
        if (this.products.length === 1 && this.firstSlideActive && this.products[0].pedido) {
            if (this.products[0].cantidad === 1) {
                const response = await this.validateLastProductInCarService.handle(
                    this.products[0].pedido.toString()
                );
                if (!response) {
                    return;
                } else {
                    this.CancelOrder(true);
                }
            }
        }
        const multiplier =
            !isNaN(this.products[i].multiplo_pedido) &&
            this.products[i].multiplo_pedido != 0
                ? this.products[i].multiplo_pedido
                : 1;
        if (this.products[i].pedido_minimo != 0) {
            if (
                this.products[i].cantidad - multiplier >=
                this.products[i].pedido_minimo
            ) {
                this.products[i].cantidad = this.products[i].cantidad - multiplier;
                this.analyticsService.sendEvent('prod_rem_carrito_'+this.role, { 'event_category': 'prod_agr_carrito_rem_'+this.products[i].id, 'event_label':'prod_agr_carrito_'+this.products[i].cod_sap });
                
                this.saveProduct(i);
                this.updateSellData();
            } else {
                this.products[i].cantidad = 0;
                this.analyticsService.sendEvent('prod_rem_carrito_'+this.role, { 'event_category': 'prod_agr_carrito_rem_'+this.products[i].id, 'event_label':'prod_agr_carrito_'+this.products[i].cod_sap });
                
                this.saveProduct(i);
                this.updateSellData();
            }
            if (this.products.length > 4) {
                this.scroll = 'with-scroll hydrated';
            } else {
                this.scroll = 'hydrated';
            }

            if (!this.cashRegisterService.compuestos(prevData, this.products[i], this.user)) {
                this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
                this.saveProduct(i);
                this.updateSellData();
                return;
            }

            return false;
        }

        if (this.products[i].pedido_minimo != 0) {
            if (multiplier != 1) {
                if (
                    this.products[i].cantidad - multiplier >=
                    this.products[i].pedido_minimo
                ) {
                    this.products[i].cantidad = !this.products[i].cantidad
                        ? multiplier
                        : +this.products[i].cantidad - multiplier;
                    this.analyticsService.sendEvent('prod_rem_carrito_' + this.role, {
                        event_category: 'prod_agr_carrito_rem_'+this.products[i].id,
                        event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                    });

                    this.saveProduct(i);
                } else {
                    this.products[i].cantidad = 0;
                    this.analyticsService.sendEvent('prod_rem_carrito_' + this.role, {
                        event_category: 'prod_agr_carrito_rem_'+this.products[i].id,
                        event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                    });

                    this.saveProduct(i);
                }
            } else {
                if (this.products[i].pedido_minimo < this.products[i].cantidad) {
                    this.products[i].cantidad = !this.products[i].cantidad
                        ? multiplier
                        : +this.products[i].cantidad - multiplier;
                    this.analyticsService.sendEvent('prod_rem_carrito_' + this.role, {
                        event_category: 'prod_agr_carrito_rem_'+this.products[i].id,
                        event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                    });

                    this.saveProduct(i);
                } else {
                    this.products[i].cantidad = 0;
                    this.analyticsService.sendEvent('prod_rem_carrito_' + this.role, {
                        event_category: 'prod_agr_carrito_rem_'+this.products[i].id,
                        event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                    });

                    this.saveProduct(i);
                }
            }
        } else {
            if (this.products[i].cantidad - multiplier >= 0) {
                this.products[i].cantidad = !this.products[i].cantidad
                    ? multiplier
                    : +this.products[i].cantidad - multiplier;
            } else if (this.products[i].cantidad - multiplier < 0) {
                this.products[i].cantidad = 0;
            }
            this.analyticsService.sendEvent('prod_rem_carrito_' + this.role, {
                event_category: 'prod_agr_carrito_rem_'+this.products[i].id,
                event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
            });

            this.saveProduct(i);                       
            this.updateSellData();
            let is_obsequio = this.is_gift(this.products[i]);
            if(!is_obsequio){
                this.products[i].obsequio = false; 
            }
        }         
        this.updateSellData();        

        this.descuento_productos_especial = 0;
        this.descuento_productos_lineal = 0;
        this.descuento_oferta_especial = 0;

        const r = this.cashRegister.implementUpdateSellData(this.products, false, true);
        this.totalOrder = r.totalOrder;
        this.totalOrderIVA = r.totalOrderIVA;
        this.totalOrderImpo = r.totalOrderImpo;
        this.totalImpo = r.totalImpo;
        this.total = r.total;

        if (!this.cashRegisterService.compuestos(prevData, this.products[i], this.user)) {
            this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
            this.saveProduct(i);
            this.updateSellData();
            return;
        }
    }

    saveProductStockValid(i, m?: string) {
        if (this.util.correctStock(this.products[i])) {
            this.saveProduct(i);
            if (m && m != '') {
                this.generalPropuseAlert(m);
            }
        } else {
            this.products[i].cantidad =
                this.products[i].inventario > 0 ? this.products[i].inventario : 0;
            this.saveProduct(i);
            let a = this.products[i].inventario > 0 ? this.products[i].inventario : 0;
            this.generalPropuseAlert(
                'Este producto cuenta con ' + a + ' unidades de inventario.'
            );
        }
    }

    addToCart(i) {
        const prevData = this.products[i].cantidad;
        const multiplier = (this.products[i].multiplo_pedido && this.products[i].multiplo_pedido != 0) ? this.products[i].multiplo_pedido : 1;

        if (this.products[i].pedido_minimo != 0 && !this.products[i].cantidad) {
            if (multiplier != 1) {
                if (this.products[i].pedido_minimo < multiplier) {
                    this.analyticsService.sendEvent('prod_add_carrito_' + this.role, {
                        event_category: 'prod_agr_carrito_add_'+this.products[i].id,
                        event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                    });
                    this.saveProductStockValid(i);
                } else {
                    if (this.products[i].pedido_minimo % multiplier != 0) {
                        const a = Math.ceil(this.products[i].pedido_minimo / multiplier);
                        this.products[i].cantidad = a * multiplier;
                    } else {
                        this.products[i].cantidad = this.products[i].pedido_minimo;
                    }
                    this.analyticsService.sendEvent('prod_add_carrito_' + this.role, {
                        event_category: 'prod_agr_carrito_add_'+this.products[i].id,
                        event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                    });
                    this.saveProductStockValid(i);
                }
            } else {
                this.products[i].cantidad = !this.products[i].cantidad
                    ? this.products[i].pedido_minimo
                    : +this.products[i].cantidad + multiplier;
                this.analyticsService.sendEvent('prod_add_carrito_' + this.role, {
                    event_category: 'prod_agr_carrito_add_'+this.products[i].id,
                    event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                });
                this.saveProductStockValid(i);
            }
            this.updateSellData();

            if (!this.cashRegisterService.compuestos(prevData, this.products[i], this.user)) {
                this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
                this.saveProduct(i);
                this.updateSellData();
                return;
            }

            return false;
        }

        // valida pedido maximo
        if (this.products[i].pedido_maximo != 0) {
            if (multiplier != 1) {
                if (
                    multiplier + this.products[i].cantidad <=
                    this.products[i].pedido_maximo
                ) {
                    this.products[i].cantidad = !this.products[i].cantidad
                        ? multiplier
                        : +this.products[i].cantidad + multiplier;
                    this.analyticsService.sendEvent('prod_add_carrito_' + this.role, {
                        event_category: 'prod_agr_carrito_add_'+this.products[i].id,
                        event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                    });
                    this.saveProductStockValid(i);
                } else {
                    this.products[i].cantidad = this.products[i].pedido_maximo;
                    this.analyticsService.sendEvent('prod_add_carrito_' + this.role, {
                        event_category: 'prod_agr_carrito_add_'+this.products[i].id,
                        event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                    });
                    this.saveProductStockValid(
                        i,
                        'No es posible agregar más unidades de este producto.'
                    );
                }
            } else {
                if (this.products[i].pedido_maximo > this.products[i].cantidad) {
                    this.products[i].cantidad = !this.products[i].cantidad
                        ? multiplier
                        : +this.products[i].cantidad + multiplier;
                    this.analyticsService.sendEvent('prod_add_carrito_' + this.role, {
                        event_category: 'prod_agr_carrito_add_'+this.products[i].id,
                        event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                    });
                    this.saveProductStockValid(i);
                } else {
                    this.products[i].cantidad = this.products[i].pedido_maximo;
                    this.analyticsService.sendEvent('prod_add_carrito_' + this.role, {
                        event_category: 'prod_agr_carrito_add_'+this.products[i].id,
                        event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
                    });
                    this.saveProductStockValid(
                        i,
                        'No es posible agregar más unidades de este producto.'
                    );
                }
            }
        } else {
            this.products[i].cantidad = !this.products[i].cantidad
                ? multiplier
                : +this.products[i].cantidad + multiplier;
            this.analyticsService.sendEvent('prod_add_carrito_' + this.role, {
                event_category: 'prod_agr_carrito_add_'+this.products[i].id,
                event_label: 'prod_agr_carrito_' + this.products[i].cod_sap,
            });
            
            this.saveProductStockValid(i);

        }
        this.updateSellData();

        this.descuento_productos_especial = 0;
        this.descuento_productos_lineal = 0;
        this.descuento_oferta_especial = 0;

        const r = this.cashRegister.implementUpdateSellData(this.products, false, true);
        this.totalOrder = r.totalOrder;
        this.totalOrderIVA = r.totalOrderIVA;
        this.totalOrderImpo = r.totalOrderImpo;
        this.totalImpo = r.totalImpo;
        this.total = r.total;

        if (!this.cashRegisterService.compuestos(prevData, this.products[i], this.user)) {
            this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
            this.saveProduct(i);
            this.updateSellData();
            return;
        }
    }

    // para agregar producto desde sugeridos
    addToCart2(product) {
        const car = this.karts[this.getCopaniaActiveKart()];
        product.compania = car.compania;
        this.products.push(product);
        const i = this.products.length - 1;
        this.analyticsService.sendEvent('prod_agr_sug_car_' + this.role, { 'event_category': 'prod_agr_sug_car_' + product.compania_id, 'event_label': 'prod_agr_sug_car_' + product.cod_sap});
        this.addToCart(i);
        this.updateSellData();
    }

    // para sumar producto
    addToCartPluss(product) {
        let index = null;
        for (let i = 0; i < this.products.length; i++) {
            if (product.id == this.products[i].id) {
                index = i;
            }
        }
        if (index) {
            //this.analyticsService.sendEvent('prod_add_rem_carrito_' + this.role, { 'event_category': 'prod_agr_carrito_add_' + product.compania_id, 'event_label': 'prod_agr_carrito_' + product.cod_sap });
            this.addToCart(index);
        }
    }

    // para quuitar producto sugerido
    rmvToCartPluss(product) {
        let index = null;
        for (let i = 0; i < this.products.length; i++) {
            if (product.id == this.products[i].id) {
                index = i;
            }
        }
        if (index) {
            this.analyticsService.sendEvent('prod_add_rem_carrito_' + this.role, {
                event_category: 'prod_agr_carrito_rem_'+this.products[index].id,
                event_label: 'prod_agr_carrito_',
            });
            this.rmToCart(index);
        }
    }

    async changeCountProd(e, i, statusInputCountProd = false) {
        const prevData = this.oldValue;
        this.statusInputCountProd = false;
        let tempCount: any = Number(e.target.value).toString();
        if (tempCount == 0) {
            tempCount = '0';
            if (
                this.products.length === 1 &&
                this.firstSlideActive &&
                this.products[0].pedido
            ) {
                if (this.products[0].cantidad === 0) {
                    const response = await this.validateLastProductInCarService.handle(
                        this.products[0].pedido.toString()
                    );
                    if (!response) {
                        this.products[0].cantidad = 1;
                        this.saveProduct(i);
                        this.updateSellData();
                        return;
                    } else {
                        this.CancelOrder(true);
                    }
                }
            }
        }
        if (!tempCount || !tempCount.match(/^\d+$/)) {
            this.products[i].cantidad = 0;
        } else {
            if (tempCount.length > 4) {
                this.products[i].cantidad = this.countProdTemp;
            } else {
                this.countProdTemp = tempCount;
                this.products[i].cantidad = tempCount;
            }
            this.saveProduct(i);
            this.updateSellData();
        }
        if (tempCount == '0') {
            this.statusInputCountProd = false;
        } else {
            this.statusInputCountProd = statusInputCountProd;
        }
        
        this.descuento_productos_especial = 0;
        this.descuento_productos_lineal = 0;
        this.descuento_oferta_especial = 0;
   
        const r = this.cashRegister.implementUpdateSellData(this.products, false, true);
        this.totalOrder = r.totalOrder;
        this.totalOrderIVA = r.totalOrderIVA;
        this.totalOrderImpo = r.totalOrderImpo;
        this.totalImpo = r.totalImpo;
        this.total = r.total;

        if (!this.cashRegisterService.compuestos(prevData, this.products[i], this.user)) {
            this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
            this.saveProduct(i);
            this.updateSellData();
            return;
        }
    }

    onFocus(event) {
        this.oldValue = event.target.value;
        this.statusInputCountProd = true;
    }

    saveProduct(i) {
        let shop = this.shopSingletonService.getSelectedShop();
        if (this.products[i]) {
            if (this.products[i].cantidad == 0) {
                const compania = this.products[i].compania;
                const compania_id = this.products[i].compania_id;
                delete shop.productos_seleccionados[this.products[i].id];
                this.products.splice(i, 1);
                if (this.products.length > 4) {
                    this.scroll = 'with-scroll hydrated';
                } else if (this.products.length == 0 && this.karts.length == 1) {
                    this.shopSingletonService.setSelectedShop(shop);
                    this.shopSingletonService.setStorageSelectedShop(shop);
                    this.closeCar();
                } else if (this.products.length == 0 && this.karts.length > 1) {
                    this.shopSingletonService.setSelectedShop(shop);
                    this.shopSingletonService.setStorageSelectedShop(shop);
                    if (compania && compania_id) {
                        this.removeCompaniaKart(compania, compania_id);
                    } else {
                        this.removeCarActive();
                    }
                } else {
                    this.scroll = 'hydrated';
                }
            } else {
                if (!shop.productos_seleccionados) {
                    shop.productos_seleccionados = {};
                }
                shop.productos_seleccionados[this.products[i].id] = this.products[i];
            }
        }
        shop.status_productos_pendientes = (JSON.stringify(shop.productos_seleccionados) == '{}') ? false : true;
        this.shopSingletonService.setSelectedShop(shop);
        this.shopSingletonService.setStorageSelectedShop(shop);
    }

    updateSellData(indexCar?) {
        const r = this.cashRegister.implementUpdateSellData(this.products); 
        this.totalOrder = r.totalOrder;
        this.totalOrderIVA = r.totalOrderIVA;
        this.totalOrderImpo = r.totalOrderImpo;
        this.totalImpo = r.totalImpo;
        this.total = r.total;

        /* credit */

        this.nProducts = r.nProducts;
        this.totalPts = r.totalPts;
        this.updateSellDataActiveKart(indexCar);
    }

    updateSellDataActiveKart(indexCar?) {
        this.karts.forEach((kart, index, object) => {
            const r = this.cashRegister.implementUpdateSellData(kart.products);
            kart.totalOrder = r.totalOrder;
            kart.totalOrderIVA = r.totalOrderIVA;
            kart.totalOrderImpo = r.totalOrderImpo;
            kart.total = r.total;
            kart.nProducts = r.nProducts;
            kart.descuento = 0;
            kart.totalImpo = r.totalImpo;

            if (indexCar == index) {
                kart.products.forEach(kartItem => {
                    kart.descuento += (kartItem.valor_descuento_total_especial !== undefined) ? kartItem.valor_descuento_total_especial : 0;
                });
                this.descuento = kart.descuento;
            }

            if (indexCar === undefined) {
                kart.products.forEach(kartItem => {
                    kart.descuento += (kartItem.valor_descuento_total_especial !== undefined) ? kartItem.valor_descuento_total_especial : 0;
                });
                this.descuento = kart.descuento;
            }

            this.totalPts = r.totalPts;
        });

        let descuento = 0;

        if (indexCar !== undefined) {
            this.karts[indexCar].products.forEach(kartItem => {
                descuento += (kartItem.valor_descuento_total_especial !== undefined) ? kartItem.valor_descuento_total_especial : 0;
            });
            this.descuento = descuento;
        } else {
            this.products.forEach(kartItem => {
                descuento += (kartItem.valor_descuento_total_especial !== undefined) ? kartItem.valor_descuento_total_especial : 0;
            });
            this.descuento = descuento;
        }
    }

    closeCar() {
        if (this.firstSlideActive) {
            this.analyticsService.sendEvent('cierra_carro_' + this.role, {
                event_category: 'cierra_carro_paso_1',
                event_label: 'cierra_carro_' + this.role,
            });
        } else if (this.secondSlideActive) {
            this.analyticsService.sendEvent('cierra_carro_sug_' + this.role, {
                event_category: 'cierra_carro_paso_2',
                event_label: 'cierra_carro_sug_' + this.role,
            });
        } else {
            this.analyticsService.sendEvent('cierra_carro_confirma_' + this.role, {
                event_category: 'cierra_carro_paso_3',
                event_label: 'cierra_carro_confirma_' + this.role,
            });
        }

        if (this.fourSlideActive) {
            this.slides.slideTo(2);
            this.firstSlideActive = false;
            this.secondSlideActive = false;
            this.thirdSlideActive = true;
            this.fourSlideActive = false;
            return;
        }

        if ((this.thirdSlideActive) && this.statusOrderClose) {
            this.finishButton();
        } else {
            let shop = this.shopSingletonService.getSelectedShop();
            this.store.dispatch(new FilterProductsAction(shop.productos_seleccionados));
            this.store.dispatch(new CompareProducts(shop.productos_seleccionados));
            this.modal.dismiss();
        }
    }

    async setOrder(coor?, confirmado?: boolean) {
        let kartSel = this.karts.find(e => e.active)
        const params: any = {
            tienda_id: this.shopData.id,
            confirmado: confirmado ? confirmado : null,
            codigo_cliente: this.shopData.codigo_cliente,
            codigo_auxiliar: this.shopData.codigo_auxiliar ? this.shopData.codigo_auxiliar : null,
            latitud: this.shopData.latitud,
            longitud: this.shopData.longitud,
            valor_total_original: this.total,
            valor_total: this.total,
            productos: this.products,
            player_id: await this.oneSignal.getId(),
            token: this.token,
            validar_ped_conflicto: true,
        };      
        if (this.en_conflicto) {
            params.en_conflicto = true;
            this.en_conflicto = false;
        }
            
        if (kartSel.portafolioData && kartSel.portafolioData.vendedor_id) {
            params.vendedor_id_portafolio = kartSel.portafolioData.vendedor_id;
        }

        if (this.role == 'vendedor') {
            // validacion de cc
            if (coor) {
                params.latitud = coor.lat;
                params.longitud = coor.lng;
            }

            if (this.autoVenta) {
                params.auto_venta = this.autoVenta;
            }
            // control de pedido menor
            if (Math.floor(this.total) < this.usu.distribuidor.valor_minimo_compra) {
                // mostrar toast con error
                this.presentToastWithOptions(
                    'El pedido no supera el monto mínimo de $' +
                    this.usu.distribuidor.valor_minimo_compra
                ).then(() => {
                    this.store.dispatch(new LoadingOff());
                    this.nextSlide(0);
                });
                return false;
            }
            await this.orderService
                .setOrder(params)
                .pipe(
                    map((res) => {
                        let isError = false;

                        if (res.status === 'error') {
                            throw res;
                        }

                        if (!res.content) {
                            return res;
                        }
                        if (res.content.length > 0) {
                            isError = res.content.some((el) => el.code === 21);
                        }

                        if (isError) {
                            throw res;
                        }

                        return res;
                    })
                )
                .pipe(
                    catchError(async (err) => {
                        if (err.code === 21) {
                            this.presentAlertReSend();
                            this.nextSlide(1);
                            return of(null);
                        }
                        
                        if (err.code === 30) { // En conflicto
                            this.nextSlide(0);
                            this.openModalConflict(this.shopData);
                            return of(null);
                        }

                        if (err.status === 'error') {
                            let men = err.content.error;
                            if (err.code == '4' || !err.content.error) {
                                men = err.content;
                                if (!err.content) {
                                    men = await this.msgErrorService.getErrorIntermitencia();
                                }
                            }
                            this.nextSlide(0);
                            this.presentToastWithOptions(men);
                            return of(null);
                        }
                        this.nextSlide(0);
                        return of(null);
                    })
                )
                .subscribe(
                    (success) => {
                        this.store.dispatch(new LoadingOff());
                        if (success === null) {
                            return;
                        }
                        if (success.status == 'ok' && success.code == 0) {
                            this.pedido_id = success.content.pedido_id;
                            let sub_total = (!this.totalOrderDistribuidor) ? this.totalOrder : this.totalOrderDistribuidor;
                            let iva = (!this.totalOrderIVADistribuidor) ? this.totalOrderIVA : this.totalOrderIVADistribuidor;
                            let total_con_iva = (!this.totalDistribuidor) ? this.total : this.totalDistribuidor;
                            this.eventAnalyticsPurchase({
                                sub_total: sub_total,
                                iva: iva,
                                total_con_iva: total_con_iva,
                                pedido_id: success.content.pedido_id,
                                perfil_usuario: this.role
                            });
                            this.getMethod(success.content.distribuidor_id, success.content.cliente_id);

                            this.setOrderSuccess = true;
                            this.karts[0].setOrderSuccess = this.setOrderSuccess = true;
                            if (success.content.horario_entrega) {
                                this.schedule = success.content.horario_entrega;
                            }
                            this.fechaEntrega = success.content.fecha_entrega;
                            this.karts[0].fechaEntrega = success.content.fecha_entrega;

                            this.karts[0].newSendDate = success.content.fecha_entrega;

                            success.content.subtotal = this.total;
                            success.content.subtotalIva = this.totalOrderIVA;
                            success.content.subtotalsinIva = this.totalOrder;
                            this.descuento_oferta_especial = (success.content.descuento_oferta_especial) ? success.content.descuento_oferta_especial : 0;
                            this.shopData.pedido = success.content.pedido_id;

                            let message = `El pedido # ${success.content.pedido_id} ha sido realizado. `;
                            if (success.content.fecha_envio) {
                                message =
                                    message +
                                    `Se enviará al sistema <span class="color-danger"> ${success.content.fecha_envio} </span>`;
                            }
                            this.storage.get('user').then((exito) => {
                                const shops = JSON.parse(exito);
                                let indexShopUser = shops.tiendas.findIndex(
                                    (e) =>
                                        e.id == this.shopData.id &&
                                        e.codigo_cliente == this.shopData.codigo_cliente
                                );

                                const shop = shops.tiendas[indexShopUser];
                                shop.pedido = success.content.pedido_id;
                                shops.tiendas[indexShopUser] = shop;
                                this.storage.set('user', JSON.stringify(shops));
                            });

                            if (success.content.fecha_entrega) {
                                this.shopData.pedido = success.content.fecha_entrega;
                            }

                            this.descuento = this.updateOfferData();

                            this.shopData.productos_seleccionados = {};
                            this.shopData.status_productos_pendientes = false;
                            this.shopSingletonService.setSelectedShop(this.shopData);
                            this.shopSingletonService.setStorageSelectedShop(this.shopData);


                            this.setOrderSuccessMessage = message;
                            this.karts[0].setOrderSuccessMessage = message;

                            this.setOrderSuccessResponse = success;
                            this.karts[0].setOrderSuccessResponse = success;

                            // muestra el boton de pedido express
                            if (
                                success.content.pedido_express != null &&
                                success.content.pedido_express.activo == '1'
                            ) {
                                this.expressOrderActive = true;
                                this.karts[0].expressOrderActive = true;

                                this.expressOrderButtonText =
                                    '¿Quiere recibirlo ' +
                                    success.content.pedido_express.dia +
                                    ' por $' +
                                    parseInt(success.content.pedido_express.valor) +
                                    '?';
                                this.karts[0].expressOrderButtonText =
                                    '¿Quiere recibirlo ' +
                                    success.content.pedido_express.dia +
                                    ' por $' +
                                    parseInt(success.content.pedido_express.valor) +
                                    '?';

                                this.forceToggle = false;
                                this.karts[0].forceToggle = false;

                                this.onExpressSucessApplyValue = parseInt(
                                    success.content.pedido_express.valor
                                );
                                this.karts[0].onExpressSucessApplyValue = parseInt(
                                    success.content.pedido_express.valor
                                );

                                this.onExpressSucessApplyDay =
                                    success.content.pedido_express.dia;
                                this.karts[0].onExpressSucessApplyDay =
                                    success.content.pedido_express.dia;
                            } else {
                                this.forceToggle = true;
                                this.karts[0].forceToggle = true;
                            }
                        }
                    },
                    (error) => {
                        this.nextSlide(0);
                        this.presentAlert(JSON.stringify(error), false);
                        this.store.dispatch(new LoadingOff());
                    }
                );
        } else {
            // cliente
            await this.orderService
                .setOrder(params)
                .pipe(
                    map((res) => {
                        if (res.status === 'error') {
                            throw res;
                        }

                        if (!res.content) {
                            return res;
                        }
                        let isError = false;
                        if (res.content.length > 0) {
                            isError = res.content.some((el) => el.code === 21);
                        }

                        if (isError) {
                            throw {
                                code: 21,
                            };
                        }

                        return res;
                    })
                )
                .pipe(
                    catchError((err) => {
                        if (err.code === 21) {
                            this.presentAlertReSend();
                            this.nextSlide(1);
                            return of(null);
                        }
                        if (err.status === 'error') {
                            const m =
                                err.content.error != undefined
                                    ? err.content.error
                                    : err.content[0];
                            this.presentToastWithOptions(m);
                            this.nextSlide(0);
                            return of(null);
                        }

                        return of(null);
                    })
                )
                .subscribe(
                    (success) => {
                        this.store.dispatch(new LoadingOff());
                        if (success === null) {
                            return;
                        }
                        if (success.status == 'ok' && success.code == 0) {
                            //borrar notificaciones locales
                            this.localNotification.clearAllNotification();

                            this.setOrderSuccess = true;
                            this.vendedor =
                                success.content[0].vendedores != undefined &&
                                success.content[0].vendedores.length > 0
                                    ? success.content[0].vendedores[0].vendedor
                                    : '';
                            this.pedido_id = success.content[0].pedido_id;
                            this.distribuidor = success.content[0].distribuidor;
                            this.descuento_oferta_especial = (success.content[0].descuento_oferta_especial) ? success.content[0].descuento_oferta_especial : 0;

                            let sub_total = this.totalOrder +  (this.descuento ? this.descuento : 0);
                            let iva = this.totalOrderIVA;
                            let total_con_iva = this.total;

                            this.eventAnalyticsPurchase({
                                sub_total: sub_total,
                                iva: iva,
                                total_con_iva: total_con_iva,
                                pedido_id: success.content[0].pedido_id,
                                perfil_usuario: this.role
                            });

                            //metodos de pago
                            this.getMethod(success.content[0].distribuidor_id, success.content[0].cliente_id);

                            if (success.content[0].horario_entrega) {
                                this.schedule = success.content[0].horario_entrega;
                            }
                            const message =
                                'Su pedido: #' +
                                success.content[0].pedido_id +
                                ' (' +
                                success.content[0].distribuidor +
                                '), recuerde: su vendedor es ' +
                                this.vendedor +
                                ' y su pedido llegará el próximo ' +
                                success.content[0].dia_entrega;
                            this.setOrderSuccessMessage = message;
                            this.setOrderSuccessResponse = success;
                            this.ultima_hora_edicion = (success.content[0].ultima_hora_edicion)?success.content[0].ultima_hora_edicion:false;
                            this.storage.get('user').then((exito) => {
                                const shops = JSON.parse(exito);
                                let indexShopUser = shops.tiendas.findIndex(
                                    (e) =>
                                        e.id == this.shopData.id &&
                                        e.codigo_cliente == this.shopData.codigo_cliente
                                );
                                const shop = shops.tiendas[indexShopUser];
                                shop.pedido = success.content[0].pedido_id;
                                this.shopData.status_productos_pendientes = false;
                                shop.status_productos_pendientes = false;
                                shops.tiendas[indexShopUser] = shop;
                                this.storage.set('user', JSON.stringify(shops));
                            });
                            const productos_ofertas = (success.content[0].productos_descuento_especial) ? success.content[0].productos_descuento_especial : [];
                            const tipos_productos_ofertas = (success.content[0].tipo_descuento_especial) ? success.content[0].tipo_descuento_especial : [];
                            if (success.content[0].fecha_entrega) {
                                this.updateKartSetDate(success.content[0].fecha_entrega);
                                this.descuento_productos_especial = this.updateProductsSelectedSetOrder(
                                    success.content[0].pedido_id,
                                    this.descuento_oferta_especial,
                                    productos_ofertas,
                                    tipos_productos_ofertas,
                                    success.content[0].fecha_entrega
                                );
                            } else {
                                this.descuento_productos_especial = this.updateProductsSelectedSetOrder(
                                    success.content[0].pedido_id,
                                    this.descuento_oferta_especial,
                                    productos_ofertas,
                                    tipos_productos_ofertas
                                );
                            }

                            this.updateKartSetOrder(success.content[0].pedido_id);

                            let indexActive = 0;
                            this.karts.forEach((kart, index, object) => {
                                if (kart.active) {
                                    indexActive = index;
                                    object[index].setOrderSuccess = true;
                                    object[index].setOrderSuccessMessage = message;
                                    object[index].setOrderSuccessResponse = success;
                                    object[index].pedido = success.content[0].pedido_id;

                                    // muestra el boton de pedido express
                                    if (
                                        success.content[0].pedido_express != null &&
                                        success.content[0].pedido_express.activo == '1'
                                    ) {
                                        this.expressOrderActive = true;
                                        this.expressOrderButtonText =
                                            '¿Quiere recibirlo ' +
                                            success.content[0].pedido_express.dia +
                                            ' por $' +
                                            parseInt(success.content[0].pedido_express.valor) +
                                            '?';
                                        const vendedorDia =
                                            success.content[0].vendedores.length > 0
                                                ? success.content[0].vendedores[0].dia
                                                : '';
                                        this.confirmOrderButtonText =
                                            'Recibirlo el proximo ' + vendedorDia;
                                        this.forceToggle = false;

                                        object[index].expressOrderActive = this.expressOrderActive;
                                        object[
                                            index
                                            ].expressOrderButtonText = this.expressOrderButtonText;
                                        object[
                                            index
                                            ].confirmOrderButtonText = this.confirmOrderButtonText;
                                        object[index].forceToggle = this.forceToggle;

                                        this.onExpressSucessApplyValue = parseInt(
                                            success.content[0].pedido_express.valor
                                        );
                                        object[index].onExpressSucessApplyValue = parseInt(
                                            success.content[0].pedido_express.valor
                                        );

                                        this.onExpressSucessApplyDay =
                                            success.content[0].pedido_express.dia;
                                        object[index].onExpressSucessApplyDay =
                                            success.content[0].pedido_express.dia;
                                    } else {
                                        // como no está activo el express se forza a el toggle quede activo
                                        this.forceToggle = true;
                                        object[index].forceToggle = true;
                                    }
                                }
                            });

                            this.updateSellData(indexActive);
                        }
                    },
                    (error) => {
                        this.nextSlide(0);
                        this.presentAlert(JSON.stringify(error), false);
                        this.store.dispatch(new LoadingOff());
                    }
                );
        }
    }

    updateProductsSelectedSetOrder(orderId, descuento_oferta_especial = 0, productos_con_descuento_propio, tipos_productos_ofertas, fecha_entrega?) {
        let shop = this.shopSingletonService.getSelectedShop();
        let kartActive = this.karts.find(k => k.active == true);
        const productosSeleccionados = Object.values(shop.productos_seleccionados);
        let suma_descuento_prods = 0;
        productosSeleccionados.forEach((producto: any) => {
            let prods_descuento = 0;
            let prods_descuento_lineal = 0;
            if (productos_con_descuento_propio[producto.id]) {
                if (tipos_productos_ofertas[producto.id] && tipos_productos_ofertas[producto.id] == 'escala'){
                    prods_descuento = productos_con_descuento_propio[producto.id];
                    suma_descuento_prods += ((+producto.cantidad * +producto.valor) * prods_descuento);
                }

                if (tipos_productos_ofertas[producto.id] && tipos_productos_ofertas[producto.id] == 'lineal'){
                    prods_descuento_lineal = productos_con_descuento_propio[producto.id];
                    suma_descuento_prods += ((producto.cantidad) * prods_descuento_lineal);
                }
            }

            let portfolio;
            if (producto.portafolio) {
                portfolio = this.companiesPortfolioShopkeeperService.searchByPortfolio(producto.portafolio);
            } else {
                portfolio = this.companiesPortfolioShopkeeperService.searchInPortfolio(producto.compania_id);
            }
            if ((kartActive.tipoCarro == TypeKart.company && (kartActive.compania == producto.compania || kartActive.companiaId == producto.compania_id)) ||
                (kartActive.tipoCarro == TypeKart.portfolio && portfolio && (kartActive.portafolio == producto.portafolio || kartActive.portafolio == portfolio.portafolio) && (kartActive.distribuidor == portfolio.nom_dist || kartActive.distribuidorId == portfolio.distribuidor_id))) {
                shop.productos_seleccionados[producto.id].pedido = orderId;
                shop.productos_seleccionados[producto.id].descuento_oferta_especial = descuento_oferta_especial;
                shop.productos_seleccionados[producto.id].descuento_suma_productos_especial = prods_descuento;
                shop.productos_seleccionados[producto.id].descuento_suma_productos_lineal = prods_descuento_lineal;
                if (fecha_entrega) {
                    shop.productos_seleccionados[producto.id].fecha_entrega = fecha_entrega;
                }
            }

        });
        if (this.karts.length <= 1) {
            shop.status_productos_pendientes = false;
        }
        this.shopSingletonService.setStorageSelectedShop(shop);
        return suma_descuento_prods;
    }

    updateOfferData() {
        const productosSeleccionados = Object.values(this.shopData.productos_seleccionados);
        let suma_descuento_prods = 0;
        console.log(productosSeleccionados);
        productosSeleccionados.forEach((producto: any) => {
            console.log(producto);
            suma_descuento_prods += (producto.valor_descuento_total_especial !== undefined) ? producto.valor_descuento_total_especial : 0;
        });
        
        const r = this.cashRegister.implementUpdateSellData(productosSeleccionados);
        this.totalOrder = r.totalOrder;
        this.totalOrderIVA = r.totalOrderIVA;
        this.totalOrderImpo = r.totalOrderImpo;
        this.total = r.total;
        this.totalImpo = r.totalImpo;
        console.log(r);

        return suma_descuento_prods;
    }

    updateKartSetOrder(orderId) {
        const kartActive = this.karts.find((k) => k.active == true);
        kartActive.products.forEach((product: IProduct) => {
            product.pedido = orderId;
        });
    }

    updateKartSetDate(fecha_entrega) {
        this.fechaEntrega = fecha_entrega;
        const kartActive = this.karts.find((k) => k.active == true);
        kartActive.products.forEach((product: IProduct) => {
            product.fecha_entrega = fecha_entrega;
        });
    }

    async presentToastWithOptions(message: string) {
        const toast = await this.toastController.create({
            message: message,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            duration: 3000,
        });
        toast.present();
    }

    async presentAlert(message: string, data) {
        if (data) {
            data.token = this.token;
            data.role = this.usu.role;
        }

        let buttons: any = ['Aceptar'];

        if (data && data.pedido_id && this.usu.role == 'vendedor') {
            buttons = [
                {
                    text: 'Enviar comentario y cambiar fecha',
                    cssClass: '',
                    handler: () => {
                        this.navigation.goTo('extra-ruta', data);
                    },
                },
                {
                    text: 'Recibirlo en la ruta normal',
                    cssClass: '',
                    role: 'cancel',
                },
            ];
            // si es vendedor y distribuidor acepta pedido express
            if (data.pedido_express == '1') {
                buttons.push({
                    // text: "Recibirlo el" + data.content.pedido_express.dia + ". costo $" + parseInt(data.content.pedido_express.valor),
                    text:
                        '¿Quiere recibirlo ' +
                        data.content.pedido_express.dia +
                        ' por $' +
                        parseInt(data.content.pedido_express.valor) +
                        '?',
                    cssClass: '',
                    handler: () => {
                        const params = {
                            token: this.token,
                            idPedido: data.pedido_id,
                            data: data,
                        };
                        this.presentAlertConfirmExpressOrder(params);
                    },
                });
            }
            // CLIENTE
        } else if (data.pedido_id && this.usu.role == 'cliente') {
            buttons = [
                {
                    text: 'Recibirlo el proximo ' + data.dia_entrega,
                    cssClass: '',
                    role: 'cancel',
                },
            ];
            if (data.pedido_express != null && data.pedido_express.activo == '1') {
                buttons.push({
                    text:
                        '¿Quiere recibirlo ' +
                        data.pedido_express.dia +
                        'por $ ' +
                        parseInt(data.pedido_express.valor) +
                        '?',
                    cssClass: '',
                    handler: () => {
                        const params = {
                            token: this.token,
                            idPedido: data.pedido_id,
                            data: data,
                        };
                        this.presentAlertConfirmExpressOrder(params);
                    },
                });
            }
        }
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: buttons,
        });
        await alert.present();
    }

    CancelOrder(withOutAlert?: boolean) {
        this.analyticsService.sendEvent('cancela_pedido_' + this.role, {
            event_category: 'cancela_pedido',
            event_label: 'cancela_pedido_' + this.role,
        });

        let i = this.getCopaniaActiveKart();
        let companiaId = this.karts[i].companiaId;
        if (this.karts[i].tipoCarro == TypeKart.portfolio) {
            companiaId = this.karts[i].products[0].compania_id;
        }

        const params: any = {
            pedido_id: this.karts[i].pedido,
            compania_id: this.companiasProducts.join(','),
            estado: 'cancelado',
            token: this.token,
            v2: true,
        };

        if (withOutAlert) {
            this.handleCancel(params);
            return;
        }

        this.presentAlertConfirm(params);
    }

    // cancela pedido
    async presentAlertConfirm(params: any) {
        const alert = await this.alertController.create({
            header: 'Atención',
            message: 'Realmente desea cancelar este pedido',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary',
                },
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.handleCancel(params);
                    },
                },
            ],
        });

        await alert.present();
    }

    async presentAlertReSend() {
        const alert = await this.alertController.create({
            header: 'Atención',
            message:
                'Un pedido ya fue enviado al distribuidor, ¿Deseas enviarlo para el próximo día de visita?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        this.clearProductsSelected();
                    },
                },
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.statusOrderClose = true;
                        this.store.dispatch(new LoadingOn(true));
                        this.suggestedProducts = [];
                        this.firstSlideActive = false;
                        this.secondSlideActive = false;
                        this.thirdSlideActive = true;
                        this.slides.slideTo(2);
                        this.setOrder(this.coor, true);
                    },
                },
            ],
        });

        await alert.present();
    }

    private handleCancel(params) {
        this.store.dispatch(new LoadingOn());
        this.orderService
            .cancelOrder(params)
            .pipe(
                map((res) => {
                    if (res.status == 'error') {
                        throw res;
                    }
                    return res;
                })
            )
            .pipe(
                catchError((err) => {
                    if (err.code === 23 || err.code === 22) {
                        this.presentError(err.content[0], () => {
                            this.clearProductsSelected();
                        });
                    }
                    return of(null);
                })
            )
            .subscribe((success) => {
                this.store.dispatch(new LoadingOff());
                if (success === null) {
                    const message =
                        'Ha ocurrido un error al cancelar el pedido. Verifica la señal del celular';
                    this.presentAlert(message, false).then((acept) => {
                        // al aceptar la modal se debe borrar productos seleccionados
                        this.closeCar();
                    });
                    return;
                }
                if (success.status == 'ok' && success.code == 0) {
                    this.analyticsService.sendEvent(
                        'confirma_cancela_pedido_' + this.role,
                        {
                            event_category: 'confirma_cancela_pedido',
                            event_label: 'confirma_cancela_pedido_aceptar',
                        }
                    );
                    const message =
                        'El pedido #' + success.content.pedido_id + ' ha sido cancelado';
                    this.presentAlert(message, false).then((acept) => {
                        // al aceptar la modal se debe borrar productos seleccionados
                        this.clearProductsSelected();
                    });

                    return;
                }
            });
    }

    private clearProductsSelected() {
        this.products = [];
        let shop = this.shopSingletonService.getSelectedShop();
        shop.productos_seleccionados = {};
        shop.pedido = null;
        this.shopSingletonService.setSelectedShop(shop);
        this.shopSingletonService.setStorageSelectedShop(shop);
        this.store.dispatch(new FilterProductsAction(shop.productos_seleccionados));
        if (this.usu.role == 'vendedor') {
            this.navigation.goTo('lista-clientes', {refresh: true});
            this.closeCar();
        } else {
            const doRouting = (document.URL.indexOf('inicio-tendero') > 0);
            if (doRouting) {
                this.modal.dismiss(true);
            } else {
                this.navigation.goTo('inicio-tendero', {refresh: true});
                this.closeCar();
            }
        }
    }

    // nested alert from setorder to express order
    async presentAlertConfirmExpressOrder(params: any) {
        const message =
            this.usu.role == 'vendedor'
                ? params.data.content.pedido_express.dia +
                ' recibirá su pedido con el recargo de $' +
                parseInt(params.data.content.pedido_express.valor) +
                ', que verá en su factura'
                : params.content[0].pedido_express.dia +
                ' recibirá su pedido con el recargo de $' +
                parseInt(params.content[0].pedido_express.valor) +
                ', que verá en su factura';
        const alert = await this.alertController.create({
            header: 'Atención',
            message: message,
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                        this.closeCar();
                    },
                },
                {
                    text: 'si',
                    handler: () => {
                        params.token = this.token;
                        this.orderService.setPedidoExpress(params).subscribe(
                            (success) => {
                                if (success.status == 'ok' && success.code == '0') {
                                    this.presentToastWithOptions(success.content.mensaje);
                                    if (this.usu.role == 'vendedor') {
                                        this.navigation.goTo('lista-clientes');
                                    } else if (this.usu.role == 'cliente') {
                                        this.navigation.goTo('inicio-tendero');
                                    }
                                } else if (success.status == 'error') {
                                    this.presentToastWithOptions(success.content.error);
                                    if (this.usu.role == 'vendedor') {
                                        this.navigation.goTo('lista-clientes');
                                    } else if (this.usu.role == 'cliente') {
                                        this.navigation.goTo('inicio-tendero');
                                    }
                                }
                            },
                            (error) => {
                                this.presentToastWithOptions('Ocurrio un error');
                            }
                        );
                    },
                },
            ],
        });

        await alert.present();
    }

    aceptSetOrderSuccess() {
        this.clearSelectedOrder();
        this.closeCar();
        if (this.role == 'vendedor') {
            this.navigation.goTo('lista-clientes');
        } else if (this.role == 'cliente') {
            this.navigation.goTo('inicio-tendero');
        }
    }

    // redirection to extraroute page
    extraRouteRedirect() {
        const data = this.setOrderSuccessResponse.content;
        data.token = this.token;
        data.role = this.usu.role;
        this.clearSelectedOrder();
        this.closeCar();
        this.navigation.goTo('extra-ruta', data);
    }

    // show expressorder options
    sendExpressOrder() {
        const params = this.setOrderSuccessResponse;
        this.presentAlertConfirmExpressOrder(params);
    }

    // confirm send express order
    confirmSendExpressOrder() {
        this.store.dispatch(new LoadingOn());
        const params = {
            idPedido: '',
            token: this.token,
        };
        if (this.role == 'vendedor') {
            params.idPedido = this.setOrderSuccessResponse.content.pedido_id;
        } else {
            params.idPedido = this.setOrderSuccessResponse.content[0].pedido_id;
        }
        this.orderService.setPedidoExpress(params).subscribe(
            (success) => {
                if (success.status == 'ok' && success.code == '0') {
                    this.presentToastWithOptions(success.content.mensaje);
                    this.closeCar();
                    this.store.dispatch(new LoadingOff());
                    if (this.role == 'vendedor') {
                        this.navigation.goTo('lista-clientes');
                    } else if (this.role == 'cliente') {
                        this.navigation.goTo('inicio-tendero');
                    }
                } else if (success.status == 'error') {
                    this.store.dispatch(new LoadingOff());
                    this.closeCar();
                    this.presentToastWithOptions(success.content);
                    if (this.role == 'vendedor') {
                        this.navigation.goTo('lista-clientes');
                    } else if (this.role == 'cliente') {
                        this.navigation.goTo('inicio-tendero');
                    }
                }
            },
            (error) => {
                this.store.dispatch(new LoadingOff());
                this.presentToastWithOptions('Ocurrio un error');
            }
        );
    }

    // clean array of selected products
    clearSelectedOrder(compania?) {
        // al aceptar la modal se debe borrar productos seleccionados
        this.products = [];
        let shop = this.shopSingletonService.getSelectedShop();
        shop.productos_seleccionados = {};
        shop.pedido = this.setOrderSuccessResponse.content.pedido_id;
        shop.status_productos_pendientes = false;
        this.clearProductsSelectedUser(shop.id);
        this.shopSingletonService.setSelectedShop(shop);
        this.shopSingletonService.setStorageSelectedShop(shop);
        this.store.dispatch(new FilterProductsAction(shop.productos_seleccionados));
    }

    clearProductsSelectedUser(tiendaId) {
        this.storage.get('user').then((res) => {
            let user: IUser = JSON.parse(res);
            let indexShop = user.tiendas.findIndex((t) => t.id == tiendaId);
            user.tiendas[indexShop].productos_seleccionados = {};
            this.storage.set('user', JSON.stringify(user));
        });
    }

    // clean array of selected products
    clearEmptySelectedOrder(index) {
        let compania = this.karts[index].compania;
        let companiaId = this.karts[index].companiaId;
        if (this.karts[index].tipoCarro == TypeKart.portfolio) {
            compania = this.karts[index].products[0].compania;
            companiaId = this.karts[index].products[0].compania_id;
        }

        if (compania && companiaId) {
            this.removeCompaniaKart(compania, companiaId);
        } else {
            this.removeCarActive();
        }

        if (this.karts.length > 1) {
            this.scrollHorizontal = ' more-than-one-order';
        } else {
            this.scrollHorizontal = '';
        }

        let shop = this.shopSingletonService.getSelectedShop();
            if (this.role == 'vendedor') {
                shop.productos_seleccionados = {};
            } else {
                const productosSeleccionados = Object.values(shop.productos_seleccionados);
                productosSeleccionados.forEach((producto: any, i, object) => {
                    let portfolio;
                    if (producto.portafolio) {
                        portfolio = this.companiesPortfolioShopkeeperService.searchByPortfolio(
                            producto.portafolio
                        );
                    } else {
                        portfolio = this.companiesPortfolioShopkeeperService.searchInPortfolio(
                            producto.compania_id
                        );
                    }
                    if ((!this.karts[index] || this.karts[index].tipoCarro == TypeKart.company && (this.karts[index].compania == producto.compania || this.karts[index].companiaId == producto.compania_id)) ||
                        (this.karts[index].tipoCarro == TypeKart.portfolio && portfolio && (this.karts[index].portafolio == producto.portafolio || this.karts[index].portafolio == portfolio.portafolio) && (this.karts[index].distribuidor == portfolio.nom_dist || this.karts[index].distribuidorId == portfolio.distribuidor_id))) {
                        delete shop.productos_seleccionados[producto.id];
                    }
                });
            }

            if (this.karts.length == 0) {
                this.products = [];
            }
            if (this.setOrderSuccessResponse != undefined && this.setOrderSuccessResponse != null) {
                shop.pedido = this.setOrderSuccessResponse.content.pedido_id;
            }
            shop.status_productos_pendientes = false;
            this.shopSingletonService.setSelectedShop(shop);
            this.shopSingletonService.setStorageSelectedShop(shop);
            this.store.dispatch(new FilterProductsAction(shop.productos_seleccionados));
    }

    // clean array of selected products
    clearSelectedOrder2(index) {
        let compania = this.karts[index].compania;
        let companiaId = this.karts[index].companiaId;
        if (this.karts[index].tipoCarro == TypeKart.portfolio) {
            compania = this.karts[index].products[0].compania;
            companiaId = this.karts[index].products[0].compania_id;
        }

        if (this.role == 'vendedor') {
            if (compania && companiaId) {
                this.removeCompaniaKart(compania, companiaId);
            } else {
                this.removeCarActive();
            }
        }

        if (this.karts.length > 1) {
            this.scrollHorizontal = ' more-than-one-order';
        } else {
            this.scrollHorizontal = '';
        }
    }

    async generalPropuseAlert(message: string) {
        const buttons = [
            {
                text: 'Aceptar',
                cssClass: '',
                role: 'cancel',
            },
        ];
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: buttons,
        });
        await alert.present();
    }

    emptyCart() {
        const indexActiveKart = this.getCopaniaActiveKart();

        this.analyticsService.sendEvent('vaciar_carro_' + this.role, {
            event_category: 'vaciar_carro',
            event_label: 'vaciar_carro_' + this.role,
        });
        this.clearEmptySelectedOrder(indexActiveKart);

        if (this.karts.length == 0) {
            this.closeCar();
            if (this.usu.role == 'vendedor') {
                this.navigation.goTo('lista-clientes');
            } else if (this.usu.role == 'cliente') {
                this.navigation.goTo('inicio-tendero');
            }
        }
    }

    confirmMethodPay() {
        /* creditos */
        let amountTotal = 0;
        let amountNull = true;
        let methodPayNull = true;
        const totalMet = Math.round(this.total);
        this.totalMethods = 0;

        methodPayNull = (this.selectedCash || this.selectedCredit || this.selectedstoreappCredit);
        amountTotal += this.selectedCash ? parseFloat(this.amountCash) : null;
        this.totalMethods = amountTotal;
        if (!this.selectedCash) {
            this.amountCash = 0;
        }
        if (this.selectedstoreappCredit) {
            // tslint:disable-next-line: max-line-length
            this.amountstoreappCredit = (this.amountstoreappCredit === null || this.amountstoreappCredit === NaN || this.amountstoreappCredit === undefined || this.amountstoreappCredit < 0) ? 0 : this.amountstoreappCredit;

            if (this.amountstoreappCredit > +this.balance) {
                this.amountstoreappCredit = +this.balance;
            }
            amountTotal += parseFloat(this.amountstoreappCredit);
            this.totalMethods = amountTotal;
        }

        if (this.activeMethodPay && this.selectedCredit) {
            this.credits.forEach((element) => {
                if (element.selectedPay) {
                    if (element.amountPay > element.quota - element.debt) {
                        element.amountPay = element.quota - element.debt;
                    }
                    // tslint:disable-next-line: max-line-length
                    element.amountPay = (element.amountPay === null || element.amountPay === NaN || element.amountPay === undefined || element.amountPay < 0) ? 0 : element.amountPay;
                    amountTotal += parseFloat(element.amountPay.toString());
                    if (element.feePay === 0) {
                        element.feePay = 1;
                    }
                    amountNull = element.amountPay === null ? true : false;
                }
            });
            this.totalMethods = amountTotal;
        }

        if (!methodPayNull) {
            this.store.dispatch(new Fail({mensaje: 'Debes seleccionar algun metodo de pago', withoutLoading: true}));
            return;
        }

        if (Math.round(amountTotal) < Math.round(totalMet)) {
            this.store.dispatch(new Fail( {
                mensaje: 'Hace falta ' + this.currency.transform(
                    (totalMet - amountTotal), 'COP', 'symbol-narrow', '0.0-0') + ' para completar el pago',
                withoutLoading: true
            }));
            return;
        }

        if (Math.round(amountTotal) > Math.round(totalMet)) {
            this.store.dispatch(new Fail({
                mensaje: 'Sobra ' + this.currency.transform(
                    (amountTotal - totalMet), 'COP', 'symbol-narrow', '0.0-0') + ' para completar el pago',
                withoutLoading: true
            }));
            return;
        }

        this.slides.slideTo(2);
        this.firstSlideActive = false;
        this.secondSlideActive = false;
        this.thirdSlideActive = true;
        this.fourSlideActive = false;
    }

    finishButton() {
        if (this.totalMethods === this.total) {
            const carWithOrder = this.getKartsWithOutOrder();
            this.statusOrderClose = false;
            this.store.dispatch(new LoadingOn());
            const activeKartIndex = this.getCopaniaActiveKart();

            const companiaActiva = this.karts[activeKartIndex].compania;
            // si se usa express || si se usa extraruta (comentario o cambio de fecha) || si se usa cupon
            /* this.analyticsService.sendEvent('confirma_pedido_' + this.role, {
                event_category: 'confirma_pedido',
                event_label: 'confirma_pedido_' + this.role,
            }); */
            if (this.toggle2) {

                this.analyticsService.sendEvent('pedido_express_' + this.role, {
                    event_category: 'pedido_express',
                    event_label: 'pedido_express_' + this.role,
                });
                this.sendExpressV2();
            }

            if (this.newSendDate != undefined && !this.toggle2) {

                this.analyticsService.sendEvent('cambio_fecha_envio_' + this.role, {
                    event_category: 'cambio_fecha_envio',
                    event_label: 'cambio_fecha_envio_' + this.role,
                });
                this.sendExtraRoute();
            } else if (this.comment != '' || this.schedule != '') {
                this.sendExtraRoute(true);
            }

            setTimeout(() => {

                this.clearSelectedOrder2(activeKartIndex);
                if (
                    this.karts.length === 0 ||
                    (this.usu.role == 'cliente' && this.karts.length === 1) ||
                    carWithOrder === 0
                ) {

                    if (this.setOrderSuccessResponse) {

                        // tslint:disable-next-line:max-line-length
                        const idPedido =
                            this.setOrderSuccessResponse.content.pedido_id != undefined
                                ? this.setOrderSuccessResponse.content.pedido_id
                                : this.setOrderSuccessResponse.content[0].pedido_id;
                        /* this.analyticsService.sendEvent('click', {
                            event_category: 'carro',
                            event_label: 'confirmaPedido_' + idPedido,
                        }); */
                        let extraRuta = (this.newSendDate != undefined && !this.toggle2);
                        let metodo_pago = "";
                        if (this.selectedCash) {
                            metodo_pago = "efectivo";
                        } else if (this.selectedCredit) {
                            metodo_pago = "credito";
                        }else if (this.selectedstoreappCredit) {
                            metodo_pago = "credito_storeapp";
                        }
                        console.log({
                            payment_type: metodo_pago,
                            coupon: (this.toggle2) ? "pedido_express": "pedido_gratis",
                            value: this.pedido_id,
                            currency: extraRuta,
                            items: this.role,
                        });
                        this.analyticsService.sendEvent('add_payment_info', {
                            payment_type: metodo_pago,
                            coupon: (this.toggle2) ? "pedido_express": "pedido_gratis",
                            value: this.pedido_id,
                            currency: extraRuta,
                            items: this.role,
                        });
                        // Metodo de pago

                    }
                    this.closeCar();
                    if (!this.toggle2 && this.comment == '') {
                        this.presentToastWithOptions('Pedido guardado.');
                    }
                    if (this.usu.role == 'vendedor') {
                        this.navigation.goTo('lista-clientes');
                    } else if (this.usu.role == 'cliente') {
                        this.navigation.goTo('inicio-tendero');
                    }
                } else {

                    this.nextSlide(0);
                    this.karts[activeKartIndex].setOrderSuccess = false;
                    this.karts = this.util.orderKartsByPedido(this.karts);
                    this.setActiveKart(activeKartIndex);
                    this.presentToastWithOptions('Pedido guardado.');
                    this.setOrderSuccess = false;
                }
                this.store.dispatch(new LoadingOff());
            }, 2500);

        } else {

            this.onlyCash();
            this.totalMethods = this.total;
            this.selectedCash = true;
        }

    }

    toggleOne(event) {
        this.toggle = event.detail.checked;
        this.toggle2 = !this.toggle;
        this.addExpressValue();
    }

    toggleTwo(event) {
        this.toggle2 = event.detail.checked;
        this.toggle = !this.toggle2;
        this.addExpressValue();
    }

    addExpressValue() {
        if (this.toggle2 && this.onExpressSucessApplyValue) {
            if (this.notApplyExpressValue) {
                this.total = this.total + this.onExpressSucessApplyValue;
                this.notApplyExpressValue = false;
                this.fechaEntregaTemp = this.fechaEntrega;
                this.fechaEntrega = this.onExpressSucessApplyDay;
            }
        } else if (!this.toggle2 && this.onExpressSucessApplyValue) {
            if (!this.notApplyExpressValue) {
                this.notApplyExpressValue = true;
                this.total = this.total - this.onExpressSucessApplyValue;
                this.fechaEntrega = this.fechaEntregaTemp;
            }
        }
    }

    applyCupon() {
        this.store.dispatch(new LoadingOn());
        setTimeout(() => {
            this.cuponUsed = true;
            this.cuponButtonDisabled = true;
            const descuento = Math.floor(this.total * 0.25);
            this.onCuponSucessApplyValue = descuento;
            this.total = this.total - descuento;
            this.store.dispatch(new LoadingOff());
        }, 1000);
    }

    sendExpressV2() {
        const paramss: any = this.setOrderSuccessResponse;
        const idPedido =
            paramss.content.pedido_id != undefined
                ? paramss.content.pedido_id
                : paramss.content[0].pedido_id;
        const params: any = {
            idPedido: idPedido,
        };
        params.token = this.token;
        this.orderService.setPedidoExpress(params).subscribe(success => {
            if (success.status == 'ok' && success.code == '0') {
                this.presentToastWithOptions(success.content.mensaje);
            } else if (success.status == 'error') {
                const message = (success.content.error != undefined && success.content.error != '') ? success.content.error : success.content;
                this.presentToastWithOptions(message);
            }
        }, error => {
            this.presentToastWithOptions('Ocurrio un error');
        }, () => {

        });
    }

    sendExtraRoute(onlyComment?: boolean) {
        let indexActiveKart = this.getCopaniaActiveKart();
        const pedido_id =
            this.role == 'vendedor'
                ? this.karts[0].setOrderSuccessResponse.content.pedido_id
                : this.karts[indexActiveKart].setOrderSuccessResponse.content[
                    (this.karts[indexActiveKart].setOrderSuccessResponse.content[indexActiveKart]) ? indexActiveKart : 0
                ].pedido_id;
        const params: any = {
            token: this.token,
            pedido_id: pedido_id,
        };

        if (this.schedule) {
            params.horario_entrega = this.schedule;
        }

        if (onlyComment) {
            params.observacion = this.comment;
        } else {
            params.observacion =
                this.comment != '' ? this.comment : 'Cambio fecha de envio';
            params.fecha_envio = this.newSendDate;
        }


        params.methodpay = {};
        params.methodpay.credits = {};
        if (this.selectedCash) {
            params.methodpay.efectivo = this.amountCash;
        }
        if (this.selectedstoreappCredit) {
            params.methodpay.creditostoreapp = this.amountstoreappCredit;
        }
        params.methodpay.total = this.total;
        params.methodpay.idPedido = pedido_id;

        if (this.activeMethodPay) {
            this.credits.forEach((element, index) => {
                if (element.selectedPay) {
                    this.purchase.state = 'Pending';
                    this.purchase.mysql_item_id = pedido_id;
                    this.purchase.credit_id = element.credit_id;
                    // tslint:disable-next-line: max-line-length
                    this.purchase.name =
                        ((this.setOrderSuccessResponse.content[0] && this.setOrderSuccessResponse.content[0].distribuidor) ?
                            'Pedido a ' + this.setOrderSuccessResponse.content[0].distribuidor : 'Pedido ') +
                        ' por $' +
                        this.karts[indexActiveKart].total
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
                        '.';
                    // tslint:disable-next-line: max-line-length
                    this.purchase.description = 'Se pidieron ';
                    this.purchase.description += this.karts[
                        indexActiveKart
                        ].products.length;
                    this.purchase.description += ' productos para el ';

                    if ( this.karts[indexActiveKart].setOrderSuccessResponse.content[0]) {
                        this.purchase.description += this.datePipe.transform(
                            this.karts[indexActiveKart].setOrderSuccessResponse
                                .content[0].fecha_entrega,
                            'EEEE'
                        );

                        this.purchase.description += ' ';
                        this.purchase.description += this.datePipe.transform(
                            this.karts[indexActiveKart].setOrderSuccessResponse
                                .content[0].fecha_entrega,
                            'dd'
                        );

                        this.purchase.description += ' de ';
                        // tslint:disable-next-line: max-line-length
                        this.purchase.description += this.datePipe.transform(
                            this.karts[indexActiveKart].setOrderSuccessResponse
                                .content[0].fecha_entrega,
                            'MMMM'
                        );
                    }
                    this.purchase.description += '.';
                    this.purchase.amount = element.amountPay;
                    this.purchase.payment = 0;
                    this.purchase.paid_out = false;
                    this.purchase.arrear = false;
                    this.purchase.number_fee = element.feePay;
                    this.purchase.is_order = true;
                    this.purchase.is_recharge = false;

                    params.methodpay.credits[index] = this.purchase;
                }
            });
        }


        this.orderService.setDatosExtrasPedido(params).subscribe(
            (success) => {
                if (success.status == 'ok' && success.code == '0') {
                    this.newSendDate = '';
                    this.presentToastWithOptions(success.content.mensaje);
                }
            },
            async (error) => {
                let men = '';
                if (error.code < 0) {
                    men = await this.msgErrorService.getErrorIntermitencia();
                } else {
                    men = 'Intenta de nuevo por favor';
                }
                this.presentToastWithOptions(men);
            }
        );
    }

    formatDate(date?) {
        this.newSendDate =
            this.newSendDate == '' ? this.fechaEntrega : this.newSendDate;
        if (!date || date == '') {
            const date = this.fechaEntrega;
        }
        let d = new Date(date),
            day = '' + d.getUTCDate(),
            month = '' + (d.getUTCMonth() + 1),
            year = d.getUTCFullYear();
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        return [year, month, day].join('-');
    }

    setActiveKart(indice) {
        if (this.thirdSlideActive) {
            const activeKartIndex = this.getCopaniaActiveKart();
            this.karts[activeKartIndex].setOrderSuccess = false;
            this.setOrderSuccess = false;
            this.nextSlide(0);
        }
        for (let i = 0; i < this.karts.length; i++) {
            if (i == indice) {
                this.karts[i].active = true;
                this.products = this.karts[i].products;
                this.descuento = 0;
                this.products.forEach((element, index, object) => {
                    if (element.valor_descuento_total_especial && element.valor_descuento_total_especial > 0) {
                        this.descuento += element.valor_descuento_total_especial;
                    }
                });

                // activa la vista uno o dos del carro
                if (this.karts[i].setOrderSuccess) {
                    // vista dos
                    this.setOrderSuccess = this.karts[i].setOrderSuccess;
                    this.setOrderSuccessMessage = this.karts[i].setOrderSuccessMessage;
                    this.setOrderSuccessResponse = this.karts[i].setOrderSuccessResponse;
                } else {
                    // vista uno
                    this.setOrderSuccess = false;
                }
            } else {
                this.karts[i].active = false;
            }
        }

        this.updateSellData(indice);
    }

    removeCarActive() {
        const kartActive = this.karts.findIndex((k) => k.active == true);
        this.karts.splice(kartActive, 1);

        if (this.karts.length > 0) {
            this.karts[0].active = true;
            this.setActiveKart(0);
        }
    }

    removeCompaniaKart(compania, compania_id?) {
        // remueve del arreglo de carritos
        this.karts.forEach((kart, index, object) => {
            if (
                (kart.tipoCarro == TypeKart.company &&
                    (kart.compania == compania || kart.companiaId == compania_id)) ||
                (kart.tipoCarro == TypeKart.portfolio &&
                    this.companiesPortfolioShopkeeperService.searchByPortfolio(
                        kart.portafolio
                    ) &&
                    kart.active)
            ) {
                object.splice(index, 1);
            }
        });

        // si hay por lo menos un carrito selecciona el indice 0 para mostrarlo
        if (this.karts.length > 0) {
            this.karts[0].active = true;
            this.setActiveKart(0);
        }
    }

    // retorna el indice del carrito activo para obtner propiedades
    getCopaniaActiveKart() {
        this.companiasProducts = [];
        for (let i = 0; i < this.karts.length; i++) {
            if (this.karts[i].active) {
                if (this.karts[i].products) {
                    this.karts[i].products.map((product) => {
                        if (this.companiasProducts.indexOf(product.compania_id) < 0) {
                            this.companiasProducts.push(product.compania_id);
                        }
                    });
                }
            }
        }
        for (let i = 0; i < this.karts.length; i++) {
            if (this.karts[i].active) {
                return i;
            }
        }
    }

    public async openCalendar() {
        const hoy = new Date();
        const mes =
            (hoy.getMonth() + 1).toString().length == 1
                ? '0' + hoy.getMonth() + 1
                : hoy.getMonth() + 1;
        this.now = `${hoy.getDay()}/${mes}/${hoy.getFullYear()}`;
        this.calendarIsOpened = !this.calendarIsOpened;
    }

    dateSelected(ev) {
        const date = new Date(ev);
        const dateService = `${date.getFullYear()}-${
        date.getMonth() + 1
            }-${date.getDate()}`;

        this.days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

        this.monthNames = [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre',
        ];

        const mes =
            (date.getMonth() + 1).toString().length == 1
                ? '0' + (date.getMonth() + 1)
                : date.getMonth() + 1;
        const dateShow = date.getFullYear() + '-' + mes + '-' + date.getDate();
        this.newSendDate = dateShow;
        this.openCalendar();
    }

    getFullProductName(product) {
        return this.util.getFullProductName(product);
    }

    private getKartsWithOutOrder() {
        return this.karts.filter((car) => {
            return car.pedido === null || car.pedido === undefined;
        }).length;
    }

    private async presentError(err, handle) {
        const alert = await this.alertController.create({
            header: 'Atención',
            message: err,
            buttons: [
                {
                    text: 'Aceptar',
                    handler: handle,
                },
            ],
            cssClass: 'attention-alert',
        });

        await alert.present();
    }

    private async alertOrderOffline(message, handle) {
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: [
                {
                    text: 'Aceptar',
                    handler: handle,
                },
                'Cancelar',
            ],
        });

        return alert.present();
    }

    ionViewDidLeave() {
        this.storeSubs.unsubscribe();
        this.creditsSubs.unsubscribe();
        this.actionsCountProductsOrder.unsubscribe();
        this.accountSubs.unsubscribe();
        this.methodsSubs.unsubscribe();
    }

    getDevicesBluetooth() {
        this.printer.searchBt().then(
            (datalist) => {
                this.devicesBluetooth = datalist;
            },
            (err) => {
                console.log(JSON.stringify(err));
            }
        );
    }

    isEnable(){
        this.printer.isEnabled().then(
            (enabled) => {
                this.isEnabled = enabled;
            },
            (err)=>{
                this.isEnabled = false;
            }
        );
    }

    printInboice(deviceBluetoothAddress) {
        let pId = this.setOrderSuccessResponse.content.pedido_id;
        let params = {
            token : this.token,
            pedido_id: pId
        }
        this.orderService.getInboice(params).subscribe(success =>{
            if(success){
                this.printer.print(deviceBluetoothAddress, success.toString()).then(res =>{
                    if(res){
                        this.closeCar();
                    }else{
                        this.generalPropuseAlert("Hubo un error al imprimir el recibo.");
                    }
                },error =>{
                    this.generalPropuseAlert("Hubo un error al imprimir el recibo.");
                });
            }
        },error=>{
            this.generalPropuseAlert("Hubo un error al obtener datos del recibo.");
        });
    }

    sendInboiceBySms() {
        let pId = this.setOrderSuccessResponse.content.pedido_id;
        let params = {
            token: this.token,
            pedido_id: pId,
        };
        this.orderService.sendInboce(params).subscribe(
            (success) => {
                if (success) {
                    this.generalPropuseAlert(success);
                } else {
                    this.generalPropuseAlert(
                        'Hubo un error al enviar el mensaje de texto.'
                    );
                }
            },
            (error) => {
                this.generalPropuseAlert('Hubo un error al enviar el mensaje de texto');
            }
        );
    }

    sendOrder() {
        this.suggestedProducts = [];
        this.firstSlideActive = false;
        this.secondSlideActive = false;
        this.thirdSlideActive = true;
        this.slides.slideTo(2);

        if (this.role === 'vendedor') {
            if (this.coor.lat) {
                /* this.analyticsService.sendEvent('confirma_pedido_' + this.role, {
                    event_category: 'confirma_pedido',
                    event_label: 'confirma_pedido_' + this.role,
                }); */
                this.setOrder(this.coor);
            } else {
                /* this.analyticsService.sendEvent('confirma_pedido_' + this.role, {
                    event_category: 'confirma_pedido',
                    event_label: 'confirma_pedido_' + this.role,
                }); */
                this.cashRegister.getCoords((send) => {
                    if (send === true) {
                        this.coor.lat = this.cashRegister.lat;
                        this.coor.lng = this.cashRegister.long;
                        this.setOrder(this.coor);
                    } else {
                        this.slides.slideTo(0);
                        this.firstSlideActive = true;
                        setTimeout(() => {
                            this.store.dispatch(new LoadingOff());
                        }, 100)
                    }
                });
            }
        } else {
            /* this.analyticsService.sendEvent('confirma_pedido_' + this.role, {
                event_category: 'confirma_pedido',
                event_label: 'confirma_pedido_' + this.role,
            }); */
            this.setOrder();
        }
    }

    eventAnalyticsPurchase(data: {
        sub_total: any,
        iva: any,
        total_con_iva: any,
        pedido_id: number,
        perfil_usuario: string,
        
    }) {
        this.analyticsService.sendEvent('purchase', {
            shipping: data.sub_total,
            tax: data.iva,
            value: data.total_con_iva,
            transaction_id: data.pedido_id,
            affiliation: data.perfil_usuario,
        });
    }

    changeMethodPay() {
        this.slides.slideTo(3);
        this.firstSlideActive = false;
        this.secondSlideActive = false;
        this.thirdSlideActive = false;
        this.fourSlideActive = true;
    }

    updateDataCash($event, blur = false) {
        const valueInput = $event.target.value;
        let value = (!valueInput || (valueInput && valueInput == '')) ? '0' : valueInput.replace(/\D/g, ''), res;
        if ((this.total > parseFloat(value) && (!this.selectedCredit && !this.selectedstoreappCredit)) && blur) {
            value = this.total;
            res = this.validateMethodsCash(value, blur);
            value = (res) ? res : value;
            return value;
        }

        if (this.total < parseFloat(value)) {
            value = this.total;
            res = this.validateMethodsCash(value, blur);
            value = (res) ? res : value;
            return value;
        }

        res = this.validateMethodsCash(value, blur);
        value = (res) ? res : value;
        return value.replace(/[^0-9.]/g, '');
    }

    validateMethodsCash(value, blur) {
        if (!value) {
            return false;
        }

        if (!blur) {
            return false;
        }

        if (!this.selectedstoreappCredit) {
            return false;
        }

        if ((Math.round(this.amountstoreappCredit) + Math.round(value)) > Math.round(this.total)) {
            if (Math.round(this.amountstoreappCredit) > Math.round(value)) {
                const diff = ((parseFloat(this.amountstoreappCredit) + parseFloat(value))) - this.total;
                this.amountstoreappCredit -= parseFloat(diff.toString());
                return false;
            }
            if (Math.round(this.amountstoreappCredit) <= Math.round(value)) {
                const diff = ((parseFloat(this.amountstoreappCredit) + parseFloat(value))) - this.total;
                if (Math.round(this.amountCash.toString()) + Math.round(diff) < this.total) {
                    this.amountCash += parseFloat(value);
                }

                this.amountstoreappCredit -= diff;

                if (this.amountstoreappCredit <= 0) {
                    this.amountstoreappCredit = this.balance;
                    this.selectedstoreappCredit = false;
                }

                return this.amountCash;
            }
        } else if ((Math.round(this.amountstoreappCredit) + Math.round(value)) < Math.round(this.total)) {
            const diff = (this.total - (parseFloat(this.amountstoreappCredit) + parseFloat(value)));
            this.amountCash = parseFloat(this.amountCash) + parseFloat(diff.toString());
            return this.amountCash.toString();
        }
    }

    updateDataCreditstoreapp($event, blur = false) {
        const valueInput = $event.target.value;
        let value = (!valueInput || (valueInput && valueInput == '')) ? '0' : valueInput.replace(/\D/g, '');

        if (parseFloat(this.balance) < parseFloat(value)) {
            value = this.balance.toString();
        }

        if (parseFloat(this.total.toString()) < parseFloat(value)) {
            value = this.total.toString();
        }

        if (blur) {
            const totalM = this.calcMethodValue();
            if (parseFloat(this.total.toString()) < parseFloat(totalM.toString())) {
                this.amountCash = this.totalMethods;
                this.onlyCash();
                this.updateDataCash({target: {value: this.amountCash.toString()}});
                value = this.balance.toString();
            }

            if (parseFloat(this.total.toString()) > parseFloat(totalM.toString())) {
                const diff = parseFloat(this.total.toString()) - parseFloat(totalM.toString());
                this.amountCash = parseFloat(this.amountCash) + diff;
                this.selectedCash = true;
                this.amountstoreappCredit = value.replace(/[^0-9.]/g, '');
                this.updateDataCash({target: {value: this.amountCash.toString()}});
            }
        }

        return value.replace(/[^0-9.]/g, '');
    }

    updateDataCredit($event, blur, credit) {
        const valueInput = $event.target.value;
        let value = (!valueInput || (valueInput && valueInput == '')) ? '0' : valueInput.replace(/\D/g, '');
        const dis = credit.quota - credit.debt;

        if (parseFloat(dis.toString()) < parseFloat(value)) {
            value = dis.toString();
        }

        if (parseFloat(this.total.toString()) < parseFloat(value)) {
            value = this.total.toString();
        }

        if (blur) {
            const totalM = this.calcMethodValue();
            if (parseFloat(this.total.toString()) < parseFloat(totalM.toString())) {
                this.amountCash = this.totalMethods;
                this.onlyCash();
                this.updateDataCash({target: {value: this.amountCash.toString()}});
                value = this.balance.toString();
            }

            if (parseFloat(this.total.toString()) > parseFloat(totalM.toString())) {
                const diff = parseFloat(this.total.toString()) - parseFloat(totalM.toString());
                this.amountCash = parseFloat(this.amountCash) + diff;
                this.selectedCash = true;
                credit.amountPay = value.replace(/[^0-9.]/g, '');
                this.updateDataCash({target: {value: this.amountCash.toString()}});
            }
        }

        return value.replace(/[^0-9.]/g, '');
    }

    calcMethodValue() {
        this.totalMethods = 0;
        if (this.selectedCash) {
            this.totalMethods = parseFloat(this.totalMethods.toString()) + parseFloat(this.amountCash);
        }

        if (this.selectedstoreappCredit) {
            this.totalMethods = parseFloat(this.totalMethods.toString()) + parseFloat(this.amountstoreappCredit);
        }

        for (const credit of this.credits) {
            if (!credit.selectedPay) {
                continue;
            }
            this.totalMethods = parseFloat(this.totalMethods.toString()) + parseFloat(credit.amountPay.toString());
        }

        return this.totalMethods;
    }

    onlyCash() {
        this.selectedCash = true;
        this.selectedstoreappCredit = false;
        for (const credit of this.credits) {
            credit.selectedPay = false;
        }
        this.selectedCredit = false;
    }

    onlystoreapp() {
        this.selectedCash = false;
        this.selectedstoreappCredit = true;
        for (const credit of this.credits) {
            credit.selectedPay = false;
        }
    }

    onlyCredit(creditCurrent) {
        this.selectedCash = false;
        this.selectedstoreappCredit = false;
        for (const credit of this.credits) {
            credit.selectedPay = false;
        }
        creditCurrent.selectedPay = true;
    }

    getMesureName(mesure){
        const m = {
            "KILO":"kg",
            "UNID":"und",
        }
        return m[mesure];
    }

    is_gift(element){
        if(element && element.oferta_especial && element.ofertas_reglas && element.ofertas_reglas[0] &&
            element.ofertas_reglas[0].reglas && element.ofertas_reglas[0].reglas.length > 0) {
            for (let index = 0; index < element.ofertas_reglas[0].reglas.length; index++) {
                const temp_element = element.ofertas_reglas[0].reglas[index];
                console.log("es o no es",element.obsequio);
                if(temp_element.tipo_oferta == "producto" && element.cantidad >= temp_element.cantidad){
                    return {"cantidad" : temp_element.valor, "codigo": temp_element.codigo_producto_adicional}
                }                
            }
            return null;   
        }
        return null;
    }

    public async openModalConflict(shop) {
        const modal = await this.modalController.create(<ModalOptions>{
            component: ModalPedidoEnConflictoComponent,
            componentProps: {
                user: this.user,
                shop: shop,
                with_send: false,
            }
        });

        modal.onDidDismiss().then((dataIn) => {
            if (dataIn.data && dataIn.data.productos) {
                this.products = dataIn.data.productos;
                this.en_conflicto = true;
                this.nextSlide(2);
            }
        });

        return await modal.present();
    }

}
