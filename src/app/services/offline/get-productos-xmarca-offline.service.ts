import {Injectable} from '@angular/core';
import {GetProductosOfflineService} from './get-productos-offline.service';
import {LoadingOff} from '../../modules/compartido/general/store/actions/loading.actions';
import {UtilitiesHelper} from '../../helpers/utilities/utilities.helper';

@Injectable({
    providedIn: 'root'
})
export class GetProductosXMarcaOfflineService {

    constructor(private getProducts: GetProductosOfflineService, private helper: UtilitiesHelper) {
    }

    invoke(idShop, marca) {
        let  productosStorage, ofertasStorage, preciosProductos, lista_precio_tienda, productosOff;
        return this.getProducts.invoke()
            .then((data) => {
                if (!data.value) {
                    return null;
                }
                const service = data.value;
                const tiendas = service.tiendas;
                productosStorage = service.productos;
                ofertasStorage = service.ofertas;
                preciosProductos = service.precios_productos;
                lista_precio_tienda = tiendas[idShop].l_p;
                productosOff = tiendas[idShop].productos;
                return productosOff;
            }).then((productos) => {
                return productos.map(prod => {
                    return this.helper.infoProduct(prod, productosStorage);
                }).map((prod) => {
                    if (prod.of && prod.of.length > 0) {
                        prod['of'] = this.helper.inforOffer(prod.of[0], ofertasStorage, lista_precio_tienda);
                        return prod;
                    }
                    return prod;
                }).map((prod) => {
                    if (prod == false) {
                        return false;
                    }
                    prod['p'] = this.helper.inforPrecio(prod, preciosProductos, lista_precio_tienda);
                    return prod;
                }).filter((producto) => {
                    if (producto === false) {
                        return false;
                    }
                    return producto.m == marca;
                });
            }).catch((e) => {
                console.error("Error realizando la busqueda." + e);
                return [];
            });
    }
}
