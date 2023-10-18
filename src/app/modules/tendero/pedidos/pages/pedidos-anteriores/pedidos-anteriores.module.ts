import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {PedidosAnterioresPage} from './pedidos-anteriores.page';
import {PedidosPedidoAnteriorComponent} from './components/pedidos-pedido-anterior/pedidos-pedido-anterior.component';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import {StoreModule} from '@ngrx/store';
import {previousOrdersReducer} from './store/previousOrders.reducer';
import {GeneralCarritoComprasComponent} from '../../../../compartido/general/components/general-carrito-compras/general-carrito-compras.component';

const routes: Routes = [
    {
        path: '',
        component: PedidosAnterioresPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoGeneralModule,
        StoreModule.forFeature('previousOrders', previousOrdersReducer)
    ],
    declarations: [
        PedidosAnterioresPage,
        PedidosPedidoAnteriorComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [GeneralCarritoComprasComponent]
})
export class PedidosAnterioresPageModule {
}
