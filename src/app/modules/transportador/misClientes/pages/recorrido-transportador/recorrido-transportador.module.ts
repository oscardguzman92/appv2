import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CompartidoGeneralModule } from 'src/app/modules/compartido/compartido-general.module';
import { CompartidoModule } from '../../../compartido/compartido.module';
import { IonicModule } from '@ionic/angular';

import { RecorridoTransportadorPage } from './recorrido-transportador.page';

const routes: Routes = [
  {
    path: '',
    component: RecorridoTransportadorPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompartidoModule,
    CompartidoGeneralModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RecorridoTransportadorPage]
})
export class RecorridoTransportadorPageModule {}
