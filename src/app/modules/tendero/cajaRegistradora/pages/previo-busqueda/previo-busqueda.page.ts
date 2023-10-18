import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { IonSlides, Platform } from '@ionic/angular';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { IUser } from '../../../../../interfaces/IUser';
import { LoadingOn } from '../../../../compartido/general/store/actions/loading.actions';
import { CashRegisterModel } from '../../../../../models/CashRegister';
import { OptionsService } from '../../services/options.service';

import {
  CashRegisterInSaleState,
  CashRegisterInSaleDataState,
  CashRegisterSearchProductsState,
  CashRegisterSearchProductsCompleteState,
  CashRegisterTagsState
} from './../../store/cash-register.reducer';

import {
  CashRegisterInSaleDataAction,
  CashRegisterSearchProductsAction,
  CashRegisterTagsAction
} from './../../store/cash-register.actions';

@Component({
  selector: 'app-previo-busqueda',
  templateUrl: './previo-busqueda.page.html',
  styleUrls: ['./previo-busqueda.page.scss'],
})
export class PrevioBusquedaPage implements OnInit, OnDestroy {

  @ViewChild('SearchSlides') SearchSlide: IonSlides;
  public title: string;
  public subtitle: string;
  public showTitle: boolean;
  public showBackButton: boolean;
  public sync: boolean;
  public inSale: boolean;
  public total: number;
  public quantity: string;
  public products: any;
  public subscriptionInSale = new Subscription();
  public subscriptionInSaleData = new Subscription();
  public subscriptionSearchProductsComplete = new Subscription();
  public subscriptionTags = new Subscription();
  public user: IUser;
  public heightViewport: number;
  public widthViewport: number;
  public tags: any;

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

  public searchSlides = {
    slidesPerColumn: 2,
    speed: 500,
    slidesPerView: 4,
    spaceBetween: 8,
    slidesPerColumnFill: 'row',
    pagination: {
        el: '.swiper-pagination',
        type: 'custom',
        renderCustom: (swiper, current, total) => {
            return this.customProgressBar(current, total);
        }
    }
    /* pagination: {
         el: '.swiper-pagination',
         type: 'fraction',
     }*/
  };

  constructor(
    public optionService: OptionsService,
    public navigation: NavigationHelper,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private storeInSaleData: Store<CashRegisterInSaleDataState>,
    private storeInSale: Store<CashRegisterInSaleState>,
    private storeTags: Store<CashRegisterTagsState>,
    private storage: Storage,
    private platform: Platform,
    public barcodescanner: BarcodeScanner,
    private storeSearchProducts: Store<CashRegisterSearchProductsState>,
    private storeSearchProductsComplete: Store<CashRegisterSearchProductsCompleteState>,
  ) {
    this.configurePlatform();
  }

  ngOnInit() {
    this.configureInit();
    this.configureInSale();
    this.configureInSaleData();
    this.configureTags();
    this.overridingSearch();
    this.configureSearchProductsComplete();
  }

  private customProgressBar(current: number, total: number): string {
    const ratio: number = current / total;
    // tslint:disable-next-line: max-line-length
    const progressBarStyle: string = 'style=\'transform: translate3d(0px, 0px, 0px) scaleX(' + ratio + ') scaleY(1); transition-duration: 300ms;\'';
    const progressBar: string = '<span class=\'swiper-pagination-progressbar-fill\' ' + progressBarStyle + '></span>';

    let progressBarContainer = '<div class=\'swiper-pagination-progressbar\' style=\'height: 6px; top: 6px; width: 100%;\'>';
    progressBarContainer += progressBar;
    progressBarContainer += '</span></div>';

    return progressBarContainer;
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
    this.showBackButton = true;
    this.user = this.route.snapshot.data['user'];

  }

  configureTags() {
    this.storage.get('CashRegisterTags').then(response => {
      if (response === null) {
        const Tags = new CashRegisterTagsAction(true,  this.user.token,  this.user.user_id);
        this.storeTags.dispatch(Tags);
      } else {
        this.tags = response;
        this.optionService.setOptions( this.tags );

      }

      this.subscriptionTags = this.storeTags
        .select('CashRegisterTags')
        .subscribe(data => {
          if (data.active) {
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
          this.total = total;
          this.quantity = quantity;
        }
      }

      this.subscriptionInSaleData = this.storeInSaleData
        .select('CashRegisterInSaleData')
        .subscribe(data => {
          if (data.active) {
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

  autoAction(param) {

  }

  overridingSearch() {
    this.storeSearchProducts.dispatch(new LoadingOn());
    const SearchProducts = new CashRegisterSearchProductsAction(true, this.user.token, 'overriding', this.user.user_id.toString());
    this.storeSearchProducts.dispatch(SearchProducts);
  }

  configureSearchProductsComplete() {
    this.subscriptionSearchProductsComplete = this.storeSearchProductsComplete
        .select('CashRegisterSearchProductsComplete')
        .subscribe(response => {
            if (response.active) {
                if (response.products.length > 0) {
                    this.products = response.products;
                }
            }
        });
  }

  goToSearch() {
    this.analyticsService.sendEvent('cr_lista_categorias', {
      'event_category': 'cr_sec_registra_venta'
    } );
    this.navigation.goTo('buscar-caja-registradora');
  }

  goToNewProduct(params: any = null) {
    this.analyticsService.sendEvent('cr_registro_sin_cod', {
      'event_category': 'cr_sec_registra_venta'
    } );
    this.navigation.goTo('nuevo-producto', { 'ean': params });
  }

  scanNewProduct() {
    this.analyticsService.sendEvent('cr_escaner_producto', {
      'event_category': 'cr_sec_registra_venta'
    } );
    this.barcodescanner.scan().then(barcodeData => {
        this.goToNewProduct(barcodeData['text']);
    }).catch(err => {
    });
  }

  ngOnDestroy(): void {
    this.subscriptionInSale.unsubscribe();
    this.subscriptionInSaleData.unsubscribe();
    this.subscriptionSearchProductsComplete.unsubscribe();
    this.subscriptionTags.unsubscribe();
  }

  searchProducts(search: any) {
    this.analyticsService.sendEvent('cr_buscar_producto', {
      'event_category': 'cr_sec_registra_venta',
      'event_label': 'cr_producto' + search
    } );
    this.navigation.goTo('buscar-caja-registradora', { 'search': search });
  }

}
