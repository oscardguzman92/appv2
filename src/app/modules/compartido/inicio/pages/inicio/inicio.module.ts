import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {InicioPage} from './inicio.page';
import {CompartidoModule} from '../../../../tendero/compartido/compartido.module';
import {CompartidoGeneralModule} from '../../../../compartido/compartido-general.module';
import {InicioValidacionCedulaComponent} from './components/inicio-validacion-cedula/inicio-validacion-cedula.component';

const routes: Routes = [
    {
        path: '',
        component: InicioPage
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
        ReactiveFormsModule
    ],
    declarations: [
        InicioPage,
        InicioValidacionCedulaComponent
    ],
    entryComponents: [
        InicioValidacionCedulaComponent
    ]
})
export class InicioPageModule {
}
