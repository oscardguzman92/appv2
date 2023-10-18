import { Component, OnInit, Input } from "@angular/core";
import { Intercom } from "@ionic-native/intercom/ngx";
import { DomSanitizer } from "@angular/platform-browser";
import { ModalController } from "@ionic/angular";

import { IHelpTree } from "../../../../../../interfaces/IHelpTree";
import { NavigationHelper } from "../../../../../../helpers/navigation/navigation.helper";
import { ModalDistributorsComponent } from "../modal-distributors/modal-distributors.component";
import { IUser } from 'src/app/interfaces/IUser';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: "app-help-tree-third-tag",
	templateUrl: "./help-tree-third-tag.component.html",
	styleUrls: ["./help-tree-third-tag.component.scss"],
})
export class HelpTreeThirdTagComponent implements OnInit {
	@Input() helpTreeElement: IHelpTree;
  public video: any;
  public user: any;

  constructor(
    private route: ActivatedRoute,
		private intercom: Intercom,
		public navigation: NavigationHelper,
		private sanitizer: DomSanitizer,
		private modalController: ModalController
  ) {
    
    this.user = this.route.snapshot.data['user'];
  }

	ngOnInit() {
		this.configureInit();
	}

	configureInit() {
		if (this.helpTreeElement.video !== "") {
			this.video = this.sanitizer.bypassSecurityTrustResourceUrl(
				this.helpTreeElement.video
			);
		}
	}

	goTo(redirect: string) {
		this.navigation.goTo(redirect);
	}

	goTochat() {
		this.intercom.displayMessenger();
	}

	goToRecharge() {
		this.navigation.goToBack("recargas");
	}

	goToSection() {
		this.navigation.goToBack(this.helpTreeElement.name);
	}	

	openWhatsApp() {
		if (
			this.user &&
			this.user.distribuidor &&
			this.user.distribuidor.telefono
		) {
			window.open(
				"https://api.whatsapp.com/send?phone=+57" +
					this.user.distribuidor.telefono
			);
   		 } else {
      		this.openModalDistributors()
		}
	}

	openWhatsAppParalife() {
		window.open( "https://api.whatsapp.com/send?phone=+573185853045");
	}	

	async openModalDistributors() {
		const modal = await this.modalController.create(<any>{
			component: ModalDistributorsComponent,
			cssClass: "shopping-cart",
		});

		modal.onDidDismiss().then((res) => {
			if (res.data) {
			}
		});

		return await modal.present();
	}
}
