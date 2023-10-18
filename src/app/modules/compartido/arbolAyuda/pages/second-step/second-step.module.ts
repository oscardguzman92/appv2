import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SecondStepPage } from './second-step.page';
import { CompartidoGeneralModule } from '../../../../compartido/compartido-general.module';
import { CompartidoArbolAyudaModule } from '../../compartido/compartido-arbol-ayuda.module';
import { CompartidoModule } from '../../../../tendero/compartido/compartido.module';

const routes: Routes = [
  {
    path: '',
    component: SecondStepPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    CompartidoGeneralModule,
    CompartidoArbolAyudaModule,
    CompartidoModule
  ],
  declarations: [SecondStepPage]
})
export class SecondStepPageModule {}
