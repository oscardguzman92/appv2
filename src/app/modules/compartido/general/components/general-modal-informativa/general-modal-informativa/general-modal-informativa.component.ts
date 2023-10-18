import {Component, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {IModal} from '../../../../../../interfaces/IModal';
import {routes} from '../../../../../../app-routing.module';
import {NavigationHelper} from '../../../../../../helpers/navigation/navigation.helper';
import {IUser} from '../../../../../../interfaces/IUser';
import {Roles} from '../../../../../../enums/roles.enum';
import {Shopkeeper} from '../../../../../../models/Shopkeeper';
import {ICompany} from '../../../../../../interfaces/ICompany';
import {Storage} from '@ionic/storage';
import {ModalController} from '@ionic/angular';
import {IProduct} from '../../../../../../interfaces/IProduct';
import {AnalyticsService} from '../../../../../../services/analytics/analytics.service';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';

@Component({
    selector: 'app-general-modal-informativa',
    templateUrl: './general-modal-informativa.component.html',
    styleUrls: ['./general-modal-informativa.component.scss'],
})
export class GeneralModalInformativaComponent implements OnInit {
    @Input() data: IModal;
    @Input() user: IUser;
    @ViewChildren('containerCards') container = new QueryList();

    public producto: IProduct;
    public showProduct: boolean;
    public productosSeleccionados: IProduct[];
    public exitWithoutEvent: boolean;
    public originalQuantity: number;

    constructor(
        private navigation: NavigationHelper, private storage: Storage, private modal: ModalController,
        private analyticsService: AnalyticsService,
        public shopSingletonService: ShopSingletonService,
    ) {
        this.showProduct = false;
    }

    ngOnInit() {
        this.exitWithoutEvent = true;
        let order = this.shopSingletonService.getSelectedShop();
        if (order.productos_seleccionados !== undefined && Object.keys(order.productos_seleccionados).length > 0) {
            this.productosSeleccionados = order.productos_seleccionados;
        }
    }

    goTo() {
        this.exitWithoutEvent = false;

        if (this.data.link_externo) {
            this.analyticsService.sendEvent('os_notification_opened', {
                'notification_id': this.data.id,
                'firebase_screen': 'enlace_externo',
                'campaign': 'modal',
                'source': this.user.role,
            });
            window.open(this.data.link_externo, '_blank');
            this.close();
            return;
        }

        if (this.data.datos) {
            const redireccion = JSON.parse(this.data.datos);
            this.redirect(redireccion);
        }
    }

    redirect(tipoRedireccion) {
        const seccion = tipoRedireccion.seccion;
        if (seccion !== undefined) {
            const sectionGoTo = seccion.toString();
            this.redirectSeccion(sectionGoTo);
            this.close();
            return;
        }

        if (tipoRedireccion.producto !== undefined) {
            const product = JSON.parse(tipoRedireccion.producto);
            this.redirectProduct(product);
            return;
        }

        if (tipoRedireccion.compania_id !== undefined) {
            this.redirectCompania(tipoRedireccion.compania_id);
            this.close();
            return;
        }
    }

    redirectSeccion(sectionGoTo) {
        try {
            let goToSection = '', params = null;
            switch (sectionGoTo) {
                case 'puntos':
                    if (this.user.role !== Roles.shopkeeper) {
                        return false;
                    }
                    const shopkeeper = <Shopkeeper> this.user;
                    params = {shop: shopkeeper.tiendas[0]};
                    goToSection = 'puntos';
                    break;
                default:
                    goToSection = sectionGoTo;
                    break;
            }

            const iRoutes = routes.findIndex(r => r.path === goToSection);
            if (iRoutes === -1) {
                return false;
            }

            this.analyticsService.sendEvent('os_notification_opened', {
                'notification_id': this.data.id,
                'firebase_screen': goToSection,
                'campaign': 'modal',
                'source': this.user.role,
            });

            setTimeout(() => {
                this.navigation.goToBack(goToSection, params);
            }, 100);

        } catch (err) {
        }
    }

    redirectProduct(producto) {
        this.exitWithoutEvent = true;
        if (this.user.role === Roles.seller) {
            return;
        }

        const tiendas = this.user.tiendas;
        if (tiendas !== undefined && Array.isArray(this.user.tiendas) && this.user.tiendas.length > 1) {
            this.navigation.goTo('inicio-tendero');
            return;
        }

        producto.id = producto.producto_distribuidor_id;

        this.showProduct = true;
        this.producto = producto;

        this.analyticsService.sendEvent('os_notification_opened', {
            'notification_id': this.data.id,
            'firebase_screen': 'producto',
            'campaign': 'modal',
            'source': this.user.role,
        });

        if (!this.productosSeleccionados) {
            return;
        }

        this.updateQuantity(this.productosSeleccionados, producto);
    }

    redirectCompania(compania_id: number) {
        if (this.user.role === Roles.seller) {
            return;
        }

        this.analyticsService.sendEvent('os_notification_opened', {
            'notification_id': this.data.id,
            'firebase_screen': 'compania',
            'campaign': 'modal',
            'source': this.user.role,
        });

        const tiendas = this.user.tiendas;
        if (tiendas !== undefined && Array.isArray(this.user.tiendas) && this.user.tiendas.length > 1) {
            this.navigation.goTo('inicio-tendero');
            return;
        }

        const shopkeeper = <Shopkeeper> this.user;
        shopkeeper.compania = <ICompany> {id: compania_id};
        this.storage.set('user', JSON.stringify(shopkeeper))
            .then(() => {
                this.navigation.goToBack('compania');
            });

    }

    close() {
        const paramsResult = {withOutEvent: this.exitWithoutEvent, addProduct: null};

        if (this.producto && (this.producto.cantidad > this.originalQuantity)) {
            this.exitWithoutEvent = false;
            paramsResult.addProduct = true;
        }

        this.modal.dismiss(paramsResult);
    }

    private updateQuantity(productsSel, product) {
        const keysProductsSel = Object.values(productsSel);
        let productWithQuantityPending = true;

        keysProductsSel.forEach((productSel: IProduct) => {
            if (product.producto_distribuidor_id == productSel.id) {
                productWithQuantityPending = false;
                product.cantidad = productSel.cantidad;
            }
        });

        if (productWithQuantityPending) {
            product.cantidad = 0;
        }

        this.originalQuantity = product.cantidad;
    }
}
