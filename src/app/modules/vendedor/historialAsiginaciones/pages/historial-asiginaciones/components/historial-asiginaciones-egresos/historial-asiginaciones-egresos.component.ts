import {Component, OnInit, Input} from '@angular/core';
import {IMovimentAssign} from '../../../../../../../interfaces/IMovimentAssign';

@Component({
    selector: 'app-historial-asiginaciones-egresos',
    templateUrl: './historial-asiginaciones-egresos.component.html',
    styleUrls: ['./historial-asiginaciones-egresos.component.scss'],
})
export class HistorialAsiginacionesEgresosComponent implements OnInit {
    @Input() egresos: IMovimentAssign[];

    constructor() {
    }

    ngOnInit() {
    }

}
