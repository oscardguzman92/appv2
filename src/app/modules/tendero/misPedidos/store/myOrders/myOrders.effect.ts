import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';
import {of, throwError} from 'rxjs';
import {GET_MY_ORDERS, GetMyOrdersAction, SetMyOrdersAction} from './myOrders.actions';
import {OrdersService} from '../../../../../services/orders/orders.service';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {AppState} from './myOrders.reducer';
import {Store} from '@ngrx/store';
import {LoadingOff} from '../../../../compartido/general/store/actions/loading.actions';

@Injectable({
    providedIn: 'root'
})
export class MyOrdersEffect {

    constructor(
        private actions$: Actions,
        private ordersService: OrdersService,
        private store: Store<AppState>
    ) {}

    @Effect()
    loadOrders$ = this.actions$.pipe(
        ofType(GET_MY_ORDERS),
        mergeMap((action: GetMyOrdersAction) => {
            return this.ordersService.myOrders(action.token, action.shop, action.page, action.validar_productos)
                .pipe(
                    map( (res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: {content: any, paginate: {pages: number}}) => new SetMyOrdersAction(res.content, res.paginate))
                ).pipe(
                    catchError( (error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );
}
