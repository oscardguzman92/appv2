import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ApiService} from '../../../../../../services/api/api.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../recargas/store/currentAccount/currentAccount.reducer';
import {catchError, finalize, map, mergeMap} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {LoadingOff} from '../../../../../compartido/general/store/actions/loading.actions';
import {of} from 'rxjs';
import {Fail} from '../../../../../compartido/general/store/actions/error.actions';
import {
    AfterChangeProductAction,
    CHANGE_PRODUCT, ChangeProductAction,
    GET_EXCHANGE_PRODUCTS, GET_ONLY_POINTS,
    GET_POINTS, GET_RECORD_POINTS,
    GetExchangeProductsAction, GetOnlyPointsAction,
    GetPointsAction, GetRecordPointsAction,
    SetExchangeProductsAction, SetOnlyPointsAction, SetRecordPointsAction
} from './puntos.actions';
import {IExchangesProducts} from '../../../../../../interfaces/IExchangesProducts';
import {IPoints} from '../../../../../../interfaces/IPoints';
import {IMovimentsPoints} from '../../../../../../interfaces/IMovimentsPoints';

@Injectable({
    providedIn: 'root'
})
export class PuntosEffect {
    constructor(
        private actions$: Actions,
        private api: ApiService,
        private store: Store<AppState>) {
    }

    @Effect({dispatch: false})
    getPoints$ = this.actions$.pipe(
        ofType(GET_POINTS),
        mergeMap((action: GetPointsAction) => {
            const params = new HttpParams()
                .append('token', action.token)
                .append('tienda_id', action.tienda_id.toString());

            return this.api.get('getPuntos?' + action.tienda_id, params)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: { puntos: IPoints }) => res.puntos)
                ).pipe(
                    map((points: IPoints) => {
                        this.store.dispatch(new GetExchangeProductsAction(action.token, action.tienda_id, points));
                        return points;
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getOnlyPoints$ = this.actions$.pipe(
        ofType(GET_ONLY_POINTS),
        mergeMap((action: GetOnlyPointsAction) => {
            const params = new HttpParams()
                .append('token', action.token)
                .append('tienda_id', action.tienda_id.toString());

            return this.api.get('getPuntos?' + action.tienda_id, params)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: { puntos: IPoints }) => res.puntos)
                ).pipe(
                    map((points: IPoints) => {
                        if (!points) {
                            points = {
                                id: 0,
                                parent_id: 0,
                                tipo: '',
                                puntaje_total: 0,
                                created_at: 0,
                                update_at: 0
                            };
                        }
                        return new SetOnlyPointsAction(points);
                    })
                );
        })
    );

    @Effect()
    getProducts$ = this.actions$.pipe(
        ofType(GET_EXCHANGE_PRODUCTS),
        mergeMap((action: GetExchangeProductsAction) => {
            const params = new HttpParams()
                .append('token', action.token)
                .append('tienda_id', action.tienda_id.toString());

            return this.api.get('getProductosCanjes?' + action.tienda_id, params)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: { productos_canjes: IExchangesProducts[] }) => {
                        return new SetExchangeProductsAction(res.productos_canjes, action.points);
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
    changeProduct = this.actions$.pipe(
        ofType(CHANGE_PRODUCT),
        mergeMap((action: ChangeProductAction) => {
            const params = {
                tienda_id: action.tienda_id.toString(),
                cantidad: 1,
                producto_canje_id: action.producto_canje_id
            };

            return this.api.post('canjearPuntosProductos?token=' + action.token, params, true)
                .pipe(
                    map(res => {
                        if (res.status !== 'error') {
                            return res.content.mensaje;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        return new AfterChangeProductAction(res);
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getRecordPoints$ = this.actions$.pipe(
        ofType(GET_RECORD_POINTS),
        mergeMap((action: GetRecordPointsAction) => {
            const params = new HttpParams()
                .append('token', action.token)
                .append('tienda_id', action.tienda_id.toString())
                .append('page', action.page.toString())
                .append('record', '15')
                .append('paginate', 'true');
            let tipo = (action.tipo) ? "&tipo="+action.tipo: "";

            return this.api.get('getMovimientosPuntos?' + action.tienda_id + tipo, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: { content: IMovimentsPoints, paginate: {pages: number}}) => {
                        return new SetRecordPointsAction(res.content, res.paginate);
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );;
        })
    );
}
