import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { Fail } from '../../../compartido/general/store/actions/error.actions';
import { ApiService } from 'src/app/services/api/api.service';
import { LoadingOff } from '../../../compartido/general/store/actions/loading.actions';

import {
    CashRegisterInSaleAction,
    CashRegisterInSaleDataAction,
    CashRegisterTreeAction,
    CashRegisterShopkeeperProductAction,
    CashRegisterProductsAction,
    CashRegisterNewProductAction,
    CashRegisterProductAction,
    CashRegisterProductCompleteAction,
    CashRegisterSearchProductsAction,
    CashRegisterSearchProductsCompleteAction,
    CashRegisterSearchClientsAction,
    CashRegisterSearchClientsCompleteAction,
    CashRegisterSaleAction,
    CashRegisterPaySaleAction,
    CashRegisterSalesAction,
    CashRegisterSalesCompleteAction,
    CashRegisterReminderPayAction,
    CashRegisterKpiAction,
    CashRegisterTagAction,
    CashRegisterTagsAction,
    CASH_REGISTER_IN_SALE,
    CASH_REGISTER_IN_SALE_DATA,
    CASH_REGISTER_TREE,
    CASH_REGISTER_NEW_PRODUCT,
    CASH_REGISTER_SHOPKEEPER_PRODUCT,
    CASH_REGISTER_PRODUCTS,
    CASH_REGISTER_PRODUCT,
    CASH_REGISTER_PRODUCT_COMPLETE,
    CASH_REGISTER_SEARCH_PRODUCTS,
    CASH_REGISTER_SEARCH_CLIENTS,
    CASH_REGISTER_SALE,
    CASH_REGISTER_SALES,
    CASH_REGISTER_PAY_SALE,
    CASH_REGISTER_REMINDER_PAY,
    CASH_REGISTER_KPI,
    CASH_REGISTER_TAG,
    CASH_REGISTER_TAGS,
} from './cash-register.actions';

import {
    CashRegisterTreeState,
    CashRegisterProductsState,
    CashRegisterProductState,
    CashRegisterProductCompleteState,
    CashRegisterSearchProductsState,
    CashRegisterSearchProductsCompleteState,
    CashRegisterSearchClientsState,
    CashRegisterSearchClientsCompleteState,
    CashRegisterSalesState,
    CashRegisterSalesCompleteState,
    CashRegisterKpiState,
    CashRegisterTagsState
} from './cash-register.reducer';


@Injectable({
    providedIn: 'root'
})

export class CashRegisterEffect {
    constructor(
        private actions$: Actions,
        private storeCashRegisterTree: Store<CashRegisterTreeState>,
        private storeProducts: Store<CashRegisterProductsState>,
        private storeSearchProducts: Store<CashRegisterSearchProductsState>,
        private storeSearchProductsComplete: Store<CashRegisterSearchProductsCompleteState>,
        private storeProduct: Store<CashRegisterProductState>,
        private storeProductComplete: Store<CashRegisterProductCompleteState>,
        private storeSales: Store<CashRegisterSalesState>,
        private storeSalesComplete: Store<CashRegisterSalesCompleteState>,
        private microApiService: ApiService,
        private storeSearchClients: Store<CashRegisterSearchClientsState>,
        private storeSearchClientsComplete: Store<CashRegisterSearchClientsCompleteState>,
        private storeKpi: Store<CashRegisterKpiState>,
        private storeTags: Store<CashRegisterTagsState>,
        private storage: Storage) {
    }

    @Effect({ dispatch: false })
    public CashRegisterInSaleEffect$: Observable<Action> = this.actions$.pipe(
        ofType(CASH_REGISTER_IN_SALE),
        tap((action: CashRegisterInSaleAction) => {
            if ( action.toggle ) {
                this.storage.set('CashRegisterInSale', action.inSale);
            }
        })
    );

    @Effect({ dispatch: false })
    public InSaleDataEffect$: Observable<Action> = this.actions$.pipe(
        ofType(CASH_REGISTER_IN_SALE_DATA),
        tap((action: CashRegisterInSaleDataAction) => {
            this.storage.set('CashRegisterInSaleData', action.CashRegisterObject);
        })
    );

    @Effect({ dispatch: false })
    public CreateThreeEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_TREE),
        mergeMap((action: CashRegisterTreeAction) => {
            const params = new HttpParams()
                .append('token', action.token )
            const endPoint = 'micro-cash-register/tree';
            return this.microApiService.get(endPoint, params, true)
                .pipe(
                    map(data => {
                        this.storage.set('CashRegisterTree', data['data']);
                        this.storeCashRegisterTree.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({ dispatch: false })
    NewProductEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_NEW_PRODUCT),
        mergeMap((action: CashRegisterNewProductAction) => {
            // tslint:disable-next-line: max-line-length
            const params = { 'product': JSON.stringify(action.product) , 'categories': JSON.stringify(action.categories), 'file': action.file };
            const endPoint = 'micro-cash-register/product?token=' + action.token;
            this.storage.remove('CashRegisterNewProduct');
            return this.microApiService.post3(endPoint, params);
        })
    );

    @Effect({ dispatch: false })
    ShopkeeperProductEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_SHOPKEEPER_PRODUCT),
        mergeMap((action: CashRegisterShopkeeperProductAction) => {
            const params = { 'shopkeeperProduct': JSON.stringify(action.ShopkeeperProduct) };
            const endPoint = 'micro-cash-register/shopkeeper-product?token=' + action.token;
            return this.microApiService.post3(endPoint, params);
        })
    );

    @Effect({ dispatch: false })
    ProductsEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_PRODUCTS),
        mergeMap((action: CashRegisterProductsAction) => {
            const params = new HttpParams()
                .append('token', action.token )
                .append('filter', action.filter.toString());
            const endPoint = 'micro-cash-register/products-shopkeeper';

            return this.microApiService.get(endPoint, params, true)
                .pipe(
                    map(data => {
                        this.storage.set('CashRegisterProducts', data['data']);
                        this.storeProducts.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({ dispatch: false })
    KpiEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_KPI),
        mergeMap((action: CashRegisterKpiAction) => {
            const params = new HttpParams()
                .append('token', action.token )
                .append('shopkeeper', action.shopkeeper.toString());
            const endPoint = 'micro-cash-register/kpi';

            return this.microApiService.get(endPoint, params, true)
                .pipe(
                    map(data => {
                        this.storage.set('CashRegisterKpi', data['data']);
                        this.storeKpi.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({ dispatch: false })
    ProductEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_PRODUCT),
        mergeMap((action: CashRegisterSearchProductsAction) => {
            const params = new HttpParams()
                .append('token', action.token )
                .append('filter', action.filter);

            const endPoint = 'micro-cash-register/product';

            return this.microApiService.get(endPoint, params, true)
                .pipe(
                    map(data => {
                        // tslint:disable-next-line: max-line-length
                        this.storeProductComplete.dispatch(new CashRegisterProductCompleteAction(true, data['data']));
                        this.storeProduct.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({ dispatch: false })
    SearchClientsEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_SEARCH_CLIENTS),
        mergeMap((action: CashRegisterSearchClientsAction) => {
            const params = new HttpParams()
                .append('token', action.token )
                .append('filter', action.filter);

            let endPoint = '';

            switch (action.shape) {
                case 'id':
                    endPoint = 'micro-cash-register/clients-id';
                    break;
                case 'phone':
                    endPoint = 'micro-cash-register/clients-phone';
                    break;
                case 'shopkeeper':
                    endPoint = 'micro-cash-register/clients-shopkeeper';
                    break;
            }

            return this.microApiService.get(endPoint, params, true)
                .pipe(
                    map(data => {
                        // tslint:disable-next-line: max-line-length
                        this.storeSearchClientsComplete.dispatch(new CashRegisterSearchClientsCompleteAction(true, data['data']));
                        this.storeSearchClients.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({ dispatch: false })
    SearchProductsEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_SEARCH_PRODUCTS),
        mergeMap((action: CashRegisterSearchProductsAction) => {
            const params = new HttpParams()
                .append('token', action.token )
                .append('filter', action.filter);

            let endPoint = '';

            switch (action.shape) {
                case 'filter':
                    endPoint = 'micro-cash-register/products-filter';
                    break;
                case 'brand':
                    endPoint = 'micro-cash-register/products-brand';
                    break;
                case 'ean':
                    endPoint = 'micro-cash-register/products-ean';
                    break;
                case 'outstanding':
                    endPoint = 'micro-cash-register/products-outstanding';
                    break;
                case 'overriding':
                    endPoint = 'micro-cash-register/products-overriding';
                    break;
            }

            return this.microApiService.get(endPoint, params, true)
                .pipe(
                    map(data => {
                        // tslint:disable-next-line: max-line-length
                        this.storeSearchProductsComplete.dispatch(new CashRegisterSearchProductsCompleteAction(true, data['data']));
                        this.storeSearchProducts.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({ dispatch: false })
    SaleEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_SALE),
        mergeMap((action: CashRegisterSaleAction) => {
            const params = { 'token': action.token, 'sale': JSON.stringify(action.CashRegisterObject) };
            const endPoint = 'micro-cash-register/sale?token=' + action.token;
            return this.microApiService.post3(endPoint, params);
        })
    );

    @Effect({ dispatch: false })
    PaySaleEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_PAY_SALE),
        mergeMap((action: CashRegisterPaySaleAction) => {
            const params = { 'token': action.token, 'sale': action.sale_id };
            const endPoint = 'micro-cash-register/pay-sale?token=' + action.token;
            return this.microApiService.post3(endPoint, params);
        })
    );

    @Effect({ dispatch: false })
    ReminderPayEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_REMINDER_PAY),
        mergeMap((action: CashRegisterReminderPayAction) => {
            const dataReminder = {
                'phone' : action.phone,
                'message' : action.message,
                'reference' : 'reminder pay',
            };
            const params = { 'token': action.token, 'dataReminder': JSON.stringify(dataReminder) };
            const endPoint = 'micro-cash-register/reminder-pay?token=' + action.token;
            return this.microApiService.post3(endPoint, params);
        })
    );

    @Effect({ dispatch: false })
    Salesffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_SALES),
        mergeMap((action: CashRegisterSalesAction) => {

            const params = new HttpParams()
                .append('token', action.token )
                .append('shopkeeper', action.shopkeeper.toString());
            const endPoint = 'micro-cash-register/sales';

            return this.microApiService.get(endPoint, params, true)
                .pipe(
                    map(data => {
                        // tslint:disable-next-line: max-line-length
                        this.storage.set('CashRegisterSales', data['data']);
                        this.storeSalesComplete.dispatch(new CashRegisterSalesCompleteAction(true, data['data']));
                        this.storeSales.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );

        })
    );

    @Effect({ dispatch: false })
    TagEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_TAG),
        mergeMap((action: CashRegisterTagAction) => {
            const params = { 'token': action.token, 'tag': action.tag };
            const endPoint = 'micro-cash-register/tag?token=' + action.token;
            return this.microApiService.post3(endPoint, params);
        })
    );

    @Effect({ dispatch: false })
    TagsEffect$ = this.actions$.pipe(
        ofType(CASH_REGISTER_TAGS),
        mergeMap((action: CashRegisterTagsAction) => {
            const params = new HttpParams()
                .append('token', action.token )
                .append('shopkeeper', action.shopkeeper.toString());
            const endPoint = 'micro-cash-register/tags';

            return this.microApiService.get(endPoint, params, true)
                .pipe(
                    map(data => {
                        this.storage.set('CashRegisterTags', data['data']);
                        this.storeTags.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

}

