import {Component, OnDestroy, OnInit} from '@angular/core';
import {IUser} from '../../../../../interfaces/IUser';
import {ActivatedRoute} from '@angular/router';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {AFTER_UPDATE_USER, UpdateUserAction} from '../../store/edit.actions';
import {ILogin} from '../../../../../interfaces/ILogin';
import {LoginUserAction} from '../../../../../store/auth/auth.actions';
import {CacheService} from 'ionic-cache';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Storage} from '@ionic/storage';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {AlertController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'app-editar-perfil',
    templateUrl: './editar-perfil.page.html',
    styleUrls: ['./editar-perfil.page.scss'],
})
export class EditarPerfilPage implements OnInit, OnDestroy {
    public user: IUser;
    public editable: number;
    private userSubs = new Subscription();
    private emailForm: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private cache: CacheService,
        private storage: Storage,
        private navigation: NavigationHelper,
        private actionS: ActionsSubject,
        private alert: AlertController,
        private formBuilder: FormBuilder) {
        this.user = this.route.snapshot.data['user'];
        this.editable = -1;
    }

    ngOnInit() {
        this.emailForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
        this.userSubs = this.actionS
            .pipe(filter(action => action.type === AFTER_UPDATE_USER))
            .subscribe((res) => {
                this.store.dispatch(new LoadingOff());
                this.presentAlert();
            });
    }

    goToEditableItem(item: number) {
        this.editable = item;
    }

    edit() {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new UpdateUserAction(this.user));

    }

    get validateFinish() {
        return this.user.nombre_contacto &&
            this.user.email;
    }

    ngOnDestroy(): void {
        this.userSubs.unsubscribe();
    }

    private async presentAlert() {
        const alert = await this.alert.create({
            header: 'Felicitaciones',
            message: 'Acabas de actualizar tus datos',
            buttons: [{
                text: 'Aceptar',
                handler: () => {
                    this.store.dispatch(new LoadingOn());

                    const dataLogin: ILogin = {
                        login: this.user.telefono_contacto,
                        password: this.user.cedula
                    };
                    this.cache.clearAll()
                        .then(() => {
                            return this.storage.remove('user');
                        })
                        .then(() => {
                            setTimeout(() => {
                                this.store.dispatch(new LoginUserAction(dataLogin));
                                this.navigation.goTo('preguntas-frecuentes');
                            }, 300);
                        });
                }
            }],
            cssClass: 'info-alert',
            backdropDismiss: false
        });

        return alert.present();
    }

    get controls() {
        return this.emailForm.controls;
    }
}
