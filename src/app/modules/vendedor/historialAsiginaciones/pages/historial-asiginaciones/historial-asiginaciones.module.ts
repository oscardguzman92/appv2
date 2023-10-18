import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {HistorialAsiginacionesPage} from './historial-asiginaciones.page';
import {HistorialAsiginacionesEgresosComponent} from './components/historial-asiginaciones-egresos/historial-asiginaciones-egresos.component';
import {HistorialAsiginacionesIngresosComponent} from './components/historial-asiginaciones-ingresos/historial-asiginaciones-ingresos.component';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {StoreModule} from '@ngrx/store';
import {assignReducer} from '../../../compartido/store/assign/assign.reducer';
import {EffectsModule} from '@ngrx/effects';
import {AssignEffect} from '../../../compartido/store/assign/assign.effect';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';

const routes: Routes = [
    {
        path: '',
        component: HistorialAsiginacionesPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        StoreModule.forFeature('assign', assignReducer),
        EffectsModule.forFeature([AssignEffect]),
        CompartidoGeneralModule
    ],
    declarations: [HistorialAsiginacionesPage, HistorialAsiginacionesEgresosComponent,
        HistorialAsiginacionesIngresosComponent],

})
export class HistorialAsiginacionesPageModule {
}
