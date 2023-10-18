import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {AppState} from './store/mySales.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {GetMySalesAction, GetOrderByShopIdAction, SET_ORDER_BY_SHOP_ID, SetOrderByShopIdAction} from './store/mySales.actions';
import {Subscription} from 'rxjs';
import {IUser} from '../../../../../interfaces/IUser';
import {filter} from 'rxjs/operators';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {IMySales} from '../../../../../interfaces/IMySales';
import {ModalController} from '@ionic/angular';
import {ModalOptions} from '@ionic/core';
import {CalendarComponent} from './components/calendar/calendar.component';
import {MisVentasConsolidadoComponent} from './components/mis-ventas-consolidado/mis-ventas-consolidado.component';
import {ActivatedRoute} from '@angular/router';
import {MisPedidosDetalleComponent} from '../../../../tendero/misPedidos/pages/mis-pedidos/components/mis-pedidos-detalle/mis-pedidos-detalle.component';
import {Storage} from '@ionic/storage';
import {opacityAnimation} from '../../../../../animations/opacity.animation';

@Component({
    selector: 'app-mis-ventas',
    templateUrl: './mis-ventas.page.html',
    styleUrls: ['./mis-ventas.page.scss'],
    animations: [opacityAnimation]
})
export class MisVentasPage implements OnInit, OnDestroy {
    @ViewChild('scroll', {read: ElementRef}) scrollRef: ElementRef;

    private authSubs = new Subscription();
    private mySalesSubs = new Subscription();
    private orderSubs = new Subscription();
    private specificSaleSubs = new Subscription();
    public mySales: IMySales;
    private days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    public dateShow = null;
    public user: IUser;
    public dateService: string;
    public currentWeek: any[];
    public daySel: any = {};
    public state: string;
    public countOrdersPending: any[];

    private monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    constructor(
        private navigation: NavigationHelper,
        private store: Store<AppState>,
        private modalController: ModalController,
        private route: ActivatedRoute,
        private actionS: ActionsSubject,
        private storage: Storage) {
    }

    async ngOnInit() {
        
        this.currentWeek = this.getCurrentWeek();
        this.daySel.filter = {};
        this.user = this.route.snapshot.data['user'];
        this.selectDay();

        this.mySalesSubs = this.store.select('mySales')
            .pipe(filter(res => res.mySales !== null))
            .subscribe(res => {
                this.mySales = res.mySales;
                console.log(res.mySales,"mysalesssss");
            });

        this.orderSubs = this.actionS
            .pipe(filter(action => action.type === SET_ORDER_BY_SHOP_ID))
            .subscribe((res: SetOrderByShopIdAction) => {
                this.openModalDetailOrder(res.order);
                this.store.dispatch(new LoadingOff());
            });
    }

    ionViewDidEnter() {
        this.state = 'start';
        this.scrollRef.nativeElement.scrollLeft = this.scrollRef.nativeElement.scrollWidth;
        this.shopsPending();
    }

    ngOnDestroy(): void {
        this.authSubs.unsubscribe();
        this.mySalesSubs.unsubscribe();
        this.orderSubs.unsubscribe();
    }

    goDetail() {
        this.navigation.goToBack('mis-ventas-consolidado');
    }

    justBack() {
        this.navigation.justBack();
    }

    getCurrentWeek(dateService?: string) {
        const date = (() => {
            const now = (dateService) ? new Date(dateService) : new Date();
            return new Date(now.setDate(now.getDate() - 15));
        })();

        const week = Array(22)
            .fill(date)
            .map((dateMap, i) => {
                if (i !== 0) {
                    dateMap.setDate(dateMap.getDate() + 1);
                }
                const name = dateMap.toLocaleDateString('es-ES', {weekday: 'short'});
                return {
                    day: dateMap.getDate(),
                    nameDay: name[0].toUpperCase(),
                    date: dateMap.getTime(),
                };
            });
        return week;
    }

    selectDay(date?) {
        this.daySel.date = (date) ? new Date(date) : new Date();
        const dateString = this.daySel.date.toLocaleDateString('es-ES', {weekday: 'long', month: 'long', day: 'numeric'});
        this.daySel.dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
        this.daySel.day = this.daySel.date.getDate();
        this.daySel.year = this.daySel.date.getFullYear();
        this.daySel.month = this.daySel.date.getMonth() + 1;
        const dayOfWeek = this.daySel.date.toLocaleDateString('es-ES', {weekday: 'long'});
        this.daySel.filter.dia = dayOfWeek;
        this.filterData();
    }

    private filterData() {
        this.store.dispatch(new LoadingOn());
        this.dateService = `${this.daySel.year}-${this.daySel.month}-${this.daySel.day}`;
        this.dateShow = this.days[this.daySel.date.getDay()] + ' ' + this.daySel.date.getUTCDate() + ' de ' +
            this.monthNames[this.daySel.date.getMonth()] + ' del ' +
            this.daySel.date.getFullYear();
        this.store.dispatch(new GetMySalesAction(this.user.token, this.dateService));
    }

    public async openCalendar() {
        const modal = await this.modalController.create(<ModalOptions>{
            component: CalendarComponent,
            cssClass: 'filter-modal'
        });

        modal.onDidDismiss().then((data) => {
            if (!data) {
                return;
            }

            if (!data.data) {
                return;
            }

            if (data.data.dateService) {
                this.currentWeek = this.getCurrentWeek(data.data.dateService);
                this.selectDay(data.data.dateService);
            }
        });

        return await modal.present();
    }

    public async openModalConsolidado() {
        const modal = await this.modalController.create(<ModalOptions>{
            component: MisVentasConsolidadoComponent,
            componentProps: {
                sales: this.mySales,
                dateShow: this.dateShow,
                user: this.user
            }
        });

        return await modal.present();
    }

    infoSale(pedido_id: number) {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetOrderByShopIdAction(this.user.token, pedido_id));
    }

    async openModalDetailOrder(order) {
        const modal = await this.modalController.create(<ModalOptions>{
            component: MisPedidosDetalleComponent,
            cssClass: 'shopping-cart',
            componentProps: {order: order, user: this.user}
        });

        return await modal.present();
    }

    private shopsPending() {
        let shops = null;
        this.storage.get('order').then(order => {
            if (!order) {
                return;
            }
            shops = JSON.parse(order);
            if (shops.length === 0) {
                return;
            }

            this.countOrdersPending = shops
                .filter((shop) => shop.status_productos_pendientes)
                .map((shop) => shop.codigo_cliente );

            if (this.countOrdersPending.length > 0) {
                this.animation();
            }
        });
    }

    private animation() {
        setTimeout(() => {
            this.state = 'end';
        }, 1000);
        setTimeout(() => {
            this.state = 'start';
        }, 4000);
    }
}

