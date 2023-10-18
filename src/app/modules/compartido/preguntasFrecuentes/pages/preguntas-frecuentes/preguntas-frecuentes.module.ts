import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {PreguntasFrecuentesPage} from './preguntas-frecuentes.page';
import {PreguntasFrecuentesBuscadorComponent} from './components/preguntas-frecuentes-buscador/preguntas-frecuentes-buscador.component';
import { CompartidoModule } from '../../../../tendero/compartido/compartido.module';
import { StoreModule } from '@ngrx/store';
import { preguntasfrecuentesReducer } from '../../store/preguntas-frecuentes.reducer';
import { EffectsModule } from '@ngrx/effects';
import { PreguntasFrecuentesEffect } from '../../store/preguntas-frecuentes.effect';

const routes: Routes = [
    {
        path: '',
        component: PreguntasFrecuentesPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        EffectsModule.forRoot( [PreguntasFrecuentesEffect] ),
        StoreModule.forFeature('preguntas-frecuentes', preguntasfrecuentesReducer),
    ],
    declarations: [
        PreguntasFrecuentesPage,
        PreguntasFrecuentesBuscadorComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PreguntasFrecuentesPageModule {
}
