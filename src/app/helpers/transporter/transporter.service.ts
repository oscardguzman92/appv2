import {EventEmitter, Injectable} from '@angular/core';
import {ICredit} from '../../interfaces/ICredit';
import {IPurchases} from '../../interfaces/IPurchases';

interface ICash {
    selected: boolean;
    amount: number;
}

@Injectable({
    providedIn: 'root'
})
export class TransporterService {
    public route = new EventEmitter<string>();
    public reason = new EventEmitter<string>();

    constructor() {
    }

    public createOrder(token: string, pedido_id: number, total: number, user_id: number, products: any[],
                       returns: boolean, cash?: ICash, storeapp?: ICash, credits?: ICredit[]) {

        const params: any = {
            token: token,
            pedido_id: pedido_id,
            userClient: user_id,
            products: products,
            returns: returns
        };

        params.methodpay = {};
        params.methodpay.credits = {};
        if (cash && cash.selected) {
            params.methodpay.efectivo = cash.amount;
        }

        if (storeapp && storeapp.selected) {
            params.methodpay.creditostoreapp = storeapp.amount;
        }

        if (credits) {
            let index = 0;
            for (const credit of credits) {
                if (!credit.selectedPay) {
                    index++;
                    continue;
                }

                const purchase: IPurchases = {
                    amount: 0,
                    payment: 0,
                    arrear: false,
                    created_at: '',
                    credit_id: '',
                    description: '',
                    interest: 0,
                    is_order: false,
                    is_recharge: false,
                    mysql_item_id: 0,
                    name: '',
                    number_fee: 0,
                    paid_out: false,
                    updated_at: '',
                    state: '',
                };
                purchase.state = 'Pending';
                purchase.mysql_item_id = pedido_id;
                purchase.credit_id = credit.credit_id;
                purchase.name = 'Pedido por $' + total;
                purchase.description = 'Pedido realizado desde el transportador';
                purchase.description += '.';
                purchase.amount = credit.amountPay;
                purchase.payment = 0;
                purchase.paid_out = false;
                purchase.arrear = false;
                purchase.number_fee = credit.feePay;
                purchase.is_order = true;
                purchase.is_recharge = false;

                params.methodpay.credits[index] = purchase;
                index++;
            }
        }

        params.methodpay.total = total;
        params.methodpay.idPedido = pedido_id;

        return params;
    }
}
