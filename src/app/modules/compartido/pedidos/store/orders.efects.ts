import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap, tap, mapTo} from 'rxjs/operators';
import {ApiService} from 'src/app/services/api/api.service';
import {HttpParams} from '@angular/common/http';
import {of, TimeoutError} from 'rxjs';
import {Fail} from '../../../compartido/general/store/actions/error.actions';
import {LoadingOff, LoadingOn} from '../../../compartido/general/store/actions/loading.actions';
import {AppState} from '../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {Storage} from '@ionic/storage';
import {
    GET_CATEGORIES,
    GetCategoriesAction,
    SetCategoriesAction,
    GET_PRODUCTS,
    GetProductsAction,
    SetProductsAction,
    GET_ORDER,
    GetOrderAction,
    FILTER_PRODUCTS,
    FilterProductsAction,
    CountProductsOrderAction,
    GetSearchProductsAction,
    GET_SEARCH_PRODUCTS,
    SetSearchProductsAction,
    GET_FAVORITES_ORDERS,
    GetFavoritesOrders,
    SetFavoritesOrders,
    GET_BRANDS,
    GetBrandsAction,
    SetBrandsAction,
    GET_STATUS_PRODUCT_BY_SHOP,
    GetStatusProductByShopAction,
    SetStatusProductByShopAction,
    GetOrderDetailAction,
    GET_ORDER_DETAIL
} from './orders.actions';
import {IProduct} from 'src/app/interfaces/IProduct';
import {CompaniesPortfolioShopkeeperService} from 'src/app/services/orders/companies-portfolio-shopkeeper.service';
import {IPortfolio} from 'src/app/interfaces/IPortfolio';
import {SetOfflineDynamicAction} from '../../../vendedor/compartido/store/offlineDynamic/offlineDynamic.actions';
import {CacheService} from 'ionic-cache';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import {AuthService} from '../../../../services/auth/auth.service';
import {Roles} from '../../../../enums/roles.enum';
import {LoadingController} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class OrdersEffect {
    public productsList: IProduct[] = [];
    public orderProductsTemp: any;
    paginateProducts: any;

    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>,
        private companiesPortfolioShopkeeperService: CompaniesPortfolioShopkeeperService,
        private storage: Storage,
        private cache: CacheService,
        private loadingController: LoadingController,
        private shopSingletonService: ShopSingletonService,
        private auth: AuthService
    ) {
    }

    @Effect()
    getCategories$ = this.actions$.pipe(
        ofType(GET_CATEGORIES),
        mergeMap((action: GetCategoriesAction) => {
            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    tienda_id: String(action.tienda_id)
                }
            });
            this.productsList = [];
            this.paginateProducts = null;
            let company_id = '';
            let distribuidor_id = '';
            let portafolio = '';
            if (action.compania_id && !action.distribuidor_id) {
                company_id = '&compania_id=' + action.compania_id;
            }
            if (action.distribuidor_id) {
                distribuidor_id = '&distribuidor_id=' + action.distribuidor_id;
            }
            if (action.portafolio) {
                portafolio = '&portafolio=' + action.portafolio;
            }
            let refresh: boolean = (action.callbackEvent) ? true : false;
            let endPoint = (action.tipo_id == 2) ? 'getMarcas' : 'getCategorias';
            return this.apiService.get(endPoint + '?' + action.tienda_id + '-' + action.compania_id + company_id + distribuidor_id + portafolio, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        if (action.callbackEvent) {
                            action.callbackEvent.target.complete();
                        }
                        throw(res);
                    })
                    ).pipe(
                        map(categories => {
                            if (action.callbackEvent) {
                                action.callbackEvent.target.complete();
                            }
                            return new SetCategoriesAction(categories);
                        })
                        ).pipe(
                            catchError((error) => {
                                if (action.callbackEvent && action.callbackEvent.target ) {
                            action.callbackEvent.target.complete();
                        }
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getBrands$ = this.actions$.pipe(
        ofType(GET_BRANDS),
        mergeMap((action: GetBrandsAction) => {
            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    tienda_id: String(action.tienda_id)
                }
            });
            return this.apiService.get('getMarcas?', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                    ).pipe(
                        map(res => {
                            return new SetBrandsAction(res.content, res.productosDestacados);
                        })
                        ).pipe(
                            catchError((error): any => {
                        if (error instanceof TimeoutError) {
                            this.store.dispatch(new Fail({mensaje: 'Modo sin conexión activo'}));
                            return of(new SetOfflineDynamicAction(true));
                        }

                        if (error.statusText === 'Unknown Error') {
                            return this.cache.getItem('offlineDynamic')
                                .then((res) => {
                                    this.store.dispatch(new SetOfflineDynamicAction(true));
                                    this.store.dispatch(new LoadingOff());
                                    return new Fail({mensaje: 'Modo sin conexión activo'});
                                }, err => {
                                    this.store.dispatch(new LoadingOff());
                                    return new Fail({mensaje: 'No hay marcas disponibles'})
                                });
                        }
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getSearchProducts$ = this.actions$.pipe(
        ofType(GET_SEARCH_PRODUCTS),
        mergeMap((action: GetSearchProductsAction) => {
            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    tienda_id: String(action.tienda_id),
                    buscar: action.search,
                    page: String(action.page),

                }
            });
            let company_id = '';
            let distribuidor_id = '';
            let portafolio = '';
            let product_id = '';
            if (action.compania_id && !action.distribuidor_id) {
                company_id = '&compania_id=' + action.compania_id;
            }
            if (action.distribuidor_id) {
                distribuidor_id = '&distribuidor_id=' + action.distribuidor_id;
            }
            if (action.portafolio) {
                portafolio = '&portafolio=' + action.portafolio;
            }
            if (action.product_id) {
                product_id = '&product_id=' + action.product_id;
            }
            return this.apiService.get('getBusquedaV2?' + action.tienda_id + '-' + action.search + '-' + action.page + company_id + distribuidor_id + portafolio+ product_id, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            const data = res.content.productos.data;
                            const paginateProductsTemp = res.content.productos;
                            delete paginateProductsTemp.data;
                            this.paginateProducts = paginateProductsTemp;
                            return data;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(products => {
                        return new SetSearchProductsAction(products, this.paginateProducts);
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        this.store.dispatch(new SetSearchProductsAction([], null, true))
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({dispatch: false})
    getProducts$ = this.actions$.pipe(
        ofType(GET_PRODUCTS),
        mergeMap((action: GetProductsAction) => {
            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    tienda_id: String(action.tienda_id),
                    dependencia_id: String(action.category_id),
                    categoria_id: String(action.category_id),
                    tipo_id: String(action.tipo_id),
                    page: String(action.page),
                }
            });
            let company_id = '';
            let distribuidor_id = '';
            let portafolio = '';
            let limit = '&limit=40';
            if (action.compania_id && !action.distribuidor_id) {
                company_id = '&compania_id=' + action.compania_id;
            }
            if (action.distribuidor_id) {
                distribuidor_id = '&distribuidor_id=' + action.distribuidor_id;
            }
            if (action.portafolio) {
                portafolio = '&portafolio=' + action.portafolio;
            }
            if (action.limit) {
                limit = '&limit=' + action.limit;
            }
            let endPoint = (action.tipo_id == 2) ? 'getProdXDependenciaV2' : 'getProdXCategoriaV2';
            this.loadingController.getTop().then(loading => {
                if (!loading) {
                    this.store.dispatch(new LoadingOn(true));
                }
            });
            return this.apiService.get(endPoint + '?' + action.tienda_id + '-' + action.category_id + '-' + action.page + company_id + distribuidor_id + portafolio + limit, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            const data = res.content.productos.data;
                            const paginateProductsTemp = res.content.productos;
                            delete paginateProductsTemp.data;
                            this.paginateProducts = paginateProductsTemp;
                            return data;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(products => {
                        if (typeof products === 'object') {
                            products = Object.values(products);
                        }
                        this.store.dispatch(new LoadingOff());
                        this.store.dispatch(new SetProductsAction(products, action.productos_selecionados, action.category_id, this.paginateProducts));
                    })
                ).pipe(
                    catchError((error): any => {
                        this.store.dispatch(new LoadingOff());
                        if (error instanceof TimeoutError) {
                            if (action.role == Roles.shopkeeper) {
                                this.store.dispatch(new SetProductsAction([], [], null, null, true));
                                this.store.dispatch(new Fail({
                                    mensaje: 'Ha ocurrido un error consultando la categoría, intenta más tarde o consulta otra categoría',
                                    withoutLoading: true
                                }));
                                return;
                            }

                            if (action.role == Roles.seller) {
                                this.store.dispatch(new SetOfflineDynamicAction(true));
                                this.store.dispatch(new Fail({mensaje: 'Modo sin conexión activo'}));
                                return of(new Fail(error));
                            }
                            this.store.dispatch(new SetOfflineDynamicAction(true));
                            return of(new Fail(error));
                        }

                        if (error.statusText === 'Unknown Error') {
                            this.cache.getItem('offlineDynamic')
                                .then((res) => {
                                    if (action.role == Roles.seller) {
                                        this.store.dispatch(new SetOfflineDynamicAction(true));
                                        this.store.dispatch(new Fail({mensaje: 'Modo sin conexión activo'}));
                                        return;
                                    }
                                    this.store.dispatch(new SetOfflineDynamicAction(true));
                                });
                            return of(new Fail(error));
                        }

                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({dispatch: false})
    getOrder$ = this.actions$.pipe(
        ofType(GET_ORDER),
        mergeMap((action: GetOrderAction) => {
            let pedido = null;
            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    tienda_id: String(action.tienda_id),
                    activo: 'true'
                }
            });
            const cod_cliente = (action.codigo_cliente) ? '?codigo_cliente=' + action.codigo_cliente : '';
            return this.apiService.get('getPedido' + cod_cliente, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res) => {
                        res.forEach(order => {
                            let portafolio: IPortfolio;
                            if (!order.vendedor_id) {
                                portafolio = this.companiesPortfolioShopkeeperService.searchInPortfolio(order.compania_id);
                                if (portafolio) {
                                    order.vendedor_id = portafolio.portafolio;
                                }
                            }
                            order.productos.forEach(product => {
                                product.pedido = order.id;
                                pedido = order.id;
                                if (order.vendedor_id) {
                                    product.portafolio = order.vendedor_id;
                                }
                            });
                        });
                        return res;
                    })
                ).pipe(
                    map(orderProductsRes => {
                        if (orderProductsRes && orderProductsRes.length > 0) {
                            const productsObj = {};
                            orderProductsRes.forEach(orderServ => {
                                const orderProducts = orderServ.productos;
                                orderProducts.reduce(function (acc, cur, i) {
                                    if (cur.oferta_especial && +cur.descuento > 0) {
                                        cur.precio = ((+cur.precio_unitario * (1 + +cur.iva)));
                                    }
                                    if (orderServ.fecha_entrega) {
                                        cur.fecha_entrega = orderServ.fecha_entrega;
                                    }

                                    if (orderServ.descuento_oferta_especial > 0 && +cur.descuento_oferta_especial == 0) {
                                        cur.descuento_oferta_especial = orderServ.descuento_oferta_especial;
                                    } else if (cur.descuento_oferta_especial > 0) {
                                        cur.oferta_por_producto = true;
                                        cur.descuento_suma_productos_especial = cur.descuento_oferta_especial;
                                    }

                                    if (cur.oferta_especial && +cur.descuento > 0) {
                                        const precio = ((+cur.precio_unitario * (1 + +cur.iva)));
                                        cur.descuento_suma_productos_lineal = (+precio * +cur.descuento);
                                    }
                                    productsObj[cur.id] = cur;
                                    return acc;
                                }, {});
                            });
                            if (Object.keys(productsObj).length > 0) {
                                this.saveProductsSelected(productsObj, action.callback, pedido);
                                return;
                            }
                        }

                        if (orderProductsRes && orderProductsRes.length == 0) {
                            this.clearProductsSelected();
                        }

                        if (action.callback !== undefined) {
                            action.callback(null, pedido);
                        }
                    })
                ).pipe(
                    catchError((error) => {
                        if (action.callback !== undefined ) {
                            action.callback();
                        }
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    getOrderDetail$ = this.actions$.pipe(
        ofType(GET_ORDER_DETAIL),
        mergeMap((action: GetOrderDetailAction) => {
            let pedido = null;
            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    tienda_id: String(action.tienda_id),
                    activo: 'true',
                }
            });
            if (action.en_conflicto) {
                params.append('en_conflicto', "true");
            }
            return this.apiService.get('getPedido', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                )
                .pipe(
                    map(orderProductsRes => {
                        if (orderProductsRes && orderProductsRes.length > 0) {
                            const productsObj = {};
                            orderProductsRes.forEach(orderServ => {
                                const orderProducts = orderServ.productos;
                                orderProducts.reduce(function (acc, cur, i) {
                                    if (cur.oferta_especial && +cur.descuento > 0) {
                                        cur.precio = ((+cur.precio_unitario * (1 + +cur.iva)));
                                    }
                                    if (orderServ.fecha_entrega) {
                                        cur.fecha_entrega = orderServ.fecha_entrega;
                                    }

                                    if (orderServ.descuento_oferta_especial > 0 && +cur.descuento_oferta_especial == 0) {
                                        cur.descuento_oferta_especial = orderServ.descuento_oferta_especial;
                                    } else if (cur.descuento_oferta_especial > 0) {
                                        cur.oferta_por_producto = true;
                                        cur.descuento_suma_productos_especial = cur.descuento_oferta_especial;
                                    }

                                    if (cur.oferta_especial && +cur.descuento > 0) {
                                        const precio = ((+cur.precio_unitario * (1 + +cur.iva)));
                                        cur.descuento_suma_productos_lineal = (+precio * +cur.descuento);
                                    }
                                    productsObj[cur.id] = cur;
                                    return acc;
                                }, {});
                            });
                        }
                        if (action.callback !== undefined) {
                            action.callback(orderProductsRes);
                        }
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({dispatch: false})
    filterProducts$ = this.actions$.pipe(
        ofType(FILTER_PRODUCTS),
        map((action: FilterProductsAction) => {
            const productsCompare = (!action.productsCompare) ? [] : Object.values(action.productsCompare);
            const countProductsData = this.countProductsOrder(productsCompare);
            this.store.dispatch(new CountProductsOrderAction(countProductsData));
        })
    );

    @Effect()
    getFavoritesOrders$ = this.actions$.pipe(
        ofType(GET_FAVORITES_ORDERS),
        mergeMap((action: GetFavoritesOrders) => {
            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    tienda_id: String(action.tienda_id),
                    compania_id: action.compania_id.toString()
                }
            });
            return this.apiService.get('getPedidosFavoritos?tienda_id=' + action.tienda_id, params, false)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(orderProducts => {
                        return new SetFavoritesOrders(orderProducts.pedidos);
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getStatusProductByShopAction$ = this.actions$.pipe(
        ofType(GET_STATUS_PRODUCT_BY_SHOP),
        mergeMap((action: GetStatusProductByShopAction) => {
            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    tienda_id: String(action.tienda_id),
                    producto_distribuidor_id: String(action.producto_distribuidor_id),
                }
            });
            return this.apiService.get('estadoProductoPorTienda', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(status => {
                        return new SetStatusProductByShopAction(status);
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );


    countProductsOrder(productsCompare: IProduct[]) {
        let countProds = 0;
        productsCompare.forEach(product2 => {
            countProds += +product2.cantidad;
        });
        return countProds;
    }

    mergeProductSelectedWithGetOrder(productsSelected, productsOrder) {
        productsOrder = !productsOrder ? [] : Object.values(productsOrder);
        productsOrder.forEach(productOrder => {
            if (productsSelected && productsSelected[productOrder.id]) {
                productsSelected[productOrder.id].cantidad = productOrder.cantidad;
            }

            if (!productsSelected || !productsSelected[productOrder.id]) {
                if (!productsSelected) {
                    productsSelected = {};
                }
                productsSelected[productOrder.id] = productOrder;
            }
        });
        return productsSelected;
    }

    saveProductsSelected(productsOrder, callback?, pedido_id?) {
        let shop = this.shopSingletonService.getSelectedShop();
            shop.status_productos_pendientes = false;
            shop.productos_seleccionados = this.mergeProductSelectedWithGetOrder(shop.productos_seleccionados, productsOrder);
            this.shopSingletonService.setSelectedShop(shop);
            this.shopSingletonService.setStorageSelectedShop(shop);
            if (callback !== undefined) {
                setTimeout(() => {
                    callback(shop, pedido_id);
                }, 100);
            }
    }

    clearProductsSelected() {
        let shop = this.shopSingletonService.getSelectedShop();
        shop.status_productos_pendientes = false;
        shop.productos_seleccionados = {};
        this.shopSingletonService.setSelectedShop(shop);
        this.shopSingletonService.setStorageSelectedShop(shop);
    }
}
