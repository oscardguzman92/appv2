import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {PuntosPage} from './puntos.page';
import {PuntosProductosARedimirComponent} from './components/puntos-productos-aredimir/puntos-productos-aredimir.component';
import {PuntosProductosConMasPuntosComponent} from './components/puntos-productos-con-mas-puntos/puntos-productos-con-mas-puntos.component';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {StoreModule} from '@ngrx/store';
import {puntosReducer} from './store/puntos.reducer';
import {EffectsModule} from '@ngrx/effects';
import {PuntosEffect} from './store/puntos.effect';

const routes: Routes = [
    {
        path: '',
        component: PuntosPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        StoreModule.forFeature('points', puntosReducer),
        EffectsModule.forFeature([PuntosEffect])
    ],
    declarations: [
        PuntosPage,
        PuntosProductosARedimirComponent,
        PuntosProductosConMasPuntosComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PuntosPageModule {
}
