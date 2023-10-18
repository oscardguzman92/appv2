import { Component, Input, Output, EventEmitter, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { Storage } from '@ionic/storage';
import { UtilitiesHelper } from 'src/app/helpers/utilities/utilities.helper';
import { Store } from '@ngrx/store';
import { async } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { CashRegisterInSaleState, CashRegisterInSaleDataState } from '.././../../store/cash-register.reducer';
import { CashRegisterInSaleAction, CashRegisterInSaleDataAction } from '.././../../store/cash-register.actions';
import { CashRegisterModel } from '../../../../../../models/CashRegister';
import { IProduct, ISale } from '../../../../../../interfaces/ICashRegisterSale';
import { NavigationHelper } from '../../../../../../helpers/navigation/navigation.helper';
import { CashRegisterHelper } from '../../../../../../helpers/cash-register/cash-register.helper';


@Component({
  selector: 'app-lista-producto',
  templateUrl: './lista-producto.component.html',
  styleUrls: ['./lista-producto.component.scss'],
})
export class ListaProductoComponent implements OnInit, OnDestroy {
  @Input() textButton: string;
  @Input() product: IProduct;
  @Input() order: number;
  @Input() position: number;
  @Input() sync: boolean;
  @Input() isInNewSale: boolean;
  @Input() showQuantity: boolean;
  @Input() inSale: boolean;
  @Input() container: any;

  public item: number;
  public subscriptionInSaleData = new Subscription();
  public statusInputCountProd = false;

  private cashRegisterData: CashRegisterModel = {
    products: [],
    sale: null,
    client: null,
  };

  public productSelect: IProduct = {
    _id: 0,
    ean: '',
    fullname: '',
    name: '',
    description: '',
    variant: '',
    presentation: '',
    size: 0,
    unit_measurement: 0,
    quantity: 0,
    price: 0,
    iva: 0,
    show: false,
    outstanding: false,
    overriding: false,
    order: 0,
    brand_id: 0,
    shopkeeper_id: 0,
    mysql_id: 0,
  };

  private saleSelect: ISale = {
    id: 0,
    quantity: 0,
    total: 0,
    iva: 0,
    subtracting: 0,
    trustworthy: false,
    card: false,
    cash: false,
    paid_out: false,
    shopkeeper_id: 0,
    client_id: 0,
    created_at: null,
  };


  public compania: any = {};

  constructor(
    public navigation: NavigationHelper,
    private storage: Storage,
    private storeInSale: Store<CashRegisterInSaleState>,
    private storeInSaleData: Store<CashRegisterInSaleDataState>,
    private util: UtilitiesHelper,
    private cashRegisterHelper: CashRegisterHelper,
    private analyticsService: AnalyticsService,

  ) {
  }

  async ngOnInit() {
  }

  confingureInSale() {
    this.subscriptionInSaleData = this.storeInSaleData
      .select('CashRegisterInSaleData')
      .subscribe(async response => {
        if (response.active) {
          response.CashRegisterData.products.forEach(element => {
            const isPresent = this.cashRegisterHelper.findObjectByKey(this.cashRegisterData.products, '_id', element._id);
            if (isPresent === -1) {
              this.cashRegisterData.products.push(element);
            } else if (this.isInNewSale) {
              this.cashRegisterData.products[isPresent] = element;
            }
          });
          let InSale: CashRegisterInSaleAction;
          if (await this.amountProducts() > 0) {
            InSale = new CashRegisterInSaleAction(true, true);
          } else {
            InSale = new CashRegisterInSaleAction(true, false);
          }
          this.storeInSale.dispatch(InSale);

        }
      });
  }

  onBlur() {
    this.statusInputCountProd = false;
  }

  onFocus() {
    this.statusInputCountProd = true;
  }

  ngOnDestroy() {
    this.subscriptionInSaleData.unsubscribe();
  }

  goToConfirmData() {
    if (this.inSale !== null) {
      const data = {
        product: this.product,
        inSale: this.inSale
      };
      this.navigation.goTo('confirmar-datos', data);
    }
  }
/*
  ngOnChanges(changes) {
    if (changes.sync.currentValue) {
      this.syncUpProducts();
    }
  }

  async syncUpProducts() {
    this.storage.get('CashRegisterInSaleData').then(async response => {
      if (response !== null) {
        response.products.forEach(element => {
          const isPresent = this.cashRegisterHelper.findObjectByKey(this.cashRegisterData.products, '_id', element._id);
          if (isPresent === -1) {
            this.cashRegisterData.products.push(element);
          } else {
            this.cashRegisterData.products[isPresent] = element;
          }
        });
        let InSale: CashRegisterInSaleAction;
        if (await this.amountProducts() > 0) {
          InSale = new CashRegisterInSaleAction(true, true);
        } else {
          InSale = new CashRegisterInSaleAction(true, false);
        }
        this.storeInSale.dispatch(InSale);
      }
    });
  }
*/
  rmToNewSale() {

    this.analyticsService.sendEvent('cr_resumen_venta_prod_cantidad', {
      'event_category': 'cr_resumen_venta_prod',
      'event_label': 'cr_resumen_venta_prod_rm'
    } );

    const quantity = this.product.quantity - 1;
    this.statusInputCountProd = false;
    this.product.quantity = quantity;
    this.saveProduct(quantity);
    return false;
  }

  addToNewSale(multiplier: number) {

    this.analyticsService.sendEvent('cr_resumen_venta_prod_cantidad', {
      'event_category': 'cr_resumen_venta_prod',
      'event_label': 'cr_resumen_venta_prod_add'
    } );

    const quantity = (multiplier === undefined) ? +this.product.quantity + 1 : multiplier;
    this.product.quantity = quantity;
    this.saveProduct(quantity);
    return false;
  }

  async amountPrice() {
    const response = await this.cashRegisterData;
    const amount = response.products.reduce(function (acc, current) {
      return acc + (+current.price * current.quantity);
    }, 0);
    return await Math.round(amount);
  }

  async amountProducts() {
    const response = await this.cashRegisterData;
    const amount = response.products.reduce(function (acc, current) {
      return acc + Number(current.quantity);
    }, 0);
    return await amount;
  }

  async saveProduct(quantity: number) {

    this.storage.get('CashRegisterInSaleData').then(async response => {

      this.cashRegisterData.products = response.products;

      this.productSelect._id = this.product._id;
      this.productSelect.quantity = quantity;
      this.productSelect.name = this.product.name;
      this.productSelect.ean = this.product.ean;
      this.productSelect.description = this.product.description;
      this.productSelect.show = this.product.show;
      this.productSelect.price = this.product.price;
      this.productSelect.iva = this.product.iva;

      const isPresent = this.cashRegisterHelper.findObjectByKey(this.cashRegisterData.products, '_id', this.productSelect._id);

      if ( quantity === 0) {
        this.cashRegisterData.products.splice(isPresent, 1);
      } else {
        if (isPresent === -1) {
          this.cashRegisterData.products.push(this.productSelect);
        } else {
          this.cashRegisterData.products[isPresent] = this.productSelect;
        }
      }

      this.saleSelect.id = 0;
      this.saleSelect.total = await this.amountPrice();
      this.saleSelect.quantity = await this.amountProducts();
      this.saleSelect.iva = 0.19;

      this.cashRegisterData.sale = this.saleSelect;

      const InSaleData = new CashRegisterInSaleDataAction(true, this.cashRegisterData);
      this.storeInSaleData.dispatch(InSaleData);

      let InSale: CashRegisterInSaleAction;
      if (await this.amountProducts() > 0) {
        InSale = new CashRegisterInSaleAction(true, true);
      } else {
        InSale = new CashRegisterInSaleAction(true, false);
      }
      this.storeInSale.dispatch(InSale);

    });

  }

  changeCountProd(e, statusInputCountProd = false) {
    this.statusInputCountProd = true;
    this.addToNewSale(e.target.value);
    if ((e.target.value) === 0) {
      this.statusInputCountProd = false;
    } else {
      this.statusInputCountProd = statusInputCountProd;
    }
  }

  getFullProductName() {
    return this.util.getFullProductNameMicro(this.product, 'small');
  }
}
