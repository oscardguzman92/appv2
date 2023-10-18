import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { ModalOptions } from '@ionic/core';
import { AppState } from '../../../../../../store/app.reducer';
import { ToggleMenu } from '../../../../../compartido/general/store/actions/menu.actions';
import { NavigationHelper } from '../../../../../../helpers/navigation/navigation.helper';
import { ModalFiltroVentasComponent } from '../modal-filtro-ventas/modal-filtro-ventas.component';

@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.scss'],
})

export class CabeceraComponent implements OnInit {

  @Input() showBackButton: boolean;
  @Input() showTitle: boolean;
  @Input() showDataSale: boolean;
  @Input() showBackHomeButton: boolean;
  @Input() showMenuButton: boolean;
  @Input() showModalFilter: boolean;
  @Input() title: string;
  @Input() subtitle: string;
  @Input() total: string;
  @Input() products: string;
  public filterTemp: any = {
    all: true,
    paid_out_off: false,
    paid_out_on: false
  };

  constructor(
    private store: Store<AppState>,
    public location: Location,
    private navigation: NavigationHelper,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
  }

  toggleMenu() {
    this.store.dispatch(new ToggleMenu());
  }

  justBack() {
    this.location.back();
  }

  goToHome() {
    this.navigation.goTo('caja-registradora');
  }

  async openModalFilter() {
    this.filterTemp.all = true;
    const modal = await this.modalController.create(<ModalOptions>{
      component: ModalFiltroVentasComponent,
      cssClass: 'filter-modal filter-modal-two',
      componentProps: {
        filterIn: this.filterTemp
      }
    });

    modal.onDidDismiss().then(res => {
      if (!res.data) {
        return;
      }
      this.filterTemp = res.data;
    });

    return await modal.present();
  }


}
