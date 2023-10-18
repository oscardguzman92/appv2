import {
    CashRegistersActions,
    CASH_REGISTER_IN_SALE,
    CASH_REGISTER_IN_SALE_DATA,
    CASH_REGISTER_TREE,
    CASH_REGISTER_NEW_PRODUCT,
    CASH_REGISTER_PRODUCT,
    CASH_REGISTER_PRODUCT_COMPLETE,
    CASH_REGISTER_SHOPKEEPER_PRODUCT,
    CASH_REGISTER_PRODUCTS,
    CASH_REGISTER_SEARCH_PRODUCTS,
    CASH_REGISTER_SEARCH_PRODUCTS_COMPLETE,
    CASH_REGISTER_SEARCH_CLIENTS,
    CASH_REGISTER_SEARCH_CLIENTS_COMPLETE,
    CASH_REGISTER_SALE,
    CASH_REGISTER_SALES,
    CASH_REGISTER_SALES_COMPLETE,
    CASH_REGISTER_FILTER_SALES,
    CASH_REGISTER_PAY_SALE,
    CASH_REGISTER_REMINDER_PAY,
    CASH_REGISTER_KPI,
    CASH_REGISTER_TAG,
    CASH_REGISTER_TAGS
} from './cash-register.actions';

import { CashRegisterModel, CashRegisterSalesModel } from '../../../../models/CashRegister';
import { IProduct, IShopkeeperProduct, IClient } from '../../../../interfaces/ICashRegisterSale';

// CashRegisterInSaleState
    export interface CashRegisterInSaleState {
        active: boolean;
        token: string;
        inSale: boolean;
    }

    const CashRegisterInitialInSale: CashRegisterInSaleState = {
        token: '',
        active: false,
        inSale: false
    };

    export function CashRegisterInSaleReducer(state = CashRegisterInitialInSale, action: CashRegistersActions ): CashRegisterInSaleState {
        switch (action.type) {
            case  CASH_REGISTER_IN_SALE:
                return {
                    ...state,
                    active: action.toggle,
                    inSale: action.inSale
                };
            default:
                return state;
        }
    }

// CashRegisterInSaleDataState
    export interface CashRegisterInSaleDataState {
        active: boolean;
        token: string;
        CashRegisterData: CashRegisterModel;
    }

    const CashRegisterInitialInSaleData: CashRegisterInSaleDataState = {
        CashRegisterData: null,
        token: '',
        active: false
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterInSaleDataReducer(state = CashRegisterInitialInSaleData, action: CashRegistersActions ): CashRegisterInSaleDataState {
        switch (action.type) {
            case  CASH_REGISTER_IN_SALE_DATA:
                return {
                    ...state,
                    active: action.toggle,
                    CashRegisterData: action.CashRegisterObject
                };
            default:
                return state;
        }
    }

// CashRegisterTreeState
    export interface CashRegisterTreeState {
        active: boolean;
        token: string;
    }

    const InitialCashRegisterTree: CashRegisterTreeState = {
        token: '',
        active: false
    };

    export function CashRegisterTreeReducer(state = InitialCashRegisterTree, action: CashRegistersActions ): CashRegisterTreeState {
        switch (action.type) {
            case  CASH_REGISTER_TREE:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle
                };
            default:
                return state;
        }
    }

// CashRegisterProductState
    export interface CashRegisterProductState {
        active: boolean;
        token: string;
        filter: number;
    }

    const InitialCashRegisterProduct: CashRegisterProductState = {
        token: '',
        active: false,
        filter: 0
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterProductReducer(state = InitialCashRegisterProduct, action: CashRegistersActions ): CashRegisterProductState {
        switch (action.type) {
            case  CASH_REGISTER_PRODUCT:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                    filter: action.filter
                };
            default:
                return state;
        }
    }

// CashRegisterKpiState
    export interface CashRegisterKpiState {
        active: boolean;
        token: string;
        shopkeeper: number;
    }

    const InitialCashRegisterKpi: CashRegisterKpiState = {
        active: false,
        token: '',
        shopkeeper: 0,
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterKpiReducer(state = InitialCashRegisterKpi, action: CashRegistersActions ): CashRegisterKpiState {
        switch (action.type) {
            case  CASH_REGISTER_KPI:
                return {
                    ...state,
                    token: action.token,
                    shopkeeper: action.shopkeeper,
                };
            default:
                return state;
        }
    }


// CashRegisterProductCompleteState
    export interface CashRegisterProductCompleteState {
        active: boolean;
        token: string;
        ShopkeeperProduct: IShopkeeperProduct;
    }

    const CashRegisterInitialProductComplete: CashRegisterProductCompleteState = {
        ShopkeeperProduct: null,
        token: '',
        active: false
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterProductCompleteReducer(state = CashRegisterInitialProductComplete, action: CashRegistersActions ): CashRegisterProductCompleteState {
        switch (action.type) {
            case  CASH_REGISTER_PRODUCT_COMPLETE:
                return {
                    ...state,
                    active: action.toggle,
                    ShopkeeperProduct: action.ShopkeeperProduct
                };
            default:
                return state;
        }
    }


// CashRegisterNewProductState
    export interface CashRegisterNewProductState {
        active: boolean;
        token: string;
        product: IProduct;
        file: string;
        categories: [];
    }

    const CashRegisterInitialNewProduct: CashRegisterNewProductState = {
        token: '',
        active: false,
        product: null,
        file: '',
        categories: []
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterNewProductReducer(state = CashRegisterInitialNewProduct, action: CashRegistersActions ): CashRegisterNewProductState {
        switch (action.type) {
            case  CASH_REGISTER_NEW_PRODUCT:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                    product: action.product,
                    categories: action.categories
                };
            default:
                return state;
        }
    }



// CashRegisterShopkeeperProductState
    export interface CashRegisterShopkeeperProductState {
        active: boolean;
        token: string;
        ShopkeeperProduct: IShopkeeperProduct;
    }

    const CashRegisterInitialShopkeeperProduct: CashRegisterShopkeeperProductState = {
        ShopkeeperProduct: null,
        token: '',
        active: false
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterShopkeeperProductReducer(state = CashRegisterInitialShopkeeperProduct, action: CashRegistersActions ): CashRegisterShopkeeperProductState {
        switch (action.type) {
            case  CASH_REGISTER_SHOPKEEPER_PRODUCT:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                    ShopkeeperProduct: action.ShopkeeperProduct
                };
            default:
                return state;
        }
    }

// CashRegisterProductsState
    export interface CashRegisterProductsState {
        active: boolean;
        token: string;
        filter: number;
    }

    const InitialCashRegisterProducts: CashRegisterProductsState = {
        token: '',
        active: false,
        filter: 0
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterProductsReducer(state = InitialCashRegisterProducts, action: CashRegistersActions ): CashRegisterProductsState {
        switch (action.type) {
            case  CASH_REGISTER_PRODUCTS:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                    filter: action.filter
                };
            default:
                return state;
        }
    }

// CashRegisterSearchProductsState
    export interface CashRegisterSearchProductsState {
        active: boolean;
        token: string;
    }

    const InitialCashRegisterSearchProducts: CashRegisterSearchProductsState = {
        token: '',
        active: false,
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterSearchProductsReducer(state = InitialCashRegisterSearchProducts, action: CashRegistersActions ): CashRegisterSearchProductsState {
        switch (action.type) {
            case  CASH_REGISTER_SEARCH_PRODUCTS:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                };
            default:
                return state;
        }
    }

// CashRegisterSearchProductsCompleteState
    export interface CashRegisterSearchProductsCompleteState {
        active: boolean;
        token: string;
        products: IProduct[];
    }

    const InitialCashRegisterSearchProductsComplete: CashRegisterSearchProductsCompleteState = {
        token: '',
        active: false,
        products: []
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterSearchProductsCompleteReducer(state = InitialCashRegisterSearchProductsComplete, action: CashRegistersActions ): CashRegisterSearchProductsCompleteState {
        switch (action.type) {
            case  CASH_REGISTER_SEARCH_PRODUCTS_COMPLETE:
                return {
                    ...state,
                    active: action.toggle,
                    products: action.products
                };
            default:
                return state;
        }
    }

// CashRegisterSearchClientsState
    export interface CashRegisterSearchClientsState {
        active: boolean;
        token: string;
    }

    const InitialCashRegisterSearchClients: CashRegisterSearchClientsState = {
        token: '',
        active: false,
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterSearchClientsReducer(state = InitialCashRegisterSearchClients, action: CashRegistersActions ): CashRegisterSearchClientsState {
        switch (action.type) {
            case  CASH_REGISTER_SEARCH_CLIENTS:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                };
            default:
                return state;
        }
    }

// CashRegisterSearchClientsCompleteState
    export interface CashRegisterSearchClientsCompleteState {
        active: boolean;
        token: string;
        clients: IClient[];
    }

    const InitialCashRegisterSearchClientsComplete: CashRegisterSearchClientsCompleteState = {
        token: '',
        active: false,
        clients: []
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterSearchClientsCompleteReducer(state = InitialCashRegisterSearchClientsComplete, action: CashRegistersActions ): CashRegisterSearchClientsCompleteState {
        switch (action.type) {
            case  CASH_REGISTER_SEARCH_CLIENTS_COMPLETE:
                return {
                    ...state,
                    active: action.toggle,
                    clients: action.clients
                };
            default:
                return state;
        }
    }

// CashRegisterSaleState
    export interface CashRegisterSaleState {
        active: boolean;
        token: string;
        CashRegisterData: CashRegisterModel;
    }

    const CashRegisterInitialSale: CashRegisterSaleState = {
        token: '',
        active: false,
        CashRegisterData: null
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterSaleReducer(state = CashRegisterInitialSale, action: CashRegistersActions ): CashRegisterSaleState {
        switch (action.type) {
            case  CASH_REGISTER_SALE:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                    CashRegisterData: action.CashRegisterObject
                };
            default:
                return state;
        }
    }


// CashRegisterSalesState
    export interface CashRegisterSalesState {
        active: boolean;
        token: string;
        shopkeeper: number;
    }

    const InitialCashRegisterSales: CashRegisterSalesState = {
        token: '',
        active: false,
        shopkeeper: 0,
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterSalesReducer(state = InitialCashRegisterSales, action: CashRegistersActions ): CashRegisterSalesState {
        switch (action.type) {
            case  CASH_REGISTER_SALES:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                    shopkeeper: action.shopkeeper,
                };
            default:
                return state;
        }
    }

// CashRegisterSalesCompleteState
    export interface CashRegisterSalesCompleteState {
        active: boolean;
        token: string;
        CashRegisterSalesData: CashRegisterSalesModel;
    }

    const InitialCashRegisterSalesComplete: CashRegisterSalesCompleteState = {
        token: '',
        active: false,
        CashRegisterSalesData: null
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterSalesCompleteReducer(state = InitialCashRegisterSalesComplete, action: CashRegistersActions ): CashRegisterSalesCompleteState {
        switch (action.type) {
            case  CASH_REGISTER_SALES_COMPLETE:
                return {
                    ...state,
                    active: action.toggle,
                    CashRegisterSalesData: action.CashRegisterSalesObject

                };
            default:
                return state;
        }
    }

// CashRegisterFilterSalesState
    export interface CashRegisterFilterSalesState {
        active: boolean;
        token: string;
        filter: any;
        option: string;
    }

    const CashRegisterInitialFilterSales: CashRegisterFilterSalesState = {
        token: '',
        active: false,
        filter: [],
        option: '',
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterFilterSalesReducer(state = CashRegisterInitialFilterSales, action: CashRegistersActions ): CashRegisterFilterSalesState {
        switch (action.type) {
            case  CASH_REGISTER_FILTER_SALES:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                    filter: action.filter,
                    option: action.option
                };
            default:
                return state;
        }
    }

// CashRegisterPaySaleState
    export interface CashRegisterPaySaleState {
        active: boolean;
        token: string;
        sale_id: string;
    }

    const CashRegisterInitialPaySale: CashRegisterPaySaleState = {
        token: '',
        active: false,
        sale_id: '',
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterPaySaleReducer(state = CashRegisterInitialPaySale, action: CashRegistersActions ): CashRegisterPaySaleState {
        switch (action.type) {
            case  CASH_REGISTER_PAY_SALE:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                    sale_id: action.sale_id
                };
            default:
                return state;
        }
    }

// CashRegisterReminderPayState
    export interface CashRegisterReminderPayState {
        active: boolean;
        token: string;
        phone: string;
        message: string;
    }

    const CashRegisterInitialReminderPay: CashRegisterReminderPayState = {
        token: '',
        active: false,
        phone: '',
        message: '',
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterReminderPayReducer(state = CashRegisterInitialReminderPay, action: CashRegistersActions ): CashRegisterReminderPayState {
        switch (action.type) {
            case  CASH_REGISTER_REMINDER_PAY:
                return {
                    ...state,
                    token: action.token,
                    active: action.toggle,
                    phone: action.phone,
                    message: action.message
                };
            default:
                return state;
        }
    }

// CashRegisterTagState
    export interface CashRegisterTagState {
        active: boolean;
        token: string;
        tag: string;
        shopkeeper: number;
    }

    const InitialCashRegisterTag: CashRegisterTagState = {
        active: false,
        token: '',
        tag: '',
        shopkeeper: 0,
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterTagReducer(state = InitialCashRegisterTag, action: CashRegistersActions ): CashRegisterTagState {
        switch (action.type) {
            case  CASH_REGISTER_TAG:
                return {
                    ...state,
                    token: action.token,
                    tag: action.tag,
                    shopkeeper: action.shopkeeper,
                };
            default:
                return state;
        }
    }

// CashRegisterTagsState
    export interface CashRegisterTagsState {
        active: boolean;
        token: string;
        shopkeeper: number;
    }

    const InitialCashRegisterTags: CashRegisterTagsState = {
        active: false,
        token: '',
        shopkeeper: 0,
    };

    // tslint:disable-next-line: max-line-length
    export function CashRegisterTagsReducer(state = InitialCashRegisterTags, action: CashRegistersActions ): CashRegisterTagsState {
        switch (action.type) {
            case  CASH_REGISTER_TAGS:
                return {
                    ...state,
                    token: action.token,
                    shopkeeper: action.shopkeeper,
                };
            default:
                return state;
        }
    }
