import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IonSlides, LoadingController, ModalController} from '@ionic/angular';
import {RegistroCapturaUbicacionComponent} from './components/registro-captura-ubicacion/registro-captura-ubicacion.component';
import {Form, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {Storage} from '@ionic/storage';
import {Shop} from '../../../../../models/Shop';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {
    AfterSetUserAction, BACK_BUTTON_ACTION, BackButtonAction,
    SetUserAction,
    UPDATE_USER_BEFORE_FINISH_REGISTER,
    UpdateUserBeforeRegisterFinishAction
} from '../../store/registro.actions';
import {SetUserAction as SetUserActionLogin} from '../../../../../store/auth/auth.actions';
import {Observable, Subscription} from 'rxjs';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {filter} from 'rxjs/operators';
import {SET_TOP_UPS, SetTopUpsAction} from '../../../recargas/store/topUps/topUps.actions';
import {RegistroResumenCapturaDatosComponent} from './components/registro-resumen-captura-datos/registro-resumen-captura-datos.component';
import {ModalOptions} from '@ionic/core';
import {IUser} from '../../../../../interfaces/IUser';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';

@Component({
  selector: "app-registro",
  templateUrl: "./registro.page.html",
  styleUrls: ["./registro.page.scss"],
})
export class RegistroPage implements OnInit, OnDestroy {
  @ViewChild("slides") slides: IonSlides;

  private shopkeeper: Shopkeeper;
  private stepSlide = 0;
  private step: string;

  // Forms
  namesForm: FormGroup;
  phoneForm: FormGroup;
  membershipForm: FormGroup;
  stratumForm: FormGroup;
  typeShopForm: FormGroup;

  public strata = [1, 2, 3, 4, 5, 6];
  public slideOpts = {
    effect: "flip",
    allowTouchMove: false,
    initialSlide: this.stepSlide,
    zoom: false,
  };
  public disableSms: boolean;
  public hideSendCodeSms: boolean;

  private subUpdateAction = new Subscription();
  private backButtonSubs = new Subscription();
  public typesShops = [];
  public typeShop;
  public update: boolean;
  updateClient: any;
  isUpdateClient = false;

  private emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private storage: Storage,
    private store: Store<AppState>,
    private loading: LoadingController,
    private actionsSubj: ActionsSubject,
    private navigation: NavigationHelper
  ) {
    this.disableSms = true;
    this.hideSendCodeSms = false;

    this.typesShops = [];
    this.initForms();
    this.storage.get("auth-user-update").then((user) => {
      if (user) {
        this.updateClient = JSON.parse(user);
        this.isUpdateClient = true;
        if (
          this.updateClient.tipologias &&
          this.updateClient.tipologias.length > 0
        ) {
          this.updateClient.tipologias.map(function (type) {
            type.selected = false;
          });
          this.typesShops = this.updateClient.tipologias;
        }

        if (
          this.updateClient.tiendas.length > 0 &&
          this.updateClient.tiendas[0].tienda_tipologia_id
        ) {
          const indexTypeshop = this.typesShops.findIndex(
            (ts) => ts.value == this.updateClient.tiendas[0].tienda_tipologia_id
          );
          if (indexTypeshop !== -1) {
            this.typesShops[indexTypeshop].selected = true;
          }
        }
        this.update = true;
      }
      this.initForms();
      this.validateNumberSlide();
    });

    this.storage.get("tipologias").then((tipologias) => {
      if (tipologias) {
        tipologias.map(function (type) {
          type.selected = false;
        });
        this.typesShops = tipologias;
      }
    });
  }

  ngOnInit() {
    this.storage
      .get("auth-step")
      .then((step) => {
        if (!step) {
          return this.storage.get("auth-register");
        }
        this.step = step;
        this.store.dispatch(new LoadingOn());
        return this.storage.get("auth-register");
      })
      .then((user) => {
        if (this.updateClient) {
          this.shopkeeper = new Shopkeeper(this.updateClient);
          console.log(this.shopkeeper);
          return;
        }
        if (!user) {
          this.shopkeeper = new Shopkeeper({});
          return;
        }
        this.shopkeeper = new Shopkeeper(JSON.parse(user));
        if (this.step) {
          this.detectStep(StepsRegister[this.step]);
        }
      });

    this.initSubs();
  }

  ngOnDestroy(): void {
    this.subUpdateAction.unsubscribe();
    this.backButtonSubs.unsubscribe();
  }

  onBack() {
    this.storage.remove("auth-step");
    this.storage.remove("auth-register");
    if (this.isUpdateClient) {
      this.navigation.justBack();
    } else {
      this.navigation.goTo("inicio");
    }
  }

  async buildWithNames(names: {
    shopName: string;
    contactName: string;
    contactEmail: string;
  }) {
    this.shopkeeper.nombre_contacto = names.contactName;
    this.shopkeeper.email = names.contactEmail;
    if (!this.isUpdateClient) {
      this.shopkeeper.tiendas = [new Shop({ nombre: names.shopName })];
    } else {
      this.shopkeeper.tiendas[0].nombre = names.shopName;
    }
    await this.storage.set("auth-register", JSON.stringify(this.shopkeeper));
    await this.setStep(StepsRegister.shopAndContact);
    this.nextSlide();
  }

  async buildWithMembership(data: { membership: string }) {
    this.shopkeeper.membresia = data.membership;
    await this.storage.set("auth-register", JSON.stringify(this.shopkeeper));
    await this.setStep(StepsRegister.membersip);
    this.nextSlide();
  }

  async buildWithPhone(data: { phone: string }) {
    this.shopkeeper.telefono_contacto = data.phone;
    await this.storage.set("auth-register", JSON.stringify(this.shopkeeper));
    await this.setStep(StepsRegister.phone);
    this.nextSlide();
  }

  async registerSms() {
    this.store.dispatch(new LoadingOn());
    await this.setStep(StepsRegister.smsValidation);
    this.validateCode().subscribe(
      (res) => {
        this.nextSlide();
        this.store.dispatch(new LoadingOff());
      },
      (err) => {
        this.store.dispatch(new LoadingOff());
        this.store.dispatch(new Fail(err));
      }
    );
  }

  async buildWithStratum(value: { stratum: number }) {
    this.shopkeeper.tiendas[0].estrato = value.stratum;
    await this.storage.set("auth-register", JSON.stringify(this.shopkeeper));
    await this.setStep(StepsRegister.stratum);
    this.nextSlide();
  }

  async buildWithTypeShop(typeShopId: number) {
    this.shopkeeper.tiendas[0].tienda_tipologia_id = typeShopId;
    await this.storage.set("auth-register", JSON.stringify(this.shopkeeper));
    await this.setStep(StepsRegister.typeShop);
  }

  acceptedCode() {
    this.disableSms = false;
    this.hideSendCodeSms = true;
  }

  previousSlide() {
    this.slides.slidePrev();
  }

  nextSlide() {
    this.slides.slideNext();
  }

  async capturaUbicacion(typeShop: any) {
    this.buildWithTypeShop(typeShop);
    await this.storage.set("from-register", true);
    await this.storage.set("auth-register", JSON.stringify(this.shopkeeper));
    if (this.update) {
      await this.storage.set(
        "auth-user-update",
        JSON.stringify(this.shopkeeper)
      );
    }

    this.store.dispatch(new LoadingOn());
    this.store.dispatch(new SetUserAction(this.shopkeeper));
  }

  changeSelected(type: { nombre: string; id: number; selected: boolean }) {
    this.typesShops.map(
      (typeMap: { nombre: string; id: number; selected: boolean }) => {
        if (typeMap.id !== type.id) {
          typeMap.selected = false;
          return typeMap;
        }

        return typeMap;
      }
    );
  }

  get typeShopValue() {
    const res = this.typesShops.filter((typeShop) => {
      return typeShop.selected === true;
    });
    return res;
  }

  private initForms() {
    const shopName =
      this.updateClient && this.updateClient.tiendas[0].nombre
        ? this.updateClient.tiendas[0].nombre
        : "";
    const contactName =
      this.updateClient && this.updateClient.nombre_contacto
        ? this.updateClient.nombre_contacto
        : "";
    const contactEmail =
      this.updateClient && this.updateClient.email
        ? this.updateClient.email
        : "";
    this.namesForm = this.formBuilder.group({
      shopName: [shopName, Validators.required],
      contactName: [contactName, Validators.required],
      contactEmail: [contactEmail, Validators.pattern(this.emailPattern)],
    });

    const membership =
      this.updateClient && this.updateClient.membresia
        ? this.updateClient.membresia
        : "GRA715";
    this.membershipForm = this.formBuilder.group({
      membership: [membership, Validators.required],
    });

    const phone =
      this.updateClient && this.updateClient.telefono_contacto
        ? this.updateClient.telefono_contacto
        : "";
    this.phoneForm = this.formBuilder.group({
      phone: [phone, Validators.required],
    });

    const stratum =
      this.updateClient && this.updateClient.tiendas[0].estrato
        ? this.updateClient.tiendas[0].estrato
        : null;
    this.stratumForm = this.formBuilder.group({
      stratum: [stratum, Validators.required],
    });
  }

  private setStep(step: StepsRegister) {
    this.storage.set("auth-step", step);
  }

  private detectStep(step: string) {
    switch (step) {
      case StepsRegister.shopAndContact as string:
        this.stepShopAndContact();
        break;

      case StepsRegister.membersip as string:
        this.stepShopAndContact();
        this.stepMembersip();
        break;

      case StepsRegister.phone as string:
        this.stepShopAndContact();
        this.stepMembersip();
        this.stepPhone();
        break;

      case StepsRegister.smsValidation as string:
        this.stepShopAndContact();
        this.stepMembersip();
        this.stepPhone();
        this.stepSlide = 3;
        break;

      case StepsRegister.stratum as string:
        this.stepShopAndContact();
        this.stepMembersip();
        this.stepPhone();
        this.stepStratum();
        break;

      case StepsRegister.typeShop as string:
        this.stepShopAndContact();
        this.stepMembersip();
        this.stepPhone();
        this.stepStratum();
        this.stepTypeShop();
        break;

      case StepsRegister.ubication as string:
        this.stepShopAndContact();
        this.stepMembersip();
        this.stepPhone();
        this.stepStratum();
        this.stepTypeShop();
        this.stepUbication();
        break;
    }

    this.slideOpts.initialSlide = this.stepSlide;
    if (step) {
      this.finishLoading();
    }
  }

  private stepShopAndContact() {
    this.namesForm
      .get("shopName")
      .setValue(this.shopkeeper.nombre_contacto || "");
    this.namesForm
      .get("contactName")
      .setValue(this.shopkeeper.tiendas[0].nombre || "");
    this.stepSlide = 1;
  }

  private stepMembersip() {
    this.membershipForm.get("membership").setValue(this.shopkeeper.membresia);
    this.stepSlide = 2;
  }

  private stepPhone() {
    this.phoneForm.get("phone").setValue(this.shopkeeper.telefono_contacto);
    this.stepSlide = 3;
  }

  private stepStratum() {
    this.stratumForm
      .get("stratum")
      .setValue(this.shopkeeper.tiendas[0].estrato);
    this.stepSlide = 5;
  }

  private stepTypeShop() {
    this.typesShops.map((shop) => {
      if (shop.value === this.shopkeeper.tiendas[0].tienda_tipologia_id) {
        shop.selected = true;
        return shop;
      }

      return shop;
    });
    this.stepSlide = 5;
  }

  private async stepUbication() {
    await this.storage.set("from-register", true);
    this.store.dispatch(new SetUserActionLogin(this.shopkeeper));
    this.store.dispatch(new AfterSetUserAction(this.shopkeeper));
  }

  private finishLoading() {
    setTimeout(() => {
      this.store.dispatch(new LoadingOff());
    }, 2000);
  }

  private validateCode() {
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next("Termino");
        // observer.error({message: 'El codigo no coincide con el enviado'});
      }, 1000);
    });
  }

  private initSubs() {
    this.subUpdateAction = this.actionsSubj
      .pipe(
        filter(
          (res: UpdateUserBeforeRegisterFinishAction) =>
            res.type === UPDATE_USER_BEFORE_FINISH_REGISTER
        )
      )
      .subscribe((res) => {
        this.modalController.dismiss().then(
          () => {
            this.modalSummary(res.user, res.departament, res.city);
          },
          () => {
            this.modalSummary(res.user, res.departament, res.city);
          }
        );
      });

    this.backButtonSubs = this.actionsSubj
      .pipe(filter((res: BackButtonAction) => res.type === BACK_BUTTON_ACTION))
      .subscribe(async (res) => {
        const currentSlide = await this.slides.getActiveIndex();
        if (currentSlide === 0) {
          await this.storage.remove("auth-step");
          await this.storage.remove("auth-register");
          this.navigation.goTo("inicio");
          return;
        }
        this.previousSlide();
      });
  }

  private async modalSummary(
    userData: IUser,
    departament: string,
    city: string
  ) {
    const modal = await this.modalController.create(<ModalOptions>{
      component: RegistroResumenCapturaDatosComponent,
      componentProps: {
        user: userData,
        departament: departament,
        city: city,
        typesShops: this.typesShops,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (!data.data) {
        return;
      }

      if (data.data.map !== null && data.data.map !== undefined) {
        this.storage.set("from-register", true).then(() => {
          this.store.dispatch(new LoadingOff());
          this.store.dispatch(new SetUserActionLogin(this.shopkeeper));
          this.store.dispatch(new AfterSetUserAction(this.shopkeeper));
        });
      }
    });

    return await modal.present();
  }

  private validateNumberSlide() {
    if (this.updateClient && this.updateClient.slideRegister) {
      this.slides.slideTo(this.updateClient.slideRegister);
    }
  }
}

enum StepsRegister {
    shopAndContact = 'shopAndContact',
    phone = 'phone',
    membersip = 'membersip',
    smsValidation = 'smsValidation',
    stratum = 'stratum',
    typeShop = 'typeShop',
    ubication = 'ubication'
}
