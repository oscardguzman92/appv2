import {Component, Input, OnInit} from '@angular/core';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {AppState} from '../../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';

@Component({
    selector: 'app-modal-contacto',
    templateUrl: './modal-contacto.component.html',
    styleUrls: ['./modal-contacto.component.scss'],
})
export class ModalContactoComponent implements OnInit {

    @Input() tel: string;

    constructor(private callNumber: CallNumber, private store: Store<AppState>) {
    }

    ngOnInit() {
    }

    whatsapp() {
        window.open('https://api.whatsapp.com/send?text=Hola&phone=+57' + this.tel, '_blank');
    }

    call() {
        this.callNumber.callNumber('+57' + this.tel, true)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => {
                this.store.dispatch(new Fail({mensaje: 'Debes permitir el uso de las llamadas', withoutLoading: true}));
            });
    }
}
