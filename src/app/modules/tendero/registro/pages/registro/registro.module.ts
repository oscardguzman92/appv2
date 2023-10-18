import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {RegistroPage} from './registro.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import {RegistroCapturaUbicacionComponent} from './components/registro-captura-ubicacion/registro-captura-ubicacion.component';
import {StoreModule} from '@ngrx/store';
import {registerReducer} from '../../store/registro.reducer';
import {EffectsModule} from '@ngrx/effects';
import {RegisterEffect} from '../../store/registro.effect';
import {RegistroResumenCapturaDatosComponent} from './components/registro-resumen-captura-datos/registro-resumen-captura-datos.component';

const routes: Routes = [
    {
        path: '',
        component: RegistroPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        CompartidoGeneralModule,
        ReactiveFormsModule
    ],
    declarations: [
        RegistroPage
    ],
    entryComponents: [
        RegistroCapturaUbicacionComponent,
        RegistroResumenCapturaDatosComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegistroPageModule {
}
