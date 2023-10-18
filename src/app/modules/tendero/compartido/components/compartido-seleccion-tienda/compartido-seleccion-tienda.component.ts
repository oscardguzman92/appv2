import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Shop} from '../../../../../models/Shop';

@Component({
    selector: 'app-compartido-seleccion-tienda',
    templateUrl: './compartido-seleccion-tienda.component.html',
    styleUrls: ['./compartido-seleccion-tienda.component.scss'],
})
export class CompartidoSeleccionTiendaComponent implements OnInit {
    @Input() shops: Shop[];


    constructor(private navigation: NavigationHelper, private modalController: ModalController) {
    }

    ngOnInit() {
    }

    goToSetOrder(shop: Shop) {
        shop.selectedShop();
        this.modalController.dismiss({
            'shop': shop
        });
    }

    getDistribuidoresCodigo(shop: Shop) {
        let distTemp = [];
        let dists = [];
        shop.tiendas_distribuidores.forEach(txd => {
            if (distTemp.indexOf(txd.id) === -1){
                dists.push(txd);
                distTemp.push(txd.id)
            }
        });
        return dists;
    }
}
