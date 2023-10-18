import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CompaniaPage} from './compania.page';
import {CompartidoGeneralModule} from '../../../compartido-general.module';
import {GeneralCarritoComprasComponent} from '../../../general/components/general-carrito-compras/general-carrito-compras.component';
import { EffectsModule } from '@ngrx/effects';
import { categoriesReducer, productsReducer } from '../../store/orders.reducer';
import { StoreModule } from '@ngrx/store';
import { OrdersEffect } from '../../store/orders.efects';
import { offersReducer } from '../../../general/store/reducers/offers.reducer';
import { OffersEffects } from '../../../general/store/effects/offers.effects';
import { PedidosFiltroComponent } from '../../components/pedidos-filtro/pedidos-filtro.component';

const routes: Routes = [
    {
        path: '',
        component: CompaniaPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoGeneralModule,
        StoreModule.forFeature('categories', categoriesReducer),
        StoreModule.forFeature('products', productsReducer),
        StoreModule.forFeature('offers', offersReducer),

    ],
    declarations: [
        CompaniaPage,
        PedidosFiltroComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [
        GeneralCarritoComprasComponent,
        PedidosFiltroComponent
    ]
})
export class CompaniasPageModule {
}
