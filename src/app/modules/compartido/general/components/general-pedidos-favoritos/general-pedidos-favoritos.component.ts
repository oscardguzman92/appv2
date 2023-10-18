import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { Order } from 'src/app/models/Order';
import { OrdersService } from 'src/app/services/orders/orders.service';
import { Shop } from 'src/app/models/Shop';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { CountProductsOrderAction } from 'src/app/modules/compartido/pedidos/store/orders.actions';

@Component({
  selector: 'app-general-pedidos-favoritos',
  templateUrl: './general-pedidos-favoritos.component.html',
  styleUrls: ['./general-pedidos-favoritos.component.scss'],
})
export class GeneralPedidosFavoritosComponent implements OnInit {

  @ViewChild('slides') slides: IonSlides;
  @Input() favoriteOrders: Order[];
  @Input() shop: Shop;

  public slideOpts = {
    slidesPerView: 'auto',
    spaceBetween: 10,
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
