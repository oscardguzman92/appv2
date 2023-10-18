import {Action} from '@ngrx/store';
import {ISurveys} from '../../../../interfaces/ISurveys';

export const GET_SURVEYS = '[Survey] Get Surveys';
export const SET_SURVEYS = '[Survey] Set Surveys';

export const GET_SURVEYS_FANNY_RESPONSE = '[Survey] Get Surveys Fanny Response';
export const SET_SURVEYS_FANNY_RESPONSE = '[Survey] Set Surveys Fanny Response';

export class GetSurveysAction implements Action {
    readonly type = GET_SURVEYS;

    constructor(public token: string, public shop_id?: number, public survey_fanny?: boolean, public detalle_cliente?: boolean, public codigo_cliente?: number) {}
}

export class SetSurveysAction implements Action {
    readonly type = SET_SURVEYS;

    constructor(public encuestas_no_respondidas: ISurveys[], public encuestas_respondidas: ISurveys[], public btn_easyfiel?: boolean, public encuestas_fanny_respondidas?: String[]) {}
}

export class GetSurveysFannyResponseAction implements Action {
    readonly type = GET_SURVEYS_FANNY_RESPONSE;

    constructor(public token: string) {}
}

export class SetSurveysFannyResponseAction implements Action {
    readonly type = SET_SURVEYS_FANNY_RESPONSE;

    constructor(public encuestas_fanny_respondidas?: String[]) {}
}


export type SurveysActions = GetSurveysAction | SetSurveysAction;
