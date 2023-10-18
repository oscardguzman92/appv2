import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';
import { CompartidoModule } from '../../../compartido/compartido.module';
import { IonicModule } from '@ionic/angular';

import { ListaPedidosPage } from './lista-pedidos.page';
import {VirtualScrollerModule} from 'ngx-virtual-scroller';

const routes: Routes = [
  {
    path: '',
    component: ListaPedidosPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CompartidoModule,
        CompartidoGeneralModule,
        RouterModule.forChild(routes),
        VirtualScrollerModule
    ],
  declarations: [ListaPedidosPage]
})
export class ListaPedidosPageModule {}
