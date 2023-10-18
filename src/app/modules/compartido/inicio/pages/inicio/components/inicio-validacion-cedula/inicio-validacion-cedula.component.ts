import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {NavigationHelper} from '../../../../../../../helpers/navigation/navigation.helper';
import {ModalController, AlertController} from '@ionic/angular';
import {AuthService} from '../../../../../../../services/auth/auth.service';
import {AppState} from '../../../../../../../store/app.reducer';
import {LoginUserAction, AfterLoginUserAction} from '../../../../../../../store/auth/auth.actions';
import {Store, ActionsSubject} from '@ngrx/store';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ILogin} from '../../../../../../../interfaces/ILogin';
import {Storage} from '@ionic/storage';
import {LoadingOn, LoadingOff} from '../../../../../general/store/actions/loading.actions';
import {Shopkeeper} from '../../../../../../../models/Shopkeeper';
import {
    LoginByDocumentAction,
    RESPONSE_LOGIN_BY_DOCUMENT,
    ResponseLoginByDocumentAction,
    SendSmsAction,
    ResponseSendSmsAction,
    RESPONSE_SEND_SMS,
    UpdateCellphoneAction,
    ResponseUpdateCellphoneAction,
    RESPONSE_UPDATE_CELLPHONE,
    ValidateCodeSmsAction
} from '../../../../store/login.actions';
import {filter} from 'rxjs/operators';
import {Roles} from 'src/app/enums/roles.enum';
import {UserBuilder} from 'src/app/builders/user.builder';
import {Seller} from 'src/app/models/Seller';
import {IUser} from 'src/app/interfaces/IUser';
import {Intercom} from '@ionic-native/intercom/ngx';
import {NoticationService} from '../../../../../../../services/pushNotification/notication.service';
import {PhoneNumberValidator} from '../../../../../../../validators/PhoneNumberValidator';
import {OneSignalService} from '../../../../../../../services/oneSignal/one-signal.service';
import {Fail} from '../../../../../general/store/actions/error.actions';

export enum LoginErrors {
    dateGreaterRelease = 0, // Fecha actual > Fecha lanzamiento
    notSendSms = 1, // No se envío SMS
    isstoreapp = 2, // Es storeapp y debe validar celular
    notIsstoreapp = 3, // No es storeapp, debe ingresar celular y validar
    seller = 4, // Es vendedor
    sellerUpdateData = 5, // Es vendedor pero no ha actualizado datos
    userTest = 6
}

export enum LoginSections {
    document = 0,
    codeSms = 1,
    validCel = 2,
    updateCel = 3,
    registry = 4,
    loginDevelopers = 5,
    refreshLogin = 6
}

@Component({
    selector: 'app-inicio-validacion-cedula',
    templateUrl: './inicio-validacion-cedula.component.html',
    styleUrls: ['./inicio-validacion-cedula.component.scss'],
})


export class InicioValidacionCedulaComponent implements OnInit, OnDestroy {

    public registro: boolean;
    public contrasena: boolean;
    public tempSections: LoginSections[] = [LoginSections.document];
    public currentSection: LoginSections = LoginSections.document;
    public loginSections: any = LoginSections;

    public celular = '';
    public formDocument: FormGroup;
    public formCellphone: FormGroup;
    public formCellphoneCountry: FormGroup;
    private loginSubscribe = new Subscription();
    private sendSmsSubscribe = new Subscription();
    private updateCellphoneSubscribe = new Subscription();
    public codeErrorLogin: number = -1;
    public isMyCel: boolean = false;
    public userTemp: IUser;
    public player_id: any;
    public accessUser: { user: string; password: string; } = {
        user: '',
        password: ''
    };
    cellphoneSms: any;
    resDataLogin: any;

    constructor(
        private navigation: NavigationHelper,
        private modal: ModalController,
        private auth: AuthService,
        private store: Store<AppState>,
        private formBuilder: FormBuilder,
        private storage: Storage,
        private actionsObj: ActionsSubject,
        public alertController: AlertController,
        private intercom: Intercom,
        private notification: NoticationService,
        private oneSignal: OneSignalService
    ) {
        this.registro = false;
        this.contrasena = false;
        this.initForms();
    }

    ngOnInit() {
        this.loginSubscribe = this.actionsObj
            .pipe(filter((res: ResponseLoginByDocumentAction) => res.type === RESPONSE_LOGIN_BY_DOCUMENT))
            .subscribe((res) => {
                this.codeErrorLogin = res.data.code;

                if (this.codeErrorLogin === LoginErrors.userTest) {
                    this.onClickLoginDevelopers();
                    this.store.dispatch(new LoadingOff());
                    return;
                }

                this.accessUser = {
                    user: '',
                    password: ''
                };

                this.userTemp = null;
                if (res.data.content.cliente || res.data.content.vendedor || res.data.content.transportador) {
                    console.log(res.data.content.transportador)
                    const userBuild = new UserBuilder(
                        res.data.content.cliente || res.data.content.vendedor || res.data.content.transportador
                    );
                    this.userTemp = userBuild.getUser();
                    console.log(this.userTemp);
                    this.cellphoneSms = this.userTemp.telefono_contacto;
                    if (this.userTemp.role === Roles.seller) {
                        this.accessUser = {
                            user: this.userTemp.cedula,
                            password: this.userTemp.cedula
                        };
                    } else if (this.userTemp.role === Roles.shopkeeper) {
                        this.accessUser = {
                            user: this.userTemp.telefono_contacto,
                            password: this.userTemp.cedula
                        };
                    } else if (this.userTemp.role === Roles.transportador) {
                        this.accessUser = {
                            user: this.userTemp.telefono_contacto,
                            password: this.userTemp.cedula
                        };
                    }
                }
                this.resDataLogin = res.data.content;
                this.successLogin(res);
                this.store.dispatch(new LoadingOff());
            }, (error) => {
                this.store.dispatch(new LoadingOff());
            });

        this.sendSmsSubscribe = this.actionsObj.pipe(filter((res: ResponseSendSmsAction) => res.type === RESPONSE_SEND_SMS))
            .subscribe((res) => {
                this.selectSection(LoginSections.codeSms);
                this.store.dispatch(new LoadingOff());
            }, (error) => {
                this.store.dispatch(new LoadingOff());
            });

        this.updateCellphoneSubscribe = this.actionsObj
            .pipe(filter((res: ResponseUpdateCellphoneAction) => res.type === RESPONSE_UPDATE_CELLPHONE))
            .subscribe((res) => {
                this.store.dispatch(new LoadingOff());
                switch (res.data.code) {
                    case 6: // Cel está en uso
                        this.presentAlert('El número celular ya se encuentra en uso.');
                        this.selectSection(LoginSections.refreshLogin);
                        break;

                    case 7: // Cel no está en uso
                        if (this.userTemp) {
                            if (this.userTemp.role === Roles.seller) {
                                this.accessUser.user = this.userTemp.cedula;
                            } else if (this.userTemp.role === Roles.shopkeeper) {
                                this.accessUser.user = this.formCellphoneCountry.get('cellphone').value;
                            }
                        }

                        this.cellphoneSms = this.formCellphoneCountry.get('cellphone').value;
                        this.selectSection(LoginSections.codeSms);
                        break;

                    case 8: // No puede actualizar el número celular
                        this.presentAlert('No puede actualizar el celular, por favor comuníquese con soporte.');
                        break;
                }
            }, (error) => {
                this.store.dispatch(new LoadingOff());
            });

    }

    selectSection(section: LoginSections) {
        const indexSection = this.tempSections.findIndex((e) => e == section);
        if (indexSection === -1) {
            this.tempSections.push(section);
        }
        this.currentSection = section;
    }

    onClickBack() {
        this.tempSections.pop();
        this.currentSection = this.tempSections[this.tempSections.length - 1];
    }

    async login(login: ILogin) {
        this.storage.remove('auth-user-update');
        this.store.dispatch(new LoadingOn());

        this.player_id = await this.oneSignal.getId();
        if (this.player_id !== false) {
            this.store.dispatch(new LoginByDocumentAction(login.login, this.player_id));
            return;
        }
        this.store.dispatch(new LoginByDocumentAction(login.login));
    }

    async send_code_via_wapp(login: ILogin){
        this.storage.remove('auth-user-update');
        this.store.dispatch(new LoadingOn());

        this.player_id = await this.oneSignal.getId();
        if (this.player_id !== false) {
            this.store.dispatch(new LoginByDocumentAction(login.login, this.player_id, '1'));
            return;
        }
        this.store.dispatch(new LoginByDocumentAction(login.login, false, '1'));
    }

    onClickLoginDevelopers() {
        this.selectSection(LoginSections.loginDevelopers);
    }

    loginDevelopers(login: ILogin) {
        if (this.player_id) {
            login.player_id = this.player_id;
        }
        login.prueba = true;
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new LoginUserAction(login));
    }

    successLogin(res) {
        switch (this.codeErrorLogin) {
            case LoginErrors.dateGreaterRelease:
                this.selectSection(LoginSections.codeSms);
                break;

            case LoginErrors.notSendSms:
                this.presentAlert('El SMS no se envío correctamente, por favor comunícate con soporte.');
                this.selectSection(LoginSections.document);
                break;

            case LoginErrors.isstoreapp:
                this.selectSection(LoginSections.validCel);
                break;

            case LoginErrors.notIsstoreapp:
                this.storage.set('tipologias', res.data.content.tipologias)
                    .then(() => {
                        this.selectSection(LoginSections.updateCel);
                    });
                break;

            case LoginErrors.seller:
                this.selectSection(LoginSections.codeSms);
                // this.presentAlert(res.data.content.codigo);
                break;

            case LoginErrors.sellerUpdateData:
                this.accessUser.user = this.userTemp.cedula;
                this.selectSection(LoginSections.updateCel);
                break;

            default:
                this.presentAlert('No puedes ingresar, por favor comunícate con soporte.');
                this.selectSection(LoginSections.document);
                break;
        }
    }

    selectIsCel() {
        this.isMyCel = true;
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new SendSmsAction(this.userTemp.telefono_contacto));
    }

    selectNotIsCel() {
        this.isMyCel = false;
        if (this.userTemp.permite_modificar_celular) {
            this.selectSection(LoginSections.updateCel);
        } else {
            this.presentAlert('No puedes ingresar, por favor comunícate con soporte para actualizar tus datos.');
            this.selectSection(LoginSections.refreshLogin);
        }
    }

    updateCel() {
        if (!this.formCellphoneCountry.get('cellphone').value) {
            this.store.dispatch(new Fail({mensaje: 'Debes completar la información'}));
            return;
        }
        this.store.dispatch(new LoadingOn());
        let document =  null;
        if (this.userTemp) {
            document = (this.userTemp.cedula) ? this.userTemp.cedula : null;
        }
        this.store.dispatch(new UpdateCellphoneAction(this.formCellphoneCountry.get('cellphone').value, document));
    }

    sucessCodeSms(user?: IUser) {
        if (user) {
            const userBuild = new UserBuilder(user);
            this.userTemp = userBuild.getUser();
        }
        switch (this.codeErrorLogin) {
            case LoginErrors.dateGreaterRelease:
                console.log(this.resDataLogin, 'auii this.resDataLogin');
                if (!this.resDataLogin.actualizacion) {
                    // redirigir a Actualización
                    this.updateUser();
                } else {
                    // redirigir al home
                    this.store.dispatch(new AfterLoginUserAction(this.userTemp));
                }
                break;

            case LoginErrors.isstoreapp:
                if (!this.resDataLogin.actualizacion) {
                    // redirigir a Actualización
                    this.updateUser();
                } else {
                    // redirigir al home
                    this.store.dispatch(new AfterLoginUserAction(this.userTemp));
                }
                break;

            case LoginErrors.notIsstoreapp:
                // redirigir al registro
                this.capturarDatos(this.formDocument.get('document').value, this.formCellphoneCountry.get('cellphone').value);
                break;

            case LoginErrors.seller:
                // redirigir al home
                this.store.dispatch(new AfterLoginUserAction(this.userTemp));
                break;
            
            case LoginErrors.sellerUpdateData:
                // redirigir al home
                this.store.dispatch(new AfterLoginUserAction(this.userTemp));
                break;

            default:
                // redirigir al registro
                this.capturarDatos(this.formDocument.get('document').value);
                break;
        }
    }

    updateUser() {
        if (this.resDataLogin && this.resDataLogin.cliente && this.resDataLogin.cliente.telefono_contacto) {
            this.resDataLogin.cliente.telefono_contacto = this.cellphoneSms;
        }
        this.storage.set('auth-user-update', JSON.stringify(this.resDataLogin.cliente)).then(() => {
            this.capturarDatos(this.formDocument.get('document').value, this.cellphoneSms);
        });
    }

    capturarDatos(cedula, telefono?: string) {
        const shopkeeper = new Shopkeeper({cedula: cedula});
        if (telefono) {
            shopkeeper.telefono_contacto = telefono;
        }
        this.storage.set('auth-register', JSON.stringify(shopkeeper)).then(() => {
            this.navigation.goTo('registro');
            this.modal.dismiss();
        });
    }

    ngOnDestroy(): void {
        this.updateCellphoneSubscribe.unsubscribe();
        this.sendSmsSubscribe.unsubscribe();
        this.loginSubscribe.unsubscribe();
    }

    async presentAlert(message: string) {
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

    private initForms() {
        this.formDocument = this.formBuilder.group({
            document: ['', [
                Validators.required,
                Validators.pattern('^[0-9]*$'),
            ]]
        });

        this.formCellphone = this.formBuilder.group({
            cellphone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
        });

        this.formCellphoneCountry = this.formBuilder.group({
            cellphone: ['', [
                Validators.required,
                Validators.pattern('^[0-9]*$'),
                PhoneNumberValidator('CO'),
                Validators.maxLength(10),
                Validators.minLength(10)
            ]]
        });
    }


    // Getters form
    get document() {
        return this.formDocument.get('document');
    }

    get cellphone() {
        return this.formCellphone.get('cellphone');
    }

    get cellphoneCountry() {
        return this.formCellphoneCountry.get('cellphone');
    }
}
