import { Component, OnInit } from '@angular/core';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';

@Component({
  selector: 'app-detalle-venta-caja-registradora',
  templateUrl: './detalle-venta-caja-registradora.page.html',
  styleUrls: ['./detalle-venta-caja-registradora.page.scss'],
})
export class DetalleVentaCajaRegistradoraPage implements OnInit {
  public title: string;
  public subtitle: string;
  public showTitle: boolean;
  public showBackButton: boolean;

  constructor( private navigation: NavigationHelper ) { }

  ngOnInit() {
    this.title = 'Detalle de la venta';
    this.subtitle = 'Productos agregados a la compra';
    this.showTitle = true;
    this.showBackButton = true;
  }
  goSales(params: any = null) {
    this.navigation.goTo('ventas');
  }
  close() {
    this.goSales();
  }

}
