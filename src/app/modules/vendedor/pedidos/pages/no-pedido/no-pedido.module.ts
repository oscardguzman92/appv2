import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CompartidoModule } from '../../../compartido/compartido.module';
import { StoreModule } from '@ngrx/store';
import { NoPedidoPage } from './no-pedido.page';
import { EffectsModule } from '@ngrx/effects';
import { MotivosEffect } from '../../store/motivos/motivos.effect';

const routes: Routes = [
  {
    path: '',
    component: NoPedidoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompartidoModule,
    StoreModule,
    EffectsModule.forFeature([MotivosEffect]),
    RouterModule.forChild(routes)
  ],
  declarations: [NoPedidoPage]
})
export class NoPedidoPageModule  {}
