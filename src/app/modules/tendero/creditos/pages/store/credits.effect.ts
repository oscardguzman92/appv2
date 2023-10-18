import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';
import {of, throwError} from 'rxjs';
//import { ApiService } from 'src/app/services/api/api.service';
import { ApiService } from "../../../../../services/api/api.service";
import {
    GET_DESCRIPTION_CREDIT,
    SET_METHODS_PAY_CREDIT,
    GET_METHODS_PAY_CREDIT,
    GET_MY_CREDITS,
    SET_PURCHASE_CREDIT,
    SetDescriptionCreditAction, GetDescriptionCreditAction,
    SetMethodsyPayAction, GetMethodsyPayAction,
    GetMyCreditsAction,
    SetMyCreditsAction,
    SetPurcahseCreditAction,
    GET_MY_CREDITS_ENTITY,
    SetMyCreditsEntityAction,
    GetMyCreditsEntityAction,
    GetMyBalanceAction,
    GET_MY_BALANCE,
    SetMyBalanceAction

} from './credits.actions';
import {AppState} from '../../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {CreditsServices} from '../../../../../services/credits/credits.services';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {LoadingOff} from '../../../../compartido/general/store/actions/loading.actions';

@Injectable({
    providedIn: 'root'
})
export class MyCreditsEffect {

    constructor(
        private actions$: Actions,
        private creditsServices: CreditsServices,
        private store: Store<AppState>,
        private microApiService: ApiService
    ) {}

    @Effect({ dispatch: false })
    SaleEffect$ = this.actions$.pipe(
        ofType(SET_PURCHASE_CREDIT),
        mergeMap((action: SetPurcahseCreditAction) => {
            const params = {
                'purchase': JSON.stringify(action.purchase),
                'cash': action.cash,
                'storeappCredit': action.storeappCredit,
                'total': action.total,
                'user': action.user,
                'idOrder': action.idOrder,
                'description': action.description
            };
            const endPoint = 'micro-credits/purchase';
            return this.microApiService.post3(endPoint, params);
        })
    );

    @Effect()
    loadMethodsPay$ = this.actions$.pipe(
        ofType(GET_METHODS_PAY_CREDIT),
        mergeMap((action: GetMethodsyPayAction) => {
            return this.creditsServices.myMethodsPay(action.token, action.idOrder)
                .pipe(
                    map(res => new SetMethodsyPayAction( action.idOrder, res))
                ).pipe(
                    catchError( (error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    loadCredits$ = this.actions$.pipe(
        ofType(GET_MY_CREDITS),
        mergeMap((action: GetMyCreditsAction) => {
            return this.creditsServices.myCredits(action.token, action.shop)
                .pipe(
                    map( (res) => {

                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => new SetMyCreditsAction(res.credits))
                ).pipe(
                    catchError( (error) => {

                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    loadCreditsEntity$ = this.actions$.pipe(
        ofType(GET_MY_CREDITS_ENTITY),
        mergeMap((action: GetMyCreditsEntityAction) => {
            return this.creditsServices.myCreditsEntity(action.token, action.shop, action.entity, action.user_id)
                .pipe(
                    map( (res) => {

                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => new SetMyCreditsEntityAction(res.credits, (res.saldo) ? res.saldo : 0))
                ).pipe(
                    catchError( (error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    loadBalance$ = this.actions$.pipe(
        ofType(GET_MY_BALANCE),
        mergeMap((action: GetMyBalanceAction) => {
            return this.creditsServices.myBalance(action.token, action.shop)
                .pipe(
                    map( (res) => {

                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => new SetMyBalanceAction(res))
                ).pipe(
                    catchError( (error) => {

                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect()
    loadCredit$ = this.actions$.pipe(
        ofType(GET_DESCRIPTION_CREDIT),
        mergeMap((action: GetDescriptionCreditAction) => {
            return this.creditsServices.myCredit(action.token, action.idCredit)
                .pipe(
                    map( (res) => {
                        if (res.status !== 'error') {
                            return res.content.credit;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => new SetDescriptionCreditAction(res.credit, res.purchases))
                ).pipe(
                    catchError( (error) => {
                        this.store.dispatch(new LoadingOff());
                        return of(new Fail(error));
                    })
                );
        })
    );
}
