import { GetDepartamentsAction, SetDepartamentsAction, SET_DEPARTAMENTS, SetCitiesAction, SET_CITIES, GetCitiesAction } from './../../../../../../tendero/registro/store/registro.actions';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ISurveys} from 'src/app/interfaces/ISurveys';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {CreateSurveyAction} from '../../../store/comunidad-tenderos.actions';
import {IUser} from 'src/app/interfaces/IUser';
import {LoadingOff, LoadingOn} from 'src/app/modules/compartido/general/store/actions/loading.actions';
import {Shop} from 'src/app/models/Shop';
import {Storage} from '@ionic/storage';
import {Roles} from 'src/app/enums/roles.enum';
import {AnalyticsService} from '../../../../../../../services/analytics/analytics.service';
import {Seller} from '../../../../../../../models/Seller';
import { SuperSellerService } from 'src/app/services/users/super-seller.service';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {ApiService} from '../../../../../../../services/api/api.service';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {Device} from '@ionic-native/device/ngx';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {OpenNativeSettings} from '@ionic-native/open-native-settings/ngx';
import {AlertController} from '@ionic/angular';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {BarcodeScanner, BarcodeScanResult} from '@ionic-native/barcode-scanner/ngx';
import { UserSurveysService } from 'src/app/services/users/user-surveys.service';

export enum TypeSurveys {
    openAnswer = 'res_abierta',
    multipleAnswer = 'res_multiple',
    uniqueAnswer = 'res_unica',
    imageAnswer = 'res_imagen',
    geoAnswer = 'res_geolocalizacion',
    cities = 'res_ciudades',
    firm = 'res_firma',
    codeQR = 'res_qr',
    textSmall = 'res_texto_corto',
    numeric = 'res_numerica'
}

@Component({
    selector: 'app-comunidad-tenderos-post-encuesta',
    templateUrl: './comunidad-tenderos-post-encuesta.component.html',
    styleUrls: ['./comunidad-tenderos-post-encuesta.component.scss'],
})


export class ComunidadTenderosPostEncuestaComponent implements OnInit {

    @Input() survey: ISurveys;
    @Input() user: IUser;
    @Input() cedula: string;
    @Input() shop_id?: number;
    @Input() notResponseValidation?: boolean;
    @Input() showResponse?: boolean;
    @Input() response?: boolean;
    @Input() compressAll?: boolean;
    @Input() position?: number;
    @Input() responseRepeatIn?: boolean;
    @Input() fanny?: boolean = false;
    @Output() setSurveysStorageExt = new EventEmitter();

    public shop: Shop;
    public relationship: any;
    public formData: FormGroup;
    public typeSurveys: typeof TypeSurveys;
    public respuesta_abierta: string;
    public respuesta_texto_corto: string;
    public respuesta_numerica: number; 
    public responseRepeatStatus: boolean = false;

    public photoCamera: any;
    public isImage: boolean;
    public lat: any;
    public long: any;

    private departamentsSubs = new Subscription();
    private citiesSubs = new Subscription();


    @ViewChild(SignaturePad) public signaturePad: SignaturePad;

    public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor       
        'maxWidth': 3,
        'dotSize': 3,  
        'canvasWidth': 360,//320,
        'canvasHeight': 450,//200,
        'backgroundColor': "rgb(255,255,255)"
      };
    public imgSignature: string;
    departaments: Array<any> = [];
    cities: Array<any> = [];
    public offlineDynamic: boolean;
    private offlineSubs = new Subscription();
    
    //public respuestas: Array<number> = [];

    constructor(
        private store: Store<AppState>,
        private formBuilder: FormBuilder,
        private storage: Storage,
        private analyticsService: AnalyticsService,
        private superSellerService: SuperSellerService,
        private camera: Camera,
        private api: ApiService,
        private geolocation: Geolocation,
        private device: Device,
        private diagnostic: Diagnostic,
        private nativeSettings: OpenNativeSettings,
        public shopSingletonService: ShopSingletonService,
        private alertController: AlertController,
        private actionsSubj: ActionsSubject,
        private barcodeScanner: BarcodeScanner,
        public userSurveysService: UserSurveysService,
    ) {
        this.isImage = false;
    }

    ngOnInit() {
        if (this.responseRepeatIn) {
            this.responseRepeat();
        }
        this.typeSurveys = TypeSurveys;
        let items = [];
        this.survey.preguntas.forEach(ask => {
            items.push(this.createItem(ask));
            ask.isImage = ((ask.tipo_encuesta.slug == TypeSurveys.imageAnswer));
        });
        this.formData = this.formBuilder.group({
            tienda_id: ["", []],
            cedula: [(this.cedula) ? this.cedula : '', []],
            encuesta_id: [this.survey.id, [Validators.required]],
            respuestas: this.formBuilder.array(items)
        });
        if (this.user && this.user.role == Roles.shopkeeper) {
            this.getShop();
            this.tienda_id.setValue(this.shop_id);
        }
        this.survey.opened = !((this.notResponseValidation && (this.position > 0)) || this.compressAll || this.fanny);

        if (this.shop_id) this.tienda_id.setValue(this.shop_id);

        if (this.superSellerService.idSuperSeller) {
            this.formData.addControl('super_vendedor_id', new FormControl(this.superSellerService.idSuperSeller, []));
        }

        this.departamentsSubs = this.actionsSubj
            .pipe(filter(res => res.type === SET_DEPARTAMENTS))
            .subscribe((res: SetDepartamentsAction) => {
                this.departaments = res.departaments;
            });
        this.citiesSubs = this.actionsSubj
            .pipe(filter(res => res.type === SET_CITIES))
            .subscribe((res: SetCitiesAction) => {
                this.cities = res.cities;
            });
    }

    getShop() {
        this.shop = this.shopSingletonService.getSelectedShop();
        this.tienda_id.setValue(this.shop.id);
    }

    createItem(ask): FormGroup {
        let textRequired = [];
        let answerRequired = [];
        let answer: any = '';
        let answerTextSmall: any = '';
        let answerNumeric : any = 0;
        let answerUnique: any = [];
        let imageRequired: any = [];
        let geoRequired: any = [];
        let firmRequired: any = [];
        let citiesRequired: any = [];
        let codeQRRequired: any = [];
        let textSmallRequired: any = [];
        let numericRequired: any = 0;
        
        let image = '';
        let ultimaRespuesta = (ask.respuestas_usuarios && ask.respuestas_usuarios.length > 0) ? ask.respuestas_usuarios[ask.respuestas_usuarios.length - 1] : null;
        if (ask.tipo_encuesta.slug == TypeSurveys.openAnswer) {
            textRequired = [Validators.required];
            if (this.response && ultimaRespuesta) {
                answer = ultimaRespuesta.respuesta_abierta;
                this.respuesta_abierta = answer;
            }
        }

        if (ask.tipo_encuesta.slug == TypeSurveys.textSmall) {
            textSmallRequired = [Validators.required];
            if (this.response && ultimaRespuesta) {
                answerTextSmall = ultimaRespuesta.respuesta_texto_corto;
                this.respuesta_texto_corto = answerTextSmall;
            }
        }
        if (ask.tipo_encuesta.slug == TypeSurveys.uniqueAnswer) {
            answerRequired = [Validators.required];

            if (this.response && ultimaRespuesta) {
                answerUnique = ultimaRespuesta.respuesta_id;
            }
        }

        if (ask.tipo_encuesta.slug == TypeSurveys.multipleAnswer) {
            answerRequired = [Validators.required];
        }

        if (ask.tipo_encuesta.slug == TypeSurveys.imageAnswer) {
            imageRequired = [Validators.required];

            if (this.response && ultimaRespuesta) {
                image = this.api.url + 'imagenes/encuestas/' + ultimaRespuesta.respuesta_imagen;
                //ask.photoCamera = image;
                ask.photoCamera = null;
            }
        }


        if (ask.tipo_encuesta.slug == TypeSurveys.firm) {
            firmRequired = [Validators.required];
        }

        if (ask.tipo_encuesta.slug == TypeSurveys.codeQR) {
            codeQRRequired = [Validators.required];
        }

        if (ask.tipo_encuesta.slug == TypeSurveys.cities) {
            citiesRequired = [Validators.required];
            this.userSurveysService.getDepartamentsStorageList().then((depto) => {
                this.departaments = depto;
                if (!this.departaments || this.departaments.length == 0) {
                    this.store.dispatch(new GetDepartamentsAction(this.user.token));
                }
            });
        }

        if (ask.tipo_encuesta.slug == TypeSurveys.geoAnswer) {
            geoRequired = [Validators.required];
        }
        if (ask.tipo_encuesta.slug == TypeSurveys.numeric) {
            numericRequired = [Validators.required];
            if (this.response && ultimaRespuesta) {
                answerNumeric = ultimaRespuesta.respuesta_numerica;
                this.respuesta_numerica = answerNumeric;
            }
        }
        return this.formBuilder.group({
            pregunta_id: [ask.id, [Validators.required]],
            tipo_encuesta: [ask.tipo_encuesta.slug, [Validators.required]],
            respuesta_abierta: ['', textRequired],
            respuesta: [[], answerRequired],
            res_imagen: ['', imageRequired],
            latitud: ['', geoRequired],
            longitud: ['', geoRequired],
            res_firma: ['', firmRequired],
            res_ciudades: ['', citiesRequired],
            res_qr: ['', codeQRRequired],
            res_texto_corto: ['', textSmallRequired],
            res_numerica: ['', numericRequired]
        });

        /* return this.formBuilder.group({
            respuesta_abierta: [answer, textRequired],
            pregunta_id: [ask.id, [Validators.required]],
            tipo_encuesta: [ask.tipo_encuesta.slug, [Validators.required]],
            respuesta: [answerUnique, answerRequired],
            res_imagen: [image, imageRequired],
            latitud: ['', geoRequired],
            longitud: ['', geoRequired],
        }); */
    }

    sendResoponse() {
        this.formData.markAsTouched();
        if (this.formData.valid) {
            let data = this.formData.value;
            this.shop = this.shopSingletonService.getSelectedShop();
            if (this.photoCamera && data.respuestas[0]) {
                data.respuestas[0]['res_imagen'] = this.photoCamera;
            }
            this.offlineSubs = this.store.select('offline').subscribe(success => {
                this.offlineDynamic = success.active;
                if (this.offlineDynamic) {
                    this.presentAlert("No es posible enviar las respuestas en este momento, van a quedar almacenadas y podrás enviarlas cuando cuentes con mejor señal, desde la opción PENDIENTES");
                    let dataSend: any = {
                        survey_id: this.survey.id,
                        data: data,
                    }
                    this.userSurveysService.setSurveysStorage(dataSend);
                    
                    this.respuestas.value.forEach((element, index)=> {
                        for (var key in element) {
                            if (!["pregunta_id", "tipo_encuesta"].includes(key)) {
                                const reset = this.respuestas.controls[index].get(key);
                                reset.setValue("");
                            }
                        }
                    });
                    
                    this.survey.opened = false;
                    this.notResponseValidation = true;
                    this.responseRepeatStatus = false;
                    this.setSurveysStorageExt.emit(dataSend);

                } else {
                    this.store.dispatch(new LoadingOn());
                    this.store.dispatch(new CreateSurveyAction(this.user.token, this.survey.id, data));
                }
    
            });
            
            if (this.notResponseValidation) {

                let $event = 'responde_encuesta';
                let $eventCategory = 'responde_encuesta_' + this.survey.id;
                let $eventLabel = 'responde_encuesta_' + this.user.role;

                if (this.shop_id && this.user.role === Roles.seller) {
                    const user = this.user as Seller;

                    $event = 'responde_encuesta_de_cliente';
                    $eventCategory = 'responde_encuesta_de_cliente_' + this.survey.id;
                    $eventLabel = 'responde_encuesta_de_cliente_' + user.distribuidor.id;
                }

                this.analyticsService.sendEvent($event, {'event_category': $eventCategory, 'event_label': $eventLabel});
            }
        }
    }

    responseRepeat() {
        this.survey.opened = true;
        this.notResponseValidation = false;
        //this.response = false;
        this.responseRepeatStatus = true;
    }

    changeAnswerMultiple(event, indexAsk, idAnswer) {
        let answer = this.respuestas.controls[indexAsk].get('respuesta');
        let answerValue = answer.value;
        if (event.detail.checked) {
            answerValue.push(idAnswer);
        } else {
            let indexAnswer = answerValue.findIndex((i) => i === idAnswer);
            answerValue.splice(indexAnswer, 1);
        }
        answer.setValue(answerValue);
    }

    get tienda_id() {
        return this.formData.get('tienda_id');
    }

    get respuestas() {
        return this.formData.get('respuestas') as FormArray;
    }

    checked(ask, answer_id) {
        const respuestas = ask.respuestas_usuarios.filter((respuesta) => {
            return respuesta.respuesta_id == answer_id;
        });

        return (respuestas.length > 0);
    }

    openOrCloseCard() {
        this.survey.opened = !this.survey.opened;

        let $eventCategory = (this.survey.opened) ? 'ver_encuesta_' + this.survey.id :  'oculta_encuesta_' + this.survey.id;
        let $eventLabel = (this.survey.opened) ? 'ver_encuesta_' + this.user.role : 'oculta_encuesta_' + this.user.role;
        let $event = (this.survey.opened) ? 'ver_encuesta' : 'oculta_encuesta';

        if (this.shop_id && this.user.role === Roles.seller) {
            const user = this.user as Seller;

            $eventCategory = (this.survey.opened) ?
                'ver_encuesta_de_cliente_' + this.survey.id :  'oculta_encuesta_de_cliente_' + this.survey.id;

            $eventLabel = (this.survey.opened)
                ? 'ver_encuesta_de_cliente_' + user.distribuidor.id : 'oculta_encuesta_de_cliente_' + user.distribuidor.id;

            $event = (this.survey.opened) ? 'ver_encuesta_de_cliente' : 'oculta_encuesta_de_cliente';
        }

        this.analyticsService.sendEvent($event, { 'event_category': $eventCategory, 'event_label': $eventLabel });
        if (this.fanny && this.survey.opened) {
            this.responseRepeat()
        }
    }
    
    makePhoto(ask, indexAsk) {
        const options: CameraOptions = {
            quality: 50,
            destinationType: this.camera.DestinationType.DATA_URL,
            sourceType: this.camera.PictureSourceType.CAMERA,
            encodingType: this.camera.EncodingType.JPEG,
            targetWidth: 450,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };
        this.camera.getPicture(options).then((img) => {
            ask.photoCamera = 'data:image/jpeg;base64,' + img;
            const answer = this.respuestas.controls[indexAsk].get('res_imagen');
            answer.setValue(ask.photoCamera);
        }, (err) => {});
    }

    sendGeo(ask) {
        this.getGeo()
            .then(res => {
                if (res.length <= 0) {
                    this.store.dispatch(new LoadingOff());
                    return;
                }

                const data = {
                    respuestas: [{
                        latitud: res[0],
                        longitud: res[1],
                        pregunta_id: ask.id,
                        tipo_encuesta: this.typeSurveys.geoAnswer
                    }],
                    encuesta_id: this.survey.id,
                    tienda_id: this.tienda_id.value
                };
                this.store.dispatch(new CreateSurveyAction(this.user.token, this.survey.id, data));
                this.store.dispatch(new LoadingOff());
            });
    }

    getDataGeo(indexAsk) {
        this.getGeo()
            .then(res => {
                if (res.length <= 0) {
                    return;
                }

                this.lat = res[0];
                this.long = res[1];

                const latitud = this.respuestas.controls[indexAsk].get('latitud');
                latitud.setValue(res[0]);

                const longitud = this.respuestas.controls[indexAsk].get('longitud');
                longitud.setValue(res[1]);

                this.store.dispatch(new LoadingOff());
            });
    }

    onChangeDepartaments(departament_id) {
        this.userSurveysService.getCitiesStorageList(departament_id).then((depto) => {
            this.cities = depto;
            if (!this.cities || this.cities.length == 0) {
                this.store.dispatch(new GetCitiesAction(this.user.token, departament_id));
            }
        });
    }

    onChangeCity(indexAsk, city) {
        const answer = this.respuestas.controls[indexAsk].get(TypeSurveys.cities);
        let departament = this.departaments.find(d => city.departamento_id == d.id);
        city.departamento = departament;
        answer.setValue(city);
    }

    readQR(indexAsk) {
        this.barcodeScanner.scan()
            .then((barcodeData: BarcodeScanResult) => {
                if (!barcodeData.text) {
                    return;
                }
                const answer = this.respuestas.controls[indexAsk].get(TypeSurveys.codeQR);
                answer.setValue(barcodeData.text);
                
            })
            .catch((e: any) => {
                console.log(e);
                this.presentError('Debes permitir el uso de la camara', () => {
                    this.nativeSettings.open('settings');
                });
            });
    }

    getQR(indexAsk) {
        return this.respuestas.controls[indexAsk].get(TypeSurveys.codeQR).value;
    }

    clearSignature() {
        this.signaturePad.clear();
    }

    saveSignature(indexAsk){       
        let imgSignature = this.signaturePad.toDataURL();
        const answer = this.respuestas.controls[indexAsk].get(TypeSurveys.firm);
        answer.setValue(imgSignature);
    }

    ngOnDestroy() {
        this.offlineSubs.unsubscribe();
        this.departamentsSubs.unsubscribe();
        this.citiesSubs.unsubscribe();
    }

    private getGeo() {
        this.store.dispatch(new LoadingOn(true));
        const opt = {maximumAge: 30000, enableHighAccuracy: true, timeout: 15000};

        return this.geolocation.getCurrentPosition(opt).then((resp) => {
            return [resp.coords.latitude, resp.coords.longitude];
        }).catch(async (error) => {
            this.analyticsService.sendEvent('click', {'event_category': 'registro_mapa', 'event_label': 'error_codigo_' + error.code});
            this.store.dispatch(new LoadingOff());

            let statusError = false;
            if (this.device.platform === 'Android' || this.device.platform === 'IOs') {
                await this.diagnostic.isLocationEnabled().then((res) => {
                    if (res === false) {
                        this.presentError('Tienes que activar la ubicación de tu celular. Err. ' + error.code, () => {
                            this.nativeSettings.open('location');
                        });
                        statusError = true;
                    }
                }).catch((e) => {
                    this.presentError(
                        'Error obteniendo la ubicación, verifica que tengas activa la ubicación de tu celular. Err. ' + error.code,
                        () => {
                            statusError = true;
                            this.nativeSettings.open('location');
                        }
                    );
                });
            }
            if (!statusError) {
                const message = (error.code === 3) ?
                    'Error obteniendo la ubicación, verifica que tengas activa la ubicación de tu celular. Err.' :
                    'Tienes que permitir la ubicación a storeapp. Err. ';

                this.presentError(message + error.code, () => {
                    this.nativeSettings.open('location');
                });
            }
            return [];
        });
    }

    private async presentError(err, handle) {
        const alert = await this.alertController.create({
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

    async presentAlert(message:string) {
        const alert = await this.alertController.create({
          header: 'Información',
          subHeader: '',
          message: message,
          buttons: ['Aceptar']
        });
    
        await alert.present();
    }

}
