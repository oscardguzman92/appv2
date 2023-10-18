import {Component, Input, OnInit} from '@angular/core';
import {Seller} from '../../../../../models/Seller';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {ToggleMenu} from '../../../../compartido/general/store/actions/menu.actions';

@Component({
    selector: 'app-cabecera',
    templateUrl: './cabecera.component.html',
    styleUrls: ['./cabecera.component.scss'],
})
export class CabeceraComponent implements OnInit {

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
    ) {}

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
