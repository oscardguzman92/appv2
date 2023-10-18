import {
  InsuranceActions,
  InsurancesMeidoPagoAction,
  InsurancesMeidoPagoCompleteAction,
  INSURANCE,
  INSURANCES,
  INSURANCES_COMPLETE,
  INSURANCE_COMPLETE,
  INSURANCES_DEPARTAMENTS,
  INSURANCES_DEPARTAMENTS_COMPLETE,
  INSURANCES_CITIES,
  INSURANCES_CITIES_COMPLETE,
  INSURANCES_MARTIAL,
  INSURANCES_MARTIAL_COMPLETE,
  INSURANCES_MEIDOPAGO,
  INSURANCES_MEIDOPAGO_COMPLETE,
  InsuranceCancelCompleteAction,
  INSURANCE_CANCEL_COMPLETE,
} from "./insurances.actions";

import { IInsurances, IInsurancesDepartament, IInsurancesMartial, IInsurancesCity } from '../../../../interfaces/IInsurances';



// InsurancesState
    export interface InsurancesState {
        active: boolean;
        token: string;
        id: number;
    }

    const InitialInsurances: InsurancesState = {
        active: false,
        token: '',
        id: null
    };

    // tslint:disable-next-line: max-line-length
    export function InsurancesReducer(state = InitialInsurances, action: InsuranceActions ): InsurancesState {
        switch (action.type) {
            case  INSURANCES:
                return {
                    ...state,
                    active: action.toggle,
                    token: action.token,
                    id: action.id
                };
            default:
                return state;
        }
    }

// InsurancesCompleteState
    export interface InsurancesCompleteState {
        active: boolean;
        insurancesElement: IInsurances[];
    }

    const InitialInsurancesComplete: InsurancesCompleteState = {
        active: false,
        insurancesElement: []
    };

    // tslint:disable-next-line: max-line-length
    export function InsurancesCompleteReducer(state = InitialInsurancesComplete, action: InsuranceActions ): InsurancesCompleteState {
        switch (action.type) {
            case  INSURANCES_COMPLETE:
                return {
                    ...state,
                    active: action.toggle,
                    insurancesElement: action.insurancesElement,
                };
            default:
                return state;
        }
    }


    //InsuranceCompleteState
    export interface InsuranceCompleteState {
        result: any;
        active: boolean;
    }

    const InitialInsuranceComplete: InsuranceCompleteState = {
        result: false,
        active: false,
    };
    // tslint:disable-next-line: max-line-length
    export function InsuranceCompleteReducer(state = InitialInsuranceComplete, action: InsuranceActions): InsuranceCompleteState {
        switch (action.type) {
            case INSURANCE_COMPLETE:
                return {
                    ...state,
                    result: action.result,
                    active:action.toogle
                };
            default:
                return state;
        }
    }


// InsurancesDepartamentsState
    export interface InsurancesDepartamentsState {
        active: boolean;
        token: string;
    }

    const InitialInsurancesDepartaments: InsurancesDepartamentsState = {
        active: false,
        token: '',
    };

    // tslint:disable-next-line: max-line-length
    export function InsurancesDepartamentsReducer(state = InitialInsurancesDepartaments, action: InsuranceActions ): InsurancesDepartamentsState {
        switch (action.type) {
            case  INSURANCES_DEPARTAMENTS:
                return {
                    ...state,
                    active: action.toggle,
                    token: action.token,
                };
            default:
                return state;
        }
    }

// InsurancesDepartamentsCompleteState
    export interface InsurancesDepartamentsCompleteState {
        active: boolean;
        insurancesDepartament: IInsurancesDepartament[];
    }

    const InitialInsurancesDepartamentsComplete: InsurancesDepartamentsCompleteState = {
        active: false,
        insurancesDepartament: []
    };

    // tslint:disable-next-line: max-line-length
    export function InsurancesDepartamentsCompleteReducer(state = InitialInsurancesDepartamentsComplete, action: InsuranceActions ): InsurancesDepartamentsCompleteState {
        switch (action.type) {
            case  INSURANCES_DEPARTAMENTS_COMPLETE:
                return {
                    ...state,
                    active: action.toggle,
                    insurancesDepartament: action.insurancesDepartament,
                };
            default:
                return state;
        }
    }

// InsurancesCitiesState
    export interface InsurancesCitiesState {
        active: boolean;
        token: string;
    }

    const InitialInsurancesCities: InsurancesCitiesState = {
        active: false,
        token: '',
    };

    // tslint:disable-next-line: max-line-length
    export function InsurancesCitiesReducer(state = InitialInsurancesCities, action: InsuranceActions ): InsurancesCitiesState {
        switch (action.type) {
            case  INSURANCES_CITIES:
                return {
                    ...state,
                    active: action.toggle,
                    token: action.token,
                };
            default:
                return state;
        }
    }

// InsurancesCitiesCompleteState
    export interface InsurancesCitiesCompleteState {
        active: boolean;
        insurancesCity: IInsurancesCity[];
    }

    const InitialInsurancesCitiesComplete: InsurancesCitiesCompleteState = {
        active: false,
        insurancesCity: []
    };

    // tslint:disable-next-line: max-line-length
    export function InsurancesCitiesCompleteReducer(state = InitialInsurancesCitiesComplete, action: InsuranceActions ): InsurancesCitiesCompleteState {
        switch (action.type) {
            case  INSURANCES_CITIES_COMPLETE:
                return {
                    ...state,
                    active: action.toggle,
                    insurancesCity: action.insurancesCity,
                };
            default:
                return state;
        }
    }

// InsurancesMartialState
    export interface InsurancesMartialState {
        active: boolean;
        token: string;
    }

    const InitialInsurancesMartial: InsurancesMartialState = {
        active: false,
        token: '',
    };

    // tslint:disable-next-line: max-line-length
    export function InsurancesMartialReducer(state = InitialInsurancesMartial, action: InsuranceActions ): InsurancesMartialState {
        switch (action.type) {
            case  INSURANCES_MARTIAL:
                return {
                    ...state,
                    active: action.toggle,
                    token: action.token,
                };
            default:
                return state;
        }
    }

// InsurancesMartialCompleteState
    export interface InsurancesMartialCompleteState {
        active: boolean;
        insurancesMartial: IInsurancesMartial[];
    }

    const InitialInsurancesMartialComplete: InsurancesMartialCompleteState = {
        active: false,
        insurancesMartial: []
    };

    // tslint:disable-next-line: max-line-length
    export function InsurancesMartialCompleteReducer(state = InitialInsurancesMartialComplete, action: InsuranceActions ): InsurancesMartialCompleteState {
        switch (action.type) {
            case  INSURANCES_MARTIAL_COMPLETE:
                return {
                    ...state,
                    active: action.toggle,
                    insurancesMartial: action.insurancesMartial,
                };
            default:
                return state;
        }
    }




// InsuranceState
export interface InsuranceState {
    active: boolean;
    token: string;
    insurance: IInsurances;
}

const InitialInsurance: InsuranceState = {
    active: false,
    token: '',
    insurance: null
};

// tslint:disable-next-line: max-line-length
export function InsuranceReducer(state = InitialInsurance, action: InsuranceActions ): InsuranceState {
    switch (action.type) {
        case  INSURANCE:
            return {
                ...state,
                active: action.toggle,
                token: action.token,
                insurance: action.insurance
            };
        default:
            return state;
    }
}


// InsuranceState
export interface InsuranceMeidoPagoState {
  toogle: boolean;
  token: string;
}

const InitialInsurancesMeidoPago: InsuranceMeidoPagoState = {
  toogle: false,
  token: "",
};
// tslint:disable-next-line: max-line-length
export function InsurancesMeidoPagoReducer(state = InitialInsurancesMeidoPago, action: InsurancesMeidoPagoAction ): InsuranceMeidoPagoState {
    switch (action.type) {
        case  INSURANCES_MEIDOPAGO:
            return {
                ...state,
                toogle: action.toggle,
                token: action.token,
            };
        default:
            return state;
    }
}

// InsuranceState
export interface InsuranceMeidoPagoCompleteState {
  toogle: boolean;
  medios: any;
}

const InitialInsurancesMeidoPagoComplete: InsuranceMeidoPagoCompleteState = {
  toogle: false,
  medios: [],
};
// tslint:disable-next-line: max-line-length
export function InsurancesMeidoPagoCompleteReducer(state = InitialInsurancesMeidoPagoComplete, action: InsurancesMeidoPagoCompleteAction ): InsuranceMeidoPagoCompleteState {
    switch (action.type) {
        case  INSURANCES_MEIDOPAGO_COMPLETE:
            return {
                ...state,
                toogle: action.toggle,
                medios: action.medios,
            };
        default:
            return state;
    }
}

    //InsuranceCancelCompleteState
    export interface InsuranceCancelCompleteState {
        result: any;
        active: boolean;
    }

    const InitialInsuranceCancelComplete: InsuranceCancelCompleteState = {
        result: false,
        active: false,
    };
    // tslint:disable-next-line: max-line-length
    export function InsuranceCancelCompleteReducer(state = InitialInsuranceCancelComplete, action: InsuranceCancelCompleteAction): InsuranceCancelCompleteState {
        switch (action.type) {
            case INSURANCE_CANCEL_COMPLETE:
                return {
                    ...state,
                    result: action.result,
                    active:action.toogle
                };
            default:
                return state;
        }
    }
