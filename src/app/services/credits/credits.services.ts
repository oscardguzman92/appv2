import {Injectable} from '@angular/core';
import {Shop} from '../../models/Shop';
import {HttpParams} from '@angular/common/http';
import {ApiService} from '../api/api.service';
import {Storage} from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class CreditsServices {

    constructor(private api: ApiService) {
    }

    public myCredits(token: string, shop: Shop) {
        const params = new HttpParams()
            .set('token', token)
            .set('filter', `${shop.cliente_id}`);

        return this.api.get('getCredits', params, true);
    }

    public myCreditsEntity(token: string, shop, entity, user_id?) {
        let params = new HttpParams()
            .set('token', token)
            .set('shopkeeper', shop)
            .set('entity', entity);

        if (user_id) {
            params = params.set('storeappCredit', user_id);
        }

        return this.api.get('getCreditsEntity', params, true);
    }


    public myBalance(token: string, shop) {
        const params = new HttpParams()
            .set('token', token)
            .set('cliente', shop);
        return this.api.get('getSaldoCuentaCorrienteCliente', params, true);
    }

    public myCredit(token: string, idCredit: string) {
        const params = new HttpParams()
            .set('token', token)
            .set('filter', idCredit);

        return this.api.get('getCredit', params, true);
    }

    public myMethodsPay(token: string, idOrder: number) {
        const params = new HttpParams()
            .set('token', token)
            .set('order', idOrder.toString() );

        return this.api.get('micro-credits/methods-pay', params, true);
    }
}
