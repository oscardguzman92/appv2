import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {AuthService} from '../../services/auth/auth.service';
import {
    AFTER_LOGIN_USER,
    AfterLoginUserAction, AfterRefreshUserAction,
    LOGIN_USER,
    LoginUserAction, REFRESH_USER,
    RefreshUserAction,
    SET_USER,
    SetUserAction
} from './auth.actions';
import {catchError, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {UserBuilder} from '../../builders/user.builder';
import {of, throwError} from 'rxjs';
import {Fail} from '../../modules/compartido/general/store/actions/error.actions';
import {Storage} from '@ionic/storage';
import {ModalController} from '@ionic/angular';
import {NavigationHelper} from '../../helpers/navigation/navigation.helper';
import {AppState} from '../app.reducer';
import {Store} from '@ngrx/store';
import {LoadingOff, LoadingOn} from '../../modules/compartido/general/store/actions/loading.actions';
import {AfterSetUserAction} from '../../modules/tendero/registro/store/registro.actions';
import {AfterLoginMenu} from '../../modules/compartido/general/store/actions/menu.actions';
import { Roles } from 'src/app/enums/roles.enum';
import { OneSignalService } from 'src/app/services/oneSignal/one-signal.service';
import {IntercomService} from '../../services/intercom/intercom.service';
import {UtilitiesHelper} from '../../helpers/utilities/utilities.helper';

@Injectable({
    providedIn: 'root'
})
export class AuthEffect {

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private storage: Storage,
        private modal: ModalController,
        private navigation: NavigationHelper,
        private store: Store<AppState>,
        private intercomService: IntercomService,
        private utilities: UtilitiesHelper) {
    }

    @Effect()
    cargarUsuario$ = this.actions$.pipe(
        ofType(LOGIN_USER),
        mergeMap((action: LoginUserAction) => {
            return this.authService.login(action.login)
                .pipe(
                    map((user) => {
                        if (user.status !== 'error') {
                            return user.content.user;
                        }
                        throw(user);
                    })
                ).pipe(
                    map(user => {
                        if (action.login.prueba === true) {
                            user.prueba = true;
                        }
                        return new UserBuilder(user);
                    })
                ).pipe(
                    map(user => new AfterLoginUserAction(user.getUser()))
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        if (error.code === 33) {
                            return of(new Fail({
                                mensaje: 'El equipo está habilitado para el perfil de vendedor, no es posible ingresar como tendero'
                            }));
                        }
                        return of(new Fail({mensaje: 'Teléfono y/o cédula no exite(n)'}));
                    })
                );
        })
    );



    @Effect({dispatch: false})
    afterLogin$ = this.actions$.pipe(
        ofType(AFTER_LOGIN_USER),
        tap(async (res: AfterLoginUserAction) => {
            let fech = new Date().getDate();
            await this.storage.set("client_list", "d_" + fech);
            this.storage.set('user', JSON.stringify(res.user)).then(() => {
                if (res.user.role == Roles.shopkeeper && !res.user.tiendas[0].direccion) {
                    this.modal.dismiss().then(() => {
                        this.store.dispatch(new LoadingOff());
                        this.store.dispatch(new AfterSetUserAction(res.user));
                    });
                    return;
                } else {
                    this.store.dispatch(new AfterLoginMenu());
                    this.intercomService.registerUser(res.user);
                    this.navigation.goTo(res.user.rootPage);
                    this.modal.getTop().then(modal => {
                        if (modal) {
                            this.modal.dismiss();
                        }
                    });
                    this.store.dispatch(new LoadingOff());
                }
            });
        })
    );

    @Effect()
    refrescarDatos$ = this.actions$.pipe(
        ofType(REFRESH_USER),
        mergeMap((action: RefreshUserAction) => {
            return this.authService.login(action.login)
                .pipe(
                    map((user) => {
                        if (user.status !== 'error') {
                            return user.content.user;
                        }
                        throw(user);
                    })
                ).pipe(
                    map(user => {
                        if (action.login.prueba === true) {
                            user.prueba = true;
                        }
                        return new UserBuilder(user);
                    })
                ).pipe(
                    map(user => new AfterRefreshUserAction(user.getUser(), false, action.notRemoveOrder))
                ).pipe(
                    catchError((error): any => {
                        if (error.code == 30) {
                            this.store.dispatch(new LoadingOff());
                            return of(new AfterRefreshUserAction(null, true));
                        }
                        const mensaje = 'Ha ocurrido un error al actualizar los datos, intentalo en unos momentos';
                        this.utilities.presentToast(mensaje);
                        this.store.dispatch(new LoadingOff());
                        return of(new AfterRefreshUserAction(null));
                    })
                );
        })
    );
}
