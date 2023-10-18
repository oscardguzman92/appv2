import { UserSellerService } from './../../../../../../../services/users/user-seller.service';
import {Component, OnInit, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';

const filterInit = {
    viewAll: true,
    active: false,
    inactive: false,
    pending_products: false,
    order: false,
};

@Component({
    selector: 'app-mis-clientes-filtro',
    templateUrl: './mis-clientes-filtro.component.html',
    styleUrls: ['./mis-clientes-filtro.component.scss'],
})
export class MisClientesFiltroComponent implements OnInit {
    @Input() filter: any;
    @Input() onlyFilterShopActive?: boolean = false;
    public searchAllDays: boolean = false;
    public searchCurrentDay: boolean = true;
    constructor(
        private modalController: ModalController,
        public userSellerService: UserSellerService,
    ) {
        userSellerService.getSearchAllDays().then((res) => {
            this.searchAllDays = res;
            this.searchCurrentDay = !this.searchAllDays;
        })
    }

    ngOnInit() {
        this.filter = (!this.filter) ? filterInit : this.filter;
    }

    saveFilter() {
        this.modalController.dismiss(this.filter);
    }

    selectItem(selectedAll: boolean = false) {
        if (selectedAll && this.filter.viewAll) {
            for (var key in this.filter) {
                if (key != 'viewAll') {
                    this.filter[key] = false;
                }
            }
        } else {
            let deselectAll = true;
            for (var key in this.filter) {
                if (key != 'viewAll' && this.filter[key]) {
                    this.filter.viewAll = false;
                    deselectAll = false;
                }
            }
            if (deselectAll) {
                this.filter.viewAll = true;
            }
        }

    }

    searchAllDaysChange(e) {
        this.searchCurrentDay = !this.searchAllDays;
        this.userSellerService.setSearchAllDays(this.searchAllDays);
    }

    searchAllCurrentDayChange(e) {
        this.searchAllDays = !this.searchCurrentDay;
        this.userSellerService.setSearchAllDays(this.searchAllDays);
    }
    

}
