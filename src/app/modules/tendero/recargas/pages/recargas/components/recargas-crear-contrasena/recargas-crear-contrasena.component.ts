import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../store/currentAccount/currentAccount.reducer';
import {Subscription} from 'rxjs';
import {IUser} from '../../../../../../../interfaces/IUser';
import {LoadingOn} from '../../../../../../compartido/general/store/actions/loading.actions';
import {GetBalanceAction, SetCurrentAccountPasswordAction} from '../../../../store/currentAccount/currentAccount.actions';
import {filter} from 'rxjs/operators';
import {SetTopUpsSelectedAction} from '../../../../store/topUps/topUps.actions';
import {IProductService} from '../../../../../../../interfaces/IProductService';
import {CacheService} from 'ionic-cache';
import {NavigationHelper} from '../../../../../../../helpers/navigation/navigation.helper';

@Component({
    selector: 'app-recargas-crear-contrasena',
    templateUrl: './recargas-crear-contrasena.component.html',
    styleUrls: ['./recargas-crear-contrasena.component.scss'],
})
export class RecargasCrearContrasenaComponent implements OnInit, OnDestroy {
    private subsAuth = new Subscription();
    private subsCurrentAccount = new Subscription();
    @Input() packageselected: IProductService;
    @Input() user: IUser;
    @Input() packages: IProductService[];

    public passwordForm: FormGroup;

    constructor(
        private modalCtrl: ModalController,
        private store: Store<AppState>,
        private formBuilder: FormBuilder,
        private cache: CacheService) {
    }

    ngOnInit() {
        this.subsCurrentAccount = this.store.select('currentAccount')
            .pipe(filter(res => res.currentAccount != null))
            .subscribe(async (res) => {
                await this.cache.saveItem('pass_act', res.currentAccount.pass, 'pass_act', 1800);
                this.user.user_act = true;
                if (this.packageselected && this.packages) {
                    this.store.dispatch(new SetTopUpsSelectedAction(this.packages, this.packageselected));
                    this.cerrarModal();
                    return;
                }

                this.cerrarModal(true);
            });

        this.initForm();
    }

    ngOnDestroy(): void {
        this.subsAuth.unsubscribe();
        this.subsCurrentAccount.unsubscribe();
    }

    createPassword(value: { password: string, repeatPassword: string }): void {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new SetCurrentAccountPasswordAction(this.user.token, value.password, value.repeatPassword));
    }

    get controls() {
        return this.passwordForm.controls;
    }

    async cerrarModal(refreshUser?: boolean) {
        if (refreshUser) {
            this.modalCtrl.dismiss({
                user: true
            });
            return;
        }

        this.modalCtrl.dismiss();
    }

    private initForm() {
        this.passwordForm = this.formBuilder.group({
            password: ['', Validators.required],
            repeatPassword: ['', Validators.required]
        });
    }
}
