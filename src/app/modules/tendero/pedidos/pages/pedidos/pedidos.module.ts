import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {PedidosPage} from './pedidos.page';
import {PedidosCompaniasComponent} from './components/pedidos-companias/pedidos-companias.component';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {
    GeneralCarritoComprasComponent
} from '../../../../compartido/general/components/general-carrito-compras/general-carrito-compras.component';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import {StoreModule} from '@ngrx/store';
import {companiesReducer} from './store/companies.reducer';
import {EffectsModule} from '@ngrx/effects';
import {CompaniesEffect} from './store/companies.effect';
import {PuntosEffect} from '../../../puntos/pages/puntos/store/puntos.effect';

const routes: Routes = [
    {
        path: '',
        component: PedidosPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        CompartidoGeneralModule,
        StoreModule.forFeature('companies', companiesReducer),
        EffectsModule.forFeature([CompaniesEffect, PuntosEffect])
    ],
    declarations: [
        PedidosPage,
        PedidosCompaniasComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [GeneralCarritoComprasComponent]
})
export class PedidosPageModule {
}
