import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CrearClientePage} from './crear-cliente.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {CrearClienteCapturaUbicacionComponent} from '../../components/crear-cliente-captura-ubicacion/crear-cliente-captura-ubicacion.component';
import {CrearClienteCapturaDatosComponent} from '../../components/crear-cliente-captura-datos/crear-cliente-captura-datos.component';

const routes: Routes = [
    {
        path: '',
        component: CrearClientePage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        ReactiveFormsModule
    ],
    declarations: [CrearClientePage, CrearClienteCapturaUbicacionComponent, CrearClienteCapturaDatosComponent],
    entryComponents: [CrearClienteCapturaUbicacionComponent]
})
export class CrearClientePageModule {
}
