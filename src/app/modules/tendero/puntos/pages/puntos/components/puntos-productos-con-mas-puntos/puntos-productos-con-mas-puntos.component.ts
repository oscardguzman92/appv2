import {Component, OnInit, ViewChild} from '@angular/core';
import {IonSlides} from '@ionic/angular';

@Component({
    selector: 'app-puntos-productos-con-mas-puntos',
    templateUrl: './puntos-productos-con-mas-puntos.component.html',
    styleUrls: ['./puntos-productos-con-mas-puntos.component.scss'],
})
export class PuntosProductosConMasPuntosComponent implements OnInit {
    @ViewChild('slides') slides: IonSlides;

    public slideOpts = {
        effect: 'flip',
        slidesPerView: 'auto',
        spaceBetween: 30,
        zoom: false

    };

    constructor() {
    }

    ngOnInit() {
    }

}
