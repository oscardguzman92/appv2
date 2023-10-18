import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ApiService} from '../../../../../services/api/api.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../tendero/recargas/store/currentAccount/currentAccount.reducer';
import {catchError, finalize, map, mergeMap, tap} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {of} from 'rxjs';
import {Fail} from '../actions/error.actions';
import {
    GET_OFFERS,
    GET_PRODUCTS_FEATURED,
    GET_BUTTONS_FEATURED,
    GetOffersActions,
    GetProductsFeaturedAction,
    GetAdditionalButtonAction,
    SetOffersActions,
    SetProductsFeaturedAction,
    SetAdditionalButtonAction,
    SetOnlyOffersActions
} from '../actions/offers.actions';
import {IProduct} from '../../../../../interfaces/IProduct';
import { IBotonAdicional } from '../../../../../interfaces/IBotonAdicional';

@Injectable({
    providedIn: 'root'
})
export class OffersEffects {
    constructor(
        private actions$: Actions,
        private api: ApiService,
        private store: Store<AppState>) {
    }

    @Effect()
    getOffers$ = this.actions$.pipe(
        ofType(GET_OFFERS),
        mergeMap((action: GetOffersActions) => {
            console.log("offer", action.tienda_id);
            const params = new HttpParams()
                .append('token', action.token)
                .append('page', action.page.toString())
                .append('tienda_id', action.tienda_id.toString());
                let company_id = "";
                let distribuidor_id = "";
                let portafolio = "";
                let limit = "&limit=40";;
                if (action.limit) limit = "&limit="+action.limit;
                if (action.compania_id && !action.distribuidor_id) company_id = "&compania_id="+action.compania_id;
                if (action.distribuidor_id) distribuidor_id = "&distribuidor_id="+action.distribuidor_id;
                if (action.portafolio) portafolio = "&portafolio="+action.portafolio;
            return this.api.get('getOfertasV2?' + action.tienda_id+"-"+action.page+company_id+distribuidor_id+portafolio+limit, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content.productos;
                        }
                        throw(res);
                    })
                )
                .pipe(
                    map((res) => {
                        res.data = res.data.filter(function (producto) {
                            if (!producto.es_ofe_especial) {
                                return true;
                            }
                            if (producto.es_ofe_especial && producto.reglas_ofe && producto.reglas_ofe.length > 0) {
                                return true;
                            }

                            return false;
                        });

                        return res;
                    })
                )
                .pipe(
                    map(res => {
                        let data = res.data;
                        console.log(data);
                        let paginateProductsTemp = res;
                        delete paginateProductsTemp.data;
                        if (action.only){
                            return new SetOnlyOffersActions(data, paginateProductsTemp)
                        }else{
                            return new SetOffersActions(data, paginateProductsTemp)
                        }
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new SetOffersActions([], null, true))
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getProductsFeatured$ = this.actions$.pipe(
        ofType(GET_PRODUCTS_FEATURED),
        mergeMap((action: GetProductsFeaturedAction) => {
            const params = new HttpParams()
                .append('token', action.token)
                .append('tienda_id', action.tienda_id.toString())
                .append('banners', '1');

            return this.api.get('getProductosDestacados?' + action.tienda_id, params)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: {productos_destacados: IProduct[]}) => res.productos_destacados)
                )
                .pipe(
                    tap((products) => {
                        return products.sort(this.orderBy);
                    })
                )
                .pipe(
                    map(products => new SetProductsFeaturedAction(products))
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getAdditionalButton$ = this.actions$.pipe(
        ofType(GET_BUTTONS_FEATURED),
        mergeMap((action: GetAdditionalButtonAction) => {
            const params = new HttpParams()
                .append('token', action.token)
                .append('tienda_id', action.tienda_id.toString());
            return this.api.get('getBotonesAdicionales?' + action.tienda_id, params)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res: { botones_adicionales: IBotonAdicional[] }) => {
                        if(res && res.botones_adicionales)
                            return res.botones_adicionales;
                        return;
                    })
                )
                .pipe(
                    map((buttons) => {
                        return new SetAdditionalButtonAction(buttons);
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );



    private orderBy(a: {orden: number}, b: {orden: number}) {
        // equal items sort equally
        if (a.orden === b.orden) {
            return 0;
        }
        // nulls sort after anything else
        if (a.orden === null) {
            return 1;
        }
        if (b.orden === null) {
            return -1;
        }

        return a.orden < b.orden ? -1 : 1;
    }
}
