import {AppState as MainAppState} from '../../../../../store/app.reducer';
import {IProductService} from '../../../../../interfaces/IProductService';
import {GET_TOP_UPS, SET_TOP_UPS, SET_TOP_UPS_SELECTED, SET_TOP_UPS_SERVICE, TopUpsActions} from './topUps.actions';

export interface TopUpsState {
    topUps: IProductService[];
    topUpsSelected: IProductService;
    topUpsService?: {
        value: any,
        cellphone: any,
        pass_act: string,
        topUpsSelected: IProductService,
        token: string,
    };
}


export interface AppState extends MainAppState {
    topUps: TopUpsState;
}

const topUpsInitial: TopUpsState = {
    topUps: null,
    topUpsSelected: null
};

export function topUpsReducer(state = topUpsInitial, action: TopUpsActions): TopUpsState {
    switch (action.type) {
        case GET_TOP_UPS:
            return {
                topUps: null,
                topUpsSelected: null
            };

        case SET_TOP_UPS:
            return <TopUpsState> {
                topUps: [
                    ...action.topUps
                ],
                topUpsSelected: null
            };

        case SET_TOP_UPS_SELECTED:
            return <TopUpsState> {
                topUps: [
                    ...action.topUps
                ],
                topUpsSelected: action.topUpsSelected
            };

        case SET_TOP_UPS_SERVICE:
            return <TopUpsState> {
                topUps: null,
                topUpsSelected: action.topUpsSelected,
                topUpsService: {
                    token: action.token,
                    cellphone: action.cellphone,
                    pass_act: action.pass_act,
                    topUpsSelected: action.topUpsSelected,
                    value: action.value
                }
            };

        default:
            return state;
    }


}
