import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DetalleVentaCajaRegistradoraPage } from './detalle-venta-caja-registradora.page';
import { CompartidoModule } from '../../../compartido/compartido.module';
import { CompartidoGeneralModule } from '../../../../compartido/compartido-general.module';
import { CompartidoCajaRegistradoraModule } from '../../compartido/compartido-caja-registradora.module';

const routes: Routes = [
  {
    path: '',
    component: DetalleVentaCajaRegistradoraPage
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
    CompartidoCajaRegistradoraModule
  ],
  declarations: [DetalleVentaCajaRegistradoraPage]
})
export class DetalleVentaCajaRegistradoraPageModule {}
