import {Component, OnInit} from '@angular/core';
import {Shop} from '../../../../../models/Shop';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {
    FINISH_UPDATE_ASSOCIATION, FinishUpdateAssociation,
    GetClientByDocument,
    SET_CLIENT_BY_DOCUMENT,
    SetClientByDocument, UpdateAssociation
} from '../../store/mis-clientes.actions';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {AlertController} from '@ionic/angular';
import {Success} from '../../../../compartido/general/store/actions/sucess.actions';
import {Seller} from '../../../../../models/Seller';
// import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import {OpenNativeSettings} from '@ionic-native/open-native-settings/ngx';
import {BarcodeScanner, BarcodeScanResult} from '@ionic-native/barcode-scanner/ngx';

@Component({
    selector: 'app-asignar-cliente',
    templateUrl: './asignar-cliente.page.html',
    styleUrls: ['./asignar-cliente.page.scss'],
})
export class AsignarClientePage implements OnInit {
    public shop: Shop;
    public formDocument: FormGroup;
    public focusDocumentActive: boolean;
    public validateDocumentSubs = new Subscription();
    public updateAssociationSubs = new Subscription();
    public client: Shopkeeper;
    public user: Seller;
    public tipoConsulta: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private navigation: NavigationHelper,
        private formBuilder: FormBuilder,
        private store: Store<AppState>,
        private actionS: ActionsSubject,
        private alert: AlertController,
        private barcodeScanner: BarcodeScanner,
        private nativeSettings: OpenNativeSettings) {
        this.user = this.route.snapshot.data['user'];
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                const data = this.router.getCurrentNavigation().extras.state.data;
                this.shop = data;
            } else {
                this.navigation.goTo('lista-clientes');
            }
        });
    }

    ionViewWillLeave() {
        this.validateDocumentSubs.unsubscribe();
        this.updateAssociationSubs.unsubscribe();
    }

    ngOnInit() {
        this.formDocument = this.formBuilder.group({
            document: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
        });

        this.validateDocumentSubs = this.actionS
            .pipe(filter(action => action.type === SET_CLIENT_BY_DOCUMENT))
            .subscribe((res: SetClientByDocument) => {
                this.store.dispatch(new LoadingOff());

                if (!res.data.content.cedula) {
                    const error = {
                        mensaje:
                            'La cédula no está registrada en storeapp. Por favor valide nuevamente en el menu lateral del app del tendero'
                    };

                    this.store.dispatch(new Fail(error));
                    return;
                }

                this.client = new Shopkeeper(res.data.content);
            });

        this.updateAssociationSubs = this.actionS
            .pipe(filter(action => action.type === FINISH_UPDATE_ASSOCIATION))
            .subscribe((res: FinishUpdateAssociation) => {
                this.store.dispatch(new LoadingOff());

                if (res.data.code === 0) {
                    const message = 'La asociación se realizó de forma correcta. Desde la aplicación del tendero, utilice el botón de ' +
                        'Refresacar información en el menú lateral y podrá acceder a los productos que usted le ofrece.';
                    this.store.dispatch(new Success({message: message}));
                    this.navigation.goTo('lista-clientes');
                    return;
                }
                this.store.dispatch(new Fail({mensaje: res.data.content[0]}));
                this.justBack();
            });
    }

    justBack() {
        this.navigation.justBack();
    }

    get controls() {
        return this.formDocument.controls;
    }

    focusDocument(active: boolean) {
        this.focusDocumentActive = active;
    }

    validateDocument(formValue: { document: string }) {
        this.focusDocumentActive = false;

        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetClientByDocument(formValue.document));
    }

    selectShop(shop: Shop) {
        if (shop.checkedAsignClient) {
            this.presentAlert(shop);
        }
    }

    ciudadesEnDistribuidores(ciudad_id) {
        let enCiudades;

        if (!this.user.distribuidor) {
            return false;
        }

        if (!this.user.distribuidor.ciudades_distribuidores) {
            return false;
        }

        enCiudades = this.user.distribuidor.ciudades_distribuidores.filter((ciudad) => {
            return ciudad_id === ciudad.ciudad_id;
        });

        return enCiudades.length > 0;
    }

    private async presentError(err, handle) {
        const alert = await this.alert.create({
            header: 'Atención',
            message: err,
            buttons: [{
                text: 'Aceptar',
                handler: handle
            }],
            cssClass: 'attention-alert',
        });

        await alert.present();
    }

    private async presentAlert(shop: Shop) {
        const validaCiudad = this.ciudadesEnDistribuidores(shop.ciudad_id);
        const ciuVende = (this.user.distribuidor.ciudades_distribuidores[0] && this.user.distribuidor.ciudades_distribuidores[0].ciu_nombre) ? this.user.distribuidor.ciudades_distribuidores[0].ciu_nombre : 'Sin asignar';
        const ciuCliente = (shop.ciu_nombre) ? shop.ciu_nombre : 'Sin asignar';
        const m = (validaCiudad) ? '' : '<span class="error2 error--asignar_cliente-modal">Usted está registrado en la ciudad de ' + ciuVende + ' el cliente que quiere asociar está registrado en ' + ciuCliente + '.</span><br><br>';
        const alert = await this.alert.create({
            header: `¡Atención!`,
            message: `${m}¿Está seguro de asociar el cliente con codigo: ${this.shop.codigo_cliente} a la cuenta en storeapp` +
                ` con documento/NIT: ${this.client.cedula} en la dirección: ${shop.direccion}?`,
            cssClass: 'attention-alert',
            buttons: [
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.store.dispatch(new LoadingOn());
                        this.store.dispatch(
                            new UpdateAssociation(this.client.id, this.shop.id, this.shop.distribuidor_id, shop.id, this.user.token)
                        );
                    }
                }, {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        shop.checkedAsignClient = false;
                    }
                }
            ]
        });

        return await alert.present();
    }

    readQR() {
        this.barcodeScanner.scan()
            .then((barcodeData: BarcodeScanResult) => {
                if (!barcodeData.text) {
                    return;
                }
                const clientArray = barcodeData.text.split(';');
                this.client = new Shopkeeper({
                    cedula: clientArray[0],
                    id: clientArray[1],
                    tiendas: [{
                        cliente_id: clientArray[1],
                        id: clientArray[2],
                        direccion: clientArray[3],
                        estrato: clientArray[4],
                        nombre: clientArray[5],
                        ciudad_id: clientArray[6],
                        ciu_nombre: clientArray[7]
                    }]
                });
            })
            .catch((e: any) => {
                this.presentError('Debes permitir el uso de la camara', () => {
                    this.nativeSettings.open('settings');
                });
            });
    }

    open(type: string) {
        this.tipoConsulta = type;
    }
}
