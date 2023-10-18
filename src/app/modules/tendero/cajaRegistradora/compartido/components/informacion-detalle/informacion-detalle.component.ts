import { Component, OnInit } from '@angular/core';
import { CashRegisterSalesModel } from '../../../../../../models/CashRegister';
import { NavigationHelper } from '../../../../../../helpers/navigation/navigation.helper';

@Component({
  selector: 'app-informacion-detalle',
  templateUrl: './informacion-detalle.component.html',
  styleUrls: ['./informacion-detalle.component.scss'],
})
export class InformacionDetalleComponent implements OnInit {
  public detail: CashRegisterSalesModel;
  public products: any;
  public showQuantity = false;
  public slideOpts = {
      initialSlide: 0,
      speed: 400,
      slidesPerView: 2,
      slidesPerColumn: 4,
      spaceBetween: 8,
      centerInsufficientSlides: false,
      slidesPerColumnFill: 'row'
  };

  constructor(
    public navigation: NavigationHelper,
  ) { }

  ngOnInit() {
    this.detail = this.navigation.params.state.data;
    this.products = this.navigation.params.state.data.products;
  }

}
