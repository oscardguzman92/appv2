import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ListaClientesPage } from './lista-clientes.page';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';
import { CompartidoModule } from '../../../compartido/compartido.module';

const routes: Routes = [
  {
    path: '',
    component: ListaClientesPage
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
  declarations: [ListaClientesPage]
})
export class ListaClientesPageModule {}
