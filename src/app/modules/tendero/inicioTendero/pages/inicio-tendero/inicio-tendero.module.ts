import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {InicioTenderoPage} from './inicio-tendero.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import {CompartidoSeleccionTiendaComponent} from '../../../compartido/components/compartido-seleccion-tienda/compartido-seleccion-tienda.component';
import {StoreModule} from '@ngrx/store';
import {orderReducer} from '../../../../compartido/pedidos/store/orders.reducer';
import {RegistroCapturaUbicacionComponent} from '../../../registro/pages/registro/components/registro-captura-ubicacion/registro-captura-ubicacion.component';
import {EffectsModule} from '@ngrx/effects';
import {PuntosEffect} from '../../../puntos/pages/puntos/store/puntos.effect';
import {CurrentAccountEffect} from '../../../recargas/store/currentAccount/currentAccount.effect';
import {currentAccountReducer} from '../../../recargas/store/currentAccount/currentAccount.reducer';
import {MessagesEffect} from '../../../../compartido/misMensajes/store/messages.effect';
import {OffersEffects} from '../../../../compartido/general/store/effects/offers.effects';
import {CompaniesEffect} from '../../../pedidos/pages/pedidos/store/companies.effect';
import {GeneralCarritoComprasComponent} from '../../../../compartido/general/components/general-carrito-compras/general-carrito-compras.component';

import {GeneralPedidosFavoritosComponent} from 'src/app/modules/compartido/general/components/general-pedidos-favoritos/general-pedidos-favoritos.component';
import { myOrdersReducer } from '../../../misPedidos/store/myOrders/myOrders.reducer';


const routes: Routes = [
    {
        path: '',
        component: InicioTenderoPage
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
        StoreModule.forFeature('order', orderReducer),
        StoreModule.forFeature('currentAccount', currentAccountReducer),
        StoreModule.forFeature('myOrders', myOrdersReducer),
        EffectsModule.forFeature([PuntosEffect, CurrentAccountEffect, CompaniesEffect])
    ],
    declarations: [InicioTenderoPage],
    entryComponents: [CompartidoSeleccionTiendaComponent, GeneralPedidosFavoritosComponent, RegistroCapturaUbicacionComponent, GeneralCarritoComprasComponent]
})
export class InicioTenderoPageModule {
}
