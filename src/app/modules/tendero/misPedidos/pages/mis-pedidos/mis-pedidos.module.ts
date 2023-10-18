import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {MisPedidosPage} from './mis-pedidos.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {StoreModule} from '@ngrx/store';
import {myOrdersReducer} from '../../store/myOrders/myOrders.reducer';
import {EffectsModule} from '@ngrx/effects';
import {MyOrdersEffect} from '../../store/myOrders/myOrders.effect';
import {MotivosReducer} from '../../store/motivosCalificacion/motivosCalificacion.reducer';
import {MotivosCalificacionEffect} from '../../store/motivosCalificacion/motivosCalificacion.effect';
import {
    CompartidoSeleccionTiendaComponent
} from '../../../compartido/components/compartido-seleccion-tienda/compartido-seleccion-tienda.component';
import {MisPedidosCalificaComponent} from './components/mis-pedidos-califica/mis-pedidos-califica.component';
import {MisPedidosEstrellasComponent} from './components/mis-pedidos-estrellas/mis-pedidos-estrellas.component';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';
import { MisPedidosDetalleComponent } from './components/mis-pedidos-detalle/mis-pedidos-detalle.component';
import { GeneralCarritoComprasComponent } from 'src/app/modules/compartido/general/components/general-carrito-compras/general-carrito-compras.component';
const routes: Routes = [
    {
        path: '',
        component: MisPedidosPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        StoreModule.forFeature('myOrders', myOrdersReducer),
        StoreModule.forFeature('motivosCalificacion', MotivosReducer),
        //EffectsModule.forFeature([MyOrdersEffect]),
        CompartidoModule,
        CompartidoGeneralModule
    ],
    declarations: [MisPedidosPage, MisPedidosCalificaComponent, MisPedidosEstrellasComponent],
    entryComponents: [
        CompartidoSeleccionTiendaComponent, 
        MisPedidosDetalleComponent, 
        MisPedidosCalificaComponent,
        GeneralCarritoComprasComponent
    ]
})
export class MisPedidosPageModule {
}
