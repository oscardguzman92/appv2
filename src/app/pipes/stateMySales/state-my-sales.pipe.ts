import {Pipe, PipeTransform} from '@angular/core';
import {DeleteHourDatePipe} from '../DeleteHourDate/delete-hour-date.pipe';

@Pipe({
    name: 'stateMySales'
})
export class StateMySalesPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        const dateWithoutHour = new DeleteHourDatePipe();

        let classReturn = null;
        const optionsState = ['send-same-day', 'send-another-day', 'created-another-day'];

        if (!args) {
            return classReturn;
        }

        const partsDateSelected = args.split('-');
        const dateConsulted = new Date(partsDateSelected[0], partsDateSelected[1] - 1, partsDateSelected[2]);

        let shippingDate = null;
        if (value.fecha_envio) {
            const partsShippingDate = value.fecha_envio.split('-');
            shippingDate = new Date(partsShippingDate[0], partsShippingDate[1] - 1, partsShippingDate[2]);
        }

        value.created_at = dateWithoutHour.transform(value.created_at);
        const partsCreatedDate = value.created_at.split('-');
        const createdDate = new Date(partsCreatedDate[0], partsCreatedDate[1] - 1, partsCreatedDate[2]);

        let positionClass = 1;
        if (shippingDate) {
            positionClass = (dateConsulted.getTime() === shippingDate.getTime()) ? 0 : 1;
            classReturn = optionsState[positionClass];
        }

        if (createdDate.getTime() !== dateConsulted.getTime()) {
            classReturn += ' ' + optionsState[2];
        }

        return classReturn;
    }

}
