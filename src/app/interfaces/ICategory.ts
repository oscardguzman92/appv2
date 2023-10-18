import { IProduct } from './IProduct';
import { IPaginate } from './IPaginate';

export interface ICategory {
    categoria_padre: string;
    descripcion: string;
    id: number;
    imagen: string;
    nombre: string;
    oferta: number;
    scrollTop: number;
    products: IProduct[];
    paginateProducts: IPaginate;
    productsOrdered?: any[];
}
