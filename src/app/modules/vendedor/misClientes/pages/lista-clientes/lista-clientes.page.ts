import { GetShopsOrdersAction } from './../../store/mis-clientes.actions';
import {Component, OnInit, ElementRef, ViewChild, OnDestroy} from '@angular/core';
import {Store, ActionsSubject} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {Subscription} from 'rxjs';
import {
    FilterShopsAction,
    GetShopsAction,
    ShopsPendingProductsAction,
    SHOPS_PENDING_PRODUCTS,
    ChangeDaysWeeklyAction,
    CHANGE_DAYS_WEEKLY,
    SetShopsAction,
    SET_SHOPS,
    SetListShopsAction,
    SET_LIST_SHOPS
} from '../../store/mis-clientes.actions';

// Offline redux functions
import {IUser} from '../../../../../interfaces/IUser';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertController, ModalController, IonRefresher, LoadingController, ToastController} from '@ionic/angular';
import {filter} from 'rxjs/operators';
import {LoadingOn, LoadingOff} from 'src/app/modules/compartido/general/store/actions/loading.actions';
import {ModalOptions} from '@ionic/core';
import {MisClientesFiltroComponent} from './componentes/mis-clientes-filtro/mis-clientes-filtro.component';
import {
    GetLastMessagesAction,
    GetModalsAction,
    SET_MODALS,
    SetModalsAction, SetReadModalAction
} from '../../../../compartido/misMensajes/store/messages.actions';
import {IShops} from 'src/app/interfaces/IShops';
import {Storage} from '@ionic/storage';
import {ILogin} from 'src/app/interfaces/ILogin';
import {CacheService} from 'ionic-cache';
import {
    AFTER_REFRESH_USER,
    AfterRefreshUserAction,
    LoginUserAction,
    RefreshUserAction, SET_PERCENTAGE,
    SetPercentageAction
} from 'src/app/store/auth/auth.actions';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {MisClientesClientesComponent} from './componentes/mis-clientes-clientes/mis-clientes-clientes.component';
import {CreateFileOfflineService} from '../../../../../services/offline/create-file-offline.service';
import {OfflineService} from '../../../../../services/offline/offline.service';
import {OfflineHelper} from '../../../../../helpers/offline/offline.helper';
import {opacityAnimation} from '../../../../../animations/opacity.animation';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';
import { CashRegisterService } from 'src/app/services/orders/cash-register.service';
import { Roles } from 'src/app/enums/roles.enum';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SuperSellerService } from 'src/app/services/users/super-seller.service';
import {IModal} from '../../../../../interfaces/IModal';
import {GeneralModalInformativaComponent} from '../../../../compartido/general/components/general-modal-informativa/general-modal-informativa/general-modal-informativa.component';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';
import {SET_OFFLINE_DYNAMIC, SetOfflineDynamicAction} from '../../../compartido/store/offlineDynamic/offlineDynamic.actions';
import { UserSellerService } from 'src/app/services/users/user-seller.service';
import { MisClientesBuscadorComponent } from './componentes/mis-clientes-buscador/mis-clientes-buscador.component';
import {IZona, Seller} from '../../../../../models/Seller';

@Component({
    selector: 'app-lista-clientes',
    templateUrl: './lista-clientes.page.html',
    styleUrls: ['./lista-clientes.page.scss'],
    animations: [opacityAnimation]
})
export class ListaClientesPage implements OnInit, OnDestroy {

    public statusRefresh = false;
    public isOfflineActive: boolean;
    public offlineDynamic: boolean;
    public zonasActive: boolean;
    public zonaActive: IZona;
    public openSearch: boolean = false;
    public hasShopsOffline: boolean = false;
    public searchValue: string;
    public percentage: number = -1;
    public offlineSubs = new Subscription();
    public shopsTemp: IShops[] = [];
    public shopsTempOfflineBk: IShops[] = [];
    public shopsTempBack: IShops[] = [];
    public currentWeek: any[];
    public daySel: any = {};
    public userToken: string;
    public user: IUser;
    public zonas: IZona[] = [];
    public shopsPendingAction = new Subscription();
    public weekAction = new Subscription();
    public shopsAction = new Subscription();
    public shopsListAction = new Subscription();
    public modalAction = new Subscription();
    public paramSubs = new Subscription();
    public refreshObs = new Subscription();
    public modalsObs = new Subscription();
    public refreshShopsObs = new Subscription();
    public loadingObs = new Subscription();
    public subsOfflineDynamic = new Subscription();
    public initFilter = true;
    public countOrdersPending: string[];
    public state: string;
    public roles = Roles;
    public  filterTemp: any;
    //public isMultiDaySearch = false;
    @ViewChild('refreshClientsElement', {read: ElementRef}) refreshClientsElement: ElementRef;
    @ViewChild(MisClientesClientesComponent) misClientesClientesComponent: MisClientesClientesComponent;
    @ViewChild(MisClientesBuscadorComponent) misClientesBuscadorComponent: MisClientesBuscadorComponent;
    @ViewChild(MisClientesBuscadorComponent) searchComp: MisClientesBuscadorComponent;

    public searchClientsGlobal: string = "";

    constructor(private store: Store<AppState>,
        private actionsSubj: ActionsSubject,
        private route: ActivatedRoute,
        private storage: Storage,
        private router: Router,
        public alertController: AlertController,
        private cache: CacheService,
        private navigation: NavigationHelper,
        private loadingController: LoadingController,
        private modalController: ModalController,
        private createFileService: CreateFileOfflineService,
        private offlineService: OfflineService,
        private offlineHelper: OfflineHelper,
        private cashservice: CashRegisterService,
        private utilities: UtilitiesHelper,
        public shopSingletonService: ShopSingletonService,
        public superSellerService: SuperSellerService,
        public userSellerService: UserSellerService,
    ) {
        this.user = this.route.snapshot.data['user'];
        this.isOfflineActive = this.route.snapshot.data['offline'];
        this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];

        this.shopsTemp = this.user.tiendas;
        this.shopsTempBack = this.user.tiendas;

        this.route.queryParams.subscribe(params => {
            this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];
            if (this.router.getCurrentNavigation().extras.state) {
                const data = this.router.getCurrentNavigation().extras.state.data;
                if (data.refresh) {
                    this.statusRefresh = true;
                }
            }
        });
        userSellerService.getSearchAllDays();
    }

    get_vid(){
        return this.storage.get("user")
            .then(res => {
                return JSON.parse(res).v_id
            }).catch(err => {
                return this.storage.get('getDatosSinConexion');
            });
    }

    async ngOnInit() {
        this.zonas = (this.user as Seller).zonas || [];
        this.zonasActive = ((this.user as Seller).zonas) ? ((this.user as Seller).zonas.length > 0) : false;
        if (this.zonasActive) {
            this.orderZona();
            this.zonaActive = this.zonas[0];
        }
        
        this.shopSingletonService.deleteSelecedShop();
        // Se borra punto del carrito
        this.cashservice.clearAlredyOrder();
        //this.store.dispatch(new LoadingOn);
        
        this.shopsPendingAction = this.actionsSubj
        .pipe(filter((res: ShopsPendingProductsAction) => res.type === SHOPS_PENDING_PRODUCTS))
        .subscribe((res) => {
            if (!this.isOfflineActive) {
                this.countOrdersPending = res.codes.split(',');
                const message = 'Las siguientes tiendas \'' + res.codes + '\' tienen pedidos pendientes';
                this.presentAlert(message);
                this.animation();
            }
        });

        this.loadingObs = this.actionsSubj
        .pipe(filter((res: SetPercentageAction) => res.type === SET_PERCENTAGE))
        .subscribe((res) => {
            this.percentage = res.percentage;
        });
        
        this.weekAction = this.actionsSubj
        .pipe(filter((res: ChangeDaysWeeklyAction) => res.type === CHANGE_DAYS_WEEKLY))
        .subscribe((res) => {
            this.currentWeek = res.week;
        });
        
        this.shopsAction = this.actionsSubj
        .pipe(filter((res: SetShopsAction) => res.type === SET_SHOPS))
            .subscribe((res) => {
            this.shopsTemp = res.shops;
            this.loadingController.getTop().then(loading => {
                if (loading) {
                    this.store.dispatch(new LoadingOff());
                }
            });
        });
        
        this.shopsListAction = this.actionsSubj
        .pipe(filter((res: SetListShopsAction) => res.type === SET_LIST_SHOPS))
        .subscribe((res) => {
            this.initFilter = false;
            this.statusRefresh = false;
            this.shopsTempBack = res.shops;
            this.selectDay();
        });
        
        this.modalAction = this.actionsSubj
        .pipe(filter((res: SetModalsAction) => res.type === SET_MODALS))
        .subscribe((res) => {
            if (res.modals.length > 0) {
                for (const modal of res.modals) {
                    this.openModalCustom(modal);
                }
            }
        });

        this.refreshShopsObs = this.shopSingletonService.getObservableShopsRefresh().subscribe((data) => {
            setTimeout(() =>  {
                this.storage.get('user')
                    .then(user => {
                        const json = JSON.parse(user);
                        if (json.tiendas) {
                            this.shopsTempBack = json.tiendas;
                            this.store.dispatch(new FilterShopsAction(this.shopsTempBack, this.daySel.filter, this.initFilter, (this.zonaActive && !this.userSellerService.searchAllDays) ? this.zonaActive.id : null));
                        }
                    })
            }, 150);
        })
        
        this.refreshObs = this.actionsSubj
        .pipe(filter((res: AfterRefreshUserAction) => res.type === AFTER_REFRESH_USER))
        .subscribe((res) => {
            if (res.sessionInactive === true) {
                this.cache.clearAll()
                .then(() => {
                    return this.storage.clear();
                })
                .then(() => {
                    this.navigation.goTo('inicio');
                });
                return;
            }
            
            if (!res.user) {
                return;
            }
            
            this.storage.remove('user')
            .then(() => {
                if (res.notRemoveOrder === true) {
                    return;
                }
                return this.storage.remove('order');
            })
            .then(() => {
                this.storage.set('user', JSON.stringify(res.user));
                this.user = res.user;
                this.offlineDynamic = false;
                this.shopsTempBack = res.user.tiendas;
                this.filterData();
                this.validateDownloadedOfflineFile();
                this.refreshData();
                this.utilities.presentToast('Los datos fueron actualizados correctamente.');
                this.store.dispatch(new LoadingOff());
            })
            .catch(err => {
                this.store.dispatch(new LoadingOff());
            });
        });
        
        this.subsOfflineDynamic = this.actionsSubj
        .pipe( filter(res => res.type === SET_OFFLINE_DYNAMIC))
        .subscribe((res: SetOfflineDynamicAction) => {
            this.offlineDynamic = res.on;
            this.cache.saveItem('offlineDynamic', true, 'offlineDynamic', 600);
        });
    }
    
    // Para borrar cache de lista de clientes (chulito verde pedidos de 8 días)
    async firstEnter() {
        await this.storage.get('client_list').then(success => {
            let fech = new Date().getDate();
            
            if (!success) {
                this.refreshHard(fech);
                return;
            }

            if (success != 'd_' + fech) {
                this.refreshHard(fech);
            } else {
                this.validateDownloadedOfflineFile();
                this.loadingController.getTop().then(loading => {
                    if (loading) {
                        this.store.dispatch(new LoadingOff());
                    }
                });
            }
        });
    }

    refreshHard(fech) {
        let userData = null;

        const dataLogin: ILogin = {
            login: this.user.cedula,
            password: this.user.cedula
        };

        if (this.user.prueba === true) {
            dataLogin.prueba = true;
        }

        this.storage.remove('offlineFileDownloaded')
            .then(() => {
                return this.cache.clearAll();
            })
            .then(() => {
                return this.storage.get('user');
            })
            .then((user) => {
                userData = user;
                return this.storage.clear();
            })
            .then(() => {
                return this.storage.set('user', userData);
            })
            .then(() => {
                return this.storage.set('client_list', 'd_' + fech);
            })
            .then(() => {
                this.store.dispatch(new RefreshUserAction(dataLogin));
            });
    }

    ionViewWillEnter() {
        document.addEventListener('deviceready', function() {
            var success = function(status) {};
            var error = function(status) {};

            try {
                (window as any).CacheClear(success, error);
            }catch (e) {
                console.log(e)
            }
        });
        this.userToken = this.user.token;
        this.shopSingletonService.deleteSelecedShop();
        this.state = 'start';
        
        this.offlineDynamic =  this.route.snapshot.data['offlineDynamic'];
        this.offlineStore();
        if (!this.isOfflineActive && !this.offlineDynamic) {
            this.store.dispatch(new GetShopsOrdersAction(this.userToken));
        }
        if (!this.offlineDynamic && !this.isOfflineActive) {
            this.store.dispatch(new GetModalsAction(this.user.token));
        }

        if (this.isOfflineActive) {
            this.loadingController.getTop().then(loading => {
                if (loading) {
                    this.store.dispatch(new LoadingOff());
                }
            });
            return;
        }

        // valida que la lista de clientes sea actual y no de cache
        this.loadingController.getTop().then(loading => {
            if (!loading) {
                this.store.dispatch(new LoadingOn());
            }
        });
        this.firstEnter();

        this.daySel.filter = {};
        if (!this.currentWeek || this.currentWeek.length === 0) {
            this.currentWeek = this.getCurrentWeek();
        }
        if (!this.daySel.filter.dia) {
            this.initFilter = true;
            this.selectDay()
        };
        //this.selectDay();
        /* if (!this.offlineDynamic) {
            this.store.dispatch(new GetLastMessagesAction(this.user.token));
        } */
        this.paramSubs = this.route.queryParams.subscribe(params => {
            setTimeout(() => {
                this.loadingController.getTop().then(loading => {
                    if (loading) {
                        this.store.dispatch(new LoadingOff());
                    }
                });
            }, 800);
            if (!this.router.getCurrentNavigation()) {
                return;
            }

            if (!this.router.getCurrentNavigation().extras) {
                return;
            }

            if (this.router.getCurrentNavigation().extras.state) {
                const data = this.router.getCurrentNavigation().extras.state.data;
                if (!data.viewShop) {
                    return;
                }

                if (!this.misClientesClientesComponent) {
                    return;
                }

                this.misClientesClientesComponent.viewDetail(data.viewShop, {
                    target: {className: 'push'}
                });
                
            }
        });
    }

    ionViewDidLeave() {
        this.offlineSubs.unsubscribe();
    }

    async presentAlert(message: string) {
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: ['Aceptar']
        });

        await alert.present();
    }

    ngOnDestroy() {
        this.shopsPendingAction.unsubscribe();
        this.weekAction.unsubscribe();
        this.shopsAction.unsubscribe();
        this.shopsListAction.unsubscribe();
        this.modalAction.unsubscribe();
        this.paramSubs.unsubscribe();
        this.refreshObs.unsubscribe();
        this.modalsObs.unsubscribe();
        this.loadingObs.unsubscribe();
        this.loadingObs.unsubscribe();
        this.refreshShopsObs.unsubscribe();
    }

    drawOfflineCustomers() {
        this.selectDay();
    }

    refreshData() {
        if (this.refreshClientsElement) {
            this.store.dispatch(new GetShopsAction(this.userToken, this.daySel.filter, this.refreshClientsElement.nativeElement));
        } else {
            this.filterData();
        }
    }

    getCurrentWeek() {
        // Obtener Domingo de la Semana actual
        const date = new Date();

        // Recorrer la semana
        const week = Array(7).fill(date).map((date, i) => {
            if (i !== 0) {
                date.setDate(date.getDate() + 1);
            }
            const name = date.toLocaleDateString('es-ES', {weekday: 'short'});
            return {
                day: date.getDate(),
                nameDay: name[0].toUpperCase(),
                date: date.getTime(),
            };
        });
        return week;
    }

    clearFilter() {
        if (!this.daySel.filter) {
            this.daySel.filter = {};
        }
        this.daySel.filter.viewAll = true;
        this.daySel.filter.activo = null;
        this.daySel.filter.nombre_tienda = null;
        this.daySel.filter.nombre_contacto = null;
        this.daySel.filter.codigo_cliente = null;
        this.daySel.filter.dia = null;
        this.daySel.filter.direccion = null;

    }


    selectDay(date?, withoutAction = false) {
        this.clearFilter();
        this.daySel.date = (date) ? new Date(date) : new Date();
        const dateString = this.daySel.date.toLocaleDateString('es-ES', {weekday: 'long', month: 'long', day: 'numeric'});
        this.daySel.dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
        this.daySel.day = this.daySel.date.getDate();
        const dayOfWeek = this.daySel.date.toLocaleDateString('es-ES', {weekday: 'long'});
        this.daySel.filter.dia = dayOfWeek;
        if (withoutAction) return;
        if (this.statusRefresh) {
            this.refreshData();
        } else {
            this.filterData();
        }
    }

    clearSearch() {
        this.misClientesBuscadorComponent.hideSearch(true)
        this.searchClient("");
    }

    searchClient(comodin) {
        this.searchClientsGlobal = comodin;
        if (this.userSellerService.searchAllDays) {
            if(comodin != ""){
                this.daySel.filter.dia = null;
            }else{
                this.daySel.filter.dia = this.daySel.date.toLocaleDateString('es-ES', { weekday: 'long' });
            }
        }
        this.daySel.filter.nombre_tienda = comodin;
        this.daySel.filter.nombre_contacto = comodin;
        this.daySel.filter.codigo_cliente = comodin;
        this.daySel.filter.direccion = comodin;
        this.daySel.filter.cedula_distribuidor = comodin;
        this.filterData();
    }

    setFilter() {
        this.daySel.filter.viewAll = this.filterTemp.viewAll;
        this.daySel.filter.activo = this.filterTemp.active;
        this.daySel.filter.inactive = this.filterTemp.inactive;
        this.daySel.filter.status_productos_pendientes = this.filterTemp.pending_products;
        this.daySel.filter.pedido = this.filterTemp.order;
        this.filterData();
    }

    async filterData() {
        if ((this.isOfflineActive || this.offlineDynamic) && !this.daySel.filter.dia && !this.userSellerService.searchAllDays) this.selectDay(undefined, true);
        this.store.dispatch(new FilterShopsAction(this.shopsTempBack, this.daySel.filter, this.initFilter, (this.zonaActive && !this.userSellerService.searchAllDays) ? this.zonaActive.id : null));
        this.initFilter = false;
    }

    async showFilter() {
        const modal = await this.modalController.create(<ModalOptions>{
            component: MisClientesFiltroComponent,
            cssClass: 'filter-modal filter-modal-three',
            componentProps: {
                filter: this.filterTemp
            }
        });

        modal.onDidDismiss().then(async res => {
            if (!res.data) {
                return;
            }
            this.filterTemp = res.data;
            this.setFilter();
        });

        return await modal.present();
    }

    private offlineStore() {
        this.offlineSubs = this.store.select('offline').subscribe(success => {
            this.isOfflineActive = success.active;
            if (!success.active) {
                this.hasShopsOffline = false;
                return;
            }

            if (this.hasShopsOffline && this.shopsTemp.length > 0) {
                return;
            }

            this.store.dispatch(new LoadingOn);
            let tiend_temp = null;
            this.offlineService.getOfflineDataFromCouchDB(this.user.vendedor_id,new Date().getDay()).then(dat =>{
                this.offlineService.clearData();
                tiend_temp = [];
                if (!dat) {
                    return;
                }
                dat = Object.keys(dat.tiendas);
                this.user.tiendas.forEach(tienda =>{
                    dat.forEach(element => {
                        if(element == tienda.id){
                            tiend_temp.push(tienda);
                        }
                    });
                });
                if (success.active) {
                    this.daySel.filter = {};
                    this.userToken = this.user.token;
                    this.shopsTemp = (tiend_temp)?tiend_temp :this.user.tiendas;
                    this.drawOfflineCustomers();
                    this.hasShopsOffline = true;
                }

                this.offlineService.clearData();
                setTimeout(() => {
                    this.store.dispatch(new LoadingOff());
                }, 200);
            }, err => {
                setTimeout(() => {
                    this.store.dispatch(new LoadingOff());
                }, 200);
            });

        });
    }

    private validateDownloadedOfflineFile() {
        this.storage.get('offlineFileDownloaded')
            .then(res => {
                if (res === true) {
                    return;
                }

                if (res === false) {
                    return;
                }

                if ((this.user as Seller).sin_archivos_offline) {
                    return;
                }

                this.offlineHelper.alertOfflineDynamic(() => {
                    if (this.user.prueba) {
                        return this.storage.set('offlineFileDownloaded', false);
                    }
                }, () => {
                    this.createFileService.invoke(this.userToken);
                }, 'Para empezar debes iniciar tu día');
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

    private async openModalCustom(modalData: IModal) {
        const modal = await this.modalController.create({
            component: GeneralModalInformativaComponent,
            cssClass: ['modal-info'],
            componentProps: {
                data: modalData,
                user: this.user
            },
            backdropDismiss: false
        });

        modal.onDidDismiss().then(res => {
            if (modalData.persistente && (res.data && !res.data.addProduct)) {
                return;
            }

            this.store.dispatch(new SetReadModalAction(this.user.token, modalData.id));
        });

        return modal.present();
    }

    // validMultidaySearch(){

    //     if (this.initFilter){
    //         this.isMultiDaySearch = false;
    //         return;
    //     }
        
    //     //si solo hay una tienda y pertenece al mismo dia seleccionado no oculta los dias
    //     if (this.shopsTemp.length == 1 && this.rmAccents(this.daySel.dateString).indexOf(this.rmAccents(this.shopsTemp[0].dia)) >= 0 ){
    //         this.isMultiDaySearch = false;
    //         return ;
    //     }

    //     //si el filtro no tiene datos de busqueda no oculta los dias
    //     if (this.daySel.filter.codigo_cliente == "" || this.daySel.filter.codigo_cliente == undefined){
    //         this.isMultiDaySearch = false;
    //         return ;
    //     }

    //         this.isMultiDaySearch = true;
    // }

    // rmAccents(text) {
    //     if (text && text != ""){
    //         return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    //     }
    //     return text;
    // }
    public searchZone() {
        this.zonas = (this.user as Seller).zonas.filter(zone => {
            return zone.nombre.toLowerCase().indexOf(this.searchValue.toLowerCase()) >= 0;
        });
        if (this.zonas.length > 0) {
            this.orderZona();
            this.zonaActive = this.zonas[0];
        }
    }

    public selectZone(ev: any) {
        this.zonaActive = (this.user as Seller).zonas.find(zone => zone.id.toString() == ev.target.value.toString());
    }

    public searchByZone() {
        this.filterData();
    }

    public orderZona() {
        this.zonas.sort((zonaUno, zonaDos) => {
            const zona = zonaUno.nombre, zonaD = zonaDos.nombre;
            if (parseInt(zona) !== NaN && parseInt(zonaD) !== NaN){
                let zonaNumber = parseInt(zona), zonaDNumber = parseInt(zonaD);
                if (zonaNumber < zonaDNumber){
                    return -1;
                }

                if (zonaNumber > zonaDNumber) {
                    return 1;
                }

                return 0;
            }

            if (zona < zonaD){
                return -1;
            }

            if (zona > zonaD) {
                return 1;
            }

            return 0;
        });
    }
}
