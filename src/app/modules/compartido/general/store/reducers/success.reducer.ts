import {SUCCESS, SucessActions} from '../actions/sucess.actions';

export interface SuccessState {
    payload: any;
}

const initialState: SuccessState = {
    payload: null
};


export function successReducer(state = initialState, action: SucessActions): SuccessState {

    switch (action.type) {
        case SUCCESS:
            return {
                ...state,
                payload: action.payload
            };

        default:
            return state;
    }
}
