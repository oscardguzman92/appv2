import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ApiService} from '../../../../../../services/api/api.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../tendero/recargas/store/currentAccount/currentAccount.reducer';
import {
    GET_MY_SALES,
    GET_ORDER_BY_SHOP_ID,
    GetMySalesAction,
    GetOrderByShopIdAction,
    SetMySalesAction,
    SetOrderByShopIdAction
} from './mySales.actions';
import {catchError, finalize, map, mergeMap} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {of} from 'rxjs';
import {Fail} from '../../../../../compartido/general/store/actions/error.actions';
import {IMySales} from '../../../../../../interfaces/IMySales';
import {LoadingOff} from '../../../../../compartido/general/store/actions/loading.actions';
import {Order} from '../../../../../../models/Order';

@Injectable({
    providedIn: 'root'
})
export class MySalesEffect {
    constructor(
        private actions$: Actions,
        private api: ApiService,
        private store: Store<AppState>) {
    }

    @Effect()
    getMySales$ = this.actions$.pipe(
        ofType(GET_MY_SALES),
        mergeMap((action: GetMySalesAction) => {
            const params = new HttpParams()
                .append('token', action.token)
                .append('data', action.fecha);

            return this.api.get('getResumenPedidosVendedor', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content.resumen;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: IMySales) => {
                        return new SetMySalesAction(res);
                    })
                ).pipe(
                    finalize(() => {
                        this.store.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getOrderByShopId$ = this.actions$.pipe(
        ofType(GET_ORDER_BY_SHOP_ID),
        mergeMap((action: GetOrderByShopIdAction) => {
            const params = new HttpParams()
                .append('token', action.token)
                .append('pedido_id', action.pedido_id.toString());

            return this.api.get('getPedido', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: Order) => {
                        console.log(res);
                        return new SetOrderByShopIdAction(res);
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );
}
