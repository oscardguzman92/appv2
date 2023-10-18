import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { UtilitiesHelper } from 'src/app/helpers/utilities/utilities.helper';
import { LoadingOn, LoadingOff } from 'src/app/modules/compartido/general/store/actions/loading.actions';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ActivatedRoute } from '@angular/router';
import { IonSlides, Platform } from '@ionic/angular';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { IUser } from '../../../../../interfaces/IUser';
import {
    CashRegisterInSaleState,
    CashRegisterInSaleDataState,
    CashRegisterSearchProductsState,
    CashRegisterSearchProductsCompleteState,
    CashRegisterTagState
} from '../../store/cash-register.reducer';
import {
    CashRegisterSearchProductsAction,
    CashRegisterSearchProductsCompleteAction,
    CashRegisterTagAction
} from './../../store/cash-register.actions';

@Component({
    selector: 'app-buscar-caja-registradora',
    templateUrl: './buscar-caja-registradora.page.html',
    styleUrls: ['./buscar-caja-registradora.page.scss'],
})

export class BuscarCajaRegistradoraPage implements OnInit, OnDestroy {

    @ViewChild('SearchSlides') SearchSlide: IonSlides;
    public title: string;
    public subtitle: string;
    public eanToSearch: string;
    public showTitle: boolean;
    public inSale: boolean;
    public updatingSlides: boolean;
    public showBackButton: boolean;
    public total: number;
    public quantity: string;
    public search: any;
    public products: any;
    public categories: any;
    public threadFilters: any = [];
    public subscriptionInSale = new Subscription();
    public subscriptionInSaleData = new Subscription();
    public subscriptionSearchProductsComplete = new Subscription();
    public firstBranch: boolean;
    public isSync = false;
    public showQuantity = false;
    public showNewProduct: boolean;
    public heightViewport: number;
    public widthViewport: number;
    public slidesMax: number;
    public slidesMin: number;

    public overriding = {
        name: null,
        id: null,
        class: null
    };

    public outstanding = {
        name: null,
        id: null,
        class: null
    };

    public searchSlides = {
        slidesPerColumn: 4,
        speed: 500,
        slidesPerView: 2,
        spaceBetween: 8,
        slidesPerColumnFill: 'row',
        pagination: {
            el: '.swiper-pagination',
            type: 'custom',
            renderCustom: (swiper, current, total) => {
                return this.customProgressBar(current, total);
            }
        }
        /* pagination: {
             el: '.swiper-pagination',
             type: 'fraction',
         }*/
    };

    public user: IUser;

    constructor(
        private route: ActivatedRoute,
        private storage: Storage,
        private helper: UtilitiesHelper,
        private navigation: NavigationHelper,
        private storeTag: Store<CashRegisterTagState>,
        private storeInSale: Store<CashRegisterInSaleState>,
        private storeInSaleData: Store<CashRegisterInSaleDataState>,
        private storeSearchProducts: Store<CashRegisterSearchProductsState>,
        private storeSearchProductsComplete: Store<CashRegisterSearchProductsCompleteState>,
        public barcodescanner: BarcodeScanner,
        private platform: Platform
    ) {
        this.configurePlatform();
    }

    ngOnInit() {
        this.configureInit();
        this.configureSlides();
        this.configureNavigationParams();
        this.configureSearchProductsComplete();
        this.configureInSaleData();
        this.configureInSale();
        this.reconfigurePageSearch(false);
        this.configureSearch();
    }

    private customProgressBar(current: number, total: number): string {
        const ratio: number = current / total;
        // tslint:disable-next-line: max-line-length
        const progressBarStyle: string = 'style=\'transform: translate3d(0px, 0px, 0px) scaleX(' + ratio + ') scaleY(1); transition-duration: 300ms;\'';
        const progressBar: string = '<span class=\'swiper-pagination-progressbar-fill\' ' + progressBarStyle + '></span>';

        let progressBarContainer = '<div class=\'swiper-pagination-progressbar\' style=\'height: 6px; top: 6px; width: 100%;\'>';
        progressBarContainer += progressBar;
        progressBarContainer += '</span></div>';

        return progressBarContainer;
    }

    configureSearch() {
        const dataSearch = this.navigation.params.state.data.search;
        console.log('dataSearch', dataSearch);
        if ( dataSearch !== undefined) {
            this.searchProducts(dataSearch);
            this.updateSlide('slidesPerColumn', this.slidesMin);
        }

    }
    configurePlatform() {
        this.platform.ready().then((readySource) => {
            this.heightViewport = this.platform.height();
            this.widthViewport = this.platform.width();
        });
    }

    configureSlides() {
        if (this.heightViewport <= 568) {
            this.slidesMax = 4;
            this.slidesMin = 3;
        } else if (this.heightViewport > 568) {
            this.slidesMax = 5;
            this.slidesMin = 4;
        }
    }

    configureNavigationParams() {
        if (this.navigation.params !== undefined) {
            if (this.navigation.params.state.data.eanToSearch !== undefined) {
                this.eanToSearch = this.navigation.params.state.data.eanToSearch;
                const category = {
                    name: this.navigation.params.state.data.eanToSearch,
                    id: null,
                    class: null,
                };
                this.updateCategories(category, null, true, true, 0);
                this.filterProductsCashRegister(this.navigation.params.state.data.eanToSearch, 'ean');
                this.firstBranch = true;
                this.showNewProduct = true;
            }
        }
    }

    configureInit() {
        this.showTitle = true;
        this.showBackButton = true;

        this.storage.get('CashRegisterInSale').then(response => {
            this.inSale = response;
        });

        this.overriding.name = 'MÁS VENDIDOS';
        this.overriding.id = 'overriding';
        this.overriding.class = 'overriding';

        this.outstanding.name = 'DESTACADOS';
        this.outstanding.id = 'outstanding';
        this.outstanding.class = 'outstanding';

        this.user = this.route.snapshot.data['user'];
        this.products = [];

        this.title = 'Buscar productos';
        this.subtitle = 'Navega entre categorías';
    }

    configureSearchProductsComplete() {
        this.subscriptionSearchProductsComplete = this.storeSearchProductsComplete
            .select('CashRegisterSearchProductsComplete')
            .subscribe(response => {
                if (response.active) {
                    if (response.products.length === 0) {
                        this.showNewProduct = true;
                    } else {
                        this.products = response.products;
                    }
                }
            });
    }

    configureInSaleData() {

        this.storage.get('CashRegisterInSaleData').then(response => {
            const total = (response === null) ? 0 : response.sale.total;
            const quantity = (response === null) ? 0 : response.sale.quantity;
            this.total = total;
            this.quantity = quantity;
        });

        this.subscriptionInSaleData = this.storeInSaleData
            .select('CashRegisterInSaleData')
            .subscribe(response => {
                if (response.active) {
                    this.total = response.CashRegisterData.sale.total;
                    this.quantity = response.CashRegisterData.sale.quantity;
                }
            });
    }

    configureInSale() {
        this.inSale = false;
        this.subscriptionInSale = this.storeInSale
            .select('CashRegisterInSale')
            .subscribe(response => {
                if (response.active) {
                    this.inSale = response.inSale;
                }
            });

        this.storage.get('CashRegisterInSale').then(response => {
            if (response !== null) {
                this.inSale = response;
            }
        });
    }

    close() {
        this.clearPoducts();
        this.goToCashRegister();
    }

    goToNewProduct(params: any = null) {
        this.navigation.goTo('nuevo-producto', { 'ean': params, 'threadFilters': this.threadFilters });
    }

    goToCashRegister(params: any = null) {
        this.navigation.goTo('caja-registradora');
    }

    reconfigurePageSearch(clear: boolean) {

        this.updatingSlides = true;
        this.firstBranch = true;
        this.showNewProduct = false;

        this.updateSlide('slidesPerColumn', this.slidesMax);
        this.products = [];
        this.categories = [];
        this.threadFilters = [];
        this.storage.get('CashRegisterTree').then(response => {
            this.categories = response;
        });
        if (clear) {
            this.clearPoducts();
        }

    }

    clearPoducts() {
        const SearchProductsComplete = new CashRegisterSearchProductsCompleteAction(true, []);
        this.storeSearchProductsComplete.dispatch(SearchProductsComplete);
    }

    scan() {
        this.barcodescanner.scan().then(barcodeData => {
            const category = {
                name: barcodeData['text'],
                id: null,
                class: null,
            };
            this.updateCategories(category, null, true, true, 0);
            this.filterProductsCashRegister(barcodeData['text'], 'ean');
        }).catch(err => {
        });
    }

    scanNewProduct() {
        this.barcodescanner.scan().then(barcodeData => {
            this.goToNewProduct(barcodeData['text']);
        }).catch(err => {
        });
    }

    searchProducts(search: any) {
        const category = {
            name: search,
            id: null,
            class: null
        };
        this.updateCategories(category, null, true, true, 0);
        this.filterProductsCashRegister(search, 'filter');
        this.tag(search);
    }

    searchCategory(category: any, updateThreadFilter: boolean, position: number) {
        if (category.issubcategory) {
            this.updateCategories(category, category.categories, updateThreadFilter, false, 1 + '.' + position);
        } else if (category.isbrands) {
            this.updateCategories(category, category.brands, updateThreadFilter, false, 2 + '.' + position);
        } else {
            this.updateCategories(category, null, updateThreadFilter, true, 3 + '.' + position);
            this.filterProductsCashRegister(category.mysql_id, 'brand');
        }
    }

    reconfigureCategories(position: any) {

        this.storage.get('CashRegisterTree').then(response => {
            const force = position.split('.');
            const first = this.threadFilters[0].position.split('.')[1];
            switch (force[0]) {
                case '1':
                    this.products = [];
                    this.categories = [];
                    this.threadFilters.splice(1, 1);
                    this.categories = response[first].categories;
                    break;
                case '2':
                    this.products = [];
                    this.categories = [];
                    this.threadFilters.splice(2, 1);
                    this.categories = response[first].categories[force[1]].brands;
                    break;

            }
        });
    }

    updateCategories(category: any, categories: any, updateThreadFilter: boolean, finalThread: boolean, position: any) {

        this.firstBranch = false;
        this.categories = [];

        if (!finalThread) {
            if (categories.length === 0) {
                this.showNewProduct = true;
            } else {
                this.categories = categories;
                this.updateSlide('slidesPerColumn', this.slidesMin);
            }
        }

        if (updateThreadFilter) {
            const filterData = {
                name: category.name,
                id: category.mysql_id,
                position: position
            };
            this.updateThreadFilter(filterData);
        }

    }

    updateThreadFilter(category: any = []) {
        this.threadFilters.push(category);
    }

    updateSlide(option: string, value: any) {
        this.updatingSlides = false;
        switch (option) {
            case 'slidesPerColumn':
                this.searchSlides.slidesPerColumn = value;
                break;
        }
        setTimeout(() => {
            this.updatingSlides = true;
        }, 400);
    }

    filterProductsCashRegister(term: any, type: any) {
        this.storeSearchProducts.dispatch(new LoadingOn());
        this.storage.get('CashRegisterProducts').then(data => {
            let searchServer = false;
            if (data) {
                const productsFind = data.filter(product => {
                    switch (type) {
                        case 'filter':
                            if (isNaN(term)) {
                                const nameP = this.helper.getFullProductNameMicro(product, 'full');
                                if (nameP.toLowerCase().indexOf(term.toLowerCase()) !== -1) {
                                    return product;
                                }
                            }
                            break;
                        case 'brand':
                            if (product.brand_id === Number(term)) {
                                return product;
                            }
                            break;
                        case 'ean':
                            if (product.ean.indexOf(term.toString()) !== -1) {
                                return product;
                            }
                            break;
                    }
                });
                if (productsFind.length === 0) {
                    searchServer = true;
                } else {
                    this.products = productsFind;
                    this.storeSearchProducts.dispatch(new LoadingOff());
                }

            } else {
                searchServer = true;
            }

            if (searchServer) {
                const SearchProducts = new CashRegisterSearchProductsAction(true, this.user.token, type, term);
                this.storeSearchProducts.dispatch(SearchProducts);
            }

        });
    }

    overridingSearch() {
        this.categories = [];
        this.storeSearchProducts.dispatch(new LoadingOn());
        const SearchProducts = new CashRegisterSearchProductsAction(true, this.user.token, 'overriding', this.user.user_id.toString());
        this.storeSearchProducts.dispatch(SearchProducts);
        this.firstBranch = false;
        this.updateThreadFilter(this.overriding);
    }

    outstandingSearch() {
        this.categories = [];
        this.storeSearchProducts.dispatch(new LoadingOn());
        const SearchProducts = new CashRegisterSearchProductsAction(true, this.user.token, 'outstanding', this.user.user_id.toString());
        this.storeSearchProducts.dispatch(SearchProducts);
        this.firstBranch = false;
        this.updateThreadFilter(this.outstanding);
    }

    tag(tag: any) {
        this.storage.get('user').then(response => {
          this.user = JSON.parse(response);
          const Tag = new CashRegisterTagAction(true, this.user.token, this.user.user_id, tag);
          this.storeTag.dispatch(Tag);
          this.close();
        });
     }

    ngOnDestroy() {
        this.reconfigurePageSearch(false);
        this.subscriptionInSale.unsubscribe();
        this.subscriptionInSaleData.unsubscribe();
        this.subscriptionSearchProductsComplete.unsubscribe();
    }

}
