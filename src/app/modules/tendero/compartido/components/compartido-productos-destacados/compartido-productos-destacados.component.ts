import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {IonSlides} from '@ionic/angular';

@Component({
    selector: 'app-compartido-productos-destacados',
    templateUrl: './compartido-productos-destacados.component.html',
    styleUrls: ['./compartido-productos-destacados.component.scss'],
})
export class CompartidoProductosDestacadosComponent implements OnInit {
    @ViewChild('slides') slides: IonSlides;
    @Input() products: any[];

    public slideOpts = {
        effect: 'flip',
        slidesPerView: 'auto',
        spaceBetween: 10,
        zoom: false
    };

    constructor() {
    }

    ngOnInit() {}

}
