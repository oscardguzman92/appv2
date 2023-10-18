import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonSlides, AlertController } from '@ionic/angular';
import { Store, ActionsSubject } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '../../../../../interfaces/IUser';
import { Location } from '@angular/common';

import { SegurosRegistroModalComponent } from '../../compartido/components/seguros-registro-modal/seguros-registro-modal.component';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { LoadingOn } from '../../../../compartido/general/store/actions/loading.actions';
import { InsuranceState, InsurancesDepartamentsReducer, InsurancesDepartamentsCompleteState } from '../../store/insurances.reducer';
import {
  InsuranceAction,
  InsurancesDepartamentsAction,
  InsuranceCompleteAction,
  INSURANCE_COMPLETE,
  InsurancesMeidoPagoAction,
  InsurancesMeidoPagoCompleteAction,
  InsurancesDepartamentsCompleteAction,
  INSURANCES_DEPARTAMENTS_COMPLETE,
  INSURANCES_MEIDOPAGO,
  INSURANCES_MEIDOPAGO_COMPLETE,
} from "./../../store/insurances.actions";
import { IInsurances } from 'src/app/interfaces/IInsurances';
import { FormBuilder, FormGroup, Validators, MaxLengthValidator } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  InsuranceCompleteState,
  InsurancesState,
} from '../../store/insurances.reducer';

@Component({
  selector: "app-seguros-registro",
  templateUrl: "./seguros-registro.page.html",
  styleUrls: ["./seguros-registro.page.scss"],
})
export class SegurosRegistroPage implements OnInit {
  public insurance;
  public subscriptionInsuranceComplete = new Subscription();
  public subscriptionInsuranceDeptosComplete = new Subscription();
  public subscriptionInsuranceMeidoPagoComplete = new Subscription();
  public completedRegister = false;
  public user: IUser;
  public formData: FormGroup;
  public formData2: FormGroup;
  public deptos;
  public ciu;
  public medio_pago;
  public est_civ = [
    {
      id: "01",
      value: "Soltero(a)",
    },
    {
      id: "02",
      value: "Casado(a)",
    },
    {
      id: "03",
      value: "Viudo(a)",
    },
    {
      id: "04",
      value: "Divorciado(a)",
    },
    {
      id: "05",
      value: "Concubinato",
    },
  ];
  private emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public slides = {
    initialSlide: 0,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    allowTouchMove: false,
    zoom: false,
  };

  public title: string;
  public prima;
  public subtitle: string;
  public showTitle: boolean;
  public showMenuButton: boolean;
  public showBackHomeButton: boolean;

  @ViewChild("slides") slider: IonSlides;

  public seguro_id: "1";
  public cliente_id;
  public maxDate = "";
  medios: any;
  prima_puntos: any;
  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private storeInsurance: Store<InsurancesState>,
    private storeInsuranceComplete: Store<InsuranceCompleteState>,
    private storeInsuranceDeptoComplete: Store<
      InsurancesDepartamentsCompleteState
    >,
    private storeInsuranceMeidoComplete: Store<
      InsurancesMeidoPagoCompleteAction
    >,
    private storeInsuranceMeido: Store<InsurancesMeidoPagoAction>,
    public navigation: NavigationHelper,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public location: Location,
    private actionsSubj: ActionsSubject
  ) {
    this.user = this.route.snapshot.data["user"];
    this.cliente_id = this.user.tiendas[0].cliente_id;
  }

  ngOnInit() {
    let dataForm = {
      nombreCli:
        this.user.nombre_contacto != "" ? this.user.nombre_contacto : "",
      cedula: this.user.cedula != "" ? this.user.cedula : "",
      celular:
        this.user.telefono_contacto != "" ? this.user.telefono_contacto : "",
      email: this.user.email != "" ? this.user.email : "",
      direccion:
        this.user.tiendas[0].direccion != ""
          ? this.user.tiendas[0].direccion
          : "",
    };

    this.getDeptos();
    this.configureInsuranceData();
    this.configureInit(dataForm);
    this.configureInsuranceComplete();
    //console.log(this.insurance, "la insurrence");
  }

  getDeptos() {
    this.subscriptionInsuranceDeptosComplete = this.actionsSubj
      .pipe(
        filter(
          (res: InsurancesDepartamentsCompleteAction) =>
            res.type === INSURANCES_DEPARTAMENTS_COMPLETE
        )
      )
      .subscribe((response: InsurancesDepartamentsCompleteAction) => {
        if (response.toggle) {
          if (response.insurancesDepartament.length > 0) {
            this.deptos = response.insurancesDepartament;
          } else {
            this.getErrorAlert(
              "Hubo un error al consultar las ciudades asociadas"
            );
          }
        }
      });

    const deptos = new InsurancesDepartamentsAction(true, this.user.token);
    this.storeInsuranceDeptoComplete.dispatch(deptos);
    this.storeInsuranceDeptoComplete.dispatch(new LoadingOn());

    //medio de pago
    this.subscriptionInsuranceMeidoPagoComplete = this.actionsSubj
      .pipe(
        filter(
          (res: InsurancesMeidoPagoCompleteAction) =>
            res.type === INSURANCES_MEIDOPAGO_COMPLETE
        )
      )
      .subscribe((response: InsurancesMeidoPagoCompleteAction) => {
        if (response.toggle) {
          if (response.medios.length > 0) {
            //console.log(response.medios);
            this.medios = response.medios;
          } else {
            this.getErrorAlert("Hubo un error al consultar los medios de pago");
          }
        }
      });

    const medios = new InsurancesMeidoPagoAction(true, this.user.token);
    this.storeInsuranceMeido.dispatch(medios);
    //this.storeInsuranceDeptoComplete.dispatch(new LoadingOn());
  }

  configureInit(dataForm) {
    let eighteenYearsAgo = new Date();
    let fecha = eighteenYearsAgo.setFullYear(
      eighteenYearsAgo.getFullYear() - 18
    );
    let fecha2 = new Date(fecha);
    let mesNuevo = fecha2.getMonth().toString();
    mesNuevo = mesNuevo.length == 1 ? "0" + mesNuevo : mesNuevo;
    let diaNuevo = fecha2.getUTCDay().toString();
    diaNuevo = diaNuevo.length == 1 ? "0" + diaNuevo : diaNuevo;
    this.maxDate = fecha2.getFullYear() + "-" + mesNuevo + "-" + diaNuevo;

    this.title = "Registro";
    this.subtitle = "Seguros";
    this.showTitle = true;
    this.showMenuButton = false;
    this.showBackHomeButton = true;

    if (this.insurance.slug == "vida_voluntario") {
      this.formData = this.formBuilder.group({
        nombreCli: [dataForm.nombreCli, [Validators.required]],
        cedula: [
          dataForm.cedula,
          [Validators.required, Validators.maxLength(11)],
        ],
        nacimiento: ["", [Validators.required]],
        genero: ["", [Validators.required]],
      });
      this.formData2 = this.formBuilder.group({
        correo: [
          "",
          [Validators.required, Validators.pattern(this.emailPattern)],
        ],
        celular: [dataForm.celular, [Validators.maxLength(10)]],
        estado_civil: ["", [Validators.required]],
        departamento: ["", [Validators.required]],
        ciudad: ["", [Validators.required]],
        medioPago: ["", [Validators.required]],
      });
    } else {
      this.formData = this.formBuilder.group({
        nombreCli: [dataForm.nombreCli, [Validators.required]],
        cedula: [dataForm.cedula, [Validators.required]],
        nacimiento: ["", [Validators.required]],
      });
      this.formData2 = this.formBuilder.group({
        correo: [
          "",
          [Validators.required, Validators.pattern(this.emailPattern)],
        ],
        celular: [
          dataForm.celular,
          [Validators.required, Validators.maxLength(10)],
        ],
        estado_civil: ["", [Validators.required]],
        direccion: [dataForm.direccion, [Validators.required]],
        departamento: ["", [Validators.required]],
        ciudad: ["", [Validators.required]],
        medioPago: ["", [Validators.required]],
      });
    }

    this.formData2.get("departamento").valueChanges.subscribe((value) => {
      let ciudades = [];
      this.deptos.forEach((element) => {
        if (element.id === parseInt(value)) {
          ciudades = element.ciudades;
        }
      });
      this.ciu = ciudades.length > 0 ? ciudades : [];
    });
  }

  configureInsuranceComplete() {
    this.subscriptionInsuranceComplete = this.actionsSubj
      .pipe(
        filter(
          (res: InsuranceCompleteAction) => res.type === INSURANCE_COMPLETE
        )
      )
      .subscribe((response: InsuranceCompleteAction) => {
        //console.log(response);
        if (response.toogle) {
          if (response.result.code == 0) {
            //this.completedRegister = true;
            this.openModal(response.result);
          } else {
            this.getErrorAlert(response.result.content.mensaje);
          }
        }
        this.subscriptionInsuranceComplete.unsubscribe();
      });
  }

  ngOnDestroy() {
    this.subscriptionInsuranceComplete.unsubscribe();
    this.subscriptionInsuranceDeptosComplete.unsubscribe();
    this.subscriptionInsuranceMeidoPagoComplete.unsubscribe();
  }

  ionViewWillLeave() {
    this.insurance = null;
    this.subscriptionInsuranceComplete.unsubscribe();
    this.subscriptionInsuranceDeptosComplete.unsubscribe();
    this.subscriptionInsuranceMeidoPagoComplete.unsubscribe();
  }

  async nextSlide(index) {
    this.completedRegister = false;
    if (index === 0) {
      this.slider.slideTo(0);
    } else {
      this.slider.slideTo(1);
    }
  }

  async justBack() {
    this.completedRegister = false;
    this.slider.getActiveIndex().then((index) => {
      if (index > 0) {
        this.slider.slideTo(0);
      } else {
        this.location.back();
      }
    });
  }

  configureInsuranceData() {
    this.insurance = this.navigation.params.state.data.insurance;
    this.seguro_id = this.insurance.id;
    this.prima = this.insurance.prima;
    this.prima_puntos = this.insurance.prima_puntos;
    if (!this.insurance.cliente_id) {
      //this.completedRegister = true;//jeisson
      this.completedRegister = false;
    }
  }

  register() {
    const Insurance = new InsuranceAction(true, "", this.insurance);
    this.storeInsurance.dispatch(new LoadingOn(true));
    this.storeInsurance.dispatch(Insurance);
  }

  private async openModal(data) {
    const modal = await this.modalController.create(<any>{
      component: SegurosRegistroModalComponent,
      cssClass: "insurance-modal-confirmation",
      componentProps: { insu: data },
    });

    modal.onDidDismiss().then((res) => {
      this.navigation.goTo("inicio-tendero");
      if (!res.data) {
        return;
      }
    });

    return await modal.present();
  }

  async getErrorAlert(message, noredirect?) {
    const alert = await this.alertController.create({
      header: "Información",
      subHeader: "",
      message: message,
      //buttons: ["Aceptar"]
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

  resumen() {
    if (this.formData.valid && this.formData2.valid) {
      this.completedRegister = true;
      this.medio_pago = this.formData2.get("medioPago").value;
      this.insurance = {
        seguro_id: this.seguro_id,
        cliente_id: this.cliente_id,
        nombreCli: this.formData.get("nombreCli").value,
        num_id: this.formData.get("cedula").value,
        fecha_nacimiento: this.formData.get("nacimiento").value,
        genero: this.formData.get("genero")
          ? this.formData.get("genero").value
          : "",
        celular: this.formData2.get("celular").value,
        correo: this.formData2.get("correo").value,
        estado_civil: this.formData2.get("estado_civil")
          ? this.formData2.get("estado_civil").value
          : "",
        direccion: this.formData2.get("direccion")
          ? this.formData2.get("direccion").value
          : "",
        departamento_id: this.formData2.get("departamento").value,
        ciudad_id: this.formData2.get("ciudad").value,
        medio_pago: this.formData2.get("medioPago").value,
        token: this.user.token,
      };
    } else {
      let s = "Por favor valida la información de los campos";
      if (this.formData.get("nombreCli").value == "") {
        s = s + " Nombre";
      }

      if (this.formData.get("cedula").value == "") {
        s = s + ", Cédula";
      }

      if (this.formData.get("nacimiento").value == "") {
        s = s + ", Fecha de nacimiento";
      }

      if (
        this.insurance.slug == "vida_voluntario" &&
        this.formData.get("genero").value == ""
      ) {
        s = s + ", Genero";
      }

      // if (this.formData2.get("celular").value == "") {
      //   s = s + ", Celular";
      // }

      if (
        this.formData2.get("correo").value == "" ||
        !this.formData2.get("correo").value
      ) {
        s = s + ", Correo";
      }
      if (
        this.insurance.slug == "vida_voluntario" &&
        this.formData2.get("estado_civil").value == ""
      ) {
        s = s + ", Estado civil";
      }

      if (
        this.insurance.slug != "vida_voluntario" &&
        this.formData2.get("direccion").value == ""
      ) {
        s = s + ", Direccion";
      }

      if (this.formData2.get("departamento").value == "") {
        s = s + ", Departamento";
      }

      if (this.formData2.get("ciudad").value == "") {
        s = s + ", Ciudad";
      }

      this.getErrorAlert(s, true);
    }
  }

  // Getters form
  get correoGet() {
    return this.formData2.get("correo");
  }
  get cedulaGet() {
    return this.formData.get("cedula");
  }
  get nacimientoGet() {
    return this.formData.get("nacimiento");
  }
  get nombreGet() {
    return this.formData.get("nombreCli");
  }
  get departamentoGet() {
    return this.formData.get("departamento");
  }
  get ciudadGet() {
    return this.formData.get("ciudad");
  }

  get medioPagoGet() {
    return this.formData2.get("medioPago");
  }

  testCedulaLength(event) {
    if (this.cedulaGet.value.toString().length >= 11) {
      let substring = this.cedulaGet.value.toString().substring(0, 10);
      this.cedulaGet.setValue(parseInt(substring));
    }
  }
}
