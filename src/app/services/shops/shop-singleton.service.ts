import { NavigationHelper } from '../../helpers/navigation/navigation.helper';
import { Shop } from '../../models/Shop';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShopSingletonService {
  private selectedShop: Shop;
  private listShopsRefreshSubject = new Subject<any>();

  constructor(
    private navigation: NavigationHelper,
    private storage: Storage,
  ) { }

  publishShopsRefresh(data: any) {
		this.listShopsRefreshSubject.next(data);
	}

	getObservableShopsRefresh(): Subject<any> {
		return this.listShopsRefreshSubject;
	}

  public setSelectedShop(shop: Shop) {
    this.selectedShop = shop;
  }

  public setStorageSelectedShop(shop: Shop) {
    this.storage.get('order').then(res => {
      res = JSON.parse(res);
      if (!res || res.lengh == 0) res = [];
      const indexShop = res.findIndex(({ id, codigo_cliente }) => (id == shop.id) && (codigo_cliente == shop.codigo_cliente));
      if (res[indexShop]) {
        res[indexShop] = shop;
      } else {
        res.push(shop);
      }
      this.storage.set('order', JSON.stringify(res));
    });
  }

  public getSelectedShop() {
    if (!this.selectedShop) {
      this.navigation.goToBack('');
      return;
    }
    return this.selectedShop;
  }

  public deleteSelecedShop() {
    this.selectedShop = undefined;
  }
}
