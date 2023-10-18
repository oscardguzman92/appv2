import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NuevoProductoCajaRegistradoraPage } from './nuevo-producto-caja-registradora.page';
import { CompartidoModule } from '../../../compartido/compartido.module';
import { CompartidoGeneralModule } from '../../../../compartido/compartido-general.module';
import { CompartidoCajaRegistradoraModule } from '../../compartido/compartido-caja-registradora.module';

const routes: Routes = [
  {
    path: '',
    component: NuevoProductoCajaRegistradoraPage
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
    CompartidoCajaRegistradoraModule
  ],
  declarations: [NuevoProductoCajaRegistradoraPage]
})
export class NuevoProductoCajaRegistradoraPageModule {}
