import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {CompartidoMenuMercaderistaComponent} from './components/compartido-menu-mercaderista/compartido-menu-mercaderista.component';
import {CabeceraComponent} from './components/cabecera/cabecera.component';
import {EffectsModule} from '@ngrx/effects';
import {MerchanShopEffect} from '../clientes/store/merchantShop.effect';
import {StoreModule} from '@ngrx/store';
import {merchanShopReducer} from '../clientes/store/merchantShop.reducer';

@NgModule({
    declarations: [
        CompartidoMenuMercaderistaComponent,
        CabeceraComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        EffectsModule.forFeature([MerchanShopEffect]),
        StoreModule.forFeature('merchanShop', merchanShopReducer)
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        CompartidoMenuMercaderistaComponent,
        CabeceraComponent
    ],
    entryComponents: []
})
export class CompartidoModule {
}
