import {Component, EventEmitter, OnInit, Output, Input} from '@angular/core';
import {Keyboard} from '@ionic-native/keyboard/ngx';

@Component({
    selector: 'app-mis-mensajes-buscador',
    templateUrl: '../../../../../general/components/general-buscador/general-buscador.component.html',
    styleUrls: ['./mis-mensajes-buscador.component.scss'],
})
export class MisMensajesBuscadorComponent implements OnInit {
    @Output() eventSearch = new EventEmitter();
    public small: boolean;
    public txtSearch: string;
    public txtSearchTemp: string;
    public statusSize: boolean;
    public showContact: boolean;
    public activeKeyUp: boolean = true;
    public inputExpand: boolean = true;
    public searchProductos: Array<any>;

    constructor(private keyboard: Keyboard) {
        this.showContact = false;
    }

    ngOnInit() {
    }

    keyup(e) {
        this.eventSearch.emit(e.target.value);
    }

    showSearch() {
        this.small = false;
        this.txtSearch = this.txtSearchTemp;
        this.statusSize = this.small;
    }

    hideSearch(clearInput?: boolean) {
        this.keyboard.hide();
        this.small = true;
        this.txtSearchTemp = (clearInput) ? '' : this.txtSearch;
        this.txtSearch = '';
        setTimeout(() => this.statusSize = this.small, 500);
    }

    emitFocusEvent() {}

    emitBlurEvent() {}

    hideSearchIcon(clearInput?: boolean) {}
}
