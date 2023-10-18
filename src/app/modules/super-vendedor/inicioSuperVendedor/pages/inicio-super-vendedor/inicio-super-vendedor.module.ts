import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InicioSuperVendedorPage } from './inicio-super-vendedor.page';
import { CompartidoModule } from 'src/app/modules/tendero/compartido/compartido.module';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { superSellerReducer } from '../../store/superSeller.reducer';
import { SuperSellerEffect } from '../../store/superSeller.effect';

const routes: Routes = [
  {
    path: '',
    component: InicioSuperVendedorPage
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
    StoreModule.forFeature('superSeller', superSellerReducer),
    EffectsModule.forFeature([SuperSellerEffect])
  ],
  declarations: [InicioSuperVendedorPage]
})
export class InicioSuperVendedorPageModule {}
