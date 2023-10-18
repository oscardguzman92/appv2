import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap, tap, mapTo} from 'rxjs/operators';
import {ApiService} from 'src/app/services/api/api.service';
import {HttpParams} from '@angular/common/http';
import {of, Subscriber, TimeoutError} from 'rxjs';
import {Fail} from '../../../compartido/general/store/actions/error.actions';
import {LoadingOff} from '../../../compartido/general/store/actions/loading.actions';
import {AppState} from '../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {Storage} from '@ionic/storage';
import {
    SetShopsAction,
    FilterShopsAction,
    FILTER_SHOPS,
    GET_SHOPS,
    GetShopsAction,
    ShopsPendingProductsAction,
    ChangeDaysWeeklyAction,
    GET_DROP_SIZE,
    GetDropSizeAction,
    SetDropSizeAction,
    GET_CLIENT_BY_DOCUMENT,
    GetClientByDocument,
    SetClientByDocument,
    UPDATE_ASSOCIATION, UpdateAssociation, FinishUpdateAssociation, SetListShopsAction, GET_SHOPS_ORDERS, GetShopsOrdersAction
} from './mis-clientes.actions';
import {Shop} from 'src/app/models/Shop';
import {IShops} from 'src/app/interfaces/IShops';
import {SetOfflineDynamicAction} from '../../compartido/store/offlineDynamic/offlineDynamic.actions';
import {CacheService} from 'ionic-cache';
import { SuperSellerService } from 'src/app/services/users/super-seller.service';

@Injectable({
    providedIn: 'root'
})
export class ShopsEffect {

    private shops: IShops[];

    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>,
        private superSellerService: SuperSellerService,
        private storage: Storage,
        private cache: CacheService) {
    }

    @Effect({dispatch: false})
    filterShops$ = this.actions$.pipe(
        ofType(FILTER_SHOPS),
        map((action: FilterShopsAction) => {
            this.shops = action.shops;
            let date = new Date();
            let dayOfWeek = date.toLocaleDateString('es-ES', {weekday: 'long'});
            this.compareWithProductsPending(action.filter.dia, action.showOrdersPending).then(() => {
                if (action.zoneId) {
                    this.shops = this.shops.filter((el) => {
                        return el.zona && (el.zona.toString() === action.zoneId.toString()) &&
                            (action.filter.viewAll || !action.filter.viewAll) &&
                            (
                                (!action.filter.activo || ((action.filter.inactive && action.filter.activo) || action.filter.activo == el.activo)) &&
                                (!action.filter.inactive || ((action.filter.activo && action.filter.inactive) || action.filter.inactive != el.activo)) &&
                                (!action.filter.status_productos_pendientes || (action.filter.status_productos_pendientes && el.status_productos_pendientes)) &&
                                (!action.filter.pedido || (action.filter.pedido && el.pedido)) &&
                                (
                                    (!action.filter.nombre_tienda || (action.filter.nombre_tienda && el.nombre_tienda && this.rmAccents(el.nombre_tienda.toLowerCase()).indexOf(this.rmAccents(action.filter.nombre_tienda.toLowerCase())) >= 0)) ||
                                    (!action.filter.nombre_contacto || (action.filter.nombre_contacto && el.nombre_contacto && this.rmAccents(el.nombre_contacto.toLowerCase()).indexOf(this.rmAccents(action.filter.nombre_contacto.toLowerCase())) >= 0)) ||
                                    (!action.filter.codigo_cliente || (action.filter.codigo_cliente && el.codigo_cliente && el.codigo_cliente.indexOf(action.filter.codigo_cliente) >= 0)) ||
                                    (!action.filter.cedula_distribuidor || (action.filter.cedula_distribuidor && el.cedula_distribuidor && el.cedula_distribuidor.indexOf(action.filter.cedula_distribuidor) >= 0)) ||
                                    (!action.filter.direccion || (action.filter.direccion && el.direccion && this.rmAccents(el.direccion.toLowerCase()).indexOf(this.rmAccents(action.filter.direccion.toLowerCase())) >= 0))
                                )
                            );
                    });
                } else if (action.filter.dia) {
                    this.shops = this.shops.filter((el) => {
                        return this.rmAccents(el.dia).toLowerCase() == this.rmAccents(action.filter.dia).toLowerCase() &&
                            (action.filter.viewAll || !action.filter.viewAll) &&
                            (
                                (!action.filter.activo || ((action.filter.inactive && action.filter.activo) || action.filter.activo == el.activo)) &&
                                (!action.filter.inactive || ((action.filter.activo && action.filter.inactive) || action.filter.inactive != el.activo)) &&
                                (!action.filter.status_productos_pendientes || (action.filter.status_productos_pendientes && el.status_productos_pendientes)) &&
                                (!action.filter.pedido || (action.filter.pedido && el.pedido)) &&
                                (
                                    (!action.filter.nombre_tienda || (action.filter.nombre_tienda && el.nombre_tienda && this.rmAccents(el.nombre_tienda.toLowerCase()).indexOf(this.rmAccents(action.filter.nombre_tienda.toLowerCase())) >= 0)) ||
                                    (!action.filter.nombre_contacto || (action.filter.nombre_contacto && el.nombre_contacto && this.rmAccents(el.nombre_contacto.toLowerCase()).indexOf(this.rmAccents(action.filter.nombre_contacto.toLowerCase())) >= 0)) ||
                                    (!action.filter.codigo_cliente || (action.filter.codigo_cliente && el.codigo_cliente && el.codigo_cliente.indexOf(action.filter.codigo_cliente) >= 0)) ||
                                    (!action.filter.cedula_distribuidor || (action.filter.cedula_distribuidor && el.cedula_distribuidor && el.cedula_distribuidor.indexOf(action.filter.cedula_distribuidor) >= 0)) ||
                                    (!action.filter.direccion || (action.filter.direccion && el.direccion && this.rmAccents(el.direccion.toLowerCase()).indexOf(this.rmAccents(action.filter.direccion.toLowerCase())) >= 0))
                                )
                            );
                    });
                } else {
                    this.shops = this.shops.filter((el) => {
                        return(action.filter.viewAll || !action.filter.viewAll) &&
                            (
                                (!action.filter.activo || ((action.filter.inactive && action.filter.activo) || action.filter.activo == el.activo)) &&
                                (!action.filter.inactive || ((action.filter.activo && action.filter.inactive) || action.filter.inactive != el.activo)) &&
                                (!action.filter.status_productos_pendientes || (action.filter.status_productos_pendientes && el.status_productos_pendientes)) &&
                                (!action.filter.pedido || (action.filter.pedido && el.pedido)) &&
                                (
                                    (!action.filter.nombre_tienda || (action.filter.nombre_tienda && el.nombre_tienda && this.rmAccents(el.nombre_tienda.toLowerCase()).indexOf(this.rmAccents(action.filter.nombre_tienda.toLowerCase())) >= 0)) ||
                                    (!action.filter.nombre_contacto || (action.filter.nombre_contacto && el.nombre_contacto && this.rmAccents(el.nombre_contacto.toLowerCase()).indexOf(this.rmAccents(action.filter.nombre_contacto.toLowerCase())) >= 0)) ||
                                    (!action.filter.codigo_cliente || (action.filter.codigo_cliente && el.codigo_cliente && el.codigo_cliente.indexOf(action.filter.codigo_cliente) >= 0)) ||
                                    (!action.filter.cedula_distribuidor || (action.filter.cedula_distribuidor && el.cedula_distribuidor && el.cedula_distribuidor.indexOf(action.filter.cedula_distribuidor) >= 0)) ||
                                    (!action.filter.direccion || (action.filter.direccion && el.direccion && this.rmAccents(el.direccion.toLowerCase()).indexOf(this.rmAccents(action.filter.direccion.toLowerCase())) >= 0))
                                )
                            );
                    });
                }
                    
                
                this.shops.map((s, index) => s.indexOrden = (index + 1))
                this.store.dispatch(new SetShopsAction(this.shops));
            });
        })
    );


    @Effect({dispatch: false})
    getShops$ = this.actions$.pipe(
        ofType(GET_SHOPS),
        mergeMap((action: GetShopsAction) => {
            const params = new HttpParams().set('token', action.token);
            return this.apiService.get('getDatosTiendasXVendedor', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content.tiendas;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(shops => {
                        if (action.callbackEvent) action.callbackEvent.complete();
                        this.storage.get('user').then(res => {
                            res = JSON.parse(res);
                            res.tiendas = shops;
                            this.storage.set('user', JSON.stringify(res));
                        });
                        this.shops = shops;
                        this.store.dispatch(new SetListShopsAction(shops));
                    })
                ).pipe(
                    catchError((error) => {
                        if (action.callbackEvent) action.callbackEvent.complete();
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({dispatch: false})
    getShopsOrders$ = this.actions$.pipe(
        ofType(GET_SHOPS_ORDERS),
        mergeMap((action: GetShopsOrdersAction) => {
            const params = new HttpParams().set('token', action.token);
            return this.apiService.get('getDatosTiendasXVendedorPedidos', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.alterShopsWithOrder(this.shops, res.pedidos_tiendas)
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getDropSize$ = this.actions$.pipe(
        ofType(GET_DROP_SIZE),
        mergeMap((action: GetDropSizeAction): any => {
            const params = new HttpParams()
                .set('token', action.token)
                .append('tienda_id', action.shop.id.toString());

            return this.apiService.get('getDropSize?tienda=' + action.shop.id.toString(), params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: { pedido_promedio: any, cumplimiento_pedido_promedio: any, frecuencia_pedido: any,
                        cumplimiento_frecuencia_pedido: any, referencia_promedio: any, cumplimiento_referencia_promedio: any,
                        tipo_prueba_ab?: string, concursos_nuevos?: number}) => {
                        return new SetDropSizeAction(res);
                    })
                ).pipe(
                    catchError((error): any => {
                        this.store.dispatch(new LoadingOff());
                        if (error instanceof TimeoutError) {
                            this.store.dispatch(new Fail({mensaje: 'Modo sin conexión activo'}));
                            return of(new SetOfflineDynamicAction(true));
                        }
                        if (error.statusText === 'Unknown Error') {
                            return this.cache.getItem('offlineDynamic')
                                .then((res) => {
                                    this.store.dispatch(new Fail({mensaje: 'Modo sin conexión activo'}));
                                    return of(new SetOfflineDynamicAction(true));
                                });
                        }
                        return of(new Fail(error));
                    })
                );
        })
    );

    compareWithProductsPending(daySelected: string, showOrdersPending: boolean) {
        const date = new Date();
        const dayOfWeek = date.toLocaleDateString('es-ES', {weekday: 'long'});
        const promise = new Promise(async (resolve, reject) => {
            const withoutConnection = await this.storage.get('withoutConnection');
            this.storage.get('order').then((shopsSel) => {
                const shopsTemp: Shop[] = JSON.parse(shopsSel);
                if (shopsTemp && shopsTemp.length > 0) {
                    shopsTemp.forEach((sT, index, obj) => {
                        if (!sT.productos_seleccionados) {
                            sT.productos_seleccionados = {};
                        }
                        if (
                            (!sT.productos_seleccionados && !sT.pedido) ||
                            (Object.keys(sT.productos_seleccionados).length <= 0 && !sT.pedido)
                        ) {
                            obj.splice(index, 1);
                        }
                    });
                    this.shops.forEach((s) => {
                        s.status_en_conflicto = false;
                        s.status_productos_pendientes = false;
                        let statusFindShopTemp = false;
                        shopsTemp.forEach((sT) => {
                            if ((sT.id == s.id) && (sT.codigo_cliente == s.codigo_cliente)) {
                                s.status_en_conflicto = sT.status_en_conflicto;
                                statusFindShopTemp = true;
                                if(sT.status_productos_pendientes){
                                    s.status_productos_pendientes = true;
                                    sT.status_productos_pendientes = true;
                                }
                                if (sT.pedido) {
                                    s.pedido = sT.pedido;
                                } else {
                                    s.pedido = null;
                                }
                            }
                        });
                        if (!statusFindShopTemp) {
                            s.productos_seleccionados = {};
                            s.status_productos_pendientes = false;
                        }
                    });
                    if (!withoutConnection) {
                        this.storage.set('order', JSON.stringify(shopsTemp));
                    }
                    let text = this.rmAccents(daySelected);
                    if (text && text.toLowerCase() == this.rmAccents(dayOfWeek).toLowerCase() && showOrdersPending) {
                        this.showOrdersPending(shopsTemp);
                    }
                }else{
                    this.shops.forEach((s) => {
                        s.status_productos_pendientes = false;
                        if (!s.pedido) {
                            s.pedido = null;
                        }
                    });
                }
                this.changeDaysWeek();
                resolve(true);
            });
        });
        return promise;
    }
    
    alterShopsWithOrder(shops: IShops[], shopsTemp:any[]) {
        shops.forEach((s) => {
            shopsTemp.forEach((sT) => {
                if ((sT.tienda_id == s.id) && (sT.codigo_cliente == s.codigo_cliente)) {
                    if (sT.pedido_id && !s.status_productos_pendientes) {
                        s.pedido = sT.pedido_id;
                        s.productos_seleccionados = {};
                        s.status_productos_pendientes = false;
                    }
                }
            });
        });
        this.store.dispatch(new SetShopsAction(shops));
    }

    showOrdersPending(shops: Shop[]) {
        if (shops.length > 0) {
            const codigos = shops
                .filter((shop) => shop.status_productos_pendientes)
                .map((shop) => shop.codigo_cliente )
                .join();
            if (codigos !== '') {
                this.store.dispatch(new ShopsPendingProductsAction(codigos));
            }
        }
    }

    changeDaysWeek() {
        const week = Array(7).fill(new Date()).map((date, i) => {
            if (i !== 0) date.setDate(date.getDate() + 1);
            const name = date.toLocaleDateString('es-ES', {weekday: 'short'});
            const nameLong = date.toLocaleDateString('es-ES', {weekday: 'long'});
            let statusWithoutClients: boolean = true;
            let statusProgramOrder: boolean = false;
            if (i > 0) {
                statusProgramOrder = this.shops.some(shop => this.rmAccents(shop.dia).toLowerCase() == this.rmAccents(nameLong).toLowerCase() && shop.pedido != null);
            }
            statusWithoutClients = this.shops.some(shop => this.rmAccents(shop.dia).toLowerCase() == this.rmAccents(nameLong).toLowerCase());
            
            return {
                day: date.getDate(),
                nameDay: name[0].toUpperCase(),
                date: date.getTime(),
                withoutClients: (statusWithoutClients) ? false : true,
                programOrder: (statusProgramOrder) ? true : false,
            };
        });
        this.store.dispatch(new ChangeDaysWeeklyAction(week));
    }


    rmAccents(text) {
        if (text && text != "") {
            return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        return text;
    }

    @Effect()
    GetClientByDocument$ = this.actions$.pipe(
        ofType(GET_CLIENT_BY_DOCUMENT),
        mergeMap((action: GetClientByDocument) => {
            const params = {
                cedula: action.document
            };

            if (action.validacion_x_distribuidor) {
                params['validacion_x_distribuidor'] = true;
            }

            if (action.distribuidor_id) {
                params['distribuidor_id'] = action.distribuidor_id;
            }

            return this.apiService.post('getValidacionDocumento', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        return new SetClientByDocument(res);
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    UpdateAssociation$ = this.actions$.pipe(
        ofType(UPDATE_ASSOCIATION),
        mergeMap((action: UpdateAssociation) => {
            const params = {
                cliente_id: action.cliente_id.toString(),
                tienda_id: action.tienda_id.toString(),
                distribuidor_id: action.distribuidor_id.toString(),
                nueva_tienda_id: action.nueva_tienda_id.toString(),
                super_vendedor_id: this.superSellerService.idSuperSeller
            };
            return this.apiService.post('actualizaAsociacion?token=' + action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        return new FinishUpdateAssociation(res);
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );
}
