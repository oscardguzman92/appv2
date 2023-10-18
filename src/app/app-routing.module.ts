import {NgModule} from '@angular/core';
import {RouterModule, Routes, NoPreloading} from '@angular/router';
import {AuthGuard} from './guards/auth.guard';
import {AuthResolver} from './guards/auth.resolver';
import {OfflineResolver} from './guards/offline.resolver';
import {OfflineDynamicResolver} from './guards/offlineDynamic.resolver';

export const routes: Routes = [
    {path: 'home', loadChildren: './home/home.module#HomePageModule'},
    {
        path: 'registro',
        loadChildren:
            './modules/tendero/registro/pages/registro/registro.module#RegistroPageModule',
    },
    {
        path: 'inicio-tendero/:i',
        loadChildren:
            './modules/tendero/inicioTendero/pages/inicio-tendero/inicio-tendero.module#InicioTenderoPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'inicio-tendero',
        loadChildren:
            './modules/tendero/inicioTendero/pages/inicio-tendero/inicio-tendero.module#InicioTenderoPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'pedidos',
        loadChildren:
            './modules/tendero/pedidos/pages/pedidos/pedidos.module#PedidosPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'pedidos-anteriores',
        loadChildren:
            './modules/tendero/pedidos/pages/pedidos-anteriores/pedidos-anteriores.module#PedidosAnterioresPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'puntos',
        loadChildren:
            './modules/tendero/puntos/pages/puntos/puntos.module#PuntosPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'mis-pedidos',
        loadChildren:
            './modules/tendero/misPedidos/pages/mis-pedidos/mis-pedidos.module#MisPedidosPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'mis-mensajes',
        loadChildren:
            './modules/compartido/misMensajes/pages/mis-mensajes/mis-mensajes.module#MisMensajesPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'preguntas-frecuentes',
        loadChildren:
            './modules/compartido/preguntasFrecuentes/pages/preguntas-frecuentes/preguntas-frecuentes.module#PreguntasFrecuentesPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'comunidad-tenderos',
        loadChildren:
            './modules/compartido/comunidadTenderos/pages/comunidad-tenderos/comunidad-tenderos.module#ComunidadTenderosPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'recargas',
        loadChildren:
            './modules/tendero/recargas/pages/recargas/recargas.module#RecargasPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'realizar-recarga',
        loadChildren:
            './modules/tendero/recargas/pages/realizar-recarga/realizar-recarga.module#RealizarRecargaPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'compania',
        loadChildren:
            './modules/compartido/pedidos/pages/compania/compania.module#CompaniasPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'inicio',
        loadChildren:
            './modules/compartido/inicio/pages/inicio/inicio.module#InicioPageModule',
    },
    {
        path: 'validacion',
        loadChildren:
            './modules/compartido/inicio/pages/validacion/validacion.module#ValidacionPageModule',
    },
    {
        path: 'lista-clientes',
        loadChildren:
            './modules/vendedor/misClientes/pages/lista-clientes/lista-clientes.module#ListaClientesPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
            offline: OfflineResolver,
            offlineDynamic: OfflineDynamicResolver,
        },
    },
    {
        path: 'detalle-cliente',
        loadChildren:
            './modules/vendedor/misClientes/pages/detalle-cliente/detalle-cliente.module#DetalleClientePageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
            offlineDynamic: OfflineDynamicResolver,
        },
    },
    {
        path: 'historial-asiginaciones',
        loadChildren:
            './modules/vendedor/historialAsiginaciones/pages/historial-asiginaciones/historial-asiginaciones.module#HistorialAsiginacionesPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'mis-ventas',
        loadChildren:
            './modules/vendedor/reporteVentas/pages/mis-ventas/mis-ventas.module#MisVentasPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'mis-ventas-consolidado',
        loadChildren:
            './modules/vendedor/reporteVentas/pages/mis-ventas-consolidado/mis-ventas-consolidado.module#MisVentasConsolidadoPageModule',
    },
    {path: 'no-pedido', 
    loadChildren: './modules/vendedor/pedidos/pages/no-pedido/no-pedido.module#NoPedidoPageModule',
    canLoad: [AuthGuard],
    resolve: {
        user: AuthResolver,
        offlineDynamic: OfflineDynamicResolver
    }},
    {
        path: 'no-pedido',
        loadChildren:
            './modules/vendedor/pedidos/pages/no-pedido/no-pedido.module#NoPedidoPageModule',
    },
    {
        path: 'asignar-saldo',
        loadChildren:
            './modules/vendedor/pedidos/pages/asignar-saldo/asignar-saldo.module#AsignarSaldoPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'extra-ruta',
        loadChildren:
            './modules/compartido/extraRuta/pages/extra-ruta/extra-ruta.module#ExtraRutaPageModule',
    },
    {
        path: 'historial-recargas',
        loadChildren:
            './modules/tendero/recargas/pages/historial-recargas/historial-recargas.module#HistorialRecargasPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'solicitud-recarga',
        loadChildren:
            './modules/tendero/recargas/pages/solicitud-recarga/solicitud-recarga.module#SolicitudRecargaPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'indicadores',
        loadChildren:
            './modules/tendero/indicadores/pages/indicadores/indicadores.module#IndicadoresPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'editarPerfil',
        loadChildren:
            './modules/tendero/editarPerfil/pages/editar-perfil/editar-perfil.module#EditarPerfilPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'productos-destacados',
        loadChildren:
            './modules/compartido/general/pages/productos-destacados/productos-destacados.module#ProductosDestacadosPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'historial-puntos',
        loadChildren:
            './modules/tendero/puntos/pages/historial-puntos/historial-puntos.module#HistorialPuntosPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'asignar-cliente',
        loadChildren:
            './modules/vendedor/misClientes/pages/asignar-cliente/asignar-cliente.module#AsignarClientePageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'caja-registradora',
        loadChildren:
            './modules/tendero/cajaRegistradora/pages/caja-registradora/caja-registradora.module#CajaRegistradoraPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'buscar-caja-registradora',
        // tslint:disable-next-line: max-line-length
        loadChildren:
            './modules/tendero/cajaRegistradora/pages/buscar-caja-registradora/buscar-caja-registradora.module#BuscarCajaRegistradoraPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'confirmar-datos',
        // tslint:disable-next-line: max-line-length
        loadChildren:
            './modules/tendero/cajaRegistradora/pages/confirmar-datos-caja-registradora/confirmar-datos-caja-registradora.module#ConfirmarDatosCajaRegistradoraPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'metodo-de-pago',
        // tslint:disable-next-line: max-line-length
        loadChildren:
            './modules/tendero/cajaRegistradora/pages/metodo-de-pago-caja-registradora/metodo-de-pago-caja-registradora.module#MetodoDePagoCajaRegistradoraPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'ventas',
        // tslint:disable-next-line: max-line-length
        loadChildren:
            './modules/tendero/cajaRegistradora/pages/ventas-caja-registradora/ventas-caja-registradora.module#VentasCajaRegistradoraPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'detalle-venta',
        // tslint:disable-next-line: max-line-length
        loadChildren:
            './modules/tendero/cajaRegistradora/pages/detalle-venta-caja-registradora/detalle-venta-caja-registradora.module#DetalleVentaCajaRegistradoraPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'catalogo',
        // tslint:disable-next-line: max-line-length
        loadChildren:
            './modules/tendero/cajaRegistradora/pages/catalogo-caja-registradora/catalogo-caja-registradora.module#CatalogoCajaRegistradoraPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'nuevo-producto',
        // tslint:disable-next-line: max-line-length
        loadChildren:
            './modules/tendero/cajaRegistradora/pages/nuevo-producto-caja-registradora/nuevo-producto-caja-registradora.module#NuevoProductoCajaRegistradoraPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'seleccionar-categoria',
        // tslint:disable-next-line: max-line-length
        loadChildren:
            './modules/tendero/cajaRegistradora/pages/categoria-caja-registradora/categoria-caja-registradora.module#CategoriaCajaRegistradoraPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'cartera',
        loadChildren:
            './modules/compartido/cartera/pages/cartera/cartera.module#CarteraPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'actualiza-cliente',
        loadChildren:
            './modules/vendedor/misClientes/pages/actualiza-cliente/actualiza-cliente.module#ActualizaClientePageModule',
    },
    {
        path: 'lista-productos-offline',
        // tslint:disable-next-line: max-line-length
        loadChildren:
            './modules/vendedor/pedidos/pages/lista-productos-offline/lista-productos-offline.module#ListaProductosOfflinePageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
            offlineDynamic: OfflineDynamicResolver,
        },
    },
    {
        path: 'devoluciones',
        loadChildren:
            './modules/vendedor/pedidos/pages/devoluciones/devoluciones.module#DevolucionesPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'marcas-clientes',
        loadChildren:
            './modules/vendedor/misClientes/pages/marcas-clientes/marcas-clientes.module#MarcasClientesPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
            offlineDynamic: OfflineDynamicResolver,
        },
    },
    {
        path: 'crear-cliente',
        loadChildren:
            './modules/vendedor/crear-cliente/pages/crear-cliente/crear-cliente.module#CrearClientePageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'previo-busqueda',
        loadChildren:
            './modules/tendero/cajaRegistradora/pages/previo-busqueda/previo-busqueda.module#PrevioBusquedaPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'responder-encuesta',
        loadChildren:
            './modules/compartido/encuestas/pages/responder-encuesta/responder-encuesta.module#ResponderEncuestaPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'seguros-home',
        loadChildren:
            './modules/tendero/seguros/pages/seguros-home/seguros-home.module#SegurosHomePageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'actualizar-datos',
        loadChildren:
            './modules/vendedor/actualizarDatosCliente/pages/actualizar-datos/actualizar-datos.module#ActualizarDatosPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'seguros-registro',
        loadChildren:
            './modules/tendero/seguros/pages/seguros-registro/seguros-registro.module#SegurosRegistroPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'captura-ubicacion',
        loadChildren:
            './modules/vendedor/actualizarDatosCliente/components/captura-ubicacion/captura-ubicacion.module#CapturaUbicacionPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'inicio-super-vendedor',
        loadChildren:
            './modules/super-vendedor/inicioSuperVendedor/pages/inicio-super-vendedor/inicio-super-vendedor.module#InicioSuperVendedorPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'encuestas',
        loadChildren:
            './modules/compartido/encuestas/pages/encuestas/encuestas.module#EncuestasPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'first-step',
        loadChildren:
            './modules/compartido/arbolAyuda/pages/first-step/first-step.module#FirstStepPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'second-step',
        loadChildren:
            './modules/compartido/arbolAyuda/pages/second-step/second-step.module#SecondStepPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'mi-codigo',
        loadChildren:
            './modules/tendero/codigo/pages/mi-codigo/mi-codigo.module#MiCodigoPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'third-step',
        loadChildren:
            './modules/compartido/arbolAyuda/pages/third-step/third-step.module#ThirdStepPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'clientes-mercaderista',
        loadChildren:
            './modules/mercaderista/clientes/pages/clientes-mercaderista/clientes-mercaderista.module#ClientesMercaderistaPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'detalle-cliente-mercaderista',
        loadChildren:
            './modules/mercaderista/clientes/pages/detalle-cliente-mercaderista/detalle-cliente-mercaderista.module#DetalleClienteMercaderistaPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'puntos-mercaderista',
        loadChildren:
            './modules/mercaderista/puntos/pages/puntos-mercaderista/puntos-mercaderista.module#PuntosMercaderistaPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'crear-cliente-mercaderista',
        loadChildren:
            './modules/mercaderista/clientes/pages/crear-cliente/crear-cliente.module#CrearClientePageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'lista-creditos',
        loadChildren:
            './modules/tendero/creditos/pages/lista-creditos/lista-creditos.module#ListaCreditosPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'historico-credito',
        loadChildren:
            './modules/tendero/creditos/pages/historico-credito/historico-credito.module#HistoricoCreditoPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'lista-clientes-transportador',
        loadChildren: './modules/transportador/misClientes/pages/lista-clientes/lista-clientes.module#ListaClientesPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver
        }
    },
    {
        path: 'recorrido-transportador',
        loadChildren: './modules/transportador/misClientes/pages/recorrido-transportador/recorrido-transportador.module#RecorridoTransportadorPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver
        }
    },
    {
        path: 'lista-pedidos',
        loadChildren: './modules/transportador/pedidos/pages/lista-pedidos/lista-pedidos.module#ListaPedidosPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver
        }
    },
    {
        path: 'liquidador',
        loadChildren: './modules/transportador/pedidos/pages/liquidador/liquidador.module#LiquidadorPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver,
        },
    },
    {
        path: 'historial-novedades',
        loadChildren: './modules/transportador/novedades/pages/historial-novedades/historial-novedades.module#HistorialNovedadesPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver
        }
    },
    {   path: 'wysiwyg-banner',
        loadChildren: './modules/tendero/banner/pages/wysiwyg/wysiwyg.module#WysiwygPageModule',
        canLoad: [AuthGuard],
        resolve: {
            user: AuthResolver
        }
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: NoPreloading})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
