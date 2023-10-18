import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, tap, finalize } from 'rxjs/operators';
import { HttpParams, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { Fail } from '../../../compartido/general/store/actions/error.actions';
import { ApiService } from 'src/app/services/api/api.service';
import { LoadingOff } from '../../../compartido/general/store/actions/loading.actions';
import { IInsurances } from '../../../../interfaces/IInsurances';

import {
  INSURANCES_DEPARTAMENTS,
  InsurancesDepartamentsCompleteAction,
  INSURANCES_CITIES,
  InsurancesCitiesCompleteAction,
  InsurancesMartialCompleteAction,
  INSURANCES_MARTIAL,
  INSURANCE_CANCEL_COMPLETE,
  INSURANCE_CANCEL,
  InsuranceCompleteAction,
  InsurancesMeidoPagoCompleteAction,
  InsurancesMeidoPagoAction,
} from "./insurances.actions";

import {
  InsuranceAction,
  InsurancesAction,
  InsurancesCompleteAction,
  INSURANCES,
  INSURANCE,
  INSURANCES_MEIDOPAGO_COMPLETE,
  INSURANCES_MEIDOPAGO,
  InsuranceCancelCompleteAction,
  InsuranceCancelAction,
} from "./insurances.actions";

import {
  InsurancesState,
  InsuranceState,
  InsurancesCompleteState,
  InsurancesDepartamentsState,
  InsurancesDepartamentsCompleteState,
  InsurancesCitiesState,
  InsurancesCitiesCompleteState,
  InsurancesMartialState,
  InsurancesMartialCompleteState,
  InsuranceCompleteState,
  InsuranceCancelCompleteState,
} from "./insurances.reducer";


@Injectable({
  providedIn: "root",
})
export class InsurancesEffect {
  constructor(
    private http: HttpClient,
    private actions$: Actions,
    private microApiService: ApiService,
    private storage: Storage,
    private storeInsurances: Store<InsurancesState>,
    private storeInsurance: Store<InsuranceState>,
    private storeInsurancesComplete: Store<InsurancesCompleteState>,
    private storeInsuranceComplete: Store<InsuranceCompleteState>,
    private storeInsurancesDepartaments: Store<InsurancesDepartamentsState>,
    private storeInsurancesDepartamentsComplete: Store<
    InsurancesDepartamentsCompleteState
    >,
    private storeInsurancessMeidoPago: Store<InsurancesDepartamentsState>,
    private storeInsurancessMeidoPagoComplete: Store<
    InsurancesDepartamentsCompleteState
    >,
    private storeInsurancesCities: Store<InsurancesCitiesState>,
    private storeInsurancesCitiesComplete: Store<InsurancesCitiesCompleteState>,
    private storeInsurancesMartial: Store<InsurancesMartialState>,
    private storeInsurancesMartialComplete: Store<
    InsurancesMartialCompleteState
    >,
    private storeInsuranceCancelComplete: Store<InsuranceCancelCompleteState>,
  ) {}

  @Effect({ dispatch: false })
  InsurancesEffect$ = this.actions$.pipe(
    ofType(INSURANCES),
    mergeMap((action: InsurancesAction) => {
      const params = new HttpParams()
        .append("token", action.token)
        .append("cliente_id", action.id.toString());
      const endPoint = "getSeguros";

      return this.microApiService
        .get(endPoint, params, true)
        .pipe(
          map((data) => {
            // tslint:disable-next-line: max-line-length
            this.storeInsurancesComplete.dispatch(
              new InsurancesCompleteAction(true, data.content.seguros)
            );
            this.storeInsurances.dispatch(new LoadingOff());
          })
        )
        .pipe(
          catchError((error) => {
            return of(new Fail(error));
          })
        );
    })
  );

  @Effect({ dispatch: false })
  InsuranceEffect$ = this.actions$.pipe(
    ofType(INSURANCE),
    mergeMap((action: InsuranceAction) => {
      const params = new HttpParams().append("token", action.token);
      console.log(params);
      console.log(action);
      const endPoint = "insertSeguro?token=" + action.insurance.token;

      return this.microApiService
        .post(endPoint, action.insurance, true)
        .pipe(
          map((data) => {
            console.log(data, "data uno");
            if (data.status != "error") {
              this.storeInsuranceComplete.dispatch(
                new InsuranceCompleteAction(data, true)
              );
              //this.storeInsurance.dispatch(new LoadingOff());
            }
            throw data;
          })
        )
        .pipe(
          finalize(() => {
            console.log("data dos");
            this.storeInsurance.dispatch(new LoadingOff());
          })
        )
        .pipe(
          catchError((error) => {
            return of(new Fail(error));
          })
        );
    })
  );

  @Effect({ dispatch: false })
  InsurancesMeidoPagoEffect$ = this.actions$.pipe(
    ofType(INSURANCES_MEIDOPAGO),
    mergeMap((action: InsurancesMeidoPagoAction) => {
      const params = new HttpParams().append("token", action.token);
      //.append('cliente_id', action.id.toString());
      const endPoint = "getSegurosPagoPor";

      return this.microApiService
        .get(endPoint, params, true)
        .pipe(
          map((data) => {
            // tslint:disable-next-line: max-line-length
            this.storeInsurancessMeidoPagoComplete.dispatch(
              new InsurancesMeidoPagoCompleteAction(true, data.content)
            );
            this.storeInsurancesDepartaments.dispatch(new LoadingOff());
          })
        )
        .pipe(
          catchError((error) => {
            return of(new Fail(error));
          })
        );
    })
  );

  @Effect({ dispatch: false })
  InsurancesDepartamentsEffect$ = this.actions$.pipe(
    ofType(INSURANCES_DEPARTAMENTS),
    mergeMap((action: InsurancesAction) => {
      const params = new HttpParams().append("token", action.token);
      //.append('cliente_id', action.id.toString());
      const endPoint = "getSegurosCiudadesXDepartamentos";

      return this.microApiService
        .get(endPoint, params, true)
        .pipe(
          map((data) => {
            // tslint:disable-next-line: max-line-length
            this.storeInsurancesDepartamentsComplete.dispatch(
              new InsurancesDepartamentsCompleteAction(true, data.content)
            );
            this.storeInsurancesDepartaments.dispatch(new LoadingOff());
          })
        )
        .pipe(
          catchError((error) => {
            return of(new Fail(error));
          })
        );
    })
  );

  @Effect({ dispatch: false })
  InsurancesCitiesEffect$ = this.actions$.pipe(
    ofType(INSURANCES_CITIES),
    mergeMap((action: InsurancesAction) => {
      const params = new HttpParams()
        .append("token", action.token)
        .append("cliente_id", action.id.toString());
      const endPoint = "getSegurosDepartamentos";

      return this.microApiService
        .get(endPoint, params, true)
        .pipe(
          map((data) => {
            console.log(data);
            // tslint:disable-next-line: max-line-length
            this.storeInsurancesCitiesComplete.dispatch(
              new InsurancesCitiesCompleteAction(true, data.content.seguros)
            );
            this.storeInsurancesCities.dispatch(new LoadingOff());
          })
        )
        .pipe(
          catchError((error) => {
            return of(new Fail(error));
          })
        );
    })
  );

  @Effect({ dispatch: false })
  InsurancesMartialEffect$ = this.actions$.pipe(
    ofType(INSURANCES_MARTIAL),
    mergeMap((action: InsurancesAction) => {
      const params = new HttpParams()
        .append("token", action.token)
        .append("cliente_id", action.id.toString());
      const endPoint = "getSegurosDepartamentos";

      return this.microApiService
        .get(endPoint, params, true)
        .pipe(
          map((data) => {
            console.log(data);
            // tslint:disable-next-line: max-line-length
            this.storeInsurancesMartialComplete.dispatch(
              new InsurancesMartialCompleteAction(true, data.content.seguros)
            );
            this.storeInsurancesMartial.dispatch(new LoadingOff());
          })
        )
        .pipe(
          catchError((error) => {
            return of(new Fail(error));
          })
        );
    })
  );

  @Effect({ dispatch: false })
  InsuranceCancelEffect$ = this.actions$.pipe(
    ofType(INSURANCE_CANCEL),
    mergeMap((action: InsuranceCancelAction) => {
      //const params = new HttpParams().append("token", action.result.token);
      const endPoint = "cancelSeguro?token=" + action.result.token;

      return this.microApiService
        .post(endPoint, action.result, true)
        .pipe(
          map((data) => {
            if (data.status != "error") {
              this.storeInsuranceCancelComplete.dispatch(
                new InsuranceCancelCompleteAction(data, true)
              );
              this.storeInsurance.dispatch(new LoadingOff());
            }
            throw data;
          })
        )
        .pipe(
          finalize(() => {
            this.storeInsurance.dispatch(new LoadingOff());
          })
        )
        .pipe(
          catchError((error) => {
            return of(new Fail(error));
          })
        );
    })
  );
}

