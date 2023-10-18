import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';

import { IonicModule } from '@ionic/angular';

import { ClientesMercaderistaPage } from './clientes-mercaderista.page';
import { CompartidoModule } from 'src/app/modules/tendero/compartido/compartido.module';
import { CompartidoModule as CompartidoMercaderista} from '../../../compartido/compartido.module';
import { MisClientesFiltroComponent } from 'src/app/modules/vendedor/misClientes/pages/lista-clientes/componentes/mis-clientes-filtro/mis-clientes-filtro.component';

const routes: Routes = [
  {
    path: '',
    component: ClientesMercaderistaPage
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
    CompartidoMercaderista
  ],
  declarations: [ClientesMercaderistaPage],
  entryComponents: [MisClientesFiltroComponent]
})
export class ClientesMercaderistaPageModule {}
