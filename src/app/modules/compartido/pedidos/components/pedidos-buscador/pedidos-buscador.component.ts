import {Component, EventEmitter, OnInit, Output, Input, ViewChild, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {Keyboard} from '@ionic-native/keyboard/ngx';
import {Storage} from '@ionic/storage';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {UtilitiesHelper} from 'src/app/helpers/utilities/utilities.helper';
import {Platform} from '@ionic/angular';
import {AnalyticsService} from 'src/app/services/analytics/analytics.service';
import {ICompany} from '../../../../../interfaces/ICompany';
import {IPortfolio} from '../../../../../interfaces/IPortfolio';
import {ShopSingletonService} from 'src/app/services/shops/shop-singleton.service';
import {Config} from '../../../../../enums/config.enum';
import {OfflineService} from '../../../../../services/offline/offline.service';

const mainRouteProducts = '/compania';
const mainRouteProductsOffline = '/lista-productos-offline';

@Component({
    selector: 'app-pedidos-buscador',
    templateUrl: '../../../general/components/general-buscador/general-buscador.component.html',
    styleUrls: ['./pedidos-buscador.component.scss'],
})


export class PedidosBuscadorComponent implements OnInit {

    public statusSize = true;
    public txtSearch = '';
    public txtSearchTemp = '';
    public tempIndex = 0;
    public showContact: boolean;
    public activeKeyUp: boolean = false;
    public inputExpand: boolean;
    public small: boolean = false;
    public offline: boolean = false;
    public shop;
    isOfflineActive: boolean;
    public offlineSubs = new Subscription();
    public searchProductos: Array<any>;
    public prev_text_to_search: string;
    private data;

    @Output() search: EventEmitter<string> = new EventEmitter<string>();
    @Output() focusEvent = new EventEmitter();
    @Output() blurEvent = new EventEmitter();
    @ViewChild('search') searchElement;

    @Input() notSearchInCompany?: boolean;
    @Input() offlineDynamic?: boolean;
    @Input() companies?: ICompany[] = [];
    @Input() portfolios?: IPortfolio[] = [];
    @Input() user;
    @Input() idShop;
    @Input() productosOffline;
    @Input() productosOfflineTiendas;
    @Input() allProductosOffline;
    @Input() hasKeyup;

    @Input()
    set nProducts(val: any) {
        this.small = (val > 0) ? true : false;
        this.inputExpand = (val == 0 || (val > 0 && this.small)) ? true : false;
    }

    constructor(
        public router: Router,
        private navigation: NavigationHelper,
        private storage: Storage,
        private keyboard: Keyboard,
        private analyticsService: AnalyticsService,
        private store: Store<AppState>,
        private platform: Platform,
        public shopSingletonService: ShopSingletonService,
        public offlineService: OfflineService
    ) {
        this.showContact = false;

        this.offlineSubs = this.store.select('offline').subscribe(success => {
            this.isOfflineActive = success.active;
        });

        this.platform.ready().then(() => {
            window.addEventListener('keyboardWillHide', (e) => {
                this.emitBlurEvent();
            });
            window.addEventListener('keyboardWillShow', (e) => {
                this.emitFocusEvent().then();
            });
        });

        this.searchProductos = [];
    }

    ngOnInit() {
        this.shop = this.shopSingletonService.getSelectedShop();
        this.offline = true;
    }

    showSearch() {
        this.searchElement.setFocus();
        if (this.small) {
            this.inputExpand = false;
        }
        this.small = false;
        if (!this.txtSearch) {
            this.txtSearch = this.txtSearchTemp;
            this.statusSize = false;
        } else {
            this.statusSize = true;
        }
    }

    hideSearch(clearInput?: boolean) {
        const puntosCompania = [];

        for (const compa of this.companies) {
            if (!compa.id) {
                continue;
            }
            puntosCompania[compa.id] = (compa.puntos && compa.puntos.puntaje_asignar) ? compa.puntos : 0;
        }

        for (const porta of this.portfolios) {
            for (const compa of porta.companies) {
                if (!compa.id) {
                    continue;
                }
                puntosCompania[compa.id] = (compa.puntos && compa.puntos.puntaje_asignar) ? compa.puntos : 0;
            }
        }

        this.keyboard.hide();
        if (this.notSearchInCompany) {
            this.search.emit(this.txtSearch);
            this.txtSearchTemp = (clearInput) ? '' : this.txtSearch;
            this.statusSize = (this.txtSearch !== '');
            return;
        }

        if ((this.router.url != mainRouteProducts && !this.isOfflineActive) && (!this.offlineDynamic)) {
            this.statusSize = true;
            const search = this.txtSearch;
            if (!search) {
                return;
            }
            this.txtSearch = '';
            setTimeout(() => {
                this.navigation.goToBack('compania', {
                    isOnlySearch: true,
                    search: search,
                    action: 'search',
                    puntosCompania: (puntosCompania.length > 0) ? puntosCompania : null
                });
            }, 200);
        } else {
            this.statusSize = true;
            const search = this.txtSearch;
            if (!search) {
                return;
            }
            if (this.router.url != mainRouteProductsOffline && this.offlineDynamic) {
                this.txtSearch = '';
                setTimeout(() => {
                    this.navigation.goToBack('lista-productos-offline', {
                        isOnlySearch: true,
                        search: search,
                        action: 'search',
                        productos: this.allProductosOffline,
                        puntosCompania: (puntosCompania.length > 0) ? puntosCompania : null
                    });
                }, 200);
                return;
            }

            this.search.emit(this.txtSearch);
            // this.small = true;
            this.txtSearchTemp = (clearInput) ? '' : this.txtSearch;
            this.txtSearch = '';
            setTimeout(() => this.statusSize = this.small, 200);
        }
    }

    keyup(e) {
        return;
        /*this.txtSearch = e.target.value;
        if (this.hasKeyup === true) {
            return;
        }

        if (this.txtSearch.length < 4) {
            this.searchProductos = [];
            return;
        }

        if (!this.data) {
            this.searchProductos = [];
            return;
        }
        if (!this.idShop) {
            this.searchProductos = [];
            return;
        }

        if (!this.data[0]) {
            this.searchProductos = [];
            return;
        }

        if (this.data[0].length === 0) {
            this.searchProductos = [];
            return;
        }

        const productosStorage = this.data[0];
        const productosOff = this.data[1];

        const search = productosStorage.findIndex(producto => {
            return (
                (producto.c_s == this.txtSearch || producto.c_s.search(this.txtSearch) >= 0) ||
                (producto.c_a == this.txtSearch || (producto.c_a.toLowerCase().search(this.txtSearch.toLowerCase()) >= 0)) ||
                (producto.c_s == this.txtSearch || (producto.c_s.toLowerCase().search(this.txtSearch.toLowerCase()) >= 0)) ||
                (producto.n_c == this.txtSearch || (producto.n_c.toLowerCase().search(this.txtSearch.toUpperCase()) >= 0))
            );
        });

        if (search === -1) {
            return;
        }

        const index = Object.values(productosOff)
            .find((productOffline: any) => productOffline.id == productosStorage[search].pd_id);

        if (!index) {
            return;
        }

        this.searchProductos = [productosStorage[search]];
        // this.analyticsService.sendEvent('abre_carro_', { 'event_category': 'abre_carro_paso_1', 'event_label': 'abre_carro_' });
        // this.search.emit(e.target.value);*/
    }

    async emitFocusEvent() {
        const hasProducts = (
            (this.productosOfflineTiendas && this.productosOfflineTiendas.length > 0) &&
            (this.productosOffline && this.productosOffline.length > 0)
        );
        this.data = (hasProducts) ?
            [this.productosOffline, this.productosOfflineTiendas] :
            await this.offlineService.getDataShop(this.idShop);

        if (this.focusEvent) {
            this.focusEvent.emit();
        }
    }

    emitBlurEvent() {
        if (this.blurEvent) {
            this.blurEvent.emit();
        }
    }

    hideSearchIcon(clearInput?: boolean) {
        this.hideSearch(clearInput);
    }

    goToSearch(codigo: string) {
        this.txtSearch = codigo;
        this.searchProductos = [];
        this.hideSearch(true);
    }

    *filter(array, condition, maxSize, from) {
        if (!maxSize || maxSize > array.length) {
            maxSize = array.length;
        }
        let count = 0;
        let i = from;
        while ( count< maxSize && i < array.length ) {
            if (condition(array[i])) {
                yield array[i];
                count++;
            }
            i++;
        }
        this.tempIndex = i;
        if (i == array.length) {
            this.tempIndex = 0;
        }
    }
}
