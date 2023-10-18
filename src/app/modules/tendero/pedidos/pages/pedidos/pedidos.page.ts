import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalController, NavController} from '@ionic/angular';
import {GeneralCarritoComprasComponent} from '../../../../compartido/general/components/general-carrito-compras/general-carrito-compras.component';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {IUser} from '../../../../../interfaces/IUser';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {
    GetCompaniesAction,
    SET_COMPANIES,
    SetCompaniesAction
} from './store/companies.actions';
import {
    LoadingOff,
    LoadingOn
} from '../../../../compartido/general/store/actions/loading.actions';
import {filter, map} from 'rxjs/operators';
import {ICompany} from '../../../../../interfaces/ICompany';
import {IPortfolio} from '../../../../../interfaces/IPortfolio';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {ActivatedRoute, Router} from '@angular/router';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {
    GetOnlyPointsAction,
    SET_ONLY_POINTS,
    SetOnlyPointsAction
} from '../../../puntos/pages/puntos/store/puntos.actions';
import {Storage} from '@ionic/storage';
import {
    CountProductsOrderAction,
    COUNT_PRODUCTS_ORDER
} from 'src/app/modules/compartido/pedidos/store/orders.actions';
import {OrdersService} from 'src/app/services/orders/orders.service';
import {GeneralOfertasComponent} from '../../../../compartido/general/components/general-ofertas/general-ofertas.component';
import {CashRegisterService} from 'src/app/services/orders/cash-register.service';
import {Shop} from 'src/app/models/Shop';
import {CompaniesPortfolioShopkeeperService} from 'src/app/services/orders/companies-portfolio-shopkeeper.service';
import {TypeKart} from 'src/app/enums/typeKart.enum';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';

@Component({
    selector: 'app-pedidos',
    templateUrl: './pedidos.page.html',
    styleUrls: ['./pedidos.page.scss']
})
export class PedidosPage implements OnInit {
    @ViewChild(GeneralOfertasComponent) offerComponent: GeneralOfertasComponent;

    private shopSubs = new Subscription();
    private companiesSubs = new Subscription();
    private pointsSubs = new Subscription();

    public user: IUser;
    public companies: ICompany[] = [];
    public portfolios: IPortfolio[] = [];
    public featuredProducts: any[];
    public titleButton: string;
    public showButtonBarcode: boolean;
    public nProducts = 0;
    public actionsCountProductsOrder = new Subscription();
    public resComponent: {
        companias: ICompany[];
        portafolios: IPortfolio[];
        productos_destacados: any[];
    };
    orderValue: any;
    dataOrderByCompanyOrPortafolio: any;

    public hasEdit = false;
    constructor(
        private modal: ModalController,
        private store: Store<AppState>,
        private navigation: NavigationHelper,
        private navController: NavController,
        private actionsSubj: ActionsSubject,
        private route: ActivatedRoute,
        private actionsObj: ActionsSubject,
        private storage: Storage,
        private router: Router,
        private ordersService: OrdersService,
        private cashRegisterServices: CashRegisterService,
        private companiesPortfolioShopkeeperService: CompaniesPortfolioShopkeeperService,
        public shopSingletonService: ShopSingletonService,
    ) {
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                const dataIn = this.router.getCurrentNavigation().extras.state
                    .data;

                if (dataIn && dataIn.search) {
                    this.searchEvent(dataIn.search);
                }

                if (dataIn && dataIn.openKart) {
                    this.abrirCarrito();
                }

            }
        });
        this.titleButton = 'puntos';
    }

    ngOnInit() {}

    ionViewDidEnter() {
        this.companiesPortfolioShopkeeperService.setPortfolio(undefined);

        this.cashRegisterServices.getOrderValue(success => {
            this.orderValue = success;
        });

        this.cashRegisterServices.getOrderValueByPortfolioOrCompany(r => {
            this.dataOrderByCompanyOrPortafolio = r;
        });

        this.user = new Shopkeeper(this.route.snapshot.data['user']);

        this.shopSubs = this.store.select('order').subscribe(res => {
            if (!res) {
                this.navigation.goTo(this.user.rootPage);
                return;
            }

            if (!res.order) {
                this.navigation.goTo(this.user.rootPage);
                return;
            }

            //this.store.dispatch(new LoadingOn());
            this.store.dispatch(
                new GetOnlyPointsAction(
                    this.user.token,
                    this.user.tiendas[0].id
                )
            );
            this.store.dispatch(
                new GetCompaniesAction(this.user.token, this.user.tiendas[0].id)
            );
        });
        this.init();
    }

    async abrirCarrito() {
        const modal = await this.modal.create(<any>{
            component: GeneralCarritoComprasComponent,
            backdropDismiss: false,
            cssClass: 'shopping-cart',
            componentProps: {
                shopData: this.user.tiendas[0],
                edit: this.hasEdit,
                user: this.user
            }
        });

        return await modal.present();
    }

    init() {
        this.companies = [];
        this.portfolios = [];

        this.companiesSubs = this.actionsSubj
            .pipe(filter((action: SetCompaniesAction) => action.type === SET_COMPANIES))
            .pipe(map((result: SetCompaniesAction) => {
                return {
                    companias: result.companies,
                    portafolios: result.portfolio,
                    productos_destacados: result.featuredProducts,
                    concursos_nuevos: (result.concursos_nuevos) ? result.concursos_nuevos : 0
                };
            }))
            .subscribe((result: {
                companias: ICompany[], portafolios: IPortfolio[], productos_destacados: any[], concursos_nuevos: number
            }) => {
                this.companiesPortfolioShopkeeperService.setCompaniesPortfolios(result);
                dataCompanies = this.companiesPortfolioShopkeeperService.getCompaniesPortfolios();
                
                this.companies = dataCompanies.companias;
                this.portfolios = dataCompanies.portafolios;
                this.featuredProducts = dataCompanies.productos_destacados;
                this.countTotalOrderPortfolio();
                this.countTotalOrderCompanies();
            });

        this.ordersService
            .countSelectedProducts()
            .then(count => (this.nProducts = count));

        this.actionsCountProductsOrder = this.actionsObj
            .pipe(
                filter(
                    (res: CountProductsOrderAction) =>
                        res.type === COUNT_PRODUCTS_ORDER
                )
            )
            .subscribe(res => {
                let lastnProducts = this.nProducts;
                this.nProducts = res.nProducts;

                this.cashRegisterServices.getOrderValue(success => {
                    this.orderValue = success;
                });

                // obtener el total del pedido por compañia
                this.cashRegisterServices.getOrderValueByPortfolioOrCompany(r => {
                    this.dataOrderByCompanyOrPortafolio = r;
                    this.countTotalOrderPortfolio();
                    this.countTotalOrderCompanies();
                });

                //poner punto rojo en la burbuja 
                this.cashRegisterServices.setRedPointBaloon(active => {
                    //console.log(lastnProducts, this.nProducts);
                    if (lastnProducts != 0 && lastnProducts != this.nProducts) {
                        //console.log(active);
                        this.hasEdit = active;
                    }
                });
            });

        let dataCompanies: {
            companias: ICompany[];
            portafolios: IPortfolio[];
            productos_destacados: any[];
            res: any;
        };
        setTimeout(() => {
            dataCompanies = this.companiesPortfolioShopkeeperService.getCompaniesPortfolios();
            if (dataCompanies.companias.length <= 0 && dataCompanies.portafolios.length <= 0) {
                this.store.dispatch(
                    new Fail({mensaje: 'No tiene compañias asociadas'})
                );
                setTimeout(() => this.navigation.justBack(), 500);
                return;
            }
            this.resComponent = dataCompanies.res;
            // this.companies = dataCompanies.companias;
            // this.portfolios = dataCompanies.portafolios;
            // this.featuredProducts = dataCompanies.productos_destacados;
            this.countTotalOrderPortfolio();
            this.countTotalOrderCompanies();
        }, 800);

        this.pointsSubs = this.actionsSubj
            .pipe(
                filter(
                    (action: SetOnlyPointsAction) =>
                        action.type === SET_ONLY_POINTS
                )
            )
            .subscribe(res => {
                this.titleButton = res.points.puntaje_total + ' puntos';
            });
    }

    countTotalOrderPortfolio() {
        this.portfolios.forEach(portfolio => {
            let dataTempPortafolio = this.dataOrderByCompanyOrPortafolio.find(e =>
                e.tipoCarro == TypeKart.portfolio &&
                portfolio.portafolio == e.portafolio
            );
            if (dataTempPortafolio) {
                portfolio.totalOrder = dataTempPortafolio.total;
            } else {
                portfolio.totalOrder = 0;
            }
        });
    }

    countTotalOrderCompanies() {
        this.companies.forEach(company => {
            let dataTempPortafolio = this.dataOrderByCompanyOrPortafolio.find(e =>
                e.tipoCarro == TypeKart.company &&
                company.id == e.compania_id
            );
            if (dataTempPortafolio) {
                company.totalOrder = dataTempPortafolio.total;
            } else {
                company.totalOrder = 0;
            }
        });
    }

    ionViewWillLeave(): void {
        this.shopSubs.unsubscribe();
        this.companiesSubs.unsubscribe();
        this.pointsSubs.unsubscribe();
        this.actionsCountProductsOrder.unsubscribe();
    }

    eventPounts() {
        let shop = this.shopSingletonService.getSelectedShop();
        this.navigation.goToBack('puntos', {shop: <Shop>shop});
    }

    eventHeader() {
        this.store.dispatch(new LoadingOn());
        // this.ngOnDestroy();
        this.companies = [];
        this.portfolios = [];
        this.offerComponent.ngOnDestroy();
        this.offerComponent.clearCompanies();
        this.store.dispatch(
            new GetOnlyPointsAction(this.user.token, this.user.tiendas[0].id)
        );
        if (this.offerComponent) {
            this.offerComponent.ngOnInit();
        }
        this.init();
    }

    focusEvent() {
        this.showButtonBarcode = true;
    }

    blurEvent() {
        this.showButtonBarcode = false;
    }

    searchEvent(text) {
        this.navigation.goToBack('compania', {
            isOnlySearch: true,
            search: text,
            action: 'search'
        });
    }

    private companyExists(companies: any[], company: any): boolean {
        let i = 0;

        for (const companyObj of companies) {
            if (companyObj.id === company.id) {
                if (
                    companyObj.puntos.puntaje_asignar <
                    company.puntos.puntaje_asignar
                ) {
                    this.companies[i] = company;
                }
                return true;
            }

            i++;
        }
        return false;
    }
}
