import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ApiService} from '../../../../../../services/api/api.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../recargas/store/currentAccount/currentAccount.reducer';
import {GET_COMPANIES, GetCompaniesAction, SetCompaniesAction} from './companies.actions';
import {catchError, finalize, map, mergeMap} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {of} from 'rxjs';
import {Fail} from '../../../../../compartido/general/store/actions/error.actions';
import {ICompany} from '../../../../../../interfaces/ICompany';
import {IPortfolio} from '../../../../../../interfaces/IPortfolio';
import {LoadingOff} from '../../../../../compartido/general/store/actions/loading.actions';
import {IModal} from '../../../../../../interfaces/IModal';


@Injectable({
    providedIn: 'root'
})
export class CompaniesEffect {
    constructor(
        private actions$: Actions,
        private api: ApiService,
        private store: Store<AppState>) {
    }

    @Effect()
    getCompanies$ = this.actions$.pipe(
        ofType(GET_COMPANIES),
        mergeMap((action: GetCompaniesAction) => {
            let params = new HttpParams()
                .append('token', action.token)
                .append('tienda_id', action.tienda_id.toString());

            if (action.consultaModals) {
                params = params.append('consultaModals', '1');
            }

            return this.api.get('getRelacionTiendaCompania?tienda_id=' + action.tienda_id, params, true, 20000)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            if(action.emitOfertas) action.emitOfertas();
                            return res.content;
                        }
                        throw(res);
                    })
                )
                .pipe(
                    map((res) => {
                        res.companias.forEach((c,i) => {
                            c.order = i;
                        });
                        return res;
                    })
                ).pipe(
                    map((res: {
                        companias: ICompany[], portafolios: IPortfolio[], productos_destacados: any[],
                        concursos_nuevos?: number, modales?: IModal[]
                    }) => {
                        return new SetCompaniesAction(
                            res.companias, res.portafolios, res.productos_destacados, res.concursos_nuevos, res.modales
                        );
                    })
                ).pipe(
                    finalize(() => {
                        this.store.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        if(action.emitOfertas) action.emitOfertas();
                        return of(new Fail(error));
                    })
                );
        })
    );
}
