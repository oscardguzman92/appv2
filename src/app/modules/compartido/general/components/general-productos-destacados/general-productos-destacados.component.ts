import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {OrdersService} from '../../../../../services/orders/orders.service';
import {ICompany} from '../../../../../interfaces/ICompany';
import {Seller} from '../../../../../models/Seller';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {IProduct} from '../../../../../interfaces/IProduct';
import {Storage} from '@ionic/storage';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
    selector: 'app-general-productos-destacados',
    templateUrl: './general-productos-destacados.component.html',
    styleUrls: ['./general-productos-destacados.component.scss'],
})
export class GeneralProductosDestacadosComponent implements OnInit {
    @Input() companies: ICompany[];
    @Input() user: Seller | Shopkeeper;
    @Input() productsFeatured: IProduct[];

    constructor(
        private modal: ModalController,
        private orderService: OrdersService,
        private analyticsService: AnalyticsService,
        private storage: Storage) {
    }

    ngOnInit() {
    }

    justBack() {
        this.modal.dismiss();
    }

    async addProduct(product) {
        const company = this.searchCompany(product.compania_id);
        if (company !== null) {
            this.user.compania = company;
            await this.storage.set('user', JSON.stringify(this.user));
            this.modal.dismiss();
            //this.analyticsService.sendEvent('click', { 'event_category': 'menu_principal', 'event_label': 'pago_facturas' });
            console.log(product);
            if(product){
                this.analyticsService.sendEvent('prod_agr_destacado_'+this.user.role, { 'event_category': 'prod_agr_destacado_' + product.id, 'event_label': 'producto_add_destacado_'+product.cod_sap });
            }else{
                this.analyticsService.sendEvent('prod_agr_destacado_'+this.user.role, { 'event_category': 'prod_agr_destacado_' + product.id, 'event_label': 'producto_add_destacado_'+product.cod_sap });
            }

            this.orderService.addCarFeaturedProduct(product, this.user.tiendas[0]);
        }
    }

    private searchCompany(compania_id) {
        const result = this.companies.filter((company) => {
            return company.id === compania_id;
        });
        if (result.length > 0) {
            return result[0] as ICompany;
        }

        return null;
    }
}
