import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap, switchMap, tap} from 'rxjs/operators';

import {of, throwError} from 'rxjs';

import {Storage} from '@ionic/storage';
import {ModalController, AlertController} from '@ionic/angular';

import {Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {
    LOGIN_BY_DOCUMENT,
    LoginByDocumentAction,
    ResponseLoginByDocumentAction,
    SEND_SMS,
    SendSmsAction,
    ResponseSendSmsAction,
    UPDATE_CELLPHONE,
    UpdateCellphoneAction,
    ResponseUpdateCellphoneAction,
    VALIDATE_CODE_SMS,
    ValidateCodeSmsAction,
    ResponseValidateCodeSmsAction
} from './login.actions';
import {HttpParams} from '@angular/common/http';
import {ApiService} from 'src/app/services/api/api.service';
import {Fail} from '../../general/store/actions/error.actions';
import {LoadingOff} from '../../general/store/actions/loading.actions';
import {Intercom} from '@ionic-native/intercom/ngx';


@Injectable({
    providedIn: 'root'
})
export class loginEffect {

    constructor(
        private actions$: Actions,
        private storage: Storage,
        private modal: ModalController,
        private navigation: NavigationHelper,
        private store: Store<AppState>,
        private apiService: ApiService,
        public alertController: AlertController,
        private intercom: Intercom) {
    }


    @Effect({dispatch: false})
    loginByDocumentation$ = this.actions$.pipe(
        ofType(LOGIN_BY_DOCUMENT),
        mergeMap((action: LoginByDocumentAction) => {
            const playerId = (action.player_id) ? action.player_id : '';
            const via_wapp = (action.via_wapp=='1') ? action.via_wapp : '0';
            const params = {
                cedula: action.document,
                player_id: playerId,
                via_wapp: via_wapp
            };
            return this.apiService.post('getValidacionDocumentoLogin', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.store.dispatch(new ResponseLoginByDocumentAction(res));
                    })
                ).pipe(
                    catchError((error) => {
                        if (error.code === 33) {
                            error = {mensaje: 'El equipo está habilitado para el perfil de vendedor, no es posible ingresar como tendero'};
                        }

                        if (error.code === 1 || error.code === 33) {
                            if (error.code === 1) {
                                error.mensaje = error.content;
                            }
                            this.presentAlert(error.mensaje);
                        } else {
                            this.store.dispatch(new Fail(error));
                        }

                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({dispatch: false})
    sendSms$ = this.actions$.pipe(
        ofType(SEND_SMS),
        mergeMap((action: SendSmsAction) => {
            const via_wapp = (action.via_wapp=='1') ? action.via_wapp : '0';
            const params = {
                telefono: action.cellphone,
                via_wapp: via_wapp
            };
            return this.apiService.post('enviarSmsVerificacion', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.store.dispatch(new ResponseSendSmsAction(res));
                    })
                ).pipe(
                    catchError((error) => {
                        if (error.code) {
                            this.presentAlert(error.content);
                        } else {
                            this.store.dispatch(new Fail(error));
                        }
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({dispatch: false})
    updateCellphone$ = this.actions$.pipe(
        ofType(UPDATE_CELLPHONE),
        mergeMap((action: UpdateCellphoneAction) => {
            const params = {
                telefono: action.cellphone,
            };
            if (action.document) {
                params['cedula'] = action.document;
            }
            if (action.soloValidar) {
                params['soloValidar'] = action.soloValidar;
            }
            if (action.idIgnore) {
                params['idClientIgnore'] = action.idIgnore;
            }
            if (action.sinValidacionTelefono) {
                params['sinValidacionTelefono'] = action.sinValidacionTelefono;
            }
            return this.apiService.post('validacionCelular', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.store.dispatch(new ResponseUpdateCellphoneAction(res));
                    })
                ).pipe(
                    catchError((error) => {
                        if (error.code) {
                            this.presentAlert(error.content);
                        } else {
                            this.store.dispatch(new Fail(error));
                        }
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({dispatch: false})
    validateCodeSms$ = this.actions$.pipe(
        ofType(VALIDATE_CODE_SMS),
        mergeMap((action: ValidateCodeSmsAction) => {
            let params = {
                telefono: action.cellphone,
                codigo: action.code
            };
            if (action.login) {
                params['login'] = action.login;
            }
            if (action.password) {
                params['password'] = action.password;
            }
            if (action.player_id) {
                params['player_id'] = action.player_id;
            }
            return this.apiService.post('verificarCodigoRegistro', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.store.dispatch(new ResponseValidateCodeSmsAction(res));
                    })
                ).pipe(
                    catchError((error) => {
                        if (error.code === 33) {
                            error = {mensaje: 'El equipo está habilitado para el perfil de vendedor, no es posible ingresar como tendero'};
                        }

                        if (error.code === 2) {
                            error = {mensaje: 'Teléfono y/o cédula no existe(n)'};
                        }

                        if (error.code === 30) {
                            error = {mensaje: 'El vendedor no se encuentra activo en el distribuidor'};
                        }

                        if (error.code === 1 || error.code === 33 || error.code === 30) {
                            if (error.code === 1) {
                                error.mensaje = error.content;
                            }
                            this.presentAlert(error.mensaje);
                            this.store.dispatch(new LoadingOff());
                            return;
                        }

                        this.store.dispatch(new Fail(error));
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    async presentAlert(message: string) {
        const alert = await this.alertController.create({
            header: 'Información',
            cssClass: 'attention-alert',
            message: message,
            buttons: [
                {
                    text: 'Contáctanos',
                    handler: () => {
                        this.intercom.displayMessenger();
                    }
                },
                'Aceptar'
            ]
        });

        await alert.present();
    }
}
