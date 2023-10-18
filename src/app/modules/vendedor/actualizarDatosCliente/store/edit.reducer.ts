import {AFTER_UPDATE_SHOPKEEPER, EditActions} from './edit.actions';
import {Shop} from '../../../../models/Shop';

export interface EditState {
    shop: Shop;
}

const editInitial: EditState = {
    shop: null
};

export function editReducer(state = editInitial, action: EditActions): EditState {
    switch (action.type) {
        case AFTER_UPDATE_SHOPKEEPER:
            return <EditState> {
                shop: action.shop
            };

        default:
            return state;
    }
}
