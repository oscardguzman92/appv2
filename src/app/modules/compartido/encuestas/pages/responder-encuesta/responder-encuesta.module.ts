import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ResponderEncuestaPage } from './responder-encuesta.page';
import { CompartidoGeneralModule } from '../../../compartido-general.module';
import { CompartidoModule } from 'src/app/modules/tendero/compartido/compartido.module';

const routes: Routes = [
  {
    path: '',
    component: ResponderEncuestaPage
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
    ReactiveFormsModule,
  ],
  declarations: [ResponderEncuestaPage]
})
export class ResponderEncuestaPageModule {}
