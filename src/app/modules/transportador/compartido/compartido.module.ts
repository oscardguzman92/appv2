import { ModalNovedadesComponent } from './components/modal-novedades/modal-novedades.component';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {CabeceraComponent} from './components/cabecera/cabecera.component';
import {MapaTransportadorComponent} from './components/mapa-transportador/mapa-transportador.component';
import {ListaTiendasComponent} from './components/lista-tiendas/lista-tiendas.component';
import {FormsModule} from '@angular/forms';
import {CompartidoMenuTransportadorComponent} from './components/compartido-menu-transportador/compartido-menu-transportador.component';
import {ModalContactoComponent} from './components/modal-contacto/modal-contacto.component';

@NgModule({
    declarations: [
        CabeceraComponent,
        ModalNovedadesComponent,
        MapaTransportadorComponent,
        ListaTiendasComponent,
        CompartidoMenuTransportadorComponent,
        ModalContactoComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        CabeceraComponent,
        ModalNovedadesComponent,
        MapaTransportadorComponent,
        ListaTiendasComponent,
        CompartidoMenuTransportadorComponent,
        ModalContactoComponent
    ],
    entryComponents: [
        ModalNovedadesComponent,
        ModalContactoComponent
    ]
})
export class CompartidoModule {
}
