import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { VentasCajaRegistradoraPage } from './ventas-caja-registradora.page';
import { CompartidoModule } from '../../../compartido/compartido.module';
import { CompartidoGeneralModule } from '../../../../compartido/compartido-general.module';
import { CompartidoCajaRegistradoraModule } from '../../compartido/compartido-caja-registradora.module';

const routes: Routes = [
  {
    path: '',
    component: VentasCajaRegistradoraPage
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
  declarations: [VentasCajaRegistradoraPage],

})
export class VentasCajaRegistradoraPageModule {}
