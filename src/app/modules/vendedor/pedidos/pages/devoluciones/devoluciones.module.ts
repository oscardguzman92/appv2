import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {DevolucionesPage} from './devoluciones.page';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import {ProductComponent} from './components/product/product.component';
import {DiscartDeactivateGuard} from '../../../../../guards/discartDeactivate.guard';
import {ConfirmationComponent} from './components/confirmation/confirmation.component';

const routes: Routes = [
    {
        path: '',
        component: DevolucionesPage,
        canDeactivate: [DiscartDeactivateGuard],
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CompartidoGeneralModule
    ],
    declarations: [DevolucionesPage, ProductComponent, ConfirmationComponent],
    providers: [DiscartDeactivateGuard],
    entryComponents: [ConfirmationComponent]
})
export class DevolucionesPageModule {
}
