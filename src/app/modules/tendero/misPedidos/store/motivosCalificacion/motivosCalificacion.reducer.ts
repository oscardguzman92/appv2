import {AppState as MainAppState} from '../../../../../store/app.reducer';
import {IMotivoCalificacion} from '../../../../../interfaces/IMotivoCalificacion';
import {GET_MOTIVOS_CALIFICACION, SET_MOTIVOS_CALIFICACION, MotivosActions} from './motivosCalificacion.actions';

export interface MotivosState {
    motivos: IMotivoCalificacion[];
    motivosSelected: IMotivoCalificacion;
    motivosService?: {        
        motivosSelected: IMotivoCalificacion,
        token: string
    };
}


export interface AppState extends MainAppState {
    motivos: MotivosState;
}

const motivosInitial: MotivosState = {
    motivos: null,
    motivosSelected: null
};

export function MotivosReducer(state = motivosInitial, action: MotivosActions): MotivosState {
    switch (action.type) {
        case GET_MOTIVOS_CALIFICACION:
            return {
                motivos: null,
                motivosSelected: null
            };

        case SET_MOTIVOS_CALIFICACION:
            return <MotivosState> {
                motivos: [
                    ...action.motivosCalificacion
                ],
                motivosSelected: null
            };
  

        default:
            return state;
    }


}
