import { Component, OnInit, Input } from '@angular/core';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-seguros-registro-modal',
  templateUrl: './seguros-registro-modal.component.html',
  styleUrls: ['./seguros-registro-modal.component.scss'],
})

export class SegurosRegistroModalComponent implements OnInit {

  @Input() insu: any;
  public message = "Tu solicitud está en proceso, revisa tu correo, llegará toda la información a tu email y una confirmación a tu celular.";
  constructor(public navigation: NavigationHelper, public modalController:ModalController) { }

  
  ngOnInit() {
    console.log(this.insu);
    this.message = this.insu.content;
  }

  goToInsuranceRegister() {
    this.navigation.goTo('seguros-home');
    this.modalController.dismiss();
  }

}
