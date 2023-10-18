import {Component, OnDestroy, OnInit} from '@angular/core';
import {Transportador} from '../../../../../models/Transportador';
import {ActivatedRoute} from '@angular/router';
import {CloseDay, FINISH_CLOSE_DAY, FinishCloseDay, GetLiq, SET_LIQ, SetLiq} from '../../../compartido/store/transporter.actions';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ILiq, TypesMethod} from '../../../../../interfaces/ILiq';
import {Storage} from '@ionic/storage';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';

@Component({
    selector: 'app-liquidador',
    templateUrl: './liquidador.page.html',
    styleUrls: ['./liquidador.page.scss'],
})
export class LiquidadorPage implements OnInit, OnDestroy {

    public user: Transportador;
    public LiqSub = new Subscription();
    public closeSub = new Subscription();
    public liq: ILiq;
    public methods: {
        cash: number,
        storeapp: number;
        credits: number;
    };

    public total: number;

    constructor(private route: ActivatedRoute, private store: Store<AppState>, private actionsS: ActionsSubject,
                private storage: Storage,
                private util: UtilitiesHelper,
                private navigation: NavigationHelper) {
        this.user = this.route.snapshot.data['user'];
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetLiq(this.user.token));

        this.methods = {
            cash: 0,
            storeapp: 0,
            credits: 0
        }
        this.total = 0;
    }

    ngOnInit() {
        this.LiqSub = this.actionsS
            .pipe(filter(res => res.type === SET_LIQ))
            .subscribe((res: SetLiq) => {
                this.liq = res.data;
                this.store.dispatch(new LoadingOff());

                for (const pedido of res.data.orders) {
                    if (!pedido.entregado) {
                        continue;
                    }

                    if (pedido.compra) {
                        for (const metodo of pedido.compra.metodos_pago) {
                            if (metodo.id_tipo_metodo === TypesMethod.cash) {
                                this.methods.cash += +metodo.monto;
                            }

                            if (metodo.id_tipo_metodo === TypesMethod.storeapp) {
                                this.methods.storeapp += +metodo.monto;
                            }

                            if (metodo.id_tipo_metodo === TypesMethod.credit) {
                                this.methods.credits += +metodo.monto;
                            }
                        }
                        this.total += pedido.valor_pedido;
                        continue;
                    }

                    this.total += pedido.valor_pedido;
                    this.methods.cash += pedido.valor_pedido;
                }
            });

        this.closeSub = this.actionsS
            .pipe(filter(res => res.type === FINISH_CLOSE_DAY))
            .subscribe(async (res: FinishCloseDay) => {
                this.user.rutas[0].close = true;
                await this.storage.set('user', JSON.stringify(this.user));
                this.store.dispatch(new LoadingOff());
                this.util.alertOrderOnlyWithoutCancel('La ruta fue cerrada correctamente', () => {
                    this.navigation.goTo(this.user.rootPage);
                });
            });
    }

    closeDay() {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new CloseDay(this.user.token, this.liq.valueOrdersDeliveredWithReturn));
    }

    ngOnDestroy(): void {
        this.closeSub.unsubscribe();
        this.LiqSub.unsubscribe();
    }
}
