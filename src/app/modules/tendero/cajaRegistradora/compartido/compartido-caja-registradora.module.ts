import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuscadorComponent } from './components/buscador/buscador.component';
import { TarjetaProductoComponent } from './components/tarjeta-producto/tarjeta-producto.component';
import { PieDePaginaComponent } from './components/pie-de-pagina/pie-de-pagina.component';
import { InformacionDetalleComponent } from './components/informacion-detalle/informacion-detalle.component';
import { TarjetaCategoriaComponent } from './components/tarjeta-categoria/tarjeta-categoria.component';
import { CabeceraComponent } from './components/cabecera/cabecera.component';
import { ListaProductoComponent } from './components/lista-producto/lista-producto.component';
import { ListaVentaComponent } from './components/lista-venta/lista-venta.component';
import { ModalDetalleVentaComponent } from './components/modal-detalle-venta/modal-detalle-venta.component';
import { ModalFiltroVentasComponent } from './components/modal-filtro-ventas/modal-filtro-ventas.component';
import { TarjetaClienteComponent } from './components/tarjeta-cliente/tarjeta-cliente.component';
import { PostalProductoComponent } from './components/postal-producto/postal-producto.component';
import { AutoCompletarComponent } from './components/auto-completar/auto-completar.component';
import { AutoCompleteModule } from 'ionic4-auto-complete';

@NgModule({
    declarations: [
        BuscadorComponent,
        TarjetaProductoComponent,
        PieDePaginaComponent,
        InformacionDetalleComponent,
        TarjetaCategoriaComponent,
        CabeceraComponent,
        ListaProductoComponent,
        ListaVentaComponent,
        ModalDetalleVentaComponent,
        ModalFiltroVentasComponent,
        TarjetaClienteComponent,
        PostalProductoComponent,
        AutoCompletarComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        AutoCompleteModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        BuscadorComponent,
        TarjetaProductoComponent,
        PieDePaginaComponent,
        InformacionDetalleComponent,
        TarjetaCategoriaComponent,
        CabeceraComponent,
        ListaProductoComponent,
        ListaVentaComponent,
        ModalDetalleVentaComponent,
        ModalFiltroVentasComponent,
        TarjetaClienteComponent,
        PostalProductoComponent,
        AutoCompletarComponent
    ],
    entryComponents: [
        BuscadorComponent,
        TarjetaProductoComponent,
        PieDePaginaComponent,
        InformacionDetalleComponent,
        TarjetaCategoriaComponent,
        CabeceraComponent,
        ListaProductoComponent,
        ListaVentaComponent,
        ModalDetalleVentaComponent,
        ModalFiltroVentasComponent,
        TarjetaClienteComponent,
        PostalProductoComponent,
        AutoCompletarComponent
    ]
})
export class CompartidoCajaRegistradoraModule {
}
