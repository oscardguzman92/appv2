import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompartidoMenuSuperVendedorComponent } from './components/compartido-menu-super-vendedor/compartido-menu-super-vendedor.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    CompartidoMenuSuperVendedorComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    CompartidoMenuSuperVendedorComponent
  ],
  entryComponents: [
  ]

})
export class CompartidoModule { }
