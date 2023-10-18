import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Shop} from '../../../../../models/Shop';
import {SetOrderShopAction} from '../../store/orders.actions';
import {Order} from '../../../../../models/Order';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';
import {IUser} from '../../../../../interfaces/IUser';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
    selector: 'app-pedidos-cabecera',
    templateUrl: './pedidos-cabecera.component.html',
    styleUrls: ['./pedidos-cabecera.component.scss'],
})
export class PedidosCabeceraComponent implements OnInit {
    @Input() tituloBoton: string;
    @Input() tienda: string;
    @Input() direccionTienda: string;
    @Input() mostrarBotonPedidosAnteriores: boolean;
    @Input() filtro: boolean;
    @Input() shop: Shop;
    @Input() listenerEventHeader: boolean;
    @Input() rutaRedirection: string;
    @Input() user: IUser;
    @Output() eventHeader = new EventEmitter();
    @Output() clickFilter = new EventEmitter();

    constructor(private navigation: NavigationHelper, private analyticsService:AnalyticsService , private utilities: UtilitiesHelper, private store: Store<AppState>) {
    }

    ngOnInit() {
    }

    onClickFilter() {
        this.analyticsService.sendEvent('abre_filtro_seg_prod', { 'event_category': 'abre_filtro_seg_prod'});
        this.clickFilter.emit();
    }

    justBack() {
        this.navigation.justBack();
    }

    goToScore() {
        if (this.filtro === false) {
            this.navigation.goToBack('puntos', {shop: this.shop} );
        }
    }

    goToSeePreOrders() {
        this.navigation.goToBack('pedidos-anteriores');
    }

    async emitHeader() {
        if (this.listenerEventHeader) {
            const modal = await this.utilities.selectShopModal(this.user.tiendas);
            if (!modal) {
                return;
            }
            modal.onDidDismiss().then(async (res) => {
                if (!res.data) {
                    return;
                }

                if (!res.data.shop.direccion) {
                    this.utilities.capturaUbicacion(this.user, this.user.tiendas, this.rutaRedirection);
                    return;
                }

                if (res.data.shop) {
                    const shop = new Shop(res.data.shop);
                    if (shop.id === this.user.tiendas[0].id) {
                        return;
                    }
                    await this.utilities.saveShopsStorage(shop, this.user, this.user.tiendas);
                    this.eventHeader.emit();
                }
            });

            return await modal.present();
        }
    }
}
