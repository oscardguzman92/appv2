import { Component, OnInit, OnDestroy } from '@angular/core';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { UtilitiesHelper } from 'src/app/helpers/utilities/utilities.helper';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '../../../../../interfaces/IUser';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { CashRegisterHelper } from '../../../../../helpers/cash-register/cash-register.helper';
import { IProduct, ISale, IShopkeeperProduct } from '../../../../../interfaces/ICashRegisterSale';
import { CashRegisterModel } from '../../../../../models/CashRegister';

import {
  CashRegisterInSaleState,
  CashRegisterInSaleDataState,
  CashRegisterShopkeeperProductState,
  CashRegisterProductState,
  CashRegisterProductCompleteState,
  CashRegisterSearchProductsCompleteState
} from '../../store/cash-register.reducer';

import {
  CashRegisterInSaleAction,
  CashRegisterInSaleDataAction,
  CashRegisterShopkeeperProductAction,
  CashRegisterProductAction,
  CashRegisterSearchProductsCompleteAction
} from '../../store/cash-register.actions';

@Component({
  selector: 'app-confirmar-datos-caja-registradora',
  templateUrl: './confirmar-datos-caja-registradora.page.html',
  styleUrls: ['./confirmar-datos-caja-registradora.page.scss'],
})

export class ConfirmarDatosCajaRegistradoraPage implements OnInit, OnDestroy {

  public subscriptionProductComplete = new Subscription();
  public subscriptionInSale = new Subscription();
  public subscriptionInSaleData = new Subscription();
  public title: string;
  public subtitle: string;
  public showTitle: boolean;
  public showBackButton: boolean;
  public showShopkeeper: boolean;
  public total: number;
  public quantity: number;
  public confirmDataProduct: FormGroup;
  public user: IUser;
  public inSale: boolean;

  private cashRegisterData: CashRegisterModel = {
    products: [],
    sale: null,
    client: null,
  };

  public productSelectClean: IProduct = {
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

  public shopkeeperProductSelect: IShopkeeperProduct = {
    product_id: 0,
    shopkeeper_id: 0,
    price: 0,
    outstanding: false,
    overriding: false,
    order: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    public navigation: NavigationHelper,
    public location: Location,
    private storage: Storage,
    private alertController: AlertController,
    private util: UtilitiesHelper,
    private storeInSaleData: Store<CashRegisterInSaleDataState>,
    private storeInSale: Store<CashRegisterInSaleState>,
    private storeShopkeeperProduct: Store<CashRegisterShopkeeperProductState>,
    private storeProduct: Store<CashRegisterProductState>,
    private storeProductComplete: Store<CashRegisterProductCompleteState>,
    private storeSearchProductsComplete: Store<CashRegisterSearchProductsCompleteState>,
    private cashRegisterHelper: CashRegisterHelper,
    public formBuilder: FormBuilder
  ) {
    this.configureForm();
  }

  ngOnInit() {
    this.configureInit();
    this.configureProduct();
    this.configureSaleData();
    this.configureInSale();
  }

  ngOnDestroy() {
    this.subscriptionProductComplete.unsubscribe();
    this.subscriptionInSale.unsubscribe();
  }

  configureForm() {

    this.confirmDataProduct = this.formBuilder.group({
      price: ['', Validators.compose([
        Validators.maxLength(7),
        Validators.minLength(2),
        Validators.pattern('^[0-9]*$'),
        Validators.required
      ])],
      quantity: ['', Validators.compose([
        Validators.maxLength(3),
        Validators.minLength(1),
        Validators.pattern('^[0-9]*$'),
        Validators.required
      ])],
    });

  }

  configureInit() {
    this.title = 'Confirmas datos';
    this.subtitle = 'Ingresa el precio del producto';
    this.showTitle = true;
    this.showBackButton = true;
    this.user = this.route.snapshot.data['user'];
  }

  configureProduct() {
    this.showShopkeeper = this.navigation.params.state.data.inSale;
    this.productSelect = this.navigation.params.state.data.product;
    this.productSelect.quantity = (this.productSelect.quantity === 0) ? 1 : this.productSelect.quantity;
    this.productSelect.price = (this.productSelect.price === null) ? 0 : this.productSelect.price;

    const Product = new CashRegisterProductAction(true, this.user.token, this.productSelect._id);
    this.storeProduct.dispatch(Product);

    this.subscriptionProductComplete = this.storeProductComplete
      .select('CashRegisterProductComplete')
      .subscribe(response => {
        if (response.active && response.ShopkeeperProduct[0] !== undefined) {
          this.shopkeeperProductSelect.outstanding = response.ShopkeeperProduct[0].outstanding;
          this.shopkeeperProductSelect.overriding = response.ShopkeeperProduct[0].overriding;
          this.shopkeeperProductSelect.price = response.ShopkeeperProduct[0].price;
          this.productSelect.price = response.ShopkeeperProduct[0].price;
        }
      });

  }

  configureInSale() {
    this.inSale = false;
    this.subscriptionInSale = this.storeInSale
      .select('CashRegisterInSale')
      .subscribe(response => {
        if (response.active) {
          this.inSale = response.inSale;
        }
      });

    this.storage.get('CashRegisterInSale').then(response => {
      if (response !== null) {
        this.inSale = response;
      }
    });
  }

  configureSaleData() {

    this.storage.get('CashRegisterInSaleData').then(response => {
      if (response !== null) {
        this.cashRegisterData = response;
        const isPresent = this.cashRegisterHelper.findObjectByKey(this.cashRegisterData.products, '_id', this.productSelect._id);
        if (isPresent === -1) {
          this.cashRegisterData.products.push(this.productSelect);
        } else {
          this.productSelect = this.cashRegisterData.products[isPresent];
        }
        const total = (response === null) ? 0 : response.sale.total;
        const quantity = (response === null) ? 0 : response.sale.quantity;
        if (total !== 0) {
          this.total = total;
          this.quantity = quantity;
        }
      }
    });

    this.subscriptionInSaleData = this.storeInSaleData
      .select('CashRegisterInSaleData')
      .subscribe(data => {
        if (data.active) {
          this.total = data.CashRegisterData.sale.total;
          this.quantity = data.CashRegisterData.sale.quantity;
        }
      });


  }

  remove(quantity: number) {

    this.analyticsService.sendEvent('cr_venta_prod_cantidad', {
      'event_category': 'cr_registro_venta_prod',
      'event_label': 'cr_venta_prod_rem'
    } );

    this.productSelect.quantity = quantity - 1;
    this.quantity = this.quantity - 1;
    this.total = +this.total - +this.productSelect.price;
  }

  add(quantity: number) {

    this.analyticsService.sendEvent('cr_venta_prod_cantidad', {
      'event_category': 'cr_registro_venta_prod',
      'event_label': 'cr_venta_prod_add'
    } );

    this.productSelect.quantity = quantity + 1;
    this.quantity = this.quantity + 1;
    this.total = +this.total + +this.productSelect.price;
  }

  goToCashRegister(params: any = null) {
    this.navigation.goTo('caja-registradora');
  }

  goToSearch(params: any = null) {
    this.navigation.goTo('buscar-caja-registradora');
  }

  clearPoducts() {
    const SearchProductsComplete = new CashRegisterSearchProductsCompleteAction(true, []);
    this.storeSearchProductsComplete.dispatch(SearchProductsComplete);
  }

  cancel() {

    this.analyticsService.sendEvent('cr_venta_prod_confirmacion', {
      'event_category': 'cr_registro_venta_prod',
      'event_label': 'cr_venta_prod_borrar'
    } );

    this.deleteProduct();
    this.location.back();
  }

  close() {
    this.location.back();
  }

  confirm() {
    if (this.showShopkeeper) {

      if ( this.confirmDataProduct.controls.price.status === 'INVALID') {
        const message = 'Ingresa un precio válido';
        this.presentAlert(message);
      } else if ( this.confirmDataProduct.controls.quantity.status === 'INVALID' ) {
        const message = 'Ingresa una cantidad válida';
        this.presentAlert(message);
      } else {

        this.analyticsService.sendEvent('cr_venta_prod_confirmacion', {
          'event_category': 'cr_registro_venta_prod',
          'event_label': 'cr_venta_prod_confirmar'
        } );

        this.saveProduct();
        this.saveShopkeeperProduct();
        this.goToCashRegister();
      }

    } else {

      if ( this.confirmDataProduct.controls.price.status === 'INVALID') {
        const message = 'Ingresa un precio válido';
        this.presentAlert(message);
      } else {
        this.saveShopkeeperProduct();
        this.location.back();
      }

    }

  }

  async presentAlert(message) {
    const alert = await this.alertController.create({
        header: 'Aviso',
        message: message,
        buttons: ['Aceptar'],
        cssClass: 'attention-alert',
    });
    return await alert.present();
  }

  saveProduct() {
    const isPresent = this.cashRegisterHelper.findObjectByKey(this.cashRegisterData.products, '_id', this.productSelect._id);
    this.cashRegisterData.products[isPresent] = this.productSelect;
    this.clearPoducts();
    this.saveData();
  }

  deleteProduct() {
    const isPresent = this.cashRegisterHelper.findObjectByKey(this.cashRegisterData.products, '_id', this.productSelect._id);
    this.cashRegisterData.products.splice(isPresent, 1);
    this.clearPoducts();
    this.saveData();
  }

  async saveData() {
    this.saleSelect.id = 0;
    this.saleSelect.total = await this.amountPrice();
    this.saleSelect.quantity = await this.amountProducts();
    this.saleSelect.iva = 0.19;

    this.cashRegisterData.sale = this.saleSelect;

    const InSaleData = new CashRegisterInSaleDataAction(true, this.cashRegisterData);
    this.storeInSaleData.dispatch(InSaleData);

    if (this.saleSelect.quantity > 0) {
      const InSale = new CashRegisterInSaleAction(true, true);
      this.storeInSale.dispatch(InSale);
    } else {
      const InSale = new CashRegisterInSaleAction(true, false);
      this.storeInSale.dispatch(InSale);
    }
  }

  saveShopkeeperProduct() {
    this.shopkeeperProductSelect.shopkeeper_id = this.user.user_id;
    this.shopkeeperProductSelect.price = this.productSelect.price;
    this.shopkeeperProductSelect.product_id = this.productSelect._id;
    const ShopkeeperProduct = new CashRegisterShopkeeperProductAction(true, this.user.token, this.shopkeeperProductSelect);
    this.storeShopkeeperProduct.dispatch(ShopkeeperProduct);
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

  getFullProductName() {
    return this.util.getFullProductNameMicro(this.productSelect, 'full');
  }

  outstanding() {
    this.shopkeeperProductSelect.outstanding = !this.shopkeeperProductSelect.outstanding;
    this.shopkeeperProductSelect.overriding = false;
  }

  overriding() {
    this.shopkeeperProductSelect.overriding = !this.shopkeeperProductSelect.overriding;
    this.shopkeeperProductSelect.outstanding = false;
  }

}
