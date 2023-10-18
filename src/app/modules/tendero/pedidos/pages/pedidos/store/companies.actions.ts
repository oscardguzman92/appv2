import {Action} from '@ngrx/store';
import {ICompany} from '../../../../../../interfaces/ICompany';
import {IPortfolio} from '../../../../../../interfaces/IPortfolio';
import {IModal} from '../../../../../../interfaces/IModal';

export const GET_COMPANIES = '[Companies] Get companies';
export const SET_COMPANIES = '[Companies] Set companies';

export class GetCompaniesAction implements Action {
    readonly type = GET_COMPANIES;

    constructor(public token: string, public tienda_id: number, public consultaModals?: boolean, public emitOfertas?: any) {
    }
}

export class SetCompaniesAction implements Action {
    readonly type = SET_COMPANIES;

    constructor(
        public companies: ICompany[],
        public portfolio: IPortfolio[],
        public featuredProducts: any,
        public concursos_nuevos?: number,
        public modales?: IModal[]
    ) {
    }
}

export type CompaniesActions = GetCompaniesAction | SetCompaniesAction;
