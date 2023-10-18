import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HistorialNovedadesPage } from './historial-novedades.page';
import {CompartidoModule} from '../../../compartido/compartido.module';

const routes: Routes = [
  {
    path: '',
    component: HistorialNovedadesPage
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
  declarations: [HistorialNovedadesPage]
})
export class HistorialNovedadesPageModule {}
