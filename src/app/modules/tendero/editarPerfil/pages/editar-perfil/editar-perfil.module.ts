import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {EditarPerfilPage} from './editar-perfil.page';
import {CompartidoModule} from '../../../compartido/compartido.module';
import {EffectsModule} from '@ngrx/effects';
import {EditEffect} from '../../store/edit.effect';
import {StoreModule} from '@ngrx/store';
import {editReducer} from '../../store/edit.reducer';

const routes: Routes = [
    {
        path: '',
        component: EditarPerfilPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoModule,
        EffectsModule.forFeature([EditEffect]),
        StoreModule.forFeature('edit', editReducer),
        ReactiveFormsModule
    ],
    declarations: [EditarPerfilPage]
})
export class EditarPerfilPageModule {
}
