import { SET_SHOPS, FILTER_SHOPS, ShopActions, GET_SHOPS } from './mis-clientes.actions';
import { IShops } from 'src/app/interfaces/IShops';

export interface ShopState {
    shops: IShops[];
}

const shopsInitial: ShopState = {
    shops: null
};

export function shopsReducer(state = shopsInitial, action: ShopActions): ShopState {
    switch (action.type) {

        case FILTER_SHOPS:
            return <ShopState> {
                shops: null
            };


        case GET_SHOPS:
            return <ShopState> {
                shops: null
            };

        case SET_SHOPS:
            return <ShopState> {
                shops: [
                    ...action.shops
                ]
            };

        default:
            return state;
    }
}
