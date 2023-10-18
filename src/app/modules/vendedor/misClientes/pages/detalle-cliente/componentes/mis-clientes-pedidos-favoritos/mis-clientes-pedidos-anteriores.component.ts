import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {IonSlides} from '@ionic/angular';
import {Order} from '../../../../../../../models/Order';
import {OrdersService} from '../../../../../../../services/orders/orders.service';
import {Shop} from '../../../../../../../models/Shop';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../../../store/app.reducer';
import {CountProductsOrderAction} from '../../../../../../compartido/pedidos/store/orders.actions';

@Component({
    selector: 'app-mis-clientes-pedidos-anteriores',
    templateUrl: './mis-clientes-pedidos-anteriores.component.html',
    styleUrls: ['./mis-clientes-pedidos-anteriores.component.scss'],
})
export class MisClientesPedidosAnterioresComponent implements OnInit {
    @ViewChild('slides') slides: IonSlides;
    @Input() favoriteOrders: Order[];
    @Input() shop: Shop;

    public slideOpts = {
        effect: 'flip',
        slidesPerView: 'auto',
        spaceBetween: 10,
        zoom: false
    };

    constructor(private orderService: OrdersService, private store: Store<AppState>) {
    }

    ngOnInit() {
    }

    requestOrder(order: Order) {
        this.orderService.addCarFavoriteOrder(order, this.shop)
            .then((res) => {
                this.store.dispatch(new CountProductsOrderAction(res));
            });
    }
}
