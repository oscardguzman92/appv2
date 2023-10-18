import {Component, OnInit} from '@angular/core';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../store/myOrders/myOrders.reducer';
import {Subscription} from 'rxjs';
import {filter, finalize} from 'rxjs/operators';
import {Order} from '../../../../../models/Order';
import {AlertController, ModalController, ToastController} from '@ionic/angular';
import {
    CompartidoSeleccionTiendaComponent
} from '../../../compartido/components/compartido-seleccion-tienda/compartido-seleccion-tienda.component';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {Shop} from '../../../../../models/Shop';
import {GetMyOrdersAction} from '../../store/myOrders/myOrders.actions';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {ActivatedRoute, Router} from '@angular/router';
import {IShops} from '../../../../../interfaces/IShops';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {IUser} from '../../../../../interfaces/IUser';
import { MisPedidosCalificaComponent } from './components/mis-pedidos-califica/mis-pedidos-califica.component';
import { MisPedidosDetalleComponent  } from './components/mis-pedidos-detalle/mis-pedidos-detalle.component';
import { OrdersService, IOrder } from 'src/app/services/orders/orders.service';
import { GeneralCarritoComprasComponent } from 'src/app/modules/compartido/general/components/general-carrito-compras/general-carrito-compras.component';
import { Storage } from '@ionic/storage';
import {UpdateAssociation} from '../../../../vendedor/misClientes/store/mis-clientes.actions';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';
import {FilterProductsAction, GetOrderAction} from '../../../../compartido/pedidos/store/orders.actions';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import {GetHistoryTopUps} from '../../../recargas/store/topUps/topUps.actions';
import { GetMotivosAction, SetMotivosAction, SET_MOTIVOS_CALIFICACION } from '../../store/motivosCalificacion/motivosCalificacion.actions';

@Component({
    selector: 'app-mis-pedidos',
    templateUrl: './mis-pedidos.page.html',
    styleUrls: ['./mis-pedidos.page.scss'],
})
export class MisPedidosPage implements OnInit {

    private myOrdersSubscribe = new Subscription();
    private motivosSubs = new Subscription();
    public  myOrders: Order[] = [];
    public motivosCalificacion: any = '';
    public  shop: Shop;
    public  title: string;
    public  showBack: boolean;
    private user: IUser;
    private maxPaginate = 0;
    private nPagePaginate = 2;
    orderStorage: any;

    constructor(private store: Store<AppState>,
                private actionsObj: ActionsSubject,
                private route: ActivatedRoute,
                private router: Router,
                private storage: Storage,
                private orderService: OrdersService,
                private navigation: NavigationHelper,
                private modalController: ModalController,
                public toastController: ToastController,
                private alert: AlertController,
                private utilities: UtilitiesHelper,
                public shopSingletonService: ShopSingletonService,
        ) {
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.shop = <Shop>this.router.getCurrentNavigation().extras.state.data.shop;
            }
        });
    }

    ngOnInit() {
        this.user     = this.route.snapshot.data['user'];
        this.title    = (this.user.tipo_usuario === 'vendedor') ? this.user.nombre_contacto : 'Mis pedidos';
        this.showBack = true;

        if (!this.shop) {
            this.navigation.goTo(this.user.rootPage);
        }

        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetMyOrdersAction(this.user.token, this.shop, 1, true));

        this.orderStorage = this.shopSingletonService.getSelectedShop();

        this.store.dispatch(new GetMotivosAction(this.user.token));

        this.motivosSubs = this.actionsObj
		.pipe(filter(action => action.type === SET_MOTIVOS_CALIFICACION))
		.subscribe((res: SetMotivosAction) => {
			console.log(res.motivosCalificacion);
			this.motivosCalificacion = res.motivosCalificacion;
			/*	res.forEach(element => {
			this.motivos.id = element.id;
			this.motivos.motivo = element.motivo;
			this.motivos.activo = element.activo;
			}); */
			
		}); 

        this.myOrdersSubscribe = this.store.select('myOrders')
            .pipe(filter(res => res.myOrders !== null))
            .subscribe(res => {
                this.maxPaginate = res.paginate.pages;
                this.myOrders = res.myOrders;
                this.store.dispatch(new LoadingOff());                
            });
    }

    ionViewWillLeave() {
        this.myOrdersSubscribe.unsubscribe();
    }

    private async openModalEvaluateOrder(order) {
        const modal = await this.modalController.create(<any>{
            component: MisPedidosCalificaComponent,
            cssClass: 'general-modal',
            componentProps: { order: order,
                             motivos: this.motivosCalificacion}
        });        
        modal.onDidDismiss().then(res => {
            if (res.data) {
                this.store.dispatch(new LoadingOn());
                 this.orderService.setDatosCalificacion2(res.data).subscribe(success => {
                    this.store.dispatch(new LoadingOff());
                    this.presentToastWithOptions('Calificación enviada.');
                    if (success.status == 'ok' && success.code == '0') {
                        this.store.dispatch(new GetMyOrdersAction(this.user.token, this.shop, 1, true));
                        this.navigation.goToBack('mis-pedidos');
                    }
                }, error => {});
            }
        });

        return await modal.present();
    }

    async openModalDetailOrder(order, event) {
        if (this.orderStorage && this.orderStorage.pedido && this.orderStorage.pedido == order.id) {
            this.abrirCarrito();
        } else {
            if (event.target.className.indexOf('button-outline') === -1 && event.target.className.indexOf('button-again') === -1) {
                const modal = await this.modalController.create(<any>{
                    component: MisPedidosDetalleComponent,
                    cssClass: 'shopping-cart',
                    componentProps: { order: order,
                                       user: this.user}
                });

                modal.onDidDismiss().then(res => {
                    if (res.data) {}
                });

                return await modal.present();
            }
            return false;
        }
    }

    async abrirCarrito() {
        const modal = await this.modalController.create(<any>{
            component: GeneralCarritoComprasComponent,
            backdropDismiss: false,
            cssClass: 'shopping-cart',
            componentProps: {
                user: this.user
            }
        });

        return await modal.present();
    }

    requestAgain(order) {
        const productos_disponibles = (order.productos_disponibles) ? (order.productos_disponibles) : [];

        if (productos_disponibles.length === 0 || !order.codigo_cliente) {
            this.store.dispatch(new Fail({mensaje: 'Todos los productos de este pedido no se encuentran disponibles'}));
            setTimeout(() => {
                this.store.dispatch(new LoadingOff());
            }, 300);
            return;
        }

        if (productos_disponibles.length < order.productos.length) {
            order.productos = order.productos.filter((product) => {
                return productos_disponibles.indexOf(product.id) > -1;
            });
            this.presentAlert(order);
            return;
        }

        this.assignProducts(order);
    }

    loadInfiniteScroll(event) {
        if (this.maxPaginate >= this.nPagePaginate) {
            this.store.dispatch(new LoadingOn());
            this.store.dispatch(new GetMyOrdersAction(this.user.token, this.shop, this.nPagePaginate, true));
            this.nPagePaginate++;
            event.target.complete();
        } else {
            event.target.disabled = true;
        }
    }
    
    private assignProducts(order) {
        let shop = this.shopSingletonService.getSelectedShop();
        const productsObj = {};
        const orderProducts = order.productos;
        orderProducts.reduce(function (acc, cur, i) {
            productsObj[cur.id] = cur;
            return acc;
        }, {});


        /* if (this.shop.codigo_cliente) {
            res = this.utilities.orderStorage(res, this.shop, true);
        } else {
            res = this.utilities.orderStorageWithoutCode(res, this.shop, true);
        } */
        shop.productos_seleccionados = productsObj;
        this.shopSingletonService.setSelectedShop(shop);
        this.shopSingletonService.setStorageSelectedShop(shop);
        this.store.dispatch(new FilterProductsAction(shop.productos_seleccionados, false));
        this.abrirCarrito();
    }

    private async presentAlert(order) {
        const alert = await this.alert.create({
            header: `¡Atención!`,
            message: `Hay productos que no se encuentran disponibles`,
            cssClass: 'attention-alert',
            buttons: [
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.assignProducts(order);
                    }
                }
            ]
        });

        return await alert.present();
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
}
