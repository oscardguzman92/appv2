import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {ProductosDestacadosPage} from './productos-destacados.page';
import {GeneralCarritoComprasComponent} from '../../components/general-carrito-compras/general-carrito-compras.component';
import {CompartidoGeneralModule} from '../../../compartido-general.module';
import {VirtualScrollerModule} from 'ngx-virtual-scroller';
const routes: Routes = [
    {
        path: '',
        component: ProductosDestacadosPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        VirtualScrollerModule,
        CompartidoGeneralModule
    ],
    declarations: [ProductosDestacadosPage],
    entryComponents: [GeneralCarritoComprasComponent]
})
export class ProductosDestacadosPageModule {
}
