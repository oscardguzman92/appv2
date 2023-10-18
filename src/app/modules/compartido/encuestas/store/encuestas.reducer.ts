import {ISurveys} from '../../../../interfaces/ISurveys';
import {GET_SURVEYS, SET_SURVEYS, SurveysActions} from './encuestas.actions';

export interface SurveysState {
    encuestas_no_respondidas: ISurveys[];
    encuestas_respondidas: ISurveys[];
}

const surveyInitial: SurveysState = {
    encuestas_no_respondidas: null,
    encuestas_respondidas: null
};

export function encuestasReducer(state = surveyInitial, action: SurveysActions): SurveysState {
    switch (action.type) {

        case GET_SURVEYS:
            return <SurveysState> {
                encuestas_no_respondidas: null,
                encuestas_respondidas: null
            };

        case SET_SURVEYS:
            return <SurveysState> {
                encuestas_respondidas: action.encuestas_respondidas,
                encuestas_no_respondidas: action.encuestas_no_respondidas
            };

        default:
            return state;
    }
}
