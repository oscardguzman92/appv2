import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit} from '@angular/core';
import {AlertController, IonContent, IonSlides, ModalController} from '@ionic/angular';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Shop} from '../../../../../models/Shop';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {PhoneNumberValidator} from '../../../../../validators/PhoneNumberValidator';
import {CrearClienteCapturaUbicacionComponent} from '../crear-cliente-captura-ubicacion/crear-cliente-captura-ubicacion.component';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {
    RESPONSE_UPDATE_CELLPHONE,
    ResponseUpdateCellphoneAction,
    UpdateCellphoneAction
} from '../../../../compartido/inicio/store/login.actions';
import {filter} from 'rxjs/operators';
import {Intercom} from '@ionic-native/intercom/ngx';
import {Seller} from '../../../../../models/Seller';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {SignaturePad} from 'angular2-signaturepad/signature-pad';

@Component({
    selector: 'app-crear-cliente-captura-datos',
    templateUrl: './crear-cliente-captura-datos.component.html',
    styleUrls: ['./crear-cliente-captura-datos.component.scss'],
})
export class CrearClienteCapturaDatosComponent implements OnInit, AfterViewInit {
    @Input() shopkeeper: Shopkeeper;
    @Input() pageTop: IonContent;
    @Input() seller: Seller;
    @Output() cancelCreateEvent = new EventEmitter();
    @ViewChild('slides') slides: IonSlides;
    @ViewChild(SignaturePad) public signaturePad: SignaturePad;

    public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor       
        'maxWidth': 3,
        'dotSize': 3,  
        'canvasWidth': 330,//320,
        'canvasHeight': 450,//200,
        'backgroundColor': "rgb(255,255,255)"
      };
    public imgSignature: string;

    public slideOpts = {
        effect: 'flip',
        allowTouchMove: false,
        zoom: false
    };
    public photoDocument: any;
    public photoDocument2: any;
    public photoRut: any;    
    
    // Forms
    public namesForm: FormGroup;
    public documentPhoneForm: FormGroup;
    private emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    public diasVisita = [
        {
            id: 1,
            nombre: "Lunes"
        },
        {
            id: 2,
            nombre: "Martes"
        },
        {
            id: 3,
            nombre: "Miércoles"
        },
        {
            id: 4,
            nombre: "Jueves"
        },
        {
            id: 5,
            nombre: "Viernes"
        },
        {
            id: 6,
            nombre: "Sábado"
        },
        {
            id: 7,
            nombre: "Domingo"
        },
    ];


    constructor(
        private formBuilder: FormBuilder,
        private modalController: ModalController,
        private store: Store<AppState>,
        private actionS: ActionsSubject,
        private intercom: Intercom,
        private alertController: AlertController,
        private camera: Camera) {}

    ngOnInit() {
        this.initForms();

        this.actionS
            .pipe(filter((res: ResponseUpdateCellphoneAction) => res.type === RESPONSE_UPDATE_CELLPHONE))
            .subscribe((res: ResponseUpdateCellphoneAction) => {
                this.store.dispatch(new LoadingOff());
                if (res.data.code === 6) {
                    this.presentAlert('El número celular ya se encuentra en uso.');
                    return;
                }

                if (res.data.code === 0) {
                    this.nextSlide();
                }
            });
    }

    ngAfterViewInit(): void {
        this.signaturePad.set('minWidth', 2);
        this.signaturePad.clear();
      }

    async buildWithNames(names: { shopName: string, contactName: string ,contactEmail:string, visitDay:string }) {
        this.shopkeeper.nombre_contacto = names.contactName;
        this.shopkeeper.email = names.contactEmail;
        console.log(this.shopkeeper, "this.shopkeepersssssss");
        if (this.shopkeeper.tiendas.length > 0 && this.shopkeeper.tiendas[0].nuevaSucursal !=undefined && this.shopkeeper.tiendas[0].nuevaSucursal == true ) {
            this.shopkeeper.tiendas = [new Shop({nombre: names.shopName, tienda_tipologia_id: 0 , nuevaSucursal:1, dia_semana: names.visitDay})];
        }
        if(this.shopkeeper.tiendas.length > 0){
            this.shopkeeper.tiendas = [new Shop({nombre: names.shopName, tienda_tipologia_id: 0, id: this.shopkeeper.tiendas[0].id, dia_semana: names.visitDay})];
        }else{
            this.shopkeeper.tiendas = [new Shop({nombre: names.shopName, tienda_tipologia_id: 0, dia_semana: names.visitDay})] ;
        }
        console.log(this.shopkeeper.tiendas,"aca voy util 2");
        this.nextSlide();
    }

    async buildWithCell(cellPhoneForm: { cellphone: string }) {
        this.shopkeeper.telefono_contacto = cellPhoneForm.cellphone;
        this.store.dispatch(new LoadingOn());
        if (this.shopkeeper.id) {
            this.store.dispatch(new UpdateCellphoneAction(cellPhoneForm.cellphone, null, true, this.shopkeeper.id));
            return;
        }
        this.store.dispatch(new UpdateCellphoneAction(cellPhoneForm.cellphone, null, true,null,true));
    }

    nextSlide() {
        this.slides.slideNext();
    }

    prevSlide(toTop?: boolean) {
        if (toTop) {
            this.pageTop.scrollToTop(400);
        }
        this.slides.slidePrev();
    }

    makePhotoDocument(cara?: number) {
        const options: CameraOptions = {
            quality: 35,
            destinationType: this.camera.DestinationType.DATA_URL,
            sourceType: this.camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: this.camera.EncodingType.JPEG,
            targetWidth: 450,
            targetHeight: 700,
            saveToPhotoAlbum: false
        };
        this.camera.getPicture(options).then((img) => {
            if(cara){
                this.photoDocument2 = 'data:image/jpeg;base64,' + img;
                this.shopkeeper.imgDocumento2 = this.photoDocument2;
            }else{
                this.photoDocument = 'data:image/jpeg;base64,' + img;
                this.shopkeeper.imgDocumento = this.photoDocument;
            }
        }, (err) => {});
    }

    makePhotoRut() {
        const options: CameraOptions = {
            quality: 35,
            destinationType: this.camera.DestinationType.DATA_URL,
            sourceType: this.camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: this.camera.EncodingType.JPEG,
            targetWidth: 450,
            targetHeight: 700,
            saveToPhotoAlbum: false
        };
        this.camera.getPicture(options).then((img) => {
            this.photoRut = 'data:image/jpeg;base64,' + img;
            this.shopkeeper.tiendas[0].imgRut = this.photoRut;
        }, (err) => {
            console.log("error");
        });
    }

    
    clearSignature() {
        this.signaturePad.clear();
        this.imgSignature = '';
    }

    saveSignature(){       
            this.imgSignature = this.signaturePad.toDataURL();
            //console.log(this.imgSignature);   
            this.shopkeeper.imgSignature = this.imgSignature;             
    }

    nextDocument() {
        this.pageTop.scrollToTop(400);
        this.nextSlide();
    }

    cancelCreate() {
        this.cancelCreateEvent.emit();
    }

    get cellphone() {
        return this.documentPhoneForm.get('cellphone');
    }

    get visitDay() {
        return this.namesForm.get('visitDay');
    }

    get contactEmail(): FormControl {
        return this.namesForm.get('contactEmail') as FormControl;
    }

    get contactName(): FormControl {
        return this.namesForm.get('contactName') as FormControl;
    }

    get shopName(): FormControl {
        return this.namesForm.get('shopName') as FormControl;
    }

    private initForms() {
        let visitDay = (new Date().getUTCDay() == 0) ? 7: new Date().getUTCDay();
        this.namesForm = this.formBuilder.group({
            shopName: [
                (this.shopkeeper && this.shopkeeper.tiendas && this.shopkeeper.tiendas.length > 0) ? this.shopkeeper.tiendas[0].nombre_tienda : '',
                Validators.required
            ],
            contactName: [(this.shopkeeper) ? this.shopkeeper.nombre_contacto : '', Validators.required],
            contactEmail: [(this.shopkeeper) ? this.shopkeeper.email : '', [Validators.required,  Validators.pattern(this.emailPattern)]],
            visitDay: [visitDay, Validators.required],
        });

        this.documentPhoneForm = this.formBuilder.group({
            cellphone: [(this.shopkeeper && this.shopkeeper.tiendas && this.shopkeeper.tiendas.length > 0) ? this.shopkeeper.tiendas[0].telefono_contacto : '', [
                Validators.required,
                Validators.pattern('^[0-9]*$'),
                PhoneNumberValidator('CO'),
                Validators.maxLength(10),
                Validators.minLength(10)
            ]],
            document: [{value: (this.shopkeeper) ? this.shopkeeper.cedula : '', disabled: true}, Validators.required]
        });
    }

    private capturaUbicacion() {
        this.modalController.create(<any>{
            component: CrearClienteCapturaUbicacionComponent,
            componentProps: {
                shopkeeper: this.shopkeeper,
                seller: this.seller
            }
        }).then((modal) => {
            modal.present();
        });
    }

    private async presentAlert(message: string) {
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: [
                {
                    text: 'Contáctanos',
                    handler: () => {
                        this.intercom.displayMessenger();
                    }
                },
                'Aceptar'
            ]
        });

        await alert.present();
    }

    changeSelected(type: { nombre: string, id: number, selected: boolean }) {
        this.shopkeeper.tipologias.map((typeMap: { nombre: string, id: number, selected: boolean }) => {
            if (typeMap.id !== type.id) {
                typeMap.selected = false;
                return typeMap;
            }

            return typeMap;
        });
    }

    get typeShopValue() {
        const res = this.shopkeeper.tipologias.filter((typeShop) => {
            return typeShop.selected === true;
        });
        return res;
    }

    nextDocumentByTypeShop(value) {
        this.shopkeeper.tiendas[0].tienda_tipologia_id = value;
        this.nextDocument();
    }

    onChangeDiaVisita(e) {
        this.visitDay.setValue(e.detail.value);
    }
}
