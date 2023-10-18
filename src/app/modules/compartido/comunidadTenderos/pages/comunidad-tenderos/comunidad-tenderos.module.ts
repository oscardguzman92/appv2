import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {ComunidadTenderosPage} from './comunidad-tenderos.page';
import {ComunidadTenderosCrearPostComponent} from './components/comunidad-tenderos-crear-post/comunidad-tenderos-crear-post.component';
import {ComunidadTenderosPostEncuestaComponent} from './components/comunidad-tenderos-post-encuesta/comunidad-tenderos-post-encuesta.component';
import {ComunidadTenderosPostNormalComponent} from './components/comunidad-tenderos-post-normal/comunidad-tenderos-post-normal.component';
import {ComunidadTenderosPostOfertaComponent} from './components/comunidad-tenderos-post-oferta/comunidad-tenderos-post-oferta.component';
import { CompartidoModule } from '../../../../tendero/compartido/compartido.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ShopkeepersCommunityEffect } from '../store/comunidad-tenderos.effect';
import { shopkeepersCommunityReducer } from '../store/comunidad-tenderos.reducer';
import { CompartidoGeneralModule } from '../../../compartido-general.module';
const routes: Routes = [
    {
        path: '',
        component: ComunidadTenderosPage
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
        StoreModule.forFeature('comunidad-tenderos', shopkeepersCommunityReducer),
        ReactiveFormsModule,
    ],
    declarations: [
        ComunidadTenderosPage,
        ComunidadTenderosCrearPostComponent,
        //ComunidadTenderosPostEncuestaComponent,
        ComunidadTenderosPostNormalComponent,
        ComunidadTenderosPostOfertaComponent
    ],
    entryComponents: [
        ComunidadTenderosCrearPostComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComunidadTenderosPageModule {
}
