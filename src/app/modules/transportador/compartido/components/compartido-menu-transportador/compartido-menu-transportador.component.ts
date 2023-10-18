import {Component, Input, OnInit} from '@angular/core';
import {IUser} from '../../../../../interfaces/IUser';
import {ToggleMenu} from '../../../../compartido/general/store/actions/menu.actions';
import {ModalController} from '@ionic/angular';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Storage} from '@ionic/storage';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';
import {IMessage} from '../../../../../interfaces/IMessages';
import {Intercom} from '@ionic-native/intercom/ngx';
import {OneSignalService} from '../../../../../services/oneSignal/one-signal.service';
import {TransporterService} from '../../../../../helpers/transporter/transporter.service';
import {ILogin} from '../../../../../interfaces/ILogin';
import {Transportador} from '../../../../../models/Transportador';
import {RefreshUserAction} from '../../../../../store/auth/auth.actions';
import {LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
    selector: 'app-compartido-menu-transportador',
    templateUrl: './compartido-menu-transportador.component.html',
    styleUrls: ['./compartido-menu-transportador.component.scss'],
})
export class CompartidoMenuTransportadorComponent implements OnInit {
    @Input() user: Transportador;
    @Input() messageInformation: { count: number, message: IMessage };

    public ionVersionNumber:any;
    public ionVersionCode:any;

    constructor(private modal: ModalController,
                private navigation: NavigationHelper,
                private storage: Storage,
                private store: Store<AppState>,
                private utility: TransporterService,
                private intercom: Intercom,
                private appVersion: AppVersion,
                private oneSignal: OneSignalService) {
    }

    ngOnInit() {
        this.appVersion.getVersionNumber().then(res => {
            console.log(res);
            this.ionVersionNumber = res;
        }).catch(error => {
            console.log(error);
        });
        
        this.appVersion.getVersionCode().then(res => {
              console.log(res);
            this.ionVersionCode = res;
          }).catch(error => {
            console.log(error);
        });
    }

    handleSwipe(ev) {
        this.closeModal();
    }

    closeModal() {
        this.store.dispatch(new ToggleMenu());
        return this.modal.dismiss();
    }

    goList() {
        this.closeModal();
    }

    goRute() {
        this.utility.route.emit();
        this.closeModal();
    }

    goReason() {
        this.utility.reason.emit();
        this.closeModal();
    }

    goMyMessages() {
        this.closeModal();
        this.navigation.goToBack('mis-mensajes');
    }

    openMessage(message) {
        this.closeModal();
        this.navigation.goToBack('mis-mensajes', {message: message});
    }

    goTermsConditions() {
        this.closeModal();
        window.open('http://storeapp.net/files/storeapp_politicas_privacidad.pdf', '_blank');
    }

    openChat() {
        this.intercom.displayMessenger();
        this.closeModal();
    }

    goHistory() {
        this.closeModal();
        this.navigation.goToBack('historial-novedades');
    }

    refreshData() {
        const dataLogin: ILogin = {
            login: this.user.telefono_contacto,
            password: this.user.cedula
        };
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new RefreshUserAction(dataLogin));
        this.closeModal();
    }

    async logOut() {
        this.oneSignal.deletePlayerId(this.user.token);
        this.intercom.hideMessenger();
        this.storage.clear().then(res => {
            this.closeModal();
            this.navigation.goTo('inicio');
        });
    }
}
