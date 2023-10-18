import { Action } from '@ngrx/store';
import { IInsurances, IInsurancesDepartament, IInsurancesCity, IInsurancesMartial } from '../../../../interfaces/IInsurances';

export const INSURANCE = '[Insurances] Insurance';
export const INSURANCES = '[Insurances] Insurances';
export const INSURANCES_COMPLETE = '[Insurances] Insurances complete';
export const INSURANCE_COMPLETE = '[Insurances] Insurance complete';
export const INSURANCES_DEPARTAMENTS = '[Insurances] Insurances departaments';
export const INSURANCES_DEPARTAMENTS_COMPLETE = '[Insurances] Insurances departaments complete';
export const INSURANCES_MEIDOPAGO = '[Insurances] Insurances mediopago';
export const INSURANCES_MEIDOPAGO_COMPLETE = '[Insurances] Insurances mediopago complete';
export const INSURANCES_CITIES = '[Insurances] Insurances cities';
export const INSURANCES_CITIES_COMPLETE = '[Insurances] Insurances cities complete';
export const INSURANCES_MARTIAL = '[Insurances] Insurances martial';
export const INSURANCES_MARTIAL_COMPLETE = '[Insurances] Insurances martial complete';
export const INSURANCE_CANCEL = '[Insurances] Insurances canel';
export const INSURANCE_CANCEL_COMPLETE = '[Insurances] Insurances canel complete';



export class InsurancesAction implements Action {
    readonly type = INSURANCES;

    constructor( public toggle: boolean, public token: string, public id: number ) {}

}

export class InsurancesCompleteAction implements Action {
    readonly type = INSURANCES_COMPLETE;

    constructor( public toggle: boolean, public insurancesElement: IInsurances[]) {}

}
export class InsuranceCompleteAction implements Action {
    readonly type = INSURANCE_COMPLETE;

    constructor( public result: any, public toogle:boolean) {}

}


export class InsurancesDepartamentsAction implements Action {
    readonly type = INSURANCES_DEPARTAMENTS;

    constructor( public toggle: boolean, public token: string ) {}

}

export class InsurancesDepartamentsCompleteAction implements Action {
    readonly type = INSURANCES_DEPARTAMENTS_COMPLETE;

    constructor( public toggle: boolean, public insurancesDepartament: IInsurancesDepartament[]) {}

}

export class InsurancesMeidoPagoCompleteAction implements Action {
         readonly type = INSURANCES_MEIDOPAGO_COMPLETE;

         constructor(public toggle: boolean, public medios: any) {}
       }

export class InsurancesMeidoPagoAction implements Action {
         readonly type = INSURANCES_MEIDOPAGO;

         constructor(
           public toggle: boolean, public token: string,
         ) {}
       }

export class InsurancesCitiesAction implements Action {
    readonly type = INSURANCES_CITIES;

    constructor( public toggle: boolean, public token: string ) {}

}

export class InsurancesCitiesCompleteAction implements Action {
    readonly type = INSURANCES_CITIES_COMPLETE;

    constructor( public toggle: boolean, public insurancesCity: IInsurancesCity[]) {}

}

export class InsurancesMartialAction implements Action {
    readonly type = INSURANCES_MARTIAL;

    constructor( public toggle: boolean, public token: string ) {}

}

export class InsurancesMartialCompleteAction implements Action {
    readonly type = INSURANCES_MARTIAL_COMPLETE;

    constructor( public toggle: boolean, public insurancesMartial: IInsurancesMartial[]) {}

}

export class InsuranceAction implements Action {
    readonly type = INSURANCE;

    constructor( public toggle: boolean, public token: string, public insurance: IInsurances ) {}

}

export class InsuranceCancelAction implements Action {
  readonly type = INSURANCE_CANCEL;

  constructor(public result: any, public toogle: boolean) {}
}

export class InsuranceCancelCompleteAction implements Action {
  readonly type = INSURANCE_CANCEL_COMPLETE;

  constructor(public result: any, public toogle: boolean) {}
}



export type InsuranceActions =
            InsurancesAction |
            InsurancesCompleteAction |
            InsuranceCompleteAction |
            InsuranceAction |
            InsurancesDepartamentsAction |
            InsurancesDepartamentsCompleteAction |
            InsurancesMeidoPagoAction |
            InsurancesMeidoPagoCompleteAction |
            InsurancesCitiesAction |
            InsurancesCitiesCompleteAction |
            InsurancesMartialAction |
            InsurancesMartialCompleteAction |
            InsuranceCancelAction |
            InsuranceCancelCompleteAction;



