import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
    private days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    public daysShort = ['D','L','M','M','J','V','S'];
    public monthNamesShort = [
            'Ene',
            'Feb',
            'Mar',
            'Abr',
            'May',
            'Jun',
            'Jul',
            'Ago',
            'Sep',
            'Oct',
            'Nov',
            'Dic',
        ];
    private monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    private dateShow = null;

    constructor(private modal: ModalController) {
    }

    ngOnInit(): void {
    }

    dateSelected(ev) {
        const date = new Date(ev);
        const dateService = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        this.dateShow = this.days[date.getDay() - 1] + ' ' +
            date.getUTCDate() + ' de ' +
            this.monthNames[date.getMonth()] + ' del ' + date.getFullYear();

        this.modal.dismiss({
            dateService: dateService,
            dateShow: this.dateShow
        });
    }
}
