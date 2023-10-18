import {LOADING_OFF, LOADING_ON, LoadingActions} from '../actions/loading.actions';

export interface LoadingState {
    on: boolean;
    withoutDuration?: boolean;
    loadingOffer?: boolean;
}

const initialState: LoadingState = {
    on: null
};


export function loadingReducer(state = initialState, action: LoadingActions): LoadingState {

    switch (action.type) {
        case  LOADING_ON:
            return {
                on: true,
                withoutDuration: action.withoutDuration,
                loadingOffer: action.loadingOffer
            };

        case  LOADING_OFF:
            return {
                on: false
            };

        default:
            return state;
    }
}
