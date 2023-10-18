import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ListaProductosOfflinePage } from './lista-productos-offline.page';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';

import {
  GeneralCarritoComprasComponent
} from '../../../../compartido/general/components/general-carrito-compras/general-carrito-compras.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

const routes: Routes = [
  {
    path: '',
    component: ListaProductosOfflinePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompartidoGeneralModule,
    RouterModule.forChild(routes),
    VirtualScrollerModule,
  ],
  declarations: [ListaProductosOfflinePage],
  entryComponents: [GeneralCarritoComprasComponent]
})
export class ListaProductosOfflinePageModule {}
