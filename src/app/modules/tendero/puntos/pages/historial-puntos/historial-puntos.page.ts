import {Component, OnInit} from '@angular/core';
import {IUser} from '../../../../../interfaces/IUser';
import {ITransaction} from '../../../../../interfaces/ITransaction';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../recargas/store/topUps/topUps.reducer';
import {GetRecordPointsAction, SET_RECORD_POINTS, SetRecordPointsAction} from '../puntos/store/puntos.actions';
import {filter} from 'rxjs/operators';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {MovimentPoints} from '../../../../../interfaces/IMovimentsPoints';
import { Shop } from 'src/app/models/Shop';
import {GetHistoryTopUps} from '../../../recargas/store/topUps/topUps.actions';

@Component({
    selector: 'app-historial-puntos',
    templateUrl: './historial-puntos.page.html',
    styleUrls: ['./historial-puntos.page.scss'],
})
export class HistorialPuntosPage implements OnInit {
    egresos: MovimentPoints[];
    ingresos: MovimentPoints[];
    segmento: string = "ingresos";
    
    private shop: Shop;
    private shopId: number;
    public user: IUser;
    private HistorySubs = new Subscription();
    private tipo: any;
    private maxPaginate = 0;
    private nPagePaginate = 2;

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private actionsS: ActionsSubject,
        private router: Router) {
        if (this.router.getCurrentNavigation().extras.state.data.shop) {
            this.shop = <Shop>this.router.getCurrentNavigation().extras.state.data.shop;
            this.shopId = this.shop.id;
        } else if(this.router.getCurrentNavigation().extras.state.data.shopId){
            this.shopId = this.router.getCurrentNavigation().extras.state.data.shopId;
        }
        if (this.router.getCurrentNavigation().extras.state.data.tipo) {
            this.tipo = this.router.getCurrentNavigation().extras.state.data.tipo;
        }
    }

    ngOnInit() {
        this.user = this.route.snapshot.data.user;
        this.store.dispatch(new GetRecordPointsAction(this.user.token, this.shopId, 1, this.tipo));

        this.HistorySubs = this.actionsS
            .pipe(filter(action => action.type === SET_RECORD_POINTS))
            .subscribe((res: SetRecordPointsAction) => {
                this.maxPaginate = res.paginate.pages;
                this.segmentMoviments(res.points.movimientos);
                this.store.dispatch(new LoadingOff());
            });
    }

    cambiarSegmento(ev: any) {
        this.segmento = ev.detail.value;
    }

    ionViewWillLeave() {
        this.HistorySubs.unsubscribe();
    }

    loadInfiniteScroll(event) {
        if (this.maxPaginate >= this.nPagePaginate) {
            this.store.dispatch(new LoadingOn());
            this.store.dispatch(new GetRecordPointsAction(this.user.token, this.shopId, this.nPagePaginate, this.tipo));
            this.nPagePaginate++;
            event.target.complete();
        } else {
            event.target.disabled = true;
        }
    }

    private segmentMoviments(transactions: MovimentPoints[]) {
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
