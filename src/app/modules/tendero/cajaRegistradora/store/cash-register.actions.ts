import { Action } from '@ngrx/store';
import { CashRegisterModel, CashRegisterSalesModel } from '../../../../models/CashRegister';
import { ISale, IClient, IProduct, IShopkeeperProduct } from '../../../../interfaces/ICashRegisterSale';

export const CASH_REGISTER_IN_SALE = '[Cash Register] Cash register in sale';
export const CASH_REGISTER_IN_SALE_DATA = '[Cash Register] Cash register in sale data';
export const CASH_REGISTER_TREE = '[Cash Register] Cash register tree';
export const CASH_REGISTER_SHOPKEEPER_PRODUCT = '[Cash Register] Cash register shopkeeper product';
export const CASH_REGISTER_PRODUCTS = '[Cash Register] Cash register products';
export const CASH_REGISTER_NEW_PRODUCT = '[Cash Register] Cash new register product';
export const CASH_REGISTER_PRODUCT = '[Cash Register] Cash register product';
export const CASH_REGISTER_KPI = '[Cash Register] Cash register kpi';
export const CASH_REGISTER_PRODUCT_COMPLETE = '[Cash Register] Cash register product complete';
export const CASH_REGISTER_SEARCH_PRODUCTS = '[Cash Register] Cash register search products';
export const CASH_REGISTER_SEARCH_PRODUCTS_COMPLETE = '[Cash Register] Cash register search products complete';
export const CASH_REGISTER_SEARCH_CLIENTS = '[Cash Register] Cash register search clients';
export const CASH_REGISTER_SEARCH_CLIENTS_COMPLETE = '[Cash Register] Cash register search clients complete';
export const CASH_REGISTER_SALE = '[Cash Register] Cash register sale';
export const CASH_REGISTER_SALES = '[Cash Register] Cash register sales';
export const CASH_REGISTER_SALES_COMPLETE = '[Cash Register] Cash register sales complete';
export const CASH_REGISTER_CLIENT = '[Cash Register] Cash register client';
export const CASH_REGISTER_CLIENT_COMPLETE = '[Cash Register] Cash register client complete';
export const CASH_REGISTER_FILTER_SALES = '[Cash Register] Cash register filter sales';
export const CASH_REGISTER_PAY_SALE = '[Cash Register] Cash register pay sale';
export const CASH_REGISTER_REMINDER_PAY = '[Cash Register] Cash register reminder pay';
export const CASH_REGISTER_TAGS = '[Cash Register] Cash register tags';
export const CASH_REGISTER_TAG = '[Cash Register] Cash register tag';


export class CashRegisterInSaleAction implements Action {
    readonly type = CASH_REGISTER_IN_SALE;

    constructor(public toggle: boolean, public inSale: boolean) {}
}

export class CashRegisterInSaleDataAction implements Action {
    readonly type = CASH_REGISTER_IN_SALE_DATA;

    constructor(public toggle: boolean, public CashRegisterObject: CashRegisterModel) {}
}

export class CashRegisterTreeAction implements Action {
    readonly type = CASH_REGISTER_TREE;

    constructor(public toggle: boolean, public token: string) {}

}

export class CashRegisterNewProductAction implements Action {
    readonly type = CASH_REGISTER_NEW_PRODUCT;

    constructor(public toggle: boolean, public token: string, public product: IProduct, public categories: any, public file: string) {}

}

export class CashRegisterProductAction implements Action {
    readonly type = CASH_REGISTER_PRODUCT;

    constructor(public toggle: boolean, public token: string, public filter: number) {}

}

export class CashRegisterProductCompleteAction implements Action {
    readonly type = CASH_REGISTER_PRODUCT_COMPLETE;

    constructor(public toggle: boolean, public ShopkeeperProduct: IShopkeeperProduct) {}

}

export class CashRegisterProductsAction implements Action {
    readonly type = CASH_REGISTER_PRODUCTS;

    constructor(public toggle: boolean, public token: string, public filter: number) {}

}

export class CashRegisterShopkeeperProductAction implements Action {
    readonly type = CASH_REGISTER_SHOPKEEPER_PRODUCT;

    constructor(public toggle: boolean, public token: string, public ShopkeeperProduct: IShopkeeperProduct) {}

}

export class CashRegisterSearchClientsAction implements Action {
    readonly type = CASH_REGISTER_SEARCH_CLIENTS;

    constructor(public toggle: boolean, public token: string, public shape: string, public filter: string) {}

}

export class CashRegisterSearchClientsCompleteAction implements Action {
    readonly type = CASH_REGISTER_SEARCH_CLIENTS_COMPLETE;

    constructor( public toggle: boolean, public clients: IClient[]) {}

}

export class CashRegisterKpiAction implements Action {
    readonly type = CASH_REGISTER_KPI;

    constructor(public toggle: boolean, public token: string,  public shopkeeper: number) {}

}

export class CashRegisterSearchProductsAction implements Action {
    readonly type = CASH_REGISTER_SEARCH_PRODUCTS;

    constructor(public toggle: boolean, public token: string, public shape: string, public filter: string) {}

}

export class CashRegisterSearchProductsCompleteAction implements Action {
    readonly type = CASH_REGISTER_SEARCH_PRODUCTS_COMPLETE;

    constructor( public toggle: boolean, public products: IProduct[]) {}

}

export class CashRegisterClientAction implements Action {
    readonly type = CASH_REGISTER_CLIENT;

    constructor(public toggle: boolean, public token: string, public phhone: number) {}

}

export class CashRegisterSalesAction implements Action {
    readonly type = CASH_REGISTER_SALES;

    constructor( public toggle: boolean, public token: string, public shopkeeper: number) {}

}

export class CashRegisterSalesCompleteAction implements Action {
    readonly type = CASH_REGISTER_SALES_COMPLETE;

    constructor( public toggle: boolean, public CashRegisterSalesObject: CashRegisterSalesModel) {}

}

export class CashRegisterSaleAction implements Action {
    readonly type = CASH_REGISTER_SALE;

    constructor( public toggle: boolean, public token: string, public CashRegisterObject: CashRegisterModel) {}
}

export class CashRegisterFilterSalesAction implements Action {
    readonly type = CASH_REGISTER_FILTER_SALES;

    constructor( public toggle: boolean, public token: string, public filter: any, public option: string) {}
}

export class CashRegisterPaySaleAction implements Action {
    readonly type = CASH_REGISTER_PAY_SALE;

    constructor( public toggle: boolean, public token: string, public sale_id: string) {}
}

export class CashRegisterReminderPayAction implements Action {
    readonly type = CASH_REGISTER_REMINDER_PAY;

    constructor( public toggle: boolean, public token: string, public phone: string, public message: string) {}
}

export class CashRegisterTagsAction implements Action {
    readonly type = CASH_REGISTER_TAGS;

    constructor(public toggle: boolean, public token: string,  public shopkeeper: number) {}

}

export class CashRegisterTagAction implements Action {
    readonly type = CASH_REGISTER_TAG;

    constructor( public toggle: boolean, public token: string, public shopkeeper: number,  public tag: string) {}
}

export type CashRegistersActions =
CashRegisterInSaleAction |
CashRegisterInSaleDataAction |
CashRegisterTreeAction |
CashRegisterNewProductAction |
CashRegisterShopkeeperProductAction |
CashRegisterProductsAction |
CashRegisterProductAction |
CashRegisterProductCompleteAction |
CashRegisterSearchProductsAction |
CashRegisterSearchProductsCompleteAction |
CashRegisterSearchClientsAction |
CashRegisterSearchClientsCompleteAction |
CashRegisterSaleAction |
CashRegisterSalesAction |
CashRegisterSalesCompleteAction |
CashRegisterFilterSalesAction |
CashRegisterPaySaleAction |
CashRegisterReminderPayAction |
CashRegisterKpiAction |
CashRegisterTagsAction |
CashRegisterTagAction;


