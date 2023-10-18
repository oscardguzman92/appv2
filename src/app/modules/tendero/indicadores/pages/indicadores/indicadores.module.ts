import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { IndicadoresPage } from './indicadores.page';
import { CompartidoModule } from '../../../compartido/compartido.module';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';

const routes: Routes = [
  {
    path: '',
    component: IndicadoresPage
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
  ],
  declarations: [IndicadoresPage]
})
export class IndicadoresPageModule {}
