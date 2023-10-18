import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {ListaClientesPage} from './lista-clientes.page';
import {MisClientesBuscadorComponent} from './componentes/mis-clientes-buscador/mis-clientes-buscador.component';
import {MisClientesCabeceraComponent} from './componentes/mis-clientes-cabecera/mis-clientes-cabecera.component';
import {MisClientesClientesComponent} from './componentes/mis-clientes-clientes/mis-clientes-clientes.component';
import { MisClientesFiltroComponent } from './componentes/mis-clientes-filtro/mis-clientes-filtro.component';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import { ShopsEffect } from '../../store/mis-clientes.effect';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { shopsReducer } from '../../store/mis-clientes.reducer';
import {MessagesEffect} from '../../../../compartido/misMensajes/store/messages.effect';
import {VirtualScrollerModule} from 'ngx-virtual-scroller';
const routes: Routes = [
    {
        path: '',
        component: ListaClientesPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CompartidoModule,
        RouterModule.forChild(routes),
        CompartidoGeneralModule,
        //EffectsModule.forRoot( [ ] ),
        StoreModule.forFeature('mis-clientes', shopsReducer),
        VirtualScrollerModule,
    ],
    declarations: [
        ListaClientesPage,
        //MisClientesBuscadorComponent,
        MisClientesCabeceraComponent,
        MisClientesClientesComponent,
        //MisClientesFiltroComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [MisClientesFiltroComponent]
})
export class ListaClientesPageModule {
}
