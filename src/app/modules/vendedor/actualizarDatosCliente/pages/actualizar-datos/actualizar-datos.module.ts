import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {ActualizarDatosPage} from './actualizar-datos.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {StoreModule} from '@ngrx/store';
import {editReducer} from '../../store/edit.reducer';
import {EffectsModule} from '@ngrx/effects';
import {EditEffect} from '../../store/edit.effect';
import {CapturaUbicacionPage} from '../../components/captura-ubicacion/captura-ubicacion.page';

const routes: Routes = [
    {
        path: '',
        component: ActualizarDatosPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        StoreModule.forFeature('update', editReducer),
        EffectsModule.forFeature([EditEffect]),
        ReactiveFormsModule
    ],
    declarations: [ActualizarDatosPage],
    entryComponents: [CapturaUbicacionPage]
})
export class ActualizarDatosPageModule {
}
