import { ICompany } from './ICompany';

export interface IPortfolio {
    companiesRows: Array<any>;
    nom_dist: string;
    totalOrder: number;
    vendedor_id: any;
    vendedor: any;
    dia_visita: number;
    grupo_vendedor_id: number;
    distribuidor_id: any;
    companies: ICompany[];
    image: string;
    index: number;
    portafolio: string;
    vista_unica: boolean;
}
