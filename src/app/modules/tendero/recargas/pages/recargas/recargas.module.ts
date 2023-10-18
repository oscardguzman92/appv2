import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {RecargasPage} from './recargas.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {RecargasOperadoresComponent} from './components/recargas-operadores/recargas-operadores.component';
import {RecargasPaquetesComponent} from './components/recargas-paquetes/recargas-paquetes.component';
import {RecargasModule} from '../../recargas.module';
import {StoreModule} from '@ngrx/store';
import {topUpsReducer} from '../../store/topUps/topUps.reducer';
import {EffectsModule} from '@ngrx/effects';
import {TopUpsEffect} from '../../store/topUps/topUps.effect';
import {currentAccountReducer} from '../../store/currentAccount/currentAccount.reducer';
import {CurrentAccountEffect} from '../../store/currentAccount/currentAccount.effect';
import {RecargasValidarContrasenaComponent} from './components/recargas-validar-contrasena/recargas-validar-contrasena.component';
import {RecargasCrearContrasenaComponent} from './components/recargas-crear-contrasena/recargas-crear-contrasena.component';
import {RecargasBuscadorComponent} from './components/recargas-buscador/recargas-buscador.component';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';

const routes: Routes = [
    {
        path: '',
        component: RecargasPage
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
        RecargasModule,
        StoreModule.forFeature('topUps', topUpsReducer),
        StoreModule.forFeature('currentAccount', currentAccountReducer),
        EffectsModule.forFeature([TopUpsEffect, CurrentAccountEffect]),
        ReactiveFormsModule
    ],
    declarations: [
        RecargasPage,
        RecargasPaquetesComponent,
        RecargasOperadoresComponent,
        RecargasValidarContrasenaComponent,
        RecargasCrearContrasenaComponent,
        RecargasBuscadorComponent
    ],
    entryComponents: [
        RecargasValidarContrasenaComponent,
        RecargasCrearContrasenaComponent
    ]
})
export class RecargasPageModule {
}
