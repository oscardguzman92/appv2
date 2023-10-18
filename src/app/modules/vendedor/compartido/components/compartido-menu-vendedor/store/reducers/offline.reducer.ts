import * as fromOfflineActions from  '../actions/offline.actions';
import {AppState} from '../../../../../../../store/app.reducer';

export interface OfflineState {
    active: boolean;
}

const initialState: OfflineState = {
    active: false
};


export function offlineReducer(state = initialState, action: fromOfflineActions.offlineActions): OfflineState {

    switch (action.type) {
        case  fromOfflineActions.TOGGLE_OFFLINE:
            return {
                ...state,
                active: action.toggle
            };

        default:
            return state;
    }
}

