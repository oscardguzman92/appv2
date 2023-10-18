import {offlineActions, SET_OFFLINE_DYNAMIC} from './offlineDynamic.actions';

export interface OfflineDynamicState {
    active: boolean;
}

const initialState: OfflineDynamicState = {
    active: false
};


export function offlineDynamicReducer(state = initialState, action: offlineActions): OfflineDynamicState {
    switch (action.type) {
        case  SET_OFFLINE_DYNAMIC:
            return {
                ...state,
                active: action.on
            };

        default:
            return state;
    }
}

