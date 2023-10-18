import { ModalOptions } from '@ionic/core';
import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import {FilterProductsAction} from '../../../pedidos/store/orders.actions';
import {IProduct} from 'src/app/interfaces/IProduct';
import {Storage} from '@ionic/storage';
import {Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {AlertController, ModalController, IonSlides} from '@ionic/angular';
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
import { DomSanitizer } from '@angular/platform-browser';
import { SpecialOffersService } from 'src/app/services/specialOffers/special-offers.service';

@Component({
	selector: "app-general-producto-detalle-modal",
	templateUrl: "./general-producto-detalle-modal.component.html",
	styleUrls: ["./general-producto-detalle-modal.component.scss"],
})
export class GeneralProductoDetalleModalComponent implements OnInit {
	@Input() product: IProduct;
	@Input() user: any;
	@Input() role: string = "";
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
	@Input() control_visible_unidad_medida?: any;
	@Input() mesures?: any;

	public oldValue: number;

  public zoom: boolean = false;
	public item: number;
	public statusInputCountProd = false;
	public countProdTemp = 0;
	public loadImgStatus: boolean = false;

	public compania: any = {};
	public expressActive: boolean = false;
	public express: any = {};
	public distri: any;
	public roles = Roles;
  public colorOfertSegment = ColorOfertSegment;
  public classHideZoom: boolean = true;
  public unid_active: boolean = true;
  public peso_active: boolean = false;

  public slideZoomOpts = {
    initialSlide: 1,
    zoom: {
      maxRatio: 3
    }
  }


    public short_mesures:any = {
        "unidad":"Und",
        "peso": "Kg" 
    };
    public mesure_choosen =  "Und";

  @ViewChild("sliderZoom") slider: ElementRef;
  @ViewChild(IonSlides) slides: IonSlides;


	constructor(
		private store: Store<AppState>,
		public alertController: AlertController,
		private route: ActivatedRoute,
		private util: UtilitiesHelper,
		private vibrateService: VibrateService,
		private localNotification: LocalNotificationService,
		private cashRegisterService: CashRegisterService,
		private analyticsService: AnalyticsService,
		private companiesPortfolioShopkeeperService: CompaniesPortfolioShopkeeperService,
		private shopSingletonService: ShopSingletonService,
		private modalController: ModalController,
		private specialOffersService: SpecialOffersService,
		private sanitizer:DomSanitizer
	) {
		this.item = -1;
		//this.isOfflineActive = false;
   		this.user = this.route.snapshot.data["user"];
		  
	}

	ngOnInit() {
		/* control de unidades */
		if(!this.product.factor){
			this.control_visible_unidad_medida = false;
			this.product.unidad_seleccionada = null;
		}
    setTimeout(() => this.classHideZoom = false, 1000);
    this.slides.lockSwipes(true);
		this.addColorProdSeg();
		if (this.userIn && !this.user) this.user = this.userIn;
		let portfolioId = this.companiesPortfolioShopkeeperService.getPortfolio();
		this.product.portafolio = portfolioId;
		if(this.product.unidad_seleccionada && this.product.unidad_seleccionada =="KILO"){
			this.changeActiveMesure("peso")
		}else if(this.product.unidad_seleccionada && this.product.unidad_seleccionada =="UNID"){
			this.changeActiveMesure("unidad")
		}else if(this.product.unidad_seleccionada){
			this.changeActiveMesure("unidad")
		}
		if (
			this.product.ofertas &&
			isArray(this.product.ofertas) &&
			this.product.ofertas.length > 0
		) {
			this.product.precio = this.product.ofertas[0].precio;
			this.product.precio_unitario = this.product.ofertas[0].precio_unitario;
		}
		this.loadImgStatus = false;
		//if (this.product.cantidad > 0) this.statusInputCountProd = true;
		//this.storage.get('user').then(usu => {
		//usu = JSON.parse(usu);
		this.compania = this.user.compania;
		this.distri = this.user.distribuidor;
		this.role = this.user.role;

		if (this.user.role == "vendedor") {
			this.expressActive = this.user.distribuidor.pedido_express;
			if (this.expressActive) {
				this.express.dia = this.getExpressDay(
					this.user.distribuidor.hora_maxima_pedido_express
				);
				//this.express = this.distri.pedido_express;
			}
		} else {
			if (this.user.compania) {
				this.expressActive =
					this.user.compania.pedido_express != null ? true : false;
				if (this.expressActive) {
					this.express.dia =
						this.user.distribuidor &&
						this.user.distribuidor.hora_maxima_pedido_express
							? this.getExpressDay(
									this.user.distribuidor
										.hora_maxima_pedido_express
							  )
							: "";
					//this.express = this.distri.pedido_express;
				}
			}
		}
		//});
	}
	
	transform(html) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  
  toogleZoom() {
    this.zoom = !this.zoom;
    console.log(this.slider);
    /* let zoom = this.slider.nativeElement.swiper.zoom;
    if (this.zoom) {
      zoom.scale = 3;
      zoom.in();
    } else {
      zoom.out();
    } */
  }

	private addColorProdSeg() {
		if (
			!this.product ||
			!this.product.valor_meta ||
			!this.product.tiendas_todas
		)
			return false;
		const valor_meta_mitad = +this.product.valor_meta / 2;
		let valor_meta_actual;
		if (this.product.tipo_meta == "pr") {
			valor_meta_actual = this.product.cantidad * this.product.precio;
		} else {
			valor_meta_actual =
				this.product.cantidad + +this.product.valor_meta_actual;
		}
		console.log(valor_meta_actual, this.product.valor_meta_actual);
		if (+valor_meta_actual >= 0 && +valor_meta_actual <= valor_meta_mitad) {
			this.product.color = this.colorOfertSegment.red;
		} else if (
			+valor_meta_actual > valor_meta_mitad &&
			+valor_meta_actual < +this.product.valor_meta
		) {
			this.product.color = this.colorOfertSegment.yellow;
		} else {
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
				this.product.cantidad = Math.ceil(
					+this.product.valor_meta / this.product.precio
				);
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
			this.product.cantidad = Math.ceil(
				+this.product.valor_meta / this.product.precio
			);
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
		} else if (event.srcElement.shadowRoot.children.length == 2) {
			img = event.srcElement.shadowRoot.children[1];
		} else {
			return;
		}
		img.onerror = () => {
			img.src = "assets/images/product-without-image.jpg";
		};
	}

	getExpressDay(hora) {
		let day = new Date();
		let hour = day.getHours();
		hora = hora.split(":");
		if (hora[0] >= hour) {
			return "Hoy";
		} else {
			return "Mañana";
		}
	}

	onBlur() {
		this.statusInputCountProd = false;
	}

	onFocus(event) {
		this.statusInputCountProd = true;
		this.oldValue = event.target.value;
	}

	ngOnDestroy() {}

	expand(item, event) {
		if (
			!event.target.classList.contains("addToKart") &&
			!event.target.parentElement.classList.contains("addToKart") &&
			event.target.parentElement.localName != "ion-inpu"
		) {
			const card = this.getCard(event);
			//let rol = (this.role != "vendedor" )?"tendero":"vendedor";
			this.analyticsService.sendEvent("ver_producto_" + this.role, {
				event_category: "ver_producto_" + this.product.id,
				event_label: "ver_producto_" + this.product.cod_sap,
			});
			if (this.item === item) {
				this.item = -1;
				if (card.parentNode.previousElementSibling) {
					card.parentNode.previousElementSibling.style.order = item;
				}
				card.parentNode.style.order = item + 1;
				card.parentNode.style.width = "48.5%";
				return;
			} else {
				this.reorganizarElementosCard();
			}

			if ((item + 1) % 2 === 0) {
				card.parentNode.previousElementSibling.style.order = item + 1;
				card.parentNode.style.order = item;
			}
			card.parentNode.style.width = "100%";
			this.item = item;
		}
	}

	getCard(event, element?) {
		if (!element) {
			element = event.target;
			return this.getCard(event, element);
		}
		if (!element.classList.contains("product-card")) {
			element = element.parentNode;
			return this.getCard(event, element);
		}
		return element;
	}

	private reorganizarElementosCard() {
		const arrayCards = this.container.nativeElement.querySelectorAll(
			".product-card"
		);

		for (let i = 0; i < arrayCards.length; i++) {
			const element = arrayCards[i];
			element.parentNode.style.order = i + 1;
		}
	}

	rmToCart() {
		const prevData = this.product.cantidad;
		this.statusInputCountProd = false;
		let multiplier =
			!isNaN(this.product.multiplo_pedido) &&
			this.product.multiplo_pedido != 0
				? this.product.multiplo_pedido
				: 1;
		if (this.product.pedido_minimo != 0) {
			if (
				this.product.cantidad - multiplier >=
				this.product.pedido_minimo
			) {
				this.product.cantidad = this.product.cantidad - multiplier;
				this.saveProduct();
				this.analyticsService.sendEvent(
					"prod_rem_" + this.analyticsType + "_" + this.role,
					{
						event_category: "prod_rem_" + this.analyticsTypeEvent,
						event_label:
							"prod_rem_" +
							this.analyticsType +
							"_" +
							this.product.cod_sap,
					}
				);
			} else {
				this.product.cantidad = 0;
				//if (this.product.cantidad == 0) this.statusInputCountProd = false;
				this.analyticsService.sendEvent(
					"prod_rem_" + this.analyticsType + "_" + this.role,
					{
						event_category: "prod_rem_" + this.analyticsTypeEvent,
						event_label:
							"prod_rem_" +
							this.analyticsType +
							"_" +
							this.product.cod_sap,
					}
				);
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
				if (
					this.product.cantidad - multiplier >=
					this.product.pedido_minimo
				) {
					this.product.cantidad = !this.product.cantidad
						? multiplier
						: +this.product.cantidad - multiplier;
					this.analyticsService.sendEvent(
						"prod_rem_" + this.analyticsType + "_" + this.role,
						{
							event_category:
								"prod_rem_" + this.analyticsTypeEvent,
							event_label:
								"prod_rem_" +
								this.analyticsType +
								"_" +
								this.product.cod_sap,
						}
					);
					this.saveProduct();
				} else {
					this.product.cantidad = 0;
					this.analyticsService.sendEvent(
						"prod_rem_" + this.analyticsType + "_" + this.role,
						{
							event_category:
								"prod_rem_" + this.analyticsTypeEvent,
							event_label:
								"prod_rem_" +
								this.analyticsType +
								"_" +
								this.product.cod_sap,
						}
					);
					this.saveProduct();
				}
			} else {
				if (this.product.pedido_minimo < this.product.cantidad) {
					this.product.cantidad = !this.product.cantidad
						? multiplier
						: +this.product.cantidad - multiplier;
					this.analyticsService.sendEvent(
						"prod_rem_" + this.analyticsType + "_" + this.role,
						{
							event_category:
								"prod_rem_" + this.analyticsTypeEvent,
							event_label:
								"prod_rem_" +
								this.analyticsType +
								"_" +
								this.product.cod_sap,
						}
					);
					this.saveProduct();
				} else {
					this.product.cantidad = 0;
					this.analyticsService.sendEvent(
						"prod_rem_" + this.analyticsType + "_" + this.role,
						{
							event_category:
								"prod_rem_" + this.analyticsTypeEvent,
							event_label:
								"prod_rem_" +
								this.analyticsType +
								"_" +
								this.product.cod_sap,
						}
					);
					this.saveProduct();
				}
			}
		} else {
			if (this.product.cantidad - multiplier >= 0) {
				this.product.cantidad = !this.product.cantidad
					? multiplier
					: +this.product.cantidad - multiplier;
			} else if (this.product.cantidad - multiplier < 0) {
				this.product.cantidad = 0;
			}
			this.analyticsService.sendEvent(
				"prod_rem_" + this.analyticsType + "_" + this.role,
				{
					event_category: "prod_rem_" + this.analyticsTypeEvent,
					event_label:
						"prod_rem_" +
						this.analyticsType +
						"_" +
						this.product.cod_sap,
				}
			);
			this.saveProduct();
		}

		if (!this.cashRegisterService.compuestos(prevData, this.product, this.user)) {
			this.generalPropuseAlert('Este producto cuenta con productos compuestos sin stock');
			this.saveProduct();
			return;
		}
	}

	saveProductStockValid(m?: string) {
		if (this.util.correctStock(this.product)) {
			this.saveProduct();
			if (this.product.cantidad == 1) {
				this.analyticsService.sendEvent(
					"prod_agr_" + this.analyticsType + "_" + this.role,
					{
						event_category: "prod_agr_" + this.analyticsTypeEvent,
						event_label:
							"prod_agr_" +
							this.analyticsType +
							"_" +
							this.product.cod_sap,
					}
				);
			} else {
				this.analyticsService.sendEvent(
					"prod_add_" + this.analyticsType + "_" + this.role,
					{
						event_category: "prod_add_" + this.analyticsTypeEvent,
						event_label:
							"prod_add_" +
							this.analyticsType +
							"_" +
							this.product.cod_sap,
					}
				);
			}
			if (m && m != "") {
				this.generalPropuseAlert(m);
			}
		} else {
			this.product.cantidad =
				this.product.inventario > 0 ? this.product.inventario : 0;
			this.saveProduct();
			let a = this.product.inventario > 0 ? this.product.inventario : 0;
			this.generalPropuseAlert(
				"Este producto cuenta con " + a + " unidades de inventario."
			);
		}
	}

	addToCart(prev?: number) {
		let prevData = this.product.cantidad;
		if (prev) {
			prevData = prev;
		}
		let alredyAdded = false;
		let multiplier =
			this.product.multiplo_pedido && this.product.multiplo_pedido != 0
				? this.product.multiplo_pedido
				: 1;
		if (this.product.pedido_minimo != 0 && !this.product.cantidad) {
			if (multiplier != 1) {
				if (this.product.pedido_minimo < multiplier) {
					this.product.cantidad = multiplier;
					alredyAdded = true;
					this.saveProductStockValid();
				} else {
					if (this.product.pedido_minimo % multiplier != 0) {
						let a = Math.ceil(
							this.product.pedido_minimo / multiplier
						);
						this.product.cantidad = a * multiplier;
					} else {
						this.product.cantidad = this.product.pedido_minimo;
					}
					alredyAdded = true;
					this.saveProductStockValid();
				}
			} else {
				this.product.cantidad =
					!this.product.cantidad || this.product.cantidad == 0
						? this.product.pedido_minimo
						: +this.product.cantidad + multiplier;
				alredyAdded = true;
				this.saveProductStockValid();
			}
		}

		//valida pedido maximo
		if (this.product.pedido_maximo != 0) {
			if (multiplier != 1) {
				if (
					multiplier + this.product.cantidad <=
					this.product.pedido_maximo
				) {
					this.product.cantidad =
						!this.product.cantidad || this.product.cantidad == 0
							? multiplier
							: +this.product.cantidad + multiplier;
					this.saveProductStockValid();
				} else {
					this.product.cantidad = this.product.pedido_maximo;
					this.saveProductStockValid(
						"No es posible agregar más unidades de este producto."
					);
				}
			} else {
				if (this.product.pedido_maximo > this.product.cantidad) {
					this.product.cantidad =
						!this.product.cantidad || this.product.cantidad == 0
							? multiplier
							: +this.product.cantidad + multiplier;
					this.saveProductStockValid();
				} else {
					this.product.cantidad = this.product.pedido_maximo;
					this.saveProductStockValid(
						"No es posible agregar más unidades de este producto."
					);
				}
			}
		} else {
			if (!alredyAdded) {
				this.product.cantidad =
					!this.product.cantidad || this.product.cantidad == 0
						? multiplier
						: +this.product.cantidad + multiplier;
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
		if (tempCount == "") {
			tempCount = "1";
		}
		if (!tempCount || !tempCount.match(/^\d+$/)) {
			this.product.cantidad = 0;
		} else {
			if (tempCount.length > 4) {
				this.product.cantidad = this.countProdTemp - 1;
			} else {
				this.countProdTemp = tempCount;
				this.product.cantidad = tempCount - 1;
			}
			this.addToCart(this.oldValue);
		}
		if (tempCount == "0") {
			this.statusInputCountProd = false;
		} else {
			this.statusInputCountProd = statusInputCountProd;
		}
	}

	saveProduct() {
		this.addColorProdSeg();
		let shop = this.shopSingletonService.getSelectedShop();
		if (this.product.cantidad == 0) {
			if (shop.productos_seleccionados[this.product.id]) {
				delete shop.productos_seleccionados[this.product.id];
			}
		} else {
			if (!shop.productos_seleccionados)
				shop.productos_seleccionados = {};
			if (shop.productos_seleccionados[this.product.id]) {
				this.product.pedido =
					shop.productos_seleccionados[this.product.id].pedido;
				shop.productos_seleccionados[this.product.id] = this.product;
			} else {
				shop.productos_seleccionados[this.product.id] = this.product;
			}
		}
		//localnotification
		if (
			this.user.role == "cliente" &&
			(shop.pedido == undefined || shop.pedido == null)
		) {
			const params: LocalNotification = {
				text: "Envíalo y acumula puntos para redimir por premios.",
				title: "Tienes un pedido pendiente por enviar",
				trigger: { at: new Date(new Date().getTime() + 1800000) },
			};
			this.localNotification.setLocalNotification(params);
		}

		shop.status_productos_pendientes =
			JSON.stringify(shop.productos_seleccionados) == "{}" ? false : true;
		this.shopSingletonService.setSelectedShop(shop);
		this.shopSingletonService.setStorageSelectedShop(shop);
		this.store.dispatch(
			new FilterProductsAction(shop.productos_seleccionados, false)
		);
	}

	async generalPropuseAlert(message: string) {
		let buttons = [
			{
				text: "Aceptar",
				cssClass: "",
				role: "cancel",
			},
		];
		const alert = await this.alertController.create({
			header: "Información",
			subHeader: "",
			message: message,
			buttons: buttons,
		});
		await alert.present();
	}

	getFullProductName() {
		return this.util.getFullProductName(this.product);
	}

	calcularPts(product: IProduct) {
		return this.cashRegisterService.calcularPts(product);
  }
  
  closeModal() {
    this.modalController.dismiss()
  }

  public changeActiveMesure(medida){
	  console.log("entra modal cambio medida", medida);
	  	Object.keys(this.mesures).forEach( (element, index) => {
            this.mesures[element] = false;
        } );
        this.mesures[medida] = true;
      
        this.specialOffersService.product = this.product;
        let r = this.specialOffersService.changeActiveMesure(medida);
        this.product = r[0];
        //this.mesures = r[1];
        console.log("dfadsfadf",r);
        this.mesure_choosen = r[2]; 
        this.saveProductStockValid();
        this.specialOffersService.product = this.product; 
        //aplicar las reglas de las oferas
        this.specialOffersService.aplicarReglas();
    }

}
