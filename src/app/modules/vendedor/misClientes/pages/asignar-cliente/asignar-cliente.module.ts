import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {AsignarClientePage} from './asignar-cliente.page';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {BarcodeScanner} from '@ionic-native/barcode-scanner/ngx';

const routes: Routes = [
    {
        path: '',
        component: AsignarClientePage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoGeneralModule,
        CompartidoModule,
        ReactiveFormsModule
    ],
    declarations: [
        AsignarClientePage
    ],
    providers: [BarcodeScanner]
})
export class AsignarClientePageModule {
}
