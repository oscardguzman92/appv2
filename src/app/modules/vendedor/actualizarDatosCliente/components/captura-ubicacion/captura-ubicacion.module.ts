import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CapturaUbicacionPage} from './captura-ubicacion.page';
import {CompartidoModule} from '../../../compartido/compartido.module';

const routes: Routes = [
    {
        path: '',
        component: CapturaUbicacionPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule
    ],
})
export class CapturaUbicacionPageModule {
}
