import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {LoadingOff} from '../../../compartido/general/store/actions/loading.actions';
import {of} from 'rxjs';
import {Fail} from '../../../compartido/general/store/actions/error.actions';
import {ApiService} from '../../../../services/api/api.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../store/app.reducer';
import {HttpParams} from '@angular/common/http';
import {
    GET_MERCHANT_SHOP,
    GetMerchantShopAction,
    SetMerchantShopAction,
    SET_MERCHANT_GEOLOCATION,
    SetMerchantGeolocationAction,
    SET_CLIENT_MERCHANT, SetClientMerchantAction, AfterSetClientMerchantAction
} from './merchantShop.actions';
import {ModalController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {json} from '@angular-devkit/core';
import {Mercaderista} from '../../../../models/Mercaderista';
import { MsgErrorService } from 'src/app/services/api/msg-error.service';

@Injectable({
    providedIn: 'root'
})


export class MerchanShopEffect {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>,
        private modalController: ModalController,
        private storage: Storage,
        private msgErrorService: MsgErrorService,
    ) { }

    @Effect()
    getMerchanShops$ = this.actions$.pipe(
        ofType(GET_MERCHANT_SHOP),
        mergeMap((action: GetMerchantShopAction) => {
            const params = new HttpParams()
                .append('token', action.token);

            return this.apiService.get('getClientesPorMercaderista', params, true)
                .pipe(
                    map((res) => {
                        if (action.callback) {
                            action.callback.complete();
                        }
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(response => {
                        this.storage.get('user')
                            .then(user => {
                                const userData = JSON.parse(user) as Mercaderista;
                                userData.clientes_total_hoy = (response.clientes_total_hoy) ? response.clientes_total_hoy : 0;
                                userData.clientes_atendidos_hoy = (response.clientes_atendidos_hoy) ? response.clientes_atendidos_hoy : 0;
                                return this.storage.set('user', JSON.stringify(userData));
                            });
                        return response.clientes;
                    })
                ).pipe(
                    map(sellers => new SetMerchantShopAction(sellers))
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    setMerchanGeolocation$ = this.actions$.pipe(
        ofType(SET_MERCHANT_GEOLOCATION),
        mergeMap((action: SetMerchantGeolocationAction) => {
            const params = {
                lat: action.lat,
                long: action.long,
            };

            return this.apiService.post('setGeolocalizacionMercaderista?token=' + action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        return res;
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
    setClientMerchant$ = this.actions$.pipe(
        ofType(SET_CLIENT_MERCHANT),
        mergeMap((action: SetClientMerchantAction) => {
            if (!action.mercaderista_id) {
                let msg = this.msgErrorService.getErrorIntermitencia();
                this.store.dispatch(new Fail({mensaje: msg}));
                return;
            }
            const params = {
                nombre_contacto: action.shopkeeper.nombre_contacto,
                email: action.shopkeeper.email,
                telefono_contacto: action.shopkeeper.telefono_contacto,
                cedula: action.shopkeeper.cedula,
                nombre_tienda: action.shopkeeper.tiendas[0].nombre,
                direccion: action.shopkeeper.tiendas[0].direccion,
                longitud: action.shopkeeper.tiendas[0].longitud,
                latitud: action.shopkeeper.tiendas[0].latitud,
                mercaderista_id: action.mercaderista_id,
                descripcion_direccion: action.shopkeeper.tiendas[0].descripcion_direccion,
                ciudad_nombre: action.shopkeeper.tiendas[0].ciudad_nombre,
                lista_precio_id: 'default',
                file_documento: action.shopkeeper.imgDocumento,
                file_documento2: action.shopkeeper.imgDocumento2,
                file_rut: action.shopkeeper.tiendas[0].imgRut,
                file_firma: action.shopkeeper.imgSignature,
                nuevaSucursal: (action.shopkeeper.tiendas[0].nuevaSucursal)?1:0,
                tienda_id: action.shopkeeper.tiendas[0].id,
            };

            if (action.shopkeeper.tiendas[0] && action.shopkeeper.tiendas[0].tienda_tipologia_id) {
                params['tienda_tipologia_id'] = action.shopkeeper.tiendas[0].tienda_tipologia_id;
            }
            return this.apiService.post('setClienteMercaderista?token=' + action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        if(params.nuevaSucursal == 0){
                            this.store.dispatch(new AfterSetClientMerchantAction(true));                            
                        }else{
                            this.store.dispatch(new AfterSetClientMerchantAction());                            
                        }
                        this.store.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        this.modalController.dismiss();
                        this.store.dispatch(new LoadingOff());
                        this.store.dispatch(new Fail(error));
                        return of(new Fail(error));
                    })
                );
        })
    );
}