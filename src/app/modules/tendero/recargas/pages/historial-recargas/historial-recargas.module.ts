import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {HistorialRecargasPage} from './historial-recargas.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {RecargasEgresosComponent} from './components/recargas-egresos/recargas-egresos.component';
import {RecargasIngresosComponent} from './components/recargas-ingresos/recargas-ingresos.component';
import {RecargasModule} from '../../recargas.module';
import {EffectsModule} from '@ngrx/effects';
import {TopUpsEffect} from '../../store/topUps/topUps.effect';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';

const routes: Routes = [
    {
        path: '',
        component: HistorialRecargasPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        RecargasModule,
        EffectsModule.forFeature([TopUpsEffect]),
        CompartidoGeneralModule
    ],
    declarations: [
        HistorialRecargasPage,
        RecargasEgresosComponent,
        RecargasIngresosComponent
    ]
})
export class HistorialRecargasPageModule {
}
