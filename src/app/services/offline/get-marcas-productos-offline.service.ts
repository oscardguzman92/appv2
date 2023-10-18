import {Injectable} from '@angular/core';
import {IBrand} from '../../interfaces/IBrand';

@Injectable({
    providedIn: 'root'
})
export class GetMarcasProductosOfflineService {

    constructor() {
    }

    invoke(productos: any[]): IBrand[] {
        const idsBrands = [];
        return productos.filter((producto) => {
            if (idsBrands.indexOf(producto.m) < 0) {
                idsBrands.push(producto.m);
                return true;
            }
            return idsBrands.indexOf(producto.m) < 0;
        }).map((producto) => {
            return {nombre: producto.m, id: 0};
        });
    }
}
