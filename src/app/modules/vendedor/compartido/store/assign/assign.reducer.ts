import {ICurrentAccount} from '../../../../../interfaces/ICurrentAccount';
import {assignActions, GET_ACCOUNT_ASSIGN, SET_ACCOUNT_ASSIGN} from './assign.actions';
import {AppState as MainAppState} from '../../../../../store/app.reducer';
import {IMovimentAssign} from '../../../../../interfaces/IMovimentAssign';

export interface AssignState {
    accountAssign: ICurrentAccount;
    moviments: IMovimentAssign[];
}

export interface AppState extends MainAppState {
    accountAssign: AssignState;
}

const assignInitial: AssignState = {
    accountAssign: null,
    moviments: null
};

export function assignReducer(state = assignInitial, action: assignActions): AssignState {
    switch (action.type) {
        case SET_ACCOUNT_ASSIGN:
            return <AssignState> {
                accountAssign: action.currentAccount,
                moviments: action.assignMoviments
            };

        default:
            return state;
    }
}