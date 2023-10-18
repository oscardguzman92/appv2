import {AppState as MainAppState} from '../../../../../store/app.reducer';
import {ICurrentAccount} from '../../../../../interfaces/ICurrentAccount';
import {CurrentAccountActions, GET_CURRENT_ACCOUNT, SET_CURRENT_ACCOUNT, SET_CURRENT_ACCOUNT_PASSWORD} from './currentAccount.actions';

export interface CurrentAccountState {
    currentAccount: ICurrentAccount;
}

export interface AppState extends MainAppState {
    currentAccount: CurrentAccountState;
}

const topUpsInitial: CurrentAccountState = {
    currentAccount: null
};

export function currentAccountReducer(state = topUpsInitial, action: CurrentAccountActions): CurrentAccountState {
    switch (action.type) {
        case GET_CURRENT_ACCOUNT:
            return {
                currentAccount: null,
            };

        case SET_CURRENT_ACCOUNT:
            return <CurrentAccountState> {
                currentAccount: {
                    ...action.currentAccount
                }
            };

        case SET_CURRENT_ACCOUNT_PASSWORD:
            return <CurrentAccountState> {
                currentAccount: {
                    pass: action.password
                }
            };

        default:
            return state;
    }


}
