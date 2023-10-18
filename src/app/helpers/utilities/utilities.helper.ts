import {EventEmitter, Injectable} from '@angular/core';
import {Shop} from '../../models/Shop';
import {GetOrderAction, SetOrderShopAction} from '../../modules/compartido/pedidos/store/orders.actions';
import {Order} from '../../models/Order';
import {
    CompartidoSeleccionTiendaComponent
} from '../../modules/tendero/compartido/components/compartido-seleccion-tienda/compartido-seleccion-tienda.component';
import {AppState} from '../../store/app.reducer';
import {Store} from '@ngrx/store';
import {AlertController, ModalController, ToastController} from '@ionic/angular';
import {ModalOptions} from '@ionic/core';
import {NavigationHelper} from '../navigation/navigation.helper';
import {Storage} from '@ionic/storage';
import {IUser} from '../../interfaces/IUser';
import {
    RegistroCapturaUbicacionComponent
} from '../../modules/tendero/registro/pages/registro/components/registro-captura-ubicacion/registro-captura-ubicacion.component';
import {IProduct} from 'src/app/interfaces/IProduct';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';

@Injectable({
    providedIn: 'root'
})
export class UtilitiesHelper {
    constructor(
        private store: Store<AppState>,
        private modalController: ModalController,
        private navigation: NavigationHelper,
        private storage: Storage,
        private alertController: AlertController,
        public shopSingletonService: ShopSingletonService,
        private toastController: ToastController) {
    }

    public organizeShopsBySelected(shops: any[], shopSelected?) {
        if (shops.length <= 1) {
            return shops;
        }

        if (shopSelected) {
            for (const shop of shops) {
                shop.selected = false;
                if (shopSelected.id === shop.id) {
                    shop.selected = true;
                }
            }
        }

        shops.sort((a: any, b: any) => {
            return (a === b) ? 0 : a.selected ? -1 : 1;
        });

        return shops;
    }

    async selectShopModal(shops: Shop[]) {
        if (shops.length === 1) {
            return;
        }

        const modal = await this.modalController.create(<ModalOptions>{
            component: CompartidoSeleccionTiendaComponent,
            cssClass: 'filter-modal',
            componentProps: {shops: shops}
        });


        return modal;
    }

    public saveShopsStorage(shop: Shop, user: IUser, shops: Shop[]) {
        return this.storage.get('order').then(async (res) => {
            res = this.orderStorage(res, shop);
            shops = this.organizeShopsBySelected(shops, shop);
            user.tiendas = shops;
            this.storage.set('order', JSON.stringify(res)).then(() => {
            });
            this.storage.set('user', JSON.stringify(user)).then(() => {
            });
        });
    }

    public async capturaUbicacion(user: IUser, shops: Shop[], ruta, goPedidos?: boolean) {
        user.tiendas = this.organizeShopsBySelected(shops);
        const modal = await this.modalController.create(<ModalOptions>{
            component: RegistroCapturaUbicacionComponent,
            componentProps: {user: user}
        });

        modal.onDidDismiss().then((data) => {
            if (data.data.finishProcess) {
                if (goPedidos) {
                    this.goToPedidos(shops[0], user.token);
                } else {
                    this.finishUbication(shops, ruta);
                }
            }
        });

        return await modal.present();
    }

    public finishUbication(shops: Shop[], ruta) {
        const shop = new Shop(shops[0]);
        this.store.dispatch(new SetOrderShopAction(new Order({tienda: shop})));
        this.navigation.goTo(ruta);
    }

    public getFullProductName(product) {
        let r: string;
        product.completeName = '';
        product.completeName += (product.nombre != null) ? (product.nombre + ' ') : '';
        product.completeName += (product.marca != null) ? (product.marca + ' ') : '';
        product.completeName += (product.variante != null) ? (product.variante + ' ') : '';
        product.completeName += (product.presentacion != null) ? (product.presentacion + ' ') : '';
        product.completeName += (product.tamanio != null) ? (product.tamanio + ' ') : '';
        product.completeName += (product.unidad_medida != null) ? (product.unidad_medida + ' ') : '';
        //product.completeName += (product.descripcion != null) ? (product.descripcion + ' ') : '';
        r = product.completeName;
        if (!product.nombre_completo || product.nombre_completo  == "") {
            return r;
        }
        return product.nombre_completo;
    }

    public getFullProductNameMicro(product, shape) {
        let r: string ;
        product.completeName = '';
        product.completeName += (product.name != null) ? (product.name + ' ') : '';
        // product.completeName += (product.marca != null) ? (product.marca + ' ') : '';
        product.completeName += (product.variant != null) ? (product.variant + ' ') : '';
        product.completeName += (product.presentation != null) ? (product.presentation + ' ') : '';
        product.completeName += (product.size != null && product.size !== '0') ? (product.size + ' ') : '';
        // tslint:disable-next-line: max-line-length
        product.completeName += (product.unit_measurement != null && product.unit_measurement !== '0') ? (product.unit_measurement + ' ') : '';
        product.completeName += (product.description != null) ? (product.description + ' ') : '';

        switch (shape) {
            case 'full':
                r = product.completeName;
            break;
            case 'small':
                r = product.completeName.length > 50 ? product.completeName.substring(0, 50) : product.completeName;
            break;
        }
        return r;
    }

    public orderStorage(res, shop, shopSelected?: boolean, restrictiveOffline?: boolean) {
        res = JSON.parse(res);
        res = (res == null) ? [] : res;
        if (shopSelected) {
            shop.selected = true;
        }
        if (res && res.length > 0) {
            res.forEach(e => e.selected = false);
            if (res.some(({id, codigo_cliente}) => (id == shop.id) && (codigo_cliente == shop.codigo_cliente))) {
                res.forEach((e, index) => {
                    if ((e.id == shop.id) && (e.codigo_cliente == shop.codigo_cliente)) {
                        if (!restrictiveOffline) {
                            shop.productos_seleccionados = e.productos_seleccionados;
                        }
                    }
                    res[index] = new Shop(e);
                });
                const indexShopSel = res.findIndex(({id, codigo_cliente}) => (id == shop.id) && (codigo_cliente == shop.codigo_cliente));
                res.splice(indexShopSel, 1);
                res.unshift(shop);
            } else {
                res.unshift(shop);
            }
        } else {
            res.unshift(shop);
        }
        if (shopSelected) {
            shop.selected = true;
        }

        return res;
    }

    async setProductsStorage(shop){
        let res = await this.storage.get('order');
        res = JSON.parse(res);
        if (!res) return shop;
        const indexShopSel = res.findIndex(({ id, codigo_cliente }) => (id == shop.id) && (codigo_cliente == shop.codigo_cliente));
        if (res[indexShopSel] && res[indexShopSel].productos_seleccionados) {
            shop.productos_seleccionados = res[indexShopSel].productos_seleccionados;
        }
        return shop;
    }
    
    async setStatusConflictoStorage(shop, pedido_id?) {
        let res = await this.storage.get('order');
        res = JSON.parse(res);
        if (!res) return;
        const indexShopSel = res.findIndex(({ id, codigo_cliente }) => (id == shop.id) && (codigo_cliente == shop.codigo_cliente));
        if ((res[indexShopSel] && res[indexShopSel].productos_seleccionados) || (res[indexShopSel] && pedido_id)) {
            res[indexShopSel].status_en_conflicto = false;
            if (pedido_id) {
                res[indexShopSel].pedido = pedido_id;
            }
            await this.storage.set('order', JSON.stringify(res));
        }
    }

    public orderStorageWithoutCode(res, shop, shopSelected?: boolean, restrictiveOffline?: boolean) {
        res = JSON.parse(res);
        res = (res == null) ? [] : res;
        if (shopSelected) {
            shop.selected = true;
        }
        if (res && res.length > 0) {
            res.forEach(e => e.selected = false);
            if (res.some(({id}) => (id == shop.id))) {
                res.forEach((e, index) => {
                    if ((e.id == shop.id)) {
                        if (!restrictiveOffline) {
                            shop.productos_seleccionados = e.productos_seleccionados;
                        }
                    }
                    res[index] = new Shop(e);
                });
                const indexShopSel = res.findIndex(({id}) => (id == shop.id));
                res.splice(indexShopSel, 1);
                res.unshift(shop);
            } else {
                res.unshift(shop);
            }
        } else {
            res.unshift(shop);
        }

        return res;
    }

    public goToPedidos(shopService, token, params?) {
        const shop = new Shop(shopService);
        this.store.dispatch(new SetOrderShopAction(new Order({tiendas: [shop]})));
        this.saveShopStorageRedirectOrder(shop, token, params);
    }

    public goToCompanySeller(shopData, token) {
        if (shopData.pedido && (!shopData.productos_seleccionados || Object.keys(shopData.productos_seleccionados).length == 0)) {
            shopData.status_productos_pendientes = false;
        } else if (shopData.pedido && shopData.productos_seleccionados && shopData.status_productos_pendientes) {
            shopData.status_productos_pendientes = true;
        }
        this.shopSingletonService.setSelectedShop(shopData);
        this.shopSingletonService.setStorageSelectedShop(shopData);
        this.store.dispatch(new GetOrderAction(token, shopData.id, () => {
            this.navigation.goToBack('lista-clientes?1', {viewShop: shopData});
        }, shopData.codigo_cliente));
    }

    public orderKartsByPedido(karts: any[]) {
        karts = karts.sort((a, b) => {
            if (a.products && a.products.length > 0 && a.products[0].pedido) {
                return 1;
            }

            if (!a.products || a.products.length == 0 || !a.products[0].pedido) {
                return -1;
            }

            if (b.products && b.products.length > 0 && b.products[0].pedido) {
                return 1;
            }

            if (!b.products || b.products.length == 0 || !b.products[0].pedido) {
                return -1;
            }
        });
        return karts;
    }

    correctStock(product: IProduct) {
        if (product.valida_stock) {
            if (product.inventario > 0 && product.inventario > product.cantidad) {
                return true;
            }
            return false;
        } else {
            return true;
        }
    }

    public async alertOrderOnlyAcceptHandle(message, handle) {
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: [{
                text: 'Aceptar',
                handler: handle
            }, 'Cancelar']
        });

        return alert.present();
    }

    public async alertOrderOnlyWithoutCancel(message, handle) {
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: [{
                text: 'Aceptar',
                handler: handle
            }]
        });

        return alert.present();
    }

    public async alertOrderWithoutHandle(message) {
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: ['Aceptar', 'Cancelar']
        });

        return alert.present();
    }

    public async alertOrderWithoutHandleOneButton(message, txtButton) {
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: [txtButton]
        });

        return alert.present();
    }

    public infoProduct(producto, productos) {
        const product = productos.filter((productItem) => {
            return productItem.pd_id == producto.id;
        });

        if (product.length == 0) {
            return false;
        }

        return {...product[0], ...producto};
    }

    public inforOffer(offer, ofertas, lista_precio_tienda) {
        if (!offer) {
            return null;
        }

        if (!offer.o_id) {
            return null;
        }

        ofertas = ofertas.filter((offerItem) => {
            return offerItem.o_id == offer.o_id && lista_precio_tienda == offerItem.l_p;
        });

        return ofertas.map((oferta) => {
            oferta.descuento = oferta.d;
            oferta.impoconsumo = oferta.im;
            oferta.iva = oferta.iv;
            oferta.lista_precio_id = oferta.l_p;
            oferta.precio = oferta.p;
            oferta.precio_unitario = oferta.p_u;
            oferta.producto_distribuidor_id = oferta.pd_id;
            return oferta;
        });
    }

    public inforPrecio(producto, precios, lista_precio_tienda) {
        if (!producto) {
            return null;
        }

        const precioRes = precios.filter((precioItem) => {
            return precioItem.pd_id == producto.pd_id && lista_precio_tienda == precioItem.l_p;
        });

        if (precioRes.length > 0) {
            return precioRes[0];
        }

        return null;
    }
    
    public infoOfertasEspeciales(ofertas, prod_distri_id,lista_precio_tienda) {
        if (!prod_distri_id || !ofertas) {
            return null;
        }
        let oferta = [];
        if (ofertas) {
            oferta = ofertas.filter((temp) => {
                return temp.pdi == prod_distri_id ;
            });
        }
        if (oferta.length > 0) {
            let reglas_filtradas = oferta[0].reglas.filter( (regla_temp)=> {
                return  regla_temp.lp_id == null || regla_temp.lp_id == lista_precio_tienda  
            });
            if(reglas_filtradas.length > 0){
                oferta[0].reglas = reglas_filtradas;
                oferta = [this.parseOfertasEspeciales(oferta[0])];
                return oferta;
            }else{
                oferta[0].reglas = [];
                return oferta[0]
            }
        }

        return null;
    }

    private parseOfertasEspeciales(oferta){
        let modelo = {
            'activo':oferta.act,
            'tipo_oferta_id':oferta.to_id,
            'datos':oferta.o_dat,
            'descripcion':oferta.des,
            'fecha_fin':oferta.o_ff,
            'fecha_inicio':oferta.o_fi,
            'precio_habitual':oferta.o_ph,
            'producto_distribuidor_id':oferta.pdi,
            'id':oferta.o_id,
            'reglas':this.parseReglasOfertasEspeciales(oferta.reglas),
        }

        return modelo;
    }

    private parseReglasOfertasEspeciales(reglas){
        let to_return = [];

        if(reglas.length > 0){
            reglas.forEach(element => {
                let modelo = {
                    'aplica':element.a,
                    'cadena':element.cad,
                    'cantidad':element.cnt,
                    'codigo_producto_adicional':element.cd_prod_ad,
                    'descuento_tipo':element.des_t,
                    'grupo_tienda_id':element.gt_id,
                    'id':element.r_id,
                    'oferta_id':element.r_o_id,
                    'parametro':element.parm,
                    'prioridad':element.prio,
                    'tipo_oferta':element.to,
                    'valor':element.vlr
                }
                to_return.push(modelo);
            });
        }
        return to_return;
    }

    private saveShopStorageRedirectOrder(shop, token, params) {
        return this.storage.get('order').then(async (res) => {
            res = this.orderStorage(res, shop);
            await this.storage.set('order', JSON.stringify(res)).then(() => {
                if (shop && (!shop.productos_seleccionados || Object.keys(shop.productos_seleccionados).length === 0)) {
                    this.store.dispatch(new GetOrderAction(token, shop.id, () => {
                        this.navigation.goToBack('pedidos', params);
                    }, shop.codigo_cliente));
                } else {
                    this.navigation.goToBack('pedidos', params);
                }
            });
        });
    }

    async presentToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            duration: 3000
        });
        toast.present();
    }

    arrayMove<T>(arr: Array<T>, old_index, new_index): Array<T> {
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    }
}
