import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {MisMensajesMensajeComponent} from './components/mis-mensajes-mensaje/mis-mensajes-mensaje.component';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {GET_MESSAGES, GetMessagesAction, SET_MESSAGES, SetMessagesAction, SetReadMessageAction} from '../../store/messages.actions';
import {Subscription} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {IMessage, IMessages} from '../../../../../interfaces/IMessages';
import {LoadingOff, LoadingOn} from '../../../general/store/actions/loading.actions';
import {IUser} from '../../../../../interfaces/IUser';
import {ModalOptions} from '@ionic/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GetDropSizeAction} from '../../../../vendedor/misClientes/store/mis-clientes.actions';
import {GetFavoritesOrders} from '../../../pedidos/store/orders.actions';

@Component({
    selector: 'app-mis-mensajes',
    templateUrl: './mis-mensajes.page.html',
    styleUrls: ['./mis-mensajes.page.scss'],
})
export class MisMensajesPage implements OnInit {
    private messagesSubscribe = new Subscription();
    private initMessages: IMessage[];
    private currentMessage: IMessages;
    private maxPaginate = 0;
    private nPagePaginate = 2;
    private user: IUser;
    private openmessage: any;
    private messageSubs: boolean;
    private openLastMessage: boolean;
    private productMessage: any;

    public messages: IMessage[];

    constructor(
        private modal: ModalController,
        private store: Store<AppState>,
        private actionsSubj: ActionsSubject,
        private route: ActivatedRoute,
        private router: Router) {
        this.user = this.route.snapshot.data['user'];
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.openmessage = this.router.getCurrentNavigation().extras.state.data.message;
                if (this.router.getCurrentNavigation().extras.state.data.openLastMessage) {
                    this.openLastMessage = this.router.getCurrentNavigation().extras.state.data.openLastMessage;
                }

                if (this.router.getCurrentNavigation().extras.state.data.product) {
                    this.productMessage = {producto: this.router.getCurrentNavigation().extras.state.data.product};
                }
            }
        });
    }

    ngOnInit() {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetMessagesAction(this.user.token, 1));

        this.messagesSubscribe = this.actionsSubj
            .pipe(filter((res: SetMessagesAction) => res.type === SET_MESSAGES))
            .pipe(filter((res: SetMessagesAction) => res.messages != null))
            .pipe(map(res => res.messages))
            .subscribe((messages: IMessages) => {
                console.log(messages);
                this.currentMessage = messages;
                if (!this.messageSubs) {
                    this.messageSubs = true;
                    if (this.openmessage) {
                        console.log(2, this.openmessage)
                        this.openMessage(this.openmessage);
                    }
                }
                if (this.messages) {
                    this.messages = [...this.messages, ...messages.data];
                } else {
                    this.messages = messages.data;
                }

                this.initMessages = this.messages;
                this.maxPaginate = messages.last_page;

                if (this.openLastMessage) {
                    let params = null;
                    if (this.productMessage) {
                        params = this.productMessage;
                    }
                    this.openMessage(this.messages[0], params);
                }

                this.store.dispatch(new LoadingOff());
            });
    }

    ionViewWillLeave() {
        this.messagesSubscribe.unsubscribe();
    }

    loadInfiniteScroll(event) {
        if (this.maxPaginate >= this.nPagePaginate) {
            this.store.dispatch(new LoadingOn());
            this.store.dispatch(new GetMessagesAction(this.user.token, this.nPagePaginate));
            this.nPagePaginate++;
            event.target.complete();
        } else {
            event.target.disabled = true;
        }
    }

    async openMessage(message: IMessage, paramsAditional?: any) {
        if (!message.estado_lectura) {
            this.store.dispatch(new SetReadMessageAction(this.user.token, message, this.currentMessage));
        }
        const modal = await this.modal.create(<ModalOptions>{
            component: MisMensajesMensajeComponent,
            componentProps: {
                user: this.user,
                message: message, ...paramsAditional}
        });

        modal.onDidDismiss().then(() => {
            message.estado_lectura = true;
        });

        return await modal.present();
    }

    search(searchString) {
        if (!searchString) {
            this.messages = [...this.initMessages];
            return;
        }

        this.messages = this.initMessages.filter(message => {
            return (message.titulo.includes(searchString) || message.mensaje.includes(searchString));
        });
    }
}
