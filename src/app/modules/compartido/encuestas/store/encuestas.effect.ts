import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import { ApiService } from 'src/app/services/api/api.service';
import {HttpParams} from '@angular/common/http';
import {of} from 'rxjs';
import {Fail} from '../../general/store/actions/error.actions';
import { GET_SURVEYS, GetSurveysAction, SetSurveysAction, SetSurveysFannyResponseAction, GetSurveysFannyResponseAction, GET_SURVEYS_FANNY_RESPONSE } from './encuestas.actions';
import {LoadingOff} from '../../general/store/actions/loading.actions';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../store/app.reducer';

@Injectable({
    providedIn: 'root'
})
export class EncuestasEffect {

    constructor(private actions$: Actions, private apiService: ApiService, private store: Store<AppState>) {
    }

    @Effect()
    getEncuestas$ = this.actions$.pipe(
        ofType(GET_SURVEYS),
        mergeMap((action: GetSurveysAction) => {
            const params = new HttpParams().set('token', action.token);
            let shop_id = '';
            let survey_fanny = '';
            let detalle_cliente = '';
            let codigo_cliente = '';

            if (action.shop_id) {
                shop_id = '?tienda_id=' + action.shop_id.toString();
            }
            if (action.detalle_cliente) {
                detalle_cliente = (shop_id == '') ? "?": "&";
                detalle_cliente = detalle_cliente + 'detalle_cliente=' + action.detalle_cliente;
            }
            
            if (action.survey_fanny) {
                survey_fanny = (shop_id == '' && detalle_cliente == '') ? "?": "&";
                survey_fanny = survey_fanny+'tipo_encuesta=fanny';
            }

            return this.apiService.get('getAllSurveys' + shop_id + detalle_cliente + survey_fanny, params, true)
                .pipe(
                    map( (res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(encuestas => new SetSurveysAction(encuestas.encuestas_no_respondidas, encuestas.encuestas_respondidas, encuestas.btn_easyfiel, encuestas.encuestas_fanny_respondidas))
                ).pipe(
                    catchError( (error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getSurveysFannyResponseAction$ = this.actions$.pipe(
        ofType(GET_SURVEYS_FANNY_RESPONSE),
        mergeMap((action: GetSurveysFannyResponseAction) => {
            const params = new HttpParams().set('token', action.token);
            return this.apiService.get('getEncuestasFannyRespondidas', params, true)
                .pipe(
                    map( (res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(encuestas => new SetSurveysFannyResponseAction(encuestas.encuestas_fanny_respondidas))
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        return of();
                    })
                );
        })
    );
}
