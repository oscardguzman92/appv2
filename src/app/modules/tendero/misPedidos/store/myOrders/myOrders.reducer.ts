import {GET_MY_ORDERS, myOrdersActions, SET_MY_ORDERS} from './myOrders.actions';
import {AppState as MainAppState} from '../../../../../store/app.reducer';
import {Order} from '../../../../../models/Order';

export interface MyOrdersState {
    myOrders: Order[];
    paginate: {pages: number};
}

export interface AppState extends MainAppState {
    myOrders: MyOrdersState;
}

const authInitial: MyOrdersState = {
    myOrders: null,
    paginate: null,
};

export function myOrdersReducer(state = authInitial, action: myOrdersActions): MyOrdersState {

    switch (action.type) {

        case GET_MY_ORDERS:
            return {
                myOrders: null,
                paginate: null
            };

        case SET_MY_ORDERS:
            return <MyOrdersState> {
                myOrders: [
                    ...action.orders
                ],
                paginate: {...action.pagination}
            };

        default:
            return state;
    }


}
