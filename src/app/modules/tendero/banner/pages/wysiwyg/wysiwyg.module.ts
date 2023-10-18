import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {CompartidoModule} from '../../../compartido/compartido.module';

import { IonicModule } from '@ionic/angular';

import { WysiwygPage } from './wysiwyg.page';

const routes: Routes = [
  {
    path: '',
    component: WysiwygPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompartidoModule,
    RouterModule.forChild(routes)
  ],
  declarations: [WysiwygPage]
})
export class WysiwygPageModule {}
