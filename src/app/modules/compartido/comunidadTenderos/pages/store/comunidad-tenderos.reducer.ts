import {ShopkeepersCommunityActions, Get_Shopkeepers_Community, Set_Shopkeepers_Community, IPagShopkeepersCommunity} from './comunidad-tenderos.actions';
import {IShopkeepersCommunity} from 'src/app/interfaces/IShopkeepersCommunity';

export interface ShopkeepersCommunityState {
    shopkeepersCommunity: IPagShopkeepersCommunity;
}

const shopkeepersCommunityInitial: ShopkeepersCommunityState = {
    shopkeepersCommunity: null
};

export function shopkeepersCommunityReducer(state = shopkeepersCommunityInitial, action: ShopkeepersCommunityActions): ShopkeepersCommunityState {
    switch (action.type) {

        case Get_Shopkeepers_Community:
            return <ShopkeepersCommunityState> {
                shopkeepersCommunity: null
            };

        case Set_Shopkeepers_Community:
            return <ShopkeepersCommunityState> {
                shopkeepersCommunity: {
                    ...action.shopkeepersCommunity
                }
            };

        default:
            return state;
    }
}
