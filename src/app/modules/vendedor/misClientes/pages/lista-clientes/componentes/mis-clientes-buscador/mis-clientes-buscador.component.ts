import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
    selector: 'app-mis-clientes-buscador',
    templateUrl: '../../../../../../compartido/general/components/general-buscador/general-buscador.component.html',
    styleUrls: ['./mis-clientes-buscador.component.scss'],
})
export class MisClientesBuscadorComponent implements OnInit {
    public small = false;
    public statusSize = true;
    public txtSearch = '';
    public txtSearchTemp = '';
    public showContact: boolean;
    @Output() search: EventEmitter<string> = new EventEmitter<string>();
    public inputExpand: boolean = true;
    public activeKeyUp:boolean = true;
    public searchProductos: Array<any>;

    constructor(private keyboard: Keyboard) {
    }

    ngOnInit() {
    }

    showSearch() {
        this.small = false;
        this.txtSearch = this.txtSearchTemp;
        this.statusSize = this.small;
    }

    hideSearch(clearInput?: boolean) {
        this.keyboard.hide();
        this.small = false;
        this.txtSearchTemp = (clearInput) ? '' : this.txtSearch;
        this.txtSearch = '';
        setTimeout(() => this.statusSize = this.small, 500);
    }

    keyup(e) {
        this.search.emit(e.target.value);
    }

    emitFocusEvent() {}

    emitBlurEvent() { }
    
    hideSearchIcon(e) {
        this.search.emit(this.txtSearch);
    }
}
