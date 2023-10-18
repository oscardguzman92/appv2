import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import { SignaturePadModule } from 'angular2-signaturepad';

import {IonicModule} from '@ionic/angular';

import {CrearClientePage} from './crear-cliente.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {CrearClienteCapturaDatosComponent} from '../../components/crear-cliente-captura-datos/crear-cliente-captura-datos.component';
import {CrearClienteCapturaUbicacionComponent} from '../../components/crear-cliente-captura-ubicacion/crear-cliente-captura-ubicacion.component';

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
        ReactiveFormsModule,
        SignaturePadModule
    ],
    declarations: [
        CrearClientePage,
        CrearClienteCapturaDatosComponent,
        CrearClienteCapturaUbicacionComponent
    ],
    
    entryComponents: [CrearClienteCapturaDatosComponent, CrearClienteCapturaUbicacionComponent]
})
export class CrearClientePageModule {
}
