import { GeneralProductoDetalleModalComponent } from './general/components/general-producto-detalle-modal/general-producto-detalle-modal.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {PedidosBuscadorComponent} from './pedidos/components/pedidos-buscador/pedidos-buscador.component';
import {PedidosCabeceraComponent} from './pedidos/components/pedidos-cabecera/pedidos-cabecera.component';
import {GeneralProductoComponent} from './general/components/general-producto/general-producto.component';
import {PedidosProductosComponent} from './pedidos/components/pedidos-productos/pedidos-productos.component';
import {GeneralCarritoComprasComponent} from './general/components/general-carrito-compras/general-carrito-compras.component';
import {GeneralOfertasComponent} from './general/components/general-ofertas/general-ofertas.component';
import {
    GeneralProductosCarritoComprasComponent
} from './general/components/general-productos-carrito-compras/general-productos-carrito-compras.component';
import {GeneralMenuComponent} from './general/components/general-menu/general-menu.component';
import {GeneralCodigoSmsComponent} from './general/components/general-codigo-sms/general-codigo-sms.component';

import {IonicModule} from '@ionic/angular';
import {CompartidoMenuTenderoComponent} from '../tendero/compartido/components/compartido-menu-tendero/compartido-menu-tendero.component';
import {StoreModule} from '@ngrx/store';
import {menuReducer} from './general/store/reducers/menu.reducer';
import {CompartidoModule} from '../tendero/compartido/compartido.module';
import {GeneralErrorComponent} from './general/components/general-error/general-error.component';
import {GeneralPedidosFavoritosComponent} from './general/components/general-pedidos-favoritos/general-pedidos-favoritos.component';
import {
    CompartidoMenuVendedorComponent
} from '../vendedor/compartido/components/compartido-menu-vendedor/compartido-menu-vendedor.component';
import {CompartidoModule as CompartidoVendedorModule} from '../vendedor/compartido/compartido.module';
import {CompartidoModule as CompartidoMercaderistaModule} from '../mercaderista/compartido/compartido.module';
import {CompartidoModule as CompartidoSuperVendedorModule} from '../super-vendedor/compartido/compartido.module';
import {CompartidoModule as CompartidoTransportadorModules} from '../transportador/compartido/compartido.module';
import {GeneralLoadingComponent} from './general/components/general-loading/general-loading.component';
import {RegistroCapturaUbicacionComponent} from '../tendero/registro/pages/registro/components/registro-captura-ubicacion/registro-captura-ubicacion.component';
import {RegistroResumenCapturaDatosComponent} from '../tendero/registro/pages/registro/components/registro-resumen-captura-datos/registro-resumen-captura-datos.component';
import {AddHoursDatePipe} from '../../pipes/addHoursDate/add-hours-date.pipe';
import { LoadImgDirective } from 'src/app/directives/loadImg/load-img.directive';
import { DeleteHourDatePipe } from 'src/app/pipes/DeleteHourDate/delete-hour-date.pipe';
import { loginReducer } from './inicio/store/login.reducer';
import {GeneralSuccessComponent} from './general/components/general-success/general-success.component';
import {HistorialAsignacionesPipe} from '../../pipes/precioNuevo/historial-asignaciones.pipe';
import {SafeHtmlPipe} from '../../pipes/safeHtmlPipe/safe-html.pipe';
import {
    MisPedidosDetalleComponent} from '../tendero/misPedidos/pages/mis-pedidos/components/mis-pedidos-detalle/mis-pedidos-detalle.component';
import { DatePickerModule } from 'ionic4-date-picker';
import {
    GeneralProductosDestacadosComponent} from './general/components/general-productos-destacados/general-productos-destacados.component';
import {GeneralBotonBuscadorCodigoBarrasComponent} from './general/components/general-boton-buscador-codigo-barras/general-boton-buscador-codigo-barras.component';
import {ImgLoadingLocalOrServerDirective} from '../../directives/imgLoadingLocalOrServer/img-loading-local-or-server.directive';
import {VirtualScrollerModule} from 'ngx-virtual-scroller';
import { CompartidoMenuMercaderistaComponent } from '../mercaderista/compartido/components/compartido-menu-mercaderista/compartido-menu-mercaderista.component';
import { ComunidadTenderosPostEncuestaComponent } from './comunidadTenderos/pages/comunidad-tenderos/components/comunidad-tenderos-post-encuesta/comunidad-tenderos-post-encuesta.component';
import { CompartidoMenuSuperVendedorComponent } from '../super-vendedor/compartido/components/compartido-menu-super-vendedor/compartido-menu-super-vendedor.component';
import { MisClientesMapaComponent } from '../vendedor/misClientes/pages/detalle-cliente/componentes/mis-clientes-mapa/mis-clientes-mapa.component';
import {
    MisClientesBuscadorComponent
} from '../vendedor/misClientes/pages/lista-clientes/componentes/mis-clientes-buscador/mis-clientes-buscador.component';
import {
    MisClientesFiltroComponent
} from '../vendedor/misClientes/pages/lista-clientes/componentes/mis-clientes-filtro/mis-clientes-filtro.component';
import {
    GeneralModalInformativaComponent
} from './general/components/general-modal-informativa/general-modal-informativa/general-modal-informativa.component';
import {CompartidoMenuTransportadorComponent} from '../transportador/compartido/components/compartido-menu-transportador/compartido-menu-transportador.component';
import { GeneralBotonAdicionalComponent } from './general/components/general-boton-adicional/general-boton-adicional.component';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
    declarations: [
        PedidosBuscadorComponent,
        PedidosCabeceraComponent,
        PedidosProductosComponent,
        GeneralProductoComponent,
        GeneralCarritoComprasComponent,
        GeneralOfertasComponent,
        GeneralBotonAdicionalComponent,
        GeneralProductosCarritoComprasComponent,
        GeneralMenuComponent,
        GeneralCodigoSmsComponent,
        GeneralErrorComponent,
        GeneralPedidosFavoritosComponent,
        GeneralSuccessComponent,
        GeneralLoadingComponent,
        RegistroCapturaUbicacionComponent,
        RegistroResumenCapturaDatosComponent,
        AddHoursDatePipe,
        LoadImgDirective,
        DeleteHourDatePipe,
        HistorialAsignacionesPipe,
        SafeHtmlPipe,
        MisPedidosDetalleComponent,
        GeneralProductosDestacadosComponent,
        GeneralBotonBuscadorCodigoBarrasComponent,
        ImgLoadingLocalOrServerDirective,
        ComunidadTenderosPostEncuestaComponent,
        MisClientesMapaComponent,
        MisClientesBuscadorComponent,
        MisClientesFiltroComponent,
        GeneralModalInformativaComponent,
        GeneralProductoDetalleModalComponent,
    ],
    imports: [
        CommonModule,
        IonicModule.forRoot(),
        StoreModule.forFeature('menu', menuReducer),
        StoreModule.forFeature('login', loginReducer),
        CompartidoModule,
        CompartidoVendedorModule,
        CompartidoMercaderistaModule,
        CompartidoSuperVendedorModule,
        FormsModule,
        ReactiveFormsModule,
        DatePickerModule,
        VirtualScrollerModule,
        CompartidoTransportadorModules,
        SignaturePadModule,
    ],
    exports: [
        PedidosBuscadorComponent,
        PedidosCabeceraComponent,
        PedidosProductosComponent,
        GeneralProductoComponent,
        GeneralCarritoComprasComponent,
        GeneralOfertasComponent,
        GeneralBotonAdicionalComponent,
        GeneralMenuComponent,
        GeneralCodigoSmsComponent,
        GeneralErrorComponent,
        GeneralPedidosFavoritosComponent,
        GeneralLoadingComponent,
        RegistroCapturaUbicacionComponent,
        RegistroResumenCapturaDatosComponent,
        AddHoursDatePipe,
        DeleteHourDatePipe,
        GeneralSuccessComponent,
        HistorialAsignacionesPipe,
        SafeHtmlPipe,
        MisPedidosDetalleComponent,
        GeneralProductosDestacadosComponent,
        GeneralBotonBuscadorCodigoBarrasComponent,
        ImgLoadingLocalOrServerDirective,
        ComunidadTenderosPostEncuestaComponent,
        MisClientesMapaComponent,
        MisClientesBuscadorComponent,
        MisClientesFiltroComponent,
        GeneralModalInformativaComponent,
        GeneralProductoDetalleModalComponent,
    ],
    entryComponents: [
        CompartidoMenuTenderoComponent,
        CompartidoMenuVendedorComponent,
        CompartidoMenuMercaderistaComponent,
        CompartidoMenuSuperVendedorComponent,
        GeneralProductosDestacadosComponent,
        GeneralModalInformativaComponent,
        GeneralProductoDetalleModalComponent,
        CompartidoMenuTransportadorComponent
    ]
})
export class CompartidoGeneralModule {
}
