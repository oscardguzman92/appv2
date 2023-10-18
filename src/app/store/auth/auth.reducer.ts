import {IUser} from '../../interfaces/IUser';
import {AFTER_LOGIN_USER, AFTER_REFRESH_USER, authActions, LOGIN_USER, REFRESH_USER, SET_USER, UNSET_USER} from './auth.actions';

export interface AuthState {
    user: IUser;
}

const authInitial: AuthState = {
    user: null
};

export function authReducer(state = authInitial, action: authActions): AuthState {

    switch (action.type) {

        case LOGIN_USER:
            return {
                user: null
            };

        case AFTER_LOGIN_USER:
            return {
                user: {...action.user}
            };

        case SET_USER:
            return <AuthState> {
                user: {...action.user}
            };

        case UNSET_USER:
            return {
                user: null
            };

        case REFRESH_USER:
            return {
                user: null
            };

        case AFTER_REFRESH_USER:
            return {
                user: {...action.user}
            };

        default:
            return state;

    }


}
