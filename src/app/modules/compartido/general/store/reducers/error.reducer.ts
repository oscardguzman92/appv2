import {errorActions, FAIL} from '../actions/error.actions';

export interface ErrorState {
    error: any;
}

const initialState: ErrorState = {
    error: null
};


export function errorReducer(state = initialState, action: errorActions): ErrorState {

    switch (action.type) {
        case FAIL:
            return {
                ...state,
                error: action.payload
            };

        default:
            return state;
    }
}
