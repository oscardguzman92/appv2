import {IUser} from '../../../../interfaces/IUser';
import {AppState as MainAppState} from '../../../../store/app.reducer';
import {AFTER_UPDATE_USER, EditActions} from './edit.actions';

export interface EditState {
    user: IUser;
}

export interface EditAppState extends MainAppState {
    edit: EditState;
}

const editInitial: EditState = {
    user: null
};

export function editReducer(state = editInitial, action: EditActions): EditState {
    switch (action.type) {
        case AFTER_UPDATE_USER:
            return <EditState> {
                user: action.user
            };

        default:
            return state;
    }
}
