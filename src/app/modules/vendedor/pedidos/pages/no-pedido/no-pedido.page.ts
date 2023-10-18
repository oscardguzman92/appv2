import { Component, OnInit } from "@angular/core";
import { NavigationHelper } from "../../../../../helpers/navigation/navigation.helper";
import { ActionsSubject, Store } from "@ngrx/store";
import {GetMotivosAction, SET_MOTIVOS_NO_PEDIDO, SetMotivosAction, GET_MOTIVOS_NO_PEDIDO} from '../../store/motivos/motivos.actions';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {IUser} from '../../../../../interfaces/IUser';
import {
	ModalController,
	ToastController,
	AlertController
} from "@ionic/angular";
import { OrdersService } from "src/app/services/orders/orders.service";
import { AppState } from "src/app/store/app.reducer";
import { ActivatedRoute, Router } from "@angular/router";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import {
	LoadingOn,
	LoadingOff
} from "src/app/modules/compartido/general/store/actions/loading.actions";
import { Storage } from "@ionic/storage";
import { SetListShopsAction } from "../../../misClientes/store/mis-clientes.actions";
import { Device } from "@ionic-native/device/ngx";
import { Diagnostic } from "@ionic-native/diagnostic/ngx";
import { GeolocationHelper } from "../../../../../helpers/geolocation/geolocation.helper";
import { SuperSellerService } from 'src/app/services/users/super-seller.service';
import { IMotivo } from 'src/app/interfaces/IMotivo';
import { GET_ACCOUNT_ASSIGN } from '../../../compartido/store/assign/assign.actions';
import {SET_OFFLINE_DYNAMIC, SetOfflineDynamicAction} from '../../../compartido/store/offlineDynamic/offlineDynamic.actions';
import {CacheService} from 'ionic-cache';

@Component({
	selector: "app-no-pedido",
	templateUrl: "./no-pedido.page.html",
	styleUrls: ["./no-pedido.page.scss"]
})
export class NoPedidoPage implements OnInit {

	private motivosSubs = new Subscription();
	public motivos: IMotivo[]; 
	public user: IUser;
	public offlineDynamic: boolean;
	public subsOfflineDynamic = new Subscription();
 	
	params: any = {
		token: "",
		motivo_id: "",
		tienda_id: "",
		activo: ""
	};
	shop: any;

	constructor(
		private actionsObj: ActionsSubject,
		private geolocation: Geolocation,
		private modal: ModalController,
		private superSellerService: SuperSellerService,
		private store: Store<AppState>,
		private storage: Storage,
		private orderService: OrdersService,
		public toastController: ToastController,
		public alertController: AlertController,
		private navigation: NavigationHelper,
		private route: ActivatedRoute,
		private router: Router,
		private geolocationHelper: GeolocationHelper,
		private cache: CacheService,
	) {
		this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];

		this.route.queryParams.subscribe(params => {
			this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];

			if (this.router.getCurrentNavigation().extras.state) {
				this.shop = this.router.getCurrentNavigation().extras.state.data.shop;
				this.params.tienda_id = this.shop.id;
				this.params.token = this.shop.token;
			}
		});
	}

	ngOnInit() {
		this.user = this.route.snapshot.data.user;

		this.subsOfflineDynamic = this.actionsObj
			.pipe( filter(res => res.type === SET_OFFLINE_DYNAMIC))
			.subscribe((res: SetOfflineDynamicAction) => {
				this.offlineDynamic = res.on;
				this.cache.saveItem('offlineDynamic', true, 'offlineDynamic', 600);
			});

		if (this.shop.offline || this.offlineDynamic) {
			this.storage.get('getDatosSinConexionCouch').then(result => {
				this.motivos = result.razones_no_compra
			});
		}
		else {
			this.store.dispatch(new GetMotivosAction(this.user.token));
			this.motivosSubs = this.actionsObj
				.pipe(filter(action => action.type === SET_MOTIVOS_NO_PEDIDO))
				.subscribe((res: SetMotivosAction) => {
					this.motivos = res.motivosNoPedido;
				});
		}
	}

	ionViewDidEnter() {}

	changeOption(id: number) {
		for (let i = 0; i < this.motivos.length; i++) {
			if (this.motivos[i].id != id) {
				this.motivos[i].isChecked = false;
			}
		}
		this.params.motivo_id = id;
	}



	justBack() {
		this.navigation.justBack();
	}
	
	sendMotivation() {
		this.navigation.noPurchase = true;

		if (this.shop.offline || this.offlineDynamic) {
			this.saveReasonsNotRequestedOffLineLS();
		}
		else {

			if (this.params.motivo_id) {
				this.store.dispatch(new LoadingOn());
				const opt = {
					maximumAge: 30000,
					enableHighAccuracy: true,
					timeout: 10000
				};
				this.geolocation
					.getCurrentPosition(opt)
					.then(resp => {
						this.params.latitud = resp.coords.latitude;
						this.params.longitud = resp.coords.longitude;
						this.params.super_vendedor_id = this.superSellerService.idSuperSeller;
						this.orderService.setMotivoNoPedido(this.params).subscribe(
							success => {
								this.store.dispatch(new LoadingOff());
								if (success.status == "ok" && success.code == "0") {
									this.storage.get("user").then(async res => {
										res = JSON.parse(res);
										res.tiendas.forEach(e => {
											if (e.id == this.shop.id)
												e.no_pedido = this.params.motivo_id;
										});
										this.storage
											.set("user", JSON.stringify(res))
											.then(() => {
												this.store.dispatch(
													new SetListShopsAction(
														res.tiendas
													)
												);
												this.presentToastWithOptions(
													success.content[0]
												);
												this.navigation.goTo(
													"lista-clientes"
												);
											});
									});
								} else {
									this.presentToastWithOptions(
										success.content[0]
									);
								}
							},
							error => {
								this.store.dispatch(new LoadingOff());
								this.presentToastWithOptions(
									"Hubo un error, intente nuevamente."
								);
							}
						);
					})
					.catch(error => {
						this.store.dispatch(new LoadingOff());
						this.geolocationHelper.showErrorLocation(error);
					});
			}

		}
	}

	saveReasonsNotRequestedOffLineLS() {

		let isForInsert = true;

		const reasonsNotRequested = {
			vendedor_id: this.user.v_id,
			tienda_id: this.shop.id,
			motivo_id: this.params.motivo_id,
			latitud: 0,
			longitud: 0,
			fecha: new Date().toISOString().split('T')[0]
		}

		this.storage.get('reasonsNotRequested').then(result => {
			if (result) {
				result.forEach(item => {
					if (item.tienda_id === this.shop.id) {
						isForInsert = false;
					}
				})

				if (isForInsert) {
					result.push(reasonsNotRequested);
					this.storage.set('reasonsNotRequested', result);
					this.navigation.goTo("lista-clientes");
				} else {
					this.presentToastWithOptions("La tienda ya cuenta con un motivo de No Pedido para el día");
				}
			}
			else {
				this.storage.set('reasonsNotRequested', [reasonsNotRequested]);
				this.navigation.goTo("lista-clientes");
			}
		});

	}

	async presentToastWithOptions(message: string) {
		const toast = await this.toastController.create({
			message: message,
			position: "bottom",
			showCloseButton: true,
			closeButtonText: "Cerrar",
			duration: 3000
		});
		toast.present();
	}
}
