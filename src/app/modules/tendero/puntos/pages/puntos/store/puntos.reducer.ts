import {IExchangesProducts} from '../../../../../../interfaces/IExchangesProducts';
import {AppState as MainAppState} from '../../../../../../store/app.reducer';
import {PuntosActions, SET_EXCHANGE_PRODUCTS} from './puntos.actions';
import {IPoints} from '../../../../../../interfaces/IPoints';

export interface PuntosState {
    exchangeProducts: IExchangesProducts[];
    points: IPoints;
}

export interface AppState extends MainAppState {
    puntos: PuntosState;
}

const puntosInitial: PuntosState = {
    exchangeProducts: null,
    points: null
};

export function puntosReducer(state = puntosInitial, action: PuntosActions): PuntosState {
    switch (action.type) {
        case SET_EXCHANGE_PRODUCTS:
            return <PuntosState> {
                exchangeProducts: action.exchageProducts,
                points: action.points
            };

        default:
            return state;
    }
}