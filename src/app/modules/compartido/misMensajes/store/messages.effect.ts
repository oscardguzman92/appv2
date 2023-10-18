import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {ApiService} from 'src/app/services/api/api.service';
import {HttpParams} from '@angular/common/http';
import {of} from 'rxjs';
import {Fail} from '../../general/store/actions/error.actions';
import {
    GET_LAST_MESSAGES,
    GET_MESSAGES, GET_MODALS, GetLastMessagesAction,
    GetMessagesAction, GetModalsAction,
    SET_READ_MESSAGE, SET_READ_MODAL, SetLastMessagesAction,
    SetMessagesAction, SetModalsAction,
    SetReadMessageAction, SetReadModalAction
} from './messages.actions';
import {AppState} from '../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {IMessage} from '../../../../interfaces/IMessages';
import {Config} from '../../../../enums/config.enum';
import { Storage } from '@ionic/storage';
import {IModal} from '../../../../interfaces/IModal';

@Injectable({
    providedIn: 'root'
})
export class MessagesEffect {

    constructor(
        private storage: Storage,
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>
    ) {
    }

    @Effect()
    getMessages$ = this.actions$.pipe(
        ofType(GET_MESSAGES),
        mergeMap((action: GetMessagesAction) => {
            const params = new HttpParams()
                .append('token', action.token)
                .append('page', String(action.page))
                .append('paginate', 'true');

            return this.apiService.get('getNotificaciones', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content.mensajes;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(messages => new SetMessagesAction(messages))
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    setReadMessage$ = this.actions$.pipe(
        ofType(SET_READ_MESSAGE),
        mergeMap((action: SetReadMessageAction) => {
            const params = {
                idNotificacion: action.message.id
            };
            return this.apiService.post('setLecturaNotificacion?token=' + action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content.mensaje;
                        }
                        throw(res);
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
    getLastMessage$ = this.actions$.pipe(
        ofType(GET_LAST_MESSAGES),
        mergeMap((action: GetLastMessagesAction) => {
            let params = new HttpParams().append('token', action.token);
            const versionApp = Config.version_app_android;
            if (versionApp) {
                params = params.append('version_app', versionApp.toString());
            }

            return this.apiService.get('getUltimasNotificaciones', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: {mensajes_no_leidos: number, mensaje: IMessage}) => {
                        this.storage.set('msgNotification', {message: res.mensaje, count: res.mensajes_no_leidos});
                        return new SetLastMessagesAction(res.mensaje, res.mensajes_no_leidos);
                    })
                ).pipe(catchError((err) => {
                    if (!err.error) {
                        return of(new Fail(err));
                    }

                    if (!err.error.code) {
                        return of(new Fail(err));
                    }

                    if (err.error.code === '505') {
                        return of(new Fail({version: versionApp}));
                    }

                    return of(new Fail(err));
                }));
        })
    );

    @Effect()
    getModals$ = this.actions$.pipe(
        ofType(GET_MODALS),
        mergeMap((action: GetModalsAction) => {
            return this.apiService.get('getModals?token=' + action.token, null, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(modals => new SetModalsAction(modals))
                ).pipe(
                    catchError((error) => {
                        error.withoutLoading = true;
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    setReadModal$ = this.actions$.pipe(
        ofType(SET_READ_MODAL),
        mergeMap((action: SetReadModalAction) => {
            const params = {
                modal_id: action.modal_id
            };
            return this.apiService.post('setLecturaModal?token=' + action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content.mensaje;
                        }
                        throw(res);
                    })
                ).pipe(
                    catchError((error) => {
                        error.withoutLoading = true;
                        this.store.dispatch(new Fail(error));
                        return of(new Fail(error));
                    })
                );
        })
    );
}
