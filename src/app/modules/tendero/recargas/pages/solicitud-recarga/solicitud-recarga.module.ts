import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {SolicitudRecargaPage} from './solicitud-recarga.page';
import {CompartidoModule} from '../../../compartido/compartido.module';

const routes: Routes = [
    {
        path: '',
        component: SolicitudRecargaPage
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
    declarations: [SolicitudRecargaPage]
})
export class SolicitudRecargaPageModule {
}
