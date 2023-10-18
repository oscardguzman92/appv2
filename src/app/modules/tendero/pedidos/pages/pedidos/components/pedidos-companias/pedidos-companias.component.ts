import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NavigationHelper} from '../../../../../../../helpers/navigation/navigation.helper';
import {ICompany} from '../../../../../../../interfaces/ICompany';
import {AppState} from '../../store/companies.reducer';
import {Store} from '@ngrx/store';
import {Storage} from '@ionic/storage';
import {Shopkeeper} from '../../../../../../../models/Shopkeeper';
import {IPortfolio} from 'src/app/interfaces/IPortfolio';
import {IonSlides} from '@ionic/angular';
import {AnalyticsService} from 'src/app/services/analytics/analytics.service';
import {CompaniesPortfolioShopkeeperService} from 'src/app/services/orders/companies-portfolio-shopkeeper.service';
import {ICompaniesPortfolios} from 'src/app/interfaces/ICompaniesPortfolios';
import {TypeKart} from 'src/app/enums/typeKart.enum';
import {Config} from '../../../../../../../enums/config.enum';
import {forEach} from '@angular-devkit/schematics';

@Component({
    selector: 'app-pedidos-companias',
    templateUrl: './pedidos-companias.component.html',
    styleUrls: ['./pedidos-companias.component.scss'],
})
export class PedidosCompaniasComponent implements OnInit {
    @Input() companies: ICompany[];
    @Input() portfolios: IPortfolio[];
    @Input() user: Shopkeeper;
    @Input() nProducts: number = 0;
    @Input() orderValue: any;

    companiesPorfolios: ICompaniesPortfolios [] = [];
    uniqueDealers: number [] = [];

    @ViewChild('slides') slides: IonSlides;

    public slideOpts = {
        effect: 'flip',
        slidesPerView: 'auto',
        spaceBetween: 0,
        zoom: false
    };

    public readonly configUrl: Config;

    constructor(
        private navigation: NavigationHelper,
        private store: Store<AppState>,
        private storage: Storage,
        private companiesPortfolioShopkeeperService: CompaniesPortfolioShopkeeperService,
        private analyticsService: AnalyticsService) {

        this.configUrl = Config.urlImages;
    }

    ngOnInit() {
        this.init();
    }

    async init() {
        await this.normalicePortfolioRows();
        await this.setCompaniesPorfolio();
    }

    async normalicePortfolioRows() {
        this.portfolios.forEach(p => {
            p.companies = this.companiesPortfolioShopkeeperService.shuffle(p.companies);
            p.companiesRows = this.companiesPortfolioShopkeeperService.divideCompaniesPortfolio(p.companies);
        });
    }

    goToCompanies(company: ICompany) {
        this.analyticsService.sendEvent('sec_portafolio', {
            'event_category': 'portafolio',
            'event_label': 'ingresa_porta_$' + company.portafolio
        });
        this.companiesPortfolioShopkeeperService.setPortfolio(undefined);
        this.user.compania = company;
        this.storage.set('user', JSON.stringify(this.user))
            .then(() => {
                this.navigation.goToBack('compania');
            });
    }

    goToCompaniesByDistributor(distributor_id: number, portafolio: string, marca?: string, brand_id?, portaCompleto?) {
        console.log('goToCompaniesByDistributor');
        this.analyticsService.sendEvent('sec_portafolio', {'event_category': 'portafolio', 'event_label': 'ingresa_porta_$' + portafolio});
        this.companiesPortfolioShopkeeperService.setPortfolio(portafolio);
        const puntosCompania = [];
        const portafolioFilter = this.companiesPorfolios.filter(res => {
            if (res.type == 'c') {
                return false;
            }
            return (res.portfolio.distribuidor_id == distributor_id && res.portfolio.portafolio == portafolio);
        });

        for (const compa of portafolioFilter[0].portfolio.companies) {
            if (!compa.id) {
                continue;
            }
            puntosCompania[compa.id] = (compa.puntos && compa.puntos.puntaje_asignar) ? compa.puntos : 0;
        }
        if (marca && brand_id) {
            // this.navigation.goToBack('compania', { distributor_id: distributor_id, portafolio: portafolio, action: 'productsByBrands', brand_id: (brand_id) ? brand_id : false, brand_name: (marca) ? marca : false, filtro_marca: true });
            this.navigation.goToBack('compania', {
                distributor_id: distributor_id,
                portafolio: (!portafolioFilter[0].portfolio.vista_unica) ? portafolio : null,
                action: 'distributor',
                brand_name: (marca) ? marca : false,
                filtro_marca: true,
                portaCompleto: (portaCompleto) ? portaCompleto : false,
                puntosCompania: (puntosCompania.length > 0) ? puntosCompania : null
            });
        } else {
            this.navigation.goToBack('compania', {
                distributor_id: distributor_id,
                portafolio: (!portafolioFilter[0].portfolio.vista_unica) ? portafolio : null,
                action: 'distributor',
                filtro_marca: false,
                puntosCompania: (puntosCompania.length > 0) ? puntosCompania : null
            });
        }
    }

    calcularFechaEntregaExpress(hora) {
        let day = new Date();
        let hour = day.getHours();
        hora = hora.split(':');
        if (hora[0] >= hour) {
            return 'Hoy';
        } else {
            return 'Mañana';
        }
    }


    async setCompaniesPorfolio() {
        this.companiesPorfolios = this.companiesPortfolioShopkeeperService.filterCompaniesPortfolios(this.portfolios, this.companies)
        this.storage.get('deeplink')
            .then((deeplinkStorage) => {
                let deepLinkData = JSON.parse(deeplinkStorage);
                if(deepLinkData['producto']){
                    this.navigation.goToBack('compania', {
                        isOnlySearch: true,
                        product_id: deepLinkData['producto'],
                        action: 'deeplink-product'
                    });
                }
            })
            .catch(err => {
            });
    }

    public transformUrl(name: string) {
        return name.replace(' ', '-')
            .toLowerCase();
    }
}
