import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {filter} from 'rxjs/operators';
import {
    SetMerchantShopAction,
    GetMerchantShopAction,
    SET_MERCHANT_SHOP,
    SetMerchantGeolocationAction
} from '../../store/merchantShop.actions';
import {Subscription} from 'rxjs';
import {MisClientesFiltroComponent} from 'src/app/modules/vendedor/misClientes/pages/lista-clientes/componentes/mis-clientes-filtro/mis-clientes-filtro.component';
import {ModalController} from '@ionic/angular';
import {ToggleMenu} from 'src/app/modules/compartido/general/store/actions/menu.actions';
import {
    BackgroundGeolocation,
    BackgroundGeolocationConfig,
    BackgroundGeolocationResponse,
    BackgroundGeolocationEvents
} from '@ionic-native/background-geolocation/ngx';

@Component({
    selector: 'app-clientes-mercaderista',
    templateUrl: './clientes-mercaderista.page.html',
    styleUrls: ['./clientes-mercaderista.page.scss']
})
export class ClientesMercaderistaPage implements OnInit {
    public user: any;
    public shops: any = [];
    public shopsAll: any = [];
    private merchantShopSubs = new Subscription();
    public filters: any = {};

    @ViewChild('refreshElement', {read: ElementRef})
    refreshElement: ElementRef;
    currentWeek: { day: any; nameDay: any; date: any }[];
    daySel: any = {};

    constructor(
        private route: ActivatedRoute,
        private navigation: NavigationHelper,
        private actionsSubj: ActionsSubject,
        private store: Store<AppState>,
        private modalController: ModalController,
        private backgroundGeolocation: BackgroundGeolocation,
    ) {
        this.user = this.route.snapshot.data['user'];
    }

	ngOnInit() {
		this.selectDay();
		this.currentWeek = this.getCurrentWeek();
		if (this.user.clientes) {
			this.shops = this.user.clientes;
			this.shopsAll = this.user.clientes;
			this.filterClientsByDay();
		}
		this.merchantShopSubs = this.actionsSubj
			.pipe(filter(res => res.type === SET_MERCHANT_SHOP))
			.subscribe((res: SetMerchantShopAction) => {
				this.shops = res.shops;
				this.shopsAll = res.shops;
				this.filterClientsByDay();
			});

		if (this.shops.length == 0) {
			this.store.dispatch(new GetMerchantShopAction(this.user.token));
		}
		if (this.user.rastreo) {
			this.startBackgroundGeolocation();	
		}
		/* const location: any = {}
		location.speed = undefined;
		location.latitude = "12";
		location.longitude = "33";
		this.sendGPS(location);  */

    }

    toggleMenu() {
        this.store.dispatch(new ToggleMenu());
    }

    viewDetail(shop) {
        this.navigation.goToBack('detalle-cliente-mercaderista', shop);
    }

    refreshData() {
        this.store.dispatch(
            new GetMerchantShopAction(
                this.user.token,
                this.refreshElement.nativeElement
            )
        );
    }

    selectDay(date?) {
        this.daySel.date = date ? new Date(date) : new Date();
        const dateString = this.daySel.date.toLocaleDateString('es-ES', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        this.daySel.dateString =
            dateString.charAt(0).toUpperCase() + dateString.slice(1);
        this.daySel.day = this.daySel.date.getDate();
        this.daySel.dayOfWeek = this.daySel.date.getDay();
        if (date) {
            this.filterClientsByDay();
        }
    }

    searchClient(comodin) {
        this.filters.comodin = comodin;
        this.filterClients();
    }

    filterClients() {
        console.log(this.filters);
        if (this.filters.comodin == '') {
            return this.filterClientsByDay();
        }
        this.shops = this.shopsAll.filter(el => {
            return (
                el.dia == this.daySel.dayOfWeek &&
                (!this.filters.active ||
                    (this.filters.inactive && this.filters.active) ||
                    this.filters.active == el.activo) &&
                (!this.filters.inactive ||
                    (this.filters.active && this.filters.inactive) ||
                    this.filters.inactive != el.activo) &&
                (!this.filters.comodin ||
                    (this.filters.comodin &&
                        el.nombre_tienda &&
                        this.rmAccents(el.nombre_tienda.toLowerCase()).indexOf(
                            this.rmAccents(this.filters.comodin.toLowerCase())
                        ) >= 0) ||
                    !this.filters.comodin ||
                    (this.filters.comodin &&
                        el.nombre_contacto &&
                        this.rmAccents(
                            el.nombre_contacto.toLowerCase()
                        ).indexOf(
                            this.rmAccents(this.filters.comodin.toLowerCase())
                        ) >= 0) ||
                    !this.filters.comodin ||
                    (this.filters.comodin &&
                        el.cedula &&
                        el.cedula.indexOf(this.filters.comodin) >= 0) ||
                    !this.filters.comodin ||
                    (this.filters.comodin &&
                        el.direccion &&
                        this.rmAccents(el.direccion.toLowerCase()).indexOf(
                            this.rmAccents(this.filters.comodin.toLowerCase())
                        ) >= 0))
            );
        });
    }

    rmAccents(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    filterClientsByDay() {
        this.shops = this.shopsAll.filter(
            shop => this.daySel.dayOfWeek == shop.dia
        );
    }

    async showFilter() {
        const modal = await this.modalController.create({
            component: MisClientesFiltroComponent,
            cssClass: 'filter-modal',
            componentProps: {
                filter: this.filters,
                onlyFilterShopActive: true
            }
        });

        modal.onDidDismiss().then(res => {
            if (!res.data) {
                return;
            }
            this.filters = res.data;
            this.filterClients();
        });

        return await modal.present();
    }

    getCurrentWeek() {
        // Obtener Domingo de la Semana actual
        const date = new Date();

        // Recorrer la semana
        const week = Array(7)
            .fill(date)
            .map((date, i) => {
                if (i !== 0) {
                    date.setDate(date.getDate() + 1);
                }
                const name = date.toLocaleDateString('es-ES', {
                    weekday: 'short'
                });
                return {
                    day: date.getDate(),
                    nameDay: name[0].toUpperCase(),
                    date: date.getTime()
                };
            });
        return week;
    }

    startBackgroundGeolocation() {
        const config: BackgroundGeolocationConfig = {
            desiredAccuracy: 10,
            stationaryRadius: this.user.metros_rastreo || 30,
            distanceFilter: this.user.metros_rastreo || 30,
            debug: false,
            stopOnTerminate: false,
            // Android only section
            locationProvider: 0,
            startForeground: true,
            interval: this.user.seguntos_rastreo || 120000,
            //fastestInterval: 5000,
            //activitiesInterval: 10000,
        };

        this.backgroundGeolocation.configure(config).then(() => {
            this.backgroundGeolocation
                .on(BackgroundGeolocationEvents.location)
                .subscribe((location: BackgroundGeolocationResponse) => {
                    console.log(location);
                    this.sendGPS(location);

                    // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                    // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
                    // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
                });
        });

        // start recording location
        this.backgroundGeolocation.start();

        // If you wish to turn OFF background-tracking, call the #stop method.
        //this.backgroundGeolocation.stop();
    }

    sendGPS(location) {
        if (location.speed == undefined) {
            location.speed = 0;
        }

        this.store.dispatch(
            new SetMerchantGeolocationAction(
                this.user.token,
                location.latitude,
                location.longitude
            )
        );
    }

    ngOnDestroy() {
        this.merchantShopSubs.unsubscribe();
    }
}
