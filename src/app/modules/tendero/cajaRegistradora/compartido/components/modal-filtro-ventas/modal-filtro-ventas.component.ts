import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { LoadingOn, LoadingOff } from 'src/app/modules/compartido/general/store/actions/loading.actions';
import { IUser } from '../../../../../../interfaces/IUser';
import { IClient } from '../../../../../../interfaces/ICashRegisterSale';
import {
    CashRegisterSearchClientsState,
    CashRegisterSearchClientsCompleteState,
    CashRegisterFilterSalesState
} from '../../../store/cash-register.reducer';
import {
    CashRegisterSearchClientsAction,
    CashRegisterSearchClientsCompleteAction,
    CashRegisterFilterSalesAction
} from '../../../store/cash-register.actions';



@Component({
    selector: 'app-modal-filtro-ventas',
    templateUrl: './modal-filtro-ventas.component.html',
    styleUrls: ['./modal-filtro-ventas.component.scss'],
})

export class ModalFiltroVentasComponent implements OnInit {

    @Input() filterIn;
    public subscriptionSearchClientsComplete = new Subscription();
    @Input() user: IUser;
    public clients: IClient;
    public slideClients = {
        initialSlide: 0,
        spaceBetween: 20,
        slidesPerView: 2.5,
        speed: 500,
        slidesPerColumnFill: 'row',
        pagination: {
            el: '.swiper-pagination',
            type: 'custom',
            renderCustom: (swiper, current, total) => {
                return this.customProgressBar(current, total);
            }
        }
    };
    public paid_out_on: boolean;
    public paid_out_off: boolean;

    constructor(
        private modalController: ModalController,
        private storage: Storage,
        private storeSearchClients: Store<CashRegisterSearchClientsState>,
        private storeSearchClientsComplete: Store<CashRegisterSearchClientsCompleteState>,
        private storeFilterSales: Store<CashRegisterFilterSalesState>,
    ) { }

    ngOnInit() {
        this.configureClients();
        this.configureSearchProductsComplete();
    }

    configureClients() {

        this.storage.get('user').then(response => {
            this.user = JSON.parse(response);
            this.storeSearchClients.dispatch(new LoadingOn());
            const SearchClients = new CashRegisterSearchClientsAction(true, this.user.token, 'shopkeeper', this.user.user_id.toString());
            this.storeSearchClients.dispatch(SearchClients);
        });

    }

    configureSearchProductsComplete() {
        this.subscriptionSearchClientsComplete = this.storeSearchClientsComplete
            .select('CashRegisterSearchClientsComplete')
            .subscribe(response => {
                if (response.active) {
                    this.clients = response.clients;
                }
            });
    }

    applyFilter(value, type) {
        const FilterSales = new CashRegisterFilterSalesAction(true, this.user.token, value, type);
        this.storeFilterSales.dispatch(FilterSales);
        this.modalController.dismiss();
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

}
