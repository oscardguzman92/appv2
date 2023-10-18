import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'addHoursDate'
})
export class AddHoursDatePipe implements PipeTransform {

    private days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

    private monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    transform(data: any): any {
        let type: any = 'visit-day';
        if (data === 0)
             type = 'default';
        let date = new Date();
        let day = null;
      

        switch (type) {
            case 'visit-day':
                let index = this.days.findIndex(day => day == data.dia);
                date.setDate(date.getDate() + ((7-date.getDay())%7+1) % 7);
                date.setDate(date.getDate() + (data.tiempo_entrega / 24));
                day =  date.getDay();

                return this.days[day - 1] + ' ' + date.getUTCDate() + ' de ' + this.monthNames[date.getMonth()] + ' del ' + date.getFullYear();                
            break;
            case 'default':
                date = new Date();
                date.setDate(date.getDate() + (data / 24));
                day = (date.getDay() === 0) ? 1 : date.getDay();
                return this.days[day - 1] + ' ' + date.getUTCDate() + ' de ' + this.monthNames[date.getMonth()] + ' del ' + date.getFullYear();                
            break;
        }


    }

}
