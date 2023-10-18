import { forEach } from '@angular-devkit/schematics';
import { GeneralProductoDetalleModalComponent } from './../general-producto-detalle-modal/general-producto-detalle-modal.component';
import { ModalOptions } from '@ionic/core';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FilterProductsAction, OpenCarAction} from '../../../pedidos/store/orders.actions';
import {IProduct} from 'src/app/interfaces/IProduct';
import {Storage} from '@ionic/storage';
import {Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {Subscription} from 'rxjs';
import {AlertController, ModalController} from '@ionic/angular';
import {productsReducer} from '../../../pedidos/store/orders.reducer';
import { UtilitiesHelper } from 'src/app/helpers/utilities/utilities.helper';
import {VibrateService} from 'src/app/services/vibrate/vibrate.service';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { isArray } from 'util';
import { CompaniesPortfolioShopkeeperService } from 'src/app/services/orders/companies-portfolio-shopkeeper.service';
import { ActivatedRoute } from '@angular/router';
import { Roles } from 'src/app/enums/roles.enum';
import { ColorOfertSegment } from 'src/app/enums/colorOfertSegment.enum';
import {LocalNotificationService,LocalNotification} from 'src/app/services/localNotification/local-notification.service';
import {CashRegisterService} from 'src/app/services/orders/cash-register.service';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import { SpecialOffersService } from 'src/app/services/specialOffers/special-offers.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
    selector: 'app-general-producto',
    templateUrl: './general-producto.component.html',
    styleUrls: ['./general-producto.component.scss'],
})
export class GeneralProductoComponent implements OnInit {

    
    @Input() product: IProduct;

    @Input() cardTypeOffer: boolean;
    @Input() cardModal: boolean;
    @Input() userIn: any;
    @Input() order: number;
    @Input() position: number;
    @Input() offer: boolean;
    @Input() container: any;
    @Input() isOfflineActive: boolean;
    @Input() disabledProduct;
    @Input() analyticsType: string = "porta";
    @Input() analyticsTypeEvent: string = "porta";
    @Input() puntos?: any;
    @Input() isNotVisible?: boolean;

    public item: number;
    public statusInputCountProd = false;
    public countProdTemp = 0;
    public loadImgStatus: boolean = false;
    public role : string = "";

    public compania : any = {};
    public expressActive : boolean = false;
    public validateOfferSpecial: boolean = false;
    public messageProductOffer: string;
    public messageDiscount: string;
    public typeMessageDiscount: string;
    public messageFooterDiscount: string;
    public messageAditional: string;
    public express : any = {};
    public distri: any;
    public user: any;
    public roles = Roles;
    public colorOfertSegment = ColorOfertSegment;

    public tipoOferta: string;
    public valorDescuento: number;
    public tipoDescuento: string;
    public parametroDescuento: string;
    public aplica: string;
    public cantidadDescuento: number;
    public descuento: number = 0;
    public cumpleDescuento: boolean = false;

    public control_visible_unidad_medida: boolean = true;

    public mesures:any = {
        "unidad":true,
        "peso":false 
    };
    public short_mesures:any = {
        "unidad":"Und",
        "peso": "Kg" 
    };
    public mesure_choosen =  "Und";
    constructor(
        private store: Store<AppState>,
        public alertController: AlertController,
        private route: ActivatedRoute,
        private util: UtilitiesHelper,
        private vibrateService : VibrateService,
        private localNotification: LocalNotificationService,
        private cashRegisterService: CashRegisterService,
        private analyticsService: AnalyticsService,
        private companiesPortfolioShopkeeperService: CompaniesPortfolioShopkeeperService,
        private shopSingletonService: ShopSingletonService,
        private modalController: ModalController,
        private specialOffersService: SpecialOffersService,
        private socialSharing: SocialSharing
    ) {
        this.item = -1;
        //this.isOfflineActive = false;
        this.user = this.route.snapshot.data['user'];
    }

    ngOnInit() {
        this.addColorProdSeg();
        if(this.product && this.product.factor){
            this.product.no_factor_precio = (this.product.precio_unitario)?this.product.precio_unitario:this.product.precio;
        }else{
            this.control_visible_unidad_medida = false;
        }

        if(this.userIn && !this.user) this.user = this.userIn
        let portfolioId = this.companiesPortfolioShopkeeperService.getPortfolio();
        this.product.portafolio = portfolioId;
        if (this.product.ofertas  && isArray(this.product.ofertas) && this.product.ofertas.length > 0 ){
            this.product.precio = this.product.ofertas[0].precio;
            this.product.precio_unitario = this.product.ofertas[0].precio_unitario;
        }
        this.loadImgStatus = false;
        this.validateOfferSpecial = (
                (this.product.es_ofe_especial  && this.product.reglas_ofe && this.product.reglas_ofe.length > 0) ||
                (
                    this.product.es_ofe_especial && this.product.ofertas_reglas && this.product.ofertas_reglas[0] &&
                    this.product.ofertas_reglas[0].reglas && this.product.ofertas_reglas[0].reglas.length > 0
                )
        );

        if(this.validateOfferSpecial){
            this.product.oferta_distribuidor = 1;
            //desabilita selector undiades si la regla es producto o escala
            if(this.product.ofertas_reglas && this.product.ofertas_reglas.length > 0){
                this.product.ofertas_reglas.forEach((item, index, object) => {
                    item.reglas.forEach(element => {
                        if(element.tipo_oferta == "producto" || (element.tipo_oferta == "escala" && element.cantidad > 1 ) || (element.tipo_oferta == "lista-precio" && element.cantidad > 1 )){
                            this.control_visible_unidad_medida = false;
                        }
                    });
                });
            }else if(this.product.reglas_ofe && this.product.reglas_ofe.length > 0){
                this.product.reglas_ofe.forEach((element, index, object) =>{
                    if(element.tipo_oferta == "producto" || (element.tipo_oferta == "escala" && element.cantidad > 1 ) || (element.tipo_oferta == "lista-precio" && element.cantidad > 1 )){
                        this.control_visible_unidad_medida = false;
                    }
                });
            }
            
        }
        
        if(this.control_visible_unidad_medida){
            this.changeActiveMesure("unidad");
        }else if(this.product.factor){
            this.changeActiveMesure("unidad")
        }

        /* precios con cambio bios */
        this.specialOffersService.product = this.product;

        this.getMessageOrder();
        const descuento = this.specialOffersService.aplicarReglas();
        this.descuento = descuento;
        this.product.valor_descuento_total_especial = this.descuento;

        //if (this.product.cantidad > 0) this.statusInputCountProd = true;
        //this.storage.get('user').then(usu => {
            //usu = JSON.parse(usu);
            this.compania = this.user.compania;
            this.distri = this.user.distribuidor;
            this.role = this.user.role;

            if (this.user.role == "vendedor") {
                this.expressActive = this.user.distribuidor.pedido_express;
                if(this.expressActive){
                    this.express.dia = this.getExpressDay(this.user.distribuidor.hora_maxima_pedido_express);
                    //this.express = this.distri.pedido_express;
                }
            }else{
                if(this.user.compania){
                    this.expressActive = (this.user.compania.pedido_express != null) ? true : false;
                    if (this.expressActive) {
                        this.express.dia = (this.user.distribuidor && this.user.distribuidor.hora_maxima_pedido_express) ? this.getExpressDay(this.user.distribuidor.hora_maxima_pedido_express):"";
                    }
                }
            }
        //});

        //Si no tiene puntos por producto pero tiene puntaje por compañia sin asignar todavía 
        this.product.puntaje_asignar = this.product.puntaje_asignar ? this.product.puntaje_asignar :
                                            ((this.puntos && this.puntos.puntaje_asignar) ? String(this.puntos.puntaje_asignar) : '0');
        this.product.valor_compra = this.product.valor_compra ? this.product.valor_compra :
                                            ((this.puntos && this.puntos.valor_compra) ? String(this.puntos.valor_compra) : '0');

        this.specialOffersService.product = this.product;

        if(this.product.deeplink){
            this.detailProduct();
        }
    }

    // //esta
    // aplicarReglas(): any {
    //     let reglas = [];
    //     let descuento = 0;
    //     if (this.product.es_ofe_especial  && this.product.reglas_ofe && this.product.reglas_ofe.length > 0) {
    //         reglas = this.product.reglas_ofe;
    //     } else if (this.product.es_ofe_especial && this.product.ofertas_reglas && this.product.ofertas_reglas[0] &&
    //         this.product.ofertas_reglas[0].reglas && this.product.ofertas_reglas[0].reglas.length > 0) {
    //         reglas = this.product.ofertas_reglas[0].reglas;
    //     }

    //     reglas.sort( this.compare );

    //     for (const regla of reglas) {
    //         const apply = this.aplicarDescuento(regla, descuento);
    //         const continueReglas = apply[0];
    //         descuento = apply[1];
    //         if (!continueReglas) {
    //             break;
    //         }
    //     }
    //     return descuento;
    // }

    private addColorProdSeg() {
        
        if (!this.product || !this.product.valor_meta || !this.product.tiendas_todas)
            return false;
        const valor_meta_mitad = (+this.product.valor_meta / 2);
        let valor_meta_actual;        
            if (this.product.tipo_meta == "pr") {
                valor_meta_actual = (this.product.cantidad * +this.product.precio);
            } else {
                valor_meta_actual = (this.product.cantidad + +this.product.valor_meta_actual);
            }
        
        if (+valor_meta_actual >= 0 && +valor_meta_actual <= valor_meta_mitad) {
            this.product.color = this.colorOfertSegment.red;
        }else if (+valor_meta_actual > valor_meta_mitad && +valor_meta_actual < +this.product.valor_meta ) {
            this.product.color = this.colorOfertSegment.yellow;
        }else { 
            this.product.color = this.colorOfertSegment.green;
        }
        /* if (+this.product.valor_meta_actual >= 0 && +this.product.valor_meta_actual <= asd) {
            this.product.color = this.colorOfertSegment.red;
        }else if (+this.product.valor_meta_actual > asd && +this.product.valor_meta_actual <= asd2) {
            this.product.color = this.colorOfertSegment.yellow;
        }else if (+this.product.valor_meta_actual > asd2 && +this.product.valor_meta_actual <= this.product.valor_meta) {
            this.product.color = this.colorOfertSegment.green;
        } */
    }

    addProductsOferSegment() {
        const prevData = this.product.cantidad;
        if (this.product.pedido_maximo === 0) {
            if (this.product.tipo_meta == "pr") {
                this.product.cantidad = Math.ceil((+this.product.valor_meta / this.product.precio));
            } else {
                this.product.cantidad = +this.product.valor_meta;
            }
            this.saveProduct();
            return;
        }

        if (this.product.pedido_maximo <= this.product.cantidad) {
            this.product.cantidad = this.product.pedido_maximo;
            this.saveProduct();
            return;
        }

        if (this.product.tipo_meta == "pr") {
            this.product.cantidad = Math.ceil((+this.product.valor_meta / this.product.precio));
        } else {
            this.product.cantidad = +this.product.valor_meta;
        }
        this.saveProduct();

        if (!this.cashRegisterService.compuestos(prevData, this.product, this.user)) {
            this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
            this.saveProduct();
            return;
        }

        return;
    }

    loadImg(event) {
        let img;
        if (event.srcElement.shadowRoot.children.length == 1) {
            img = event.srcElement.shadowRoot.children[0];
        }else if (event.srcElement.shadowRoot.children.length == 2) {
            img = event.srcElement.shadowRoot.children[1];
        } else {
            return;
        }
        img.onerror = () => { img.src = 'assets/images/product-without-image.jpg'; };
    }

    getExpressDay(hora){
        if (!hora) {
            return '';
        }
        let day = new Date();
        let hour = day.getHours();
        hora = hora.split(":");
        if(hora[0] >= hour){
            return "Hoy";
        }else{
            return "Mañana";
        }
    }

    onBlur(){
        this.statusInputCountProd = false;
    }

    onFocus(){
        this.statusInputCountProd = true;
    }

    ngOnDestroy() {
    }

    /* expand(item, event) {
        if (!event.target.classList.contains('addToKart') && (!event.target.parentElement.classList.contains('addToKart') && event.target.parentElement.localName != 'ion-inpu')) {
            const card = this.getCard(event);
            //let rol = (this.role != "vendedor" )?"tendero":"vendedor";
            this.analyticsService.sendEvent('ver_producto_'+this.role, { 'event_category': 'ver_producto_'+this.product.compania_id, 'event_label':'ver_producto_'+this.product.cod_sap});
            if (this.item === item) {
                this.item = -1;
                if (card.parentNode.previousElementSibling) {
                    card.parentNode.previousElementSibling.style.order = item;
                }
                card.parentNode.style.order = item + 1;
                card.parentNode.style.width = '48.5%';
                return;
            } else {
                this.reorganizarElementosCard();
            }

            if ((item + 1) % 2 === 0) {
                card.parentNode.previousElementSibling.style.order = item + 1;
                card.parentNode.style.order = item;
            }
            card.parentNode.style.width = '100%';
            this.item = item;
        }
    } */

    getCard(event, element?) {
        if (!element) {
            element = event.target;
            return this.getCard(event, element);
        }
        if (!element.classList.contains('product-card')) {
            element = element.parentNode;
            return this.getCard(event, element);
        }
        return element;
    }

    private reorganizarElementosCard() {
        const arrayCards = this.container.nativeElement.querySelectorAll('.product-card');

        for (let i = 0; i < arrayCards.length; i++) {
            const element = arrayCards[i];
            element.parentNode.style.order = i + 1;
        }
    }

    rmToCart() {
        const prevData = this.product.cantidad;
        this.statusInputCountProd = false;
        let multiplier = (!isNaN(this.product.multiplo_pedido) && this.product.multiplo_pedido != 0) ? this.product.multiplo_pedido : 1;
        if (this.product.pedido_minimo != 0) {
            if (this.product.cantidad - multiplier >= this.product.pedido_minimo) {
                this.product.cantidad = this.product.cantidad - multiplier;
                this.saveProduct();
                this.analyticsService.sendEvent('prod_rem_'+this.analyticsType+'_'+this.role, { 'event_category': 'prod_rem_'+this.analyticsTypeEvent+'_'+this.product.id, 'event_label': 'prod_rem_'+this.analyticsType+'_' + this.product.cod_sap });
            } else {
                this.product.cantidad = 0;
                //if (this.product.cantidad == 0) this.statusInputCountProd = false;
                this.analyticsService.sendEvent('prod_rem_'+this.analyticsType+'_'+this.role, { 'event_category': 'prod_rem_'+this.analyticsTypeEvent+'_'+this.product.id, 'event_label': 'prod_rem_'+this.analyticsType+'_' + this.product.cod_sap });
                this.saveProduct();
            }
            if (!this.cashRegisterService.compuestos(prevData, this.product, this.user)) {
                this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
                this.saveProduct();
                return;
            }
            return false;
        }

        if (this.product.pedido_minimo != 0) {
            if (multiplier != 1) {
                if (this.product.cantidad - multiplier >= this.product.pedido_minimo) {
                    this.product.cantidad = (!this.product.cantidad) ? multiplier : +this.product.cantidad - multiplier;
                    this.analyticsService.sendEvent('prod_rem_'+this.analyticsType+'_'+this.role, { 'event_category': 'prod_rem_'+this.analyticsTypeEvent+'_'+this.product.id, 'event_label': 'prod_rem_'+this.analyticsType+'_' + this.product.cod_sap });
                    this.saveProduct();
                } else {
                    this.product.cantidad = 0;
                    this.analyticsService.sendEvent('prod_rem_'+this.analyticsType+'_'+this.role, { 'event_category': 'prod_rem_'+this.analyticsTypeEvent+'_'+this.product.id, 'event_label': 'prod_rem_'+this.analyticsType+'_' + this.product.cod_sap });
                    this.saveProduct();
                }

            } else {
                if (this.product.pedido_minimo < this.product.cantidad) {
                    this.product.cantidad = (!this.product.cantidad) ? multiplier : +this.product.cantidad - multiplier;
                    this.analyticsService.sendEvent('prod_rem_'+this.analyticsType+'_'+this.role, { 'event_category': 'prod_rem_'+this.analyticsTypeEvent+'_'+this.product.id, 'event_label': 'prod_rem_'+this.analyticsType+'_' + this.product.cod_sap });
                    this.saveProduct();
                } else {
                    this.product.cantidad = 0;
                    this.analyticsService.sendEvent('prod_rem_'+this.analyticsType+'_'+this.role, { 'event_category': 'prod_rem_'+this.analyticsTypeEvent+'_'+this.product.id, 'event_label': 'prod_rem_'+this.analyticsType+'_' + this.product.cod_sap });
                    this.saveProduct();
                }
            }
        } else {

            if (this.product.cantidad - multiplier >= 0) {
                this.product.cantidad = (!this.product.cantidad) ? multiplier : +this.product.cantidad - multiplier;
            } else if (this.product.cantidad - multiplier < 0) {
                this.product.cantidad = 0;
            }
            this.analyticsService.sendEvent('prod_rem_'+this.analyticsType+'_'+this.role, { 'event_category': 'prod_rem_'+this.analyticsTypeEvent+'_'+this.product.id, 'event_label': 'prod_rem_'+this.analyticsType+'_' + this.product.cod_sap });
            this.saveProduct();
        }

        if (!this.cashRegisterService.compuestos(prevData, this.product, this.user)) {
            this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
            this.saveProduct();
            return;
        }
    }

    saveProductStockValid(m?:string) {
        if (this.util.correctStock(this.product)) {          
            this.saveProduct();
            if(this.product.cantidad == 1){
                this.analyticsService.sendEvent('prod_agr_'+this.analyticsType+'_'+this.role, { 'event_category': 'prod_agr_'+this.analyticsTypeEvent+'_'+this.product.id, 'event_label': 'prod_agr_'+this.analyticsType+'_' + this.product.cod_sap });
            } else{
                this.analyticsService.sendEvent('prod_add_'+this.analyticsType+'_'+this.role, { 'event_category': 'prod_add_'+this.analyticsTypeEvent+'_'+this.product.id, 'event_label': 'prod_add_'+this.analyticsType+'_' + this.product.cod_sap });
            }
            if(m && m!=""){
                this.generalPropuseAlert(m);
            }
        } else {
            this.product.cantidad = (this.product.inventario > 0) ? this.product.inventario:0;
            this.saveProduct();
            let a = (this.product.inventario > 0) ? this.product.inventario:0;
            this.generalPropuseAlert("Este producto cuenta con "+ a +" unidades de inventario.");
        }
    }


    addToCart() {
        this.specialOffersService.product = this.product;
        const prevData = this.product.cantidad;
        let alredyAdded = false;
        let multiplier = (this.product.multiplo_pedido && this.product.multiplo_pedido != 0) ? this.product.multiplo_pedido : 1;
        if (this.product.pedido_minimo != 0 && !this.product.cantidad) {
            if (multiplier != 1) {

                if (this.product.pedido_minimo < multiplier) {
                    this.product.cantidad = multiplier;
                    alredyAdded = true;
                    this.saveProductStockValid();
                } else {
                    if (this.product.pedido_minimo % multiplier != 0) {
                        let a = Math.ceil(this.product.pedido_minimo / multiplier);
                        this.product.cantidad = a * multiplier;
                    } else {
                        this.product.cantidad = this.product.pedido_minimo;
                    }
                    alredyAdded = true;
                    this.saveProductStockValid();
                }
                
            } else {
                
                this.product.cantidad = (!this.product.cantidad || this.product.cantidad == 0 ) ? this.product.pedido_minimo : +this.product.cantidad + multiplier;
                alredyAdded = true;
                this.saveProductStockValid();
            }
        this.specialOffersService.product = this.product;


        }

        //valida pedido maximo
        if (this.product.pedido_maximo != 0) {
            if (multiplier != 1) {
                if (multiplier + this.product.cantidad <= this.product.pedido_maximo) {
                    this.product.cantidad = (!this.product.cantidad || this.product.cantidad == 0) ? multiplier : +this.product.cantidad + multiplier;
                    this.saveProductStockValid();
                } else {
                    this.product.cantidad = this.product.pedido_maximo;
                    this.saveProductStockValid('No es posible agregar más unidades de este producto.');
                }
            } else {
                if (this.product.pedido_maximo > this.product.cantidad) {
                    this.product.cantidad = (!this.product.cantidad || this.product.cantidad == 0) ? multiplier : +this.product.cantidad + multiplier;
                    this.saveProductStockValid();
                } else {
                    this.product.cantidad = this.product.pedido_maximo;
                    this.saveProductStockValid('No es posible agregar más unidades de este producto.');
                }
            }
        } else {
            if (!alredyAdded){
                this.product.cantidad = (!this.product.cantidad || this.product.cantidad==0) ? multiplier : +this.product.cantidad + multiplier;
                this.saveProductStockValid();
            }
        }

        if (this.product.cantidad == multiplier && this.role == "cliente") {
            this.vibrateService.playAndVibrate();
        }

        if (!this.cashRegisterService.compuestos(prevData, this.product, this.user)) {
            this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
            this.saveProduct();
            return;
        }

        return false;
    }

    changeCountProd(e, statusInputCountProd = false) {
        this.statusInputCountProd = true;
        let tempCount: any = Number(e.target.value).toString();
        if (tempCount == ""){
            tempCount="1";
        }
        if (!tempCount || !tempCount.match(/^\d+$/)) {
            this.product.cantidad = 0;
        } else {
            if (tempCount.length > 4) {
                this.product.cantidad = (this.countProdTemp -1);
            } else {
                this.countProdTemp = tempCount;
                this.product.cantidad = (tempCount - 1);
            }
            this.addToCart();
        }
        if (tempCount == "0") {
            this.statusInputCountProd = false;
        }else{
            this.statusInputCountProd = statusInputCountProd;
        }

        this.specialOffersService.product = this.product;

    }

    saveProduct() {
        this.addColorProdSeg();
        let shop = this.shopSingletonService.getSelectedShop();
        if (!shop.productos_seleccionados) shop.productos_seleccionados = {};  
        if (this.product.cantidad == 0) { 
            if (shop.productos_seleccionados[this.product.id]){                
                delete shop.productos_seleccionados[this.product.id];
            }
        } else {                      
            if (shop.productos_seleccionados[this.product.id]) {
                this.product.pedido = shop.productos_seleccionados[this.product.id].pedido;
                shop.productos_seleccionados[this.product.id] = this.product;
            }else{
                shop.productos_seleccionados[this.product.id] = this.product;
            }
        }
        //localnotification
        if (this.user.role == "cliente" && (shop.pedido == undefined || shop.pedido == null  )){
            const params:LocalNotification = {
                text: "Envíalo y acumula puntos para redimir por premios.",
                title: "Tienes un pedido pendiente por enviar" ,
                trigger: {at:new Date(new Date().getTime() + 1800000)}
            };
            this.localNotification.setLocalNotification(params);
        }

        shop.status_productos_pendientes = (JSON.stringify(shop.productos_seleccionados) == "{}") ? false : true;
        this.shopSingletonService.setSelectedShop(shop);
        this.shopSingletonService.setStorageSelectedShop(shop);
        this.store.dispatch(new FilterProductsAction(shop.productos_seleccionados, false));

        // validación de ofertas
        console.log("1");
        const descuento = this.specialOffersService.aplicarReglas();
        this.descuento = descuento;
        this.product.valor_descuento_total_especial = this.descuento;

        shop.status_productos_pendientes = (JSON.stringify(shop.productos_seleccionados) == "{}") ? false : true;
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

    getFullProductName() {
        return this.util.getFullProductName(this.product);
    }

    calcularPts(product:IProduct){
        return this.cashRegisterService.calcularPts(product);
    }

    async detailProduct() {
        this.analyticsService.sendEvent('ver_producto_'+this.role, { 'event_category': 'ver_producto_'+this.product.id, 'event_label':'ver_producto_'+this.product.cod_sap});
        const modal = await this.modalController.create(<ModalOptions>{
            component: GeneralProductoDetalleModalComponent,
            cssClass: ['modal-info', 'modal-product'],
            componentProps: {
                product: this.product,
                user: this.user,
                analyticsType: this.analyticsType,
                analyticsTypeEvent: this.analyticsTypeEvent+'_'+this.product.id,
                role: this.role,
                disabledProduct: this.disabledProduct,
                puntos: this.puntos,
                control_visible_unidad_medida: this.control_visible_unidad_medida,
                mesures: this.mesures
            }
        });

        modal.onDidDismiss().then(() => {
            this.getMessageOrder();
            console.log("2");
            const descuento = this.specialOffersService.aplicarReglas();
            this.descuento = descuento;
            this.product.valor_descuento_total_especial = this.descuento;
        });

        return await modal.present();
    }

    //esta mm
    private getMessageOrder() {
        if (this.product.es_ofe_especial  && this.product.reglas_ofe && this.product.reglas_ofe.length > 0) {
            this.messageProductOffer = this.generateMessge(this.product.reglas_ofe[0]);
            return;
        }

        if (this.product.es_ofe_especial && this.product.ofertas_reglas && this.product.ofertas_reglas[0] &&
            this.product.ofertas_reglas[0].reglas && this.product.ofertas_reglas[0].reglas.length > 0) {
            this.messageProductOffer = this.generateMessge(this.product.ofertas_reglas[0].reglas[0]);
            return;
        }
    }

    //esta mm 
    private generateMessge(regla) {
        this.messageFooterDiscount = 'Descuento aplicado';
        this.tipoOferta = regla.tipo_oferta;
        this.valorDescuento = regla.valor;
        this.tipoDescuento = regla.descuento_tipo;
        this.cantidadDescuento = +regla.cantidad;
        this.parametroDescuento = regla.parametro;
        this.aplica = regla.aplica;

        if (regla.tipo_oferta == 'escala') {
            const mayorOmayorIgual = (regla.parametro == 'mayor') ? 'superior' : 'superior o igual';
            this.messageDiscount = '-' + ((regla.descuento_tipo == 'dinero') ? regla.valor : (+regla.valor * 100).toFixed(2) );
            this.typeMessageDiscount = ((regla.descuento_tipo == 'dinero') ? '$' : '%');
            if (regla.aplica == 'totalCompra') {
                this.messageAditional = 'En el total de la compra';
                return  'por compra ' + mayorOmayorIgual + ' a ' + regla.cantidad + 'un.';
            }
            
            if (regla.aplica == 'referencia') {
                this.messageAditional = 'En la suma total de la referencia';
                return  'por compra ' + mayorOmayorIgual + ' a ' + regla.cantidad + 'un.';
            }
        }

        if (regla.tipo_oferta == 'lista-precio') {
            const mayorOmayorIgual = 'superior o igual';
            this.messageDiscount = '-' + (+this.product.precio_unitario - (+regla.valor)).toFixed(0);
            this.typeMessageDiscount = '$';
            if (regla.aplica == 'referencia') {
                this.messageAditional = 'En la suma total de la referencia';
                return  'por compra ' + mayorOmayorIgual + ' a ' + regla.cantidad + ' cajas. (' + this.product.unidad_empaque + ' und por caja)';
            }
        }
        
        if (regla.tipo_oferta == 'lineal') {
            this.messageDiscount = '-' +  ((regla.descuento_tipo == 'dinero') ? regla.valor : (+regla.valor * 100).toFixed(2)) ;
            this.typeMessageDiscount = ((regla.descuento_tipo == 'dinero') ? '$' : '%');
            this.messageAditional = 'En la cantidad de productos';
            this.cumpleDescuento = true;
            return  'por compra de la referencia';
        }

        if (regla.tipo_oferta == 'producto') {
            const mayorOmayorIgual = (regla.parametro == 'mayor') ? 'superior' : 'superior o igual';
            this.typeMessageDiscount = '';
            this.messageFooterDiscount = 'Recibe ' + regla.valor + 'un. de la referencia ' + regla.codigo_producto_adicional;
            return  'por compra ' + mayorOmayorIgual + ' a ' + regla.cantidad + 'un. recibe un producto adicional';
        }

        return '';
    }

    //esta
    // private aplicarDescuento(regla?, descuento = 0) {
    //     if (!regla) {
    //         return [true, descuento];
    //     }
    //     if (regla.tipo_oferta == 'escala') {
    //         if (!this.validateEscala(regla)) {
    //             this.cumpleDescuento = false;
    //             return [true, descuento];
    //         }

    //         if (regla.descuento_tipo == 'dinero') {
    //             this.cumpleDescuento = true;
    //             descuento += +regla.valor;
    //         }

    //         if (regla.descuento_tipo == 'porcentaje') {
    //             if (regla.aplica == 'totalCompra') {
    //                 let shop = this.shopSingletonService.getSelectedShop(), total = 0;
    //                 const products = Object.values(shop.productos_seleccionados);
    //                 const dis = this.product.distribuidor_id;
    //                 products.forEach(function (product: any) {
    //                     if (product.total > 0 && product.distribuidor_id == dis) {
    //                         total += (product.cantidad * product.precio_unitario);
    //                     }
    //                 });

    //                 this.cumpleDescuento = true;
    //                 descuento += (+total - (regla.cadena ? descuento : 0)) * +regla.valor;
    //             }

    //             if (regla.aplica == 'referencia') {
    //                 this.cumpleDescuento = true;
    //                 const valor = (this.product.cantidad * this.product.precio_unitario) - (regla.cadena ? descuento : 0);
    //                 descuento += valor * +regla.valor;
    //             }
    //         }

    //         return [!regla.oferta_unica, descuento];
    //     }

    //     if (regla.tipo_oferta == 'lineal') {
    //         if (regla.descuento_tipo == 'dinero') {
    //             descuento += (+regla.valor * +this.product.cantidad);
    //         }

    //         if (regla.descuento_tipo == 'porcentaje') {
    //             this.cumpleDescuento = true;
    //             const valor = (this.product.cantidad * this.product.precio_unitario) - (regla.cadena ? descuento : 0);
    //             descuento +=  valor * +regla.valor;
    //         }

    //         return [!regla.oferta_unica, descuento];
    //     }

    //     if (regla.tipo_oferta == 'producto') {
    //         if (!this.validateEscala(regla)) {
    //             this.cumpleDescuento = this.cumpleDescuento === true;
    //             return false;
    //         }

    //         this.cumpleDescuento = true;
    //     }
    // }

    //esta
    // private validateEscala(regla) {
    //     if (regla.parametro == 'mayor') {
    //         if (this.product.cantidad <= regla.cantidad){
    //             return false;
    //         }
    //         return true;
    //     }

    //     if (regla.parametro == 'mayorIgual') {
    //         if (this.product.cantidad < regla.cantidad){
    //             return false;
    //         }
    //         return true;
    //     }

    //     return false;
    // }


    public changeActiveMesure(medida){

        Object.keys(this.mesures).forEach( (element, index) => {
            this.mesures[element] = false;
        } );
      
        this.mesures[medida] = true;
        
        this.specialOffersService.product = this.product;
        let r = this.specialOffersService.changeActiveMesure(medida);
        this.product = r[0];
        //this.mesures = r[1];
        this.mesure_choosen = r[2]; 
        this.saveProductStockValid();
        this.specialOffersService.product = this.product; 
        //aplicar las reglas de las oferas
        console.log("3");
        this.specialOffersService.aplicarReglas();
    }

    //esta
    // private getMesureName(mesure){
    //     return this.specialOffersService.getMesureName(mesure);
    // }

    //esta
    // public aplicar_unidadmedida(){
    //     console.log("desde funcion cambio unidad init",this.product);
    //     if(this.product.factor){
    //         //pendiente seguir
    //     }
    // }

    //esta
    // compare( a, b ) {
    //     if ( a.prioridad < b.prioridad ){
    //       return -1;
    //     }
    //     if ( a.prioridad > b.prioridad ){
    //       return 1;
    //     }
    //     return 0;
    // }

    share() {

        let data = {
            message: "No olvides pedir desde tu aplicación storeapp este producto recomendado, entra acá y pide ahora:",
            url:''
        } 
        if(this.isOfflineActive){
            data.url ='https://storeapp.app.link/producto?product_id='+ this.product.p_id;
        }else{
            data.url='https://storeapp.app.link/producto?product_id='+ this.product.producto_id;

        }
        this.socialSharing.shareWithOptions(data)
            .then(res => {
                console.log(res)
            });
    }
}
