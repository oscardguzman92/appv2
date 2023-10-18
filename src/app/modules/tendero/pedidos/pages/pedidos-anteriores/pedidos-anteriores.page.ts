import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Shop} from '../../../../../models/Shop';
import {Order} from '../../../../../models/Order';
import {Seller} from '../../../../../models/Seller';
import {jumpAnimation} from '../../../../../animations/jump.animation';
import {GeneralCarritoComprasComponent} from '../../../../compartido/general/components/general-carrito-compras/general-carrito-compras.component';
import {ActionsSubject} from '@ngrx/store';
import {ModalController} from '@ionic/angular';
import {filter} from 'rxjs/operators';
import {COUNT_PRODUCTS_ORDER, CountProductsOrderAction} from '../../../../compartido/pedidos/store/orders.actions';
import {Subscription} from 'rxjs';
import {CashRegisterService} from '../../../../../services/orders/cash-register.service';

@Component({
    selector: 'app-pedidos-anteriores',
    templateUrl: './pedidos-anteriores.page.html',
    styleUrls: ['./pedidos-anteriores.page.scss'],
    animations: [jumpAnimation]
})
export class PedidosAnterioresPage implements OnInit {
    public shop: Shop;
    public favoriteOrders: Order[];
    public user: Seller;
    public thingState: string;
    public nProducts = 0;
    public orderValue = 0;
    public nombreTienda = "";
    public direccionTienda = "";

    public actionsCountProductsOrder = new Subscription();

    constructor(private route: ActivatedRoute,
                private router: Router,
                private modalController: ModalController,
                private actionsS: ActionsSubject,
                private cashRegisterServices: CashRegisterService) {
        this.thingState = 'start';
        this.user = this.route.snapshot.data['user'];
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.shop = this.router.getCurrentNavigation().extras.state.data.shop;
                this.nombreTienda = this.shop.nombre;
                this.direccionTienda = this.shop.direccion;
                //console.log(this.router.getCurrentNavigation().extras.state.data.shop);
                this.favoriteOrders = this.router.getCurrentNavigation().extras.state.data.favoriteOrders;
            }
        });

        this.actionsCountProductsOrder = this.actionsS
            .pipe(filter((res: CountProductsOrderAction) => res.type === COUNT_PRODUCTS_ORDER))
            .subscribe((res) => {
                this.animateThing();
                this.nProducts = res.nProducts;
                this.cashRegisterServices.getOrderValue((success) => {
                    this.orderValue = success;
                });
            });
    }

    ngOnInit() {
    }

    async abrirCarrito() {
        const modal = await this.modalController.create(<any>{
            component: GeneralCarritoComprasComponent,
            backdropDismiss:false,
            cssClass: 'shopping-cart',
            componentProps: {
                shopData: this.shop,
                user: this.user
            }
        });

        return await modal.present();
    }

    public animateThing(): void {
        this.thingState = 'end';
        setTimeout(() => {
            this.thingState = 'start';
        }, 200);
    }
}
