import {ICompany} from './ICompany';
import {IPortfolio} from './IPortfolio';
import {TypeKart} from '../enums/typeKart.enum';

export interface ICompaniesPortfolios {
    type:TypeKart,
    company?:ICompany,
    portfolio?:IPortfolio,
    order: number,
} 