import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {AsignarSaldoPage} from './asignar-saldo.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {StoreModule} from '@ngrx/store';
import {assignReducer} from '../../../compartido/store/assign/assign.reducer';
import {EffectsModule} from '@ngrx/effects';
import {AssignEffect} from '../../../compartido/store/assign/assign.effect';

const routes: Routes = [
    {
        path: '',
        component: AsignarSaldoPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        StoreModule.forFeature('assign', assignReducer),
        EffectsModule.forFeature([AssignEffect])
    ],
    declarations: [AsignarSaldoPage]
})
export class AsignarSaldoPageModule {
}
