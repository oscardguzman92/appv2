import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
    selector: 'app-buscador',
    templateUrl: './buscador.component.html',
    styleUrls: ['./buscador.component.scss']
})
export class BuscadorComponent  {

    public searchValue: string;

    @Output() search: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        public router: Router,
        private keyboard: Keyboard
    ) {

    }

    hideSearch(e) {
        this.keyboard.hide();
        this.search.emit(e.target.value);
        this.searchValue = '';
    }

    searchIcon() {
        this.keyboard.hide();
        this.search.emit(this.searchValue);
        this.searchValue = '';
    }
}
