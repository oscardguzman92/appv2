import {Component, OnInit} from '@angular/core';
import {Transportador} from '../../../../../models/Transportador';
import {ActivatedRoute} from '@angular/router';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {
    GetReasonsHistory,
    SET_REASON,
    SET_REASONS_HISTORY,
    SetReasons,
    SetReasonsHistory
} from '../../../compartido/store/transporter.actions';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {IReasonHistory} from '../../../../../interfaces/IReasonHistory';

@Component({
    selector: 'app-historial-novedades',
    templateUrl: './historial-novedades.page.html',
    styleUrls: ['./historial-novedades.page.scss'],
})
export class HistorialNovedadesPage implements OnInit {
    public user: Transportador;
    public finishSubs = new Subscription();
    public history: IReasonHistory[] = [];

    constructor(private route: ActivatedRoute, private store: Store<AppState>, private actionsS: ActionsSubject) {
        this.user = this.route.snapshot.data['user'];
        this.store.dispatch(new GetReasonsHistory(this.user.token));
    }

    ngOnInit() {
        this.finishSubs = this.actionsS
            .pipe(filter(res => res.type === SET_REASONS_HISTORY))
            .subscribe((res: SetReasonsHistory) => {
                this.history = res.data;
            });
    }

}
