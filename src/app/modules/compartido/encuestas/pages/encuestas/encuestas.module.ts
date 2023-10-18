import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EncuestasPage } from './encuestas.page';
import {CompartidoModule} from '../../../../tendero/compartido/compartido.module';
import {CompartidoGeneralModule} from '../../../compartido-general.module';

const routes: Routes = [
  {
    path: '',
    component: EncuestasPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        CompartidoGeneralModule
    ],
  declarations: [EncuestasPage]
})
export class EncuestasPageModule {}
