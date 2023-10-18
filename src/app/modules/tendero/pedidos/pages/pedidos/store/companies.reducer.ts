import {ICompany} from '../../../../../../interfaces/ICompany';
import {IPortfolio} from '../../../../../../interfaces/IPortfolio';
import {AppState as MainAppState} from '../../../../../../store/app.reducer';
import {CompaniesActions, SET_COMPANIES} from './companies.actions';

export interface CompaniesState {
    companies: ICompany[];
    portfolio: IPortfolio[];
    featuredProducts: any[];
}

export interface AppState extends MainAppState {
    companies: CompaniesState;
}

const companiesInitial: CompaniesState = {
    companies: null,
    portfolio: null,
    featuredProducts: null
};

export function companiesReducer(state = companiesInitial, action: CompaniesActions): CompaniesState {
    switch (action.type) {
        case SET_COMPANIES:
            return <CompaniesState> {
                companies: action.companies,
                portfolio: action.portfolio,
                featuredProducts: action.featuredProducts
            };

        default:
            return state;
    }
}