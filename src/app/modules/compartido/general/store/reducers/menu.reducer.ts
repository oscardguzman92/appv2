import {menuActions, TOGGLE_MENU} from '../actions/menu.actions';
import {AppState} from '../../../../../store/app.reducer';

export interface MenuState {
    open: boolean;
}

export interface AppState extends AppState {
    menu: MenuState;
}

const initialState: MenuState = {
    open: false
};


export function menuReducer(state = initialState, action: menuActions): MenuState {

    switch (action.type) {
        case  TOGGLE_MENU:
            return {
                ...state,
                open: !state.open
            };


        default:
            return state;
    }
}
