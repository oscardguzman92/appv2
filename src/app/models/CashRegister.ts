import { ISale, IClient, IProduct } from '../interfaces/ICashRegisterSale';
export class CashRegisterModel {
    public products: IProduct[];
    public sale: ISale;
    public client: IClient;
    constructor(cashRegisterByService: any) {
        Object.assign(this, cashRegisterByService);
    }

}

export class CashRegisterSalesModel {
    public products: IProduct[];
    public sale: ISale;
    public client: IClient;
    constructor(cashRegisterSalesByService: any) {
        Object.assign(this, cashRegisterSalesByService);
    }

}

