import {Component, OnInit, ViewChild} from '@angular/core';
import {IonSlides} from '@ionic/angular';

@Component({
    selector: 'app-general-productos-carrito-compras',
    templateUrl: './general-productos-carrito-compras.component.html',
    styleUrls: ['./general-productos-carrito-compras.component.scss'],
})
export class GeneralProductosCarritoComprasComponent implements OnInit {
    @ViewChild('slides') slides: IonSlides;

    public slideOpts = {
        effect: 'flip',
        slidesPerView: 'auto',
        spaceBetween: 10,
        zoom: false
    };

    constructor() {
    }

    ngOnInit() {
    }

}
