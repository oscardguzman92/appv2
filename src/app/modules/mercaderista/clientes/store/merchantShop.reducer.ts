import {AppState as MainAppState} from '../../../../store/app.reducer';
import { GET_MERCHANT_SHOP, SET_MERCHANT_SHOP, merchantShopsActions } from './merchantShop.actions';

export interface MerchanShopState {
    shops: any[];
}

export interface AppState extends MainAppState {
    shops: MerchanShopState;
}

const authInitial: MerchanShopState = {
    shops: null
};

export function merchanShopReducer(state = authInitial, action: merchantShopsActions): MerchanShopState {

    switch (action.type) {

        case GET_MERCHANT_SHOP:
            return {
                shops: null
            };

        case SET_MERCHANT_SHOP:
            return <MerchanShopState> {
                shops: [
                    ...action.shops
                ]
            };

        default:
            return state;
    }


}
