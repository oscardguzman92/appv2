import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppState} from '../../../../../store/app.reducer';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {ToggleMenu} from '../../../../compartido/general/store/actions/menu.actions';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Shop} from '../../../../../models/Shop';
import {SetOrderShopAction} from '../../../../compartido/pedidos/store/orders.actions';
import {Order} from '../../../../../models/Order';
import {CompartidoSeleccionTiendaComponent} from '../compartido-seleccion-tienda/compartido-seleccion-tienda.component';
import {IUser} from '../../../../../interfaces/IUser';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
    selector: 'app-compartido-cabecera',
    templateUrl: './compartido-cabecera.component.html',
    styleUrls: ['./compartido-cabecera.component.scss'],
})
export class CompartidoCabeceraComponent implements OnInit {
    @Input() messageNotificationStatus: boolean = false;
    @Input() titulo: string;
    @Input() mostrarBotonAuxiliar: boolean;
    @Input() tituloBoton: string;
    @Input() showBackButton: boolean;
    @Input() isModal: boolean;
    @Input() isRoot: boolean;
    @Input() filtros: boolean;
    @Input() listIcon: boolean;
    @Input() user: IUser;
    @Input() direccionTienda: any;
    @Input() listenerEventHeader: boolean;
    @Input() rutaRedirection: string;
    @Output() eventHandlerPounts = new EventEmitter();
    @Output() eventHandlerFilter = new EventEmitter();
    @Output() eventHeader = new EventEmitter();

    constructor(
        private modal: ModalController,
        private store: Store<AppState>,
        private navigation: NavigationHelper,
        private analyticsService: AnalyticsService,
        private utilities: UtilitiesHelper) {
    }

    ngOnInit() {
    }

    toggleMenu() {
        this.store.dispatch( new ToggleMenu() );
    }

    justBack() {
        if (this.isModal) {
            this.closeModal();
        }
        else if (this.isRoot && this.user) {
            this.navigation.goTo(this.user.rootPage)
        } else {
            this.navigation.justBack();
        }
    }

    closeModal() {
        this.modal.dismiss();
    }

    goMyMessages() {
        this.navigation.goToBack('mis-mensajes');
    }

    eventPounts() {
        this.analyticsService.sendEvent('sec_puntos_h', { 'event_category': 'menu_principal', 'event_label': 'sec_puntos_h' });

        this.eventHandlerPounts.emit();
    }

    eventFilter() {
        this.eventHandlerFilter.emit();
    }

    async emitHeader() {
        if (this.listenerEventHeader) {
            const modal = await this.utilities.selectShopModal(this.user.tiendas);
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
                    this.store.dispatch(new SetOrderShopAction(new Order({tiendas: [shop]})));
                    await this.utilities.saveShopsStorage(shop, this.user, this.user.tiendas);
                    this.eventHeader.emit();
                }
            });

            return await modal.present();
        }
    }
}
