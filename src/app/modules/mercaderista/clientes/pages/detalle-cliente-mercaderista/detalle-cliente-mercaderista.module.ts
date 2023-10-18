import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DetalleClienteMercaderistaPage } from './detalle-cliente-mercaderista.page';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';
import { CompartidoModule } from 'src/app/modules/vendedor/compartido/compartido.module';
//import { MisClientesMapaComponent } from 'src/app/modules/vendedor/misClientes/pages/detalle-cliente/componentes/mis-clientes-mapa/mis-clientes-mapa.component';

const routes: Routes = [
  {
    path: '',
    component: DetalleClienteMercaderistaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    CompartidoGeneralModule,
    CompartidoModule,
  ],
  declarations: [
    DetalleClienteMercaderistaPage,
    //MisClientesMapaComponent
  ],
})
export class DetalleClienteMercaderistaPageModule {}
