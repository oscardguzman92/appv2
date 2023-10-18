import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import {Storage} from '@ionic/storage';
import {LoadingOn} from '../../modules/compartido/general/store/actions/loading.actions';
import {GetSearchProductsAction} from '../../modules/compartido/pedidos/store/orders.actions';
import {ExtendedCategories} from '../../modules/compartido/pedidos/pages/compania/compania.page';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducer';
import {HttpParams} from '@angular/common/http';

export interface IProducto {
    producto_id: number;
    valor: number;
    valor_original: number;
    cantidad: number;
    oferta_id?: number;
}


@Injectable({
    providedIn: 'root'
})

export class GetProductsReturnsService {

    constructor(private store: Store<AppState>, private api: ApiService) {
    }

    public getProducts(txtSearch: string, token: string, shop_id: number, page: number) {
        this.store.dispatch(new GetSearchProductsAction(token, txtSearch, shop_id, null, null, null, null,page));
    }

    public getProductsReturn(token: string, pedido_id: number) {
        const params = new HttpParams()
            .append('token', token)
            .append('pedido_id', pedido_id.toString());

        return this.api.get('getDevolucion', params, true);
    }
}
