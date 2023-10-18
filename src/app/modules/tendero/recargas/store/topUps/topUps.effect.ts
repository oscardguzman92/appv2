import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, finalize, map, mergeMap, tap} from 'rxjs/operators';
import {LoadingOff} from '../../../../compartido/general/store/actions/loading.actions';
import {of} from 'rxjs';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {
    GET_HISTORY_TOP_UPS,
    GET_TOP_UPS, GetHistoryTopUps,
    GetTopUpsAction, SEND_DDDEDO, SendDddedoAction,
    SET_TOP_UPS_SELECTED,
    SET_TOP_UPS_SERVICE, SetHistoryTopUps,
    SetTopUpsAction,
    SetTopUpsSelectedAction, SetTopUpsServiceAction
} from './topUps.actions';
import {HttpParams} from '@angular/common/http';
import {IProductService} from '../../../../../interfaces/IProductService';
import {ApiService} from '../../../../../services/api/api.service';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Storage} from '@ionic/storage';
import {AppState} from './topUps.reducer';
import {Store} from '@ngrx/store';
import {Success} from '../../../../compartido/general/store/actions/sucess.actions';
import {ITransaction} from '../../../../../interfaces/ITransaction';
import {LocalNotificationService,LocalNotification} from 'src/app/services/localNotification/local-notification.service';

@Injectable({
    providedIn: 'root'
})
export class TopUpsEffect {
    constructor(
        private actions$: Actions,
        private api: ApiService,
        private navigation: NavigationHelper,
        private storage: Storage,
        private localNotiService: LocalNotificationService,
        private store: Store<AppState>) {
    }

    @Effect()
    loadServices$ = this.actions$.pipe(
        ofType(GET_TOP_UPS),
        mergeMap((action: GetTopUpsAction) => {
            const params = new HttpParams().append('token', action.token);
            return this.api.get('getProductosMovilway', params)
                .pipe(
                    map((res) => {
                        console.log(res);
                        if (res.status !== 'error') {
                            return res.content.productosServicios;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((productServices: IProductService[]) => new SetTopUpsAction(productServices))
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    selectedTopsUps$ = this.actions$.pipe(
        ofType(SET_TOP_UPS_SELECTED),
        tap((res: SetTopUpsSelectedAction) => {
            if (res.topUpsSelected === null) {
                return;
            }
            this.storage.set('topUpsselected', JSON.stringify(res.topUpsSelected))
                .then(() => {
                    this.navigation.goToBack('realizar-recarga');
                });
        })
    );

    @Effect({dispatch: false})
    setTopsUps$ = this.actions$.pipe(
        ofType(SET_TOP_UPS_SERVICE),
        mergeMap((action: SetTopUpsServiceAction) => {
            const params = {
                monto: action.value,
                beneficiario: action.cellphone,
                password_cuenta_corriente: action.pass_act,
                servicio_producto_id: action.topUpsSelected.id
            };
            return this.api.post(`setRecargaMovilway?token=${action.token}`, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    tap(() => {
                        this.store.dispatch(new Success({message: 'Recarga exitosa'}));
                        //crear notificacion local
                        const params:LocalNotification = {
                            text:"Encuentra aquí como obtener mas saldo.",
                            title:"¿Se te está acabando el saldo?",
                            data: { redirect: "solicitud-recarga" },
                            trigger: { at: new Date(new Date().getTime() + 1000 * 60 * 2)}
                        };
                        this.localNotiService.setLocalNotification(params);
                        this.navigation.goToBack('recargas');
                    })
                ).pipe(
                    finalize(() => {
                        this.store.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new Fail(error));
                        // const params: LocalNotification = {
                        //     text: "Encuentra aquí como obtener mas saldo error borrar.",
                        //     title: "¿Se te está acabando el saldo error borrar?",
                        //     trigger: { at: new Date(new Date().getTime() + 1000 * 60 * 2) }
                        // };
                        //this.localNotiService.setLocalNotification(params);
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    sendDddedo$ = this.actions$.pipe(
        ofType(SEND_DDDEDO),
        mergeMap((action: SendDddedoAction) => {
            const params = {
                monto: action.value,
            };
            return this.api.post(`asignarSaldoDddedo?token=${action.token}`, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    tap(() => {
                        this.store.dispatch(new Success({message: 'Recarga exitosa'}));
                        this.navigation.goToBack('recargas');
                    })
                ).pipe(
                    finalize(() => {
                        this.store.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new Fail(error));
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getHistoryTopUps$ = this.actions$.pipe(
        ofType(GET_HISTORY_TOP_UPS),
        mergeMap((action: GetHistoryTopUps) => {
            const params = new HttpParams()
                .append('token', action.token)
                .append('paginate', 'true')
                .append('page', String(action.page));
            return this.api.get('getMovimientosTransaccionesM', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((response: { content: { transacciones: ITransaction[] }, paginate: any }) => {
                        return new SetHistoryTopUps(response.content.transacciones, response.paginate);
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );
}
