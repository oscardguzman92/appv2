import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {IonSlides} from '@ionic/angular';
import {Order} from '../../../../../../../models/Order';
import {CountProductsOrderAction} from '../../../../../../compartido/pedidos/store/orders.actions';
import {OrdersService} from '../../../../../../../services/orders/orders.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../../../store/app.reducer';
import {Shop} from '../../../../../../../models/Shop';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
    selector: 'app-pedidos-pedido-anterior',
    templateUrl: './pedidos-pedido-anterior.component.html',
    styleUrls: ['./pedidos-pedido-anterior.component.scss'],
})
export class PedidosPedidoAnteriorComponent implements OnInit {
    @ViewChild('slides') slides: IonSlides;
    @Input() favoriteOrder: Order;
    @Input() item: number;
    @Input() shop: Shop;

    public slideOpts = {
        effect: 'flip',
        slidesPerView: 'auto',
        spaceBetween: 10,
        zoom: false
    };

    constructor(private orderService: OrdersService, private analyticsService:AnalyticsService, private store: Store<AppState>) {
    }

    ngOnInit() {
    }

    requestOrder(order: Order) {
        console.log(order.id);
        this.analyticsService.sendEvent('prod_agr_ped_sugerido', { 'event_category': 'prod_agr_ped_sugerido', 'event_label': 'prod_agr_ped_sugerido_$' + order.id });
        this.orderService.addCarFavoriteOrder(order, this.shop)
            .then((res) => {
                this.store.dispatch(new CountProductsOrderAction(res));
            });
    }

}
