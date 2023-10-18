import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';
import {IWayPoint} from '../../../../../interfaces/IWayPoint';
import {ModalController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {Transportador} from '../../../../../models/Transportador';
import {ActionsSubject, Store} from '@ngrx/store';
import {filter} from 'rxjs/operators';
import {SET_FAVORITES_ORDERS, SetFavoritesOrders} from '../../../../compartido/pedidos/store/orders.actions';
import {
    FINISH_ORDER,
    FINISH_REASON_TRANSPORTER,
    FinishSetReasonTransporterAction,
    SetOrderAction,
    SetReasonTransporterAction
} from '../../store/transporter.actions';
import {Subscription} from 'rxjs';
import {AppState} from '../../../../../store/app.reducer';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {IReason} from '../../../../../interfaces/IReason';
import {SetListShopsAction} from '../../../../vendedor/misClientes/store/mis-clientes.actions';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {GeolocationHelper} from '../../../../../helpers/geolocation/geolocation.helper';
import {IReasonReq} from '../../../../../interfaces/IReasonReq';

type typeModal = 'novedades' | 'cambio-control' | 'success' | 'cambio-orden' | '';

@Component({
    selector: 'app-modal-novedades',
    templateUrl: './modal-novedades.component.html',
    styleUrls: ['./modal-novedades.component.scss'],
})
export class ModalNovedadesComponent implements OnInit, OnDestroy {

    @Input() type: typeModal;
    @Input() wayPoints: Array<any>;
    @Input() selected: number;
    @Input() user: Transportador;
    @Input() indexSelected: number;
    @Input() reasons: IReason[];
    @Input() reason: IReason;

    public valueToChange: number;
    public observation: string;
    private finishSubs = new Subscription();
    private finishSetSubs = new Subscription();

    constructor(private utilities: UtilitiesHelper, private modalC: ModalController,
                private storage: Storage, private actionsS: ActionsSubject, private store: Store<AppState>,
                private geolocation: Geolocation, private geolocationHelper: GeolocationHelper) {
        this.type = '';
    }

    ngOnInit() {
        this.finishSubs = this.actionsS
            .pipe(filter(res => res.type === FINISH_ORDER))
            .subscribe((res: SetOrderAction) => {
                this.modalC.dismiss({success: true});
                this.store.dispatch(new LoadingOff());
            });

        this.finishSetSubs = this.actionsS
            .pipe(filter(res => res.type === FINISH_REASON_TRANSPORTER))
            .subscribe((res: FinishSetReasonTransporterAction) => {
                this.type = 'success';
                this.store.dispatch(new LoadingOff());
            });
    }

    async changeOrder() {
        const selectedId = this.user.rutas[this.indexSelected].pedidos[this.selected].id;
        if (((<number>this.valueToChange) - 1) < 0) {
            this.valueToChange = 1;
        }

        if (((<number>this.valueToChange)) > this.wayPoints.length) {
            this.valueToChange = this.wayPoints.length;
        }
        this.utilities.arrayMove(this.wayPoints, this.selected, (<number>this.valueToChange) - 1);
        this.user.rutas[this.indexSelected].pedidos = this.wayPoints;
        if ((this.user.rutas[this.indexSelected].pedidos && this.user.rutas[this.indexSelected].pedidos[0])
            && this.user.rutas[this.indexSelected].pedidos[0].orden) {
            let orden = 1;
            for (const pedido of this.user.rutas[this.indexSelected].pedidos) {
                pedido.orden = orden;
                orden++;
            }
        }
        await this.storage.set('user', JSON.stringify(this.user));
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new SetOrderAction(this.user.token, {
            ruta_id: this.user.rutas[this.indexSelected].id,
            id_pedido_x_ruta: selectedId,
            orden: this.valueToChange
        }));
    }

    closeModal() {
        this.modalC.dismiss();
    }

    ngOnDestroy(): void {
        this.finishSubs.unsubscribe();
        this.finishSetSubs.unsubscribe();
    }

    selectedReason(reason: IReason) {
        this.reason = reason;
    }

    selectedOther() {
        this.reason = {
            motivo: 'Otro',
            id: 0
        };
    }

    setReason() {
        const params: IReasonReq = {};

        if (!this.reason) {
            this.store.dispatch(new Fail({message: 'No hay un motivo seleccionado'}));
            return;
        }

        this.store.dispatch(new LoadingOn());
        const opt = {
            maximumAge: 30000,
            enableHighAccuracy: true,
            timeout: 10000
        };
        this.geolocation
            .getCurrentPosition(opt)
            .then(resp => {
                params.latitud = resp.coords.latitude;
                params.longitud = resp.coords.longitude;
                if (this.reason.id > 0) {
                    params.motivo_id = this.reason.id;
                }
                if (this.observation) {
                    params.observacion = this.observation;
                }

                this.store.dispatch(new SetReasonTransporterAction(this.user.token, params));
            })
            .catch(error => {
                this.store.dispatch(new LoadingOff());
                this.geolocationHelper.showErrorLocation(error);
            });
    }
}
