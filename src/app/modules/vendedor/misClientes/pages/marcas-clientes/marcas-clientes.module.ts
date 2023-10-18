import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MarcasClientesPage } from './marcas-clientes.page';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';
import { CompartidoModule } from 'src/app/modules/tendero/compartido/compartido.module';
import { GeneralCarritoComprasComponent } from 'src/app/modules/compartido/general/components/general-carrito-compras/general-carrito-compras.component';

const routes: Routes = [
  {
    path: '',
    component: MarcasClientesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    CompartidoGeneralModule,
    CompartidoModule
  ],
  declarations: [MarcasClientesPage],
  entryComponents: [GeneralCarritoComprasComponent]
})
export class MarcasClientesPageModule {}
