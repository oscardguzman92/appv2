import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {ApiService} from 'src/app/services/api/api.service';
import {HttpParams} from '@angular/common/http';
import {from, of} from 'rxjs';
import {
    AFTER_SET_USER,
    AfterSetUserAction,
    SET_USER,
    SetUserAction,
    GET_DEPARTAMENTS,
    GetDepartamentsAction,
    GetCitiesAction,
    GET_CITIES,
    SetDepartamentsAction,
    SetCitiesAction,
    UpdateUserBeforeRegisterFinishAction,
    SET_SHOP,
    SetShopAction,
    ResponseSetShopAction,
    SetClientShopAction,
    SET_CLIENT_SHOP, AfterSetClientShopAction, SET_ADDRESS_SHOP, SetAddressShopAction, AfterSetAddressShopAction
} from './registro.actions';
import {Fail} from '../../../compartido/general/store/actions/error.actions';
import {LoadingOff} from '../../../compartido/general/store/actions/loading.actions';
import {AppState} from '../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {RegistroCapturaUbicacionComponent} from '../pages/registro/components/registro-captura-ubicacion/registro-captura-ubicacion.component';
import {ModalController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {SetUserAction as SetUserActionLogin} from '../../../../store/auth/auth.actions';
import {UserBuilder} from '../../../../builders/user.builder';
import {NavigationHelper} from '../../../../helpers/navigation/navigation.helper';
import { MsgErrorService } from 'src/app/services/api/msg-error.service';

@Injectable({
    providedIn: 'root'
})
export class RegisterEffect {

    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>,
        private modalController: ModalController,
        private storage: Storage,
        private msgErrorService: MsgErrorService,
        private navigation: NavigationHelper) {
    }

    @Effect({dispatch: false})
    setUserRegister$ = this.actions$.pipe(
        ofType(SET_USER),
        mergeMap((action: SetUserAction) => {

            let params:any = {
                cedula: action.user.cedula,
                //email: action.user.email,
                nombre_contacto: action.user.nombre_contacto,
                telefono_contacto: action.user.telefono_contacto,
                membresia: action.user.membresia,
                nombre_tienda: action.user.tiendas[0].nombre,
                verificadoV2: 1
            };
            if(action.user.email !== undefined && action.user.email !== null ){
                params.email = action.user.email;
            }
            return this.apiService.post('setCliente', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            //console.log("registro exitoso al cliente dar puntos");
                            if(res.content.newRegistration !== undefined){
                                this.storage.set('isNewRegistration', JSON.stringify(res.content.newRegistration));
                            }
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        res.user.tiendas[0].estrato = action.user.tiendas[0].estrato;
                        res.user.tiendas[0].tienda_tipologia_id = action.user.tiendas[0].tienda_tipologia_id;
                        res.user.tiendas[0].nombre = action.user.tiendas[0].nombre;
                        res.user.tiendas[0].nombre_tienda = action.user.tiendas[0].nombre_tienda;
                        res.user.tipologias = action.user.tipologias;
                        this.store.dispatch(new SetUserActionLogin(res.user));
                        this.store.dispatch(new LoadingOff());
                        if (!action.finishPrecess) {
                            //console.log("creo que no ha acabado el registro aca ");
                            this.storage.set('auth-register', JSON.stringify(res.user));
                            this.store.dispatch(new AfterSetUserAction(new UserBuilder(res.user).getUser()));
                        }
                        //console.log("aca llega sin pasar por finshpreces?");
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        this.store.dispatch(new Fail(error));
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    setShopRegister$ = this.actions$.pipe(
        ofType(SET_SHOP),
        mergeMap((action: SetShopAction) => {
            const params = {
                tienda_id: action.shop.id,
                direccion: action.shop.direccion,
                descripcion_direccion: action.shop.descripcion_direccion,
                longitud: action.shop.longitud,
                latitud: action.shop.latitud,
                tienda_tipologia_id: action.shop.tienda_tipologia_id,
                estrato: action.shop.estrato,
                nombre_tienda: action.shop.nombre,
                ciudad_id: action.shop.ciudad_id,
                ciudad_nombre: action.shop.ciudad_nombre,
                token: action.token
            };

            return this.apiService.post('setTienda?token=' + action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            this.store.dispatch(new LoadingOff());
                            //console.log("aca es el registro?");
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        return new ResponseSetShopAction(res);
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({dispatch: false})
    afterSetUserRegister$ = this.actions$.pipe(
        ofType(AFTER_SET_USER),
        tap(async (res: AfterSetUserAction) => {
            if (res.user.tiendas[0] && (!res.user.tiendas[0].tienda_tipologia_id || !res.user.tiendas[0].estrato)) {
                res.user.slideRegister = (!res.user.tiendas[0].estrato) ? 2 : 3;
                this.storage.set('auth-user-update', JSON.stringify(res.user)).then(() => {
                    this.navigation.goToBack('registro');
                    this.store.dispatch(new LoadingOff());
                });
                return;
            }
            await this.storage.set('auth-step', 'ubication');
            this.modalController.create(<any>{
                component: RegistroCapturaUbicacionComponent,
                componentProps: {
                    'user': res.user,
                }
            }).then((modal) => {
                modal.present();

                modal.onDidDismiss().then(data => {
                    if (!data.data) { return; }

                    if ((data.data.summary) && data.data.summaryUser) {
                        this.store.dispatch(
                            new UpdateUserBeforeRegisterFinishAction(data.data.summaryUser, data.data.departament, data.data.city));
                    }
                });
            });
        })
    );


    @Effect()
    getDepartaments$ = this.actions$.pipe(
        ofType(GET_DEPARTAMENTS),
        mergeMap((action: GetDepartamentsAction) => {
            const params = new HttpParams().set('token', action.token);
            return this.apiService.get('getDepartamentos', params, false)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                )
                .pipe(
                    map(res => new SetDepartamentsAction(res.content))
                )
                .pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getCities$ = this.actions$.pipe(
        ofType(GET_CITIES),
        mergeMap((action: GetCitiesAction) => {
            const params = new HttpParams()
                .set('departamento_id', action.idDepto)
                .set('token', action.token);
            return this.apiService.get('getCiudades', params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                )
                .pipe(
                    map(res => new SetCitiesAction(res.content))
                )
                .pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    setClientShop$ = this.actions$.pipe(
    ofType(SET_CLIENT_SHOP),
    mergeMap((action: SetClientShopAction) => {
        if (!action.shopkeeper || !action.shopkeeper.tiendas[0]) {
            return from(this.msgErrorService.getErrorIntermitencia())
                .pipe(
                    map(msg => new Fail({mensaje: msg}))
                );
        }
        let params: any = {
          nombre_contacto: action.shopkeeper.nombre_contacto,
          telefono_contacto: action.shopkeeper.telefono_contacto,
          email: action.shopkeeper.email,
          cedula: action.shopkeeper.cedula,
          nombre_tienda: action.shopkeeper.tiendas[0].nombre,
          direccion: action.shopkeeper.tiendas[0].direccion,
          longitud: action.shopkeeper.tiendas[0].longitud,
          latitud: action.shopkeeper.tiendas[0].latitud,
          distribuidor_id: action.distribuidor_id,
          descripcion_direccion:
            action.shopkeeper.tiendas[0].descripcion_direccion,
          ciudad_nombre: action.shopkeeper.tiendas[0].ciudad_nombre,
          lista_precio_id: "default",
          file_documento: action.shopkeeper.imgDocumento,
          file_documento2: action.shopkeeper.imgDocumento2,
          file_rut: action.shopkeeper.tiendas[0].imgRut,
          file_firma: action.shopkeeper.imgSignature,
          nuevaSucursal: (action.shopkeeper.tiendas[0].nuevaSucursal)?1:0,
          tienda_id: action.shopkeeper.tiendas[0].id,
          dia_semana: action.shopkeeper.tiendas[0].dia_semana,
        };
        if (action.shopkeeper.email != undefined && action.shopkeeper.email != null) {
          params.email = action.shopkeeper.email;
        }
        if (action.shopkeeper.tiendas[0] && action.shopkeeper.tiendas[0].tienda_tipologia_id) {
            params['tienda_tipologia_id'] = action.shopkeeper.tiendas[0].tienda_tipologia_id;
        }
        return this.apiService.post('setClienteTienda?token=' + action.token, params, true)
            .pipe(
                map((res) => {
                    if (res.status !== 'error') {
                        return res.content;
                    }
                    throw(res);
                })
            ).pipe(
                map(res => {
                    this.store.dispatch(new LoadingOff());

                    if (params.nuevaSucursal == 0) {
                        return new AfterSetClientShopAction(true);
                    }

                    return new AfterSetClientShopAction();
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

    @Effect()
    setAddressShop$ = this.actions$.pipe(
        ofType(SET_ADDRESS_SHOP),
        mergeMap(async (action: SetAddressShopAction) => {
            if (!action.shop) {
                let msg = await this.msgErrorService.getErrorIntermitencia();
                this.store.dispatch(new Fail({mensaje: msg}));
                return;
            }

            const params = {
                tienda_id: action.shop.id,
                direccion: action.shop.direccion,
                longitud: action.shop.longitud,
                latitud: action.shop.latitud,
                descripcion_direccion: action.shop.descripcion_direccion,
                ciudad_nombre: action.shop.ciudad_nombre,
            };

            return this.apiService.post('setDireccionTienda?token=' + action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.store.dispatch(new LoadingOff());
                        return new AfterSetAddressShopAction();
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
