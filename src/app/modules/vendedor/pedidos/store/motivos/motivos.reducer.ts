import {AppState as MainAppState} from '../../../../../store/app.reducer';
import {IMotivo} from '../../../../../interfaces/IMotivo';
import {GET_MOTIVOS_NO_PEDIDO, SET_MOTIVOS_NO_PEDIDO, MotivosActions} from './motivos.actions';

export interface MotivosState {
    motivos: IMotivo[];
    motivosSelected: IMotivo;
    motivosService?: {        
        motivosSelected: IMotivo,
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

export function motivosReducer(state = motivosInitial, action: MotivosActions): MotivosState {
    switch (action.type) {
        case GET_MOTIVOS_NO_PEDIDO:
            return {
                motivos: null,
                motivosSelected: null
            };

        case SET_MOTIVOS_NO_PEDIDO:
            return <MotivosState> {
                motivos: [
                    ...action.motivosNoPedido
                ],
                motivosSelected: null
            };
  

        default:
            return state;
    }


}
