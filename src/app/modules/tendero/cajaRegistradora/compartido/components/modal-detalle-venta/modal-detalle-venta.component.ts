import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Store } from '@ngrx/store';
import { DatePipe } from '@angular/common';
import { NavigationHelper } from '../../../../../../helpers/navigation/navigation.helper';
import { IUser } from '../../../../../../interfaces/IUser';
import {
  CashRegisterPaySaleState,
  CashRegisterReminderPayState,
} from '../../../store/cash-register.reducer';
import {
  CashRegisterPaySaleAction,
  CashRegisterReminderPayAction,
} from '../../../store/cash-register.actions';

@Component({
  selector: 'app-modal-detalle-venta',
  templateUrl: './modal-detalle-venta.component.html',
  styleUrls: ['./modal-detalle-venta.component.scss'],
  providers: [DatePipe],
})
export class ModalDetalleVentaComponent implements OnInit {

  @Input('sale') sale;
  public user: IUser;
  public sendReminder = true;

  constructor(
    private route: ActivatedRoute,
    private modal: ModalController,
    private storePaySale: Store<CashRegisterPaySaleState>,
    private storeReminderPay: Store<CashRegisterReminderPayState>,
    public navigation: NavigationHelper,
    private storage: Storage,
    private events: Events,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.user = this.route.snapshot.data['user'];

  }

  close() {
    this.modal.dismiss();
  }

  paySale() {
    this.storage.get('user').then(response => {
      this.user = JSON.parse(response);
      const PaySale = new CashRegisterPaySaleAction(true, this.user.token, this.sale.sale._id);
      this.storePaySale.dispatch(PaySale);
      this.events.publish('updateEvents');
      this.close();
    });
  }

  reminderPay() {

    this.storage.get('user').then(response => {
      this.user = JSON.parse(response);
      const phone = this.sale.client.phone;
      // tslint:disable-next-line: max-line-length
      let message = '';
      message += this.sale.client.name.charAt(0).toUpperCase() + this.sale.client.name.slice(1);
      message += ', recuerda pasar por ';
      message += this.user.tiendas[0].nombre;
      message += ' y cancelar los $';
      message += this.sale.sale.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      message += ' que te fiaron el ';
      message +=
      this.datePipe.transform(this.sale.sale.created_at, 'EEEE') +
      ' ' +
      this.datePipe.transform(this.sale.sale.created_at, 'dd') +
      ' de ' +
      this.datePipe.transform(this.sale.sale.created_at, 'MMMM') +
      '.';
      const ReminderPay = new CashRegisterReminderPayAction(true, this.user.token, phone, message);
      this.storeReminderPay.dispatch(ReminderPay);
      this.sendReminder = false;
    });

  }

  goToSales() {
    this.navigation.goTo('ventas');
  }
}
