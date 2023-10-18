import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {HistorialPuntosPage} from './historial-puntos.page';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {EffectsModule} from '@ngrx/effects';
import {PuntosEffect} from '../puntos/store/puntos.effect';

const routes: Routes = [
    {
        path: '',
        component: HistorialPuntosPage
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
        EffectsModule.forFeature([PuntosEffect])
    ],
    declarations: [HistorialPuntosPage]
})
export class HistorialPuntosPageModule {
}
