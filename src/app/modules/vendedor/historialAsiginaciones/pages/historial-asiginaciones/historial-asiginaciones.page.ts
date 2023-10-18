import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../../../reporteVentas/pages/mis-ventas/store/mySales.reducer';
import {IUser} from '../../../../../interfaces/IUser';
import {ActivatedRoute} from '@angular/router';
import {GetAssignMovimentsAction} from '../../../compartido/store/assign/assign.actions';
import {LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {filter} from 'rxjs/operators';
import {ICurrentAccount} from '../../../../../interfaces/ICurrentAccount';
import {IMovimentAssign} from '../../../../../interfaces/IMovimentAssign';

@Component({
    selector: 'app-historial-asiginaciones',
    templateUrl: './historial-asiginaciones.page.html',
    styleUrls: ['./historial-asiginaciones.page.scss'],
})
export class HistorialAsiginacionesPage implements OnInit {
    public user: IUser;
    public account: ICurrentAccount;
    public ingresos: IMovimentAssign[];
    public egresos: IMovimentAssign[];

    segmento: string;

    constructor(private store: Store<AppState>, private route: ActivatedRoute) {
    }

    async ngOnInit() {
        this.user = this.route.snapshot.data['user'];
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetAssignMovimentsAction(this.user.token));

        this.store.select('assign')
            .pipe(filter((res: {accountAssign: ICurrentAccount}) => res.accountAssign !== null))
            .subscribe((res: {accountAssign: ICurrentAccount, moviments: IMovimentAssign[]}) => {
                this.account = res.accountAssign;
                this.segmentMoviments(res.moviments);
            });
    }

    cambiarSegmento(ev: any) {
        this.segmento = ev.detail.value;
    }

    private segmentMoviments(moviments: IMovimentAssign[]) {
        this.egresos = moviments.filter((moviment) => {
            return moviment.operacion === '-';
        });

        this.ingresos = moviments.filter((moviment) => {
            return moviment.operacion === '+';
        });
    }
}
