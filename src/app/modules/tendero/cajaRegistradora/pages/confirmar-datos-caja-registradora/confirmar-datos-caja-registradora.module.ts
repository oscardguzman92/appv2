import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ConfirmarDatosCajaRegistradoraPage } from './confirmar-datos-caja-registradora.page';
import { CompartidoModule } from '../../../compartido/compartido.module';
import { CompartidoGeneralModule } from '../../../../compartido/compartido-general.module';
import { CompartidoCajaRegistradoraModule } from '../../compartido/compartido-caja-registradora.module';

const routes: Routes = [
  {
    path: '',
    component: ConfirmarDatosCajaRegistradoraPage
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
  declarations: [ConfirmarDatosCajaRegistradoraPage]
})
export class ConfirmarDatosCajaRegistradoraPageModule {}
