import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import {HttpParams} from '@angular/common/http';
import {Shop} from '../../models/Shop';
import {Order} from '../../models/Order';
import {Storage} from '@ionic/storage';
import {NavigationHelper} from '../../helpers/navigation/navigation.helper';
import {AppState} from '../../store/app.reducer';
import {Store} from '@ngrx/store';
import {FilterProductsAction} from '../../modules/compartido/pedidos/store/orders.actions';
import {LoadingOff} from '../../modules/compartido/general/store/actions/loading.actions';
import {CashRegisterService} from './cash-register.service';
import {ToastController} from '@ionic/angular';
import { IProduct } from 'src/app/interfaces/IProduct';
import { Config } from 'src/app/enums/config.enum';
import { SuperSellerService } from '../users/super-seller.service';
import { ShopSingletonService } from '../shops/shop-singleton.service';
import {IShops} from '../../interfaces/IShops';
import {IPurchases} from '../../interfaces/IPurchases';

export interface IProducto {
    producto_id: number;
    valor: number;
    valor_original: number;
    cantidad: number;
    oferta_id?: number;
    imagenes?: any;
    precio?: any;
    precio_unitario?: any;
    total?: any;
    cantidad_original?: any;
}

export interface IOrder {
    productos: Array<IProducto>;
    token: string;
    tienda_id: number;
    confirmado?: boolean;
    codigo_cliente?: string;
    latitud?: string;
    longitud?: string;
    tienda?: IShops;
    id?: number;
    valor_pedido?: number;
    valor_sin_iva?: number;
    iva?: number;
    compra?: IPaymentMethods;
}

export interface IPaymentMethods {
    id: number;
    id_estado_compra: number;
    id_servicio: number;
    monto: number;
    metodos_pago: IMethods[];
}

export interface IMethods {
    created_at: string;
    updated_at: string;
    cuotas: number;
    id: number;
    id_compra: number;
    id_compra_credito: string;
    id_credito: string;
    id_tipo_metodo: number;
    monto: number;
    pago: boolean;
}

@Injectable({
    providedIn: 'root'
})

export class OrdersService {

    constructor(
        private api: ApiService,
        private storage: Storage,
        private superSellerService: SuperSellerService,
        public shopSingletonService: ShopSingletonService,
        ) {
    }

    public myOrders(token: string, shop: Shop, page: number, validar_productos?: boolean) {
        let params = new HttpParams()
            .set('token', token)
            .set('page', page.toString())
            .set('tienda_id', `${shop.id}`);

        if (validar_productos) {
            params = params.append('validar_productos', '1');
        }

        return this.api.get('getPedido', params, true);
    }

    public setOrder(params) {  
        
        params.version = Config.version_app_android_string;
        if (this.superSellerService.idSuperSeller) params.super_vendedor_id = this.superSellerService.idSuperSeller;
        params.productos = this.normalizeProductsParamsSetOrder(params.productos);
        let endpoint = this.api.getEndpoint() + 'setPedido?token=' + params.token + '&tienda_id=' + params.tienda_id;
        return this.api.post2(endpoint, params, true);
    }

    public cancelOrder(params) {
        if (this.superSellerService.idSuperSeller) params.super_vendedor_id = this.superSellerService.idSuperSeller;
        let endpoint = this.api.getEndpoint() + 'setEstadoPedido?token=' + params.token;
        return this.api.post2(endpoint, params, true);
    }

    public setDatosExtrasPedido(params) {
        if (this.superSellerService.idSuperSeller) params.super_vendedor_id = this.superSellerService.idSuperSeller;
        let endpoint = this.api.getEndpoint() + 'setDatosExtrasPedido?token=' + params.token;
        return this.api.post2(endpoint, params, true);
    }

    public setPedidoExpress(params) {
        if (this.superSellerService.idSuperSeller) params.super_vendedor_id = this.superSellerService.idSuperSeller;
        let endpoint = this.api.getEndpoint() + 'setPedidoExpress?token=' + params.token;
        return this.api.post2(endpoint, params, true);
    }

    public setMotivoNoPedido(params) {
        if (this.superSellerService.idSuperSeller) params.super_vendedor_id = this.superSellerService.idSuperSeller;
        let endpoint = this.api.getEndpoint() + 'setMotivoNoPedido?token=' + params.token;
        return this.api.post2(endpoint, params, true);
    }

    public setDatosCalificacion2(params) {
        let endpoint = this.api.getEndpoint() + 'setCalificacion?token=' + params.token;
        return this.api.post2(endpoint, params, true);
    }

    public setDatosCalificacion(paramss) {
        const params = new HttpParams()
            .set('token', paramss.token)
            .set('pedido_id', paramss.pedido_id)
            .set('calificacion', paramss.calificacion)
            .set('estado_pedido', paramss.estado_pedido);
        let endpoint = 'setCalificacion';
        return this.api.post(endpoint, params, true);
    }

    public addCarFavoriteOrder(order: Order, shop: Shop) {
        let shopSel = this.shopSingletonService.getSelectedShop();
        if (shopSel) {
            shopSel.productos_seleccionados = {};
            shopSel = this.asignProductsSelected(order.productos, shopSel);
            shop = shopSel;
            this.shopSingletonService.setSelectedShop(shopSel)
            this.shopSingletonService.setStorageSelectedShop(shopSel)
        }
        if (!shop.productos_seleccionados) { shop.productos_seleccionados = {}; }
        shop = this.asignProductsSelected(order.productos, shop);
        return this.countSelectedProducts();
    }

    public addCarFeaturedProduct(product, shop: Shop) {
        return this.storage.get('order').then((res) => {
            if (!res) {
                res = JSON.stringify([shop]);
            }
            const shops = JSON.parse(res);
            product.imagenes = [{url: product.imagen}];
            product.cantidad = 1;
            for (let shopItem of shops) {
                if (shopItem.id === shop.id) {
                    if (!shopItem.productos_seleccionados) { shopItem.productos_seleccionados = {}; }
                    shopItem = this.asignFeaturedProduct(shopItem, product);
                    return this.storage.set('order', JSON.stringify(shops));
                }
            }

            if (!shop.productos_seleccionados) { shop.productos_seleccionados = {}; }
            shop.productos_seleccionados[product.producto_id] = product;
            return this.storage.set('order', JSON.stringify(shops));
        }).then(() => {
            return this.countSelectedProducts();
        });
    }

    private asignProductsSelected(products, shop) {
        for (const product of products) {
            product.precio = product.valor;
            shop.productos_seleccionados[product.id] = product;
        }

        return shop;
    }

    private asignFeaturedProduct(shop, product) {
        if (shop.productos_seleccionados[product.id]) {
            shop.productos_seleccionados[product.id].cantidad++;
            return shop;
        }

        shop.productos_seleccionados[product.id] = product;

        return shop;
    }

    countSelectedProducts() {
        return new Promise<number>((resolve, reject) => {
            let shop = this.shopSingletonService.getSelectedShop();
            let acumulador = 0;
            if (shop && shop.productos_seleccionados) {
                const products = Object.values(shop.productos_seleccionados);
                products.forEach( (element:any, index, object) => {
                    acumulador += Number(element.cantidad);
                });
            }
            resolve(acumulador);
        });
    }

    getProductsSugested(paramss) {
        console.log('hola');
        let params = new HttpParams()
            .set('token', paramss.token)
            .set('tipo_id', '1') // 1 para traer productos por compania
            .set('dependencia_id', paramss.dependencia_id) // compania_id
            .set('tienda_id', paramss.tienda_id);

        if (paramss.distribuidor_validar_liquidador) {
            params = params.append('distribuidor_validar_liquidador', paramss.distribuidor_validar_liquidador);
        }

        const endpoint = 'getProdXDependenciaV2';
        return this.api.get(endpoint, params, true);
    }

    public setReturn(params) {
        const endpoint = this.api.getEndpoint() + '/setDevolucion?token=' + params.token + '&pedido_id=' + params.pedido_id;
        return this.api.post2(endpoint, params, true);
    }

    private normalizeProductsParamsSetOrder(products: IProduct[]){
        let resProducts = [];
        products.forEach(product => {
            //if (!product.obsequio){
                resProducts.push(
                    {
                        producto_id: Number(product.id),
                        producto_distribuidor_id: Number(product.producto_distribuidor_id),
                        valor: product.valor,
                        valor_original: product.valor_original,
                        cantidad: product.cantidad,
                        unidad_seleccionada: (product.unidad_seleccionada && product.unidad_seleccionada !=="") ? product.unidad_seleccionada : null,
                        lista_precio_id_add: (product.lista_precio_id_add && product.lista_precio_id_add !== null) ? product.lista_precio_id_add : null,
                        regla_apply: (product.regla_apply && product.regla_apply !== null) ? product.regla_apply : null,
                    }
                );
            //}
        });
        return resProducts;
    }

    public getInboice(paramss) {
        const params = new HttpParams()
        .set('token', paramss.token)
        .set('pedido_id', paramss.pedido_id)
        //let endpoint = 'getPdfRecibo';
        let endpoint = this.api.getEndpoint() + 'getPdfRecibo?token=' + paramss.token + '&pedido_id=' + paramss.pedido_id;

        return this.api.post3(endpoint, params, true);
        
    }
    public sendInboce(paramss) {
        const params = new HttpParams()
            .set('token', paramss.token)
            .set('pedido_id', paramss.pedido_id)
        let endpoint = this.api.getEndpoint() + 'sendInboice?token=' + paramss.token + '&pedido_id=' + paramss.pedido_id;
        return this.api.post2(endpoint, params, true);
        
    }

    public setMotivoNoPedidoConArray(params) {
        const endpoint = this.api.getEndpoint() + 'setMotivoNoPedidoConArray?token=' + params.token;
        return this.api.post2(endpoint, params.storageData, true);
    }
}
