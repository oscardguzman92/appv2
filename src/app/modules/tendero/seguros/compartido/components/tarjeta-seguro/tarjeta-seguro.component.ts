import { filter } from 'rxjs/operators';
import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';

import { IInsurances } from '../../../../../../interfaces/IInsurances';
import { SegurosMasInfoModalComponent } from '../seguros-mas-info-modal/seguros-mas-info-modal.component';

import { Subscription } from "rxjs";
import { Store, ActionsSubject } from "@ngrx/store";
import {
  InsuranceCancelAction,
  INSURANCE_CANCEL,
  InsuranceCancelCompleteAction,
  INSURANCE_CANCEL_COMPLETE,
} from "src/app/modules/tendero/seguros/store/insurances.actions";
import { InsuranceCompleteState , InsurancesState } from 'src/app/modules/tendero/seguros/store/insurances.reducer';
import { LoadingOn } from "src/app/modules/compartido/general/store/actions/loading.actions";
import { IUser } from 'src/app/interfaces/IUser';


@Component({
  selector: "app-tarjeta-seguro",
  templateUrl: "./tarjeta-seguro.component.html",
  styleUrls: ["./tarjeta-seguro.component.scss"],
})
export class TarjetaSeguroComponent implements OnInit {
  @Input() insurance: IInsurances;
  @Input() order: number;
  @Input() position: number;
  @Input() user: IUser;
  public subscriptionCancelInsurance = new Subscription();

  constructor(
    private modalController: ModalController,
    private navigation: NavigationHelper,
    private actionsSubj: ActionsSubject,
    private storeInsurance: Store<InsurancesState>,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.subscriptionCancelInsurance = this.actionsSubj
      .pipe(
        filter(
          (res: InsuranceCancelCompleteAction) =>
            res.type === INSURANCE_CANCEL_COMPLETE
        )
      )
      .subscribe((response: InsuranceCancelCompleteAction) => {
        if (response.toogle) {
          response.toogle = false;
          this.getErrorAlert(response.result.content, true);
        }
      });
  }

  ngOnDestroy() {
    this.subscriptionCancelInsurance.unsubscribe();
  }

  ionViewWillLeave() {
    this.subscriptionCancelInsurance.unsubscribe();
  }

  async moreInfoModal() {
    const modal = await this.modalController.create(<any>{
      component: SegurosMasInfoModalComponent,
      cssClass: "insurance-modal",
      componentProps: { insurance: this.insurance },
    });

    modal.onDidDismiss().then((res) => {
      if (!res.data) {
        return;
      }
    });

    return await modal.present();
  }

  goToInsuranceRegister(param: any) {
    this.navigation.goToBack("seguros-registro", { insurance: param });
  }

  cancelInsurance(insurance) {
    let params = {
      token: this.user.token,
      slug: insurance.slug,
      cliente_id: insurance.cliente_id,
      id: insurance.id,
    };
    const InsuranceCancel = new InsuranceCancelAction(params, true);
    this.storeInsurance.dispatch(new LoadingOn(true));
    this.storeInsurance.dispatch(InsuranceCancel);
  }

  async getErrorAlert(message, noredirect?) {
    const alert = await this.alertController.create({
      header: "Información",
      subHeader: "",
      message: message,
      buttons: [
        {
          text: "Aceptar",
          handler: () => {
            if (!noredirect) {
              this.navigation.goTo("seguros-home");
            } else {
              this.alertController.dismiss();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
