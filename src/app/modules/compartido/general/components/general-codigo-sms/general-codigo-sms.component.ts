import {Component, EventEmitter, Input, OnInit, Output, ViewChild, QueryList, ViewChildren, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {AppState} from '../../../../../store/app.reducer';
import {Store, ActionsSubject} from '@ngrx/store';
import {LoadingOff, LoadingOn} from '../../store/actions/loading.actions';
import {Fail} from '../../store/actions/error.actions';
import {filter} from 'rxjs/operators';
import {IonInput} from '@ionic/angular';
import {
    ValidateCodeSmsAction,
    ResponseValidateCodeSmsAction,
    RESPONSE_VALIDATE_CODE_SMS,
    VALIDATE_CODE_SMS,
    SendSmsAction
} from '../../../inicio/store/login.actions';
import {Intercom} from '@ionic-native/intercom/ngx';

@Component({
    selector: 'app-general-codigo-sms',
    templateUrl: './general-codigo-sms.component.html',
    styleUrls: ['./general-codigo-sms.component.scss'],
})
export class GeneralCodigoSmsComponent implements OnInit, OnDestroy {

    public formMsmNumber: FormGroup;
    public msmResend: boolean;
    public msmCode: string;

    private validateCodeSmsSubscribe = new Subscription();
    private resValidateCodeSmsSubscribe = new Subscription();

    @Output() acceptedCode = new EventEmitter();
    @Input() hideSend: boolean;
    @Input() cellphone: string;
    @Input() user?: string;
    @Input() password?: string;
    @Input() player_id?: string;
    @Input() withOutFocus?: boolean;

    @ViewChildren('codeElement') codeElement: QueryList<IonInput>;
    noSms: boolean = false;


    constructor(private formBuilder: FormBuilder,
                private store: Store<AppState>,
                private actionsObj: ActionsSubject,
                private intercom: Intercom) {
        this.msmResend = false;
        this.msmCode = '';
        this.initForms();
    }

    ngOnInit() {
        setTimeout(() => {
            this.noSms = true;
        }, 30000);
        this.changeFormValid();

        this.resValidateCodeSmsSubscribe = this.actionsObj
            .pipe(filter((res: ResponseValidateCodeSmsAction) => res.type === RESPONSE_VALIDATE_CODE_SMS))
            .subscribe((res) => {
                this.store.dispatch(new LoadingOff());
                const user = (res.data.content.user) ? res.data.content.user : null;
                this.acceptedCode.emit(user);
            }, (error) => {
                this.formMsmNumber.reset();
                this.store.dispatch(new LoadingOff());
            });

    }

    ngAfterViewInit() {
        if (!this.withOutFocus) {
            setTimeout(() => this.codeElement['_results'][0].setFocus(), 1000);
        }
    }

    showSendAgainButton() {
        if (!this.msmCode) {
            this.msmResend = true;
            return;
        }
    }

    resendMsm() {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new SendSmsAction(this.cellphone));
    }
    resendWapp() {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new SendSmsAction(this.cellphone,'1'));
    }

    openChat() {
        this.intercom.displayMessenger();
    }

    get msmNumber() {
        return this.formMsmNumber.get('msmNumberFourth');
    }


    private initForms() {
        this.formMsmNumber = this.formBuilder.group({
            msmNumberFirst: ['', [Validators.required]],
            msmNumberSecond: ['', [Validators.required]],
            msmNumberThird: ['', [Validators.required]],
            msmNumberFourth: ['', [Validators.required]],
        });
    }

    public changeNumberCode(e, i) {
        const value = e.target.value;
        if (value && value !== '' && i < this.codeElement['_results'].length && this.codeElement['_results'][i].value === '') {
            this.codeElement['_results'][i].setFocus();
        }
    }

    private verifySms() {
        return new Observable(observer => {
            setTimeout(() => {
                observer.next('Termino');
                // observer.error({message: 'El codigo no coincide con el enviado'});
            }, 1000);
        });
    }

    private changeFormValid() {
        this.validateCodeSmsSubscribe = this.formMsmNumber.valueChanges
            .pipe(filter(res => this.formMsmNumber.valid))
            .subscribe(res => {
                let code = '';
                Object.keys(res).forEach(function (key) {
                    code += res[key];
                });
                this.store.dispatch(new LoadingOn());
                this.store.dispatch(new ValidateCodeSmsAction(this.cellphone, code, this.user, this.password, this.player_id));
            });
    }

    ngOnDestroy(): void {
        this.validateCodeSmsSubscribe.unsubscribe();
        this.resValidateCodeSmsSubscribe.unsubscribe();
    }
}
