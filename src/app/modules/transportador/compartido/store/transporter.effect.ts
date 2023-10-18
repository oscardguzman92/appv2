import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {ApiService} from 'src/app/services/api/api.service';
import {of} from 'rxjs';
import {Fail} from '../../../compartido/general/store/actions/error.actions';
import {LoadingOff} from '../../../compartido/general/store/actions/loading.actions';
import {AppState} from '../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {
    CLOSE_DAY, CloseDay, FinishCloseDay,
    FinishSetOrderAction, FinishSetOrderPurchaseTransporter, FinishSetReasonTransporterAction, GET_LIQ,
    GET_REASON, GET_REASONS_HISTORY, GetLiq,
    GetReasons, GetReasonsHistory,
    SET_ORDER, SET_ORDER_TRANSPORTER, SET_REASON_TRANSPORTER, SetLiq,
    SetOrderAction, SetOrderPurchaseTransporter,
    SetReasons, SetReasonsHistory,
    SetReasonTransporterAction
} from './transporter.actions';
import {IReason} from '../../../../interfaces/IReason';
import {IReasonHistory} from '../../../../interfaces/IReasonHistory';
import {ILiq} from '../../../../interfaces/ILiq';
import {IRoute} from '../../../../interfaces/IRoute';
import {HttpParams} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class TransporterEffect {

    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>) {
    }

    @Effect()
    setOrders$ = this.actions$.pipe(
        ofType(SET_ORDER),
        mergeMap((action: SetOrderAction) => {
           let params = '?token=' + action.token;
           params += '&id_pedido_x_ruta=' + action.data.id_pedido_x_ruta;
           params += '&orden=' + action.data.orden;
           params += '&ruta_id=' + action.data.ruta_id;

            return this.apiService.post('editarOrdenRutaTransportador' + params, {}, true)
                .pipe(
                    map((res) => {
                        if (res.code !== 1 && res.code !== 2) {
                            return res;
                        }
                        throw(res);
                    })
                )
                .pipe(map(res => {
                    return new FinishSetOrderAction(res);
                }))
                .pipe(
                    catchError((error) => {
                        setTimeout( () => {
                            this.store.dispatch(new LoadingOff());
                        }, 2000);
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getReason$ = this.actions$.pipe(
        ofType(GET_REASON),
        mergeMap((action: GetReasons) => {
            const params = '?token=' + action.token;

            return this.apiService.get('getTiposMotivosTransportador' + params, null, true)
                .pipe(
                    map((res: any) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                )
                .pipe(map((res: {content: IReason[]}) => {
                    return new SetReasons(res.content);
                }))
                .pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    setReason$ = this.actions$.pipe(
        ofType(SET_REASON_TRANSPORTER),
        mergeMap((action: SetReasonTransporterAction) => {
            let params = '?token=' + action.token;
            params += '&motivo_id=' + action.data.motivo_id;
            if (action.data.latitud) {
                params += '&latitud=' + action.data.latitud;
            }

            if (action.data.longitud) {
                params += '&longitud=' + action.data.longitud;
            }

            if (action.data.observacion) {
                params += '&observacion=' + action.data.observacion;
            }

            return this.apiService.post('setMotivosTransportador' + params, {}, true)
                .pipe(
                    map((res: any) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                )
                .pipe(map((res: {content: IReason}) => {
                    return new FinishSetReasonTransporterAction(res.content);
                }))
                .pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getReasonHistory$ = this.actions$.pipe(
        ofType(GET_REASONS_HISTORY),
        mergeMap((action: GetReasonsHistory) => {
            const params = '?token=' + action.token;

            return this.apiService.get('getMotivosTransportador' + params, null, true)
                .pipe(
                    map((res: any) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                )
                .pipe(map((res: {content: IReasonHistory[]}) => {
                    return new SetReasonsHistory(res.content);
                }))
                .pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    setOrder$ = this.actions$.pipe(
        ofType(SET_ORDER_TRANSPORTER),
        mergeMap((action: SetOrderPurchaseTransporter) => {
            const url = this.apiService.getEndpoint() + 'setPurchaseTransporter?token=' + action.token;
            return this.apiService.post2(url, action.params, true)
                .pipe(
                    map((res: any) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                )
                .pipe(map((res: {content: IRoute[]}) => {
                    return new FinishSetOrderPurchaseTransporter(res.content);
                }))
                .pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getLiq$ = this.actions$.pipe(
        ofType(GET_LIQ),
        mergeMap((action: GetLiq) => {
            const params = '?token=' + action.token;

            return this.apiService.get('getLiquidador' + params, null, true)
                .pipe(
                    map((res: any) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                )
                .pipe(map((res: {content: ILiq}) => {
                    return new SetLiq(res.content);
                }))
                .pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    closeDay$ = this.actions$.pipe(
        ofType(CLOSE_DAY),
        mergeMap((action: CloseDay) => {
            const params = '?token=' + action.token;

            const paramsPost = {
                devolucion: action.devolucion,
            };

            return this.apiService.post('closeDay' + params, paramsPost, true)
                .pipe(
                    map((res: any) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                )
                .pipe(map((res: {content: boolean}) => {
                    return new FinishCloseDay(res.content);
                }))
                .pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );
}
