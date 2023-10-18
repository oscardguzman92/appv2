import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';
import { CompartidoModule } from '../../../compartido/compartido.module';

import { IonicModule } from '@ionic/angular';

import { LiquidadorPage } from './liquidador.page';

const routes: Routes = [
  {
    path: '',
    component: LiquidadorPage
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
  declarations: [LiquidadorPage]
})
export class LiquidadorPageModule {}
