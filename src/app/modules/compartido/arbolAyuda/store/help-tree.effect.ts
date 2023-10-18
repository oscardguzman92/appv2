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
    HelpTreeAction,
    HelpTreeClickAction,
    HelpTreeCompleteAction,
    HelpTreeDistributorsAction,
    HelpTreeDistributorsCompleteAction,
    HELP_TREE,
    HELP_TREE_DISTRIBUTORS,
    HELP_TREE_CLICK
} from './help-tree.actions';

import {
    HelpTreeDistributorsState,
    HelpTreeDistributorsCompleteState,
    HelpTreeState,
    HelpTreeClickState,
    HelpTreeCompleteState
} from './help-tree.reducer';


@Injectable({
    providedIn: 'root'
})

export class HelpTreeEffect {
    constructor(
        private actions$: Actions,
        private microApiService: ApiService,
        private storage: Storage,
        private storeHelpTree: Store<HelpTreeState>,
        private storeHelpTreeClick: Store<HelpTreeClickState>,
        private storeHelpTreeComplete: Store<HelpTreeCompleteState>,
        private storeHelpTreeDistributors: Store<HelpTreeDistributorsState>,
        private storeHelpTreeDistributorsComplete: Store<HelpTreeDistributorsCompleteState>,
        ) {
    }

    @Effect({ dispatch: false })
    HelpTreeEffect$ = this.actions$.pipe(
        ofType(HELP_TREE),
        mergeMap((action: HelpTreeAction) => {

            const params = new HttpParams().append('token', action.token);
            let endPoint = '';

            switch (action.role) {
                case 'vendedor':
                    endPoint = 'micro-help-tree/help-tree-seller';
                break;
                case 'cliente':
                    endPoint = 'micro-help-tree/help-tree-shopkeeper';
                break;
            }

            return this.microApiService.get(endPoint, params, true)
                .pipe(
                    map(data => {
                        // tslint:disable-next-line: max-line-length
                        this.storeHelpTreeComplete.dispatch(new HelpTreeCompleteAction( true, data['data'] ));
                        this.storeHelpTree.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({ dispatch: false })
    HelpTreeClickEffect$ = this.actions$.pipe(
        ofType(HELP_TREE_CLICK),
        mergeMap((action: HelpTreeClickAction) => {

            let endPoint = '';
            let params = null;
            switch (action.by) {
                case 'option':
                    params = { 'option_id':  action.id };
                    endPoint = 'micro-help-tree/click-option?token=' +  action.token;
                break;
                case 'tag':
                    params = { 'tag_id':  action.id };
                    endPoint = 'micro-help-tree/click-tag?token=' + action.token;
                break;
            }

            return this.microApiService.post3(endPoint, params, true)
                .pipe(
                    map(data => {

                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({ dispatch: false })
    HelpTreeDistributorsEffect$ = this.actions$.pipe(
        ofType(HELP_TREE_DISTRIBUTORS),
        mergeMap((action: HelpTreeDistributorsAction) => {
            const params = new HttpParams().append('token', action.token);
            const endPoint = 'micro-help-tree/distributors';

            return this.microApiService.get(endPoint, params, true)
                .pipe(
                    map(data => {
                        // tslint:disable-next-line: max-line-length
                        this.storeHelpTreeDistributorsComplete.dispatch(new HelpTreeDistributorsCompleteAction( true, data ));
                        this.storeHelpTreeDistributors.dispatch(new LoadingOff());
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );


}

