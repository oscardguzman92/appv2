import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {MisMensajesPage} from './mis-mensajes.page';
import {MisMensajesBuscadorComponent} from './components/mis-mensajes-buscador/mis-mensajes-buscador.component';
import {MisMensajesMensajeComponent} from './components/mis-mensajes-mensaje/mis-mensajes-mensaje.component';
import {CompartidoModule} from '../../../../tendero/compartido/compartido.module';
import {CompartidoGeneralModule} from '../../../compartido-general.module';
import {StoreModule} from '@ngrx/store';
import {messagesReducer} from '../../store/messages.reducer';
import {EffectsModule} from '@ngrx/effects';
import {MessagesEffect} from '../../store/messages.effect';
import {GeneralCarritoComprasComponent} from '../../../general/components/general-carrito-compras/general-carrito-compras.component';
import {ImgLoadingLocalOrServerDirective} from '../../../../../directives/imgLoadingLocalOrServer/img-loading-local-or-server.directive';

const routes: Routes = [
    {
        path: '',
        component: MisMensajesPage
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
        StoreModule.forFeature('messages', messagesReducer),
        //EffectsModule.forFeature([MessagesEffect])
    ],
    declarations: [
        MisMensajesPage,
        MisMensajesBuscadorComponent,
        MisMensajesMensajeComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [MisMensajesMensajeComponent, GeneralCarritoComprasComponent]
})
export class MisMensajesPageModule {
}
