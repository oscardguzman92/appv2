import {Component, OnInit} from '@angular/core';
import {IUser} from '../../../../../interfaces/IUser';
import {ActivatedRoute} from '@angular/router';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {GET_DDDEDO, GetDddedoAction, SET_DDDEDO, SetDddedoAction} from '../../store/currentAccount/currentAccount.actions';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SendDddedoAction} from '../../store/topUps/topUps.actions';
import { Intercom } from '@ionic-native/intercom/ngx';

@Component({
    selector: 'app-solicitud-recarga',
    templateUrl: './solicitud-recarga.page.html',
    styleUrls: ['./solicitud-recarga.page.scss'],
})
export class SolicitudRecargaPage implements OnInit {
    public user: IUser;
    public segment: string;
    public showDddedo: boolean;
    public cupo: { cupo_disponible: number, minimo: number, saldo_cuenta_transferencia: number, saldo_cuenta_venta: number };
    private dddedoSub = new Subscription();
    public formTopsUps: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private actionS: ActionsSubject,
        private formBuilder: FormBuilder,
        private intercom: Intercom) {
        this.user = this.route.snapshot.data['user'];
        this.showDddedo = false;
        this.segment = 'general';
    }

    ngOnInit() {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetDddedoAction(this.user.token));

        this.dddedoSub = this.actionS
            .pipe(filter(action => action.type === SET_DDDEDO))
            .subscribe((res: SetDddedoAction) => {
                this.store.dispatch(new LoadingOff());
                this.cupo = res.cupo;
                this.showDddedo = true;
            });

        this.formTopsUps = this.formBuilder.group({
            value: ['', Validators.compose([
                Validators.required,
                Validators.min(50000),
                Validators.pattern('^[0-9]*$')
            ])]
        });
    }

    changeSegment(event) {
        this.segment = event.detail.value;
    }

    sendDddedo(valuesTopsUps: { value: any }) {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new SendDddedoAction(this.user.token, valuesTopsUps.value));
    }

    get controls() {
        return this.formTopsUps.controls;
    }
    openChat() {
        // this.intercom.setLauncherVisibility('VISIBLE');
        this.intercom.displayMessenger();
    }
}
