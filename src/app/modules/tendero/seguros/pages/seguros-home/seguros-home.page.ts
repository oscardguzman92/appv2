import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';
import { Storage } from '@ionic/storage';
import { Store, ActionsSubject } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '../../../../../interfaces/IUser';

import { IInsurances } from '../../../../../interfaces/IInsurances';
import { LoadingOn } from '../../../../compartido/general/store/actions/loading.actions';

import {
  InsurancesCompleteState,
  InsurancesState,
} from '../../store/insurances.reducer';
import {
  InsurancesCompleteAction,
  InsurancesAction,
  InsuranceCancelAction,
  InsuranceCancelCompleteAction,
  INSURANCE_CANCEL_COMPLETE,
} from "./../../store/insurances.actions";
import { filter } from 'rxjs/operators';
import { SetBalanceAction,SetMensajeAction, SET_BALANCE,SET_MENSAJE, GetBalanceAction,GetMensajeAction } from '../../../recargas/store/currentAccount/currentAccount.actions';
import { AppState } from 'src/app/store/app.reducer';
import { AlertController } from '@ionic/angular';

@Component({
  selector: "app-seguros-home",
  templateUrl: "./seguros-home.page.html",
  styleUrls: ["./seguros-home.page.scss"],
})
export class SegurosHomePage implements OnInit, OnDestroy {
  public insurances: IInsurances[];
  public subscriptionInsurancesComplete = new Subscription();
  public user: IUser;
  public title: string;
  public subtitle: string;
  public showTitle: boolean;
  public showMenuButton: boolean;
  public balance: string;
  private accountSubs = new Subscription();
  public mensaje: string;
  public subscriptionCancelInsurance = new Subscription();
  public showCancelVida = false;
  public showCancelPyme = false;

  constructor(
    private navigation: NavigationHelper,
    private storage: Storage,
    private storeInsurances: Store<InsurancesState>,
    private storeInsurancesComplete: Store<InsurancesCompleteState>,
    private store: Store<AppState>,
    private actionsSubj: ActionsSubject,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {
    this.user = this.route.snapshot.data["user"];
  }

  ngOnInit() {
    this.configureInit();
    this.configureBalance();
    this.configureInsurancesComplete();
    this.configureInsuranceCancel();
  }

  configureInsuranceCancel() {
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
          this.getErrorAlert(response.result.content, false);
        }
      });
  }
  configureBalance() {
    this.accountSubs = this.actionsSubj
      .pipe(filter((action: SetBalanceAction) => action.type === SET_BALANCE))
      .subscribe((res: SetBalanceAction) => {
        this.balance = res.balance;
      });

    this.accountSubs = this.actionsSubj
      .pipe(filter((action: SetMensajeAction) => action.type === SET_MENSAJE))
      .subscribe((res: SetMensajeAction) => {
        console.log("mensaje", res.mensaje);
        this.mensaje = `${res.mensaje}`;
      });
  }

  configureInit() {
    this.title = "Seguros";
    this.subtitle = "Seguros";
    this.showTitle = true;
    this.showMenuButton = true;
    this.store.dispatch(new GetBalanceAction(this.user.token));
    this.store.dispatch(new GetMensajeAction(this.user.token));
  }

  configureInsurancesComplete() {
    this.storage.get("InsurancesComplete").then((response) => {
      if (response === null) {
        const Insurance = new InsurancesAction(
          true,
          this.user.token,
          this.user.tiendas[0].cliente_id
        );
        this.storeInsurances.dispatch(Insurance);
        this.storeInsurances.dispatch(new LoadingOn());
      }
    });

    this.subscriptionInsurancesComplete = this.storeInsurancesComplete
      .select("InsurancesComplete")
      .subscribe((response) => {
        if (response.active) {
          this.insurances = response.insurancesElement;
          this.validShowCancelButtons();
        }
      });
  }

  ngOnDestroy() {
    this.subscriptionInsurancesComplete.unsubscribe();
    this.accountSubs.unsubscribe();
    this.subscriptionCancelInsurance.unsubscribe();
  }

  cancelInsurance(slug) {
    let insurance = this.insurances.filter((insu) => {
      if(insu.slug == slug){
        return insu;
      }
    });
    let params = {
      token: this.user.token,
      slug: insurance[0].slug,
      cliente_id: insurance[0].cliente_id,
      id: insurance[0].id,
    };
    const InsuranceCancel = new InsuranceCancelAction(params, true);
    this.storeInsurances.dispatch(new LoadingOn(true));
    this.storeInsurances.dispatch(InsuranceCancel);
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
              this.navigation.goTo("inicio-tendero");
            } else {
              this.alertController.dismiss();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  validShowCancelButtons(){
    this.insurances.forEach(element => {
      if(element.slug == "vida_voluntario"){
        if(element.cliente_id){
          this.showCancelVida = true;
        }else{
          this.showCancelVida = false;
        }
      }
      if (element.slug == "pyme") {
        if (element.cliente_id) {
          this.showCancelPyme = true;
        } else {
          this.showCancelPyme = false;
        }
      }
    });
  }
}


