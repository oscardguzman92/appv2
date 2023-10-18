import {Component, Input, OnInit} from '@angular/core';
import {NavigationHelper} from '../../../../../../helpers/navigation/navigation.helper';
import {GetBalanceAction, SET_BALANCE, SetBalanceAction} from '../../../store/currentAccount/currentAccount.actions';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../../store/app.reducer';
import {IUser} from '../../../../../../interfaces/IUser';
import {filter} from 'rxjs/operators';
import {SET_ONLY_POINTS, SetOnlyPointsAction} from '../../../../puntos/pages/puntos/store/puntos.actions';
import {Subscription} from 'rxjs';
import {RecargasCrearContrasenaComponent} from '../../recargas/components/recargas-crear-contrasena/recargas-crear-contrasena.component';
import {LoadingController, ModalController} from '@ionic/angular';
import {ModalOptions} from '@ionic/core';
import {LoadingOff, LoadingOn} from '../../../../../compartido/general/store/actions/loading.actions';
import { LocalNotificationService } from 'src/app/services/localNotification/local-notification.service';

@Component({
    selector: 'app-recargas-solicitar-saldos',
    templateUrl: './recargas-solicitar-saldos.component.html',
    styleUrls: ['./recargas-solicitar-saldos.component.scss'],
})
export class RecargasSolicitarSaldosComponent implements OnInit {
    @Input() user: IUser;
    public balance: string;
    private accountSubs = new Subscription();

    constructor(
        private navigation: NavigationHelper,
        private store: Store<AppState>,
        private actionsSubj: ActionsSubject,
        private localNotificationService: LocalNotificationService,
        private modalController: ModalController) {
        this.balance = '0';
    }

    ngOnInit() {
        this.store.dispatch(new GetBalanceAction(this.user.token));

        this.accountSubs = this.actionsSubj
            .pipe(filter((action: SetBalanceAction) => action.type === SET_BALANCE))
            .subscribe((res: SetBalanceAction) => {
                this.balance = res.balance;
                //verifica si hay una notificacion local de recargas y si el saldo es menor a 30k 
                //emite la notificacion, si el saldo es mayor a 30k y hay notificacion la elimina
                this.localNotificationService.checkReloadNotification(res.balance);
            });
    }

    openRequestTutorial() {
        this.navigation.goToBack('solicitud-recarga');
    }

    async createPass() {
        const modal = await this.modalController.create(<ModalOptions>{
            component: RecargasCrearContrasenaComponent,
            componentProps: {
                user: this.user,
            }
        });

        modal.onDidDismiss().then((data) => {
            if (!data.data) {
                return;
            }
            if (data.data.user === true) {
                this.store.dispatch(new GetBalanceAction(this.user.token));
            }
        });

        return await modal.present();
    }

    unsubscribe() {
        this.accountSubs.unsubscribe();
    }
}
