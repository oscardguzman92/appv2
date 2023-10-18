import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ApiService} from '../../../../../services/api/api.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../tendero/recargas/store/currentAccount/currentAccount.reducer';
import {catchError, finalize, map, mergeMap} from 'rxjs/operators';
import {LoadingOff} from '../../../../compartido/general/store/actions/loading.actions';
import {
    ASSIGN_BALANCE,
    AssignBalanceAction,
    GET_ACCOUNT_ASSIGN,
    GET_ASSIGN_MOVIMENTS,
    GetAccountAssignAction, GetAssignMovimentsAction,
    SetAccountAssignAction
} from './assign.actions';
import {ICurrentAccount} from '../../../../../interfaces/ICurrentAccount';
import {of} from 'rxjs';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {HttpParams} from '@angular/common/http';
import {IMovimentAssign} from '../../../../../interfaces/IMovimentAssign';
import {Success} from '../../../../compartido/general/store/actions/sucess.actions';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';

@Injectable({
    providedIn: 'root'
})
export class AssignEffect {
    constructor(
                private navigation: NavigationHelper,
                private actions$: Actions,
                private api: ApiService,
                private store: Store<AppState>) {
    }

    @Effect()
    getAccountAssign$ = this.actions$.pipe(
        ofType(GET_ACCOUNT_ASSIGN),
        mergeMap((action: GetAccountAssignAction) => {
            const params = {};
            return this.api.post(`getCuentaCorrienteAsignaciones?token=${action.token}`, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error' && res.code === 0) {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: { cuenta: ICurrentAccount }) => {
                        return new SetAccountAssignAction(res.cuenta, action.assignMoviments);
                    })
                ).pipe(
                    catchError((error) => {
                        this.justBack();
                        return of(new Fail(error));
                    })
                ).pipe(
                    finalize(() => {
                        this.store.dispatch(new LoadingOff());
                    })
                );
        })
    );

    @Effect()
    getAssignMoviments$ = this.actions$.pipe(
        ofType(GET_ASSIGN_MOVIMENTS),
        mergeMap((action: GetAssignMovimentsAction) => {
            const params = new HttpParams().append('token', action.token);
            return this.api.get('getMovimientosAsignaciones', params)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: {transacciones: IMovimentAssign[]}) => {
                        return (new GetAccountAssignAction(action.token, res.transacciones));
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    assignBalance$ = this.actions$.pipe(
        ofType(ASSIGN_BALANCE),
        mergeMap((action: AssignBalanceAction) => {
            return this.api.post(`asignarSaldoCliente?token=${action.token}`, {
                monto: action.value,
                tienda_id: action.tienda_id.toString()
            }, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res) => {
                        this.store.dispatch(new Success({message: res.mensaje}));
                        this.store.dispatch((new GetAccountAssignAction(action.token, null)));
                        return res;
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        this.store.dispatch(new Fail(error));
                        return of(new Fail(error));
                    })
                );
        })
    );

    justBack() {
		this.navigation.justBack();
    }
}
