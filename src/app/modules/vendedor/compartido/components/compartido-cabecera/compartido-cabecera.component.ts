import {Component, OnInit, Input} from '@angular/core';
import {AppState} from '../../../../../store/app.reducer';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {ToggleMenu} from '../../../../compartido/general/store/actions/menu.actions';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Seller} from '../../../../../models/Seller';

@Component({
    selector: 'app-compartido-cabecera',
    templateUrl: './compartido-cabecera.component.html',
    styleUrls: ['./compartido-cabecera.component.scss'],
})
export class CompartidoCabeceraComponent implements OnInit {

    @Input() titulo: string;
    @Input() mostrarBotonAuxiliar: boolean;
    @Input() tituloBoton: string;
    @Input() showBackButton: boolean;
    @Input() isModal: boolean;
    @Input() user: Seller;

    constructor(
        private modal: ModalController,
        private store: Store<AppState>,
        private navigation: NavigationHelper
    ) {
    }

    ngOnInit() {
    }

    toggleMenu() {
        this.store.dispatch(new ToggleMenu());
    }

    justBack() {
        if (this.isModal) {
            this.closeModal();
        } else {
            this.navigation.justBack();
        }
    }

    closeModal() {
        this.modal.dismiss();
        this.toggleMenu();
    }
}
