import {Injectable} from '@angular/core';
import {IBrand} from '../../interfaces/IBrand';
import {UtilitiesHelper} from '../../helpers/utilities/utilities.helper';

@Injectable({
    providedIn: 'root'
})
export class GetInfoProductosOfflineService {

    constructor(private helper: UtilitiesHelper) {
    }

    invoke(lista_precio_tienda, productosTienda, productosStorage, preciosProductos, ofertasStorage) {
            try {
                let productos = productosTienda.map(prod => {
                    return this.helper.infoProduct(prod, productosStorage);
                });

                productos = productos.map((prod) => {
                    if (prod.of && prod.of.length > 0) {
                        prod['of'] = this.helper.inforOffer(prod.of[0], ofertasStorage, lista_precio_tienda);
                        return prod;
                    }
                    return prod;
                });

                productos = productos.map((prod) => {
                    prod['p'] = this.helper.inforPrecio(prod, preciosProductos, lista_precio_tienda);
                    return prod;
                });

                return productos;
            } catch(e) {
                console.error("Error realizando la busqueda." + e);
                return [];
            };
    }
}
