import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BarcodeScanner} from '@ionic-native/barcode-scanner/ngx';
import {AppState} from '../../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {Fail} from '../../store/actions/error.actions';

@Component({
    selector: 'app-general-boton-buscador-codigo-barras',
    templateUrl: './general-boton-buscador-codigo-barras.component.html',
    styleUrls: ['./general-boton-buscador-codigo-barras.component.scss'],
})
export class GeneralBotonBuscadorCodigoBarrasComponent implements OnInit {

    @Input() showButton: boolean;
    @Input() small: boolean;
    @Output() search = new EventEmitter();

    constructor(
        private barcodescanner: BarcodeScanner,
        private store: Store<AppState>) {
    }

    ngOnInit() {
    }

    scan() {
        this.barcodescanner.scan()
            .then((barcodeData) => {
                if (barcodeData['text']) {
                    this.search.emit(barcodeData['text']);
                }
            })
            .catch(() => {
                this.store.dispatch(new Fail({mensaje: 'Ha ocurrido un error al leer el código de barras'}));
            });
    }
}
