import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';

@Component({
    selector: 'app-compartido-cabecera-sin-login',
    templateUrl: './compartido-cabecera-sin-login.component.html',
    styleUrls: ['./compartido-cabecera-sin-login.component.scss'],
})
export class CompartidoCabeceraSinLoginComponent implements OnInit {

    @Input() mostrarBotonRegresar: boolean;
    @Input() showImage: boolean;
    @Output() onBack = new EventEmitter;

    constructor(private navigation: NavigationHelper) {
    }

    ngOnInit() {}

    justBack() {
        this.onBack.emit();
        this.navigation.justBack();
    }
}
