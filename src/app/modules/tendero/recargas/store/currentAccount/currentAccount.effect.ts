import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, finalize, map, mergeMap, tap} from 'rxjs/operators';
import {of} from 'rxjs';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {HttpParams} from '@angular/common/http';
import {IProductService} from '../../../../../interfaces/IProductService';
import {ApiService} from '../../../../../services/api/api.service';
import {
    GET_BALANCE,GET_MENSAJE,
    GET_CURRENT_ACCOUNT, GET_DDDEDO, GetBalanceAction,GetMensajeAction,
    GetCurrentAccountAction, GetDddedoAction,
    SET_CURRENT_ACCOUNT_PASSWORD, SetBalanceAction,SetMensajeAction,
    SetCurrentAccountAction, SetCurrentAccountPasswordAction, SetDddedoAction
} from './currentAccount.actions';
import {AppState} from './currentAccount.reducer';
import {Store} from '@ngrx/store';
import {LoadingOff} from '../../../../compartido/general/store/actions/loading.actions';
import {ICurrentAccount} from '../../../../../interfaces/ICurrentAccount';
import {Storage} from '@ionic/storage';
import {CacheService} from 'ionic-cache';
import {SetTopUpsSelectedAction} from '../topUps/topUps.actions';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';

@Injectable({
  providedIn: "root",
})
export class CurrentAccountEffect {
  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store<AppState>,
    private storage: Storage,
    private cache: CacheService,
    private navigation: NavigationHelper
  ) {}

  @Effect()
  loadServices$ = this.actions$.pipe(
    ofType(GET_CURRENT_ACCOUNT),
    mergeMap((action: GetCurrentAccountAction) => {
      return this.api
        .post(
          `getCuentaCorriente?token=${action.token}`,
          { password: action.password },
          true
        )
        .pipe(
          map((res) => {
            if (res.status !== "error") {
              return res.content.cuenta;
            }
            throw res;
          })
        )
        .pipe(
          map((account: ICurrentAccount) => {
            this.cache.saveItem("pass_act", action.password, "pass_act", 1800);
            return new SetCurrentAccountAction(account);
          })
        )
        .pipe(
          finalize(() => {
            this.store.dispatch(new LoadingOff());
          })
        )
        .pipe(
          catchError((error) => {
            this.cache.clearGroup("pass_act");
            this.navigation.goToBack("recargas");
            return of(new Fail(error));
          })
        );
    })
  );

  @Effect({ dispatch: false })
  selectedTopsUps$ = this.actions$.pipe(
    ofType(SET_CURRENT_ACCOUNT_PASSWORD),
    mergeMap((action: SetCurrentAccountPasswordAction) => {
      return this.api
        .post(
          `crearPasswordCuentaCorriente?token=${action.token}`,
          {
            password: action.password,
            password_repite: action.repeatPassword,
          },
          true
        )
        .pipe(
          map((res) => {
            console.log(res);
            if (res.status !== "error") {
              return res.content;
            }
            throw res;
          })
        )
        .pipe(
          map(() => {
            this.storage
              .get("user")
              .then((userJson) => {
                const user = JSON.parse(userJson);
                user.user_act = true;

                return this.storage.set("user", JSON.stringify(user));
              })
              .then(() => {
                this.cache.saveItem(
                  "pass_act",
                  action.password,
                  "pass_act",
                  1800
                );
              });
          })
        )
        .pipe(
          finalize(() => {
            this.store.dispatch(new LoadingOff());
          })
        )
        .pipe(
          catchError((error) => {
            this.store.dispatch(new Fail(error));
            return of(new Fail(error));
          })
        );
    })
  );

  @Effect()
  getDddedo$ = this.actions$.pipe(
    ofType(GET_DDDEDO),
    mergeMap((action: GetDddedoAction) => {
      return this.api
        .get(`getCupoDddedo?token=${action.token}`, null, true)
        .pipe(
          map((res) => {
            if (res.status !== "error") {
              return res.content.cupo;
            }
            throw res;
          })
        )
        .pipe(
          map(
            (res: {
              cupo_disponible: number;
              minimo: number;
              saldo_cuenta_transferencia: number;
              saldo_cuenta_venta: number;
            }) => {
              return new SetDddedoAction(res);
            }
          )
        )
        .pipe(
          catchError(() => {
            return of(new LoadingOff());
          })
        );
    })
  );

  @Effect()
    getBalance$ = this.actions$.pipe(
        ofType(GET_BALANCE),
        mergeMap((action: GetBalanceAction) => {
            return this.api.get(`getSaldoCuentaCorriente?token=${action.token}`, null, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map((res) => {
                        console.log(res,'resp');
                        return new SetBalanceAction(res.saldo,res.totalAmountCredits,res.totalAvalaibleCredits
                        );
                    })
                ).pipe(
                    catchError(() => {
                        return of(new LoadingOff());
                    })
                );
        })
    );

  @Effect()
  getMensaje$ = this.actions$.pipe(
    ofType(GET_MENSAJE),
    mergeMap((action: GetMensajeAction) => {
      return this.api
        .get(`getSegurosMensajeHome?token=${action.token}`, null, true)
        .pipe(
          map((res) => {
            console.log("respuesta de mensaje en home segurosss", res);
            if (res.status !== "error") {
              return res.content;
            }
            throw res;
          })
        )
        .pipe(
          map((res) => {
            return new SetMensajeAction(res);
          })
        )
        // .pipe(
        //   catchError(() => {
        //     return null; //of(new LoadingOff());
        //   })
        // );
    })
  );
}
