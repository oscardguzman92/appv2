import {AppState as MainAppState} from '../../../../../../store/app.reducer';
import {MySalesActions, SET_MY_SALES} from './mySales.actions';
import {IMySales} from '../../../../../../interfaces/IMySales';

export interface MySalesState {
    mySales: IMySales;
}

export interface AppState extends MainAppState {
    mySales: MySalesState;
}

const mySalesInitial: MySalesState = {
    mySales: null
};

export function mySalesReducer(state = mySalesInitial, action: MySalesActions): MySalesState {
    switch (action.type) {
        case SET_MY_SALES:
            return <MySalesState> {
                mySales: action.mySales
            };

        default:
            return state;
    }
}