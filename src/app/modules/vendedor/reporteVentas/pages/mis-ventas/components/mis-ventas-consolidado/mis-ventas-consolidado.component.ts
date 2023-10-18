import {Component, Input, OnInit} from '@angular/core';
import {IMySales} from '../../../../../../../interfaces/IMySales';
import {IUser} from '../../../../../../../interfaces/IUser';
import {ModalController} from '@ionic/angular';

@Component({
    selector: 'app-mis-ventas-consolidado',
    templateUrl: './mis-ventas-consolidado.component.html',
    styleUrls: ['./mis-ventas-consolidado.component.scss'],
})
export class MisVentasConsolidadoComponent implements OnInit {
    @Input() sales: IMySales;
    @Input() user: IUser;
    @Input() dateShow: string;

    public company: boolean;
    public brands: boolean;

    constructor(private modal: ModalController) {
    }

    ngOnInit() {
    }

    companyResults() {
        this.company = !this.company;

        if (this.company) {
            this.brands = false;
        }
    }

    brandResults() {
        this.brands = !this.brands;

        if (this.brands) {
            this.company = false;
        }
    }

    justBack() {
        this.modal.dismiss();
    }
}
