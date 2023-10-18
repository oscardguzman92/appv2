import { Component, OnInit, Input } from '@angular/core';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { UtilitiesHelper } from 'src/app/helpers/utilities/utilities.helper';
import { IProduct } from '../../../../../../interfaces/ICashRegisterSale';
import { NavigationHelper } from '../../../../../../helpers/navigation/navigation.helper';

@Component({
  selector: 'app-postal-producto',
  templateUrl: './postal-producto.component.html',
  styleUrls: ['./postal-producto.component.scss'],
})
export class PostalProductoComponent implements OnInit {

  @Input() product: IProduct;
  @Input() order: number;
  @Input() position: number;

  constructor(
    private util: UtilitiesHelper,
    private analyticsService: AnalyticsService,
    public navigation: NavigationHelper,
  ) { }

  ngOnInit() {}

  getFullProductName() {
    return this.util.getFullProductNameMicro(this.product, 'small');
  }

  goToConfirmData() {
    this.analyticsService.sendEvent('cr_registro_sin_cod', {
      'event_category': 'cr_sec_registra_venta'
      } );
      const data = {
        product: this.product,
        inSale: true
      };
      this.navigation.goTo('confirmar-datos', data);
  }
}
