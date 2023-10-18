import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {HistoricoCreditoPage} from './historico-credito.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {CompartidoGeneralModule} from 'src/app/modules/compartido/compartido-general.module';

const routes: Routes = [
    {
        path: '',
        component: HistoricoCreditoPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CompartidoModule,
        CompartidoGeneralModule,
        RouterModule.forChild(routes),
    ],
    declarations: [HistoricoCreditoPage]
})
export class HistoricoCreditoPageModule {
}
