import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { AlertController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/store/app.reducer';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { LoadingOn, LoadingOff } from 'src/app/modules/compartido/general/store/actions/loading.actions';
import { ActivatedRoute } from '@angular/router';
import { CashRegisterModel } from '../../../../../models/CashRegister';
import { IClient, ISale } from '../../../../../interfaces/ICashRegisterSale';
import { IUser } from '../../../../../interfaces/IUser';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { PhoneNumberValidator } from '../../../../../validators/PhoneNumberValidator';
import {
  CashRegisterSearchClientsState,
  CashRegisterSearchClientsCompleteState,
  CashRegisterSaleState,
  CashRegisterInSaleState,
  CashRegisterInSaleDataState
} from '../../store/cash-register.reducer';
import {
  CashRegisterSearchClientsAction,
  CashRegisterSearchClientsCompleteAction,
  CashRegisterSaleAction,
  CashRegisterInSaleAction,
  CashRegisterInSaleDataAction
} from '../../store/cash-register.actions';


@Component({
  selector: 'app-metodo-de-pago-caja-registradora',
  templateUrl: './metodo-de-pago-caja-registradora.page.html',
  styleUrls: ['./metodo-de-pago-caja-registradora.page.scss'],
})

export class MetodoDePagoCajaRegistradoraPage implements OnInit, OnDestroy {

  public total: number;
  public subtracting: number;
  public return: number;
  public name: string;
  public phone: string;
  public user: IUser;
  public title: string;
  public subtitle: string;
  public showTitle: boolean;
  public quantity: number;
  public showBackButton: boolean;
  public dataPay: FormGroup;
  public subscriptionSearchClientsComplete = new Subscription();

  public cashRegisterData: CashRegisterModel = {
    products: null,
    sale: null,
    client: null,
  };

  public saleSelect: ISale = {
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
    created_at: null
  };

  public cashRegisterDataClean: CashRegisterModel = {
    products: [],
    sale: {
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
    },
    client: null,
  };

  private clientSelect: IClient = {
    _id: null,
    name: null,
    phone: null
  };

  constructor(
    private navigation: NavigationHelper,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private storage: Storage,
    private alertController: AlertController,
    private store: Store<AppState>,
    private storeInSaleData: Store<CashRegisterInSaleDataState>,
    private storeInSale: Store<CashRegisterInSaleState>,
    private storeSale: Store<CashRegisterSaleState>,
    public formBuilder: FormBuilder,
    private storeSearchClients: Store<CashRegisterSearchClientsState>,
    private storeSearchClientsComplete: Store<CashRegisterSearchClientsCompleteState>,
  ) {
    this.configureForm();
  }

  ngOnInit() {
    this.configureInit();
    this.configureSaleData();
    this.configureSearchClientComplete();
  }

  configureForm() {

    this.dataPay = this.formBuilder.group({
      phone: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        PhoneNumberValidator('CO'),
        Validators.minLength(10)
      ])],
      name: ['', Validators.compose([
        Validators.maxLength(40),
        Validators.minLength(1),
        Validators.pattern('^[a-zA-Z ]*$'),
        Validators.required
      ])],
      subtracting: ['', Validators.compose([
        Validators.maxLength(3),
        Validators.minLength(1),
        Validators.pattern('^[0-9]*$'),
        Validators.required
      ])],
    });

  }

  configureInit() {
    this.showTitle = true;
    this.showBackButton = true;
    this.title = 'Finalizar venta';
    this.subtitle = 'Lleva el control de tu venta';
    this.user = this.route.snapshot.data['user'];
  }

  configureSaleData() {
    this.store.dispatch(new LoadingOn());
    this.storage.get('CashRegisterInSaleData').then(response => {
      this.cashRegisterData = response;
      this.total = response.sale.total;
      this.quantity = response.sale.quantity;
      this.store.dispatch(new LoadingOff());
    });

  }

  configureSearchClientComplete() {
    this.subscriptionSearchClientsComplete = this.storeSearchClientsComplete
      .select('CashRegisterSearchClientsComplete')
      .subscribe(response => {
        if (response.active) {
          if (response.clients[0] !== undefined) {
            this.name = response.clients[0].name;
          }
        }
      });
  }

  goToCashRegister() {
    this.navigation.goTo('caja-registradora');
  }

  searchClient(e) {
    const phone = e.target.value;
    if ( phone.length === 10) {
      this.storeSearchClients.dispatch(new LoadingOn());
      const SearchClients = new CashRegisterSearchClientsAction(true, this.user.token, 'phone', phone);
      this.storeSearchClients.dispatch(SearchClients);
    }

  }

  cash() {

    this.analyticsService.sendEvent('cr_finaliza_venta_prod_pago', {
      'event_category': 'cr_finaliza_venta_prod',
      'event_label': 'cr_finaliza_venta_prod_pago_efectivo'
    } );

    this.subtracting = null;
    this.saleSelect.cash = !this.saleSelect.cash;
    this.saleSelect.trustworthy = false;
    this.saleSelect.card = false;
  }

  card() {

    this.analyticsService.sendEvent('cr_finaliza_venta_prod_pago', {
      'event_category': 'cr_finaliza_venta_prod',
      'event_label': 'cr_finaliza_venta_prod_pago_tarjeta'
    } );

    this.subtracting = this.total;
    this.saleSelect.card = !this.saleSelect.card;
    this.saleSelect.trustworthy = false;
    this.saleSelect.cash = false;
  }

  trustworthy() {

    this.analyticsService.sendEvent('cr_finaliza_venta_prod_pago', {
      'event_category': 'cr_finaliza_venta_prod',
      'event_label': 'cr_finaliza_venta_prod_pago_fiado'
    } );

    this.subtracting = 0;
    this.saleSelect.trustworthy = !this.saleSelect.trustworthy;
    this.saleSelect.card = false;
    this.saleSelect.cash = false;
    this.dataPay.addControl('phone', new FormControl('', Validators.required));
    this.dataPay.addControl('name', new FormControl('', Validators.required));
  }

  cancel() {
    this.analyticsService.sendEvent('cr_finaliza_venta_prod_confirma', {
      'event_category': 'cr_finaliza_venta_prod',
      'event_label': 'cr_finaliza_venta_prod_volver'
    } );
    this.goToCashRegister();
  }

  valueReturn(e) {
    const subtracting = e.target.value;
    const returnVal = (this.total - Number(subtracting)) * -1;
    this.return = (returnVal > 49) ? returnVal : 0;
  }

  confirm() {

    if (!this.saleSelect.cash && !this.saleSelect.card && !this.saleSelect.trustworthy) {
      const message = 'Selecciona un metodo de pago';
      this.presentAlert(message);
    } else {

      let isValid = false;
      if (this.saleSelect.trustworthy) {
        this.saleSelect.paid_out = false;
        if (this.dataPay.controls.phone.status === 'INVALID') {
          const message = 'Ingresa un telefono válido';
          this.presentAlert(message);
        } else if (this.dataPay.controls.name.status === 'INVALID') {
          const message = 'Ingresa un nombre válido';
          this.presentAlert(message);
        } else {
          isValid = true;
        }

      } else if (this.saleSelect.cash) {


        if (this.subtracting === null ) {
          this.name = null;
          this.phone = null;
          this.subtracting = this.total;
          this.saleSelect.paid_out = true;
          isValid = true;
        } else if (this.subtracting < this.total) {
          this.saleSelect.trustworthy = true;
        } else if (this.subtracting > this.total) {
          this.name = null;
          this.phone = null;
          this.saleSelect.paid_out = true;
          isValid = true;
        }

      } else if (this.saleSelect.card) {

        this.name = null;
        this.phone = null;
        this.saleSelect.paid_out = true;
        isValid = true;

      }

      if (isValid) {

        this.analyticsService.sendEvent('cr_finaliza_venta_prod_confirma', {
          'event_category': 'cr_finaliza_venta_prod',
          'event_label': 'cr_finaliza_venta_prod_terminar'
        } );

        this.saleSelect.total = this.total;
        this.saleSelect.quantity = this.cashRegisterData.products.length;
        this.saleSelect.shopkeeper_id = this.user.user_id;

        this.clientSelect.name = this.name;
        this.clientSelect.phone = this.phone;

        this.cashRegisterData.client = this.clientSelect;
        this.cashRegisterData.sale = this.saleSelect;

        const Sale = new CashRegisterSaleAction(true, this.user.token, this.cashRegisterData);
        this.storeSale.dispatch(Sale);

        const InSaleData = new CashRegisterInSaleDataAction(true, this.cashRegisterDataClean);
        this.storeInSaleData.dispatch(InSaleData);

        const InSale = new CashRegisterInSaleAction(true, false);
        this.storeInSale.dispatch(InSale);

        this.goToSales();
      }

    }
  }

  goToSales() {
    this.navigation.goTo('ventas');
  }

  goToNameOrReference() {
    this.navigation.goTo('nombre-o-referencia');
  }

  goToNewSale() {
    this.navigation.goTo('nueva-venta');
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

  ngOnDestroy() {
    this.subscriptionSearchClientsComplete.unsubscribe();
  }

}
