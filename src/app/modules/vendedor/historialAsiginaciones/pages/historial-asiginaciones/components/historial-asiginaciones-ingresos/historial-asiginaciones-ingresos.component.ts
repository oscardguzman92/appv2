import {Component, OnInit, Input} from '@angular/core';
import {IMovimentAssign} from '../../../../../../../interfaces/IMovimentAssign';

@Component({
    selector: 'app-historial-asiginaciones-ingresos',
    templateUrl: './historial-asiginaciones-ingresos.component.html',
    styleUrls: ['./historial-asiginaciones-ingresos.component.scss'],
})
export class HistorialAsiginacionesIngresosComponent implements OnInit {
    @Input() ingresos: IMovimentAssign[];

    constructor() {
    }

    ngOnInit() {
    }

}
