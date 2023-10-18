import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {LoadingOff} from '../../../compartido/general/store/actions/loading.actions';
import {of} from 'rxjs';
import {Fail} from '../../../compartido/general/store/actions/error.actions';
import {ApiService} from '../../../../services/api/api.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../store/app.reducer';
import { GET_SELLERS, GetSellersAction, SetSellersAction, GET_SHOPKEEPER_BY_SELLER, GetShopkeeperBySellerAction, SetShopkeeperBySellerAction } from './superSeller.actions';
import { HttpParams } from '@angular/common/http';
import { ILogin } from 'src/app/interfaces/ILogin';
import { AuthService } from 'src/app/services/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SuperSellerEffect {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>,
        private authService: AuthService) {
    }

    @Effect()
    getSellers$ = this.actions$.pipe(
        ofType(GET_SELLERS),
        mergeMap((action: GetSellersAction) => {
            const params = new HttpParams()
                .append('token', action.token);

            return this.apiService.get('getVendedoresPorSuperVendedor', params, true)
                .pipe(
                    map( (res) => {
                        if (action.callback) action.callback.complete();
                        if (res.status !== 'error') {
                            return res.content.data;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(sellers => new SetSellersAction(sellers))
                ).pipe(
                    catchError( (error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    getShopkeeper$ = this.actions$.pipe(
        ofType(GET_SHOPKEEPER_BY_SELLER),
        mergeMap((action: GetShopkeeperBySellerAction) => {
            const params = new HttpParams()
                .append('token', action.token);
            let login: ILogin = {
                login: action.cedula,
                password: action.cedula
            };
            return this.authService.login(login)
                .pipe(
                    map( (res) => {
                        if (action.callback) action.callback.complete();
                        if (res.status !== 'error') {
                            return res.content.user;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(sellers => new SetShopkeeperBySellerAction(sellers))
                ).pipe(
                    catchError( (error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    
}
