import {Component, OnInit, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {TypeSegments} from '../../../../../enums/typeSegments.enum';

@Component({
    selector: 'app-pedidos-filtro',
    templateUrl: './pedidos-filtro.component.html',
    styleUrls: ['./pedidos-filtro.component.scss'],
})
export class PedidosFiltroComponent implements OnInit {
    @Input() filter: any;
    typeSegments: any = TypeSegments;

    constructor(private modalController: ModalController) {
    }

    ngOnInit() {
        //console.log(this.filter);
    }
    
    saveFilter() {
        //console.log(this.filter,"seleccionado");
        this.modalController.dismiss(this.filter);
    }

}
