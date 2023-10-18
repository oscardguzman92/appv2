import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {AppState} from './store/puntos.reducer';
import {Store} from '@ngrx/store';
import {LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {ActivatedRoute, Router} from '@angular/router';
import {IUser} from '../../../../../interfaces/IUser';
import {GetPointsAction} from './store/puntos.actions';
import {Shop} from '../../../../../models/Shop';
import {Subscription} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {IExchangesProducts} from '../../../../../interfaces/IExchangesProducts';
import {IPoints} from '../../../../../interfaces/IPoints';
import { AlertController } from '@ionic/angular';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
    selector: 'app-puntos',
    templateUrl: './puntos.page.html',
    styleUrls: ['./puntos.page.scss'],
})
export class PuntosPage implements OnInit, OnDestroy {
    private shop: Shop;
    private pointsSubs = new Subscription();

    public exchangeProducts: IExchangesProducts;
    public user: IUser;
    public points: IPoints;

    constructor(private navigation: NavigationHelper,
                private store: Store<AppState>,
                private route: ActivatedRoute,
                private router: Router,
                private alertController: AlertController, 
                private analyticsService: AnalyticsService) {
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.shop = <Shop>this.router.getCurrentNavigation().extras.state.data.shop;
                if (!this.shop) {
                    this.navigation.goTo('inicio-tendero');
                }

                this.alertPoints();
            }
        });
    }

    ngOnInit() {
        this.analyticsService.sendEvent("click", { 'event_category': 'menu_principal', 'event_label': 'ingresa_puntos' });
        this.user = this.route.snapshot.data['user'];
        this.store.dispatch(new GetPointsAction(this.user.token, this.shop.id));

        this.initObservables();
    }

    justBack() {
        this.navigation.justBack();
    }

    ngOnDestroy(): void {
        this.pointsSubs.unsubscribe();
    }

    private initObservables() {
        this.pointsSubs = this.store.select('points')
            .pipe(filter(res => res.exchangeProducts !== null))
            .pipe(map((res: { exchangeProducts: IExchangesProducts, points: IPoints }) => res))
            .subscribe((res: { exchangeProducts: IExchangesProducts, points: IPoints }) => {
                this.exchangeProducts = res.exchangeProducts;
                if (!res.points) {
                    this.points = {
                        puntaje_total: 0,
                        created_at: null,
                        id: null,
                        parent_id: null,
                        update_at: null,
                        tipo: null
                    };
                    return;
                }
                this.points = res.points;
            });
    }

    private async alertPoints() {
        const alert = await this.alertController.create({
            //header: 'Ganar es muy fácil',
            // message: '¡Acumula puntos por cada pedido que realices! <br><br>Tendrás la oportunidad de ganar muchos más puntos aprovechando las dinámicas de tus proveedores. <br><br>¡Revisa siempre las comunicaciones y aprovecha las actividades que te dan puntos y promociones!',
            header: '¡Con storeapp Ganas!',
            message: 'Pide y Podrás Redimir Fabulosos Premios',
            buttons: ['Aceptar'],
            cssClass: 'info-alert',
          });
        return await alert.present();
    }

    recordPoints() {
        this.navigation.goToBack('historial-puntos', {shop: this.shop} );
    }
}
