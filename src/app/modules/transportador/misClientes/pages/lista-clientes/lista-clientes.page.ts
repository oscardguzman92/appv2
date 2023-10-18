import {Component, OnInit} from '@angular/core';
import {IUser} from 'src/app/interfaces/IUser';
import {ActivatedRoute} from '@angular/router';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {ModalController} from '@ionic/angular';
import {ModalNovedadesComponent} from '../../../compartido/components/modal-novedades/modal-novedades.component';
import {Transportador} from '../../../../../models/Transportador';
import {IRoute} from '../../../../../interfaces/IRoute';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {GetReasons, SET_REASON, SetReasons} from '../../../compartido/store/transporter.actions';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {IReason} from '../../../../../interfaces/IReason';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {TransporterService} from '../../../../../helpers/transporter/transporter.service';
import {
    GetMyCreditsEntityAction,
    SET_MY_CREDITS_ENTITY,
    SetMyCreditsEntityAction
} from '../../../../tendero/creditos/pages/store/credits.actions';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {AFTER_REFRESH_USER, AfterRefreshUserAction} from '../../../../../store/auth/auth.actions';
import {CacheService} from 'ionic-cache';
import {Storage} from '@ionic/storage';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';

@Component({
    selector: 'app-lista-clientes',
    templateUrl: './lista-clientes.page.html',
    styleUrls: ['./lista-clientes.page.scss'],
})
export class ListaClientesPage implements OnInit {
    public user: Transportador;
    public currentWeek: { day: any; nameDay: any; date: any }[];
    public daySel: any = {};
    public routeDay: IRoute;
    public routesAll:  IRoute[];
    public enableEdit:  boolean;
    public indexSelected: number;
    public limitShowRoute: number;
    public reasons: IReason[];
    public finishSubs = new Subscription();
    public routeSub = new Subscription();
    public reasonSub = new Subscription();
    public refreshObs = new Subscription();
    public entity = new Subscription();

    constructor(private route: ActivatedRoute,
                private navigation: NavigationHelper,
                private modalController: ModalController,
                private store: Store<AppState>,
                private actionsS: ActionsSubject,
                private utility: TransporterService,
                private cache: CacheService,
                private storage: Storage,
                private utilities: UtilitiesHelper) {
        this.user = this.route.snapshot.data['user'];
        this.enableEdit = false;
        this.store.dispatch(new GetReasons(this.user.token));
    }

    ionViewWillEnter() {
        this.limitShowRoute = 5;
        this.user = this.route.snapshot.data['user'];
        this.finishSubs = this.actionsS
            .pipe(filter(res => res.type === SET_REASON))
            .subscribe((res: SetReasons) => {
                this.reasons = res.data;
            });

        this.routeSub = this.utility.route
            .subscribe((res) => {
                if (!this.routeDay || this.routeDay.pedidos.length == 0) {
                    this.store.dispatch(new Fail({
                        mensaje: 'No hay ruta asignada para el día seleccionado',
                        withoutLoading: true
                    }));
                    return;
                }

                this.goRecorridoTransportador();
            });

        this.reasonSub = this.utility.reason
            .subscribe((res) => {
                if (!this.routeDay || this.routeDay.pedidos.length == 0) {
                    this.store.dispatch(new Fail({
                        mensaje: 'No hay ruta asignada para el día seleccionado',
                        withoutLoading: true
                    }));
                    return;
                }

                this.presentModalNovedades();
            });

        this.selectDay();
        if (this.user && this.user.rutas) {
            this.routesAll = this.user.rutas;
            this.filterClientsByDay();
        }

        this.refreshObs = this.actionsS
            .pipe(filter((res: AfterRefreshUserAction) => res.type === AFTER_REFRESH_USER))
            .subscribe(async (res) => {
                if (res.sessionInactive === true) {
                    this.cache.clearAll()
                        .then(() => {
                            return this.storage.clear();
                        })
                        .then(() => {
                            this.navigation.goTo('inicio');
                        });
                    return;
                }

                if (!res.user) {
                    return;
                }

                await this.storage.remove('user');
                this.storage.set('user', JSON.stringify(res.user))
                    .then(() => {
                        const user = res.user as Transportador;
                        this.user = user as Transportador;
                        this.user.rutas = user.rutas;

                        this.selectDay();
                        if (this.user && this.user.rutas) {
                            this.routesAll = this.user.rutas;
                            this.filterClientsByDay();
                        }

                        this.utilities.presentToast('Los datos fueron actualizados correctamente.');
                        this.store.dispatch(new LoadingOff());
                    })
                    .catch(err => {
                        this.store.dispatch(new LoadingOff());
                    });
            });
    }

    ionViewDidLeave() {
        this.routeSub.unsubscribe();
        this.finishSubs.unsubscribe();
        this.reasonSub.unsubscribe();
        this.entity.unsubscribe();
    }

    ngOnInit() {}

    goRecorridoTransportador() {
        this.navigation.goToBack('recorrido-transportador', {
            ruta: this.routeDay, selected: this.indexSelected, limitShowRoute: this.limitShowRoute
        });
    }

    goPedidos(ruta: IRoute, pedido: any, index: number) {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetMyCreditsEntityAction(
            this.user.token, pedido.pedido.tienda.cliente.id, pedido.pedido.distribuidor_id, pedido.pedido.tienda.cliente.user_id
        ));
        this.entity = this.actionsS
            .pipe(filter(res => res.type === SET_MY_CREDITS_ENTITY))
            .subscribe((res: SetMyCreditsEntityAction) => {
                this.navigation.goToBack('lista-pedidos', {
                    ruta: ruta, pedidoSeleccionado: pedido, index: index, credits: res.credits, saldo: res.saldo
                });
                this.store.dispatch(new LoadingOff());
            });
    }

    goLiquidador() {
        this.navigation.goToBack('liquidador');
    }

    getCurrentWeek() {
        // Obtener Domingo de la Semana actual
        const date = new Date();

        // Recorrer la semana
        const week = Array(7)
            .fill(date)
            .map((date, i) => {
                if (i !== 0) {
                    date.setDate(date.getDate() + 1);
                }
                const name = date.toLocaleDateString('es-ES', {
                    weekday: 'short'
                });
                return {
                    day: date.getDate(),
                    nameDay: name[0].toUpperCase(),
                    date: date.getTime()
                };
            });
        return week;
    }

    selectDay(date?) {
        this.daySel.date = date ? new Date(date) : new Date();
        const dateString = this.daySel.date.toLocaleDateString('es-ES', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        this.daySel.dateString =
            dateString.charAt(0).toUpperCase() + dateString.slice(1);
        this.daySel.day = this.daySel.date.getDate();
        this.daySel.dayOfWeek = this.daySel.date.getDay();
    }

    filterClientsByDay() {
        this.indexSelected = 0;
        this.routeDay = this.routesAll[0];
        let firstActive = false, key = 0;
        for (const pedido of this.routeDay.pedidos) {
            if (pedido.entregado) {
                this.limitShowRoute++;
                continue;
            }

            if (!firstActive) {
                pedido.firstActive = true;
                firstActive = true;
            }

            key++;

            if ((key + 1) >= this.limitShowRoute) {
                break;
            }
        }
    }

    editRoute() {
        this.enableEdit = true;
    }

    async editRoutemodal(index) {
        const modal = await this.modalController.create({
            component: ModalNovedadesComponent,
            cssClass: ['modal-info', 'modal-updates'],
            componentProps: {
                type: 'cambio-orden',
                wayPoints: this.routeDay.pedidos,
                selected: index,
                user: this.user,
                indexSelected: this.indexSelected
            }
        });

        modal.onDidDismiss()
            .then(response => {
                this.enableEdit = false;
            });

        return await modal.present();
    }

    async presentModalNovedades() {
        const modal = await this.modalController.create({
            component: ModalNovedadesComponent,
            cssClass: ['modal-info', 'modal-updates'],
            componentProps: {
                type: 'novedades',
                reasons: this.reasons,
                user: this.user
            }
        });

        return await modal.present();
    }

}
