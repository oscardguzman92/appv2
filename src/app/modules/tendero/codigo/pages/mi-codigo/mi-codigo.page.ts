import {Component, OnInit} from '@angular/core';
import {Shop} from '../../../../../models/Shop';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';

@Component({
    selector: 'app-mi-codigo',
    templateUrl: './mi-codigo.page.html',
    styleUrls: ['./mi-codigo.page.scss'],
})
export class MiCodigoPage implements OnInit {
    public shop: Shop;
    public user: Shopkeeper;
    public dataQr: string;

    constructor(private route: ActivatedRoute, private router: Router, private navigation: NavigationHelper) {
        this.user = this.route.snapshot.data['user'];
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                const data = this.router.getCurrentNavigation().extras.state.data;
                this.shop = data.shop;
            } else {
                this.navigation.goTo(this.user.rootPage);
            }
        });
    }

    ngOnInit() {
        const shopKeeper = [
            this.user.cedula, this.shop.cliente_id, this.shop.id,
            this.shop.direccion, this.shop.estrato, this.shop.nombre,
            this.shop.ciudad_id, this.shop.ciu_nombre
        ];
        this.dataQr = shopKeeper.join(';');
    }

    justBack() {
        this.navigation.justBack();
    }
}
