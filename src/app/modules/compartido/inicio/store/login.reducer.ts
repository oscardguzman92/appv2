import { loginActions, LOGIN_BY_DOCUMENT, RESPONSE_LOGIN_BY_DOCUMENT } from './login.actions';

export interface AuthState {
    data: any;
}

const authInitial: AuthState = {
    data: null
};

export function loginReducer(state = authInitial, action: loginActions): AuthState {

    switch (action.type) {

        case LOGIN_BY_DOCUMENT:
            return {
                data: null
            };

        case RESPONSE_LOGIN_BY_DOCUMENT:
            return {
                data: action.data
            };

        default:
            return state;

    }


}
