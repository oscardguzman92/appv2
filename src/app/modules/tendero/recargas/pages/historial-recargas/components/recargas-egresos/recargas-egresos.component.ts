import {Component, OnInit, Input} from '@angular/core';
import {ITransaction} from '../../../../../../../interfaces/ITransaction';

@Component({
    selector: 'app-recargas-egresos',
    templateUrl: './recargas-egresos.component.html',
    styleUrls: ['./recargas-egresos.component.scss'],
})
export class RecargasEgresosComponent implements OnInit {

    @Input() egresos: ITransaction[];

    constructor() {
    }

    ngOnInit() {
    }

}
