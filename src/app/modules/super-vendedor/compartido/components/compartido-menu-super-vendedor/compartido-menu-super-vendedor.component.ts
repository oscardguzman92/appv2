import { Component, OnInit, Input } from "@angular/core";
import { IUser } from "src/app/interfaces/IUser";
import { NavigationHelper } from "src/app/helpers/navigation/navigation.helper";
import { AlertController, ModalController } from "@ionic/angular";
import { Intercom } from "@ionic-native/intercom/ngx";
import { OneSignalService } from "src/app/services/oneSignal/one-signal.service";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.reducer";
import { ToggleMenu } from "src/app/modules/compartido/general/store/actions/menu.actions";
import { Storage } from "@ionic/storage";
import { IMessage } from "src/app/interfaces/IMessages";
import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
  selector: 'app-compartido-menu-super-vendedor',
  templateUrl: './compartido-menu-super-vendedor.component.html',
  styleUrls: ['./compartido-menu-super-vendedor.component.scss'],
})
export class CompartidoMenuSuperVendedorComponent implements OnInit {

  	@Input() user: IUser;
	@Input() messageInformation: { count: number; message: IMessage };
	public ionVersionNumber:any;
    public ionVersionCode:any;
	
	constructor(
		private modal: ModalController,
		private navigation: NavigationHelper,
		private storage: Storage,
		private store: Store<AppState>,
		public alertController: AlertController,
		private intercom: Intercom,
		private appVersion: AppVersion,
		private oneSignal: OneSignalService
	) {}

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

	goHome() {
		this.closeModal();
		this.navigation.goToBack("inicio-super-vendedor");
	}

	goFrecuentQuestions() {
		this.closeModal().then(() => {
			this.navigation.goToBack("preguntas-frecuentes");
		});
	}

	goMyMessages() {
		this.closeModal();
		this.navigation.goToBack("mis-mensajes");
	}
	goTermsConditions() {
		this.closeModal();
		window.open('http://www.storeapp.net/files/storeapp_terminos_condiciones.pdf', '_blank');
	}

	goPrivacyPolicies() {
			this.closeModal();
			window.open('http://www.storeapp.net/files/storeapp_politicas_privacidad.pdf', '_blank');
	}

	openMessage(message) {
		this.closeModal();
		this.navigation.goToBack('mis-mensajes', {message: message});
}

	handleSwipe(ev) {
		this.closeModal();
	}

	openChat() {
		this.intercom.displayMessenger();
		this.closeModal();
	}

	async logOut() {
		await this.storage.get("order").then(success => {
			let res = JSON.parse(success);
			this.oneSignal.deletePlayerId(this.user.token);
			this.intercom.hideMessenger();
			this.storage.clear().then(res => {
				
				this.closeModal();
				this.navigation.goTo("inicio");
			});
		});
	}

	closeModal() {
		this.store.dispatch(new ToggleMenu());
		return this.modal.dismiss();
	}

}
