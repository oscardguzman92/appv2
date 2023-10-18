import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CompartidoCabeceraComponent} from './components/compartido-cabecera/compartido-cabecera.component';
import {CompartidoMenuVendedorComponent} from './components/compartido-menu-vendedor/compartido-menu-vendedor.component';
import {CompartidoFiltrosComponent} from './components/compartido-filtros/compartido-filtros.component';
import {
    MisClientesDatosClienteComponent
} from '../misClientes/pages/detalle-cliente/componentes/mis-clientes-datos-cliente/mis-clientes-datos-cliente.component';
import {IonicModule} from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CapturaUbicacionPage} from '../actualizarDatosCliente/components/captura-ubicacion/captura-ubicacion.page';
import {MisClientesCapturaUbicacionComponent} from '../misClientes/pages/detalle-cliente/componentes/mis-clientes-captura-ubicacion/mis-clientes-captura-ubicacion.component';
import { ModalPedidoEnConflictoComponent } from './components/modal-pedido-en-conflicto/modal-pedido-en-conflicto.component';
import {ModalPedidosEnviadoComponent} from './components/modal-pedidos-enviado/modal-pedidos-enviado.component';


@NgModule({
    declarations: [
        CompartidoCabeceraComponent,
        CompartidoMenuVendedorComponent,
        CompartidoFiltrosComponent,
        MisClientesDatosClienteComponent,
        MisClientesCapturaUbicacionComponent,
        CapturaUbicacionPage,
        ModalPedidoEnConflictoComponent,
        ModalPedidosEnviadoComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        ReactiveFormsModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        CompartidoCabeceraComponent,
        CompartidoMenuVendedorComponent,
        MisClientesDatosClienteComponent,
        MisClientesCapturaUbicacionComponent,
        CapturaUbicacionPage,
        ModalPedidoEnConflictoComponent,
    ],
    entryComponents: [MisClientesCapturaUbicacionComponent,ModalPedidoEnConflictoComponent, ModalPedidosEnviadoComponent]
})
export class CompartidoModule {
}
