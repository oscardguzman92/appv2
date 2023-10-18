import { GET_SELLERS, SET_SELLERS, sellersActions} from './superSeller.actions';
import {AppState as MainAppState} from '../../../../store/app.reducer';
import { Seller } from 'src/app/models/Seller';

export interface SuperSellerState {
    superSeller: Seller[];
}

export interface AppState extends MainAppState {
    superSeller: SuperSellerState;
}

const authInitial: SuperSellerState = {
    superSeller: null
};

export function superSellerReducer(state = authInitial, action: sellersActions): SuperSellerState {

    switch (action.type) {

        case GET_SELLERS:
            return {
                superSeller: null
            };

        case SET_SELLERS:
            return <SuperSellerState> {
                superSeller: [
                    ...action.sellers
                ]
            };

        default:
            return state;
    }


}
