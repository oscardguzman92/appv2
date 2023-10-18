import {Component, OnInit, ViewChild} from '@angular/core';
import {IUser} from '../../../../../interfaces/IUser';
import {ActivatedRoute} from '@angular/router';
import {RecargasSolicitarSaldosComponent} from '../components/recargas-solicitar-saldos/recargas-solicitar-saldos.component';
import {AppState} from '../../store/topUps/topUps.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {GetHistoryTopUps, SET_HISTORY_TOP_UPS, SetHistoryTopUps} from '../../store/topUps/topUps.actions';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ITransaction} from '../../../../../interfaces/ITransaction';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {GetMessagesAction} from '../../../../compartido/misMensajes/store/messages.actions';

@Component({
    selector: 'app-historial-recargas',
    templateUrl: './historial-recargas.page.html',
    styleUrls: ['./historial-recargas.page.scss'],
})
export class HistorialRecargasPage implements OnInit {
    @ViewChild(RecargasSolicitarSaldosComponent) balanceComponent: RecargasSolicitarSaldosComponent;

    egresos: ITransaction[];
    ingresos: ITransaction[];
    segmento: string;

    public user: IUser;
    private HistorySubs = new Subscription();
    private maxPaginate = 0;
    private nPagePaginate = 2;

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private actionsS: ActionsSubject) {
    }

    ngOnInit() {
        this.user = this.route.snapshot.data.user;
        this.store.dispatch(new GetHistoryTopUps(this.user.token, 1));

        this.HistorySubs = this.actionsS
            .pipe(filter(action => action.type === SET_HISTORY_TOP_UPS))
            .subscribe((res: SetHistoryTopUps) => {
                this.maxPaginate = res.paginate.pages;

                this.segmentMoviments(res.transactions);
                this.segmento = "egresos"
                this.store.dispatch(new LoadingOff());
            });
    }

    cambiarSegmento(ev: any) {
        this.segmento = ev.detail.value;
    }

    ionViewWillLeave() {
        this.balanceComponent.unsubscribe();
    }

    loadInfiniteScroll(event) {
        if (this.maxPaginate >= this.nPagePaginate) {
            this.store.dispatch(new LoadingOn());
            this.store.dispatch(new GetHistoryTopUps(this.user.token, this.nPagePaginate));
            this.nPagePaginate++;
            event.target.complete();
        } else {
            event.target.disabled = true;
        }
    }

    private segmentMoviments(transactions: ITransaction[]) {
        const egresos = transactions.filter((transaction) => {
            return transaction.operacion === '-';
        });

        const ingresos = transactions.filter((transaction) => {
            return transaction.operacion === '+';
        });

        if (this.egresos) {
            this.egresos = [...this.egresos, ...egresos];
        } else {
            this.egresos = egresos;
        }

        if (this.ingresos) {
            this.ingresos = [...this.ingresos, ...ingresos];
        } else {
            this.ingresos = ingresos;
        }
    }
}
