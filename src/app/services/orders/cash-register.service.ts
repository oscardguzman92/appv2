import {Injectable} from '@angular/core';
import {
    LoadingOn,
    LoadingOff
} from 'src/app/modules/compartido/general/store/actions/loading.actions';
import {OrdersService} from './orders.service';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {ModalOptions} from '@ionic/core';
import {ToastController, LoadingController, ModalController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {FilterProductsAction} from 'src/app/modules/compartido/pedidos/store/orders.actions';
import {EMPTY, from, interval, Observable, of, pipe, Subscription} from 'rxjs';
import {isArray} from 'util';
import {CompaniesPortfolioShopkeeperService} from './companies-portfolio-shopkeeper.service';
import {IPortfolio} from 'src/app/interfaces/IPortfolio';
import {IProduct} from 'src/app/interfaces/IProduct';
import {TypeKart} from 'src/app/enums/typeKart.enum';
import {OrganizeShopsHelper} from '../../helpers/organizeShops/organizeShops.helper';

import {Geolocation} from '@ionic-native/geolocation/ngx';
import {AlertController} from '@ionic/angular';
import {Device} from '@ionic-native/device/ngx';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {OpenNativeSettings} from '@ionic-native/open-native-settings/ngx';
import { OneSignalService } from '../oneSignal/one-signal.service';
import {ApiService} from '../api/api.service';
import { ShopSingletonService } from '../shops/shop-singleton.service';
import {Roles} from '../../enums/roles.enum';
import {catchError, concatMap, delay, map, tap} from 'rxjs/operators';
import {ModalPedidosEnviadoComponent} from '../../modules/vendedor/compartido/components/modal-pedidos-enviado/modal-pedidos-enviado.component';

@Injectable({
    providedIn: 'root'
})
export class CashRegisterService {
    setOrderSuccess: boolean;
    total: any;
    totalOrderIVA: any;
    totalOrder: any;
    totalImpo: any;
    setOrderSuccessMessage: string;
    setOrderSuccessResponse: any;
    expressOrderActive: boolean;
    expressOrderButtonText: string;
    usu: any;
    role: string;
    token: any;
    distri: any;
    products: any;
    nProducts: number;
    karts: any;
    isOfflineActive: boolean;

    actualShopName: string;
    previusShopName: string;
    lat: number;
    long: number;
    lastAskingTimeCoords: string;
    public offlineSubs = new Subscription();
    totalPts: number;
    total_descuento: number;

    constructor(
        private orderService: OrdersService,
        private store: Store<AppState>,
        private toastController: ToastController,
        private storage: Storage,
        private companiesPortfolioShopkeeperService: CompaniesPortfolioShopkeeperService,
        private organizeShopsHelper: OrganizeShopsHelper,
        private geolocation: Geolocation,
        private device: Device,
        private diagnostic: Diagnostic,
        private nativeSettings: OpenNativeSettings,
        private alertController: AlertController,
        private oneSignal: OneSignalService,
        private api: ApiService,
        private loadingController: LoadingController,
        public shopSingletonService: ShopSingletonService,
        private modalController: ModalController,
    ) {
        // datos de usuario
        this.storage.get('user').then(usu => {
            this.usu = JSON.parse(usu);
            this.token = this.usu.token;
            this.role = this.usu.role;
            if (this.role == 'vendedor') {
                this.distri = this.usu.distribuidor.nombre;
            }
        });

        this.offlineSubs = this.store.select('offline').subscribe(success => {
            this.isOfflineActive = success.active;
        });
    }

    private async presentError(err, handle) {
        const alert = await this.alertController.create({
            header: 'Atención',
            message: err,
            buttons: [{
                text: 'Aceptar',
                handler: handle
            }],
            cssClass: 'attention-alert',
        });

        await alert.present();
    }

    updateShopeName(name: string) {
        if (this.actualShopName == '') {
            this.actualShopName = name;
        } else {
            this.previusShopName = this.actualShopName;
            this.actualShopName = name;
        }

        if (this.actualShopName != this.previusShopName) {
            this.getCoords();
        }
    }

    async getCoords(cb?) {
        const opt = {maximumAge: 30000, enableHighAccuracy: true, timeout: 15000};

        let next = null;

        if (this.device.platform === 'Android' || this.device.platform === 'IOs') {
            next = await this.diagnostic.isLocationEnabled().then((res) => {
                if (res === false) {
                    if (this.role === 'vendedor') {
                        this.presentError('Tienes que activar la ubicación de tu celular. Err. 3', () => {
                            this.nativeSettings.open('location');
                        });
                        if (cb) {
                            cb(false);
                            return false;
                        }
                        return false;
                    } else {
                        return false;
                    }
                }
            }).catch((e) => {
                if (this.role === 'vendedor') {
                    this.presentError(
                        'Error obteniendo la ubicación, verifica que tengas activa la ubicación de tu celular. Err. 3',
                        () => {
                            this.nativeSettings.open('location');
                        }
                    );
                    if (cb) {
                        cb(false);
                        return false;
                    }
                    return false;
                } else {
                    return false;
                }
            });
        }

        if (next === false) {
            return;
        }

        this.geolocation.getCurrentPosition(opt).then((resp) => {
            // this.store.dispatch(new LoadingOff());
            const coor = {
                lat: resp.coords.latitude,
                lng: resp.coords.longitude
            };
            // Crear pedido
            this.lat = coor.lat;
            this.long = coor.lng;
            if (cb) {
                return cb(true);
            }
        }).catch(async (error) => {
            if (this.role === 'vendedor') {
                const message = (error.code === 3) ?
                    'Error obteniendo la ubicación, verifica que tengas activa la ubicación de tu celular. Err.' :
                    'Tienes que permitir la ubicación a storeapp. Err. ';

                this.presentError(message + error.code, () => {
                    this.nativeSettings.open('location');
                });
                if (cb) {
                    cb(false);
                    return false;
                }
                return false;
            } else {
                return;
            }
        });
    }

    updateSellData(descuento?) {
        let r = this.implementUpdateSellData(this.products, descuento);
        return r.total;
    }

    implementUpdateSellData(products?, descuento?, noDelete?) {
        let t: any = {};
        this.totalOrder = 0;
        this.totalOrderIVA = 0;
        this.total = 0;
        this.totalImpo = 0;
        this.totalPts = 0;
        this.total_descuento = 0;
        let valor_descuento_acumulador = 0;
        let nProductsTemp = 0, descuento_oferta_especial = 0, eliminar = 0;
        this.products = products ? products : this.products;
        let es_promocion_especial = false;
        let cajas = 0;
        this.products.forEach((prod) => {
            if (prod.unidad_empaque) {
                prod.unidad_empaque = (prod.unidad_empaque > 0) ? prod.unidad_empaque : 1;
                cajas += prod.cantidad / prod.unidad_empaque;
            }
        });       
        
        this.products.forEach(product => {
            //if (!product.obsequio) {
                if (isNaN(product.precio_unitario)) {
                    product.precio_unitario = product.precio;
                }               
                const validateDescuento = this.aplicarReglas(product, cajas);                     
                if (validateDescuento > 0) {
                    let precio_a =  (+product.precio_unitario * (1 ) * +product.cantidad) - validateDescuento;
                    const descuento_unitario = (validateDescuento/product.cantidad);
                    let valor_desc_real = 0;
                    if( this.distri && this.distri.trim().toLowerCase() !='supermarcas' && this.distri.trim().toLowerCase() !='districomer'){
                        valor_desc_real = (product.precio_unitario - descuento_unitario) * product.cantidad
                        valor_desc_real = precio_a-valor_desc_real;
                    }else{
                        //se modifica para quitar decimales de la oferta 
                        valor_desc_real = (Math.floor(product.precio_unitario - descuento_unitario)) * product.cantidad
                        valor_desc_real = Math.abs(precio_a-valor_desc_real);    
                    }
                    product.valor_descuento_total_especial = (validateDescuento + valor_desc_real);
                    this.total_descuento += (validateDescuento + valor_desc_real);
                }

                product.total = product.total ? product.total : 0;
                product.valor = product.valor ? product.valor : 0;
                product.valor_original = product.valor_original
                    ? product.valor_original
                    : 0;
                /* cambio de medida peso / unid */
                if(product.factor){
                    if(product.unidad_seleccionada != product.unidad_medida){
                        if(product.iva > 0/*  && product.precio_unitario == product.precio */){
                            product.precio_unitario = parseFloat(product.factor_precio)  / (1 + parseFloat(product.iva));
                        }else{
                            product.precio_unitario = parseFloat(product.factor_precio);
                        }
                        product.precio = parseFloat(product.factor_precio);
                    }else{
                        if(product.iva > 0/*  && product.precio_unitario == product.precio */){
                            // para revertir factor se divide;
                            product.precio_unitario = (parseFloat(product.factor_precio) / product.factor) / (1 + parseFloat(product.iva));                            
                        }else{
                            // para revertir factor se divide;
                            product.precio_unitario = parseFloat(product.factor_precio) / product.factor;
                        }
                        product.precio = parseFloat(product.factor_precio) / product.factor;
                    }
                }
                product.total = product.cantidad * +product.precio;
                const descuento = (+product.descuento) > 0 ? (+product.descuento) : 0;

                if (product.valor_descuento_total_especial > 0) {
                    const impo = ((product.impoconsumo) ? product.impoconsumo : 0);
                    const totalUnitario = (+product.precio_unitario * (1 ) * +product.cantidad) - product.valor_descuento_total_especial;
                    this.totalImpo += (+impo * product.cantidad);
                    this.totalOrder += totalUnitario;
                    this.totalOrderIVA += (totalUnitario * +product.iva);
                    this.total += (totalUnitario + (totalUnitario * +product.iva)) + (+impo * product.cantidad);
                } else {
                    const impo = ((product.impoconsumo) ? product.impoconsumo : 0);
                    const totalUnitario = (+product.precio_unitario * (1 ) * +product.cantidad) * (1 - descuento);
                    this.totalOrder += totalUnitario;
                    this.totalImpo += (+impo * product.cantidad);
                    this.totalOrderIVA += (totalUnitario * +product.iva);
                    this.total += product.total;
                }

                let pts = (product.puntaje_asignar != null) ? product.puntaje_asignar : 0 ;
                this.totalPts += this.calcularPts(product);
                t.tsindes = this.total;
                product.valor = (
                    parseInt(product.total) / product.cantidad
                ).toString();
                product.valor_original = product.valor;
                nProductsTemp += product.cantidad;

                valor_descuento_acumulador = (+product.valor_descuento > 0) ? valor_descuento_acumulador + +product.valor_descuento : valor_descuento_acumulador + (+product.valor * +product.cantidad);
            //}
        });
        this.nProducts = nProductsTemp;
        t.totalOrder = this.totalOrder;
        if (noDelete) {
            eliminar = 0;
        }
        t.total = (this.total - eliminar);
        //se remueven los decimales de las ofertas especiales
        if(this.total_descuento>0){
            this.total = parseInt(this.total);
            t.total = parseInt(t.total);
        }
        t.totalOrderIVA = this.totalOrderIVA;//( (this.total - this.totalOrder) < 0 )?0:this.total - this.totalOrder;
        t.nProducts = Number(this.nProducts);
        t.totalPts = this.totalPts;
        t.descuento_oferta_especial = descuento_oferta_especial;
        t.total_descuento = this.total_descuento;
        t.totalImpo = this.totalImpo;
        if (descuento_oferta_especial > 0 ) {
            t.total = valor_descuento_acumulador;
        }

        return t;
    }

    implementUpdateSellDataViejo(products?) {
        let t: any = {};
        this.totalOrder = 0;
        this.totalOrderIVA = 0;
        this.total = 0;
        let nProductsTemp = 0;
        this.products = products ? products : this.products;
        this.products.forEach(value => {
            if (
                value.ofertas &&
                isArray(value.ofertas) &&
                value.ofertas.length > 0
            ) {
                value.precio_unitario = value.ofertas[0].precio_unitario
                    ? value.ofertas[0].precio_unitario
                    : value.ofertas[0].precio;
                value.precio = value.ofertas[0].precio;
            } else {
                value.precio_unitario = value.precio_unitario
                    ? value.precio_unitario
                    : value.precio;
            }

            if (isNaN(value.precio_unitario)) {
                value.precio_unitario = value.precio;
            }
            value.total = value.total ? value.total : 0;
            value.valor = value.valor ? value.valor : 0;
            value.valor_original = value.valor_original
                ? value.valor_original
                : 0;

            if (+value.precio < +value.precio_unitario) {
                value.precio_unitario = value.precio;
            }

            // aplica descuento
            value.total = value.cantidad * +value.precio;
            this.totalOrder = this.totalOrder + value.total;
            //let iva = value.total * +value.iva;
            let iva = +value.precio * value.cantidad - value.total;

            this.totalOrderIVA = this.totalOrderIVA + iva;
            this.total = this.total + value.total + iva;

            t.tsindes = this.total;

            value.valor = (parseInt(value.total) / value.cantidad).toString();
            value.valor_original = (
                parseInt(value.total) / value.cantidad
            ).toString();
            nProductsTemp += value.cantidad;
        });
        this.nProducts = nProductsTemp;
        t.totalOrder = this.totalOrder;
        t.totalOrderIVA = this.totalOrderIVA;
        t.total = this.total;
        t.nProducts = this.nProducts;
        

        return t;
    }

    async getPlayerId(){
        return await this.oneSignal.getId();
    }

    setOrder(products, shopData?, en_conflicto = false, pedido_sin_conexion = false, token = null, not_toast = false) {
        this.products = products;
        let total = this.updateSellData();
        /* this.loadingController.getTop().then(loading => {
            if (!loading) {
                this.store.dispatch(new LoadingOn());
            }
        }); */

        let params:any = {
            tienda_id: '',
            confirmado: null,
            codigo_cliente: '',
            latitud: '',
            longitud: '',
            valor_total_original: total,
            valor_total: total,
            productos: products,
            player_id: this.oneSignal.player_id,
            token: (token !== null) ? token : this.token,
            validar_ped_conflicto: true,
        };
        if (en_conflicto) {
            params.en_conflicto = true;
        }
        if (pedido_sin_conexion) {
            params.pedido_sin_conexion = true;
        }
        if (shopData) {
            params.tienda_id = shopData.id;
            params.codigo_cliente = shopData.codigo_cliente;
            params.latitud = shopData.latitud;
            params.longitud = shopData.longitud;
        }

        if (this.role == 'vendedor') {
            if (this.lat) {
                params.latitud = this.lat.toString();
                params.longitud = this.long.toString();
            }

            if (Math.floor(total) < this.usu.distribuidor.valor_minimo_compra) {
                if (!not_toast) {
                    this.presentToastWithOptions(
                        'El pedido no supera el monto mínimo de $' +
                        this.usu.distribuidor.valor_minimo_compra
                    ).then(() => {
                        this.store.dispatch(new LoadingOff());
                    });
                }
                return of(false);
            }
            let resSetOrder = this.orderService.setOrder(params);
            resSetOrder
                .pipe(
                    map((res: any) => {
                        if (res.status === 'error') throw res;
                        return res;
                    })
                )
                .pipe(
                    catchError(async (err) => {
                        if (err.code === 30) { // En conflicto
                            this.setConflicto(shopData).then();
                            shopData.status_en_conflicto = true;
                            return of(null);
                        }
                        return of(null);
                    })
            ).subscribe(res => {
                console.log(res);
            });
            return resSetOrder;
        } else {
            return this.orderService.setOrder(params);
        }
    }

    async presentToastWithOptions(message: string, time: number = 3000) {
        const toast = await this.toastController.create({
            message: message,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            duration: time
        });
        toast.present();
    }

    // clean array of selected products
    clearSelectedOrder(shop, message, clearAll?, cb?) {
        if (clearAll) {
            let a;
            return this.storage.get('order').then(res => {
                a = JSON.parse(res);
                let b = 0;
                a.forEach((element, index, object) => {
                    b++;
                    element.status_productos_pendientes = false;
                    element.productos_seleccionados = {};
                    delete element.productos_seleccionados;
                });
                message = 'Se descartaron ' + b + ' pedidos pendientes por enviar.';
                return this.storage.set('order', JSON.stringify(a)).then(() => {
                    if (cb) {
                        cb();
                    }
                    this.presentToastWithOptions(message);
                });
            });
        }
        return this.storage.get('order').then(res => {
            res = JSON.parse(res);
            res[0].selected = false;
            res.forEach(async (element, index, object) => {
                if (element.id == shop.id) {
                    res[index].status_productos_pendientes = false;
                    res[index].productos_seleccionados = {};
                    delete element.productos_seleccionados;

                    element.selected = true;
                    res = this.organizeShopsHelper.organizeShopsBySelected(
                        object
                    );
                    if (message) {
                        this.presentToastWithOptions(message);
                    }

                    if (res[index] === undefined) {
                        res = [];
                    }

                    await this.storage
                        .set('order', JSON.stringify(res))
                        .then(() => {
                            if (cb) {
                                cb();
                            }
                            if (res.length > 0) {
                                this.store.dispatch(
                                    new FilterProductsAction(
                                        res[index].productos_seleccionados
                                    )
                                );
                            }
                        });
                }
            });
        });
    }

    getOrderValue(cb) {
        let shop = this.shopSingletonService.getSelectedShop();
        this.products = !shop || !shop.productos_seleccionados
            ? []
            : Object.values(shop.productos_seleccionados);
        let a = this.updateSellData(true);
        return cb(a);
    }

    getOrderValueByPortfolioOrCompany(cb) {
        let shop = this.shopSingletonService.getSelectedShop();
        let allProducts = !shop.productos_seleccionados
            ? []
            : Object.values(shop.productos_seleccionados);
        let kartTemp: {
            tipoCarro?: any;
            portafolio?: String;
            compania_id?: number;
            productos?: IProduct[];
            total?: any;
        };
        let karts: Array<{
            tipoCarro?: any;
            portafolio?: String;
            compania_id?: number;
            productos?: IProduct[];
            total?: any;
        }> = [];
        allProducts.forEach((producto: IProduct, index, object) => {
            let portfolio: IPortfolio;
            if (producto.portafolio) {
                portfolio = this.companiesPortfolioShopkeeperService.searchByPortfolio(
                    producto.portafolio
                );
            } else {
                portfolio = this.companiesPortfolioShopkeeperService.searchInPortfolio(
                    producto.compania_id
                );
            }
            kartTemp = {};
            if (portfolio) {
                // portafolio
                kartTemp.tipoCarro = TypeKart.portfolio;
                kartTemp.portafolio = portfolio.portafolio;
                kartTemp.productos = [];
            } else {
                // Compañía
                kartTemp.tipoCarro = TypeKart.company;
                kartTemp.compania_id = producto.compania_id;
                kartTemp.productos = [];
            }
            let indexKart = karts.findIndex(
                k =>
                    (k.tipoCarro == kartTemp.tipoCarro &&
                        (k.tipoCarro == TypeKart.portfolio &&
                            k.portafolio == kartTemp.portafolio)) ||
                    (k.tipoCarro == kartTemp.tipoCarro &&
                        (k.tipoCarro == TypeKart.company &&
                            k.compania_id == kartTemp.compania_id))
            );

            if (indexKart === -1) {
                kartTemp.productos.push(producto);
                karts.push(kartTemp);
            } else {
                karts[indexKart].productos.push(producto);
            }
        });
        karts.forEach((kart, index, object) => {
            let r = this.implementUpdateSellData(kart.productos, true);
            kart.total = r.total;
        });
        return cb(karts);
    }

    async sendAllOrders(online, cbFinish?, token = null) {
        const exitosos: any[] = [];
        const enConflicto: any[] = [];
        const noEnviados: any[] = [];
        const noEnviadosMonto: any[] = [];
        const promises: any[] = [];
        let res = await this.storage.get('order');
        res = JSON.parse(res);
        res = res.filter(function (item) {
            return item.productos_seleccionados && Object.keys(item.productos_seleccionados).length > 0;
        });

        res.forEach((item) => {
            const shopData = {
                activo: item.activo,
                barrio: item.barrio,
                cedula_distribuidor: item.cedula_distribuidor,
                ciudad_id: item.ciudad_id,
                codigo_cliente: item.codigo_cliente,
                dia: item.dia,
                direccion: item.direccion,
                distribuidor_id: item.distribuidor_id,
                id: item.id,
                latitud: item.latitud,
                longitud: item.longitud,
                no_pedido: item.no_pedido,
                nombre_contacto: item.nombre_contacto,
                nombre_tienda: item.nombre_tienda,
                orden: item.orden,
                pedido: item.pedido,
                status_productos_pendientes: item.status_productos_pendientes,
                telefono_contacto: item.telefono_contacto,
                productos_seleccionados: Object.values(item.productos_seleccionados)
            };
            promises.push(shopData)
        });

        this.store.dispatch(new LoadingOn());
        let currentShop = null;
        return from(promises)
            .pipe(
                concatMap(shop =>
                    this.setOrder(shop.productos_seleccionados, shop, false, true, token, true)
                        .pipe(
                            tap(() => currentShop = shop)
                        )
                        .pipe(
                            map((res: any) => {
                                if (res === false) {
                                    throw({
                                        content: {
                                            error: 'El pedido no supera el monto mínimo de $' +  this.usu.distribuidor.valor_minimo_compra,
                                        },
                                        code: 1002
                                    });
                                }

                                if (res.status === 'ok' && res.code === 0) {
                                    return res.content;
                                }
                                throw(res);
                            })
                        )
                        .pipe(
                            catchError(async (err: any) => {
                                if (err.code === 30) { // En conflicto
                                    this.setConflicto(currentShop);
                                    currentShop.status_en_conflicto = true;
                                    enConflicto.push({
                                        shop: currentShop
                                    });
                                    return EMPTY;
                                }

                                if (err.code === 1002) { // Monto minimo no alcanzado
                                    noEnviadosMonto.push({
                                        shop: currentShop
                                    });
                                    return EMPTY;
                                }

                                if (err.code === 2) { // Error al insertar
                                    noEnviados.push({
                                        shop: currentShop,
                                        message: 'Hubo un error al insertar el pedido del cod cliente '+ currentShop.codigo_cliente+', intente nuevamente o comuniquese con soporte técnico.'
                                    });
                                    return EMPTY;
                                }

                                if (err.content.error) {
                                    noEnviados.push({
                                        shop: currentShop,
                                        message: this.presentToastWithOptions(err.content.error)
                                    });
                                    return EMPTY;
                                }

                                if(typeof err.content === 'string'){
                                    noEnviados.push({
                                        shop: currentShop,
                                        message: this.presentToastWithOptions(err.content)
                                    });
                                    return EMPTY;
                                }

                                noEnviados.push({
                                    shop: currentShop,
                                    message: this.presentToastWithOptions(err.content[0].error)
                                });
                                return EMPTY;
                            })
                        )
                ),

            )
            .subscribe(async (success: any) => {
                if (!success.pedido_id) {
                    const index = promises.findIndex((shopSearch) => shopSearch.id == currentShop.id);
                    if (index == (promises.length -1)) {
                        this.sendAllOrdersFinish(exitosos, enConflicto, noEnviados, noEnviadosMonto, cbFinish)
                    }
                    return;
                }
                const message = 'El pedido #' + success.pedido_id + ' ha sido realizado. se enviará al sistema ' + success.fecha_envio;
                currentShop.pedido = success.pedido_id;
                exitosos.push(message);

                this.setPedido(currentShop, success.pedido_id, promises)
                    .then((index) => {
                        if (index == (promises.length -1)) {
                            this.sendAllOrdersFinish(exitosos, enConflicto, noEnviados, noEnviadosMonto, cbFinish)
                        }
                    });
            });
    }

    async setConflicto(shop) {
        let json = await this.storage.get('order');
        json = JSON.parse(json);
        json.forEach(async (element, index) => {
            if (element.id == shop.id) {
                json[index].status_en_conflicto = true;
                await this.storage.set('order', JSON.stringify(json));
                this.shopSingletonService.publishShopsRefresh({});
                return;
            }
        });
        
    }

    setPedido(shop, pedido_id, promises) {
        return this.storage.get('user')
            .then(json => {
                json = JSON.parse(json);
                if (!json.tiendas) {
                    return;
                }

                let index = 0;
                for (const element of json.tiendas) {
                    if (element.id == shop.id) {
                        json.tiendas[index].pedido = pedido_id;
                    }
                    index ++;
                }

                return this.storage.set('user', JSON.stringify(json));
            })
            .then(() => {
                return this.clearShop(shop);
            })
            .then(() => {
                return promises.findIndex((shopSearch) => shopSearch.id == shop.id);
            })
    }

    clearShop(shop) {
        return this.storage.get('order').then(res => {
            res = JSON.parse(res);
            res[0].selected = false;
            let index = 0;
            for (const element of res) {
                if (element.id == shop.id) {
                    res[index].status_productos_pendientes = false;
                    res[index].productos_seleccionados = {};
                    delete element.productos_seleccionados;

                    element.selected = true;
                    res = this.organizeShopsHelper.organizeShopsBySelected(res);
                    if (res[index] === undefined) {
                        res = [];
                    }
                }

                index++;
            }
            return this.storage.set('order', JSON.stringify(res))
        });
    }

    sendAllOrdersFinish(exitosos, enConflicto, noEnviados, noEnviadosMonto, cbFinish) {
        if (noEnviados.length == 0 && enConflicto.length == 0 && noEnviadosMonto.length == 0) {
            if (exitosos.length > 0) {
                const mensaje =
                    exitosos.length === 1
                        ? 'Se envió el pedido correctamente.'
                        : 'Se enviaron ' + exitosos.length + ' pedidos correctamente.';

                this.presentToastWithOptions(mensaje, 0);
            }
            cbFinish();
            return;
        }
        this.modalPedidosEnviados(exitosos, noEnviados, enConflicto, noEnviadosMonto);
        cbFinish();
    }

    async modalPedidosEnviados(exitosos, noEnviados, enConflicto, noEnviadosMonto) {
        let classCss = ['modal-enviados', 'auto-height'];

        if (noEnviados.length == 0 && enConflicto.length == 0 && noEnviadosMonto.length == 0) {
            classCss.push('solo-enviados');
        }

        const modal = await this.modalController.create(<ModalOptions>{
            component: ModalPedidosEnviadoComponent,
            cssClass: classCss,
            componentProps: {
                exitosos,
                noEnviados,
                enConflicto,
                noEnviadosMonto
            },
        });

        return await modal.present();
    }

    async checkAlredyOrder(cb){
        await this.storage.get('alredyOrder').then(res => {
            res = JSON.parse(res);
            if(!res){
                res=false;  
            }
            if(cb){
                return cb(res);   
            }
        });
    }

    async setAlredyOrder(){
        await this.storage.set('alredyOrder',true);
    }

    async clearAlredyOrder() {
        await this.storage.remove("alredyOrder");
    }
    async setRedPointBaloon(cb){
        let products:any = false;
        let tienda: any = false;
        tienda = this.shopSingletonService.getSelectedShop();
        products = !tienda || !tienda.productos_seleccionados
        ? false
        : Object.values(tienda.productos_seleccionados);
        //cliente
        if (this.usu.role == "cliente" && products){
            let r = ( products && products[0] && products[0].pedido) ? true : false;
            if(r){
                this.setAlredyOrder();
            }else{
                this.clearAlredyOrder();
            }
            return cb(r);
        } else if (this.usu.role != "cliente" && tienda ){
            let r = (tienda.pedido) ? true : false;
            if (r) {
                this.setAlredyOrder();
            } else {
                this.clearAlredyOrder();
            }
            return cb(r);
        }else{
            this.clearAlredyOrder();
            return cb(false);
        }

    }

    updateCustomOrden(params){
        params.token = this.token;
        return this.api.get('setCustomOrderInVendedorTienda', params, true);
    }

    calcularPts(product:IProduct){
        let precio = product.precio;
        let cantidad = product.cantidad;
        let ptsAsignar = parseInt(product.puntaje_asignar); //cuntos pts asigna si se llega al monto 
        let valorCompra = parseInt(product.valor_compra);//cuanto debe comprar en $ para asingar los pts
        let r = 0;
        if(!valorCompra || !ptsAsignar) {
            return r; 
        }
        if (precio * cantidad >= valorCompra){
            r = Math.floor(precio * cantidad / valorCompra) * ptsAsignar;
        }      
        return r;
    }

    aplicarReglas(product, cajas?): any {
        let reglas = [];
        let descuento = 0;
        if ((product.es_ofe_especial || product.oferta_especial)  && product.reglas_ofe && product.reglas_ofe.length > 0) {
            reglas = product.reglas_ofe;
        } else if ((product.es_ofe_especial || product.oferta_especial) && product.ofertas_reglas && product.ofertas_reglas[0] &&
            product.ofertas_reglas[0].reglas && product.ofertas_reglas[0].reglas.length > 0) {
            reglas = product.ofertas_reglas[0].reglas;
        }

        reglas.sort( this.compare );

        for (const regla of reglas) {
            const apply = this.aplicarDescuento(product, regla, descuento, cajas);
            if (regla.tipo_oferta == 'lista-precio' && descuento <= 0) {
                product.valor_descuento_total_especial = 0;
            }
            if(apply){
                const continueReglas = apply[0];
                descuento = apply[1] as number;
                if (!continueReglas) {
                    break;
                }
            }
        }
        return descuento;
    }

    private aplicarDescuento(product, regla?, descuento = 0, cajas?) {
        if (!regla) {
            return [true, descuento];
        }
        if (regla.tipo_oferta == 'escala') {
            if (!this.validateEscala(regla, product)) {
                return [true, descuento];
            }

            if (regla.descuento_tipo == 'dinero') {
                descuento += +regla.valor;
            }

            if (regla.descuento_tipo == 'porcentaje') {
                if (regla.aplica == 'totalCompra') {
                    let shop = this.shopSingletonService.getSelectedShop(), total = 0;
                    const products = Object.values(shop.productos_seleccionados);
                    products.forEach(function (productItem: any) {
                        if (productItem.total > 0 && productItem.distribuidor_id == product.distribuidor_id) {
                            total += (productItem.cantidad * productItem.precio_unitario);
                        }
                    });

                    descuento += (+total - (regla.cadena ? descuento : 0)) * +regla.valor;
                }

                if (regla.aplica == 'referencia') {
                    const valor = (product.cantidad * product.precio_unitario) - (regla.cadena ? descuento : 0);
                    descuento += valor * +regla.valor;
                }
            }

            return [!regla.oferta_unica, descuento];
        }

        if (regla.tipo_oferta == 'lista-precio') {
            if (!this.validateEscalaParams(regla, cajas)) {
                product.lista_precio_id_add = null;
                product.regla_apply = null;
                return [true, descuento];
            }

            if (regla.descuento_tipo == 'dinero') {
                descuento += (+product.precio_unitario - (+regla.valor)) * product.cantidad;
                product.lista_precio_id_add = regla.lista_precio_id_add;
                product.regla_apply = JSON.stringify(regla);
            }

            return [!regla.oferta_unica, descuento];
        }

        if (regla.tipo_oferta == 'lineal') {
            if (regla.descuento_tipo == 'dinero') {
                descuento += (+regla.valor * + product.cantidad);
            }

            if (regla.descuento_tipo == 'porcentaje') {
                const valor = (product.cantidad * product.precio_unitario) - (regla.cadena ? descuento : 0);
                descuento +=  valor * +regla.valor;
            }

            return [!regla.oferta_unica, descuento];
        }

        if (regla.tipo_oferta == 'producto') {
            if (!this.validateEscala(regla, product)) {
                return [true, descuento];
            }
        }
    }

    private validateEscala(regla, product) {
        if (regla.parametro == 'mayor') {
            if (product.cantidad <= regla.cantidad){
                return false;
            }
            return true;
        }

        if (regla.parametro == 'mayorIgual') {
            if (product.cantidad < regla.cantidad){
                return false;
            }
            return true;
        }

        return false;
    }

    private validateEscalaParams(regla, cantidad) {
        if (regla.parametro == 'mayor') {
            if (cantidad <= regla.cantidad){
                return false;
            }
            return true;
        }

        if (regla.parametro == 'mayorIgual') {
            if (cantidad < regla.cantidad){
                return false;
            }
            return true;
        }

        return false;
    }

    compare( a, b ) {
        if ( a.prioridad < b.prioridad ){
          return -1;
        }
        if ( a.prioridad > b.prioridad ){
          return 1;
        }
        return 0;
    }

    compuestos(prevData: number, product: IProduct, user: any): boolean {
        const {
            productos_compuestos: compuestos
        } = product.producto || {productos_compuestos: []};

        if (user.role == Roles.seller) {
            if (!user.distribuidor.pedidos_compuestos_sin_stock && compuestos.length > 0) {
                if (!this.verificarCompuestos(compuestos, prevData, product)) {
                    return false;
                }
            }
        }

        if (user.role == Roles.shopkeeper) {
            if (!product.pedidos_compuestos_sin_stock && compuestos.length > 0) {
                if (!this.verificarCompuestos(compuestos, prevData, product)) {
                    return false;
                }
            }
        }

        return true;
    }

    verificarCompuestos(products: Array<{inventario: number, pivot: {cantidad: number}}>, prevData: number, productItem: IProduct): boolean {
        for (const product of products) {
            const diferencia = product.pivot.cantidad * productItem.cantidad;
            if (diferencia > product.inventario) {
                productItem.cantidad = prevData;
                return false;
            }
        }
        return true;
    }
}
