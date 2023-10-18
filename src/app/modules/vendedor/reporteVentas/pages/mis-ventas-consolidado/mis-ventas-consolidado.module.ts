import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MisVentasConsolidadoPage } from './mis-ventas-consolidado.page';
import {CompartidoModule} from '../../../compartido/compartido.module';

const routes: Routes = [
  {
    path: '',
    component: MisVentasConsolidadoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompartidoModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MisVentasConsolidadoPage]
})
export class MisVentasConsolidadoPageModule {}
