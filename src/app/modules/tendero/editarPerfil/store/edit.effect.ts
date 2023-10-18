import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {LoadingOff} from '../../../compartido/general/store/actions/loading.actions';
import {of} from 'rxjs';
import {Fail} from '../../../compartido/general/store/actions/error.actions';
import {ApiService} from '../../../../services/api/api.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../store/app.reducer';
import {ModalController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {AfterUpdateUserAction, UPDATE_USER, UpdateUserAction} from './edit.actions';

@Injectable({
    providedIn: 'root'
})
export class EditEffect {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>,
        private modalController: ModalController,
        private storage: Storage) {
    }

    @Effect()
    setUserRegister$ = this.actions$.pipe(
        ofType(UPDATE_USER),
        mergeMap((action: UpdateUserAction) => {
            const params = {
                nombre_contacto: action.user.nombre_contacto,
                telefono_contacto: action.user.telefono_contacto,
                email: action.user.email,
                cedula: action.user.cedula
            };

            return this.apiService.post('setCliente', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        return new AfterUpdateUserAction(action.user);
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
