import {ActionReducerMap} from '@ngrx/store';
import {authReducer, AuthState} from './auth/auth.reducer';
import {errorReducer, ErrorState} from '../modules/compartido/general/store/reducers/error.reducer';
import {loadingReducer, LoadingState} from '../modules/compartido/general/store/reducers/loading.reducer';
// tslint:disable-next-line: max-line-length
import {
    CashRegisterInSaleState,
    CashRegisterInSaleReducer,
    CashRegisterInSaleDataState,
    CashRegisterInSaleDataReducer,
    CashRegisterTreeState,
    CashRegisterTreeReducer,
    CashRegisterNewProductState,
    CashRegisterNewProductReducer,
    CashRegisterShopkeeperProductState,
    CashRegisterShopkeeperProductReducer,
    CashRegisterProductState,
    CashRegisterProductReducer,
    CashRegisterProductCompleteState,
    CashRegisterProductCompleteReducer,
    CashRegisterProductsState,
    CashRegisterProductsReducer,
    CashRegisterSearchProductsState,
    CashRegisterSearchProductsReducer,
    CashRegisterSearchProductsCompleteState,
    CashRegisterSearchProductsCompleteReducer,
    CashRegisterSearchClientsState,
    CashRegisterSearchClientsReducer,
    CashRegisterSearchClientsCompleteState,
    CashRegisterSearchClientsCompleteReducer,
    CashRegisterSalesState,
    CashRegisterSalesReducer,
    CashRegisterSalesCompleteState,
    CashRegisterSalesCompleteReducer,
    CashRegisterFilterSalesState,
    CashRegisterFilterSalesReducer,
    CashRegisterPaySaleState,
    CashRegisterPaySaleReducer,
    CashRegisterReminderPayState,
    CashRegisterReminderPayReducer,
    CashRegisterKpiState,
    CashRegisterKpiReducer,
    CashRegisterTagState,
    CashRegisterTagReducer,
    CashRegisterTagsState,
    CashRegisterTagsReducer,
} from '../modules/tendero/cajaRegistradora/store/cash-register.reducer';
import {
    OfflineState, offlineReducer
} from '../modules/vendedor/compartido/components/compartido-menu-vendedor/store/reducers/offline.reducer';
import {registerReducer, RegisterState} from '../modules/tendero/registro/store/registro.reducer';
import {successReducer, SuccessState} from '../modules/compartido/general/store/reducers/success.reducer';
import {offlineDynamicReducer, OfflineDynamicState} from '../modules/vendedor/compartido/store/offlineDynamic/offlineDynamic.reducer';
import {
    InsuranceReducer,
    InsuranceState,
    InsurancesReducer,
    InsurancesState,
    InsuranceCompleteState,
    InsurancesCompleteReducer,
    InsuranceCompleteReducer,
    InsurancesCompleteState,
    InsurancesDepartamentsReducer,
    InsurancesDepartamentsState,
    InsurancesDepartamentsCompleteReducer,
    InsurancesDepartamentsCompleteState,
    InsurancesCitiesReducer,
    InsurancesCitiesState,
    InsurancesCitiesCompleteReducer,
    InsurancesCitiesCompleteState,
    InsurancesMartialReducer,
    InsurancesMartialState,
    InsurancesMartialCompleteReducer,
    InsurancesMartialCompleteState
} from '../modules/tendero/seguros/store/insurances.reducer';
import {encuestasReducer, SurveysState} from '../modules/compartido/encuestas/store/encuestas.reducer';
import {
    HelpTreeState,
    HelpTreeCompleteState,
    HelpTreeDistributorsState,
    HelpTreeDistributorsCompleteState,
    HelpTreeReducer,
    HelpTreeCompleteReducer,
    HelpTreeDistributorsReducer,
    HelpTreeDistributorsCompleteReducer
} from '../modules/compartido/arbolAyuda/store/help-tree.reducer';


export interface AppState {
    auth: AuthState;
    error: ErrorState;
    loading: LoadingState;
    offline: OfflineState;
    offlineDynamic: OfflineDynamicState;
    register: RegisterState;
    success: SuccessState;
    CashRegisterInSale: CashRegisterInSaleState;
    CashRegisterInSaleData: CashRegisterInSaleDataState;
    CashRegisterTree: CashRegisterTreeState;
    CashRegisterShopkeeperProduct: CashRegisterShopkeeperProductState;
    CashRegisterProducts: CashRegisterProductsState;
    CashRegisterProduct: CashRegisterProductState;
    CashRegisterProductComplete: CashRegisterProductCompleteState;
    CashRegisterSearchProducts: CashRegisterSearchProductsState;
    CashRegisterSearchProductsComplete: CashRegisterSearchProductsCompleteState;
    CashRegisterSearchClients: CashRegisterSearchClientsState;
    CashRegisterSearchClientsComplete: CashRegisterSearchClientsCompleteState;
    CashRegisterSales: CashRegisterSalesState;
    CashRegisterSalesComplete: CashRegisterSalesCompleteState;
    CashRegisterNewProduct: CashRegisterNewProductState;
    CashRegisterFilterSales: CashRegisterFilterSalesState;
    CashRegisterPaySale: CashRegisterPaySaleState;
    CashRegisterReminderPay: CashRegisterReminderPayState;
    Insurance: InsuranceState;
    Insurances: InsurancesState;
    InsurancesComplete: InsurancesCompleteState;
    InsurancesDepartaments: InsurancesDepartamentsState;
    InsurancesDepartamentsComplete: InsurancesDepartamentsCompleteState;
    InsurancesCities: InsurancesCitiesState;
    InsurancesCitiesComplete: InsurancesCitiesCompleteState;
    InsurancesMartial: InsurancesMartialState;
    InsurancesMartialComplete: InsurancesMartialCompleteState;
    InsuranceComplete: InsuranceCompleteState;
    CashRegisterKpi: CashRegisterKpiState;
    CashRegisterTag: CashRegisterTagState;
    CashRegisterTags: CashRegisterTagsState;
    EncuestaState: SurveysState;
    HelpTree: HelpTreeState;
    HelpTreeComplete: HelpTreeCompleteState;
    HelpTreeDistributors: HelpTreeDistributorsState;
    HelpTreeDistributorsComplete: HelpTreeDistributorsCompleteState;
}

export const appReducers: ActionReducerMap<AppState> = {
    auth: authReducer,
    error: errorReducer,
    loading: loadingReducer,
    offline: offlineReducer,
    offlineDynamic: offlineDynamicReducer,
    register: registerReducer,
    success: successReducer,
    CashRegisterInSale: CashRegisterInSaleReducer,
    CashRegisterInSaleData: CashRegisterInSaleDataReducer,
    CashRegisterTree: CashRegisterTreeReducer,
    CashRegisterShopkeeperProduct: CashRegisterShopkeeperProductReducer,
    CashRegisterProducts: CashRegisterProductsReducer,
    CashRegisterProduct: CashRegisterProductReducer,
    CashRegisterProductComplete: CashRegisterProductCompleteReducer,
    CashRegisterSearchProducts: CashRegisterSearchProductsReducer,
    CashRegisterSearchProductsComplete: CashRegisterSearchProductsCompleteReducer,
    CashRegisterSearchClients: CashRegisterSearchClientsReducer,
    CashRegisterSearchClientsComplete: CashRegisterSearchClientsCompleteReducer,
    CashRegisterSales: CashRegisterSalesReducer,
    CashRegisterSalesComplete: CashRegisterSalesCompleteReducer,
    CashRegisterNewProduct: CashRegisterNewProductReducer,
    CashRegisterFilterSales: CashRegisterFilterSalesReducer,
    CashRegisterPaySale: CashRegisterPaySaleReducer,
    CashRegisterReminderPay: CashRegisterReminderPayReducer,
    Insurance: InsuranceReducer,
    Insurances: InsurancesReducer,
    InsurancesComplete: InsurancesCompleteReducer,
    InsurancesDepartaments: InsurancesDepartamentsReducer,
    InsurancesDepartamentsComplete: InsurancesDepartamentsCompleteReducer,
    InsurancesCities: InsurancesCitiesReducer,
    InsurancesCitiesComplete: InsurancesCitiesCompleteReducer,
    InsurancesMartial: InsurancesMartialReducer,
    InsurancesMartialComplete: InsurancesMartialCompleteReducer,
    InsuranceComplete: InsuranceCompleteReducer,
    CashRegisterKpi: CashRegisterKpiReducer,
    CashRegisterTag: CashRegisterTagReducer,
    CashRegisterTags: CashRegisterTagsReducer,
    EncuestaState: encuestasReducer,
    HelpTree: HelpTreeReducer,
    HelpTreeComplete: HelpTreeCompleteReducer,
    HelpTreeDistributors: HelpTreeDistributorsReducer,
    HelpTreeDistributorsComplete: HelpTreeDistributorsCompleteReducer,
};
