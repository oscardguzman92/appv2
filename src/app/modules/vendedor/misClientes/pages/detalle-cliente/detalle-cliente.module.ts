import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {DetalleClientePage} from './detalle-cliente.page';
//import {MisClientesMapaComponent} from './componentes/mis-clientes-mapa/mis-clientes-mapa.component';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import {
    GeneralCarritoComprasComponent
} from '../../../../compartido/general/components/general-carrito-compras/general-carrito-compras.component';
import {
    MisClientesPedidosAnterioresComponent
} from './componentes/mis-clientes-pedidos-favoritos/mis-clientes-pedidos-anteriores.component';
import {CompartidoModule} from '../../../compartido/compartido.module';

const routes: Routes = [
    {
        path: '',
        component: DetalleClientePage
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
    declarations: [
        DetalleClientePage,
        //MisClientesMapaComponent,
        MisClientesPedidosAnterioresComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [GeneralCarritoComprasComponent]
})
export class DetalleClientePageModule {
}
