import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AlertController, IonSlides} from '@ionic/angular';
import {IExchangesProducts} from '../../../../../../../interfaces/IExchangesProducts';
import {AppState} from '../../store/puntos.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {LoadingOff, LoadingOn} from '../../../../../../compartido/general/store/actions/loading.actions';
import {IUser} from '../../../../../../../interfaces/IUser';
import {AFTER_CHANGE_PRODUCT, AfterChangeProductAction, ChangeProductAction, GetPointsAction} from '../../store/puntos.actions';
import {Shop} from '../../../../../../../models/Shop';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {CacheService} from 'ionic-cache';
import {Fail} from '../../../../../../compartido/general/store/actions/error.actions';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
    selector: 'app-puntos-productos-aredimir',
    templateUrl: './puntos-productos-aredimir.component.html',
    styleUrls: ['./puntos-productos-aredimir.component.scss'],
})
export class PuntosProductosARedimirComponent implements OnInit, OnDestroy {
    @ViewChild('slides') slides: IonSlides;
    @Input() products: IExchangesProducts[];
    @Input() points: number;
    @Input() user: IUser;
    @Input() shop: Shop;

    private subsChangeProduct = new Subscription();

    public slideOpts = {
        effect: 'flip',
        slidesPerView: 'auto',
        spaceBetween: 5,
        zoom: false
    };

    constructor(
        private alert: AlertController,
        private store: Store<AppState>,
        private actionS: ActionsSubject,
        private cache: CacheService,
        private analyticsService: AnalyticsService
        ) {
    }

    ngOnInit() {
        this.subsChangeProduct = this.actionS
            .pipe(filter((action: AfterChangeProductAction) => action.type === AFTER_CHANGE_PRODUCT))
            .subscribe(res => {
                this.cache.clearGroup('getPuntos?' + this.shop.id)
                    .then(() => {
                        this.presentAlertChangeProduct(res.message);
                        this.store.dispatch(new GetPointsAction(this.user.token, this.shop.id));
                    });
            });
    }

    ngOnDestroy(): void {
        this.subsChangeProduct.unsubscribe();
    }

    changePoints(product: IExchangesProducts) {
        if (product.puntaje_requerido > this.points) {
            const error = {
                mensaje: 'Te hacen falta ' + (product.puntaje_requerido - this.points) + ' puntos para redimir este premio',
                withoutLoading: true
            };
            this.store.dispatch(new Fail(error));
            return;
        }
        this.presentAlert(product.puntaje_requerido, product.nombre, product.producto_canje_id, this.shop.id);
    }

    async presentAlert(points: number, nameProduct: string, idProduct: number, idShop: number) {
        const alert = await this.alert.create({
            header: `¡Atención!`,
            message: `Estás seguro que deseas canjear el producto ${nameProduct} por ${points} puntos`,
            cssClass: 'attention-alert',
            buttons: [
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.analyticsService.sendEvent("click", { 'event_category': 'menu_principal', 'event_label': 'redime_$' + idProduct });                        
                        this.store.dispatch(new LoadingOn());
                        this.store.dispatch(new ChangeProductAction(this.user.token, idProduct, idShop));
                    }
                }, {
                    text: 'Cancelar',
                    role: 'cancel',
                }
            ]
        });

        await alert.present();
    }

    async presentAlertChangeProduct(message: string) {
        const alert = await this.alert.create({
            header: `¡Atención!`,
            message: message,
            cssClass: 'attention-alert',
            buttons: [{text: 'Aceptar'}]
        });

        await alert.present();
    }
}
