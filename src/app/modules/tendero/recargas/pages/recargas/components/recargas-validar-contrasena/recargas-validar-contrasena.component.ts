import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {AppState} from '../../../../store/currentAccount/currentAccount.reducer';
import {Store} from '@ngrx/store';
import {GetCurrentAccountAction} from '../../../../store/currentAccount/currentAccount.actions';
import {IUser} from '../../../../../../../interfaces/IUser';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingOn} from '../../../../../../compartido/general/store/actions/loading.actions';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ICurrentAccount} from '../../../../../../../interfaces/ICurrentAccount';
import {NavigationHelper} from '../../../../../../../helpers/navigation/navigation.helper';
import {SetTopUpsSelectedAction} from '../../../../store/topUps/topUps.actions';
import {IProductService} from '../../../../../../../interfaces/IProductService';

@Component({
    selector: 'app-recargas-validar-contrasena',
    templateUrl: './recargas-validar-contrasena.component.html',
    styleUrls: ['./recargas-validar-contrasena.component.scss'],
})
export class RecargasValidarContrasenaComponent implements OnInit, OnDestroy {
    @Input() user: IUser;
    @Input() packages: IProductService[];
    @Input() packageselected: IProductService;
    private currentAccount: ICurrentAccount;
    private subsAuth = new Subscription();
    private subsCurrentAccount = new Subscription();
    public passwordForm: FormGroup;

    constructor(
        private modalCtrl: ModalController,
        private store: Store<AppState>,
        private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.subsCurrentAccount = this.store.select('currentAccount')
            .pipe(filter(res => res.currentAccount !== null))
            .subscribe((account) => {
                this.currentAccount = account.currentAccount;
                this.store.dispatch(new SetTopUpsSelectedAction(this.packages, this.packageselected));
                this.cerrarModal();
            });

        this.initForm();
    }

    ingresar(value: {password: string}) {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetCurrentAccountAction(this.user.token, value.password));
    }

    async cerrarModal() {
        // Dismiss the top modal returning some data object
        this.modalCtrl.dismiss();
    }

    private initForm() {
        this.passwordForm = this.formBuilder.group({
            password: ['', Validators.required]
        });
    }

    ngOnDestroy(): void {
        this.subsAuth.unsubscribe();
        this.subsCurrentAccount.unsubscribe();
    }
}
