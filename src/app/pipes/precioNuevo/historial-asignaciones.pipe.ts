import {Pipe, PipeTransform} from '@angular/core';
import {CurrencyPipe} from '@angular/common';

@Pipe({
    name: 'historialAsignaciones'
})
export class HistorialAsignacionesPipe implements PipeTransform {

    constructor() {
    }

    transform(value: any, operacion?: any, monto?: any): any {
        const returnValue = (operacion === '-') ? value - monto : ((operacion === '+') ? value + monto : value);
        const pipe = new CurrencyPipe('en-US');
        return pipe.transform(returnValue, null, 'symbol', '1.0');
    }

}
