import {IUser} from '../../../../interfaces/IUser';
import {
    AFTER_SET_USER,
    registerActions,
    SET_FINISH_USER_REGISTER,
    SET_USER,
    UPDATE_USER_BEFORE_FINISH_REGISTER
} from './registro.actions';

export interface RegisterState {
    user: IUser;
}

const frequentlyAskedInitial: RegisterState = {
    user: null
};

export function registerReducer(state = frequentlyAskedInitial, action: registerActions): RegisterState {
    switch (action.type) {

        case SET_USER:
            return <RegisterState> {
                user: action.user
            };

        case AFTER_SET_USER:
            return <RegisterState> {
                user: action.user
            };

        case UPDATE_USER_BEFORE_FINISH_REGISTER:
            return <RegisterState> {
                user: action.user
            };

        case SET_FINISH_USER_REGISTER:
            return <RegisterState> {
                user: action.user
            };

        default:
            return state;
    }
}
