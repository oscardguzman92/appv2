import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CompartidoCabeceraComponent} from './components/compartido-cabecera/compartido-cabecera.component';
import {CompartidoMenuTenderoComponent} from './components/compartido-menu-tendero/compartido-menu-tendero.component';
import {
    CompartidoProductosDestacadosComponent
} from './components/compartido-productos-destacados/compartido-productos-destacados.component';
import {CompartidoCabeceraSinLoginComponent} from './components/compartido-cabecera-sin-login/compartido-cabecera-sin-login.component';
import {CompartidoSeleccionTiendaComponent} from './components/compartido-seleccion-tienda/compartido-seleccion-tienda.component';
import {IonicModule} from '@ionic/angular';
import { GeneralCarritoComprasComponent } from '../../compartido/general/components/general-carrito-compras/general-carrito-compras.component';

@NgModule({
    declarations: [
        CompartidoCabeceraComponent,
        CompartidoMenuTenderoComponent,
        CompartidoProductosDestacadosComponent,
        CompartidoCabeceraSinLoginComponent,
        CompartidoSeleccionTiendaComponent
    ],
    imports: [
        CommonModule,
        IonicModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        CompartidoCabeceraComponent,
        CompartidoMenuTenderoComponent,
        CompartidoProductosDestacadosComponent,
        CompartidoCabeceraSinLoginComponent,
        CompartidoSeleccionTiendaComponent
    ],
    entryComponents: [
        CompartidoSeleccionTiendaComponent,
        GeneralCarritoComprasComponent
    ]
})
export class CompartidoModule {
}
