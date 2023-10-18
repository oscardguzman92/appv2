import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class OrganizeShopsHelper {

    constructor() {
    }

    public organizeShopsBySelected(shops: any[], shopSelected?) {
        if (shops.length <= 1) {
            return shops;
        }

        if (shopSelected) {
            for (const shop of shops) {
                shop.selected = false;
                if (shopSelected.id === shop.id) {
                    shop.selected = true;
                }
            }
        }

        shops.sort((a: any, b: any) => {
            return (a === b) ? 0 : a.selected ? -1 : 1;
        });

        return shops;
    }
}
