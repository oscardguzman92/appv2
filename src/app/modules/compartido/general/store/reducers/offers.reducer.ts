import {AppState as MainAppState} from '../../../../../store/app.reducer';
import {IProduct} from '../../../../../interfaces/IProduct';
import {OffersActions, SET_OFFERS} from '../actions/offers.actions';

export interface OffersState {
    offers: IProduct[];
}

export interface AppState extends MainAppState {
    offers: OffersState;
}

const offersInitial: OffersState = {
    offers: null
};

export function offersReducer(state = offersInitial, action: OffersActions): OffersState {
    switch (action.type) {
        case SET_OFFERS:
            return <OffersState> {
                offers: action.offers
            };

        default:
            return state;
    }
}