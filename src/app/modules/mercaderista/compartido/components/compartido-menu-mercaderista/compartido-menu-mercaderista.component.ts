import {Component, OnInit, Input} from '@angular/core';
import {IUser} from 'src/app/interfaces/IUser';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {AlertController, ModalController} from '@ionic/angular';
import {Intercom} from '@ionic-native/intercom/ngx';
import {OneSignalService} from 'src/app/services/oneSignal/one-signal.service';
import {Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {ToggleMenu} from 'src/app/modules/compartido/general/store/actions/menu.actions';
import {Storage} from '@ionic/storage';
import {IMessage} from 'src/app/interfaces/IMessages';
import {Mercaderista} from '../../../../../models/Mercaderista';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
    selector: 'app-compartido-menu-mercaderista',
    templateUrl: './compartido-menu-mercaderista.component.html',
    styleUrls: ['./compartido-menu-mercaderista.component.scss']
})
export class CompartidoMenuMercaderistaComponent implements OnInit {
    @Input() user: Mercaderista;
    @Input() messageInformation: { count: number; message: IMessage };
    @Input() balance: string;
    public ionVersionNumber:any;
    public ionVersionCode:any;

    constructor(
        private modal: ModalController,
        private navigation: NavigationHelper,
        private storage: Storage,
        private store: Store<AppState>,
        public alertController: AlertController,
        private intercom: Intercom,
        private oneSignal: OneSignalService,
        private appVersion: AppVersion,
        private backgroundGeolocation: BackgroundGeolocation,
    ) {
    }

    ngOnInit() {
        console.log(this.user);
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

    goHome() {
        this.closeModal();
        this.navigation.goToBack('clientes-mercaderista');
    }

    goFrecuentQuestions() {
        this.closeModal().then(() => {
            this.navigation.goToBack('preguntas-frecuentes');
        });
    }

    goSurveyFanny() {
        this.closeModal();
        this.navigation.goToBack('encuestas', {
            notValidateResponse: true,
            encuestaFanny: true,
        });
    }

    goMyMessages() {
        this.closeModal();
        this.navigation.goToBack('mis-mensajes');
    }

    goTermsConditions() {
        this.closeModal();
        window.open('http://www.storeapp.net/files/storeapp_terminos_condiciones.pdf', '_blank');
    }

    goPrivacyPolicies() {
        this.closeModal();
        window.open('http://www.storeapp.net/files/storeapp_politicas_privacidad.pdf', '_blank');
    }

    goMyHistoryScore() {
        this.closeModal();
        this.navigation.goToBack('historial-puntos', {shopId: this.user.mercaderista_id, tipo: this.user.tipo_usuario});
    }

    handleSwipe(ev) {
        this.closeModal();
    }

    openChat() {
        this.intercom.displayMessenger();
        this.closeModal();
    }

    async logOut() {
        await this.storage.get('order').then(success => {
            let res = JSON.parse(success);
            this.oneSignal.deletePlayerId(this.user.token);
            this.intercom.hideMessenger();
            this.storage.clear().then(res => {
                this.backgroundGeolocation.stop();
                this.closeModal();
                this.navigation.goTo('inicio');
            });
        });
    }

    closeModal() {
        this.store.dispatch(new ToggleMenu());
        return this.modal.dismiss();
    }

    openMessage(message) {
        this.closeModal();
        this.navigation.goToBack('mis-mensajes', {message: message});
    }

    goCreateClient() {
        this.closeModal();
        this.navigation.goToBack('crear-cliente-mercaderista');
    }
}
