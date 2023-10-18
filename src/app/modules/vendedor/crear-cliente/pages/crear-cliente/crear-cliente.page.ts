import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {GetClientByDocument, SET_CLIENT_BY_DOCUMENT, SetClientByDocument} from '../../../misClientes/store/mis-clientes.actions';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {AlertController, IonContent} from '@ionic/angular';
import {Intercom} from '@ionic-native/intercom/ngx';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {Seller} from '../../../../../models/Seller';
import {Shop} from '../../../../../models/Shop';
import { NavigationHelper } from "src/app/helpers/navigation/navigation.helper";

@Component({
  selector: "app-crear-cliente",
  templateUrl: "./crear-cliente.page.html",
  styleUrls: ["./crear-cliente.page.scss"],
})
export class CrearClientePage implements OnInit, OnDestroy {
  @ViewChild("pageTop") pageTop: IonContent;
  public user: Seller;
  public formDocument: FormGroup;
  public validateDocumentSubs = new Subscription();
  public client: Shopkeeper;
  public getClientByDocumentRes: any;
  public selected: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private actionS: ActionsSubject,
    private alertController: AlertController,
    private intercom: Intercom,
    private navigationhelper: NavigationHelper
  ) {
    this.user = this.route.snapshot.data["user"];
  }

  ngOnInit() {
    this.formDocument = this.formBuilder.group({
      document: [
        "",
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.minLength(6),
        ],
      ],
    });

    this.listenerSetClient();
  }

  ngOnDestroy(): void {
    this.validateDocumentSubs.unsubscribe();
  }

  validateDocument(formValue: { document: string }) {
    this.store.dispatch(new LoadingOn());
    this.store.dispatch(
      new GetClientByDocument(
        formValue.document,
        true,
        this.user.distribuidor.id
      )
    );
  }

  cancelCreate() {
    this.client = null;
    this.selected = false;
  }

  get controls() {
    return this.formDocument.controls;
  }

  private listenerSetClient() {
    this.validateDocumentSubs = this.actionS
      .pipe(filter((action) => action.type === SET_CLIENT_BY_DOCUMENT))
      .subscribe((res: SetClientByDocument) => {
        this.store.dispatch(new LoadingOff());

        if (res.data.content.cedula && res.data.code != 5) {
          const error =
            "La cédula ya está registrada en storeapp. Por favor valida nuevamente, o comunícate con soporte";
          this.getClientByDocumentRes = res.data.content;
          //aca mostrar modal con opcion de actulizar datos o crear sucursal
          //this.presentAlertNewOrUpdateData("La cédula ya está registrada en el Distribuidor. ¿Desea crear una sucursal o actulizar la inforamación?");
          //this.presentAlert(error);
          return;
        }

        if (res.data.content && res.data.content.cedula && res.data.code == 5) {
          this.client = new Shopkeeper({
            id: res.data.content.id,
            cedula: res.data.content.cedula,
            nombre_contacto: res.data.content.nombre_contacto,
            telefono_contacto: res.data.content.telefono_contacto,
          });

          if (!res.data.content.tienda) {
            return;
          }

          this.client.tiendas = [
            new Shop({
              nombre: res.data.content.tienda.nombre,
              nuevaSucursal: true,
            }),
          ];
          if (
            res.data.content &&
            res.data.content.tipologias &&
            res.data.content.tipologias.length > 1
          ) {
            this.client.tipologias = res.data.content.tipologias;
          }
          return;
        }

        this.client = new Shopkeeper({
          cedula: this.controls["document"].value,
        });

        if (res.data.content && res.data.content.length >= 2) {
          this.client.tipologias = res.data.content[1];
        }
      });
  }

  private async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: "Información",
      subHeader: "",
      message: message,
      buttons: [
        {
          text: "Contáctanos",
          handler: () => {
            this.intercom.displayMessenger();
          },
        },
        "Aceptar",
      ],
    });

    await alert.present();
  }

  public updateStore(client) {
    if (this.getClientByDocumentRes && this.getClientByDocumentRes.cedula) {
      this.client = new Shopkeeper({
        id: this.getClientByDocumentRes.id,
        cedula: this.getClientByDocumentRes.cedula,
        nombre_contacto: client.nombre_en_distribuidor,
        telefono_contacto: client.telefono_en_distribuidor,
      });

      this.client.tiendas = [
        new Shop({
          id: client.tienda_id,
          telefono_contacto: client.telefono_en_distribuidor,
          nuevaSucursal: false,
          nombre_tienda: client.nombre_tienda_en_distribuidor || "",
        }),
      ];

      if (
        this.getClientByDocumentRes &&
        this.getClientByDocumentRes.tipologias &&
        this.getClientByDocumentRes.tipologias.length > 1
      ) {
        this.client.tipologias = this.getClientByDocumentRes.tipologias;
      }
      return;
    }
  }

  public createNewStore() {
    if (this.getClientByDocumentRes && this.getClientByDocumentRes.cedula) {
      this.selected = true;
      this.client = new Shopkeeper({
        id: this.getClientByDocumentRes.id,
        cedula: this.getClientByDocumentRes.cedula,
        nombre_contacto: this.getClientByDocumentRes.tienda
          .nombre_en_distribuidor,
        telefono_contacto: this.getClientByDocumentRes.telefono_contacto,
      });

      this.client.tiendas = [
        new Shop({
          telefono_contacto: this.getClientByDocumentRes.tienda
            .telefono_en_distribuidor,
          nuevaSucursal: true,
        }),
      ];

      if (
        this.getClientByDocumentRes &&
        this.getClientByDocumentRes.tipologias &&
        this.getClientByDocumentRes.tipologias.length > 1
      ) {
        this.client.tipologias = this.getClientByDocumentRes.tipologias;
      }
      return;
    }
  }

  public cancel() {
    this.navigationhelper.goTo("lista-clientes");
  }

  public updateData(client) {
    console.log(client, "holaa");
    let seller_exit = false;
    client.vendedores.forEach((element) => {
      if (element.user_id == this.user.user_id) {
        seller_exit = true;
        return;
      }
    });

    if (seller_exit) {
      this.selected = true;
      this.updateStore(client);
    } else {
      let msm =
        "Este cliente está asociado a otro vendedor, comunícate con tu distribuidor para agregarlo a tu ruta";
      this.presentAlertWtapp(msm);
    }
  }

  private async presentAlertWtapp(msj) {
    const buttons = [{ text: "Aceptar" }];
    if (this.user.distribuidor && this.user.distribuidor.telefono) {
      const obj = {
        text: "Ir a Whatsapp",
        handler: () => {
          window.open(
            "https://api.whatsapp.com/send?text=Hola storeapp&phone=+57" +
              this.user.distribuidor.telefono,
            "_blank"
          );
        },
      };
      buttons.push(obj);
    }
    const alert = await this.alertController.create({
      header: "Atención",
      message: msj,
      buttons: buttons,
      cssClass: "info-alert",
    });

    await alert.present();
  }
}
