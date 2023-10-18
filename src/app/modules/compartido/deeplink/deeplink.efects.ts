import {Actions, Effect, ofType} from '@ngrx/effects';
import {GetValidarProductsAction,GET_VALIDA_PRODUCTS, SetValidarProductsAction} from './deeplink.action';
import {ApiService} from '../../../../app/services/api/api.service';
import {HttpParams} from '@angular/common/http';
import {Store} from '@ngrx/store';
import {Storage} from '@ionic/storage';
import {AppState} from '../../../store/app.reducer';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { LoadingOff } from '../general/store/actions/loading.actions';
import { Fail } from '../general/store/actions/error.actions';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DeeplinkEffect {
    paginateProducts: any;

    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>
    ) {
    }

@Effect()
getValidarProducts$ = this.actions$.pipe(
    ofType(GET_VALIDA_PRODUCTS),
    mergeMap((action: GetValidarProductsAction) => {
        const params = new HttpParams({
            fromObject: {
                token: action.token,
                tienda_id: String(action.tienda_id),
                producto_id: action.producto_id

            }
        });
        return this.apiService.get('validaProductByShop?', params, true)
            .pipe(
                map((res) => {
                    if (res.code == 0) {
                        return res.content.productos;
                    }
                    return;
                })
            ).pipe(
                map(product => {
                    return new SetValidarProductsAction(product);
                })
            );
    })
);

}