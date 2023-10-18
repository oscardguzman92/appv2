import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActionsSubject, Store} from '@ngrx/store';
import {ModalController} from '@ionic/angular';
import {filter, map} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {AppState} from '../../store/reducers/menu.reducer';
import {ModalOptions} from '@ionic/core';
import {IUser} from '../../../../../interfaces/IUser';
import {AuthService} from '../../../../../services/auth/auth.service';
import {AFTER_LOGIN_MENU, AfterLoginMenu} from '../../store/actions/menu.actions';
import {SET_ONLY_POINTS, SetOnlyPointsAction} from '../../../../tendero/puntos/pages/puntos/store/puntos.actions';
import {SET_BALANCE, SetBalanceAction} from '../../../../tendero/recargas/store/currentAccount/currentAccount.actions';
import {SET_LAST_MESSAGES, SetLastMessagesAction} from '../../../misMensajes/store/messages.actions';
import {IMessage} from '../../../../../interfaces/IMessages';
import { Storage } from '@ionic/storage';
import { Menu } from 'src/app/models/Menu';
import { UserBuilder } from 'src/app/builders/user.builder';
import {Roles} from '../../../../../enums/roles.enum';

@Component({
    selector: 'app-general-menu',
    templateUrl: './general-menu.component.html',
    styleUrls: ['./general-menu.component.scss'],
})
export class GeneralMenuComponent implements OnInit, OnDestroy {
    private menuSubs: Subscription = new Subscription();
    private authSubs: Subscription = new Subscription();
    private menu: Function | HTMLElement | string | null;
    private user: IUser;
    private pointsSubs = new Subscription();
    private accountSubs = new Subscription();
    private messageSubs = new Subscription();

    public points: string;
    public balance: string;
    public messageNotification: {count: number, message: IMessage} ;

    constructor(
        private storage: Storage,
        private store: Store<AppState>,
        private modal: ModalController,
        private auth: AuthService,
        private actionS: ActionsSubject,
        private actionsSubj: ActionsSubject) {

        /* this.messageNotification = {
            count: 0,
            message: null
        }; */
    }

    ngOnInit() {
        this.menuSubs = this.store.select('menu')
            .pipe(
                filter(payload => payload.open)
            ).subscribe(() => {
                if (this.user.role !== Roles.mercaderista) {
                    this.openMenu();
                    return;
                }

                this.auth.isAuth()
                    .then(async user => {
                        if (user !== false) {
                            this.user = user.getUser();
                            this.openMenu();
                            return;
                        }
                    });
            });

        this.authVerify();

        this.authSubs = this.actionS
            .pipe(filter(action => action.type === AFTER_LOGIN_MENU))
            .subscribe((action: AfterLoginMenu) => {
                this.authVerify();
            });

        this.pointsSubs = this.actionsSubj
            .pipe(filter((action: SetOnlyPointsAction) => action.type === SET_ONLY_POINTS))
            .subscribe(res => {
                this.points = res.points.puntaje_total.toString();
            });

        this.accountSubs = this.actionsSubj
            .pipe(filter((action: SetBalanceAction) => action.type === SET_BALANCE))
            .subscribe((res: SetBalanceAction) => {
                this.balance = res.balance;
            });

        this.messageSubs = this.actionsSubj
            .pipe(filter((action: SetLastMessagesAction) => action.type === SET_LAST_MESSAGES))
            .subscribe((res: SetLastMessagesAction) => {
                this.messageNotification = {
                    count: res.countMessage,
                    message: res.message
                };
                //this.messageNotification.count = res.countMessage;
                //this.messageNotification.message = res.message;
            });
    }


    ngOnDestroy() {
        this.menuSubs.unsubscribe();
        this.authSubs.unsubscribe();
        this.pointsSubs.unsubscribe();
        this.accountSubs.unsubscribe();
        this.messageSubs.unsubscribe();
    }

    async getMsgLastNotificacion(){
        let msgNotification = await this.storage.get('msgNotification');
        if (msgNotification) this.messageNotification = msgNotification;
    }

    private authVerify() {
        this.auth.isAuth()
            .then(async user => {
                if (user !== false) {
                    this.user = user.getUser();
                    let userSuperSellerTemp = await this.storage.get('userSuperSellerTemp');
                    if (userSuperSellerTemp){
                        userSuperSellerTemp = JSON.parse(userSuperSellerTemp);
                        const userBuild = new UserBuilder(userSuperSellerTemp);
                        this.user = userBuild.getUser();
                    }
                    this.menu = this.user.menuComponent;
                    return;
                }
            });
    }

    private async openMenu() {
        this.getMsgLastNotificacion();
        const modal = await this.modal.create(<ModalOptions>{
            component: this.menu,
            componentProps: {
                user: this.user,
                points: this.points,
                balance: this.balance,
                messageInformation: this.messageNotification
            }
        });

        return await modal.present();
    }

}
