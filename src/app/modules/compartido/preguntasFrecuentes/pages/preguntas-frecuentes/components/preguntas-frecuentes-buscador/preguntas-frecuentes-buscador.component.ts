import {Component, EventEmitter, OnInit, Output, Input, ElementRef, ViewChild} from '@angular/core';
import { Intercom } from '@ionic-native/intercom/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
    selector: 'app-preguntas-frecuentes-buscador',
    templateUrl: '../../../../../general/components/general-buscador/general-buscador.component.html',
    styleUrls: ['./preguntas-frecuentes-buscador.component.scss'],
})
export class PreguntasFrecuentesBuscadorComponent implements OnInit {
    public showContact: boolean;
    public small: boolean;
    public searchModel: string;
    public txtSearch: string;
    public txtSearchTemp: string;
    public statusSize: boolean;
    public searchProductos: Array<any>;

    @Output() eventSearch = new EventEmitter();
    @ViewChild('search') searchElement ;
    public inputExpand: boolean = true;
    public activeKeyUp:boolean = true; 

    constructor(
        private intercom: Intercom,
        private keyboard: Keyboard
        ) {
        this.showContact = true;
        this.small = true;
        this.statusSize = true;
    }

    ngOnInit() {
    }


    keyup(e) {
        this.eventSearch.emit(e.target.value);
    }

    showSearch() {
        this.searchElement.setFocus();
        this.small = false;
        this.showContact = false;
        this.txtSearch = this.txtSearchTemp;
        this.statusSize = this.small;
    }

    hideSearch(clearInput?: boolean) {
        this.keyboard.hide();
        this.small = true;
        this.showContact = true;
        this.txtSearchTemp = (clearInput) ? '' : this.txtSearch;
        this.txtSearch = '';
        setTimeout(() => this.statusSize = this.small, 500);
    }

    openChat() {
        this.intercom.displayMessenger();
    }

    emitFocusEvent() {}

    emitBlurEvent() {}

    hideSearchIcon(clearInput?: boolean) {
        this.eventSearch.emit(this.txtSearch);
    }
}
