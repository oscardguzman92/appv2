import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {IonSlides, ModalController} from '@ionic/angular';
import {AppState} from '../../store/reducers/offers.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {
    GetAdditionalButtonAction,
    SET_BUTTONS_FEATURED,
    SetAdditionalButtonAction
} from '../../store/actions/offers.actions';
import {filter, map} from 'rxjs/operators';
import {IProduct} from '../../../../../interfaces/IProduct';
import {Storage} from '@ionic/storage';
import {ICompany} from '../../../../../interfaces/ICompany';
import {Seller} from '../../../../../models/Seller';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Subscription} from 'rxjs';
import {RedirectService} from '../../../../../services/redirect/redirect.service';
import { AnalyticsService } from '../../../../../services/analytics/analytics.service';
import { IBotonAdicional } from '../../../../../interfaces/IBotonAdicional';


@Component({
  selector: 'app-general-boton-adicional',
  templateUrl: './general-boton-adicional.component.html',
  styleUrls: ['./general-boton-adicional.component.scss'],
})
export class GeneralBotonAdicionalComponent implements OnInit, OnDestroy {
  @ViewChild('slides') slides: IonSlides;
  @Input() user: Seller | Shopkeeper;
  @Input() offers?: IBotonAdicional[];

  private productsFeaturedSubs = new Subscription();
  private companiesSubs = new Subscription();

  public slideOpts = {
      effect: 'flip',
      slidesPerView: 'auto',
      spaceBetween: 5,
      zoom: false,
      speed: 800,
      autoplay: {
          delay: 8000
          },
      loop: true,
  };

  public statusInputCountProd = false;
  private isOfflineActive: boolean;
  public offlineSubs = new Subscription();
  public countProdTemp = 0;
  public role: string = '';
  public productsBinding: any = {};
  public res: any;
  private actionsCountProductsOrder = new Subscription();

  constructor(
      private store: Store<AppState>,
      private storage: Storage,
      private navigation: NavigationHelper,
      private actionS: ActionsSubject,
      private redirect: RedirectService,
      private analyticsService: AnalyticsService
  ) {
    this.redirect.setTypeObject('boton_adicional');
  }

  ngOnInit() {
    this.additionalButtons();
  }

  ionViewWillEnter() {
    this.additionalButtons();
  }

  additionalButtons() {
    this.storage.get('user').then(usu => {
        usu = JSON.parse(usu);
        this.role = usu.role;
    });

    if (!this.offers) {
        this.store.dispatch(new GetAdditionalButtonAction(this.user.token, this.user.tiendas[0].id));
        this.productsFeaturedSubs = this.actionS
            .pipe(filter(action => action.type === SET_BUTTONS_FEATURED))
            .subscribe((res: SetAdditionalButtonAction) => {
                this.offers = res.buttonsFatured;
            }, err => {
            }, () => {
          });
    }
  }

  ngOnDestroy(): void {
      this.productsFeaturedSubs.unsubscribe();
      this.offers = null;
  }


  openFeaturedProducts() {
      // tslint:disable-next-line: max-line-length

  }

  onBlur() {
      this.statusInputCountProd = false;
  }

  onFocus() {
      this.statusInputCountProd = true;
  }

  goToRedirect(destacadoSelected: any): any {
    console.log({destacadoSelected});
      if (destacadoSelected.tipo === 'banner' || destacadoSelected.tipo === 'boton') {
          const destacado = <IBotonAdicional> destacadoSelected;

          if (destacado.datos) {
              const redireccion = JSON.parse(destacado.datos);
              this.redirect.redirect(redireccion, this.user, destacado);
          }
          return true;
      }


  }

}
