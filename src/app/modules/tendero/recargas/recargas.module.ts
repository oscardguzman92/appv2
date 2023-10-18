import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RecargasSolicitarSaldosComponent} from './pages/components/recargas-solicitar-saldos/recargas-solicitar-saldos.component';
import {IonicModule} from '@ionic/angular';
import {TopUpsService} from '../../../services/topUps/top-ups.service';

@NgModule({
    declarations: [
        RecargasSolicitarSaldosComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
    ],
    exports: [
        RecargasSolicitarSaldosComponent
    ],
    providers: [TopUpsService]
})
export class RecargasModule {
}
