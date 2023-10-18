import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {ListaCreditosPage} from './lista-creditos.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {CompartidoGeneralModule} from 'src/app/modules/compartido/compartido-general.module';
import {EffectsModule} from '@ngrx/effects';

const routes: Routes = [
    {
        path: '',
        component: ListaCreditosPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CompartidoModule,
        CompartidoGeneralModule,
        RouterModule.forChild(routes)

    ],
    declarations: [ListaCreditosPage]
})
export class ListaCreditosPageModule {
}
