import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {RealizarRecargaPage} from './realizar-recarga.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {RecargasCrearRecargaComponent} from './components/recargas-crear-recarga/recargas-crear-recarga.component';
import {RecargasModule} from '../../recargas.module';
import {StoreModule} from '@ngrx/store';
import {currentAccountReducer} from '../../store/currentAccount/currentAccount.reducer';
import {EffectsModule} from '@ngrx/effects';
import {TopUpsEffect} from '../../store/topUps/topUps.effect';
import {CurrentAccountEffect} from '../../store/currentAccount/currentAccount.effect';
import {topUpsReducer} from '../../store/topUps/topUps.reducer';

const routes: Routes = [
    {
        path: '',
        component: RealizarRecargaPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        RecargasModule,
        ReactiveFormsModule,
        StoreModule.forFeature('currentAccount', currentAccountReducer),
        StoreModule.forFeature('topUps', topUpsReducer),
        EffectsModule.forFeature([TopUpsEffect, CurrentAccountEffect])
    ],
    declarations: [
        RealizarRecargaPage,
        RecargasCrearRecargaComponent
    ],
    entryComponents: []
})
export class RealizarRecargaPageModule {
}
