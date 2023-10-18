import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SegurosMasInfoModalComponent } from './components/seguros-mas-info-modal/seguros-mas-info-modal.component';
import { SegurosRegistroModalComponent } from './components/seguros-registro-modal/seguros-registro-modal.component';
import { TarjetaSeguroComponent } from './components/tarjeta-seguro/tarjeta-seguro.component';
import { SegurosCabeceraComponent } from './components/seguros-cabecera/seguros-cabecera.component';

@NgModule({
    declarations: [
        SegurosMasInfoModalComponent,
        SegurosRegistroModalComponent,
        TarjetaSeguroComponent,
        SegurosCabeceraComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        SegurosMasInfoModalComponent,
        SegurosRegistroModalComponent,
        TarjetaSeguroComponent,
        SegurosCabeceraComponent
    ],
    entryComponents: [
        SegurosMasInfoModalComponent,
        SegurosRegistroModalComponent,
        TarjetaSeguroComponent,
        SegurosCabeceraComponent
    ]
})
export class CompartidoSegurosModule { }

