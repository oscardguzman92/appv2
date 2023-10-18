import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, finalize, map, mergeMap, tap} from 'rxjs/operators';
import {LoadingOff} from '../../../../compartido/general/store/actions/loading.actions';
import {of} from 'rxjs';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {   
    GET_MOTIVOS_CALIFICACION,
    GetMotivosAction, 
    SetMotivosAction
} from './motivosCalificacion.actions';
import {HttpParams} from '@angular/common/http';
import {IMotivoCalificacion} from '../../../../../interfaces/IMotivoCalificacion';
import {ApiService} from '../../../../../services/api/api.service';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Storage} from '@ionic/storage';
import {AppState} from './motivosCalificacion.reducer';
import {Store} from '@ngrx/store';
import {LocalNotificationService,LocalNotification} from '../../../../../services/localNotification/local-notification.service';

@Injectable({
    providedIn: 'root'
})
export class MotivosCalificacionEffect {
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
        ofType(GET_MOTIVOS_CALIFICACION),
        mergeMap((action: GetMotivosAction) => {
            const params = new HttpParams().append('token', action.token);
            return this.api.get('getMotivosCalificacion', params)
                .pipe(
                    map((res) => {
                        console.log(res);
                        if (res.status !== 'error') {                           
                             return res.content.motivos; // contenido de respuesta
                        }
                        throw(res);
                    })
                ).pipe(
                   map((motivoService: IMotivoCalificacion[]) => new SetMotivosAction(motivoService))
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

  
}
