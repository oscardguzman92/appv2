import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { IonSlides, Platform } from '@ionic/angular';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { IUser } from '../../../../../interfaces/IUser';
import { LoadingOn } from '../../../../compartido/general/store/actions/loading.actions';
import { CashRegisterModel } from '../../../../../models/CashRegister';
import {
  CashRegisterInSaleState,
  CashRegisterInSaleDataState,
  CashRegisterKpiState,
  CashRegisterTreeState,
  CashRegisterProductsState
} from './../../store/cash-register.reducer';

import {
  CashRegisterInSaleAction,
  CashRegisterInSaleDataAction,
  CashRegisterKpiAction,
  CashRegisterTreeAction,
  CashRegisterProductsAction
} from './../../store/cash-register.actions';

@Component({
  selector: 'app-caja-registradora',
  templateUrl: './caja-registradora.page.html',
  styleUrls: ['./caja-registradora.page.scss'],
})

export class CajaRegistradoraPage implements OnInit, OnDestroy {

  @ViewChild('CashRegisterSlide') CashRegisterSlide: IonSlides;
  public title: string;
  public subtitle: string;
  public showTitle: boolean;
  public showMenuButton: boolean;
  public sync: boolean;
  public inSale: boolean;
  public total: number;
  public quantity: string;
  public products: any;
  public subscriptionInSale = new Subscription();
  public subscriptionInSaleData = new Subscription();
  public subscriptionKpi = new Subscription();
  public user: IUser;
  public heightViewport: number;
  public widthViewport: number;

  public kpi = {
    day : 0,
    month : 0,
    year : 0,
    trustworthy : 0
  };

  public cashRegisterSlides = {
    initialSlide: 0,
    speed: 400,
    slidesPerView: 1,
    direction: 'vertical'
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

  public cashRegisterData: CashRegisterModel = {
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

  constructor(
    public navigation: NavigationHelper,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private storeInSaleData: Store<CashRegisterInSaleDataState>,
    private storeKpi: Store<CashRegisterKpiState>,
    private storeInSale: Store<CashRegisterInSaleState>,
    private storeCashRegisterTree: Store<CashRegisterTreeState>,
    private storeCashRegisterProducts: Store<CashRegisterProductsState>,
    private storage: Storage,
    private platform: Platform
  ) {
    this.configurePlatform();
  }

  ngOnInit() {
    this.configureInit();
    this.configureKpi();
    this.configureThree();
    this.configureProducts();
    this.configureInSale();
    this.configureInSaleData();
  }

  configurePlatform() {
    this.platform.ready().then((readySource) => {
      this.heightViewport = this.platform.width();
      this.widthViewport = this.platform.height();
    });
  }

  configureInit() {
    this.title = 'Caja registradora';
    this.subtitle = 'Registra todas tus ventas';
    this.showTitle = true;
    this.showMenuButton = true;
    this.user = this.route.snapshot.data['user'];
  }

  configureKpi() {
    this.storage.get('CashRegisterKpi').then(response => {
      if (response === null) {
        const Kpi = new CashRegisterKpiAction(true, this.user.token, this.user.user_id);
        this.storeKpi.dispatch(Kpi);
      } else {
          this.kpi.day = response.day;
          this.kpi.month = response.month;
          this.kpi.year = response.year;
          this.kpi.trustworthy = response.trustworthy;
      }

      this.subscriptionKpi = this.storeKpi
        .select('CashRegisterKpi')
        .subscribe(data => {
          if (data.active) {
            this.kpi.day =  data.CashRegisterKpi.day;
            this.kpi.month =  data.CashRegisterKpi.month;
            this.kpi.year =  data.CashRegisterKpi.year;
            this.kpi.trustworthy =  data.CashRegisterKpi.trustworthy;
          }
        });

    });
  }

  configureInSaleData() {
    this.storage.get('CashRegisterInSaleData').then(response => {
      if (response === null) {
        const InSaleData = new CashRegisterInSaleDataAction(true, this.cashRegisterData);
        this.storeInSaleData.dispatch(InSaleData);
      } else {
        const total = (response === null) ? 0 : response.sale.total;
        const quantity = (response === null) ? 0 : response.sale.quantity;
        if (total !== 0) {
          console.log('yyy');

          this.total = total;
          this.quantity = quantity;
          this.products = response.products;
        }
      }

      this.subscriptionInSaleData = this.storeInSaleData
        .select('CashRegisterInSaleData')
        .subscribe(data => {
          if (data.active) {
            console.log('xxxxx');
            this.total = data.CashRegisterData.sale.total;
            this.quantity = data.CashRegisterData.sale.quantity;
          }
        });

    });
  }

  configureInSale() {
    this.inSale = false;
    this.subscriptionInSale = this.storeInSale
      .select('CashRegisterInSale')
      .subscribe(response => {
        if (response.active) {
          this.inSale = response.inSale;
          if (this.inSale) {
            this.title = 'Resumen';
            this.subtitle = 'de la venta';
          } else {
            this.title = 'Caja registradora';
            this.subtitle = 'Registra todas tus ventas';
          }
        }
      });

    this.storage.get('CashRegisterInSale').then(response => {
      if (response !== null) {
        this.inSale = response;
        if (this.inSale) {
          this.title = 'Resumen';
          this.subtitle = 'de la venta';
        } else {
          this.title = 'Caja registradora';
          this.subtitle = 'Registra todas tus ventas';
        }
      }
    });
  }

  goToOptions() {
    this.CashRegisterSlide.slideNext();
  }

  goToNewSale() {
    this.CashRegisterSlide.slidePrev();
  }

  cancel() {

    this.analyticsService.sendEvent('cr_resumen_venta_prod_confirma', {
      'event_category': 'cr_resumen_venta_prod',
      'event_label': 'cr_resumen_venta_prod_cancelar'
    } );

    this.inSale = false;
    const InSaleData = new CashRegisterInSaleDataAction(true, this.cashRegisterDataClean);
    this.storeInSaleData.dispatch(InSaleData);

    const InSale = new CashRegisterInSaleAction(true, false);
    this.storeInSale.dispatch(InSale);
  }

  confirm() {

    this.analyticsService.sendEvent('cr_resumen_venta_prod_confirma', {
      'event_category': 'cr_resumen_venta_prod',
      'event_label': 'cr_resumen_venta_prod_terminar'
    } );

    this.goToPay();
  }

  goToSearch() {
    if (this.inSale) {
      this.analyticsService.sendEvent('cr_resumen_venta_prod_agregar', {
        'event_category': 'cr_resumen_venta_prod'
      } );
    } else {
      this.analyticsService.sendEvent('cr_sec_registra_venta', {
        'event_category': 'cr_sec_menu_principal'
      } );
    }

    this.navigation.goTo('previo-busqueda');
  }

  goToCatalogue() {
    this.analyticsService.sendEvent('cr_sec_mis_productos', {
      'event_category': 'cr_sec_menu_principal'
    } );
    this.navigation.goTo('catalogo');
  }

  goToSales() {
    this.analyticsService.sendEvent('cr_sec_mis_ventas', {
      'event_category': 'cr_sec_menu_principal'
    } );
    this.navigation.goTo('ventas');
  }

  goToPay() {
    this.navigation.goTo('metodo-de-pago');
  }

  close() {
    this.navigation.goTo('inicio-tendero');
  }

  configureProducts() {
    const CashRegisterProducts = new CashRegisterProductsAction(true, this.user.token, this.user.user_id);
    this.storeCashRegisterProducts.dispatch(CashRegisterProducts);
    this.storeCashRegisterProducts.dispatch(new LoadingOn());
  }

  configureThree() {
    this.storage.get('CashRegisterTree').then(response => {
      if (response === null) {
        const CashRegisterTree = new CashRegisterTreeAction(true, this.user.token);
        this.storeCashRegisterTree.dispatch(CashRegisterTree);
        this.storeCashRegisterTree.dispatch(new LoadingOn());
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptionInSale.unsubscribe();
    this.subscriptionInSaleData.unsubscribe();
    this.subscriptionKpi.unsubscribe();
  }
}
