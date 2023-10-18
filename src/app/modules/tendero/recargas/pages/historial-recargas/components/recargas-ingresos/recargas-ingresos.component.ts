import {Component, OnInit, Input} from '@angular/core';
import {ITransaction} from '../../../../../../../interfaces/ITransaction';

@Component({
    selector: 'app-recargas-ingresos',
    templateUrl: './recargas-ingresos.component.html',
    styleUrls: ['./recargas-ingresos.component.scss'],
})
export class RecargasIngresosComponent implements OnInit {

    @Input() ingresos: ITransaction[];

    constructor() {
    }

    ngOnInit() {
    }

}
