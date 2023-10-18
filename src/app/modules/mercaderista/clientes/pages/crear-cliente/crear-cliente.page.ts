import {Component, OnInit} from '@angular/core';
import {Mercaderista} from '../../../../../models/Mercaderista';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {
    GetClientByDocument,
    SET_CLIENT_BY_DOCUMENT,
    SetClientByDocument
} from '../../../../vendedor/misClientes/store/mis-clientes.actions';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {filter} from 'rxjs/operators';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {Subscription} from 'rxjs';
import {AlertController} from '@ionic/angular';
import {Intercom} from '@ionic-native/intercom/ngx';
import { NavigationHelper } from "src/app/helpers/navigation/navigation.helper";
import { Shop } from 'src/app/models/Shop';


@Component({
  selector: "app-crear-cliente",
  templateUrl: "./crear-cliente.page.html",
  styleUrls: ["./crear-cliente.page.scss"],
})
export class CrearClientePage implements OnInit {
  public user: Mercaderista;
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

  validateDocument(formValue: { document: string }) {
    this.store.dispatch(new LoadingOn());
    this.store.dispatch(
      new GetClientByDocument(
        formValue.document,
        true,
        this.user.distribuidor_id
      )
    );
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
          console.log(res.data, "res.data");
          this.getClientByDocumentRes = res.data.content;
          //this.presentAlert(error);
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
      console.log(client, this.getClientByDocumentRes);
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
    this.navigationhelper.goTo("clientes-mercaderista");
  }

  public updateData(client) {
      this.selected = true;
      this.updateStore(client);
  }

  cancelCreate() {
    this.client = null;
    this.selected = false;
  }
}
