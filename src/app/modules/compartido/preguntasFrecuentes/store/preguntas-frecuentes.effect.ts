import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Get_Frequently_Asked, GetFrequentlyAskedAction, SetFrequentlyAskedAction} from './preguntas-frecuentes.actions';
import {catchError, map, mergeMap} from 'rxjs/operators';
import { ApiService } from 'src/app/services/api/api.service';
import {HttpParams} from '@angular/common/http';
import {of} from 'rxjs';
import {Fail} from '../../general/store/actions/error.actions';

@Injectable({
    providedIn: 'root'
})
export class PreguntasFrecuentesEffect {

    constructor(
        private actions$: Actions,
        private apiService: ApiService
    ) {
    }

    @Effect()
    cargarPreguntasFrecuentes$ = this.actions$.pipe(
        ofType(Get_Frequently_Asked),
        mergeMap((action: GetFrequentlyAskedAction) => {
            const params = new HttpParams().set('token', action.token);
            return this.apiService.get('getPreguntasFrecuentes', params)
                .pipe(
                    map( (res) => {
                        if (res.status !== 'error') {
                            return res.content.preguntas;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(frequentQuestions => new SetFrequentlyAskedAction(frequentQuestions))
                ).pipe(
                    catchError( (error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );
}
