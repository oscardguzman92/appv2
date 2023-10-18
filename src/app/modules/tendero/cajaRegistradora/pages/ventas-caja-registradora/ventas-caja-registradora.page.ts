import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Events } from '@ionic/angular';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { IUser } from '../../../../../interfaces/IUser';
import { LoadingOn } from '../../../../compartido/general/store/actions/loading.actions';

import {
  CashRegisterSalesState,
  CashRegisterSalesCompleteState,
  CashRegisterFilterSalesState
} from './../../store/cash-register.reducer';

import {
  CashRegisterSalesAction
} from './../../store/cash-register.actions';

import { CashRegisterSalesModel } from '../../../../../models/CashRegister';

@Component({
  selector: 'app-ventas-caja-registradora',
  templateUrl: './ventas-caja-registradora.page.html',
  styleUrls: ['./ventas-caja-registradora.page.scss'],
})
export class VentasCajaRegistradoraPage implements OnInit, OnDestroy {

  public subscriptionSalesComplete = new Subscription();
  public subscriptionFilterSales = new Subscription();
  public user: IUser;
  public sales: CashRegisterSalesModel[];
  public title: string;
  public subtitle: string;
  public showTitle: boolean;
  public showBackHomeButton: boolean;
  public showModalFilter: boolean;
  public quantityTotalSales = 0;
  public quantitySales = 0;
  public quantityTotalTrustworthy = 0;
  public filterText = null;

  constructor(
    private storage: Storage,
    private route: ActivatedRoute,
    public navigation: NavigationHelper,
    private storeSalesComplete: Store<CashRegisterSalesCompleteState>,
    private storeFilterSales: Store<CashRegisterFilterSalesState>,
    private storeSales: Store<CashRegisterSalesState>,
    private events: Events
  ) { }

  ngOnInit() {
    this.initConfigure();
    this.configureSales();
    this.configureSalesComplete();
    this.configureFilterSales();
    this.configureEvents();
  }

  initConfigure() {
    this.title = 'Listado de ventas';
    this.subtitle = 'Envia un mesaje a los deudores';
    this.showTitle = true;
    this.showBackHomeButton = true;
    this.showModalFilter = true;
    this.user = this.route.snapshot.data['user'];
  }

  configureEvents() {
    this.events.subscribe('updateEvents', () => {
      this.configureSales();
    });
  }

  configureSalesComplete() {
    this.subscriptionSalesComplete = this.storeSalesComplete
      .select('CashRegisterSalesComplete')
      .subscribe(response => {
        if (response.active) {
          this.sales = response.CashRegisterSalesData;
          this.configureDataSales();
        }
      });
  }

  configureFilterSales() {
    this.subscriptionFilterSales = this.storeFilterSales
      .select('CashRegisterFilterSales')
      .subscribe(response => {
        if (response.active) {
          this.storage.get('CashRegisterSales').then(responseX => {
            this.sales = responseX;
            let valueFilter: any;
            switch (response.option) {
              case 'paid_out':
                valueFilter = response.filter;
                this.filterText = (valueFilter) ? 'Ventas pagadas' : 'Ventas sin pagar';
                break;
              case 'client':
                valueFilter = response.filter._id;
                this.filterText = 'Ventas echas a ' + response.filter.name;
                break;
            }
            this.quantityTotalSales = 0;
            this.quantitySales = 0;
            this.quantityTotalTrustworthy = 0;
            this.filterSalesCashRegister(valueFilter, response.option);
            this.configureDataSales();

          });
        }
      });
  }

  removeFilter() {
    this.quantityTotalSales = 0;
    this.quantitySales = 0;
    this.quantityTotalTrustworthy = 0;
    this.sales = [];
    this.storage.get('CashRegisterSales').then(responseX => {
      this.sales = responseX;
      this.configureDataSales();
      this.filterText = null;
    });
  }

  configureSales() {
    this.storeSales.dispatch(new LoadingOn());
    const SearchProducts = new CashRegisterSalesAction(true, this.user.token, this.user.user_id);
    this.storeSales.dispatch(SearchProducts);
  }

  goToNewSale() {
    this.navigation.goTo('nueva-venta');
  }

  ngOnDestroy() {
    this.subscriptionSalesComplete.unsubscribe();
    this.subscriptionFilterSales.unsubscribe();
  }

  goToCashRegister(params: any = null) {
    this.navigation.goTo('caja-registradora');
  }

  close() {
    this.goToCashRegister();
  }

  filterSalesCashRegister(term: any, type: any) {

    const sales = this.sales;
    const salesFind = sales.filter(sale => {
      switch (type) {
        case 'paid_out':
          if (sale.sale.paid_out === term) {
            return sale;
          }
          break;
        case 'client':
          if (sale.client._id === term) {
            return sale;
          }
          break;

      }
    });
    this.sales = salesFind;
  }

  configureDataSales() {
    this.sales.forEach((element, index) => {
      this.quantityTotalSales += element.sale.total;
      if (!element.sale.paid_out) {
        this.quantityTotalTrustworthy += element.sale.total;
      }
      this.quantitySales++;
    });
  }

}
