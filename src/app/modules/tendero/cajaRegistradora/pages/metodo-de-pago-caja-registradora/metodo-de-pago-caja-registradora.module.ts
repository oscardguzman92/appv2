import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MetodoDePagoCajaRegistradoraPage } from './metodo-de-pago-caja-registradora.page';
import { CompartidoModule } from '../../../compartido/compartido.module';
import { CompartidoGeneralModule } from '../../../../compartido/compartido-general.module';
import { CompartidoCajaRegistradoraModule } from '../../compartido/compartido-caja-registradora.module';

const routes: Routes = [
  {
    path: '',
    component: MetodoDePagoCajaRegistradoraPage
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
  declarations: [MetodoDePagoCajaRegistradoraPage]
})
export class MetodoDePagoCajaRegistradoraPageModule {}
