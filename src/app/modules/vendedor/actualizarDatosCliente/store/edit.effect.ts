import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {LoadingOff} from '../../../compartido/general/store/actions/loading.actions';
import {of} from 'rxjs';
import {Fail} from '../../../compartido/general/store/actions/error.actions';
import {ApiService} from '../../../../services/api/api.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../store/app.reducer';
import {ModalController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {AfterUpdateShopKeeperAction, UPDATE_SHOPKEEPER, UpdateShopKeeperAction} from './edit.actions';
import { SuperSellerService } from 'src/app/services/users/super-seller.service';

@Injectable({
    providedIn: 'root'
})
export class EditEffect {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>,
        private modalController: ModalController,
        private storage: Storage,
        private superSellerService: SuperSellerService,
        ) {
    }

    @Effect()
    setUserRegister$ = this.actions$.pipe(
        ofType(UPDATE_SHOPKEEPER),
        mergeMap((action: UpdateShopKeeperAction) => {
            const params = {
                nombre_contacto: action.shop.nombre_contacto,
                telefono_contacto: action.shop.telefono_contacto,
                cedula: action.shop.cedula_distribuidor,
                id_tienda: action.shop.id,
                nombre_tienda: action.shop.nombre_tienda,
                tipologia_id: action.shop.tienda_tipologia_id,
                barrio: action.shop.barrio
            };


            if (action.shop.barrio) {
                params['barrio'] = action.shop.barrio;
            }

            if (action.shop.tienda_tipologia_id) {
                params['tienda_tipologia_id'] = action.shop.tienda_tipologia_id;
            }

            if (action.shop.direccion) {
                params['direccion'] = action.shop.direccion;
            }

            if (action.shop.direccion) {
                params['direccion'] = action.shop.direccion;
            }

            if (action.shop.descripcion_direccion) {
                params['descripcion_direccion'] = action.shop.descripcion_direccion;
            }

            if (action.shop.longitud) {
                params['longitud'] = action.shop.longitud;
            }

            if (action.shop.latitud) {
                params['latitud'] = action.shop.latitud;
            }

            if (action.shop.ciudad_nombre) {
                params['ciudad_nombre'] = action.shop.ciudad_nombre;
            }

            if (this.superSellerService.idSuperSeller) {
                params['super_vendedor_id'] = this.superSellerService.idSuperSeller;
            }

            return this.apiService.post('actualizarDatosTiendaVendedor?token=' + action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        return new AfterUpdateShopKeeperAction(action.shop);
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
