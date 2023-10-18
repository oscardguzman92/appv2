import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {MisVentasPage} from './mis-ventas.page';
import {StoreModule} from '@ngrx/store';
import {mySalesReducer} from './store/mySales.reducer';
import {EffectsModule} from '@ngrx/effects';
import {MySalesEffect} from './store/mySales.effect';
import {StateMySalesPipe} from '../../../../../pipes/stateMySales/state-my-sales.pipe';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import {CalendarComponent} from './components/calendar/calendar.component';
import { DatePickerModule } from 'ionic4-date-picker';
import {MisVentasConsolidadoComponent} from './components/mis-ventas-consolidado/mis-ventas-consolidado.component';
import {
    MisPedidosDetalleComponent
} from '../../../../tendero/misPedidos/pages/mis-pedidos/components/mis-pedidos-detalle/mis-pedidos-detalle.component';

const routes: Routes = [
    {
        path: '',
        component: MisVentasPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        StoreModule.forFeature('mySales', mySalesReducer),
        EffectsModule.forFeature([MySalesEffect]),
        CompartidoGeneralModule,
        DatePickerModule
    ],
    declarations: [MisVentasPage, StateMySalesPipe, CalendarComponent, MisVentasConsolidadoComponent],
    entryComponents: [CalendarComponent, MisVentasConsolidadoComponent, MisPedidosDetalleComponent]
})
export class MisVentasPageModule {
}
