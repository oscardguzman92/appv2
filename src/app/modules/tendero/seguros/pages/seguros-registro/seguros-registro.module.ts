import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SegurosRegistroPage } from './seguros-registro.page';
import { CompartidoModule } from 'src/app/modules/tendero/compartido/compartido.module';
import { CompartidoGeneralModule } from '../../../../compartido/compartido-general.module';
import { CompartidoSegurosModule } from '../../compartido/compartido-seguros.module';

const routes: Routes = [
  {
    path: '',
    component: SegurosRegistroPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    CompartidoModule,
    CompartidoGeneralModule,
    CompartidoSegurosModule
  ],
  declarations: [SegurosRegistroPage]
})
export class SegurosRegistroPageModule {}
