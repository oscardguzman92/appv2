import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CashRegisterSalesModel } from '../../../../../../models/CashRegister';
import { NavigationHelper } from '../../../../../../helpers/navigation/navigation.helper';
import { ModalDetalleVentaComponent } from '../modal-detalle-venta/modal-detalle-venta.component';

@Component({
  selector: 'app-lista-venta',
  templateUrl: './lista-venta.component.html',
  styleUrls: ['./lista-venta.component.scss'],
})

export class ListaVentaComponent implements OnInit {


  @Input() item: CashRegisterSalesModel;

  constructor(
    public navigation: NavigationHelper,
    private modalController: ModalController

  ) { }

  ngOnInit() {
    console.log(this.item, 'item');

  }

  goToSaleDetail() {
    this.navigation.goTo('detalle-venta', this.item);
  }

  async openModalDetail(sale, event) {
    const modal = await this.modalController.create(<any>{
        component: ModalDetalleVentaComponent,
        cssClass: 'shopping-cart',
        componentProps: { sale: sale }
    });

    modal.onDidDismiss().then(res => {
        if (res.data) {}
    });

    return await modal.present();
}

}
