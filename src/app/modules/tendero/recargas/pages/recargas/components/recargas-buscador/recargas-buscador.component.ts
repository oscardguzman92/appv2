import {Component, OnInit, Output, EventEmitter, Input, ViewChild} from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
    selector: 'app-recargas-buscador',
    templateUrl: './general-buscador.component.html',
    styleUrls: ['./recargas-buscador.component.scss'],
})
export class RecargasBuscadorComponent implements OnInit {
    @Output() search: EventEmitter<string> = new EventEmitter<string>();
    @ViewChild('search') searchElement;
    public small = false;
    public statusSize = true;
    public txtSearch = '';
    public txtSearchTemp = '';
    public showContact: boolean;
    public inputExpand: boolean;
    public activeKeyUp: boolean;

    constructor(private keyboard: Keyboard) {
        this.inputExpand = false;
        this.activeKeyUp = true;
        this.small = false;
    }

    ngOnInit() {}

    showSearch() {
        this.searchElement.setFocus();
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

    hideSearchIcon(clearInput?: boolean) {}
}
