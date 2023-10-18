import {AppState as MainAppState} from '../../../../../../store/app.reducer';
import {GET_PREVIOUS_ORDERS, previousOrdersActions} from './previousOrders.actions';

export interface PreviousOrdersState {
    previousOrders: any;
}

export interface AppState extends MainAppState {
    previousOrders: PreviousOrdersState;
}

const previousOrdersInitial: PreviousOrdersState = {
    previousOrders: null
};

export function previousOrdersReducer(state = previousOrdersInitial, action: previousOrdersActions): PreviousOrdersState {
    switch (action.type) {
        case GET_PREVIOUS_ORDERS:
            return {
                previousOrders: null
            };

        default:
            return state;
    }


}