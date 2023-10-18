import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'deleteHourDate'
})
export class DeleteHourDatePipe implements PipeTransform {

    transform(value: any, args?: any): any {
        let partsCreatedDate = value.split(' ');
        partsCreatedDate = partsCreatedDate[0].split('-');
        const createdDate = partsCreatedDate[0] + '-' + partsCreatedDate[1] + '-' + partsCreatedDate[2];
        return createdDate;
    }

}
