import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SegurosHomePage } from './seguros-home.page';

import { CompartidoModule } from 'src/app/modules/tendero/compartido/compartido.module';
import { CompartidoGeneralModule } from '../../../../compartido/compartido-general.module';
import { CompartidoSegurosModule } from '../../compartido/compartido-seguros.module';
import {RecargasModule} from '../../../recargas/recargas.module';

const routes: Routes = [
  {
    path: '',
    component: SegurosHomePage
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
    CompartidoSegurosModule,
    RecargasModule
  ],
  declarations: [SegurosHomePage]
})
export class SegurosHomePageModule {}
